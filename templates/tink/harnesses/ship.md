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
3. Prepare notes for humans.
4. State risks and rollback.
5. Confirm final handoff.

## Checks
- Use only the context needed for this task.
- Do not repeat questions already answered in `.tink/current/answers.md`.
- Do not store raw logs, full diffs, secrets, or one-off state in memory.

## Done means
- Checks are complete or clearly blocked.
- Known risks are stated.
- Handoff is short and usable.

## If it fails, Tink back
Return to the last safe step. State what failed, the last safe point, and the next single action.
