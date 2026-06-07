# Context Run History Rollup

Context Run History Rollup combines multiple `context-metrics-evaluation.json` scores to check whether the 90% target holds across repeated work.

It is not a new public command. It must not add a `tink index` command, watcher, generated cache, or hidden runtime index. At this stage, `tests/fixtures/maintenance/context-metrics-rollup.json` and `tests/test_templates.py` must calculate the same rollup scores.

Korean companion: `docs/context-run-history-rollup.ko.md`.

## Why It Exists

A single current run above 90% is useful, but it does not prove repeated work is stable. The rollup combines several runs and checks:

- Average score for each metric.
- Minimum score for each metric.
- Whether every run records all six metrics.
- Whether both average and minimum are at or above 90%.

## What The Score Means

`scope: "run_history"` means the score combines multiple run records.

The fixture rollup is not production telemetry. Until enough real `.tink/runs/*` records exist, describe it as representative run-history fixture evidence only.

## Done Criteria

- All six metrics have rollup averages at or above 90%.
- All six metrics have per-run minimums at or above 90%.
- Each score has `formula`, `numerator`, `denominator`, `evidence_refs`, and `minimum_percent`.
- `limits` states that the data is not production telemetry.

## Compatibility

- Claude Code and Codex read the same artifact names and metric names.
- macOS and Windows are both verified through `npm test`.
- Reusable memory, harness, rule, and config saves still require explicit approval.
- Sentry and release evidence bundling are out of scope.
