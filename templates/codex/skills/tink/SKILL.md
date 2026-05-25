---
name: tink
description: Self-growing harnesses for Codex. Use when the user invokes $tink or wants to cast, verify, list, frog, weave, update, or maintain reusable task harnesses in .tink.
---

# Tink

Tink helps Codex choose the smallest useful harness, materialize it as visible run state, and start the work. It keeps reusable workflow knowledge in `.tink/` so the harness set can improve through approved use.

## Command surface

Use `$tink <action>` as the Codex interface:

- `$tink setup`: configure language, install scope, git tracking, and local policy.
- `$tink cast <task>`: choose or draft the right harness, create run state, and start the first safe step.
- `$tink verify`: run the checks promised in `.tink/current/contract.json` and record evidence.
- `$tink list`: inspect harnesses and lightweight usage signals.
- `$tink frog`: propose unused or redundant harness removal. Never delete without approval.
- `$tink weave`: improve active harnesses based on real use, failures, and corrections.
- `$tink update`: detect install source and show the safe update command.

If the user says `$tink` without an action, treat it as `$tink cast` for non-trivial work and `$tink list` only when they ask what is available.

## Operating rules

1. Create or update `.tink/current/contract.json` for non-trivial runs: task type, risks, success conditions, forbidden actions, verification, and evidence.
2. Read `.tink/rules/index.json` before loading harness bodies when it exists. Use contract facts to choose only relevant harnesses, checks, and opt-in guard candidates. Load matching `mandatory` rules first, retrieve only relevant `retrievable` rules by facts or keywords, and record loaded rule ids by phase in `.tink/current/session.json`.
3. Read `.tink/harnesses/index.json` before loading harness bodies.
4. Read approved memory files when present and useful: `.tink/memory/mistakes.md`, `preferences.md`, and `lessons.md`.
5. Prefer the smallest useful harness set. Use context footprint, not a universal hard cap.
6. If `.tink/current/` exists and continuity is uncertain, read `plan.md`, `checks.md`, `steps.json`, `notes.md`, `answers.md`, and `contract.json` when present; summarize goal, last safe point, next step, open questions, and verification; then ask resume/archive/replace/cancel before continuing.
7. Run the synthesis probe before committing to `.tink/current/`. Strong fit keeps the harness; generic fit adds a run-only draft; no fit loads `harness-synthesis`.
8. If too many tools, skills, agents, or harnesses are available, use `harness-curation` to choose the smallest effective set before loading more context.
9. Run Stitch once before committing to `.tink/current/`: evaluate every time, show exactly one proposal only for high-impact quality or safety branches, and use the configured language.
10. Use `request_user_input` for choice prompts when available. Otherwise ask one concise blocking question directly.
11. Treat reusable saves as a separate hard approval gate for `.tink/memory/*`, `.tink/harnesses/*`, `.tink/rules/*`, `.tink/config.json`, Codex skill files, and template/plugin files that affect future installs.
12. Current-run approval never authorizes reusable-state writes. Before saving reusable state, show operation, destination files, exact entry or patch summary, reusable reason, sensitive content excluded, and rollback/removal path.
13. After approval, create `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`, `answers.md`, `contract.json`, and `session.json`.
14. Do not stop at recommendation. Execute the first safe step after run state exists.
15. Run `$tink verify` behavior before final when `contract.json` lists required checks.
16. Store reusable memory or rule updates under `.tink/` only after separate approval.
17. If a check fails, update `.tink/current/notes.md`, state the failure, last safe point, and next single action. Append compact friction to `.tink/maintenance/friction.jsonl` when it exists. Feed repeated failures to `$tink weave`.
18. Keep context compact. Do not paste raw logs or full diffs.
19. Use calm, clear, concise language. Prefer plain everyday words over technical terms. No jokes.

## Harness procedure

For `$tink cast`, classify the task as code change, bug fix, research, review, docs, ship/release, or new pattern. Load only selected harness bodies after approval. If no built-in harness fits, use `harness-synthesis` to draft a narrow run-only harness instead of forcing a generic fit.

Create run state before deeper work:

- `plan.md`: goal, selected harnesses, assumptions, scope, out-of-scope, next steps
- `checks.md`: done criteria, verification commands, evidence required before final
- `steps.json`: machine-readable steps with `pending`, `in_progress`, `done`, or `blocked`
- `notes.md`: short working notes, failures, last safe point, recovery actions
- `answers.md`: user answers or inferred defaults used for this run
- `contract.json`: structured task contract used by rule selection and verification
- `session.json`: loaded rule ids by phase and lightweight retrieval metadata

Append a compact `.tink/runs/YYYY-MM-DD-HHMM-<slug>.md` record when the task completes, is canceled, is blocked, or is superseded. Do not store secrets, raw logs, full diffs, or one-off private context.

## Save approval payload

Before saving memory, a new harness, a harness edit, or index metadata, show:

- operation
- destination files
- exact entry text or patch summary
- why it is reusable
- sensitive/private content excluded
- evidence handles
- rollback or removal path
- approval ledger entry path: `.tink/maintenance/ledger.jsonl`

Do not save if the user approved only the current run.

## Quality bar

A successful Tink run leaves evidence: current run files exist or were intentionally archived, checks were verified or explicitly blocked, the final answer reports changed files and evidence, and reusable learning is proposed only when it will matter again.
