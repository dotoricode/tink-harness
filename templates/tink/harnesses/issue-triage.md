# issue-triage

## When to use
Use when the user wants to sort incoming issues, external PRs, QA reports, or a broad plan that should become independently actionable work.

Good triggers:
- "triage issues", "QA session", "file issues", "split this into tickets"
- raw bug reports or feature requests that need categorizing
- a PR or issue that needs a ready-for-agent brief
- a plan, PRD, or discussion that should become vertical slices

Do not use this for ordinary implementation after an issue is already agent-ready. Use the base run or a more specific harness instead.

## Ask first
- What source should be triaged: issue, PR, QA report, plan, or conversation?
- What outcome is wanted: needs-info, ready-for-agent, ready-for-human, wontfix, or new issue slices?
- What tracker or local artifact should receive the result?
- Which labels, states, or posting rules are mandatory?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
1. Identify the source type and current state: issue, PR, QA report, plan, or discussion.
2. Gather only the durable context needed to classify the work:
   - user-facing behavior,
   - expected behavior,
   - reproduction steps or acceptance criteria,
   - prior notes, labels, linked specs, or blocking relationships.
3. For bugs, verify the claim when practical before writing an agent-ready brief. If verification is impossible, mark the missing evidence explicitly.
4. Decide the outcome:
   - `needs-info`: specific unanswered questions remain,
   - `ready-for-agent`: behavior, scope, and verification are clear,
   - `ready-for-human`: judgment, access, or manual decision is required,
   - `wontfix`: already implemented, rejected, duplicate, or out of scope,
   - `slice`: broad work should become independently verifiable tickets.
5. When slicing, prefer vertical tracer bullets over layer-by-layer tasks. Each slice should be demoable or verifiable on its own.
6. Write or draft the result using durable language:
   - user-facing behavior over file paths,
   - domain terms over implementation names,
   - concrete reproduction or acceptance criteria,
   - blocking relationships only when real.
7. If posting to an external tracker, confirm posting rules and disclose AI-generated triage when the project requires it.
8. Record the classification, evidence, and any missing information in `.tink/current/notes.md`.

## Checks
- The result has exactly one primary state or an explicit conflict note.
- Bug reports include reproduction steps or a clear `needs-info` question.
- Ready-for-agent work includes acceptance criteria and verification evidence.
- Slices are vertical, independently verifiable, and ordered by real dependencies.
- Issue bodies avoid stale file paths and unnecessary implementation detail.
- External tracker writes are not performed unless the user approved that destination.

## Done means
- The issue, PR, QA report, or plan has a clear next state.
- Any agent-ready brief can be picked up without re-triage.
- Any created or proposed slices have acceptance criteria and dependency notes.
- Missing evidence is named instead of hidden.

## If it fails, Tink back
Return to the last classification decision. State what evidence is missing, the last safe point, and the next smallest question or verification step.
