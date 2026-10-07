const assert = require("node:assert");
const { test } = require("node:test");

const Parser = require("tree-sitter");
const Gia = require(".");

test("nominal schema projections retain source types and field-name selectors", () => {
  const parser = new Parser(); parser.setLanguage(Gia);
  const tree = parser.parse('pub struct Summary<T> = Pick<source::User<T>, "id" | "name">; struct Rest = Omit<User>; struct __gia_schema_From { value: i64 }');
  assert.equal(tree.rootNode.hasError, false);
  assert.equal(tree.rootNode.descendantsOfType("schema_projection").length, 2);
  assert.deepEqual(tree.rootNode.descendantsOfType("schema_field_names").map(node => node.text), ['"id" | "name"']);
  for (const source of ['struct Broken = Pick<User, id>;', 'struct Broken = Pick<User, "id">', 'struct Broken = View<User>;']) {
    assert.equal(parser.parse(source).rootNode.hasError, true, source);
  }
});

test("constructor subset annotations retain associated output syntax", () => {
  const parser = new Parser(); parser.setLanguage(Gia);
  const tree = parser.parse("type LeafOnly = Tree::Leaf; trait Factory { type Output; fn make(self) -> Self::Output; } impl Factory for Tree { type Output = LeafOnly; fn make(self) -> LeafOnly { Tree::Leaf(7i64) } }");
  assert.equal(tree.rootNode.hasError, false);
  assert.equal(tree.rootNode.descendantsOfType("associated_type_declaration").length, 1);
  assert.equal(tree.rootNode.descendantsOfType("associated_type_binding").length, 1);
  assert.equal(parser.parse("impl Tree { type Output = Tree; }").rootNode.hasError, true);
});

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
