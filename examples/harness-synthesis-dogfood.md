# Harness synthesis dogfood: harness-curation

## Source feedback

Representative product feedback from dogfood:

> Tools become poison when there are too many. The right set is often 5-10, and even 10 can be too much. Each task needs a different harness, but manually swapping harnesses every time is not realistic. Superpowers can be good but too heavy for an early MVP. OMC can be good but harmful when token budget cannot support parallel agents. Tink should automatically switch harnesses, create new ones when needed, prevent repeated mistakes, and maintain the harness set.

## Extracted behavior-shaping rules

- Prefer the smallest effective operating set over maximum capability.
- Treat token budget, coordination budget, model capacity, and MVP stage as first-class routing constraints.
- Strong harnesses can still be wrong when they are too heavy for the current task.
- Tink must choose between use, replace, synthesize, hone, and purge.
- Repeated mistakes should become approved memory or harness edits, not one-off reminders.
- Harness maintenance is part of Tink, not a separate manual chore.

## Generated harness

Name: `harness-curation`

Purpose: choose, replace, synthesize, hone, or purge harnesses when too many tools or heavy workflows would hurt the current task.

Why this is not just a skill recommendation:

- It explicitly rejects heavy harnesses when context is tight.
- It creates a lean variant instead of forcing a famous or powerful workflow.
- It records the routing decision in `.tink/current/plan.md` and `.tink/current/notes.md`.
- It connects routing to maintenance: memory, hone, purge, or index metadata updates.

## Candidate score

- Specificity: 5/5. It targets tool/harness overload, not generic coding.
- Actionability: 5/5. It changes the selected set and may reject powerful tools.
- Verifiability: 4/5. Evidence is the selected set, rejected heavy tools, and final sufficiency report.
- Reuse likelihood: 5/5. Applies to most agentic workflows with many available tools.
- Context cost: 4/5. Small harness, but it may trigger synthesis/hone/purge when needed.

## Validation checklist

- [x] Required harness sections exist.
- [x] Name is narrow and hyphenated.
- [x] It does not duplicate `harness-synthesis`; it decides when synthesis is needed.
- [x] It includes `.tink/current/answers.md` reuse guidance.
- [x] It would have changed this task by choosing a small product-edit set instead of loading every research/framework skill.

## Expected first run behavior

For a task like “build an MVP landing page,” Tink should not load every available design, product, research, and multi-agent harness. It should choose a small set such as:

1. `harness-curation`
2. `code-change`
3. `ship` or `review`, only if needed

If the user asks for a broader workflow after the first slice, Tink can add one harness at a time.
