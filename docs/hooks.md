# Hooks

Tink may use a Claude Code prompt hook as an optional recommendation layer.

The hook should:

- read the user prompt
- read `.tink/harnesses/index.json`
- suggest when `/tink:forge` would help
- ask for approval

The hook should not:

- auto-apply harnesses
- save memory without approval
- run commands without approval
- load all harnesses by default
- intercept other slash skills such as `/grill-me`

Default recommendation: keep hooks off and use `/tink:forge` directly until the hook behavior is clearly useful.
