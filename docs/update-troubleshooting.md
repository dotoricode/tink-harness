# Update Troubleshooting

Use this guide when `tink-harness update` finishes but the installed state still looks stale or incomplete.

README should stay short. This document holds the symptom-specific checks.

## Start Here

After `tink-harness update`, read `Update Result Summary`.

- `Surfaces`: the refreshed target, such as `claude`, `codex`, or `all`.
- `Updated or added`: commands, skills, and schemas that changed.
- `Preserved user-modified files`: local files Tink did not overwrite.
- `Removed legacy paths`: old paths such as Codex `skills/tink`.
- `Installed locations`: where the files were written.

## Old `tink` Still Appears In Codex

Possible causes:

- The old broad Codex `skills/tink/SKILL.md` is still present.
- Repo-local Claude Code files such as `.claude/commands/tink/*.md` are being shown by Codex as `Source Command Tink ...`.
- Repo-local Claude Code skill `.claude/skills/tink/SKILL.md` is being shown by Codex as a broad `Tink` skill.
- `CODEX_HOME` points somewhere unexpected.
- Codex has not refreshed the skill list yet.

Run:

```bash
TINK_INSTALL_SURFACES=codex npx tink-harness@latest update --yes
```

Then check `Codex target`, `Removed legacy paths`, and `Codex skills` in the summary.

Expected state:

- `skills/tink` is gone.
- `.claude/commands/tink/*.md` and `.claude/skills/tink/SKILL.md` are gone for a Codex-only update.
- `tink-cast`, `tink-verify`, `tink-list`, `tink-frog`, `tink-weave`, `tink-setup`, and `tink-update` exist.
- `tink-core/RULES.md` exists as shared internal rules, but should not appear as a user action in the picker.

If you intentionally selected both Claude Code and Codex, repo-local Claude commands may remain. In that case `Source Command Tink ...` entries are expected because the repo still has Claude Code commands installed.

## Schema Files Are Missing

Check that `Install target` is the repo you meant to update.

Expected schema files:

- `.tink/schemas/contract.schema.json`
- `.tink/schemas/context-map.schema.json`
- `.tink/schemas/verification.schema.json`
- `.tink/schemas/session.schema.json`

If you ran update from a different working directory, run it again from the intended repo.

## Worried About User-Modified Files

By default, update preserves user-modified local harnesses, memory, and config.

Check:

- The file appears under `Preserved user-modified files`.
- You did not pass `--force`.

Commands, skills, and maintenance templates are refreshed to match the package version. Reusable local state should not change meaning without user approval.

## Claude Code Commands Look Stale

For this repo, command copies must stay in sync:

- `commands/<name>.md`
- `templates/claude/commands/tink/<name>.md`
- `.claude/commands/tink/<name>.md`

When developing Tink itself, run:

```bash
npm test
```

As a normal user, reload Claude Code or run `/reload-plugins` after updating the plugin.

## Windows Encoding Warnings

On Windows PowerShell or cp949 environments, some command output can show encoding warnings. If tests end with `OK`, this may be an environment warning rather than a failed update.

Useful checks:

- `npm test` passed.
- `node --check bin/install.js` passed.
- The file content is UTF-8 and not actually corrupted.

## Still Stuck

Record these details:

- update command used
- `Update Result Summary`
- OS
- `CODEX_HOME`
- current repo path
- intended surface: Claude Code, Codex, or both

This evidence helps diagnose install state without letting Tink make release or project decisions on the user's behalf.
