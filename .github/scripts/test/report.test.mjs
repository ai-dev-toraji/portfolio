import { test } from "node:test";
import assert from "node:assert/strict";

import { buildSummary } from "../lib/report.mjs";

const PREVIEW = "https://example.vercel.app";

/**
 * 検査できたページ1件分。
 * changedPixels は既定では割合から逆算する。割合では 0.00% に丸められてしまう
 * ごく小さな変化を作りたい場合のために、直接指定もできるようにしている。
 */
const ok = (path, label, percent, { consoleErrors = [], changedPixels } = {}) => ({
  target: { path, label, width: 1280, height: 800 },
  // compare() が返す形と同じキーをすべて持たせる。
  // 一部を省くと、compare() 側でキー名を変えてもテストが緑のままになる。
  diff: {
    percent,
    heightChanged: false,
    beforeHeight: 800,
    afterHeight: 800,
    widthChanged: false,
    beforeWidth: 1280,
    afterWidth: 1280,
    changedPixels: changedPixels ?? Math.round(percent * 100),
  },
  consoleErrors,
});

/**
 * 機械のチェックは「通った」を既定にする。
 * 渡さないと判定は通らない（渡し忘れを合格と読まないため）。
 */
const OK_CHECKS = { build: "ok", lint: "ok" };
const summaryOf = (results, targetPath, checks = OK_CHECKS) =>
  buildSummary(results, PREVIEW, targetPath, checks);

/** 検査できなかったページ1件分 */
const ng = (path, label, error) => ({
  target: { path, label, width: 1280, height: 800 },
  error,
});

test("表には見た場所すべての行が出る", () => {
  const md = buildSummary(
    [ok("/", "トップ", 0), ok("/works", "実績一覧", 0)],
    PREVIEW,
    "/",
  );
  assert.match(md, /\| トップ \|/);
  assert.match(md, /\| 実績一覧 \|/);
});

test("依頼していない場所が大きく変化したら警告する", () => {
  const md = buildSummary(
    [ok("/", "トップ", 1.2), ok("/works", "実績一覧", 40)],
    PREVIEW,
    "/",
  );
  assert.match(md, /依頼していない場所が 1 か所変化しています/);
});

test("依頼した場所の変化は警告の対象にしない", () => {
  const md = summaryOf([ok("/", "トップ", 40), ok("/works", "実績一覧", 0)], "/");
  assert.doesNotMatch(md, /依頼していない場所が/);
  assert.match(md, /依頼の範囲を超えるとみなせる変化は見つかりませんでした/);
});

test("依頼以外がすべて無変化なら、範囲に収まっていると伝える", () => {
  const md = summaryOf([ok("/", "トップ", 3), ok("/works", "実績一覧", 0)], "/");
  assert.match(md, /1 か所に、依頼の範囲を超えるとみなせる変化は見つかりませんでした/);
});

test("『まったく変化していません』とは断言しない（ノイズ許容量があるため）", () => {
  // SPILL_TOLERANCE_PERCENT の導入後、この語を使うと、表に出ている
  // わずかな画素差と文章が食い違う。数値が根拠にならない断言は書かない。
  const md = summaryOf([ok("/", "トップ", 3), ok("/works", "実績一覧", 0)], "/");
  assert.doesNotMatch(md, /まったく変化していません/);
});

test("どの場所も確認できなかったときに『問題なし』と言ってはいけない", () => {
  const md = buildSummary(
    [
      ng("/", "トップ", "プレビューが 401 を返しました"),
      ng("/works", "実績一覧", "プレビューが 401 を返しました"),
    ],
    PREVIEW,
    "/",
  );
  assert.doesNotMatch(md, /見つかりませんでした/);
  assert.doesNotMatch(md, /収まっていると判断できます/);
  assert.match(md, /どの場所も確認できませんでした/);
  assert.match(md, /人の目/);
});

test("一部が確認できなかったら、その事実をまとめにも書く", () => {
  const md = buildSummary(
    [ok("/", "トップ", 3), ok("/works", "実績一覧", 0), ng("/about", "私たちについて", "時間切れ")],
    PREVIEW,
    "/",
  );
  assert.match(md, /1 か所は確認できませんでした/);
});

test("比較元が取れなかったことが、原因として分かる文言になっている", () => {
  const md = buildSummary(
    [ng("/", "トップ", "比較元（develop）が 404 を返しました。差分は判定できません")],
    PREVIEW,
    "/",
  );
  assert.match(md, /比較元/);
  assert.doesNotMatch(md, /見つかりませんでした/);
});

test("ビルドと文法チェックの結果が、同じコメントの中に出る", () => {
  const md = buildSummary([ok("/", "トップ", 0)], PREVIEW, "/", {
    build: "ok",
    lint: "failed",
  });
  assert.match(md, /### 機械のチェック/);
  assert.match(md, /ビルド（サイトが組み上がるか） \| ✅ 通った/);
  assert.match(md, /文法チェック（書き方の誤り） \| ❌ 通らなかった/);
});

test("機械チェックの結果を渡さなければ、その表は出さない", () => {
  const md = buildSummary([ok("/", "トップ", 0)], PREVIEW, "/");
  assert.doesNotMatch(md, /### 機械のチェック/);
});

test("機械チェックが確認できなかった場合は、通ったとは書かない", () => {
  const md = buildSummary([ok("/", "トップ", 0)], PREVIEW, "/", { build: "unknown" });
  assert.match(md, /⚠️ 確認できず/);
  assert.doesNotMatch(md, /ビルド（サイトが組み上がるか） \| ✅/);
});

test("ごく小さな変化を『0.00%』とだけ書かない（変化なしと区別できること）", () => {
  // 2文字の差し替えは数十画素しか動かず、割合にすると 0.00% に丸められる。
  // 表示がそれだけだと、直った場合と何もしなかった場合が同じ見え方になる。
  const md = buildSummary(
    [ok("/about", "私たちについて", 0.0039, { changedPixels: 40 })],
    PREVIEW,
    "/about",
  );
  // 表のその欄が実際にどう出るかまで見る。数字がどこかにあるだけでは、
  // 表示が元に戻っていても気づけない。
  assert.match(md, /\| 40画素（0\.00%）\s*\|/);
  assert.doesNotMatch(md, /\| 変化なし \|/);
});

test("本当に変化がない場所は『変化なし』と書く", () => {
  const md = buildSummary([ok("/", "トップ", 0)], PREVIEW, "/about");
  assert.match(md, /変化なし/);
});

test("取り込んでよいかどうかが、まとめに書かれる", () => {
  const md = summaryOf(
    [ok("/about", "私たちについて", 1, { changedPixels: 40 }), ok("/", "トップ", 0)],
    "/about",
  );
  assert.match(md, /自動で取り込め(る|ます)/);
});

test("取り込めない場合は、その理由がまとめに書かれる", () => {
  const md = buildSummary(
    [ok("/about", "私たちについて", 0), ok("/", "トップ", 0)],
    PREVIEW,
    "/about",
  );
  assert.match(md, /依頼した場所が変化していません/);
});

test("まとめに出る件数と、判定が挙げる件数を食い違わせない", () => {
  // 別々の基準で数えると、同じコメントの中に「1 か所」と「2 か所」が並ぶ。
  const md = buildSummary(
    [
      ok("/about", "私たちについて", 1, { changedPixels: 5000 }),
      ok("/", "トップ", 6),
      ok("/works", "実績一覧", 2),
    ],
    PREVIEW,
    "/about",
  );
  const counts = [...md.matchAll(/依頼していない場所が (\d+) か所/g)].map((m) => m[1]);
  assert.ok(counts.length >= 2, "まとめと判定の両方に件数が出ること");
  assert.equal(new Set(counts).size, 1, `件数が食い違っている: ${counts.join(" / ")}`);
});

test("取り込めない判定のときも、見た目の節に結論を必ず書く", () => {
  // 依頼した場所が無変化、依頼外がごく小さく変化（どの警告条件にも当たらない）
  const md = buildSummary(
    [ok("/about", "私たちについて", 0), ok("/", "トップ", 0.002, { changedPixels: 20 })],
    PREVIEW,
    "/about",
  );
  const visual = md.split("### 取り込みの可否")[0];
  assert.match(visual, /取り込めません|変化しています/);
});

test("取り込めない判定のときに、安心させる文を並べない", () => {
  const md = buildSummary(
    [ok("/about", "私たちについて", 0), ok("/", "トップ", 0)],
    PREVIEW,
    "/about",
  );
  assert.doesNotMatch(md, /収まっていると判断できます/);
  assert.doesNotMatch(md, /見つかりませんでした/);
});

/**
 * S6（実戦10件）で足した観点。見た目の比較では捕まえられない手がかりを
 * 使う以上、その手がかりを確かめられなかったことも隠さずに書く。
 * 「検査できていないことを問題なしと書かない」という S4 からの規則の延長。
 */
test("取り込めると書くとき、作業量を確かめていないならその旨も書く", () => {
  const md = summaryOf([ok("/about", "私たちについて", 40), ok("/", "トップ", 0)], "/about");
  assert.match(md, /自動で取り込める/);
  assert.match(md, /作業量/);
  assert.match(md, /確かめて|確認して/);
});

test("作業量を確かめたうえで問題なければ、余計な断り書きは出さない", () => {
  const md = summaryOf([ok("/about", "私たちについて", 40), ok("/", "トップ", 0)], "/about", {
    build: "ok",
    lint: "ok",
    costUsd: 0.12,
    removedImports: [],
  });
  assert.match(md, /自動で取り込める/);
  assert.doesNotMatch(md, /作業量は確かめていません/);
});
