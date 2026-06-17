function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

function sepTrailing(sep, rule) {
  return optional(seq(rule, repeat(seq(sep, rule)), optional(sep)));
}

module.exports = {
  commaSep,
  commaSep1,
  sepTrailing,
};
