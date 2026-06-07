# Context Pack

## Task
- Add context artifacts to Tink cast run state.

## Selected Harnesses
- code-change
- docs

## Contract Summary
- Update cast guidance so every non-trivial run creates context artifacts.
- Add schema coverage for the machine-readable context map.
- Verify command/template sync and package/install behavior.

## Included Context
- `commands/cast.md`: root command behavior.
- `templates/claude/commands/tink/cast.md`: installable command copy.
- `templates/codex/skills/tink-cast/SKILL.md`: visible Codex `$tink:cast` alias behavior.
- `templates/codex/skills/tink-core/RULES.md`: shared Codex Tink operating rules.
- `templates/tink/schemas/context-map.schema.json`: context map schema.
- `tests/test_templates.py`: static package and install verification.

## Repo Signals
- `context_graph_lite.rules.claude-command-sync`: selected the three cast command copies and `tests/test_templates.py` after a cast command path changed.
- `verification_hints.command-template-sync`: adds a required sync check for command/template copies.
- `verification_hints.schema-shape`: adds a required schema shape check when context artifact schemas change.

## Excluded Context
- `bin/install.js`: already copies schema directories generically.
- external research links: not needed for this local contract slice.

## Verification Implications
- `npm test` must pass.
- Final answer should cite fixture/schema evidence, not raw logs.
