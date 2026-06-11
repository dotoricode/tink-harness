# code-change

## When to use
Add, change, or refactor code with a clear scope.

## Ask first
- What is the target behavior?
- What files or areas are in scope?
- What must not change?

## Plan
1. Inspect before editing.
2. Make the smallest useful change.
3. Avoid unrelated cleanup.
4. Run the relevant check.
5. Report changed files and evidence.

## Checks
- Only target files modified; no unrelated changes.
- Tests or build verified, or reason not run is stated.
- Changed lines match stated scope — no unnoticed behavior shift.
- Do not repeat questions already answered in `.tink/current/answers.md`.

## Done means
- Only related files changed.
- Tests/build pass, or reason not run is stated.
- Diff evidence is available.

## If it fails, Tink back
Return to the last safe step. State what failed, the last safe point, and the next single action.
