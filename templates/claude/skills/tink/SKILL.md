---
name: tink
description: Self-growing harnesses for Claude Code. Use to cast, apply, frog, and weave task harnesses.
---

# Tink

Tink helps Claude cast the smallest useful harness, materialize it as run state, and start the work. It keeps the active harness/tool set small because too many tools can hurt performance, and it can suggest small habit-aware calibrations from observed signals.

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
- `/tink:cast`: main path. Choose/build/synthesize a harness, run Stitch, create run state, start work, and propose reusable learning.
- `/tink:list`: inspect harnesses and lightweight usage signals.
- `/tink:frog`: propose unused or redundant harness removal. Never delete without approval.
- `/tink:weave`: improve active harnesses based on real use, failures, and corrections.

## Operating rules
1. Read `.tink/harnesses/index.json` before loading harness bodies.
2. Read small approved memory files when present: `.tink/memory/mistakes.md`, `preferences.md`, `lessons.md`.
3. Prefer the smallest useful harness set. Use context footprint, not a universal hard cap: tiny harnesses may stack, large harnesses load one at a time after approval, and meta harnesses should reduce or replace context rather than pile on.
4. If `.tink/current/` exists and continuity is uncertain, read the five current files, summarize goal / last safe point / next step / open questions / verification, then ask resume/archive/replace/cancel before continuing.
5. Run the synthesis probe on the initial harness choice. The probe produces one of three outcomes: strong fit (0-1 yes), generic fit (2-3 yes), or no fit (4-5 yes or no harness matches). Strong fit keeps the harness; generic fit adds a run-only draft; no fit loads `harness-synthesis`.
6. If no existing harness fits, use `harness-synthesis` to draft a narrow domain-specific harness instead of forcing a bad fit.
7. If too many tools, skills, agents, or harnesses are available, use `harness-curation` to choose the smallest effective set before loading more context.
8. If lightweight signals show recurring context, token, prompt-quality, output-length, reset, or evidence habits, use `context-habit-calibration` to make one advisory recommendation.
9. When research notes, examples, prior failures, or user corrections are available, extract behavior-shaping rules: triggers, decision rules, checks, stop conditions, recovery, and evidence.
10. Run Stitch once before committing to `.tink/current/`: evaluate every time, show exactly one proposal only for high-impact quality or safety branches, and use configured language.
11. Use soft Stitch choices `Approve`, `Add requirements`, `Continue as-is` or localized equivalents; use hard choices `Approve`, `Add requirements`, `Cancel` only.
12. Hard gates must not offer `Continue as-is` or `이대로 진행`, and Stitch may change method or order but not the user's goal without separate approval.
13. Treat Reusable State Save Gate as a separate hard approval gate for `.tink/memory/*`, `.tink/harnesses/*`, `.tink/config.json`, `.claude/`, and template/plugin files that affect future installs.
14. Current-run approval never authorizes reusable-state writes; before saving reusable state, show operation, destination files, exact entry or patch summary, reusable reason, sensitive content excluded, and rollback/removal path.
15. Ask for approval before applying, saving, purging, or honing.
16. After approval, create `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`, and `answers.md`.
17. Do not stop at recommendation. Execute the first safe step after run state exists.
18. Store reusable memory under `.tink/memory/` only after separate Reusable State Save Gate approval.
19. If a check fails, update `.tink/current/notes.md`, state the failure, last safe point, and next single action.
20. Keep context compact. Do not paste raw logs or full diffs.
21. Use calm, clear, concise language. Prefer plain everyday words over technical terms — if a simpler word works, use it. No jokes.

## Quality bar
The user should not have to repeat themselves. If the same mistake appears twice, propose `/tink:weave` or a memory update through `/tink:cast`.

A successful Tink run leaves evidence:
- current run files exist or were intentionally archived,
- checks were verified or explicitly blocked,
- the final answer reports changed files and evidence,
- reusable learning is proposed only when it will matter again.
