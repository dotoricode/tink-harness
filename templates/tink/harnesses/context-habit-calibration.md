# context-habit-calibration

## When to use
Use when Tink should recommend harnesses from the user's environment and operating habits, not only from an explicit task request.

Do not use to select, reduce, or replace the active harness set for a specific task — use `harness-curation` for harness and tool selection decisions.

Use this when signals show:
- frequent `/new` or context resets,
- waiting until automatic compact before clearing context,
- long prompts with mixed goals,
- short prompts missing success criteria,
- long final answers when concise handoff would work,
- high token use from too many tools, agents, screenshots, logs, or raw context,
- repeated corrections about output length, evidence, routing, or context hygiene.

## Ask first
- What behavior should improve: context use, prompt quality, output length, tool count, or reset cadence?
- What evidence exists: recent run notes, user corrections, memory, config, or transcript patterns?
- Is the recommendation advisory only, or should Tink create/update a harness after approval?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
1. Inspect only lightweight signals first: `.tink/memory/`, `.tink/runs/` summaries, current prompt shape, and recent corrections if available.
2. Classify the operating habit:
   - context-hoarder: waits for compact and accumulates stale context,
   - context-resetter: uses `/new` often and loses useful continuity,
   - over-loader: loads too many tools/harnesses/agents,
   - under-specifier: gives goals without success criteria or constraints,
   - over-explainer: asks for or receives too much output,
   - evidence-seeker: needs raw-state evidence and negative signals.
3. Recommend one small calibration:
   - a lean harness set,
   - a prompt template,
   - an output-length rule,
   - a context reset/compact rule,
   - a memory/hone/purge proposal.
4. If the habit repeats, propose saving a narrow harness or memory rule after approval.
5. If the signal is weak, keep the suggestion advisory and do not persist it.

## Checks
- The recommendation is based on observed signals, not personality guesses.
- It changes the next run behavior.
- It names the tradeoff: speed, token use, continuity, evidence quality, or output length.
- It proposes at most one calibration by default.
- No private transcript content, raw logs, or one-off state is saved without approval.

## Done means
- Tink produced a small habit-aware harness recommendation or declined due to weak evidence.
- Any saved memory or harness edit was approved.
- The final answer states the signal, recommendation, expected benefit, and when to reverse it.

## If it fails, Tink back
If the recommendation annoys the user or adds friction, revert to advisory-only mode and require stronger evidence before suggesting that calibration again.
