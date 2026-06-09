# plan-consensus

## When to use
Plan broad architecture, large refactors, or work where a second-pass critique can materially change the approach.

## Ask first
- What decision must the final plan settle?
- What constraints or compatibility boundaries matter?
- What level of detail should the plan reach before implementation?

## Plan
1. Planner: draft the smallest complete plan with scope, sequence, and checks.
2. Architect: challenge interfaces, data flow, compatibility, and migration concerns.
3. Critic: look for missing tests, unsafe assumptions, and overbuilt steps.
4. Final: merge the useful objections into one implementation-ready plan.
5. Record the final plan in `.tink/current/plan.md` and unresolved objections in `notes.md`.

## Checks
- Final plan names the goal, scope, non-goals, and acceptance evidence.
- Critique changes the plan or is explicitly rejected with a reason.
- The plan does not require a subagent, tmux worker, or separate runtime to be valid.
- Do not repeat questions already answered in `.tink/current/answers.md`.

## Done means
- A single final plan can be handed to an implementer without more design choices.
- Major risks and verification steps are visible.
- Rejected alternatives are short and tied to concrete tradeoffs.

## If it fails, Tink back
Return to the latest complete stage. State which role found the blocker, the last safe point, and the next single revision.
