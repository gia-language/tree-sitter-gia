const { commaSep, commaSep1 } = require("./helpers");

module.exports = {
  _pattern: ($) =>
    choice(
      $.wildcard_pattern,
      $._literal_pattern,
      $.identifier,
      $.variant_pattern,
      $.tuple_pattern,
      $.list_pattern,
      $.struct_pattern,
    ),

  wildcard_pattern: (_$) => "_",

  _literal_pattern: ($) =>
    choice(
      $.integer_literal,
      $.float_literal,
      $.string_literal,
      $.char_literal,
      $.boolean_literal,
    ),

  variant_pattern: ($) =>
    seq(
      field("name", $.type_identifier),
      optional(seq("(", commaSep1($._pattern), optional(","), ")")),
    ),

  tuple_pattern: ($) =>
    seq(
      "(",
      $._pattern,
      ",",
      optional(seq(commaSep1($._pattern), optional(","))),
      ")",
    ),

  list_pattern: ($) =>
    seq("[", commaSep($._list_pattern_element), optional(","), "]"),

  _list_pattern_element: ($) => choice($.rest_pattern, $._pattern),

  rest_pattern: ($) => seq("..", optional($.identifier)),

  struct_pattern: ($) =>
    seq(
      field("name", $.type_identifier),
      "{",
      commaSep($._struct_field_pattern_element),
      optional(","),
      "}",
    ),

  _struct_field_pattern_element: ($) =>
    choice($.struct_rest_pattern, $.field_pattern),

  struct_rest_pattern: (_$) => "..",

  field_pattern: ($) =>
    seq(
      field("name", $.identifier),
      optional(seq(":", field("pattern", $._pattern))),
    ),
};
