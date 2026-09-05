import { test } from "node:test";
import assert from "node:assert/strict";

import { buildSummary } from "../lib/report.mjs";

const PREVIEW = "https://example.vercel.app";

/** 検査できたページ1件分 */
const ok = (path, label, percent, { consoleErrors = [] } = {}) => ({
  target: { path, label, width: 1280, height: 800 },
  diff: {
    percent,
    heightChanged: false,
    beforeHeight: 800,
    afterHeight: 800,
    changedPixels: Math.round(percent * 100),
  },
  consoleErrors,
});

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
  const md = buildSummary([ok("/", "トップ", 40), ok("/works", "実績一覧", 0)], PREVIEW, "/");
  assert.doesNotMatch(md, /依頼していない場所が/);
  assert.match(md, /まったく変化していません/);
});

test("依頼以外がすべて無変化なら、範囲に収まっていると伝える", () => {
  const md = buildSummary([ok("/", "トップ", 3), ok("/works", "実績一覧", 0)], PREVIEW, "/");
  assert.match(md, /1 か所は\*\*まったく変化していません\*\*/);
});

// ▼ ここから下は、現状の実装では通らないはず（＝直すべき欠陥）

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
