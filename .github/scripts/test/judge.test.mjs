/**
 * 「この修正を自動で取り込んでよいか」の判定。
 *
 * 人が必ず目で見る前提なら、見た目の変化は報告するだけでよかった。
 * 自動で取り込むなら、人が見ていた分の判断を機械が持つ必要がある。
 * ここはその判断を決める場所なので、通してはいけない場合を先に書く。
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { judge } from "../lib/report.mjs";

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

test("依頼していない場所が1画素でも変わっていれば、取り込まない", () => {
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 500), seen("/", "トップ", 3)],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /依頼していない場所が 1 か所/);
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

test("依頼していない場所の高さが変わっていれば、画素が同じでも取り込まない", () => {
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

test("依頼した場所が丸ごと書き換わっていれば、取り込まない", () => {
  const verdict = judgeWith([seen("/about", "私たちについて", 1280 * 800)], "/about");
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /変化が大きすぎます/);
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

test("依頼した場所の丈が大きく伸びていれば、画素が同じでも取り込まない", () => {
  // 節を丸ごと足された場合、重なる範囲は同じままなので画素の差は 0 になる。
  // 割合だけを見ていると「限度を超えた変化」を素通しする。
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 0, { heightChanged: true, afterHeight: 12000 })],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /変化が大きすぎます/);
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

test("依頼した場所の横幅が大きく広がっていれば、取り込まない", () => {
  const verdict = judgeWith(
    [seen("/about", "私たちについて", 100, { widthChanged: true, afterWidth: 2400 })],
    "/about",
  );
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons.join("\n"), /変化が大きすぎます/);
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
