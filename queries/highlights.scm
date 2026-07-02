; =============================================================================
; Gia — tree-sitter highlights
; Follows nvim-treesitter capture conventions.
; =============================================================================

; ---------------------------------------------------------------------------
; Comments
; ---------------------------------------------------------------------------

(line_comment) @comment
(doc_comment) @comment.documentation

; ---------------------------------------------------------------------------
; Keywords
; ---------------------------------------------------------------------------

[
  "fn"
  "impure"
  "actor"
  "trait"
  "struct"
  "enum"
  "type"
  "impl"
  "mutator"
  "reader"
  "import"
  "defer"
  "context"
  "capability"
  "extends"
] @keyword

(visibility_modifier) @keyword.modifier
[ "opaque" ] @keyword.modifier

[ "let" ] @keyword.storage

[ "return" ] @keyword.return

[ "if" "else" "case" ] @keyword.conditional

(loop_expression "loop" @keyword.repeat)
(break_expression "break" @keyword.repeat)
(continue_expression) @keyword.repeat

[ "where" "with" "for" "as" ] @keyword

; ---------------------------------------------------------------------------
; Operators
; ---------------------------------------------------------------------------

; Actor send & pipe get distinct captures so themes can color them
; individually (they fall back to @operator in editors that don't).
"~>" @operator.send.write          ; write to an actor
"<~" @operator.send.read           ; read from an actor
"|>" @operator.pipe                ; pure pipeline
"?" @operator                      ; try / error propagation
[ "->" "=>" ".." "..=" ] @operator
[
  "+" "-" "*" "**" "/" "%"
  "==" "!=" "<" ">" "<=" ">="
  "&&" "||" "!"
  "&" "|" "\\"
  "="
] @operator

; ---------------------------------------------------------------------------
; Punctuation
; ---------------------------------------------------------------------------

[ "(" ")" "[" "]" "{" "}" "#{" ] @punctuation.bracket
[ "," ";" ":" "::" "." "@" ] @punctuation.delimiter

; ---------------------------------------------------------------------------
; Types
; ---------------------------------------------------------------------------

(type_identifier) @type
(named_type (type_identifier) @type)
(generic_type name: (type_identifier) @type)
(function_type "fn" @type.builtin)

((named_type (identifier) @type.builtin)
  (#any-of? @type.builtin
    "bool" "char" "u8" "u16" "u32" "u64" "u128" "usize"
    "i8" "i16" "i32" "i64" "i128" "isize" "f32" "f64")
  (#set! priority 110))

; Uppercase builtin types
((type_identifier) @type.builtin
  (#any-of? @type.builtin "String" "Unit" "Never")
  (#set! priority 110))

; Self is a type keyword
((type_identifier) @type.builtin
  (#eq? @type.builtin "Self"))

; ---------------------------------------------------------------------------
; Declarations — names
; ---------------------------------------------------------------------------

(function_declaration name: (identifier) @function)
(actor_handler name: (identifier) @function.method)
(actor_method_signature name: (identifier) @function.method)
(trait_declaration name: (type_identifier) @type)
(type_alias_declaration name: (type_identifier) @type)
(struct_declaration name: (type_identifier) @type)
(enum_declaration name: (type_identifier) @type)
(actor_struct_declaration name: (type_identifier) @type)
(actor_trait_declaration name: (type_identifier) @type)

; ---------------------------------------------------------------------------
; Imports
; ---------------------------------------------------------------------------

((import_path
  (import_segment
    [ "mod" "pkg" ] @keyword.modifier))
  (#set! priority 115))

((import_path
  (import_segment
    (identifier) @module))
  (#set! priority 115))

((import_path
  (import_segment
    (type_identifier) @module))
  (#set! priority 115))

((import_item "self" @variable.builtin)
  (#set! priority 115))

((import_item
  (identifier) @variable.import)
  (#set! priority 115))

((import_item
  (type_identifier) @type)
  (#set! priority 115))

((import_item
  alias: (identifier) @variable.import)
  (#set! priority 115))

((import_item
  alias: (type_identifier) @type)
  (#set! priority 115))


; ---------------------------------------------------------------------------
; Calls
; ---------------------------------------------------------------------------

(call_expression
  callee: (identifier) @function.call)
(call_expression
  callee: (field_expression name: (identifier) @function.method.call))
(call_expression
  callee: (path_expression name: (identifier) @function.call))

; ---------------------------------------------------------------------------
; Variables & fields
; ---------------------------------------------------------------------------

(identifier) @variable
(self) @variable.builtin

; Parameters
(parameter name: (identifier) @variable.parameter)
(capability_parameter name: (identifier) @variable.parameter)

; Struct fields
(struct_field name: (identifier) @variable.member)
(field_expression name: (identifier) @variable.member)
(field_initializer name: (identifier) @variable.member)
(field_pattern name: (identifier) @variable.member)

; Call-site argument labels
(labeled_argument label: (identifier) @variable.parameter)

; ---------------------------------------------------------------------------
; Patterns
; ---------------------------------------------------------------------------

(wildcard_pattern) @character.special      ; _
(rest_pattern) @operator

; Enum variants in patterns
(variant_pattern name: (type_identifier) @constructor)

; ---------------------------------------------------------------------------
; Constructors (enum variants in expression context)
; ---------------------------------------------------------------------------

; Bare uppercase identifier used as a value (unit variant)
; Covered by @type capture above; add a constructor override for call positions.
(call_expression
  callee: (type_identifier) @constructor)
(call_expression
  callee: (path_expression name: (type_identifier) @constructor))

; Struct expression
(struct_expression name: (type_identifier) @constructor)

; ---------------------------------------------------------------------------
; Attributes
; ---------------------------------------------------------------------------

(attribute "@" @attribute)
(attribute name: (identifier) @attribute)

; ---------------------------------------------------------------------------
; Literals
; ---------------------------------------------------------------------------

(integer_literal) @number
(float_literal) @number.float
(string_literal) @string
(escape_sequence) @string.escape
(char_literal) @character
(boolean_literal) @boolean
