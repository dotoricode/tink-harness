# Harness Lifecycle Signals

Harness lifecycle signals help Tink decide whether to keep observing a harness, improve it, suggest cleanup, or suggest merging overlapping harnesses.

The schema lives at `templates/tink/schemas/harness-lifecycle.schema.json`.

Useful signals:

- `uses`: how often the harness was selected.
- `successes`: runs that reached required verification.
- `failures`: required checks that failed.
- `blocked`: checks that could not run.
- `context_cost`: low, medium, high, or unknown.

Allowed recommendations:

- `keep`
- `weave`
- `frog_candidate`
- `merge_candidate`
- `observe`

Recommendations are only suggestions. Deleting, merging, or rewriting a reusable harness still requires explicit approval.
