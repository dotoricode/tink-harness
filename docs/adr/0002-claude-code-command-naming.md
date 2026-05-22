# ADR 0002: Claude Code command naming

## Status

Accepted

## Context

Tink's intended command surface is namespaced:

- `/tink:setup`
- `/tink:cast`
- `/tink:list`
- `/tink:frog`
- `/tink:weave`

A previous implementation changed these to flat hyphen commands such as `/tink-forge` because standalone Claude Code commands are filename-based. That solved one portability concern, but it lost the product namespace and made Tink feel like a set of unrelated commands.

Claude Code plugins support namespaced commands. Plugin namespacing also avoids collisions with generic command names such as `/setup`, `/list`, `/forge`, `/purge`, or `/hone`.

## Decision

Use a plugin-first command surface under the `tink` namespace:

- `/tink:setup`
- `/tink:cast`
- `/tink:list`
- `/tink:frog`
- `/tink:weave`

The repository root is a Claude Code plugin with `.claude-plugin/plugin.json`, `commands/*.md`, and `skills/tink/SKILL.md`.

The `npx` installer keeps a standalone compatibility path by copying command templates to `.claude/commands/tink/*.md`. It also removes the earlier flat hyphen files:

- `.claude/commands/tink-setup.md`
- `.claude/commands/tink-forge.md`
- `.claude/commands/tink-list.md`
- `.claude/commands/tink-purge.md`
- `.claude/commands/tink-hone.md`

## Consequences

- Public docs and hook suggestions use `/tink:*`.
- Tink keeps a clear product namespace in Claude Code.
- Generic command collisions are avoided.
- Command files remain portable on Windows because no filename contains `:`.
- Existing users who installed the flat hyphen commands should reinstall once to clean up old command files.
