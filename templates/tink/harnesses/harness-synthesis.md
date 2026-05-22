# harness-synthesis

## When to use
Existing harnesses feel generic, or the task needs a domain-specific procedure built from research, failures, user feedback, or repeated work. Use it for both `no fit` and `generic fit` cases when the synthesis probe shows reusable domain rules.

Use this to create harnesses such as:
- `accessibility-regression-gate`
- `customer-interview-synthesis`
- `nextjs-rsc-boundary-refactor`
- `pre-pr-security-gate`
- `pricing-copy-experiment`
- `weekly-trend-report-validation`

## Ask first
- What recurring task or failure should this harness improve?
- What research, notes, run history, or examples should it learn from?
- What must the harness do better than a generic skill recommendation?
- Should the draft be used once, saved after this run, or saved immediately after approval?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
1. Gather only the relevant inputs: harness index, approved memory, user correction, run notes, research notes, and target files.
2. Extract behavior-shaping rules, not trivia: triggers, decisions, checks, stop conditions, recovery, and evidence.
3. Decide the draft level: run-only draft by default, save candidate only when reuse evidence is strong or the user asks.
4. Draft one small harness with a specific name and clear `When to use` boundary.
5. Make it operational: include ask-first questions, step order, checks, done criteria, and failure recovery.
6. Score the draft before proposing save:
   - specificity: not just a generic checklist
   - actionability: changes what Claude does next
   - verifiability: has evidence and checks
   - reuse likelihood: likely to apply again
   - context cost: small enough to load often
7. Use it for the current run after approval.
8. Save to `.tink/harnesses/<name>.md` and update `index.json` only after separate save approval. A normal run approval only permits a run-only draft in `.tink/current/`.

## Checks
- The new harness or run-only draft has the required sections for its level.
- The name is specific, lowercase, and hyphenated.
- It does not duplicate an existing harness.
- It includes `.tink/current/answers.md` reuse guidance.
- It contains no secrets, raw logs, full diffs, or one-off task state.
- It would have changed at least one decision in the current task.
- A run-only draft is not written to `.tink/harnesses/`, `index.json`, or the ledger without separate save approval.

## Done means
- The draft harness is either applied to this run as a run-only draft, saved with separate approval, or explicitly rejected.
- If saved, `.tink/harnesses/index.json` includes the new harness metadata.
- The final report states the source inputs, what rules were extracted, and why the harness is reusable.

## If it fails, Tink back
Return to a run-only draft. Do not save. State what made the harness too generic, duplicated, unverifiable, or too expensive in context, then propose the next smallest improvement.
