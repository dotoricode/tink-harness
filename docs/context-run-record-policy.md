# Context Run Record Policy

Context Run Record Policy defines which real `.tink/runs/*` records can later be used for run-history rollup.

This is not a new public command. It does not create a `tink index` command, watcher, generated cache, or hidden runtime index. It also does not collect records automatically.

Korean documentation is available in `docs/context-run-record-policy.ko.md`.

## Why This Exists

The current 90 percent evidence is based on repository fixtures and representative run-history fixtures. That is not enough to claim production-wide 90 percent behavior across every real project.

Before moving to real run records, Tink needs a clear answer to these questions:

- Which `.tink/runs/*` records can be included in a rollup?
- Which data is sensitive or too broad and must be excluded?
- Are metric scores linked to verification evidence?
- Can Claude Code and Codex, on macOS and Windows, verify the same criteria?

## Records That Can Be Included

Included records must come from an approved current run and represent a completed work record.

- Run id or run path.
- Completion timestamp.
- Surface: Claude Code or Codex.
- Platform: macOS or Windows.
- Six metric scores shaped like `context-metrics-evaluation.json`.
- Verification result and check list.
- Short evidence handles.
- Explicit limits that say whether the record is production telemetry, a fixture, or a representative run.

## Records That Must Be Excluded

Do not include these in run-history rollup:

- Tokens, credentials, or raw private payloads.
- Full private issue text, whole dashboards, entire Figma files, or complete discussions.
- Unapproved reusable state changes under `.tink/memory/*`, `.tink/rules/*`, or `.tink/harnesses/*`.
- Sentry integration.
- Release evidence bundling.

## Completion Criteria

- All six metrics are present.
- Each metric score has evidence.
- Verification result and checks are linked.
- Limits clearly state whether the data is production telemetry.
- No new public command, watcher, generated cache, or hidden runtime index exists.
- macOS and Windows can verify the criteria with `npm test`.
