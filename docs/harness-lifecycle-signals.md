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
- `rule_refs`: rule ids that appeared in the same run records.
- `memory_refs`: memory files that appeared in the same run records.
- `context_cost`: low, medium, high, or unknown.

The summary also includes a small `graph` block for later reports and dashboards:

- `graph.nodes`: harness, rule, memory, and stage nodes.
- `graph.edges`: relationships such as `co_used`, `sequence`, `uses_rule`, and `uses_memory`.

This graph is derived from the same visible records. It is a view model, not a hidden cache or background index.

The `timeline` block lists recent run events in newest-first order with date, source, status, outcome, and selected harnesses. It helps the HTML report show when failures, blocked runs, and successful verification happened without replaying files in the browser.

Allowed recommendations:

- `keep`
- `weave`
- `frog_candidate`
- `merge_candidate`
- `observe`

Each harness may also include `candidate_score`. This is an explainable sorting aid with a `total` from 0 to 100 and named factors such as evidence, trouble, context cost, overlap, and recommendation priority. It is not approval and must not trigger automatic edits.

Each harness also has a `lifecycle_state`:

- `active`: recent enough to keep watching normally.
- `no_evidence`: no run record mentions it.
- `dormant_candidate`: not used recently, but age alone is only an archive review signal.
- `cleanup_review`: strong cleanup evidence exists, still requiring approval.
- `needs_weave`: repeated trouble suggests a weave review.
- `merge_review`: repeated overlap suggests a merge review.

Evidence should stay conservative:

- no records or weak evidence -> `observe`
- repeated failed or blocked checks -> `weave`
- repeated overlap -> `merge_candidate`
- strong non-use, rejection, replacement, or high-cost failure evidence -> `frog_candidate`

Recommendations are only suggestions. Deleting, merging, rewriting, saving memory, or updating rules still requires explicit approval. A lifecycle summary may prepare the next action, but it must not apply it automatically.

## Local HTML Report

Installed repos also receive two small read-only helpers. First, generate the JSON summary from visible `.tink/` records:

```bash
node .tink/tools/generate-harness-lifecycle-summary.mjs
```

By default it reads `.tink/harnesses/index.json`, `.tink/rules/index.json`, `.tink/memory/*.md`, `.tink/runs/*.md`, `.tink/maintenance/weave-queue.json`, and `.tink/maintenance/friction.jsonl`, then writes `.tink/maintenance/harness-lifecycle.json`.

Then turn that summary into a local HTML report:

```bash
node .tink/tools/render-harness-health-report.mjs
```

The report helper reads `.tink/maintenance/harness-lifecycle.json` and writes `.tink/maintenance/harness-health-report.html`. You can pass explicit paths when testing:

```bash
node .tink/tools/generate-harness-lifecycle-summary.mjs repo-root output.json
node .tink/tools/render-harness-health-report.mjs input.json output.html
```

Both helpers are read-only with respect to reusable Tink state. They write only the requested summary or report file. They do not edit, merge, archive, delete, save memory, or update rules.

`/tink:weave` and `/tink:frog` should prepare this summary before ranking candidates when the generator is installed. The summary helps sort candidates by evidence strength, but the commands still show the normal approval payload before any reusable change.

This is not a watcher, hidden cache, or new public `tink index` command. The source of truth remains the visible files under `.tink/runs/`, `.tink/maintenance/`, `.tink/harnesses/`, and `.tink/rules/`.
