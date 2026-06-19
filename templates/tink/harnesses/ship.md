# ship

## When to use
Prepare a PR, release, deployment, or public handoff.

Release/publish/deploy/PR are hard-gate territory: cast triggers a Stitch safety hard gate during initial approval when this harness is selected.

## Ask first
- What is shipping?
- What checks are required?
- What rollback or risk matters?

## Plan
1. Summarize changes.
2. Run or verify required checks.
3. If merge or release conflicts are present, inspect the primary source for each side before resolving.
4. Preserve both intents where possible; when incompatible, state the tradeoff and choose the side matching the ship goal.
5. Draft PR or release summary: what changed, what risks, what rollback.
6. State risks and rollback.
7. Confirm final handoff.

## Checks
- All required CI checks pass, or reason for skip is stated.
- Rollback or revert procedure is documented.
- Changed artifacts (files, package, version) are listed.
- Known risks are explicitly stated, not implied.
- Conflict resolutions cite source intent or a clear tradeoff.
- Do not repeat questions already answered in `.tink/current/answers.md`.

## Done means
- Checks are complete or clearly blocked.
- Known risks are stated.
- Handoff is short and usable.

## If it fails, Tink back
Return to the last safe step. State what failed, the last safe point, and the next single action.
