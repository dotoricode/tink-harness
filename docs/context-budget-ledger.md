# Context Budget Ledger

Context Budget Ledger is a small record format that helps Tink score why context was included, excluded, reused, or linked to verification.

It is not a new public command. It must not add a `tink index` command, watcher, generated cache, or hidden runtime index. It only enriches the existing `context-map.json` and `context-diff.json` artifacts created by `/tink:cast` and `$tink:cast`.

Korean companion: `docs/context-budget-ledger.ko.md`.

## Why It Exists

The current context map can explain included and excluded context. It needs a little more structure to answer repeated-run questions:

- Is this context primary, supporting, or a verification target?
- Is it expensive for the first context pack?
- Should similar future runs reuse it or avoid it?
- Which check or evidence proves it matters?
- Is the information fresh or stale?

Context entries can now include optional fields:

- `role`: `primary`, `supporting`, `verification_target`, `external_evidence`, `exclusion_candidate`, `example_only`, `stale`, `avoid_next_time`.
- `cost`: `low`, `medium`, `high`.
- `reuse_signal`: `always`, `often`, `rare`, `example_only`, `avoid_next_time`.
- `verification_link`: related check, evidence ref, or verification hint.
- `staleness`: `fresh`, `aging`, `stale`, `unknown`.
- `evidence_kind`: `file`, `doc`, `schema`, `test`, `command`, `external`, `signal`, `diff`, `unknown`.

## How To Use It

At cast time, use `role` and `cost` to keep the first context pack small.

During work, record late-added context in `context-diff.json`. A `verification_link` helps reviewers jump from context to the check that proves it matters.

After work, use `reuse_signal` and `staleness` to exclude weak or stale context faster in the next similar run.

Entries with `role: "verification_target"` should connect to a command, manual check, evidence ref, or verification hint. Missing links are verification omission candidates.

## Scoring

`context-map.json.efficiency_metrics` records the six context-efficiency metrics as 0-100% scores.

- Unnecessary context reduction: excluded entries with reuse and staleness evidence.
- Initial context pack size reduction: included entries prioritized by role and cost.
- Reviewer evidence lookup time reduction: included entries with both role and verification_link.
- Verification omission detection: verification_target entries with matching checks.
- Repeated context reuse accuracy: entries with reuse_signal and matching path-case reuse.
- Rework probability reduction: fewer late-added required context entries and missing checks.

If there is no runtime telemetry yet, mark the scores as `measurement_status: "estimated"` and include the limits. Do not claim 90% without evidence.

## Compatibility

- Claude Code and Codex read the same schema and fixtures.
- macOS and Windows are both supported; no OS-specific shell behavior is required.
- Reusable memory, harness, rule, and config saves still require explicit approval.
- Sentry and release evidence bundling are out of scope.
