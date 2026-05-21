# Hooks

Tink may use a Claude Code prompt hook as an optional recommendation layer.

The hook should:

- read the user prompt
- read `.tiny/harnesses/index.json`
- suggest 1-4 harnesses
- ask for approval

The hook should not:

- auto-apply harnesses
- save memory without approval
- run commands without approval
- load all harnesses by default

If hook support changes, use `/tiny:use` as the stable path.
