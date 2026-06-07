# Work State Guide

Tink writes work state so a human can quickly answer four questions:

1. What task is this run trying to finish?
2. What context did it use?
3. What context did it intentionally leave out?
4. What evidence says the work is done?

This guide is a reading path for the files created by `/tink:cast`, `$tink:cast`, `/tink:verify`, and `$tink:verify`.

## Quick Reading Order

Start here when resuming, reviewing, or handing off a run:

1. `.tink/current/contract.json`
   - Read the task type, success conditions, forbidden actions, and required checks.
2. `.tink/current/context-pack.md`
   - Read the short human summary of selected files, docs, rules, and external sources.
3. `.tink/current/context-map.json`
   - Inspect the structured `included`, `excluded`, `signals`, and `external_context` entries.
4. `.tink/current/context-metrics-evaluation.json`
   - Check context-efficiency scores, formulas, numerators, denominators, evidence refs, measurement scope, and limits.
5. `.tink/current/excluded-context.md`
   - Check what was skipped because it was stale, unsafe, too broad, unavailable, or outside scope.
6. `.tink/current/verification.json`
   - Confirm pass, fail, blocked, or skipped checks and the final report.
7. `.tink/current/notes.md`
   - Read the last safe point, recovery notes, and compact verification summaries.

## How To Read Context

Use `context-pack.md` first. It should be readable without knowing the schema.

Use `context-map.json` when you need traceability:

- `included`: files, docs, sources, or artifacts that shaped the work.
- `excluded`: candidates intentionally left out.
- `signals`: repo signals, `context_graph_rule` selections, verification hints, unmatched paths, or other selection evidence.
- `external_context`: outside sources such as Figma, GitHub, official docs, dashboards, API responses, screenshots, attachments, or runbooks.

When context entries include Context Budget Ledger fields, read them this way:

- `role`: whether the context is primary, supporting, a verification target, or something to avoid next time.
- `cost`: relative cost for putting the entry in the first context pack.
- `reuse_signal`: whether similar future runs should reuse, treat as an example, or avoid the entry.
- `verification_link`: the check, evidence ref, or verification hint connected to the entry.
- `staleness`: a quick freshness signal.
- `evidence_kind`: whether the evidence is a file, doc, schema, test, external source, or another kind.

See `docs/context-budget-ledger.md` for the detailed rules.

`context-metrics-evaluation.json` explains how the score was produced. If `scope` is `fixture` or `current_run`, the value is measured only inside that boundary. Do not claim all user work has reached 90% without run-history or production telemetry evidence.

When `signals[]` includes `kind: "context_graph_rule"`, read it as a small changed-path clue selected by `/tink:cast` or `$tink:cast`. It should point to a stable `source_ref` such as `context_graph_lite.rules.claude-command-sync`, explain why related files were included, and stay internal to cast. It must not imply a public `tink index` command, watcher, generated cache, or hidden runtime index.

For external context, check:

- `source`
- `source_ref`
- `included`
- `excluded`
- `confidence`
- `sensitivity`
- `verification_hint`

The important habit is not to include more context. The important habit is to explain why the selected context was enough.

## How To Read Verification

Use `verification.json` to decide whether the work can be trusted.

- `result: "pass"` means all required checks passed.
- `result: "fail"` means a required check ran or was inspected and failed.
- `result: "blocked"` means a required check could not run or could not be inspected.
- `status: "skipped"` is acceptable only for optional checks. A required skipped check is blocked.

The `report` object is the human-facing summary:

- `result_line`: one-line result.
- `checked`: what was checked.
- `problems`: what failed or looked wrong.
- `remaining`: what is still open.
- `next_action`: the smallest useful next step.

## What Good Looks Like

A good run state has these properties:

- The contract says what done means.
- The context pack explains the selected context in plain language.
- The context map can trace every important file, source, and verification hint.
- The excluded context file makes skipped or unsafe inputs visible.
- Verification evidence is compact and repeatable.
- Notes say the last safe point and next action.

## What To Avoid

- Do not paste raw logs or full diffs into run state.
- Do not store secrets, tokens, private payloads, request bodies, or broad external dumps.
- Do not treat external context as verified unless a check or evidence item confirms it.
- Do not invent checks from repo signals. If no hint matches, record `unmatched_path`.
- Do not create a new command surface just to summarize state. Improve existing docs, `$tink:list`, or `$tink:verify` output first.

## Compatibility Baseline

Work state must be useful from both Claude Code and Codex. Checks should stay portable across macOS and Windows by preferring repo-relative paths and `npm`, `node`, or `python` commands.
