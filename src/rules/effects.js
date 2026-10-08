module.exports = {
  effect_clause: ($) => seq("effects", field("row", $._effect_expression)),
  _effect_expression: ($) => choice($.named_effect, $.empty_effect, $.grouped_effect, $.union_effect, $.intersection_effect, $.difference_effect),
  named_effect: ($) => choice($.identifier, $.type_identifier, $.qualified_type_name),
  empty_effect: (_$) => seq("{", "}"),
  grouped_effect: ($) => seq("(", $._effect_expression, ")"),
  union_effect: ($) => prec.left(1, seq($._effect_expression, "|", $._effect_expression)),
  intersection_effect: ($) => prec.left(2, seq($._effect_expression, "&", $._effect_expression)),
  difference_effect: ($) => prec.left(3, seq($._effect_expression, "\\", $._effect_expression)),
  effect_parameter: ($) => seq("effect", field("name", choice($.type_identifier, $.identifier))),
};
