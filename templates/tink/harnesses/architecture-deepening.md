# architecture-deepening

## When to use
Use when the task is to improve codebase architecture by finding shallow modules, weak interfaces, poor seams, or low-locality tests.

Good triggers:
- "improve architecture", "deep module", "interface design", "design it twice"
- refactors where the main question is module shape rather than feature behavior
- codebase health work that should produce candidates before implementation

Do not use this for ordinary cleanup, formatting, or a known small refactor. Use the base run unless architecture choices are the work.

## Ask first
- Which area or module should be reviewed?
- What pain matters most: testability, navigation, coupling, duplication, or interface complexity?
- Should the output be candidates only, an implementation plan, or code changes after approval?
- Which ADRs, glossary terms, or compatibility boundaries must be respected?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
1. Read the relevant glossary, ADRs, and nearby tests before proposing architecture changes.
2. Use consistent vocabulary: module, interface, implementation, seam, adapter, depth, leverage, and locality.
3. Find deepening candidates:
   - shallow modules with large interfaces,
   - concepts spread across many callers,
   - seams invented before a second adapter exists,
   - tests that bypass the useful interface,
   - implementation details leaking into callers.
4. Apply the deletion test: if removing the module only moves trivial code, it is probably shallow.
5. For interface-shaped decisions, compare at least two meaningfully different designs before choosing.
6. Present candidates with current shape, proposed shape, tradeoffs, risk, and verification.
7. Do not implement until the user picks a candidate or the run contract already includes implementation.

## Checks
- Candidates use project domain language and documented architecture vocabulary.
- ADR conflicts are named instead of silently ignored.
- Each candidate explains leverage, locality, and test impact.
- Interface proposals show what is hidden behind the interface.
- Rejected alternatives are tied to concrete tradeoffs.
- The final plan has verification at the chosen seam.

## Done means
- The user has clear architecture candidates or a selected implementation plan.
- The chosen module/interface shape is justified by depth, leverage, and locality.
- Risks, compatibility boundaries, and tests are visible.
- No broad refactor starts without explicit approval.

## If it fails, Tink back
Return to the last candidate with evidence. State whether the blocker is missing domain context, ADR conflict, unclear seam, or insufficient verification, then choose one narrow follow-up.
