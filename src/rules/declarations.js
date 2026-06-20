const { commaSep, commaSep1, sepTrailing } = require("./helpers");

module.exports = {
  attribute: ($) =>
    seq("@", field("name", $.identifier), optional($.attribute_arguments)),

  attribute_arguments: ($) =>
    seq(
      "(",
      commaSep(choice($.identifier, $.type_identifier)),
      optional(","),
      ")"
    ),

  import_declaration: ($) => seq("import", field("path", $.import_path), ";"),

  import_path: ($) =>
    choice(
      seq(
        $.identifier,
        repeat(seq("::", $.identifier)),
        "::",
        $.import_group
      ),
      seq($.identifier, repeat(seq("::", $.identifier)))
    ),

  import_group: ($) =>
    seq(
      "{",
      commaSep(choice($.identifier, $.type_identifier)),
      optional(","),
      "}"
    ),

  _declaration: ($) =>
    choice(
      $.function_declaration,
      $.struct_declaration,
      $.enum_declaration,
      $.trait_declaration,
      $.actor_trait_declaration,
      $.actor_declaration,
      $.impl_declaration
    ),

  visibility_modifier: (_$) => choice("public", "package", "internal"),

  function_declaration: ($) =>
    seq(
      repeat($.attribute),
      optional($.visibility_modifier),
      optional("impure"),
      "fn",
      field("name", $.identifier),
      optional(field("type_parameters", $.type_parameters)),
      field("parameters", $.parameter_list),
      optional(field("where_clause", $.where_clause)),
      optional(field("with_clause", $.with_clause)),
      optional(seq("->", field("return_type", $._type_annotation))),
      field("body", $.block)
    ),

  struct_declaration: ($) =>
    seq(
      repeat($.attribute),
      optional($.visibility_modifier),
      optional("opaque"),
      "struct",
      field("name", $.type_identifier),
      optional(field("type_parameters", $.type_parameters)),
      optional(field("where_clause", $.where_clause)),
      "{",
      repeat($.struct_field),
      "}"
    ),

  struct_field: ($) =>
    seq(
      field("name", $.identifier),
      ":",
      field("type", $._type_annotation),
      ","
    ),

  enum_declaration: ($) =>
    seq(
      repeat($.attribute),
      optional($.visibility_modifier),
      optional("opaque"),
      "enum",
      field("name", $.type_identifier),
      optional(field("type_parameters", $.type_parameters)),
      optional(field("where_clause", $.where_clause)),
      "{",
      sepTrailing(",", $._enum_variant),
      "}"
    ),

  _enum_variant: ($) => choice($.unit_variant, $.tuple_variant),

  unit_variant: ($) => field("name", $.type_identifier),

  tuple_variant: ($) =>
    seq(
      field("name", $.type_identifier),
      "(",
      commaSep1($._type_annotation),
      optional(","),
      ")"
    ),

  trait_declaration: ($) =>
    seq(
      optional($.visibility_modifier),
      "trait",
      field("name", choice($.type_identifier, $.identifier)),
      optional(field("type_parameters", $.type_parameters)),
      optional(field("extends", $.extends_clause)),
      optional(field("where_clause", $.where_clause)),
      "{",
      repeat($.method_signature),
      "}"
    ),

  extends_clause: ($) => seq("extends", commaSep1($._type_annotation)),

  method_signature: ($) =>
    seq(
      optional("impure"),
      choice("fn", "mutator", "reader"),
      field("name", $.identifier),
      optional(field("type_parameters", $.type_parameters)),
      field("parameters", $.parameter_list),
      optional(field("where_clause", $.where_clause)),
      optional(field("with_clause", $.with_clause)),
      optional(seq("->", field("return_type", $._type_annotation))),
      ";"
    ),

  actor_trait_declaration: ($) =>
    seq(
      optional($.visibility_modifier),
      "actor",
      "trait",
      field("name", choice($.type_identifier, $.identifier)),
      optional(field("type_parameters", $.type_parameters)),
      optional(field("extends", $.extends_clause)),
      optional(field("where_clause", $.where_clause)),
      "{",
      repeat($.actor_method_signature),
      "}"
    ),

  actor_method_signature: ($) =>
    seq(
      optional("impure"),
      choice("mutator", "reader"),
      field("name", $.identifier),
      field("parameters", $.parameter_list),
      optional(field("with_clause", $.with_clause)),
      optional(seq("->", field("return_type", $._type_annotation))),
      ";"
    ),

  actor_declaration: ($) =>
    seq(
      repeat($.attribute),
      optional($.visibility_modifier),
      "actor",
      field("name", $.type_identifier),
      optional(
        seq("implements", field("implements", commaSep1($._type_annotation)))
      ),
      "{",
      repeat($.actor_field),
      optional($.actor_init),
      repeat($.actor_method),
      "}"
    ),

  actor_field: ($) =>
    seq(
      field("name", $.identifier),
      ":",
      field("type", $._type_annotation),
      ","
    ),

  actor_init: ($) =>
    seq(
      "init",
      field("parameters", $.parameter_list),
      field("body", $.block)
    ),

  actor_method: ($) =>
    seq(
      optional($.visibility_modifier),
      optional("impure"),
      choice("mutator", "reader"),
      field("name", $.identifier),
      optional(field("type_parameters", $.type_parameters)),
      field("parameters", $.parameter_list),
      optional(field("where_clause", $.where_clause)),
      optional(field("with_clause", $.with_clause)),
      optional(seq("->", field("return_type", $._type_annotation))),
      field("body", $.block)
    ),

  impl_declaration: ($) =>
    seq(
      "impl",
      optional(field("type_parameters", $.type_parameters)),
      choice(
        seq(
          field("trait_type", $._type_annotation),
          "for",
          field("target_type", $._type_annotation)
        ),
        field("target_type", $._type_annotation)
      ),
      optional(field("where_clause", $.where_clause)),
      "{",
      repeat($.function_declaration),
      "}"
    ),
};
