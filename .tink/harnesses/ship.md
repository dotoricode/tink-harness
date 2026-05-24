# ship

## When to use
Prepare a PR, release, deployment, or public handoff.

## Ask first
- What is shipping?
- What checks are required?
- What rollback or risk matters?

## Plan
1. Summarize changes.
2. Run or verify required checks.
3. Draft PR or release summary: what changed, what risks, what rollback.
4. State risks and rollback.
5. Confirm final handoff.

## Checks
- All required CI checks pass, or reason for skip is stated.
- Rollback or revert procedure is documented.
- Changed artifacts (files, package, version) are listed.
- Known risks are explicitly stated, not implied.
- Do not repeat questions already answered in `.tink/current/answers.md`.

## Done means
- Checks are complete or clearly blocked.
- Known risks are stated.
- Handoff is short and usable.

## If it fails, Tink back
Return to the last safe step. State what failed, the last safe point, and the next single action.
