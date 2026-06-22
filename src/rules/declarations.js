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
      $.type_alias_declaration,
      $.struct_declaration,
      $.enum_declaration,
      $.trait_declaration,
      $.actor_trait_declaration,
      $.actor_struct_declaration,
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

  type_alias_declaration: ($) =>
    seq(
      repeat($.attribute),
      optional($.visibility_modifier),
      "type",
      field("name", $.type_identifier),
      optional(field("type_parameters", $.type_parameters)),
      "=",
      field("target", $._type_annotation),
      optional(";")
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
      "fn",
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
      "{",
      repeat($.actor_method_signature),
      "}"
    ),

  actor_method_signature: ($) =>
    seq(
      optional("impure"),
      choice("mutator", "reader"),
      field("name", $.identifier),
      field("parameters", $.actor_parameter_list),
      optional(field("with_clause", $.with_clause)),
      optional(seq("->", field("return_type", $._type_annotation))),
      ";"
    ),

  actor_struct_declaration: ($) =>
    seq(
      repeat($.attribute),
      optional($.visibility_modifier),
      "actor",
      "struct",
      field("name", $.type_identifier),
      optional(field("type_parameters", $.type_parameters)),
      "{",
      repeat($.struct_field),
      "}"
    ),

  actor_parameter_list: ($) =>
    seq(
      "(",
      $.actor_self_parameter,
      optional(seq(",", commaSep1($.parameter), optional(","))),
      ")"
    ),

  actor_self_parameter: ($) =>
    seq($.self, optional(seq(":", field("type", $._type_annotation)))),

  actor_handler: ($) =>
    seq(
      optional("impure"),
      choice("mutator", "reader"),
      field("name", $.identifier),
      field("parameters", $.actor_parameter_list),
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
      repeat(choice($.function_declaration, $.actor_handler)),
      "}"
    ),
};
