# delegation-brief

## When to use
Prepare safe parallel work or handoff briefs without starting workers automatically.

## Ask first
- What work can be split without conflicts?
- What files, commands, or decisions are forbidden for each worker?
- What evidence should each worker return?

## Plan
1. Identify independent work packets and shared constraints.
2. Write `.tink/current/delegation.md` with packet scope, forbidden actions, expected evidence, and merge notes.
3. Reference existing artifacts by path or URL instead of duplicating plans, PRDs, diffs, or logs.
4. Include suggested harnesses or skills for the next agent when the packet crosses sessions.
5. Redact secrets, credentials, private payloads, and unnecessary personal data.
6. Assign each packet a clear owner label such as reviewer, verifier, or implementer.
7. Keep execution manual unless the user separately approves tooling.
8. Reconcile returned evidence before changing the final plan or status.

## Checks
- Each packet has non-overlapping scope or an explicit conflict note.
- No tmux panes, worktrees, workers, or external agents are started by this harness.
- Evidence requirements are concrete and compact.
- Handoff packets avoid duplicating artifacts and exclude sensitive content.
- Do not repeat questions already answered in `.tink/current/answers.md`.

## Done means
- `delegation.md` is ready for a human or another agent to act on.
- Shared constraints and forbidden actions are visible.
- Merge or reconciliation steps are named.

## If it fails, Tink back
Return to the last packet with clear ownership. State the conflict, last safe point, and next single split or merge action.
