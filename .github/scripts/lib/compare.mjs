/**
 * 2枚のスクリーンショットを比べる。
 *
 * 高さが違う場合は重なる範囲だけで比べ、高さの変化そのものも結果に含める
 * （内容が増減した合図になるため）。
 */

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export function compare(beforeBuffer, afterBuffer) {
  const before = PNG.sync.read(beforeBuffer);
  const after = PNG.sync.read(afterBuffer);

  const width = Math.min(before.width, after.width);
  const height = Math.min(before.height, after.height);
  const heightChanged = before.height !== after.height;

  const crop = (png) => {
    if (png.width === width && png.height === height) return png;
    const out = new PNG({ width, height });
    PNG.bitblt(png, out, 0, 0, width, height, 0, 0);
    return out;
  };

  const a = crop(before);
  const b = crop(after);
  const diff = new PNG({ width, height });
  const changed = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: 0.1,
  });

  return {
    changedPixels: changed,
    percent: (changed / (width * height)) * 100,
    heightChanged,
    beforeHeight: before.height,
    afterHeight: after.height,
    // 横幅も同じ理由で返す。重なる範囲だけを比べる以上、はみ出した部分は
    // 画素の差として現れないため、寸法の変化そのものを別に伝える必要がある。
    widthChanged: before.width !== after.width,
    beforeWidth: before.width,
    afterWidth: after.width,
    diffImage: PNG.sync.write(diff),
  };
}
