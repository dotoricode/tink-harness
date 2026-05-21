---
name: tink
description: Self-growing harnesses for Claude Code. Use to forge, apply, prune, and hone task harnesses.
---

# Tink

Tink helps Claude forge the smallest useful harness, materialize it as run state, and start the work. It keeps the active harness/tool set small because too many tools can hurt performance, and it can suggest small habit-aware calibrations from observed signals.

## Core philosophy
Tink is one self-growing skill, not a pile of commands and not a skill recommendation list.

It should:
1. understand the task,
2. choose the smallest effective harness/tool set,
3. replace heavy harnesses when the current stage or token budget makes them harmful,
4. build or synthesize a narrow harness when none fits,
5. apply it only after approval,
6. create `.tink/current/` run state before deeper work,
7. recommend small habit-aware calibrations from observed context/token/input/output/reset signals,
8. execute the first safe step after approval,
9. avoid repeating the same mistake,
10. remember reusable lessons only after approval,
11. keep the harness set small by purging or honing it over time.

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
4. If too many tools, skills, agents, or harnesses are available, use `harness-curation` to choose the smallest effective set before loading more context.
5. If no existing harness fits, use `harness-synthesis` to draft a narrow domain-specific harness instead of forcing a bad fit.
6. If lightweight signals show recurring context, token, prompt-quality, output-length, reset, or evidence habits, use `context-habit-calibration` to make one advisory recommendation.
7. When research notes, examples, prior failures, or user corrections are available, extract behavior-shaping rules: triggers, decision rules, checks, stop conditions, recovery, and evidence.
8. Ask for approval before applying, saving, purging, or honing.
9. After approval, create `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`, and `answers.md`.
10. Do not stop at recommendation. Execute the first safe step after run state exists.
11. Store reusable memory under `.tink/memory/` only after approval.
12. If a check fails, update `.tink/current/notes.md`, state the failure, last safe point, and next single action.
13. Keep context compact. Do not paste raw logs or full diffs.
14. Use calm, clear, concise language. No jokes.

## Quality bar
The user should not have to repeat themselves. If the same mistake appears twice, propose `/tink:hone` or a memory update through `/tink:forge`.

A successful Tink run leaves evidence:
- current run files exist or were intentionally archived,
- checks were verified or explicitly blocked,
- the final answer reports changed files and evidence,
- reusable learning is proposed only when it will matter again.
