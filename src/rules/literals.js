module.exports = {
  _literal: ($) =>
    choice(
      $.integer_literal,
      $.float_literal,
      $.string_literal,
      $.char_literal,
      $.boolean_literal
    ),

  float_literal: (_$) => token(/[0-9]+\.[0-9]+/),
  integer_literal: (_$) => token(/[0-9]+/),

  string_literal: ($) =>
    seq(
      '"',
      repeat(choice(token.immediate(/[^"\\]+/), $.escape_sequence)),
      '"'
    ),

  escape_sequence: (_$) => token.immediate(/\\[ntr0\\"']/),

  char_literal: ($) =>
    seq("'", choice(token.immediate(/[^'\\]/), $.escape_sequence), "'"),

  boolean_literal: (_$) => choice("true", "false"),

  doc_comment: (_$) => token(seq("///", /[^\n]*/)),
  line_comment: (_$) => token(seq("//", /[^\n]*/)),

  identifier: (_$) => /[_a-z][_a-zA-Z0-9]*/,

  type_identifier: (_$) => /[A-Z][_a-zA-Z0-9]*/,
};
