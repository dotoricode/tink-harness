# Graph Contracts And Guards

This note records the graph/hooks improvement now built into Tink.

## Problem

Large Markdown harnesses are useful for humans, but they should not be loaded by default. The agent should first know what kind of work it is doing, then load only the rules that matter.

## Contract First

For non-trivial runs, `/tink:cast` creates `.tink/current/contract.json`.

The contract names:

- `task_type`: code change, bug fix, release, publish, docs, research, and so on
- `risk`: public publish, external visibility, destructive change, secrets, broad contract change
- `success_conditions`: what must be true at the end
- `forbidden`: what must not happen
- `verification`: commands and manual checks required before final
- `evidence`: what the final answer should report

This gives Tink a small structured input instead of forcing every harness rule into prompt context.

## Rule Graph

`.tink/rules/index.json` is the first rule graph layer.

It is intentionally a repo-local JSON file, not an external graph database. The installer stays light, works on Windows, and remains easy to package for Claude Code and Codex.

The graph maps contract facts to:

- harness candidates
- verification checks
- guard candidates

Example: a `release` task with `public_publish` risk can select `ship`, `pre-publish-multi-agent-verify`, package dry-run checks, and a release verification guard candidate.

Nodes can also declare `load`, `phase`, `budget_cost`, and `keywords`.

- `mandatory` nodes load first when their contract facts match.
- `retrievable` nodes load only when their facts or keywords fit the task.
- `phase` groups guidance so a run does not repeat the same rule during classification, approval, verification, or guard promotion.
- `budget_cost` lets Tink prefer smaller context before reading Markdown bodies.

`/tink:cast` records loaded ids in `.tink/current/session.json` under `loaded_rule_ids_by_phase`. This is the small Writ-inspired part: keep the graph as JSON, dedupe by phase, and avoid loading every rule body.

## Verify

`/tink:verify` runs what the contract promised.

It reads `.tink/current/contract.json`, runs listed verification commands when safe, writes compact evidence to `.tink/current/verification.json`, and sends failed checks into `.tink/maintenance/weave-queue.json` as `check_failed` signals.

When required verification fails, is skipped, or is blocked, Tink also appends compact friction to `.tink/maintenance/friction.jsonl` when that file exists. `/tink:weave` can use repeated friction to propose harness edits, rule graph updates, or opt-in guard candidates.

## Hooks

The default hook remains advisory-only. It suggests `/tink:cast` for complex prompts and does not block tools or save memory.

Enforcement is opt-in. Repeated failures may become guard candidates through `/tink:weave`, but installing `PreToolUse`, `PostToolUse`, or `Stop` guards requires explicit approval.

This keeps the default experience light while still allowing important repeated failures to become real boundaries.
