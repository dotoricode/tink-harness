# Update Diagnosis

Update diagnosis makes update problems easier to inspect without adding a new command.

Use it inside `/tink:update`, `$tink:update`, troubleshooting docs, and verification recipes.

Check:

- expected install surface: Claude Code, Codex, or both
- actual command and skill files
- preserved user-modified files
- removed legacy Codex skill paths
- missing schema or maintenance files
- final `Update Result Summary`

The next action should point to the smallest useful recipe, usually `docs/update-verification-recipe.md` or `docs/update-troubleshooting.md`.
