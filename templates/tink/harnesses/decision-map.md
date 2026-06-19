# decision-map

## When to use
Use when a loose idea needs multiple sessions, investigations, prototypes, or discussions before an implementation plan can be trusted.

Good triggers:
- "decision map", "investigation tickets", "too many unknowns"
- a plan with several unresolved decisions that block each other
- work that may require research, prototype, and discussion in separate sessions

Do not use this for a normal plan that can be settled in one conversation. Use `plan-consensus` instead.

## Ask first
- What final decision or plan should the map unlock?
- Which unknown is the current frontier?
- What artifact should hold the map?
- Are tickets allowed to create research notes, prototypes, or only discussion answers?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
1. State the finish line: what becomes possible when the map is resolved.
2. Create or update a compact map artifact with numbered tickets.
3. Give each ticket:
   - question,
   - blocked-by list,
   - type: research, prototype, or discuss,
   - answer field,
   - evidence links.
4. Keep the map compact enough to load whole in future sessions; link assets instead of copying them.
5. Resolve only the current frontier ticket unless the user explicitly asks to continue.
6. When resolving a ticket, update its answer and add newly discovered tickets with dependencies.
7. Stop when the remaining path is clear enough for `plan-consensus`, `issue-triage`, or the base run.

## Checks
- The map has a clear finish line and current frontier.
- Each ticket is sized for one session and has a type.
- Dependencies are explicit and acyclic enough to choose the next ticket.
- Assets are linked, not duplicated into the map.
- Resolved tickets include evidence or the reason evidence is unavailable.
- No implementation starts until the frontier makes the path clear.

## Done means
- The user has a compact decision map or a clear reason it was unnecessary.
- The next ticket or next harness is explicit.
- Resolved decisions are recorded with evidence links.
- Fog-of-war decisions are visible instead of hidden in prose.

## If it fails, Tink back
Return to the last resolved ticket. State which dependency or evidence gap blocks the map, then choose the next smallest research, prototype, or discussion ticket.
