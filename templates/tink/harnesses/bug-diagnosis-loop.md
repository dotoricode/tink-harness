# bug-diagnosis-loop

## When to use
Use when the user asks to diagnose or debug a hard bug, regression, intermittent failure, or performance problem where guessing would be risky.

Good triggers:
- "debug this", "diagnose", "regression", "flaky", "slow", "throws"
- a bug report where the cause is unknown
- a fix attempt that lacks a red-capable verification loop

Do not use this when the requested fix is obvious and already has a focused failing test. In that case, use the base run and keep the existing check.

## Ask first
- What exact symptom must the loop catch?
- What command, test, script, trace, or manual action currently reproduces it?
- Is the failure deterministic, intermittent, environment-specific, or performance-based?
- What environments, data, or side effects are forbidden during diagnosis?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
1. Define the user-visible symptom in one sentence. Do not start with a theory.
2. Build or identify a red-capable feedback loop before changing production code:
   - focused test,
   - CLI command with fixture input,
   - HTTP/curl script,
   - headless browser check,
   - replayed trace,
   - minimal local harness,
   - repeated stress loop for intermittent failures.
3. Tighten the loop:
   - assert the exact symptom,
   - remove unrelated setup,
   - make the verdict deterministic or raise the reproduction rate,
   - keep the command agent-runnable when possible.
4. Reproduce and minimize. Remove inputs, config, steps, or callers one at a time while the loop stays red.
5. Form hypotheses only after the loop is red-capable. Test one hypothesis at a time with the loop.
6. Implement the smallest fix that turns the loop green without broadening scope.
7. Run the focused loop first, then the relevant broader checks promised in `contract.json`.
8. Record the loop command, red/green evidence, minimized case, and any residual risk in `.tink/current/notes.md`.

## Checks
- A named command, script, test, or manual procedure can catch the exact symptom.
- The loop has been run at least once or is explicitly blocked with the reason.
- The minimized repro still represents the user's bug.
- The fix is verified against the focused loop before broad checks.
- Intermittent bugs report reproduction rate or the best available stress evidence.
- If no loop can be built, the run stops with needed artifact/access/instrumentation listed.

## Done means
- The bug has a red-capable loop or a clearly blocked diagnosis record.
- The cause and fix are tied to evidence, not speculation.
- The final report names the focused check and broader checks.
- Any remaining flakiness, environment gap, or manual dependency is explicit.

## If it fails, Tink back
Return to the last red-capable loop. If no loop exists, stop and ask for the smallest missing artifact: logs, trace, reproduction access, screen recording, fixture, or permission for temporary instrumentation.
