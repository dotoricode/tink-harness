# loop-engineering

## When to use
Use when the user explicitly wants to iterate — act, observe, evaluate, fix one
bottleneck, re-evaluate — against a measurable acceptance signal until it passes
or an iteration budget is hit. For "make X pass / reach quality bar Y" goals where
one pass is unlikely to be enough.

Good triggers:
- "iterate / loop until tests, lint, build pass", "반복해서 ~까지 통과"
- "raise the score / coverage / benchmark to N", "keep fixing until green"
- `/tink:cast loop <task>` style explicit loop intent

Do not use for ordinary multi-step work that just needs goals tracked — that is
`goal-checkpoint`. Do not use for hard-bug diagnosis — that is `bug-diagnosis-loop`.
If there is no runnable or observable acceptance signal, run `requirements-interview`
first to define a measurable bar.

## Ask first
- What single acceptance signal judges each iteration (command, test, metric, manual check)?
- What is the iteration budget (max iterations or time) before stopping to report?
- What must never change or run during the loop (forbidden files, commands, deps)?
- What evaluates results independently of the change, so the author does not grade itself?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
1. Write the loop contract into `contract.json`: objective, acceptance signal(s) as
   `verification.commands` / `manual_checks`, forbidden actions as `forbidden`; record
   the iteration budget in `.tink/current/notes.md`.
2. Measure the baseline once: run the acceptance signal, record the starting score or
   failure in `notes.md` as iteration 0.
3. Each iteration: identify the single biggest failure cause, make one focused change
   for that cause only, then re-run the same acceptance signal.
4. Append one log line per iteration to `notes.md`: iteration number, the one change,
   result (pass/fail + score), next bottleneck.
5. Stop when the acceptance signal passes, or when the budget is reached. Never stop
   merely because a file was edited.
6. On budget exhaustion, stop and report current state, failing check, suspected root
   cause, and the next recommended action.

## Checks
- Each iteration changes one bottleneck, not several at once.
- The acceptance signal is a runnable command or observable check, not a self-judgment.
- Every iteration is logged in `notes.md` with its result before the next change.
- Evaluation is independent of the change (separate command or review pass).
- The loop respects the budget and stops with a report instead of looping forever.

## Done means
- All acceptance signals in `contract.json` pass, with the final run recorded as evidence; or
- The budget was reached and the run is reported blocked with state, failing check, and next action.
- The iteration log in `notes.md` shows what each iteration changed and measured.

## If it fails, Tink back
Return to the last iteration whose acceptance signal improved or held. Restate the active
bottleneck, the last best result, and the single next change. If no acceptance signal can
be built, stop and run `requirements-interview` to define a measurable bar before looping.
