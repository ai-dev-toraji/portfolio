/**
 * 検査結果を、依頼者（コードを読まない人）が読める文章に組み立てる。
 *
 * この文章がそのまま依頼の Issue に書き込まれ、「取り込んでよいか」の判断材料になる。
 *
 * 🔴 最重要の決まり: **検査できなかったことを「問題なし」と書かない。**
 *    比較元が取れない・合言葉が違う・時間切れといった理由で判定が出せないとき、
 *    まとめだけ読んだ人が承認してしまうと、安全網があるつもりで壊れたものが本番へ出る。
 */

/** これを超える差分は「依頼以外も動いた可能性」として警告する */
export const DIFF_WARN_PERCENT = 5;

export function buildSummary(results, preview, targetPath, checks = {}) {
  const isTarget = (r) => targetPath !== undefined && r.target.path === targetPath;

  const lines = [
    "## 自動チェックの結果",
    "",
    `**確認用 URL: ${preview}**`,
    "（開くには合言葉が必要です。担当者にお尋ねください）",
    "",
    "比較元は `develop` のプレビューです。",
    "",
    ...machineChecks(checks),
    "### 見た目の比べ方",
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
    const height = r.diff.heightChanged
      ? `・高さ ${r.diff.beforeHeight}→${r.diff.afterHeight}px`
      : "";
    const mark = pct > 0 ? `${pct.toFixed(2)}%${height}` : "変化なし";
    const errors = r.consoleErrors.length === 0 ? "なし" : `⚠️ ${r.consoleErrors.length}件`;
    lines.push(`| ${r.target.label} | ${scope} | ${mark} | ${errors} |`);
  }

  lines.push("");

  const measured = results.filter((r) => !r.error);
  const failedCount = results.length - measured.length;

  if (measured.length === 0) {
    // 1か所も判定できていない。ここで安心させる文を出すと安全網が逆に働く
    lines.push(
      "⚠️ **どの場所も確認できませんでした。** 自動チェックは判定を出せていません。" +
        "取り込む前に、必ず人の目で確認用 URL をご覧ください。",
    );
  } else {
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

    if (failedCount > 0) {
      lines.push(
        "",
        `⚠️ ただし ${failedCount} か所は確認できませんでした。` +
          "上の表の「確認できず」の行をご覧ください。その場所については判定できていません。",
      );
    }
  }

  const allErrors = results.flatMap((r) => r.consoleErrors ?? []);
  if (allErrors.length > 0) {
    lines.push("", "### 画面で発生したエラー", "", "```", ...allErrors.slice(0, 5), "```");
  }
  return lines.join("\n");
}

/**
 * ジョブを失敗させるべきかを決める。
 * 見た目の変化は依頼どおりでも大きく出るため、報告にとどめて止めない。
 * 止めるのは「画面のエラー」と「検査そのものができなかった場合」だけ。
 */
export function shouldFail(results) {
  return results.some((r) => r.error || (r.consoleErrors?.length ?? 0) > 0);
}

/** ビルドと文法チェックの結果を、コードを読まない人向けの言葉で表にする */
function machineChecks(checks) {
  const rows = [
    ["ビルド（サイトが組み上がるか）", checks.build],
    ["文法チェック（書き方の誤り）", checks.lint],
  ].filter(([, state]) => state !== undefined);

  if (rows.length === 0) return [];

  const label = (state) =>
    state === "ok" ? "✅ 通った" : state === "failed" ? "❌ 通らなかった" : "⚠️ 確認できず";

  return [
    "### 機械のチェック",
    "",
    "| 項目 | 結果 |",
    "|---|---|",
    ...rows.map(([name, state]) => `| ${name} | ${label(state)} |`),
    "",
  ];
}
