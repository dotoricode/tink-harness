# Verification Evidence Details

Verification should explain what kind of proof exists, not only whether a check passed.

Use `templates/tink/schemas/verification.schema.json` fields:

- `evidence_kind`: command, manual, diff, coverage, security, external, package, or unknown.
- `evidence_ref`: a compact pointer such as `npm test`, `docs/work-state.md`, `source_ref`, or a PR check URL.
- `observed`: a short statement of what the evidence showed.
- `next_action`: the smallest useful recovery step when a required check fails or is blocked.

Do not paste raw logs or full diffs. If detail is needed, cite a file, check name, source ref, or external handle.

This must behave the same from Claude Code `/tink:verify` and Codex `$tink:verify`, with portable commands for macOS and Windows.
