/**
 * AI に渡す「このサイトの構造」の組み立て。
 *
 * 実地で起きた失敗（FixLane S6）が動機になっている。5か所から使われている
 * 共通の見出し部品を、AI が1か所だけ切り離して中身を写し取った。見た目は
 * 依頼どおりだったため、写真の比べ合いでは捕まらなかった。
 *
 * AI は調べれば分かったのに調べなかった。**最初から目に入る形で渡せば、
 * 調べる手間なしに「これは共通部品だ」と分かる。**
 *
 * 🔴 この資料は毎回コードから作る。手で書いて置いておくと、コードが変わった
 *    ときに古くなり、AI が間違った前提で動く。
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildStructureNote, countUsages } from "../lib/structure.mjs";

/** ファイルの中身を模したもの（実際の読み取りは呼び出し側が行う） */
const FILES = {
  "components/ui/section-title/SectionTitle.tsx": "export default function SectionTitle() {}",
  "components/ui/works-card/WorksCard.tsx": "export default function WorksCard() {}",
  "components/ui/only-once/OnlyOnce.tsx": "export default function OnlyOnce() {}",
  "app/page.tsx": 'import SectionTitle from "@/components/ui/section-title";',
  "app/works/page.tsx":
    'import SectionTitle from "@/components/ui/section-title";\nimport WorksCard from "@/components/ui/works-card";',
  "app/about/page.tsx": 'import SectionTitle from "@/components/ui/section-title";',
  "app/lonely/page.tsx": 'import OnlyOnce from "@/components/ui/only-once";',
  "app/works/[id]/page.tsx": 'import WorksCard from "@/components/ui/works-card";',
};

test("何か所から読み込まれているかを数える", () => {
  const usages = countUsages(FILES);
  assert.equal(usages.get("components/ui/section-title"), 3);
  assert.equal(usages.get("components/ui/works-card"), 2);
});

test("自分自身の中の記述は数に入れない", () => {
  const files = {
    "components/ui/a/A.tsx": 'import A from "@/components/ui/a";',
    "app/page.tsx": 'import A from "@/components/ui/a";',
  };
  assert.equal(countUsages(files).get("components/ui/a"), 1);
});

test("複数箇所から使われている部品だけを載せる", () => {
  // 1か所でしか使われていない部品は、切り離しても波及しない。
  // すべて載せると資料が長くなり、AI に読ませる費用が増える。
  const note = buildStructureNote(FILES, {});
  assert.match(note, /section-title/);
  assert.doesNotMatch(note, /only-once/);
});

test("使われている数を書く（切り離しの重みが伝わるように）", () => {
  const note = buildStructureNote(FILES, {});
  const row = note.split("\n").find((l) => l.includes("section-title"));
  assert.match(row, /3/);
});

test("多く使われているものを上に置く", () => {
  const note = buildStructureNote(FILES, {});
  assert.ok(note.indexOf("section-title") < note.indexOf("works-card"));
});

test("何をしてはいけないかを、数字の隣に書く", () => {
  // 一覧だけ渡しても「だから何をするな」が伝わらない
  const note = buildStructureNote(FILES, {});
  assert.match(note, /やめない|切り離さない/);
});

test("共通の色や寸法があれば、それも載せる", () => {
  const note = buildStructureNote(FILES, {
    "--color-primary": "#003F98",
    "--color-accent": "#C9A227",
  });
  assert.match(note, /--color-primary/);
  assert.match(note, /#003F98/);
});

test("共通の色が無ければ、その節そのものを出さない", () => {
  const note = buildStructureNote(FILES, {});
  assert.doesNotMatch(note, /共通の色/);
});

test("共通の部品が1つも無ければ、資料を作らない", () => {
  // 空の表だけ渡されても読む側の負担にしかならない
  const note = buildStructureNote(
    { "app/page.tsx": "export default function Page() {}" },
    {},
  );
  assert.equal(note, "");
});

test("表を壊す記号が混じっても、行が割れない", () => {
  const note = buildStructureNote(FILES, { "--a|b": "x|y" });
  for (const line of note.split("\n").filter((l) => l.startsWith("| "))) {
    assert.ok(!/(?<!\\)\|.*(?<!\\)\|.*(?<!\\)\|.*(?<!\\)\|/.test(line.slice(1, -1)));
  }
});
