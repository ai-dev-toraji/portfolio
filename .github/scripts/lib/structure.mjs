/**
 * AI に渡す「このサイトの構造」の組み立て。
 *
 * 実地で起きた失敗（FixLane S6）が動機。5か所から使われている共通の見出し
 * 部品を、AI が1か所だけ切り離して中身を写し取った。見た目は依頼どおりで、
 * 写真の比べ合いでは捕まらなかった。
 *
 * AI は調べれば分かったのに調べなかった。**最初から目に入る形で渡せば、
 * 調べる手間なしに「これは共通部品だ」と分かる。**
 *
 * 🔴 毎回コードから作る。手で書いて置いておくと、コードが変わったときに
 *    古くなり、AI が間違った前提で動く。実態とずれた資料は、無いより悪い。
 */

/** 部品の読み込みを表す書き方。`@/components/...` の形だけを見る */
const IMPORT_PATTERN = /from\s+["'](@\/(?:components|app)\/[^"']+)["']/g;

/** 表の升目を壊さないように整える */
function cell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

/**
 * どの部品が何か所から読み込まれているかを数える。
 *
 * 自分自身の中の記述は数に入れない（部品が自分を読み込む書き方をしていても、
 * それは「使われている」ではない）。
 */
export function countUsages(files) {
  const usages = new Map();

  for (const [path, content] of Object.entries(files)) {
    for (const match of String(content).matchAll(IMPORT_PATTERN)) {
      const target = match[1].replace(/^@\//, "").replace(/\/index$/, "");
      // 自分自身の中の記述は数えない
      if (path.startsWith(`${target}/`) || path === target) continue;
      usages.set(target, (usages.get(target) ?? 0) + 1);
    }
  }
  return usages;
}

/**
 * AI に渡す資料を組み立てる。
 * 共通の部品が1つも無ければ空文字を返す（空の表は読む側の負担にしかならない）。
 */
export function buildStructureNote(files, cssVariables = {}) {
  const usages = countUsages(files);

  // 1か所でしか使われていない部品は載せない。切り離しても波及せず、
  // すべて載せると資料が長くなって読ませる費用が増える。
  const shared = [...usages.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (shared.length === 0) return "";

  const lines = [
    "# このサイトの構造（作業前に必ず読むこと・自動生成）",
    "",
    "## 複数の場所から使われている部品",
    "",
    "| 部品 | 使われている数 |",
    "|---|---|",
    ...shared.map(([path, count]) => `| \`${cell(path)}\` | ${count} か所 |`),
    "",
    "🔴 **これらを使っている場所を直すとき、部品の使用そのものをやめない。**",
    "中身を写し取って別に書くと、その1か所だけが今後の一括変更から外れる。",
    "次に「まとめて変えてほしい」と頼まれたとき、そこだけ変わらない。",
    "",
    "部品に値を渡す口が無い場合は、既定値を従来どおりに保ったまま口を足し、",
    "依頼された箇所からだけ別の値を渡すこと。",
  ];

  const variables = Object.entries(cssVariables);
  if (variables.length > 0) {
    lines.push(
      "",
      "## 共通の色・寸法",
      "",
      "| 変数 | 値 |",
      "|---|---|",
      ...variables.map(([name, value]) => `| \`${cell(name)}\` | ${cell(value)} |`),
      "",
      "🔴 **これらを直接の値に置き換えない。** 濃さや大きさを変える必要があるときも、",
      "この仕組みの中で行う。",
    );
  }

  return lines.join("\n");
}
