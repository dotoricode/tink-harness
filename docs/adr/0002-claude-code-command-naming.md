# ADR 0002: Claude Code command naming

## Status

Accepted

## Context

Tink originally documented commands as `/tink:setup`, `/tink:forge`, `/tink:list`, `/tink:purge`, and `/tink:hone`.

Claude Code custom commands are created from markdown filenames. A nested file such as `.claude/commands/tink/forge.md` does not reliably create `/tink:forge`; in current Claude Code behavior it can be unavailable under that name or appear as a different command. On Windows, a literal `tink:forge.md` filename is also not portable.

The trade-off is between the nicer namespace-style spelling and commands that are actually recognized across platforms.

## Decision

Use flat, portable command filenames and names:

- `/tink-setup`
- `/tink-forge`
- `/tink-list`
- `/tink-purge`
- `/tink-hone`

The installer copies internal command templates from `templates/claude/commands/tink/*.md` to installed files named `.claude/commands/tink-*.md`.

The installer also removes the old installed `.claude/commands/tink/` directory so users do not get confusing orphan commands such as `/forge` or missing `/tink:forge` behavior.

## Consequences

- Commands are less pretty than the colon namespace form.
- Commands work with Claude Code's filename-based command discovery.
- Command files remain portable on Windows.
- Existing users must reinstall Tink once to replace the legacy nested command files.
- Public docs and hook suggestions must use `/tink-forge`, not `/tink:forge`.
