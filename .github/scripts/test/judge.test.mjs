/**
 * 「この修正を自動で取り込んでよいか」の判定。
 *
 * 人が必ず目で見る前提なら、見た目の変化は報告するだけでよかった。
 * 自動で取り込むなら、人が見ていた分の判断を機械が持つ必要がある。
 * ここはその判断を決める場所なので、通してはいけない場合を先に書く。
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { COST_ATTENTION_USD, judge } from "../lib/report.mjs";

/**
 * 機械のチェックは「通った」を既定にする。
 * ここを渡さないと判定は通らない（渡し忘れを合格と読まないため）。
 * その振る舞い自体は専用のテストで確かめる。
 */
const OK_CHECKS = { build: "ok", lint: "ok" };
const judgeWith = (results, targetPath, checks = OK_CHECKS) =>
  judge(results, targetPath, checks);

/** 検査できたページ1件分。changedPixels を主役にする（割合は丸めで消えるため） */
const seen = (
  path,
  label,
  changedPixels,
  {
    consoleErrors = [],
    width = 1280,
    heightChanged = false,
    afterHeight = 800,
    widthChanged = false,
    afterWidth = width,
  } = {},
) => ({
  target: { path, label, width, height: 800 },
  // compare() が返す形と同じキーをすべて持たせる。
  // 一部を省くと、compare() 側でキー名を変えてもテストが緑のままになる。
  diff: {
    changedPixels,
    percent: (changedPixels / (width * 800)) * 100,
    heightChanged,
    beforeHeight: 800,
    afterHeight,
    widthChanged,
    beforeWidth: width,
    afterWidth,
  },
  consoleErrors,
});

/** 検査できなかったページ1件分 */
const unseen = (path, label, error) => ({
  target: { path, label, width: 1280, height: 800 },
  error,
});

test("依頼した場所が変わり、他が無傷なら、取り込んでよい", () => {
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 40), seen("/", "トップ", 0), seen("/works", "実績一覧", 0)],
    "/about",
  );
  assert.equal(verdict.ok, true);
  assert.deepEqual(verdict.reasons, []);
});

test("依頼した場所が1画素も変わっていなければ、取り込まない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 0), seen("/", "トップ", 0)], "/about");
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /依頼した場所が変化していません/);
});

test("ごく小さな変化でも、変わっていれば取り込んでよい（割合では 0.00% に丸められる大きさ）", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about");
  assert.equal(verdict.diagnostics.targetChangedPixels, 40);
  assert.equal(verdict.ok, true);
});

test("依頼していない場所が、ノイズと呼べない量だけ変わっていれば、取り込まない", () => {
  // 1280x800 = 1,024,000 画素。600px は割合にすると約 0.059% で、
  // 許容量（0.05%）を超える大きさにしてある。
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 500), seen("/", "トップ", 600)],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /依頼していない場所が 1 か所/);
});

test("依頼していない場所のごくわずかな画素差では、取り込みを止めない", () => {
  // 比較元と比較先は別々の Vercel デプロイであり、コードを触っていなくても
  // フォントの描画やアニメーションの途中フレームでわずかな画素差が出ることがある。
  // そのたびに止まると、正しい修正まで人の手が要るようになる。
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 500), seen("/", "トップ", 10)],
    "/about",
  );
  assert.equal(verdict.ok, true);
});

test("確認できなかった場所があれば、取り込まない", () => {
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 500), unseen("/", "トップ", "時間切れ")],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /確認できませんでした/);
});

test("依頼がどのページを指すか分からなければ、取り込まない", () => {
  const verdict = judgeWith([seen("/", "トップ", 0), seen("/works", "実績一覧", 0)], undefined);
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /どのページ/);
});

test("依頼のページが検査の対象に入っていなければ、取り込まない", () => {
  const verdict = judgeWith([seen("/", "トップ", 0)], "/works/abc123");
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /検査の対象に入っていない/);
});

test("画面のエラーがあれば、取り込まない", () => {
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 500, { consoleErrors: ["TypeError: x is not a function"] })],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /画面のエラー/);
});

test("止める理由が複数あれば、すべて挙げる", () => {
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 0), seen("/", "トップ", 900), unseen("/works", "実績一覧", "時間切れ")],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.equal(verdict.reasons.length, 3);
});

test("1か所も検査できていなければ、取り込まない", () => {
  const verdict = judgeWith([unseen("/", "トップ", "401")], "/");
  assert.equal(verdict.ok, false);
});

// ▼ ここから下は、判定の抜け道をふさぐための取り決め

test("依頼していない場所の高さが許容量を超えて変わっていれば、画素が同じでも取り込まない", () => {
  // 重なる範囲だけで比べるため、下に節を足された場合は画素の差が 0 になる。
  // 高さの変化を見ないと「1画素も動いていない」と誤って報告する。
  const verdict = judgeWith(
    [
      seen("/about", "私たちについて", 500),
      seen("/works", "実績一覧", 0, { heightChanged: true, afterHeight: 3600 }),
    ],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /高さ/);
});

test("依頼していない場所の高さが許容量以内でしかずれていなければ、取り込みを止めない", () => {
  // 画素の差にはノイズ許容量があるのに寸法の差に無いと、フォントの読み込み
  // 順によるレイアウトの1〜2画素のずれでも止まり続け、正しい修正が通らない。
  const verdict = judgeWith(
    [
      seen("/about", "私たちについて", 500),
      seen("/works", "実績一覧", 0, { heightChanged: true, afterHeight: 801 }),
    ],
    "/about",
  );
  assert.equal(verdict.ok, true);
});

test("ビルドが通っていなければ、取り込まない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 500)], "/about", {
    build: "failed",
    lint: "ok",
  });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /ビルド/);
});

test("文法チェックが通っていなければ、取り込まない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 500)], "/about", {
    build: "ok",
    lint: "failed",
  });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /文法/);
});

test("機械のチェック結果が分からなければ、取り込まない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 500)], "/about", {
    build: "unknown",
    lint: "ok",
  });
  assert.equal(verdict.ok, false);
});

test("機械のチェックが両方とも通っていれば、それを理由に止めない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 500)], "/about", {
    build: "ok",
    lint: "ok",
  });
  assert.equal(verdict.ok, true);
});

test("依頼した場所が画面いっぱいに変わっても、それだけでは止めない", () => {
  // 見出しが2行に折り返るだけで、それより下の画素がすべてずれ、
  // 割合はほぼ100%になる。依頼した場所は変わってよい場所なので、
  // 割合の大小だけでは「手を広げすぎ」と「妥当な折り返し」を区別できない。
  const verdict = judgeWith([seen("/about", "私たちについて", 1280 * 800)], "/about");
  assert.equal(verdict.ok, true);
});

test("同じページの画面幅ちがいは、どちらか変わっていれば「変化した」とみなす", () => {
  // TARGETS にはトップがパソコンとスマートフォンの2行ある。
  // スマートフォンだけに効く修正で「変化していません」と止めてはいけない。
  const verdict = judgeWith(
    [
      seen("/", "トップ（パソコン）", 0),
      seen("/", "トップ（スマートフォン）", 900, { width: 390 }),
      seen("/works", "実績一覧", 0),
    ],
    "/",
  );
  assert.equal(verdict.ok, true);
});

test("同じページの画面幅ちがいが両方とも無変化なら、取り込まない", () => {
  const verdict = judgeWith(
    [seen("/", "トップ（パソコン）", 0), seen("/", "トップ（スマートフォン）", 0, { width: 390 })],
    "/",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /依頼した場所が変化していません/);
});

test("測れなかった場合の画素数は、0 ではなく「測っていない」と分かる形で残す", () => {
  const verdict = judgeWith([unseen("/about", "私たちについて", "時間切れ")], "/about");
  assert.equal(verdict.diagnostics.targetChangedPixels, null);
  assert.equal(JSON.parse(JSON.stringify(verdict)).diagnostics.targetChangedPixels, null);
});

test("依頼した場所の丈が大きく伸びても、それだけでは止めない", () => {
  // 「間隔を詰めてほしい」「見出しを大きくしてほしい」のような依頼でも
  // 丈は普通に伸び縮みする。伸び幅の大小だけでは依頼から外れたとは言えない。
  // ただし「変化した」という事実（movedAtAll）は成立している必要がある。
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 0, { heightChanged: true, afterHeight: 12000 })],
    "/about",
  );
  assert.equal(verdict.ok, true);
});

test("依頼していない場所の横幅が変わっていれば、取り込まない", () => {
  const verdict = judgeWith(
    [
      seen("/about", "私たちについて", 500),
      seen("/works", "実績一覧", 0, { widthChanged: true, afterWidth: 1900 }),
    ],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /依頼していない場所が 1 か所/);
  // 何が変わったのかを書く。画素が同じだからと「高さ 800→800px」と書いてはいけない
  assert.match(verdict.reasons.join("\n"), /横幅 1280→1900px/);
});

test("ノイズ程度の画素差と寸法の変化が同時に起きても、理由に寸法の情報が残る", () => {
  // 動いたと判定された理由が画素の割合（ノイズ許容量超え）でも、
  // 寸法も変わっているなら、それも読み手に伝わらなければならない。
  const verdict = judgeWith(
    [
      seen("/about", "私たちについて", 500),
      seen("/works", "実績一覧", 600, { widthChanged: true, afterWidth: 1900 }),
    ],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /横幅 1280→1900px/);
});

test("依頼した場所の横幅が大きく広がっても、それだけでは止めない", () => {
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 100, { widthChanged: true, afterWidth: 2400 })],
    "/about",
  );
  assert.equal(verdict.ok, true);
});

test("機械のチェックを渡し忘れたら、通さない", () => {
  // 渡し忘れを「合格」と読むと、呼び出し方を一つ間違えただけで柱が1本抜ける
  const verdict = judge([seen("/about", "私たちについて", 500)], "/about");
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /渡されていません/);
});

test("比較元にも出ているエラーは、止める理由にしない", () => {
  // 外部の計測タグなどは元から出ている。この修正が持ち込んだものだけを見る。
  const row = seen("/about", "私たちについて", 500, {
    consoleErrors: ["gtag is not defined"],
  });
  row.baselineConsoleErrors = ["gtag is not defined"];
  const verdict = judgeWith([row], "/about");
  assert.equal(verdict.ok, true);
});

test("比較元に無いエラーが増えていれば、取り込まない", () => {
  const row = seen("/about", "私たちについて", 500, {
    consoleErrors: ["gtag is not defined", "TypeError: x is not a function"],
  });
  row.baselineConsoleErrors = ["gtag is not defined"];
  const verdict = judgeWith([row], "/about");
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /新しく出た画面のエラーが 1 件/);
});

test("依頼のページが分からないとき、全ページを『依頼していない場所』として挙げない", () => {
  // どれが依頼した場所か決められない以上、変わったページを名指しで疑うのは誤り。
  const verdict = judgeWith([seen("/", "トップ", 900), seen("/works", "実績一覧", 0)], undefined);
  assert.equal(verdict.ok, false);
  assert.doesNotMatch(verdict.reasons.join("\n"), /依頼していない場所が/);
});

test("依頼のページが検査対象に無い場合と、測れなかった場合を、別の理由として書き分ける", () => {
  const notCovered = judgeWith([seen("/", "トップ", 0)], "/works/abc123");
  const failed = judgeWith([unseen("/works", "実績一覧", "時間切れ")], "/works");
  assert.match(notCovered.reasons.join("\n"), /検査の対象に入っていない/);
  assert.doesNotMatch(failed.reasons.join("\n"), /検査の対象に入っていない/);
  assert.match(failed.reasons.join("\n"), /確認できませんでした/);
});

/**
 * ここから下は S6（実戦10件・2026-09-09）の実測から足した判定。
 *
 * 見た目の比較は「見た目が正しいか」しか見ない。実際に、見た目は依頼どおりなのに
 * 共通の部品を使うのをやめて中身を写し取った修正が、この判定を通り抜けた。
 * 写真の比べ合いでは原理的に捕まえられないので、別の手がかりで拾う。
 */

test("AI の作業量が普段より大きければ、取り込まずに人へ回す", () => {
  // S6 実測: 素直に直った7件は $0.109〜0.136、作りを壊した2件は $0.18 と $0.21。
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    costUsd: 0.21,
  });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /作業量/);
});

test("AI の作業量が普段どおりなら、判定を妨げない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    costUsd: 0.12,
  });
  assert.equal(verdict.ok, true);
});

test("作業量が渡されなかったことと、費用がゼロだったことを区別する", () => {
  // 「渡し忘れ」を「普段どおりだった」と読むと、判定の柱が黙って1本抜ける。
  const notPassed = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about");
  assert.equal(notPassed.diagnostics.costUsd, null);

  const zero = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    costUsd: 0,
  });
  assert.equal(zero.diagnostics.costUsd, 0);
});

test("消えた読み込みを調べなかったことと、0件だったことを区別する", () => {
  const notPassed = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about");
  assert.equal(notPassed.diagnostics.removedImports, null);

  const none = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    removedImports: [],
  });
  assert.deepEqual(none.diagnostics.removedImports, []);
});

test("共通の部品を切り離した疑い（import の削除）があれば、取り込まずに人へ回す", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    removedImports: ["@/components/ui/section-title"],
  });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /部品/);
  assert.match(verdict.reasons.join("\n"), /section-title/);
});

test("import の削除が無ければ、判定を妨げない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    removedImports: [],
  });
  assert.equal(verdict.ok, true);
});

test("作業量が数字にならなかったときは、安かったことにしない", () => {
  // Number("") は 0、Number("abc") は NaN。どちらも「安く済んだ」と読ませない。
  // NaN > 閾値 は常に偽なので、素通しの経路になりやすい。
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    costUsd: Number.NaN,
  });
  assert.equal(verdict.diagnostics.costUsd, null, "確かめていない扱いにする");
});

test("作業量が閾値ちょうどなら止めない（境界）", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    costUsd: COST_ATTENTION_USD,
  });
  assert.equal(verdict.ok, true);
});

test("作業量が閾値をわずかでも超えたら止める（境界）", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    costUsd: COST_ATTENTION_USD + 0.001,
  });
  assert.equal(verdict.ok, false);
});

/**
 * 作業用に置いたファイルの消し忘れ。
 *
 * AI に渡すために、こちらで一時的に置くファイルがある（差し替える画像、
 * このサイトの構造をまとめた資料）。AI には「使い終わったら消せ」と伝えるが、
 * 消し忘れるとサイトに紛れ込む。
 *
 * 見た目には出ないため、写真の比べ合いでは捕まらない。
 */
test("作業用に置いたファイルが残っていれば、取り込まない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    leftoverFiles: ["fixlane-structure.md"],
  });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /作業用/);
  assert.match(verdict.reasons.join("\n"), /fixlane-structure\.md/);
});

test("作業用のファイルが残っていなければ、判定を妨げない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 40), seen("/", "トップ", 0)], "/about", {
    ...OK_CHECKS,
    leftoverFiles: [],
  });
  assert.equal(verdict.ok, true);
});
