# Planned Work Units

This document restates the remaining roadmap as work units instead of numbered phases. Each unit should support Claude Code and Codex, work on macOS and Windows, and avoid new public command surfaces unless the user explicitly asks for one.

## Management Rule

Broad ideas should not enter the implementation list directly. First narrow them into requirements, success criteria, out-of-scope boundaries, and verification evidence. Once a work unit is implemented, remove it from this active list and record the completion in the implemented baseline, PR docs, changelog, or another completion record.

## Implemented Baseline

### Harness Lifecycle Signals

The first harness health summary is now implemented as visible files and read-only helpers.

- Generate `.tink/maintenance/harness-lifecycle.json` from visible harness, rule, memory, run, weave, and friction records.
- Track use, success, failure, blocked, context cost, co-use, sequence hints, rule refs, memory refs, graph relationships, timeline events, candidate score, and lifecycle state.
- Render a static local HTML health report with graph overview, recent run timeline, and one card per harness.
- Treat dormant usage as an archive review signal, not delete evidence.
- Never delete, merge, rewrite, archive, save memory, or update rules without approval.

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

## Direct CLI and Dashboard Commands

Make the standalone CLI easier to type and make the local health report easier to open.

- Treat `tink-harness update`, `tink-harness install`, and future `tink-harness dashboard` as the preferred direct command form after the binary is installed on `PATH`.
- Keep `npx tink-harness@latest ...` as the bootstrap path for users who have not installed the binary yet.
- Verify direct `tink-harness` command shims on Windows and macOS before replacing README examples wholesale.
- Add a `dashboard` command that runs the existing lifecycle summary generator and HTML report renderer in one step.
- Keep `dashboard` local and static by default: no server, watcher, hidden cache, or automatic harness edits.
- Allow an optional open/export flag only after the generated file path behavior is stable across platforms.

## Evidence Split / Parallel Evidence

Before adding parallel workers, add Evidence Split to Tink's default work loop. Tink should not become a separate multi-agent runtime; it should first make large work divisible into small evidence packets. The research notes live in `docs/swarm-fast-lane.ko.md` and `docs/swarm-fast-lane.md`.

- `/tink:cast` and `$tink:cast` check whether work should split into `probe`, `patch`, `verify`, `review`, or `decision` packets before harness selection.
- During implementation, Tink re-splits work when uncertainty, failed checks, context sprawl, or coupled changes appear.
- Packets see only 1-3 inputs, not the whole task.
- If external workers are used later, they do not edit files by default; they return evidence and patch candidates.
- The main agent owns final patch selection, file edits, and verification.
- Success is measured by less main-agent context, less rework, earlier failure detection, and equal or better verification pass rate, not by claiming universal raw speed.
- The initial implementation is the core Evidence Split behavior; actual worker runtime remains deferred.
- Future worker output should be capped at 300 words and include evidence and confidence.
- Do not select it for unclear public contracts, secrets, broad repository scans, or same-file concurrent edits.

## Excluded

Release evidence bundling remains excluded. Release history, public release notes, and portfolio framing belong to the user or team. Tink may keep verification artifacts, but it should not decide how public release evidence is packaged.
