# Skill adoption harness dogfood

## Source signal

User pasted a large copied-skill inventory and asked to analyze the skills, then add or apply useful patterns to Tink harnesses.

The useful signal was not "copy every skill." The useful signal was that several mature workflows repeat across agent work:

- issue and QA intake,
- hard-bug diagnosis,
- Standards vs Spec review,
- multi-session decision mapping,
- architecture deepening,
- handoff and routing hygiene.

## Harness decisions

### Added as focused harnesses

- `issue-triage`: issue/PR/QA intake, ready-for-agent briefs, and vertical slices.
- `bug-diagnosis-loop`: red-capable feedback loop before hard bug fixes.
- `review-two-axis`: separate Standards and Spec review axes.
- `decision-map`: research/prototype/discuss tickets across sessions.
- `architecture-deepening`: deep modules, interface shape, seams, leverage, locality, and testability.

### Applied to existing harnesses

- `requirements-interview`: inspect repo-discoverable answers before asking the user.
- `plan-consensus`: compare interface alternatives and split unresolved decisions.
- `delegation-brief`: reference existing artifacts, suggest next harnesses, and redact sensitive content.
- `ship` and `pr-merge`: preserve source intent when resolving conflicts.
- `harness-curation`: route idea shaping, issue intake, implementation, review, ship, and merge work.

### Not adopted as Tink harnesses

Writing and teaching skills stayed outside the default Tink harness set. They are useful as separate skills, but they do not improve Tink's core job of choosing, running, verifying, and maintaining harnesses.

## Validation checklist

- [x] New harnesses are opt-in and specific.
- [x] Generic code/review/docs work still uses the base run.
- [x] Command routing mentions the new focused harnesses.
- [x] Claude command copies stay byte-identical.
- [x] README and README.ko.md describe the new selection surface.
- [x] `npm test` passes.
- [x] `git diff --check` passes.

## Expected cast behavior

For "debug this intermittent checkout timeout," `/tink:cast` should consider `bug-diagnosis-loop` before editing code.

For "review this PR against the spec," `/tink:cast` should consider `review-two-axis` instead of a generic review.

For "turn this fuzzy product idea into a build plan over several sessions," `/tink:cast` should consider `decision-map` before implementation.

For "find architecture improvements around the sync interface," `/tink:cast` should consider `architecture-deepening`.
