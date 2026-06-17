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
  "impl"
  "mutator"
  "reader"
  "import"
  "init"
  "defer"
] @keyword

(visibility_modifier) @keyword.modifier

[ "let" ] @keyword.storage

[ "return" ] @keyword.return

[ "if" "else" "case" ] @keyword.conditional

(loop_expression "loop" @keyword.repeat)
(break_expression "break" @keyword.repeat)
(continue_expression) @keyword.repeat

(async_expression "async" @keyword.coroutine)

[ "where" "with" "implements" "for" ] @keyword

; ---------------------------------------------------------------------------
; Operators
; ---------------------------------------------------------------------------

[ "~>" "<~" ] @operator            ; actor send
"|>" @operator                     ; pipe
[ "->" ".." "..=" ] @operator
[
  "+" "-" "*" "/" "%"
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

; Self is a type keyword
((type_identifier) @type.builtin
  (#eq? @type.builtin "Self"))

; ---------------------------------------------------------------------------
; Declarations — names
; ---------------------------------------------------------------------------

(function_declaration name: (identifier) @function)
(actor_method name: (identifier) @function.method)
(actor_method_signature name: (identifier) @function.method)
(trait_declaration name: (type_identifier) @type)
(struct_declaration name: (type_identifier) @type)
(enum_declaration name: (type_identifier) @type)
(actor_declaration name: (type_identifier) @type)
(actor_trait_declaration name: (type_identifier) @type)


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
(actor_field name: (identifier) @variable.member)
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
