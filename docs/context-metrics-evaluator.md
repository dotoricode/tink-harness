# Context Metrics Evaluator

Context Metrics Evaluator is a test-backed way to calculate the ratios recorded by Context Budget Ledger.

It is not a new public command. It must not add a `tink index` command, watcher, generated cache, or hidden runtime index. At this stage, `tests/fixtures/current-run/context-metrics-evaluation.json` and `tests/test_templates.py` must calculate the same scores.

Korean companion: `docs/context-metrics-evaluator.ko.md`.

## Why It Exists

If `context-map.json.efficiency_metrics` is only hand-written, the numbers can look better than the evidence. The evaluator re-reads the fixtures and calculates:

- Excluded context with `role`, `cost`, `reuse_signal`, `staleness`, and `reason`.
- Included context with `role` and `cost`, with high-cost entries justified by `verification_link`.
- Included context with both `role` and `verification_link`.
- `verification_target` entries linked to known verification commands or hints.
- Repeated path-cases with expected context roles.
- Context-diff changes traceable through verification links and metric impacts.

## What The Score Means

In `fixture-ratio-v1`, a score at or above 90% means the example artifacts are internally measurable and have very few missing fields.

It does not mean that every real user run has reached 90% efficiency. Until production telemetry or multiple run records exist, the measurement scope stays `fixture`.

## Done Criteria

- All six metrics are at or above 90% under the fixture calculation.
- `context-map.json.efficiency_metrics.scores[]` matches `context-metrics-evaluation.json`.
- Each score has `formula`, `numerator`, `denominator`, `evidence_refs`, and `limit`.
- `measurement_status` may be `measured` for fixture calculations, but the docs must state the limit.

## Compatibility

- Claude Code and Codex read the same artifacts.
- macOS and Windows are both verified through `npm test`.
- Reusable memory, harness, rule, and config saves still require explicit approval.
- Sentry and release evidence bundling are out of scope.
