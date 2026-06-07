# Compatibility Policy

Tink work must assume two agent surfaces and two operating-system families by default:

- Claude Code and Codex are both supported surfaces.
- macOS and Windows are both supported operating systems.

This applies to command design, templates, documentation, fixtures, verification guidance, and install/update behavior.

## Practical Rules

- Do not add a feature that only works for Claude Code unless the Codex behavior is also defined.
- Do not add a feature that only works for Codex unless the Claude Code behavior is also defined.
- Do not rely on shell syntax, path separators, or command names that only work on one operating system without documenting the portable alternative.
- Prefer Node.js or Python test helpers for cross-platform checks when plain shell behavior would diverge.
- When paths are shown in docs or fixtures, prefer forward slashes for repo-relative paths and use platform-specific absolute paths only in examples that explicitly discuss one platform.
- When changing install behavior, verify both Claude Code command templates and Codex skill templates remain covered.
- When changing Claude Code command behavior, keep the root plugin command, installable command template, and repo-local `.claude` command copy aligned.
- When changing command behavior, define the matching Codex skill behavior or state why the command is Claude Code-only.

## Verification Baseline

Every new slice should ask:

1. What changes for Claude Code?
2. What changes for Codex?
3. Does this work on macOS?
4. Does this work on Windows?

If one of those answers is "not applicable", the reason should be explicit in the plan, contract, docs, or test notes.
