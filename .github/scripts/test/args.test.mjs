/**
 * 受け取った引数の読み取り。
 *
 * ここは「調べた結果」と「調べていない」を分ける関所である。
 * 空文字や読めない値を 0 や空配列と読むと、判定の柱が黙って1本抜けたまま
 * 「確かめました」という顔をした報告が出る。S6 の実測で足した2つの観点
 * （作業量・共通部品の切り離し）は、どちらもこの読み違いで無力化される。
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { parseArgs, parseCostUsd, parseRemovedImports } from "../visual-check.mjs";

const REQUIRED = ["--preview", "https://preview.example", "--baseline", "https://baseline.example"];

test("作業量: 渡されなければ「確かめていない」", () => {
  assert.equal(parseCostUsd(undefined), undefined);
});

test("作業量: 空文字を 0 と読まない", () => {
  // Number("") は 0。ここを素通しすると「ただ同然で済んだ」ことになる。
  assert.equal(parseCostUsd(""), undefined);
  assert.equal(parseCostUsd("   "), undefined);
});

test("作業量: 数字として読めない文字列を 0 と読まない", () => {
  assert.equal(parseCostUsd("null"), undefined);
  assert.equal(parseCostUsd("abc"), undefined);
});

test("作業量: 数字ならそのまま読む（0 も有効な値として扱う）", () => {
  assert.equal(parseCostUsd("0.205"), 0.205);
  assert.equal(parseCostUsd("0"), 0);
});

test("消えた読み込み: 渡されなければ「調べていない」、空文字なら「調べて0件」", () => {
  assert.equal(parseRemovedImports(undefined), undefined);
  assert.deepEqual(parseRemovedImports(""), []);
});

test("消えた読み込み: 改行区切りで読み、空行は捨てる", () => {
  assert.deepEqual(parseRemovedImports("@/components/ui/section-title\n\n@/lib/x\n"), [
    "@/components/ui/section-title",
    "@/lib/x",
  ]);
});

test("引数全体: 渡されなかった観点は undefined のまま判定へ渡る", () => {
  const { checks } = parseArgs(REQUIRED);
  assert.equal(checks.costUsd, undefined);
  assert.equal(checks.removedImports, undefined);
});

test("引数全体: 渡された観点はそのまま判定へ渡る", () => {
  const { checks } = parseArgs([
    ...REQUIRED,
    "--cost-usd",
    "0.205",
    "--removed-imports",
    "@/components/ui/section-title",
  ]);
  assert.equal(checks.costUsd, 0.205);
  assert.deepEqual(checks.removedImports, ["@/components/ui/section-title"]);
});

test("引数全体: 空の作業量は「確かめていない」として渡る", () => {
  const { checks } = parseArgs([...REQUIRED, "--cost-usd", ""]);
  assert.equal(checks.costUsd, undefined);
});
