const assert = require("node:assert");
const { test } = require("node:test");

const Parser = require("tree-sitter");
const Gia = require(".");
const fs = require("node:fs");
const path = require("node:path");

test("current tooling fixture parses and every shipped query compiles", () => {
  const parser = new Parser(); parser.setLanguage(Gia);
  const root = path.resolve(__dirname, "../..");
  const tree = parser.parse(fs.readFileSync(path.join(root,"test/fixtures/current-tooling.gia"),"utf8"));
  assert.equal(tree.rootNode.hasError,false,tree.rootNode.toString());
  for (const file of fs.readdirSync(path.join(root,"queries")).filter(name => name.endsWith(".scm"))) {
    const query = new Parser.Query(Gia,fs.readFileSync(path.join(root,"queries",file),"utf8"));
    assert.ok(query.captures(tree.rootNode).length > 0,file);
  }
});

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

test("effects retain nominal rows, rank-one binders and callable boundaries", () => {
  const parser = new Parser(); parser.setLanguage(Gia);
  const source = `pub effect Disk; effect Log;
    impure fn apply<T, effect E>(callback: fn(T) -> T effects E, value: T) -> T effects E { impure callback(value) }
    trait Read { impure fn read<effect E>(self) -> String effects E; fn ready(self) -> bool effects {}; }
    impl Read for Store { impure fn read<effect E>(self) -> String effects E { "" } }
    actor trait API { impure reader read(self) -> String effects Disk; }
    impl API for Store { impure reader read(self) -> String effects Disk { "" } }
    impure fn foreign() effects io::Disk;
    impure fn factory() -> (fn() -> u64 effects Log) effects Disk {}
    fn pure() effects {} {}`;
  const tree = parser.parse(source);
  assert.equal(tree.rootNode.hasError, false, tree.rootNode.toString());
  assert.equal(tree.rootNode.descendantsOfType("effect_declaration").length, 2);
  assert.equal(tree.rootNode.descendantsOfType("effect_parameter").length, 3);
  assert.equal(tree.rootNode.descendantsOfType("effect_clause").length, 11);
  assert.equal(tree.rootNode.descendantsOfType("function_type").length, 2);
  assert.equal(tree.rootNode.descendantsOfType("named_effect").some(node => node.text === "io::Disk"), true);
});

test("effect algebra matches union, intersection and left associative difference precedence", () => {
  const parser = new Parser(); parser.setLanguage(Gia);
  const tree = parser.parse("impure fn work() effects A | B & C \\ D \\ E {}");
  assert.equal(tree.rootNode.hasError, false);
  const union = tree.rootNode.descendantsOfType("union_effect")[0];
  assert.equal(union.namedChildren[1].type, "intersection_effect");
  const difference = union.namedChildren[1].namedChildren[1];
  assert.equal(difference.type, "difference_effect");
  assert.equal(difference.namedChildren[0].type, "difference_effect");
  assert.equal(difference.namedChildren[0].text, "C \\ D");
});

test("effect parameters remain unsupported in data owners and higher-rank arrows", () => {
  const parser = new Parser(); parser.setLanguage(Gia);
  for (const source of [
    "struct Bad<effect E> {}", "trait Bad<effect E> {}", "impl<effect E> Store {}",
    "fn bad(callback: fn<effect E>() -> Unit effects E) {}", "effect Disk", "fn bad() effects {Disk} {}",
  ]) assert.equal(parser.parse(source).rootNode.hasError, true, source);
});


test("generic qualified bounds and tuple grouping match compiler syntax", () => {
  const parser = new Parser(); parser.setLanguage(Gia);
  const tree = parser.parse("fn convert<T, U>(value:T) where T: std::convert::From<(U,)> & Marker -> ((U,)) { value } type Empty=(); type Scalar=(u64); type Single=(u64,); type Pair=(u64,bool);");
  assert.equal(tree.rootNode.hasError, false, tree.rootNode.toString());
  assert.equal(tree.rootNode.descendantsOfType("trait_bound")[0].childForFieldName("name").text, "std::convert::From");
  assert.equal(tree.rootNode.descendantsOfType("parenthesized_type").length, 2);
  assert.equal(tree.rootNode.descendantsOfType("tuple_type").length, 5);
  for (const source of ["type Bad=(u64,,);", "fn bad<T>() where T:From<> {}", "fn bad<T>() where T:From<u64 {}"])
    assert.equal(parser.parse(source).rootNode.hasError, true, source);
});


test("unit values, grouped patterns, typed closures and JSON field attributes remain current", () => {
  const parser = new Parser(); parser.setLanguage(Gia);
  for (const source of [
    'fn main()->() {let ()=(); case () {()=>()}}',
    'fn narrow(value:u64 | bool)->u64 {case value {n:u64=>n,_=>0}}',
    'fn main()->bool {let f=fn(value:String)->bool {value=="ok"};f("ok")}',
    '@derive(New,JsonTmp) @json_tmp(casing:camel) struct Source<T>{@json_tmp(rename:"wire") value:T,@json_tmp(default) count:u64} @derive(JsonTmp) struct Selected<T>=Pick<Source<T>,"value">;',
    'fn main()->u64 {let (value)=42;value}',
  ]) assert.equal(parser.parse(source).rootNode.hasError,false,source);
  for (const source of ['@json_tmp(rename:42) struct Invalid {}','@derive("New") struct Invalid {}','fn bad(value:(u64,bool)) {case value {(n:u64,_)=>n}}'])
    assert.equal(parser.parse(source).rootNode.hasError,true,source);
});
