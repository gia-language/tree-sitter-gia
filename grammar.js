const declarations = require("./src/rules/declarations");
const expressions = require("./src/rules/expressions");
const types = require("./src/rules/types");
const patterns = require("./src/rules/patterns");
const literals = require("./src/rules/literals");

module.exports = grammar({
  name: "gia",

  extras: ($) => [/\s+/, $.doc_comment, $.line_comment],

  word: ($) => $.identifier,

  supertypes: ($) => [
    $._expression,
    $._statement,
    $._pattern,
    $._type_annotation,
    $._declaration,
  ],

  conflicts: ($) => [
    [$._expression, $.struct_expression],
    // A trailing block-like form may be the block's value or a bare statement (§30.3);
    // let the GLR parser keep both and resolve by which yields a complete parse.
    [$._block_like_expression, $._expression],
  ],

  rules: {
    source_file: ($) => repeat($._top_level_item),

    _top_level_item: ($) => choice($.import_declaration, $._declaration),

    ...declarations,
    ...expressions,
    ...types,
    ...patterns,
    ...literals,
  },
});
