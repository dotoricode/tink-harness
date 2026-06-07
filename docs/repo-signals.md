# Repo Signals

Repo signals are small, static hints that help `/tink:cast` choose context and verification without adding a new command surface.

They are not a generated index, not a cache, and not a `tink index` command. In this phase, repo signals live in fixtures so the behavior can be reviewed and tested before any runtime automation exists.

Repo signals follow the project compatibility baseline in `docs/compatibility-policy.md`: Claude Code and Codex must both be considered, and macOS and Windows must both remain supported.

## Purpose

Repo signals answer three questions:

1. Which files usually move together?
2. Which checks prove those files stayed consistent?
3. Which changed paths are unknown to the current signal set?

This lets Tink explain why a file was included in `context-map.json`, why a verification check was selected in `contract.json`, and when no check should be invented.

## Current Fixtures

- `tests/fixtures/repo-signals/tink-harness.json`: stable repo facts such as sync groups, instruction files, schema files, command surface, and verification hints.
- `tests/fixtures/repo-signals/path-cases.json`: examples of changed paths and the verification hints they should select.
- `tests/fixtures/current-run/context-map.json`: an example of context signals that cite repo signal sources.
- `tests/fixtures/current-run/contract.json`: an example of selected verification hints written as manual checks.

## Flow

The intended cast flow is:

```text
changed path
-> matching repo signal verification_hints
-> contract.verification.manual_checks[]
-> context-map.json signals
```

For example:

```text
commands/cast.md
-> verification_hints.command-template-sync
-> manual check: test_dual_format_paths_stay_in_sync
-> context-map signal: verification_hint
```

The contract records what must be checked. The context map records why that check was selected.

## Unmatched Paths

If a changed path matches no verification hint, Tink should not invent a check.

Instead, it records an `unmatched_path` signal in `context-map.json`.

Example:

```text
docs/memory.md
-> no matching verification hint
-> no manual check added
-> context-map signal: unmatched_path
```

This keeps Tink honest. Unknown context is still visible, but it does not create fake certainty.

## Boundaries

Repo signal fixtures are advisory inputs.

They must not:

- run commands;
- install tools;
- write files;
- create command surfaces;
- behave like a runtime indexer.

If runtime support is added later, it should preserve the same contract: signals explain context and verification choices, while checks still run through the normal verification flow.
