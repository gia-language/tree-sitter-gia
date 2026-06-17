const { commaSep, commaSep1 } = require("./helpers");

const PRECEDENCE = {
  IMPURE: 0,
  OR: 1,
  AND: 2,
  EQUALITY: 3,
  COMPARISON: 4,
  ADD: 5,
  MULTIPLY: 6,
  RANGE: 7,
  PIPE: 8,
  SEND: 9,
  FIELD: 10,
  CALL: 11,
  UNARY: 12,
};

module.exports = {
  block: ($) =>
    seq(
      "{",
      repeat($._statement),
      optional(field("value", $._expression)),
      "}"
    ),

  _statement: ($) =>
    choice(
      $.let_statement,
      $.return_statement,
      $.defer_statement,
      $.expression_statement
    ),

  let_statement: ($) =>
    seq(
      "let",
      field("pattern", $._pattern),
      "=",
      field("value", $._expression),
      ";"
    ),

  return_statement: ($) =>
    seq("return", optional(field("value", $._expression)), ";"),

  defer_statement: ($) => seq("defer", field("value", $._expression), ";"),

  expression_statement: ($) => seq($._expression, ";"),

  _expression: ($) =>
    choice(
      $.identifier,
      $.type_identifier,
      $.self,
      $._literal,
      $.unary_expression,
      $.binary_expression,
      $.range_expression,
      $.pipe_expression,
      $.impure_expression,
      $.async_expression,
      $.send_expression,
      $.field_expression,
      $.path_expression,
      $.call_expression,
      $.list_expression,
      $.map_expression,
      $.struct_expression,
      $.closure_expression,
      $.block,
      $.if_expression,
      $.case_expression,
      $.loop_expression,
      $.break_expression,
      $.continue_expression,
      $.parenthesized_expression,
      $.tuple_expression
    ),

  self: (_$) => "self",

  unary_expression: ($) =>
    prec(
      PRECEDENCE.UNARY,
      choice(seq("-", $._expression), seq("!", $._expression))
    ),

  binary_expression: ($) =>
    choice(
      prec.left(PRECEDENCE.OR, seq($._expression, "||", $._expression)),
      prec.left(PRECEDENCE.AND, seq($._expression, "&&", $._expression)),
      prec.left(PRECEDENCE.EQUALITY, seq($._expression, "==", $._expression)),
      prec.left(PRECEDENCE.EQUALITY, seq($._expression, "!=", $._expression)),
      prec.left(PRECEDENCE.COMPARISON, seq($._expression, "<", $._expression)),
      prec.left(PRECEDENCE.COMPARISON, seq($._expression, ">", $._expression)),
      prec.left(PRECEDENCE.COMPARISON, seq($._expression, "<=", $._expression)),
      prec.left(PRECEDENCE.COMPARISON, seq($._expression, ">=", $._expression)),
      prec.left(PRECEDENCE.ADD, seq($._expression, "+", $._expression)),
      prec.left(PRECEDENCE.ADD, seq($._expression, "-", $._expression)),
      prec.left(PRECEDENCE.MULTIPLY, seq($._expression, "*", $._expression)),
      prec.left(PRECEDENCE.MULTIPLY, seq($._expression, "/", $._expression)),
      prec.left(PRECEDENCE.MULTIPLY, seq($._expression, "%", $._expression))
    ),

  range_expression: ($) =>
    choice(
      prec.left(PRECEDENCE.RANGE, seq($._expression, "..", $._expression)),
      prec.left(PRECEDENCE.RANGE, seq($._expression, "..=", $._expression))
    ),

  pipe_expression: ($) =>
    prec.left(PRECEDENCE.PIPE, seq($._expression, "|>", $._expression)),

  impure_expression: ($) =>
    prec.right(PRECEDENCE.IMPURE, seq("impure", $._expression)),

  async_expression: ($) =>
    prec.right(PRECEDENCE.IMPURE, seq("async", $._expression)),

  send_expression: ($) =>
    prec.left(
      PRECEDENCE.SEND,
      choice(
        seq(
          field("receiver", $._expression),
          "~>",
          field("call", $._expression)
        ),
        seq(
          field("receiver", $._expression),
          "<~",
          field("call", $._expression)
        )
      )
    ),

  field_expression: ($) =>
    prec.left(
      PRECEDENCE.FIELD,
      seq(field("base", $._expression), ".", field("name", $.identifier))
    ),

  path_expression: ($) =>
    prec.left(
      PRECEDENCE.FIELD,
      seq(
        field("base", $._expression),
        "::",
        field("name", choice($.identifier, $.type_identifier))
      )
    ),

  call_expression: ($) =>
    prec(
      PRECEDENCE.CALL,
      seq(
        field("callee", $._expression),
        "(",
        optional(field("arguments", $.argument_list)),
        ")"
      )
    ),

  argument_list: ($) =>
    seq($._argument, repeat(seq(",", $._argument)), optional(",")),

  _argument: ($) => choice($.labeled_argument, $.positional_argument),

  labeled_argument: ($) =>
    seq(field("label", $.identifier), ":", field("value", $._expression)),

  positional_argument: ($) => $._expression,

  list_expression: ($) =>
    seq("[", commaSep($._list_element), optional(","), "]"),

  _list_element: ($) => choice($.spread_element, $._expression),

  spread_element: ($) => seq("..", $._expression),

  map_expression: ($) => seq("#{", commaSep($.map_entry), optional(","), "}"),

  map_entry: ($) =>
    seq(field("key", $._expression), ":", field("value", $._expression)),

  struct_expression: ($) =>
    seq(
      field("name", $.type_identifier),
      "{",
      commaSep($._struct_init_field),
      optional(","),
      "}"
    ),

  _struct_init_field: ($) => choice($.struct_base, $.field_initializer),

  struct_base: ($) => seq("..", $._expression),

  field_initializer: ($) =>
    seq(
      field("name", $.identifier),
      optional(seq(":", field("value", $._expression)))
    ),

  closure_expression: ($) =>
    seq(
      "fn",
      "(",
      commaSep($._pattern),
      optional(","),
      ")",
      field("body", $.block)
    ),

  if_expression: ($) =>
    seq(
      "if",
      field("condition", $._expression),
      field("then", $.block),
      optional(seq("else", field("else", choice($.block, $.if_expression))))
    ),

  case_expression: ($) =>
    seq(
      "case",
      field("scrutinee", $._expression),
      "{",
      repeat(seq($.case_arm, optional(","))),
      "}"
    ),

  case_arm: ($) =>
    seq(field("pattern", $._pattern), "=>", field("body", $._expression)),

  loop_expression: ($) => seq("loop", field("body", $.block)),

  break_expression: ($) =>
    prec.right(PRECEDENCE.IMPURE, seq("break", optional($._expression))),

  continue_expression: (_$) => "continue",

  parenthesized_expression: ($) => seq("(", $._expression, ")"),

  tuple_expression: ($) =>
    seq(
      "(",
      $._expression,
      ",",
      optional(seq(commaSep1($._expression), optional(","))),
      ")"
    ),
};
