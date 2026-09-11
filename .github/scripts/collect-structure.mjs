/**
 * このサイトの構造をまとめて、AI に渡す資料を作る。
 *
 *   node .github/scripts/collect-structure.mjs > /tmp/structure.md
 *
 * 実地で起きた失敗（FixLane S6）への対策。5か所から使われている共通の見出し
 * 部品を、AI が1か所だけ切り離して中身を写し取った。見た目は依頼どおりで、
 * 写真の比べ合いでは捕まらなかった。
 *
 * AI は調べれば分かったのに調べなかった。最初から目に入る形で渡す。
 *
 * 🔴 毎回コードから作り、リポジトリには残さない。手で書いて置いておくと、
 *    コードが変わったときに古くなる。実態とずれた資料は、無いより悪い。
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { buildStructureNote } from "./lib/structure.mjs";

/** 読む対象。ここに無いものは構造に関係しない */
const ROOTS = ["app", "components"];
const EXTENSIONS = [".tsx", ".ts"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git"]);

/** 共通の色・寸法が書かれている場所 */
const CSS_FILE = "app/globals.css";

function collectFiles(dir, found = {}) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return found;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectFiles(full, found);
      continue;
    }
    if (!EXTENSIONS.includes(path.extname(entry))) continue;
    try {
      found[full] = readFileSync(full, "utf-8");
    } catch {
      // 読めないファイルは飛ばす。資料が少し薄くなるだけで害はない
    }
  }
  return found;
}

/** `--color-primary: #003F98;` の形を拾う */
function collectCssVariables() {
  let css;
  try {
    css = readFileSync(CSS_FILE, "utf-8");
  } catch {
    return {};
  }

  const variables = {};
  for (const match of css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    variables[match[1]] = match[2].trim();
  }
  return variables;
}

function main() {
  const files = {};
  for (const root of ROOTS) collectFiles(root, files);

  const note = buildStructureNote(files, collectCssVariables());
  if (note) process.stdout.write(note + "\n");
}

main();
