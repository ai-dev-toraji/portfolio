/**
 * 見た目の自動チェック。
 *
 * 「依頼された箇所以外が動いていないか」を機械で判定するための道具。
 * 見た目に閉じた修正に限定している以上、これが最大の安全網になる。
 *
 * 検査対象はローカルでビルドしたものではなく、Vercel が作ったプレビュー。
 * ビルド済みの実物を見るため確実で、外部サービスの資格情報も要らない。
 *
 * 比較元は本番ではなく develop のプレビューを使う。
 * 本番は develop より進んでいることがあり、依頼と無関係な差が混ざるため。
 *
 * 使い方:
 *   node visual-check.mjs --preview <URL> --baseline <URL> \
 *     [--target-path </works>] [--out <dir>]
 * 環境変数:
 *   BASIC_AUTH_USER / BASIC_AUTH_PASSWORD … プレビューの合言葉（比較元にも必要）
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { chromium } from "playwright";

/** 見る場所。ここを増やすと検査は厚くなるが時間も伸びる */
const TARGETS = [
  { path: "/", width: 1280, height: 800, label: "トップ（パソコン）" },
  { path: "/", width: 390, height: 844, label: "トップ（スマートフォン）" },
  { path: "/works", width: 1280, height: 800, label: "実績一覧" },
  { path: "/about", width: 1280, height: 800, label: "私たちについて" },
  { path: "/service", width: 1280, height: 800, label: "サービス" },
];

/** これを超える差分は「依頼以外も動いた可能性」として警告する */
const DIFF_WARN_PERCENT = 5;

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (name) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const preview = get("preview");
  const baseline = get("baseline");
  if (!preview || !baseline) {
    throw new Error("--preview と --baseline は必須です");
  }
  return {
    preview,
    baseline,
    // 依頼が指していたページ。ここの変化は想定内、他ページの変化は要確認
    targetPath: get("target-path"),
    out: get("out") ?? "visual-check-out",
  };
}

/** 1ページ分を撮る。コンソールのエラーも拾う */
async function capture(context, url, target) {
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text().slice(0, 200));
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error).slice(0, 200)));

  await page.setViewportSize({ width: target.width, height: target.height });
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  // 遅れて動く装飾が写り込むのを避ける
  await page.waitForTimeout(1200);
  const buffer = await page.screenshot({ fullPage: true });
  const status = response?.status() ?? 0;
  await page.close();
  return { buffer, consoleErrors, status };
}

/**
 * 2枚を比べる。高さが違う場合は重なる範囲だけで比べ、
 * 高さの変化そのものも結果に含める（内容が増減した合図になるため）。
 */
function compare(beforeBuffer, afterBuffer) {
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
    diffImage: PNG.sync.write(diff),
  };
}

async function main() {
  const { preview, baseline, targetPath, out } = parseArgs();
  await mkdir(out, { recursive: true });

  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  const browser = await chromium.launch();
  // 比較元も develop のプレビューなので、どちらにも合言葉が要る
  const credentials =
    user && password ? { httpCredentials: { username: user, password } } : {};
  const previewContext = await browser.newContext(credentials);
  const baselineContext = await browser.newContext(credentials);

  const results = [];
  for (const target of TARGETS) {
    const name = `${target.path.replace(/\//g, "_") || "_top"}-${target.width}`;
    try {
      const after = await capture(previewContext, preview + target.path, target);
      const before = await capture(baselineContext, baseline + target.path, target);

      if (after.status !== 200) {
        results.push({ target, error: `プレビューが ${after.status} を返しました` });
        continue;
      }

      const diff = compare(before.buffer, after.buffer);
      await writeFile(path.join(out, `${name}-after.png`), after.buffer);
      await writeFile(path.join(out, `${name}-diff.png`), diff.diffImage);

      results.push({ target, diff, consoleErrors: after.consoleErrors });
    } catch (error) {
      results.push({ target, error: String(error).slice(0, 300) });
    }
  }

  await browser.close();

  const summary = buildSummary(results, preview, targetPath);
  await writeFile(path.join(out, "summary.md"), summary, "utf-8");
  console.log(summary);

  // 失敗とみなすのは「画面のエラー」と「検査そのものの失敗」だけ。
  // 見た目の変化は依頼どおりでも大きく出るため、報告にとどめて止めない。
  const hasProblem = results.some(
    (r) => r.error || (r.consoleErrors?.length ?? 0) > 0,
  );
  process.exit(hasProblem ? 1 : 0);
}

function buildSummary(results, preview, targetPath) {
  const isTarget = (r) => targetPath !== undefined && r.target.path === targetPath;

  const lines = [
    "## 自動チェックの結果",
    "",
    `**確認用 URL: ${preview}**`,
    "（開くには合言葉が必要です。担当者にお尋ねください）",
    "",
    "比較元は `develop` のプレビューです。",
    "",
    "| 見た場所 | 依頼の対象 | 変化 | 画面のエラー |",
    "|---|---|---|---|",
  ];

  for (const r of results) {
    const scope = isTarget(r) ? "◯ 依頼した場所" : "—";
    if (r.error) {
      lines.push(`| ${r.target.label} | ${scope} | ⚠️ 確認できず | ${r.error} |`);
      continue;
    }
    const pct = r.diff.percent;
    const changed = pct > 0;
    const height = r.diff.heightChanged
      ? `・高さ ${r.diff.beforeHeight}→${r.diff.afterHeight}px`
      : "";
    const mark = changed ? `${pct.toFixed(2)}%${height}` : "変化なし";
    const errors = r.consoleErrors.length === 0 ? "なし" : `⚠️ ${r.consoleErrors.length}件`;
    lines.push(`| ${r.target.label} | ${scope} | ${mark} | ${errors} |`);
  }

  lines.push("");

  const measured = results.filter((r) => !r.error);
  const unexpected = measured.filter(
    (r) => !isTarget(r) && r.diff.percent >= DIFF_WARN_PERCENT,
  );
  const untouched = measured.filter((r) => !isTarget(r) && r.diff.percent === 0);

  if (unexpected.length > 0) {
    lines.push(
      `⚠️ **依頼していない場所が ${unexpected.length} か所変化しています。** ` +
        `依頼の範囲を超えた変更が入っていないか、取り込む前にご確認ください。`,
    );
  } else if (untouched.length > 0) {
    lines.push(
      `依頼した場所以外の ${untouched.length} か所は**まったく変化していません**。` +
        `依頼の範囲に収まっていると判断できます。`,
    );
  } else {
    lines.push("依頼の範囲を超える変化は見つかりませんでした。");
  }

  const allErrors = results.flatMap((r) => r.consoleErrors ?? []);
  if (allErrors.length > 0) {
    lines.push("", "### 画面で発生したエラー", "", "```", ...allErrors.slice(0, 5), "```");
  }
  return lines.join("\n");
}

main().catch((error) => {
  console.error("検査そのものが失敗しました:", error);
  process.exit(2);
});
