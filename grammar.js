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
