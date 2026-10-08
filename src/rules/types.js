const { commaSep, commaSep1 } = require("./helpers");

module.exports = {
  type_parameters: ($) =>
    seq("<", commaSep1($.type_identifier), optional(","), ">"),

  callable_type_parameters: ($) =>
    seq("<", commaSep1(choice($.type_identifier, $.effect_parameter)), optional(","), ">"),

  _type_annotation: ($) =>
    choice($.generic_type, $.named_type, $.function_type, $.tuple_type, $.union_type, $.intersection_type, $.difference_type, $.list_type),

  union_type: ($) => prec.left(1, seq($._type_annotation, "|", $._type_annotation)),
  intersection_type: ($) => prec.left(2, seq($._type_annotation, "&", $._type_annotation)),
  difference_type: ($) => prec.left(3, seq($._type_annotation, "\\", $._type_annotation)),
  list_type: ($) => prec.left(4, seq($._type_annotation, "[", "]")),

  qualified_type_name: ($) => seq(repeat1(seq(choice($.type_identifier, $.identifier), "::")), choice($.type_identifier, $.identifier)),

  named_type: ($) => choice($.type_identifier, $.identifier, $.qualified_type_name),

  generic_type: ($) =>
    prec(
      1,
      seq(
        field("name", choice($.type_identifier, $.qualified_type_name)),
        "<",
        commaSep1($._type_annotation),
        optional(","),
        ">"
      )
    ),

  function_type: ($) =>
    prec.right(0, seq(
      optional("impure"),
      "fn",
      "(",
      commaSep($._type_annotation),
      optional(","),
      ")",
      "->",
      $._type_annotation,
      optional(field("effects", $.effect_clause))
    )),

  tuple_type: ($) =>
    seq("(", optional(seq(commaSep1($._type_annotation), optional(","))), ")"),

  where_clause: ($) => seq("where", commaSep1($.type_constraint)),

  type_constraint: ($) =>
    seq(
      field("parameter", choice($.type_identifier, $.identifier)),
      ":",
      field("bound", $._constraint_expr)
    ),

  _constraint_expr: ($) =>
    choice(
      $.trait_bound,
      $.intersection_bound,
      $.union_bound,
      $.difference_bound,
      $.parenthesized_bound
    ),

  trait_bound: ($) => choice($.type_identifier, $.identifier),

  intersection_bound: ($) =>
    prec.left(2, seq($._constraint_expr, "&", $._constraint_expr)),

  union_bound: ($) =>
    prec.left(1, seq($._constraint_expr, "|", $._constraint_expr)),

  difference_bound: ($) =>
    prec.left(3, seq($._constraint_expr, "\\", $._constraint_expr)),

  parenthesized_bound: ($) => seq("(", $._constraint_expr, ")"),

  with_clause: ($) => seq("with", commaSep1($.capability_parameter)),

  capability_parameter: ($) =>
    seq(field("name", $.identifier), ":", field("type", $._type_annotation)),

  parameter_list: ($) =>
    seq("(", commaSep(choice($.parameter, $.self)), optional(","), ")"),

  parameter: ($) =>
    seq(
      field("name", choice($.identifier, $.self)),
      ":",
      field("type", $._type_annotation)
    ),
};
