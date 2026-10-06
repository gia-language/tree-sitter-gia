import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { Language, Parser } from "web-tree-sitter";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("can load the WASM grammar with web-tree-sitter", async () => {
  await Parser.init();

  const wasm = await readFile(path.join(root, "tree-sitter-gia.wasm"));
  const language = await Language.load(wasm);
  const parser = new Parser();
  parser.setLanguage(language);

  const tree = parser.parse(`fn main() -> u64 {
    let mut total: u64 = 0;
    for n in 0..4 {
      total = total + n;
    }
    while total < 10 {
      total = total + 1;
    }
    total
  }`);

  assert.equal(tree.rootNode.hasError, false);
  assert.equal(tree.rootNode.type, "source_file");
  assert.equal(tree.rootNode.descendantsOfType("for_expression").length, 1);
  assert.equal(tree.rootNode.descendantsOfType("while_expression").length, 1);
  parser.delete();
  tree.delete();
});
