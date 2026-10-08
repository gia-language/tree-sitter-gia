import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { Language, Parser } from "web-tree-sitter";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("WASM recognizes nominal schemas without admitting malformed selectors", async () => {
  await Parser.init(); const parser = new Parser(); parser.setLanguage(await Language.load(await readFile(path.join(root, "tree-sitter-gia.wasm"))));
  const tree = parser.parse('struct Summary<T> = Pick<source::User<T>, "id" | "name">; struct Rest = Omit<User>;');
  try {
    assert.equal(tree.rootNode.hasError, false);
    assert.equal(tree.rootNode.descendantsOfType("schema_projection").length, 2);
    for (const source of ['struct Broken = Pick<User, id>;', 'struct Broken = Pick<User, "id">', 'struct Broken = View<User>;']) {
      const invalid = parser.parse(source); try { assert.equal(invalid.rootNode.hasError, true, source); } finally { invalid.delete(); }
    }
  } finally { tree.delete(); parser.delete(); }
});

test("WASM recognizes qualified constructor subset annotations", async () => {
  await Parser.init();
  const language = await Language.load(await readFile(path.join(root, "tree-sitter-gia.wasm")));
  const parser = new Parser();
  parser.setLanguage(language);
  const tree = parser.parse("type LeafOnly = Tree::Leaf; type GenericLeaf<T> = tree::GenericTree::GLeaf<T>; fn precise(value: LeafOnly) -> i64 { case value { Tree::Leaf(n) => n } }");
  try {
    assert.equal(tree.rootNode.hasError, false);
    assert.deepEqual(tree.rootNode.descendantsOfType("qualified_type_name").map(node => node.text), ["Tree::Leaf", "tree::GenericTree::GLeaf"]);
  } finally { tree.delete(); parser.delete(); }
});

test("WASM recognizes subset associated outputs in trait implementations", async () => {
  await Parser.init();
  const parser = new Parser(); parser.setLanguage(await Language.load(await readFile(path.join(root, "tree-sitter-gia.wasm"))));
  const tree = parser.parse("trait Factory { type Output; fn make(self) -> Self::Output; } impl Factory for Tree { type Output = Tree::Leaf; fn make(self) -> Tree::Leaf { Tree::Leaf(7i64) } }");
  const invalid = parser.parse("impl Tree { type Output = Tree; }");
  try {
    assert.equal(tree.rootNode.hasError, false);
    assert.equal(tree.rootNode.descendantsOfType("associated_type_binding").length, 1);
    assert.equal(invalid.rootNode.hasError, true);
  } finally { tree.delete(); invalid.delete(); parser.delete(); }
});

test("WASM recognizes qualified enum variant patterns", async () => {
  await Parser.init();
  const language = await Language.load(await readFile(path.join(root, "tree-sitter-gia.wasm")));
  const parser = new Parser();
  parser.setLanguage(language);
  const tree = parser.parse(`fn inspect(value: Tree) {
    case value { Tree::Leaf(n) => n, tree::Tree::Branch(children) => children }
  }`);
  try {
    assert.equal(tree.rootNode.hasError, false);
    const names = tree.rootNode.descendantsOfType("qualified_pattern_name").map(node => node.text);
    assert.deepEqual(names, ["Tree::Leaf", "tree::Tree::Branch"]);
  } finally {
    tree.delete();
    parser.delete();
  }
});

test("WASM accepts a final struct field without relaxing field separators", async () => {
  await Parser.init();
  const language = await Language.load(await readFile(path.join(root, "tree-sitter-gia.wasm")));
  const parser = new Parser();
  parser.setLanguage(language);
  const tree = parser.parse(`type Pair = (i64 | bool, bool);
    type Residual = Pair \\ (i64, bool);
    struct Boxed<T> { value: T }
    actor struct State { ready: bool }`);
  const invalid = parser.parse("struct Broken { x: bool y: bool }");
  try {
    assert.equal(tree.rootNode.hasError, false);
    assert.equal(tree.rootNode.descendantsOfType("struct_field").length, 2);
    assert.equal(invalid.rootNode.hasError, true);
  } finally {
    tree.delete();
    invalid.delete();
    parser.delete();
  }
});

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

test("WASM preserves source effect rows, binders and algebra boundaries", async () => {
  await Parser.init();
  const parser = new Parser();
  parser.setLanguage(await Language.load(await readFile(path.join(root, "tree-sitter-gia.wasm"))));
  const tree = parser.parse(`pub effect Disk; effect Log;
    impure fn apply<T, effect E>(callback: fn(T) -> T effects E, value: T) -> T effects E { impure callback(value) }
    trait Read { impure fn read(self) -> String effects Disk; fn ready(self) -> bool effects {}; }
    impl Read for Store { impure fn read(self) -> String effects Disk { "" } }
    impure fn foreign() effects io::Disk;
    impure fn work() effects Disk | Log & Disk \\ Log \\ Disk {}`);
  try {
    assert.equal(tree.rootNode.hasError, false, tree.rootNode.toString());
    assert.equal(tree.rootNode.descendantsOfType("effect_parameter").length, 1);
    assert.equal(tree.rootNode.descendantsOfType("effect_clause").length, 7);
    const union = tree.rootNode.descendantsOfType("union_effect")[0];
    assert.equal(union.namedChildren[1].type, "intersection_effect");
    assert.equal(union.namedChildren[1].namedChildren[1].namedChildren[0].type, "difference_effect");
    for (const source of ["struct Bad<effect E> {}", "fn bad(callback: fn<effect E>() -> Unit effects E) {}", "fn bad() effects {Disk} {}"])
    {
      const invalid = parser.parse(source);
      try { assert.equal(invalid.rootNode.hasError, true, source); } finally { invalid.delete(); }
    }
  } finally { tree.delete(); parser.delete(); }
});
