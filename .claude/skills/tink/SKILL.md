---
name: tink
description: Self-growing harnesses for Claude Code. Use to forge, apply, prune, and hone task harnesses.
---

# Tink

Tink helps Claude forge the smallest useful harness, materialize it as run state, and start the work.

## Core philosophy
Tink is one self-growing skill, not a pile of commands and not a skill recommendation list.

It should:
1. understand the task,
2. choose or build the right harness,
3. apply it only after approval,
4. create `.tink/current/` run state before deeper work,
5. execute the first safe step after approval,
6. avoid repeating the same mistake,
7. remember reusable lessons only after approval,
8. keep the harness set small by purging or honing it over time.

## Command surface
Use only these commands:

- `/tink:setup`: configure language, scope, git tracking, and hook policy.
- `/tink:forge`: main path. Choose/build/synthesize a harness, create run state, start work, and propose reusable learning.
- `/tink:list`: inspect harnesses and lightweight usage signals.
- `/tink:purge`: propose unused or redundant harness removal. Never delete without approval.
- `/tink:hone`: improve active harnesses based on real use, failures, and corrections.

## Operating rules
1. Read `.tink/harnesses/index.json` before loading harness bodies.
2. Read small approved memory files when present: `.tink/memory/mistakes.md`, `preferences.md`, `lessons.md`.
3. Prefer the smallest useful harness set.
4. If no existing harness fits, use `harness-synthesis` to draft a narrow domain-specific harness instead of forcing a bad fit.
5. When research notes, examples, prior failures, or user corrections are available, extract behavior-shaping rules: triggers, decision rules, checks, stop conditions, recovery, and evidence.
6. Ask for approval before applying, saving, purging, or honing.
7. After approval, create `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`, and `answers.md`.
8. Do not stop at recommendation. Execute the first safe step after run state exists.
9. Store reusable memory under `.tink/memory/` only after approval.
10. If a check fails, update `.tink/current/notes.md`, state the failure, last safe point, and next single action.
11. Keep context compact. Do not paste raw logs or full diffs.
12. Use calm, clear, concise language. No jokes.

## Quality bar
The user should not have to repeat themselves. If the same mistake appears twice, propose `/tink:hone` or a memory update through `/tink:forge`.

A successful Tink run leaves evidence:
- current run files exist or were intentionally archived,
- checks were verified or explicitly blocked,
- the final answer reports changed files and evidence,
- reusable learning is proposed only when it will matter again.
