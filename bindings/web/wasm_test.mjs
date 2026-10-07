import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { Language, Parser } from "web-tree-sitter";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("WASM parses typed case bindings and integer suffixes", async () => {
  await Parser.init();
  const language = await Language.load(await readFile(path.join(root, "tree-sitter-gia.wasm")));
  const parser = new Parser();
  parser.setLanguage(language);
  const tree = parser.parse(`fn total(input: i64 | i64[]) -> i64 {
    case input { number: i64 => number, _: i64[] => 0i64 }
  }`);
  try {
    assert.equal(tree.rootNode.hasError, false);
    assert.equal(tree.rootNode.descendantsOfType("type_binding_pattern").length, 2);
    assert.equal(tree.rootNode.descendantsOfType("integer_literal").at(-1).text, "0i64");
  } finally {
    tree.delete();
    parser.delete();
  }
});

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

test("WASM preserves value algebra precedence and list shorthand", async () => {
  await Parser.init();
  const language = await Language.load(await readFile(path.join(root, "tree-sitter-gia.wasm")));
  const parser = new Parser();
  parser.setLanguage(language);
  const tree = parser.parse(`type Input = i64 | i64[];
    type Reduced = (i64 | bool) \\ bool;
    type Combined = i64 | bool & String \\ char;
    type Callback = fn(i64 | bool) -> i64 | bool;`);
  try {
    assert.equal(tree.rootNode.hasError, false);
    assert.equal(tree.rootNode.descendantsOfType("list_type").length, 1);
    const combined = tree.rootNode.namedChildren[2].namedChildren[1];
    assert.equal(combined.type, "union_type");
    assert.equal(combined.namedChildren[1].type, "intersection_type");
    assert.equal(combined.namedChildren[1].namedChildren[1].type, "difference_type");
    const callback = tree.rootNode.namedChildren[3].namedChildren[1];
    assert.equal(callback.type, "function_type");
    assert.equal(callback.namedChildren.at(-1).type, "union_type");
  } finally {
    tree.delete();
    parser.delete();
  }
});
