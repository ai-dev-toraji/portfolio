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
 *     [--target-path </works>] [--out <dir>] \
 *     [--build-status ok|failed|unknown] [--lint-status ok|failed|unknown]
 * 環境変数:
 *   BASIC_AUTH_USER / BASIC_AUTH_PASSWORD … プレビューの合言葉（比較元にも必要）
 */

import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

import { compare } from "./lib/compare.mjs";
import { buildSummary, judge, shouldFail } from "./lib/report.mjs";

/** 見る場所。ここを増やすと検査は厚くなるが時間も伸びる */
const TARGETS = [
  { path: "/", width: 1280, height: 800, label: "トップ（パソコン）" },
  { path: "/", width: 390, height: 844, label: "トップ（スマートフォン）" },
  { path: "/works", width: 1280, height: 800, label: "実績一覧" },
  { path: "/about", width: 1280, height: 800, label: "私たちについて" },
  { path: "/service", width: 1280, height: 800, label: "サービス" },
];

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
    // ビルドと文法チェックの結果。依頼者が1つのコメントだけ読めば済むよう、
    // 見た目の判定と同じ文章に混ぜて出す
    checks: {
      build: get("build-status"),
      lint: get("lint-status"),
    },
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

async function main() {
  const { preview, baseline, targetPath, out, checks } = parseArgs();
  await mkdir(out, { recursive: true });

  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  const browser = await chromium.launch();
  const results = await captureAll(browser, { preview, baseline, out, user, password }).finally(
    // 🔴 どんな終わり方でも必ず閉じる。開いたままだと node が終われず、
    //    ジョブは失敗せずに制限時間まで回り続ける（20分の空回り）。
    () => browser.close(),
  );

  // 判定は1回だけ出し、依頼への文面と機械が読む出力の両方で同じものを使う。
  // 2回計算すると、片方だけ条件が変わったときに両者が食い違う。
  const verdict = judge(results, targetPath, checks);

  const summary = buildSummary(results, preview, targetPath, checks, verdict);
  await writeFile(path.join(out, "summary.md"), summary, "utf-8");
  console.log(summary);

  // 「自動で取り込んでよいか」を、後続の処理が読める形で残す。
  // ここでは取り込みそのものは行わない。判定を出すだけに留めている。
  await writeFile(path.join(out, "verdict.json"), JSON.stringify(verdict, null, 2), "utf-8");
  await writeMergeable(verdict.ok);

  // process.exit だと、直前の console.log がパイプへ書き終わる前に切れることがある。
  // 実行の記録は赤くなったときに最初に読まれるので、途中で切れさせない。
  process.exitCode = shouldFail(results) ? 1 : 0;
}

/** 見る場所をすべて撮って比べる */
async function captureAll(browser, { preview, baseline, out, user, password }) {
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
      // 🔴 比較元も必ず確認する。ここを見ないと、比較元が 401 や 404 のときに
      //    エラーページ同士・エラーページと正常ページを比べ、
      //    「変化なし」や「余計な場所が変わった」という誤った判定を出してしまう。
      if (before.status !== 200) {
        results.push({
          target,
          error: `比較元（develop）が ${before.status} を返しました。差分は判定できません`,
        });
        continue;
      }

      const diff = compare(before.buffer, after.buffer);
      await writeFile(path.join(out, `${name}-after.png`), after.buffer);
      await writeFile(path.join(out, `${name}-diff.png`), diff.diffImage);

      results.push({
        target,
        diff,
        consoleErrors: after.consoleErrors,
        // 比較元のエラーも持っておく。元から出ているものまで数えると、
        // 外部の計測タグ1つで以後すべての依頼が止まってしまう。
        baselineConsoleErrors: before.consoleErrors,
      });
    } catch (error) {
      results.push({ target, error: String(error).slice(0, 300) });
    }
  }
  return results;
}

/** 判定を、後続の処理が読める形で書き出す */
async function writeMergeable(ok) {
  if (!process.env.GITHUB_OUTPUT) return;
  await appendFile(process.env.GITHUB_OUTPUT, `mergeable=${ok ? "true" : "false"}\n`, "utf-8");
}

/**
 * 🔴 まず「取り込めない」と書いてから始める。
 *    途中で落ちた場合に何も書かれていないと、受け取る側からは
 *    「判定が無い」と「取り込んでよい」の区別がつかない。
 *    安全網が壊れたときは、通さない側に倒れる必要がある。
 */
await writeMergeable(false);

main().catch((error) => {
  console.error("検査そのものが失敗しました:", error);
  process.exitCode = 2;
});
