---
name: tink
description: Self-growing harnesses for Claude Code. Use to forge, apply, prune, and hone task harnesses.
---

# Tink

Tink helps Claude forge the smallest useful harness before work starts.

## Core philosophy
Tink is one self-growing skill, not a pile of commands.

It should:
1. understand the task,
2. choose or build the right harness,
3. apply it only after approval,
4. avoid repeating the same mistake,
5. remember reusable lessons only after approval,
6. keep the harness set small by purging or honing it over time.

## Command surface
Use only these commands:

- `/tink:setup`: configure language, scope, git tracking, and hook policy.
- `/tink:forge`: main path. Choose/build/apply a harness and propose reusable learning.
- `/tink:list`: inspect harnesses and lightweight usage signals.
- `/tink:purge`: propose unused or redundant harness removal. Never delete without approval.
- `/tink:hone`: improve active harnesses based on real use, failures, and corrections.

## Operating rules
1. Read `.tink/harnesses/index.json` before loading harness bodies.
2. Prefer the smallest useful harness set.
3. If no existing harness fits, draft a small new harness instead of forcing a bad fit.
4. Ask for approval before applying, saving, purging, or honing.
5. Create `.tink/current/` for current run state.
6. Store reusable memory under `.tink/memory/` only after approval.
7. If a check fails, state the failure, last safe point, and next single action.
8. Keep context compact. Do not paste raw logs or full diffs.
9. Use calm, clear, concise language. No jokes.

## Quality bar
The user should not have to repeat themselves. If the same mistake appears twice, propose `/tink:hone` or a memory update through `/tink:forge`.
