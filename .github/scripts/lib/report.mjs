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
 * 依頼していない場所で、これ以下の画素差は「動いた」とみなさない。
 *
 * 比較元と比較先は別々の Vercel デプロイであり、コードを一切触っていなくても
 * フォントの描画やアニメーションの途中フレームなどでわずかな画素差が出うる。
 * 依頼した場所（movedAtAll）はどんな小さな変化も見逃さないが、
 * 依頼していない場所（movedBeyondNoise）はこの揺らぎを許容しないと、
 * ノイズのたびに正しい修正まで人の手が要ることになる。
 * ⚠️ 実測に基づく数字ではない。回数を重ねてから調整すること。
 */
export const SPILL_TOLERANCE_PERCENT = 0.05;

/**
 * 依頼していない場所で、寸法（高さ・横幅）がこれ以下の画素差なら「動いた」とみなさない。
 *
 * 画素の差にはノイズ許容量があるのに、寸法の差には無いと、1画素だけ丈が
 * ずれたようなごく些細な差（フォントの読み込み順によるレイアウトのわずかな
 * ずれ等）でも止まってしまい、SPILL_TOLERANCE_PERCENT を設けた意味が薄れる。
 * ⚠️ 実測に基づく数字ではない。回数を重ねてから調整すること。
 */
export const SPILL_DIMENSION_TOLERANCE_PX = 2;

/** 数字を3桁ごとに区切る。言語を明示するので実行環境の設定に左右されない */
function withCommas(value) {
  return value.toLocaleString("en-US");
}

/**
 * 依頼した場所が動いたと言えるか。どんな小さな変化も見逃さない。
 * 重なる範囲の画素だけでなく、寸法の変化も見る。重なる範囲だけを比べる以上、
 * 下や横に足された部分は画素の差として現れないため。
 */
function movedAtAll(r) {
  return r.diff.changedPixels > 0 || r.diff.heightChanged || r.diff.widthChanged;
}

/**
 * 依頼していない場所が、ノイズと呼べない大きさで動いたと言えるか。
 * 画素の差は割合が SPILL_TOLERANCE_PERCENT を、寸法の差は
 * SPILL_DIMENSION_TOLERANCE_PX を超えたときだけ「動いた」とする。
 * どちらも、比較元と比較先が別々のデプロイであることによる描画の揺らぎを
 * 吸収するための許容量であり、0 にすると正しい修正まで止まり続ける。
 */
function movedBeyondNoise(r) {
  const heightDelta = Math.abs(r.diff.afterHeight - r.diff.beforeHeight);
  const widthDelta = Math.abs(r.diff.afterWidth - r.diff.beforeWidth);
  return (
    r.diff.percent > SPILL_TOLERANCE_PERCENT ||
    heightDelta > SPILL_DIMENSION_TOLERANCE_PX ||
    widthDelta > SPILL_DIMENSION_TOLERANCE_PX
  );
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
 * 想定している完成形は、ここで「取り込んでよい」と判定された場合に
 * develop（クライアントの目に触れない非公開のプレビュー）へ自動で進み、
 * main（本番）への昇格は別に、必ず人が develop を見て判断する、という形。
 * つまりここは最後の砦ではなく、その手前の一次選別に**しかならない設計**。
 *
 * 🔴 ただし現時点では、上記の「develop へ自動で進む」も「human が
 *    develop を見てから main へ上げる」も、まだコードとして実装・強制
 *    されていない（`mergeable` の値はどこからも参照されておらず、
 *    develop への Pull Request 作成も main への昇格も完全に手作業）。
 *    したがって**現状ではこの判定が唯一の自動チェックであり**、下の
 *    「依頼した場所がどれだけ変わったか」に上限を設けていないのは、
 *    将来 develop への自動マージを実装するまでの暫定であって、
 *    「もう安全網があるから大丈夫」という意味ではない。
 *    develop への自動マージを実装する前に、この関数を再監査すること。
 *
 * 依頼した場所の「変化したかどうか」は割合ではなく画素の実数で見る。
 * 文字を数文字入れ替えただけの修正は割合にすると 0.00% に丸められ、
 * 「直った」と「何もしなかった」が同じ値になるため。
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
      if (!targetRows.some(movedAtAll)) {
        reasons.push("依頼した場所が変化していません（修正が入っていない可能性があります）");
      }
      // 🔴 依頼した場所の変化の大きさそのものには、ここで上限を設けない。
      //
      //    以前は画素の割合や寸法の伸び幅に上限を設けていたが、見出しが1行
      //    折り返しただけでもそれより下の画素がすべてずれ、割合はほぼ100%
      //    まで振れる。これは正しい小さな修正でも起きるため、「割合が大きい」
      //    ことは「依頼の範囲を超えて手を広げた」ことの証拠にならない。
      //    依頼した場所が変わるのはむしろ想定どおりであり、逆に判定を誤らせる。
      //
      //    develop はクライアントの目に触れない非公開のプレビューであり、
      //    ここで自動的に取り込まれても、main（本番）へ進める前には必ず
      //    人が develop のプレビューを見て判断する。したがってこの判定を
      //    緩めても、最後の砦は失われない。
    }
    // allTargetRows はあるが targetRows が空＝撮影に失敗した場合。
    // 「対象に入っていない」とは原因が違うので、ここでは何も足さない
    // （上の「確認できませんでした」が理由として立っている）。
  }

  // 依頼した場所以外は、ノイズと呼べない大きさで動いていれば人の目に回す。
  // ノイズ（比較元と比較先が別デプロイであることによる描画のわずかな揺らぎ）
  // まで拾うと、コードを何も触っていないページのせいで正しい修正が
  // 止まり続ける。かといって閾値を緩めすぎると「ついでに触られた」を
  // 見逃す側に倒れるため、SPILL_TOLERANCE_PERCENT はごく小さい値にしてある。
  //
  // 依頼のページが分からないときは、どれが「依頼した場所」なのかも決められない。
  // 全ページを「依頼していない場所」として並べると、本来変わってよいページまで
  // 疑わしいものとして挙げてしまうので、その場合はこの判定を行わない
  // （どのみち上で「確かめられません」を理由に立てており、通ることはない）。
  const spilled =
    targetPath === undefined
      ? []
      : measured.filter((r) => r.target.path !== targetPath && movedBeyondNoise(r));
  if (spilled.length > 0) {
    const describe = (r) => {
      // movedBeyondNoise はノイズ許容量を超えた画素差「または」寸法の変化で
      // 動いたと判定する。寸法が変わっているなら、画素差の有無に関わらず
      // 必ず書く。画素差だけを見ていた旧い条件だと、ノイズ程度の画素差と
      // 寸法の変化が同時に起きた行で、寸法の情報が消えてしまう。
      const size = sizeChanges(r.diff);
      if (size.length > 0) return `${r.target.label}：${size.join("・")}`;
      return r.target.label;
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
      // 測れていない場合は 0 と区別できるよう null。JSON（JavaScript Object
      // Notation / データをやり取りするための軽量な記法）にしたときにキーごと
      // 消えると、受け取る側が「変化なし」と読み違える。
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
      // 🔴「まったく変化していません」と書かない。SPILL_TOLERANCE_PERCENT の
      //    導入により、ここに含まれる行にはノイズ程度のごく小さな画素差が
      //    残っている場合がある（上の表にその数値が出ている）。実際には
      //    動いているのに「無傷」と言い切ると、表の数字と文章が食い違う。
      lines.push(
        untouched.length > 0
          ? `依頼した場所以外の ${untouched.length} か所に、依頼の範囲を超える` +
              `とみなせる変化は見つかりませんでした（ごくわずかな画素差は、` +
              `デプロイのたびに起こりうる揺らぎとして許容しています。上の表の` +
              `数値もあわせてご確認ください）。`
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
    //    さらに、検査した場所についても「動いていません」と言い切らない。
    //    ノイズ許容量（SPILL_TOLERANCE_PERCENT）の範囲内でなら実際には
    //    わずかに動いていてもここを通るため、正確には「動いていない」ではなく
    //    「範囲を超える動きは無い」である。
    lines.push(
      "✅ **自動で取り込める状態です。** 依頼した場所は変わり、" +
        `検査した ${verdict.diagnostics.checkedCount} か所のうち、それ以外の場所に` +
        `依頼の範囲を超える変化は見つかっていません。`,
      "",
      "※ 検査したのは上の表にある場所だけです。表に無いページについては判定していません。" +
        "また、ごくわずかな画素差はデプロイごとの揺らぎとして許容しています。",
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
