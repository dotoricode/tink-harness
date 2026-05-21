---
name: tink
description: Self-growing harnesses for Claude Code. Use before non-trivial coding, research, review, docs, or ship work.
---

# Tink

Tink helps Claude choose the smallest useful harnesses before work starts.

## When to use
Use Tink when a task has multiple steps, risk, verification, or repeated patterns.

Do not use Tink for one-line answers or trivial edits.

## Operating rules
1. Read `.tiny/harnesses/index.json` first.
2. Suggest at most four harnesses.
3. Ask for approval before applying them.
4. Read only selected harness files.
5. Create `.tiny/current/` for the current run.
6. Do the work inside the selected harnesses.
7. If a check fails, tink back one step.
8. Save new or improved harnesses only after user approval.
9. Keep context compact.
10. Use calm, clear, concise language. No jokes.

## Quality bar
The user should not have to repeat themselves. If the same mistake appears twice, propose a harness or memory improvement.
