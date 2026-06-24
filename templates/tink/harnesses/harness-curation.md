# harness-curation

## When to use
The user has too many tools, skills, agents, or harnesses available, and the next task needs the smallest effective operating set.

Use this when:
- more tools are making the agent worse, slower, or more expensive,
- a strong harness is too heavy for the current stage,
- parallel agents would exceed token or coordination budget,
- the task needs a different harness than the previous task,
- Tink must prevent repeated mistakes and maintain the harness set.

Use this harness (not a separate tool) when operating habits need calibration across runs — see the section at the bottom.

## Ask first
- What is the current task and success evidence?
- What is the constraint: token budget, time, model capacity, tool permissions, or MVP stage?
- Which tool or harness feels useful but too heavy right now?
- Is this a one-run downgrade, a reusable routing rule, or a harness maintenance update?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
1. State the task stage: spike, MVP, implementation, review, release, or postmortem.
   - idea shaping usually starts with `requirements-interview`,
   - multi-session planning may need `plan-consensus` or a decision map,
   - issue intake uses `issue-triage`,
   - implementation usually stays on the base run unless a specialized harness changes behavior,
   - review, ship, and merge use their named harnesses.
2. Choose the smallest effective set:
   - target 3-5 tools/harnesses,
   - never exceed 10 without explicit reason,
   - prefer fewer when context is tight.
3. Decide whether to use, replace, synthesize, hone, or purge:
   - use: existing harness fits and is cheap enough,
   - replace: a strong harness is too heavy for this task,
   - synthesize: no narrow harness exists,
   - weave: repeated mistake or user correction changed the workflow,
   - frog: harness is unused, duplicate, or too broad to change behavior.
4. If a known harness is too heavy, create a lean variant for this run instead of forcing it.
5. Write the routing decision into `.tink/current/plan.md` and the reason into `.tink/current/notes.md`.
6. After the run, propose only durable updates:
   - memory for repeated mistakes or stable preferences,
   - harness edit for reusable workflow changes,
   - index metadata update for usage or context cost.

## Checks
- The selected set is explicitly smaller than the available set.
- Heavy harnesses are rejected or deferred with a reason.
- The run has a clear token/context budget posture.
- The final answer reports why this harness set was enough.
- No memory or harness maintenance is saved without approval.

## Done means
- The current task has an approved minimal harness set.
- If a new harness was needed, `harness-synthesis` produced a narrow draft.
- If a repeated mistake was found, Tink proposed memory or `/tink:weave`.
- If a harness is too broad or unused, Tink proposed `/tink:frog` or a lean replacement.

## If it fails, Tink back
If the chosen set is too weak, add one harness only and record why. If it is too heavy, remove the least task-critical harness and continue from the last safe point.

## When context habits also need calibration

Use this section when signals span multiple runs — not just the current task's tool selection.

Signals:
- frequent `/new` or context resets mid-task
- waiting until automatic compact before clearing
- long prompts mixing multiple unrelated goals
- short prompts missing success criteria
- long final answers when a concise handoff would work
- repeated corrections about output length, evidence, routing, or context hygiene

Habit types:
- **context-hoarder**: waits for compact, accumulates stale context
- **context-resetter**: uses `/new` often, loses useful continuity
- **over-loader**: too many tools/harnesses/agents at once
- **under-specifier**: goals without success criteria or constraints
- **over-explainer**: asks for or receives too much output
- **evidence-seeker**: needs raw-state evidence and negative signals

Calibration: recommend one small change — lean harness set, prompt template, output-length rule, reset rule, or memory proposal. If the signal is weak, stay advisory only. Save only after approval.
