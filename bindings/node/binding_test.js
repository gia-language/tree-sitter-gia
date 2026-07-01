const assert = require("node:assert");
const { test } = require("node:test");

const Parser = require("tree-sitter");
const Gia = require(".");

test("can load grammar", () => {
  const parser = new Parser();

  assert.doesNotThrow(() => parser.setLanguage(Gia));
});

test("can parse a Gia source file", () => {
  const parser = new Parser();
  parser.setLanguage(Gia);

  const tree = parser.parse("fn main() -> u64 { 42 }");

  assert.equal(tree.rootNode.hasError, false);
  assert.equal(tree.rootNode.type, "source_file");
});
