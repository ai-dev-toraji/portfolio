/**
 * 検査結果を、依頼者（コードを読まない人）が読める文章に組み立てる。
 *
 * この文章がそのまま依頼の Issue に書き込まれ、「取り込んでよいか」の判断材料になる。
 *
 * 🔴 最重要の決まり: **検査できなかったことを「問題なし」と書かない。**
 *    比較元が取れない・合言葉が違う・時間切れといった理由で判定が出せないとき、
 *    まとめだけ読んだ人が承認してしまうと、安全網があるつもりで壊れたものが本番へ出る。
 */

/**
 * 依頼した場所であっても、これ以上変わっていたら人の目に回す。
 * ⚠️ 実測に基づく数字ではない。回数を重ねてから調整すること。
 */
export const TARGET_MAX_CHANGE_PERCENT = 60;

/**
 * 依頼した場所の寸法がこの割合以上変わっていたら人の目に回す。
 * 割合の差分は重なる範囲だけで出るため、寸法の変化は別に見る必要がある。
 * ⚠️ 実測に基づく数字ではない。回数を重ねてから調整すること。
 */
export const TARGET_MAX_SIZE_CHANGE_RATIO = 0.5;

/** 数字を3桁ごとに区切る。言語を明示するので実行環境の設定に左右されない */
function withCommas(value) {
  return value.toLocaleString("en-US");
}

/**
 * 見た目が動いたと言えるか。
 * 重なる範囲の画素だけでなく、寸法の変化も見る。重なる範囲だけを比べる以上、
 * 下や横に足された部分は画素の差として現れないため。
 */
function moved(r) {
  return r.diff.changedPixels > 0 || r.diff.heightChanged || r.diff.widthChanged;
}

/** 表の1マスに収まる形にする。改行と縦棒は表の区切りとして解釈されるため潰す */
function forCell(text) {
  return String(text).replace(/\s+/g, " ").replace(/\|/g, "／").trim();
}

/** 寸法の変化を人が読める形にする。変化が無ければ空の配列 */
function sizeChanges(diff) {
  return [
    diff.heightChanged ? `高さ ${diff.beforeHeight}→${diff.afterHeight}px` : "",
    diff.widthChanged ? `横幅 ${diff.beforeWidth}→${diff.afterWidth}px` : "",
  ].filter(Boolean);
}

/**
 * この修正が新しく持ち込んだ画面のエラーだけを取り出す。
 * 比較元の情報を持っていない呼び出し元のために、無い場合は全件を返す。
 *
 * 同じ文面が増えた場合も「増えた分」を返す。文面の一致だけで消してしまうと、
 * 元から1件出ているページで同じエラーが3件に増えても気づけない。
 */
export function newConsoleErrors(r) {
  const after = r.consoleErrors ?? [];
  if (r.baselineConsoleErrors === undefined) return after;

  const remaining = new Map();
  for (const message of r.baselineConsoleErrors) {
    remaining.set(message, (remaining.get(message) ?? 0) + 1);
  }
  return after.filter((message) => {
    const count = remaining.get(message) ?? 0;
    if (count === 0) return true;
    remaining.set(message, count - 1);
    return false;
  });
}

/**
 * 「この修正を自動で取り込んでよいか」を機械が判定する。
 *
 * 人が必ず目で見る前提なら、見た目の変化は報告するだけでよかった。
 * 自動で取り込むなら、人が見ていた分の判断をここが肩代わりする。
 * したがって**迷ったら通さない**。判定できない事情はすべて「取り込まない」に倒す。
 *
 * 判定は割合ではなく画素の実数で行う。文字を数文字入れ替えただけの修正は
 * 割合にすると 0.00% に丸められ、「直った」と「何もしなかった」が同じ値になるため。
 */
export function judge(results, targetPath, checks = {}) {
  const reasons = [];
  const measured = results.filter((r) => !r.error);
  const unmeasured = results.length - measured.length;
  if (results.length === 0) {
    reasons.push("検査した場所が1か所もありません");
  }
  if (unmeasured > 0) {
    reasons.push(`${unmeasured} か所を確認できませんでした`);
  }

  // 元から出ているエラーで止めない。比較元にも同じものがあるなら、
  // それはこの修正が持ち込んだものではない（外部の計測タグなどが典型）。
  const errorCount = results.reduce((n, r) => n + newConsoleErrors(r).length, 0);
  if (errorCount > 0) {
    reasons.push(`この修正で新しく出た画面のエラーが ${errorCount} 件あります`);
  }

  // 機械のチェック。"ok" 以外はすべて通さない。
  // 渡されていない（undefined）場合も通さない。渡し忘れを「合格」と読むと、
  // 呼び出し方を一つ間違えただけで判定の柱が1本抜けたまま通ってしまう。
  for (const [name, state] of [
    ["ビルド", checks.build],
    ["文法チェック", checks.lint],
  ]) {
    if (state !== "ok") {
      reasons.push(`${name}の結果が「通った」ではありません（${state ?? "渡されていません"}）`);
    }
  }

  let targetChangedPixels = null;
  if (targetPath === undefined) {
    reasons.push(
      "依頼がどのページを指しているのか分からないため、直ったかどうかを確かめられません",
    );
  } else {
    // 同じページを複数の画面幅で見ていることがある（トップのパソコンとスマートフォン）。
    // どれか1つでも動いていれば「直った」とみなす。片方だけに効く修正を止めないため。
    const allTargetRows = results.filter((r) => r.target.path === targetPath);
    const targetRows = measured.filter((r) => r.target.path === targetPath);

    if (allTargetRows.length === 0) {
      reasons.push(
        `依頼のページ（${targetPath}）が検査の対象に入っていないため、直ったかどうかを確かめられません`,
      );
    } else if (targetRows.length > 0) {
      targetChangedPixels = Math.max(...targetRows.map((r) => r.diff.changedPixels));
      if (!targetRows.some(moved)) {
        reasons.push("依頼した場所が変化していません（修正が入っていない可能性があります）");
      }
      // 依頼した場所は変わってよいが、限度がある。ページが丸ごと入れ替わるような
      // 変化は、依頼の解釈違いか手の広げすぎなので人の目に回す。
      // ⚠️ これらの値は実測に基づく数字ではない。運用のなかで調整すること。
      const worst = Math.max(...targetRows.map((r) => r.diff.percent));
      if (worst >= TARGET_MAX_CHANGE_PERCENT) {
        reasons.push(
          `依頼した場所の変化が大きすぎます（${worst.toFixed(1)}%）。` +
            `依頼の範囲を超えていないかご確認ください`,
        );
      }
      // 割合は重なる範囲だけで出しているので、寸法が伸び縮みした分は現れない。
      // 縦にも横にも、大きく伸びた場合は「大きすぎる変化」として扱う。
      const ratio = (before, after) => (before > 0 ? Math.abs(after - before) / before : 0);
      const stretched = targetRows.filter(
        (r) =>
          ratio(r.diff.beforeHeight, r.diff.afterHeight) >= TARGET_MAX_SIZE_CHANGE_RATIO ||
          ratio(r.diff.beforeWidth, r.diff.afterWidth) >= TARGET_MAX_SIZE_CHANGE_RATIO,
      );
      if (stretched.length > 0) {
        // 画面幅ごとに1行ずつある。どれか1つだけ挙げると、より重い方を隠しかねない。
        const detail = stretched
          .map((r) => `${r.target.label}：${sizeChanges(r.diff).join("・")}`)
          .join("、");
        reasons.push(
          `依頼した場所の変化が大きすぎます（${detail}）。依頼の範囲を超えていないかご確認ください`,
        );
      }
    }
    // allTargetRows はあるが targetRows が空＝撮影に失敗した場合。
    // 「対象に入っていない」とは原因が違うので、ここでは何も足さない
    // （上の「確認できませんでした」が理由として立っている）。
  }

  // 依頼した場所以外は、少しでも動いていれば人の目に回す。
  // 検査した限り、変更のないページの差分はちょうど 0 になるため、
  // ここを緩めると「ついでに触られた」を見逃す側に倒れる。
  //
  // 依頼のページが分からないときは、どれが「依頼した場所」なのかも決められない。
  // 全ページを「依頼していない場所」として並べると、本来変わってよいページまで
  // 疑わしいものとして挙げてしまうので、その場合はこの判定を行わない
  // （どのみち上で「確かめられません」を理由に立てており、通ることはない）。
  const spilled =
    targetPath === undefined
      ? []
      : measured.filter((r) => r.target.path !== targetPath && moved(r));
  if (spilled.length > 0) {
    const describe = (r) => {
      if (r.diff.changedPixels > 0) return r.target.label;
      // 画素は同じで寸法だけ変わった場合。何が変わったのかを必ず書く
      return `${r.target.label}：${sizeChanges(r.diff).join("・")}`;
    };
    reasons.push(
      `依頼していない場所が ${spilled.length} か所変化しています` +
        `（${spilled.map(describe).join("、")}）`,
    );
  }

  return {
    ok: reasons.length === 0,
    reasons,
    diagnostics: {
      // 測れていない場合は 0 と区別できるよう null。JSON にしたときに
      // キーごと消えると、受け取る側が「変化なし」と読み違える。
      targetChangedPixels,
      spilledCount: spilled.length,
      checkedCount: measured.length,
    },
  };
}

/**
 * 判定は既定で内側で出すが、呼び出し側がすでに持っているなら渡してよい。
 * 同じ入力で2回計算すると、片方だけ引数が変わったときに
 * 「コメントの文面」と「機械が読む判定」が食い違う。
 */
export function buildSummary(
  results,
  preview,
  targetPath,
  checks = {},
  verdict = judge(results, targetPath, checks),
) {
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
    // 列の名前は中身どおりにする。数えているのは「新しく出たもの」だけなので、
    // 「画面のエラー」と書くと、元から出ているものまで無いように読める。
    "| 見た場所 | 依頼の対象 | 変化 | 新しく出たエラー |",
    "|---|---|---|---|",
  ];

  for (const r of results) {
    const scope = isTarget(r) ? "◯ 依頼した場所" : "—";
    if (r.error) {
      // 失敗の内容は複数行になることがある（Playwright の記録など）。
      // そのまま入れると表が崩れ、いちばん読ませたい失敗が読めなくなる。
      lines.push(`| ${r.target.label} | ${scope} | ⚠️ 確認できず | ${forCell(r.error)} |`);
      continue;
    }
    const pct = r.diff.percent;
    const size = sizeChanges(r.diff);
    const sizeNote = size.length > 0 ? `・${size.join("・")}` : "";
    // 画素の実数を先に出す。割合だけだと、数文字の差し替えが 0.00% に丸められ、
    // 「直った」と「何もしなかった」が同じ表示になってしまう。
    const mark =
      r.diff.changedPixels > 0
        ? `${withCommas(r.diff.changedPixels)}画素（${pct.toFixed(2)}%）${sizeNote}`
        : // 寸法だけが変わることがある。重なる範囲では画素が一致するため、
          // ここで「変化なし」と書くと、下や横に足された場合を見落とす。
          size.length > 0
          ? `重なる範囲は同じ${sizeNote}`
          : "変化なし";
    const newErrors = newConsoleErrors(r);
    const errors = newErrors.length === 0 ? "なし" : `⚠️ ${newErrors.length}件`;
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
    // 件数は判定と同じ数え方を使う。ここで別の基準を使うと、同じコメントの中で
    // 「1 か所」と「2 か所」が並び、読み手がどちらを信じてよいか分からなくなる。
    const spilledCount = verdict.diagnostics.spilledCount;
    const untouched = measured.filter((r) => !isTarget(r));

    if (spilledCount > 0) {
      lines.push(
        `⚠️ **依頼していない場所が ${spilledCount} か所変化しています。** ` +
          `依頼の範囲を超えた変更が入っていないか、取り込む前にご確認ください。`,
      );
    } else if (verdict.ok) {
      lines.push(
        untouched.length > 0
          ? `依頼した場所以外の ${untouched.length} か所は**まったく変化していません**。` +
              `依頼の範囲に収まっていると判断できます。`
          : "依頼の範囲を超える変化は見つかりませんでした。",
      );
    } else {
      // 取り込めない判定が出ているときに安心させる文を挟むと、読み手がそこで
      // 納得して下の理由を読み飛ばす。ここでは下を読むよう促すだけにする。
      lines.push(
        "⚠️ このままでは取り込めません。理由は下の「取り込みの可否」をご覧ください。",
      );
    }

    if (failedCount > 0) {
      lines.push(
        "",
        `⚠️ ただし ${failedCount} か所は確認できませんでした。` +
          "上の表の「確認できず」の行をご覧ください。その場所については判定できていません。",
      );
    }
  }

  lines.push("", "### 取り込みの可否（機械の判定）", "");
  if (verdict.ok) {
    // 🔴 見ていない場所まで「動いていない」と書かない。
    //    検査しているのは上の表にある場所だけであり、サイトにはそれ以外のページもある。
    lines.push(
      "✅ **自動で取り込める状態です。** 依頼した場所は変わり、" +
        `検査した ${verdict.diagnostics.checkedCount} か所のうち、それ以外の場所は動いていません。`,
      "",
      "※ 検査したのは上の表にある場所だけです。表に無いページについては判定していません。",
    );
  } else {
    lines.push(
      "⚠️ **自動では取り込めません。** 次の点があるため、人の目での確認が要ります。",
      "",
      ...verdict.reasons.map((reason) => `- ${reason}`),
    );
  }

  // 元から出ているものは並べない。比較元にも同じものがあるなら、この修正とは無関係
  const allErrors = results.flatMap(newConsoleErrors);
  if (allErrors.length > 0) {
    const shown = allErrors.slice(0, 5);
    // エラー文に ``` が含まれると囲みが途中で閉じ、以降が地の文として崩れる。
    // 中身より1つ長い囲みを使う。
    const longest = Math.max(
      0,
      ...shown.flatMap((e) => [...String(e).matchAll(/`+/g)].map((m) => m[0].length)),
    );
    const fence = "`".repeat(Math.max(3, longest + 1));
    lines.push("", "### この修正で新しく出た画面のエラー", "", fence, ...shown, fence);
  }
  return lines.join("\n");
}

/**
 * ジョブを失敗させるべきかを決める。
 * 見た目の変化は依頼どおりでも大きく出るため、報告にとどめて止めない。
 * 止めるのは「画面のエラー」と「検査そのものができなかった場合」だけ。
 */
export function shouldFail(results) {
  return results.some((r) => r.error || newConsoleErrors(r).length > 0);
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
