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

  import_declaration: ($) =>
    seq(
      optional($.visibility_modifier),
      "import",
      field("path", $.import_path),
      ";"
    ),

  import_path: ($) =>
    seq(
      $.import_segment,
      repeat(seq("::", $.import_segment)),
      optional(seq("::", $.import_group))
    ),

  import_segment: ($) => choice($.identifier, $.type_identifier, "mod", "pkg"),

  import_group: ($) =>
    seq(
      "{",
      commaSep($.import_item),
      optional(","),
      "}"
    ),

  import_item: ($) =>
    seq(
      choice($.identifier, $.type_identifier, "self"),
      optional(
        seq(
          $._import_alias,
          field("alias", choice($.identifier, $.type_identifier))
        )
      ),
      optional(seq("::", $.import_group))
    ),

  _import_alias: (_$) => token(prec(1, "as")),

  _declaration: ($) =>
    choice(
      $.function_declaration,
      $.effect_declaration,
      $.type_alias_declaration,
      $.struct_declaration,
      $.enum_declaration,
      $.trait_declaration,
      $.actor_trait_declaration,
      $.actor_struct_declaration,
      $.impl_declaration
    ),

  visibility_modifier: (_$) => choice("pub", "mod", "pkg"),

  function_purity_modifier: (_$) => "impure",

  effect_declaration: ($) => seq(
    repeat($.attribute), optional($.visibility_modifier), "effect",
    field("name", choice($.type_identifier, $.identifier)), ";"
  ),

  function_declaration: ($) =>
    seq(
      repeat($.attribute),
      optional($.visibility_modifier),
      optional($.function_purity_modifier),
      "fn",
      field("name", $.identifier),
      optional(field("type_parameters", alias($.callable_type_parameters, $.type_parameters))),
      field("parameters", $.parameter_list),
      optional(field("where_clause", $.where_clause)),
      optional(field("with_clause", $.with_clause)),
      optional(seq("->", field("return_type", $._type_annotation))),
      optional(field("effects", $.effect_clause)),
      choice(field("body", $.block), ";")
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
      repeat($.attribute), optional($.visibility_modifier), optional("context"), optional("opaque"),
      "struct", field("name", choice($.type_identifier, $.identifier)),
      optional(field("type_parameters", $.type_parameters)),
      choice(
        seq(optional(field("where_clause", $.where_clause)), "{", sepTrailing(",", $.struct_field), "}"),
        seq("=", field("schema", $.schema_projection), ";")
      )
    ),

  schema_projection: ($) => seq(
    field("operation", choice("Pick", "Omit")), "<", field("source", $._type_annotation),
    optional(seq(",", field("fields", $.schema_field_names))), ">"
  ),
  schema_field_names: ($) => seq($.string_literal, repeat(seq("|", $.string_literal))),

  struct_field: ($) =>
    seq(
      field("name", $.identifier),
      ":",
      field("type", $._type_annotation)
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
      optional("capability"),
      "trait",
      field("name", choice($.type_identifier, $.identifier)),
      optional(field("type_parameters", $.type_parameters)),
      optional(field("extends", $.extends_clause)),
      optional(field("where_clause", $.where_clause)),
      "{",
      repeat(choice($.method_signature, $.associated_type_declaration)),
      "}"
    ),

  extends_clause: ($) => seq("extends", commaSep1($._type_annotation)),

  associated_type_declaration: ($) => seq("type", field("name", choice($.type_identifier, $.identifier)), ";"),
  associated_type_binding: ($) => seq("type", field("name", choice($.type_identifier, $.identifier)), "=", field("value", $._type_annotation), ";"),

  method_signature: ($) =>
    seq(
      optional($.function_purity_modifier),
      "fn",
      field("name", $.identifier),
      optional(field("type_parameters", alias($.callable_type_parameters, $.type_parameters))),
      field("parameters", $.parameter_list),
      optional(field("where_clause", $.where_clause)),
      optional(field("with_clause", $.with_clause)),
      optional(seq("->", field("return_type", $._type_annotation))),
      optional(field("effects", $.effect_clause)),
      ";"
    ),

  actor_trait_declaration: ($) =>
    seq(
      optional($.visibility_modifier),
      optional("capability"),
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
      optional($.function_purity_modifier),
      choice("mutator", "reader"),
      field("name", $.identifier),
      field("parameters", $.actor_parameter_list),
      optional(field("with_clause", $.with_clause)),
      optional(seq("->", field("return_type", $._type_annotation))),
      optional(field("effects", $.effect_clause)),
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
      sepTrailing(",", $.struct_field),
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
      optional($.function_purity_modifier),
      choice("mutator", "reader"),
      field("name", $.identifier),
      field("parameters", $.actor_parameter_list),
      optional(field("with_clause", $.with_clause)),
      optional(seq("->", field("return_type", $._type_annotation))),
      optional(field("effects", $.effect_clause)),
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
          field("target_type", $._type_annotation),
          optional(field("where_clause", $.where_clause)),
          "{", repeat(choice($.function_declaration, $.actor_handler, $.associated_type_binding)), "}"
        ),
        seq(field("target_type", $._type_annotation), optional(field("where_clause", $.where_clause)), "{", repeat(choice($.function_declaration, $.actor_handler)), "}")
      )
    ),
};
