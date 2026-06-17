; =============================================================================
; Gia — locals (scope / reference tracking for nvim-treesitter)
; =============================================================================

; ---------------------------------------------------------------------------
; Scopes
; ---------------------------------------------------------------------------

(function_declaration) @local.scope
(closure_expression) @local.scope
(block) @local.scope
(if_expression) @local.scope
(case_arm) @local.scope
(loop_expression) @local.scope

; ---------------------------------------------------------------------------
; Definitions
; ---------------------------------------------------------------------------

; Function name
(function_declaration name: (identifier) @local.definition)

; let binding — identifier directly in pattern position is a binding
(let_statement pattern: (identifier) @local.definition)
(let_statement pattern: (tuple_pattern (identifier) @local.definition))
(let_statement pattern: (list_pattern (identifier) @local.definition))

; Case arm bindings
(case_arm pattern: (identifier) @local.definition)

; Function parameters
(parameter name: (identifier) @local.definition)

; Closure parameters
(closure_expression (identifier) @local.definition)

; ---------------------------------------------------------------------------
; References
; ---------------------------------------------------------------------------

(identifier) @local.reference
