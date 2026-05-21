# Hooks

Tink may use a Claude Code prompt hook as an optional recommendation layer.

The hook should:

- read the user prompt
- read `.tink/harnesses/index.json`
- suggest when `/tink:forge` would help
- stay advisory-only
- keep a hook recommendation to one line or shorter
- ask for approval

The hook should not:

- auto-apply harnesses
- save memory without approval
- run commands without approval
- load all harnesses by default
- intercept other slash skills such as `/grill-me`

Default recommendation: keep hooks off and use `/tink:forge` directly until the hook behavior is clearly useful.

Terminology:

- Inline Calibration: habit-aware recommendation inside `/tink:forge`; this is the default.
- Hook Recommendation: optional general-prompt recommendation when the hook is explicitly enabled; it is advisory-only, short, and never applies or saves anything by itself.
