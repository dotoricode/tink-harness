# requirements-interview

## When to use
Clarify an ambiguous idea before planning or implementation.

## Ask first
- What decision or artifact should the clarified requirements support?
- What is the highest-impact unknown?
- What must not be assumed?

## Plan
1. State the current understanding in one paragraph.
2. Ask one question at a time, starting with the uncertainty that changes scope or success criteria most.
3. Record each answer in `.tink/current/answers.md`.
4. Convert settled answers into `contract.json` success conditions, forbidden actions, or verification notes.
5. Stop interviewing when the next safe step is clear enough to plan.

## Checks
- Only one blocking question is asked at a time.
- Success conditions are explicit before implementation starts.
- Important assumptions are recorded instead of hidden.
- Do not repeat questions already answered in `.tink/current/answers.md`.

## Done means
- The goal, success conditions, and non-goals are clear enough for the next harness.
- Remaining uncertainty is named as an assumption or open question.
- `contract.json` can state what done means.

## If it fails, Tink back
Return to the last answered question. State what is still ambiguous, the last safe point, and the next single question.
