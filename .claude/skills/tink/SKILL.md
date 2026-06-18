---
name: tink
description: Self-growing harnesses for Claude Code. Use to cast, verify, frog, and weave task harnesses.
---

# Tink

Tink helps Claude cast the smallest useful harness, materialize it as run state, and start the work. It keeps the active harness/tool set small because too many tools can hurt performance, and it can suggest small habit-aware calibrations from observed signals.

## Core philosophy
Tink is one self-growing skill, not a pile of commands and not a skill recommendation list.

It should:
1. understand the task,
2. write a small task contract,
3. choose the smallest effective harness/tool set,
4. replace heavy harnesses when the current stage or token budget makes them harmful,
5. build or synthesize a narrow harness when none fits,
6. apply it only after approval,
7. create `.tink/current/` run state before deeper work,
8. execute the first safe step after approval,
9. verify the promised checks,
10. avoid repeating the same mistake,
11. remember reusable lessons only after approval,
12. keep the harness set small by purging or honing it over time.

## Command surface
Use only these commands:

- `/tink:setup`: configure language, scope, git tracking, and hook policy.
- `/tink:cast`: main path. Quick-triage the request first (simple and safe tasks start immediately without ceremony); otherwise choose/build/synthesize a harness, run Stitch, create run state, start work, and propose reusable learning. Long plans (3+ steps) end every response with a progress bar block.
- `/tink:verify`: run the checks promised in `.tink/current/contract.json` and record evidence.
- `/tink:list`: inspect harnesses and lightweight usage signals.
- `/tink:frog`: propose unused or redundant harness removal. Never delete without approval.
- `/tink:weave`: improve active harnesses based on real use, failures, and corrections.
- `/tink:update`: detect install source, diagnose user-modified files, and show the safe update command.

## Operating rules
1. Create or update `.tink/current/contract.json` for non-trivial runs: task type, risks, success conditions, forbidden actions, verification, and evidence.
2. Read `.tink/rules/index.json` before loading harness bodies when it exists. Use contract facts to choose only relevant harnesses, checks, context paths, and opt-in guard candidates. Load matching `mandatory` rules first, retrieve only relevant `retrievable` rules by facts or keywords, and record loaded rule ids by phase in `.tink/current/session.json`. When rules include `select_harnesses`, `include_paths`, `checks`, `reason`, or `risk`, record the selected context/checks and the rule reason in `context-map.json` or `contract.json` instead of silently loading extra context.
3. Read `.tink/harnesses/index.json` before loading harness bodies.
4. Read small approved memory files when present: `.tink/memory/mistakes.md`, `preferences.md`, `lessons.md`.
5. Prefer the smallest useful harness set. Use context footprint, not a universal hard cap: tiny harnesses may stack, large harnesses load one at a time after approval, and meta harnesses should reduce or replace context rather than pile on.
6. If `.tink/current/` exists and continuity is uncertain, read the current files, summarize goal / last safe point / next step / open questions / verification, then ask resume/archive/replace/cancel before continuing.
7. Run the synthesis probe on the initial harness choice. The probe produces one of three outcomes: strong fit (0-1 yes), generic fit (2-3 yes), or no fit (4-5 yes or no harness matches). Strong fit keeps the harness; generic fit adds a run-only draft; no fit loads `harness-synthesis`.
8. Treat GJC-style visible-thinking workflows as ordinary Tink harness choices, not new commands: use `requirements-interview` for ambiguous ideas, `plan-consensus` for broad plans or architecture, `goal-checkpoint` for long runs with 2-6 current-run goals, and `delegation-brief` for safe handoff or parallel-work briefs.
9. If no existing harness fits, use `harness-synthesis` to draft a narrow domain-specific harness instead of forcing a bad fit.
10. If too many tools, skills, agents, or harnesses are available, use `harness-curation` to choose the smallest effective set before loading more context.
11. If lightweight signals show recurring context, token, prompt-quality, output-length, reset, or evidence habits, use `harness-curation` to make one advisory recommendation.
12. When research notes, examples, prior failures, or user corrections are available, extract behavior-shaping rules: triggers, decision rules, checks, stop conditions, recovery, and evidence.
13. Run Stitch once before committing to `.tink/current/`: evaluate every time, show exactly one proposal only for high-impact quality or safety branches, and use configured language.
14. Use soft Stitch choices `Approve`, `Add requirements`, `Continue as-is` or localized equivalents; use hard choices `Approve`, `Add requirements`, `Cancel` only.
15. Hard gates must not offer `Continue as-is` or `이대로 진행`, and Stitch may change method or order but not the user's goal without separate approval.
16. Treat Reusable State Save Gate as a separate hard approval gate for `.tink/memory/*`, `.tink/harnesses/*`, `.tink/rules/*`, `.tink/config.json`, `.claude/`, and template/plugin files that affect future installs.
17. Current-run approval never authorizes reusable-state writes; before saving reusable state, show operation, destination files, exact entry or patch summary, reusable reason, sensitive content excluded, and rollback/removal path.
18. Before saving a reusable rule graph update, run a structural gate: duplicate, breadth, evidence, verification, Claude Code/Codex compatibility, macOS/Windows compatibility, and portable commands. AI may propose a rule; saving it still requires separate approval.
19. `/tink:frog` may inspect rule quality as well as harness quality. Prefer keep, rewrite, split, merge, or needs-evidence recommendations before any removal proposal.
20. Ask for approval before applying, saving, purging, honing, or installing enforcement hooks.
21. After approval, create `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`, `answers.md`, `contract.json`, `session.json`, `context-pack.md`, `context-map.json`, and `excluded-context.md`. If selected, also create `goals.json` for `goal-checkpoint` and `delegation.md` for `delegation-brief`.
22. Do not stop at recommendation. Execute the first safe step after run state exists.
23. Run `/tink:verify` behavior before final when `contract.json` lists required checks. If `.tink/config.json` has `completion_policy: "strict"`, do not call the run done until required checks are represented in `.tink/current/verification.json`, `.tink/current/evidence.md` exists, and remaining risk is stated.
24. Store reusable memory or rule updates only after separate Reusable State Save Gate approval.
25. If a check fails, update `.tink/current/notes.md`, state the failure, last safe point, and next single action. Append compact friction to `.tink/maintenance/friction.jsonl` when it exists. Feed repeated failures to `/tink:weave`.
26. Keep context compact. Do not paste raw logs or full diffs.
27. Use calm, clear, concise language. Prefer plain everyday words over technical terms if a simpler word works. No jokes.

## Quality bar
The user should not have to repeat themselves. If the same mistake appears twice, propose `/tink:weave`, a rule graph update, an opt-in guard candidate, or a memory update through `/tink:cast`.

A successful Tink run leaves evidence:
- current run files exist or were intentionally archived,
- `contract.json` states what must be true,
- context artifacts explain what was included and excluded,
- checks were verified or explicitly blocked,
- `.tink/current/evidence.md` summarizes the done claim, evidence, not-verified items, risk, and next action,
- the final answer reports changed files and evidence,
- reusable learning is proposed only when it will matter again.
