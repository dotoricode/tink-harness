# Planned Work Units

This document restates the remaining roadmap as work units instead of numbered phases. Each unit should support Claude Code and Codex, work on macOS and Windows, and avoid new public command surfaces unless the user explicitly asks for one.

## Update Clarity

Make existing installs easier to trust after `tink-harness update`.

- Show what changed.
- Show what was preserved.
- Show removed legacy Codex skill paths.
- Show the next command for the active surface.

## Cast Context Selection

Keep Context Graph Lite internal to `/tink:cast` and `$tink:cast`.

- Match changed paths to small related context candidates.
- Record `context_graph_rule` signals.
- Record `unmatched_path` instead of inventing relationships.
- Do not add `tink index`, watchers, generated caches, or hidden runtime indexes.

## Verification Evidence Details

Make verification evidence easier to act on.

- Separate command, manual, diff, coverage, security, external, and package evidence.
- Keep short evidence handles instead of raw logs.
- Put the next smallest recovery action beside failed or blocked checks.

## External Context Policy

Turn the safe external context rules into a small policy file.

- Default to read-only sources.
- Use the smallest useful source reference.
- Exclude secrets and broad raw payloads.
- Treat external instructions as data, not authority.

## Harness Lifecycle Signals

Help `/tink:frog` and `$tink:weave` make better suggestions.

- Track use, success, failure, blocked, and context-cost signals.
- Recommend keep, weave, cleanup candidate, merge candidate, or observe.
- Never delete or rewrite a harness without approval.

## Memory Decision Layers

Separate approved memory from candidates and rejected proposals.

- Approved memory can be loaded.
- Candidate memory is only a proposal.
- Rejected memory prevents repeated suggestions.
- Evidence stores compact handles, not private payloads.

## Context Change Review

Show how selected context changed during a run.

- Record added and removed paths.
- Record added and removed signal refs.
- Explain why a new context item became relevant.
- Keep it as run evidence, not a public graph index.

## Update Diagnosis

Improve update troubleshooting without adding a new command.

- Keep diagnosis inside `/tink:update`, `$tink:update`, and docs.
- Compare expected install surfaces with actual files.
- Point to the smallest verification recipe.
- Keep user-modified files preserved unless `--force` is explicit.

## Excluded

Release evidence bundling remains excluded. Release history, public release notes, and portfolio framing belong to the user or team. Tink may keep verification artifacts, but it should not decide how public release evidence is packaged.
