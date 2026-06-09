# Harness Lifecycle Signals

Harness lifecycle signals are a plain health summary for reusable harnesses.
They help Tink read past run records and answer simple questions:

- Which harnesses are being used?
- Where did checks fail or get blocked?
- Which harnesses may need a small weave improvement?
- Which harnesses may be cleanup or merge candidates?

The schema lives at `templates/tink/schemas/harness-lifecycle.schema.json`.

Useful signals:

- `uses`: how often the harness was selected.
- `successes`: runs that reached required verification.
- `failures`: required checks that failed.
- `blocked`: checks that could not run.
- `last_used`: the latest known run time, or `null` when no run record exists.
- `success_rate`: successful verified runs divided by uses, or `null` when there is not enough evidence.
- `failure_rate`: failed required checks divided by uses, or `null` when there is not enough evidence.
- `co_used_with`: harnesses that often appeared in the same run.
- `sequence_hints`: repeated order hints, such as one harness usually being followed by verification.
- `context_cost`: low, medium, high, or unknown.

Allowed recommendations:

- `keep`
- `weave`
- `frog_candidate`
- `merge_candidate`
- `observe`

Evidence should stay conservative:

- no records or weak evidence -> `observe`
- repeated failed or blocked checks -> `weave`
- repeated overlap -> `merge_candidate`
- strong non-use, rejection, replacement, or high-cost failure evidence -> `frog_candidate`

Recommendations are only suggestions. Deleting, merging, rewriting, saving memory, or updating rules still requires explicit approval. A lifecycle summary may prepare the next action, but it must not apply it automatically.

This is not a watcher, hidden cache, or new public `tink index` command. The source of truth remains the visible files under `.tink/runs/`, `.tink/maintenance/`, `.tink/harnesses/`, and `.tink/rules/`.
