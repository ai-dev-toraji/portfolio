import { test } from "node:test";
import assert from "node:assert/strict";

import { PNG } from "pngjs";

import { compare } from "../lib/compare.mjs";

/** 単色の PNG を作る。fill は [r,g,b] */
function solid(width, height, [r, g, b]) {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) {
    png.data[i * 4] = r;
    png.data[i * 4 + 1] = g;
    png.data[i * 4 + 2] = b;
    png.data[i * 4 + 3] = 255;
  }
  return PNG.sync.write(png);
}

/** 上半分だけ色を変えた PNG を作る */
function halfPainted(width, height, base, painted) {
  const png = PNG.sync.read(solid(width, height, base));
  for (let y = 0; y < height / 2; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      png.data[i] = painted[0];
      png.data[i + 1] = painted[1];
      png.data[i + 2] = painted[2];
    }
  }
  return PNG.sync.write(png);
}

test("同じ画像なら変化なしと判定する", () => {
  const a = solid(20, 10, [255, 255, 255]);
  const result = compare(a, solid(20, 10, [255, 255, 255]));
  assert.equal(result.changedPixels, 0);
  assert.equal(result.percent, 0);
  assert.equal(result.heightChanged, false);
});

test("一部が変わったら、その割合を出す", () => {
  const before = solid(20, 10, [255, 255, 255]);
  const after = halfPainted(20, 10, [255, 255, 255], [0, 0, 0]);
  const result = compare(before, after);
  assert.equal(result.changedPixels, 100); // 20x10 の上半分 = 100px
  assert.equal(result.percent, 50);
});

test("高さが変わったことを検知し、重なる範囲だけで比べる", () => {
  const before = solid(20, 10, [255, 255, 255]);
  const after = solid(20, 30, [255, 255, 255]);
  const result = compare(before, after);
  assert.equal(result.heightChanged, true);
  assert.equal(result.beforeHeight, 10);
  assert.equal(result.afterHeight, 30);
  // 重なる 20x10 の範囲は同じなので、差分そのものは 0
  assert.equal(result.changedPixels, 0);
});

test("差分画像が PNG として書き出せる", () => {
  const result = compare(solid(8, 8, [255, 255, 255]), halfPainted(8, 8, [255, 255, 255], [255, 0, 0]));
  const decoded = PNG.sync.read(result.diffImage);
  assert.equal(decoded.width, 8);
  assert.equal(decoded.height, 8);
});
