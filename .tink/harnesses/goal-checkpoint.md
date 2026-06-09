# goal-checkpoint

## When to use
Break a long run into a small set of durable current-run goals with explicit completion evidence.

## Ask first
- What final outcome should the goal list prove?
- Which 2-6 goals can be completed independently?
- What evidence marks each goal complete?

## Plan
1. Split the run into 2-6 goals.
2. Write `.tink/current/goals.json` with goal id, description, status, done criteria, verification, and evidence.
3. Mark exactly one goal as active when work begins.
4. Checkpoint each goal as complete, blocked, or deferred with evidence.
5. Keep `steps.json` aligned with the active goal.

## Checks
- Goals are few enough to scan and specific enough to verify.
- Each goal has completion evidence, not just a task label.
- Blocked goals include the smallest unblock action.
- Do not repeat questions already answered in `.tink/current/answers.md`.

## Done means
- Every required goal is complete or explicitly blocked/deferred.
- `goals.json` matches the final status reported to the user.
- Verification evidence is attached to completed goals.

## If it fails, Tink back
Return to the last completed goal. State the active goal, failure, last safe point, and next single action.
