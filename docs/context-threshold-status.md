# Context Threshold Status

Context Threshold Status is a compact status board for checking whether all six context efficiency metrics meet the 90 percent target.

The current status compares `tests/fixtures/current-run/context-metrics-evaluation.json` with `tests/fixtures/maintenance/context-metrics-rollup.json`. In plain terms, it checks both the single current-run fixture and the representative run-history rollup.

This is not a new public command. It does not create a `tink index` command, watcher, generated cache, or hidden runtime index. It also does not collect user repository data automatically.

Korean documentation is available in `docs/context-threshold-status.ko.md`.

## Current Status

| Metric | Current run | Rollup average | Rollup minimum | Status |
| --- | ---: | ---: | ---: | --- |
| unnecessary_context_reduction | 100% | 97% | 94% | >= 90% |
| initial_context_pack_size_reduction | 100% | 95% | 92% | >= 90% |
| review_evidence_lookup_time_reduction | 100% | 98% | 96% | >= 90% |
| verification_omission_detection | 100% | 99% | 98% | >= 90% |
| repeated_context_reuse_accuracy | 100% | 96% | 94% | >= 90% |
| rework_probability_reduction | 100% | 95% | 91% | >= 90% |

## Why This Exists

Without this status board, a reviewer has to infer what the 90 percent claim means from several separate files.

- The current-run fixture checks whether the latest artifact shape is complete.
- The run-history rollup checks whether repeated work stays above the target.
- The minimum score catches a single work unit falling below 90 percent.

## Limits

This status is based on repository fixtures and representative run-history fixtures. It is not production telemetry.

Do not claim production-wide 90 percent performance until enough real `.tink/runs/*` records are accumulated and rolled up with the same formulas.

## Completion Criteria

- All six current-run scores are at least 90 percent.
- All six rollup averages are at least 90 percent.
- All six rollup minimums are at least 90 percent.
- `limits` clearly states that this is not production telemetry.
- Claude Code and Codex can read the same artifact names and metric names.
- macOS and Windows can verify the status with `npm test`.
