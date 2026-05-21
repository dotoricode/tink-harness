# Context habit calibration dogfood

## Source feedback

Representative product feedback from dogfood:

> Tink should recommend harnesses based on the user's current environment and habits, not only when the user gives a task. It should notice context usage habits, token usage habits, input quality, output length preferences, whether the user frequently uses `/new`, whether they wait until automatic compact, and similar patterns.

## Extracted behavior-shaping rules

- Tink should be able to suggest a harness before a task when the operating pattern itself is the problem.
- Suggestions must be based on observed signals, not personality guesses.
- Habit-based suggestions should be small and reversible because they can annoy users if overdone.
- Tink should distinguish context-hoarding, frequent reset, over-loading, under-specifying, over-explaining, and evidence-seeking patterns.
- The default should be one calibration at a time, not a dashboard of advice.
- Persistence requires approval: memory, harness edit, or routing rule.

## Generated harness

Name: `context-habit-calibration`

Purpose: recommend a small harness or operating calibration from context habits, token habits, input quality, output length, reset cadence, and evidence preferences.

## Example recommendations

- Signal: user repeatedly reaches compact with many raw logs. Recommendation: use `harness-curation` plus a concise handoff rule before large work.
- Signal: user frequently starts `/new` and loses continuity. Recommendation: create a one-screen handoff template before reset.
- Signal: user gives short prompts without success criteria. Recommendation: suggest a tiny prompt-shaping harness once, then proceed.
- Signal: user dislikes long output. Recommendation: use concise final reports with evidence handles only.
- Signal: user distrusts self-reports. Recommendation: prefer raw-state verification harnesses and negative signals.

## Candidate score

- Specificity: 5/5. It targets operating habits, not general productivity.
- Actionability: 4/5. It can change harness choice, prompt template, output length, or context reset behavior.
- Verifiability: 4/5. Evidence comes from recent corrections, run summaries, memory, and current prompt shape.
- Reuse likelihood: 5/5. Applies across projects and sessions.
- Context cost: 4/5. It reads only lightweight signals first.

## Validation checklist

- [x] Required harness sections exist.
- [x] It recommends from observed signals, not guesses.
- [x] It proposes one calibration by default.
- [x] It does not persist habit claims without approval.
- [x] It complements `harness-curation` instead of duplicating it.
