# Update Verification Recipe

Use this recipe after `tink-harness update` to decide whether the update looks healthy.

If something already looks wrong, see `docs/update-troubleshooting.md`. This document focuses on the normal verification path.

## Quick Check

When developing this repo, run:

```bash
npm test
```

As a normal user, run this from the repo you want to update:

```bash
npx tink-harness@latest update --yes
```

Then read `Update Result Summary`.

## Check Order

### 1. Surface

Check `Surfaces`.

- `claude`: Claude Code commands and skill refreshed.
- `codex`: Codex `$tink:*` skills and repo `.tink/` files refreshed.
- `all`: both Claude Code and Codex refreshed.

If Codex is installed in a custom location, also check `Codex target`.

### 2. Codex Skills

For Codex, these should exist:

- `tink-cast`
- `tink-verify`
- `tink-list`
- `tink-frog`
- `tink-weave`
- `tink-setup`
- `tink-update`
- `tink-core/RULES.md`

Expected state:

- `skills/tink` is removed.
- The picker shows action skills.
- `tink-core` is shared internal guidance, not a user-facing action.

### 3. Claude Code Commands

For Claude Code, these commands should exist:

- `/tink:setup`
- `/tink:cast`
- `/tink:verify`
- `/tink:list`
- `/tink:frog`
- `/tink:weave`
- `/tink:update`

When developing Tink itself, `npm test` verifies the 3-copy command sync rule.

### 4. Schemas

These files should exist:

- `.tink/schemas/contract.schema.json`
- `.tink/schemas/context-map.schema.json`
- `.tink/schemas/verification.schema.json`
- `.tink/schemas/session.schema.json`

They keep `$tink:cast` and `$tink:verify` aligned on the same contract shape.

### 5. Preserved Files

Check `Preserved user-modified files`.

Common preserved files:

- `.tink/config.json`
- `.tink/harnesses/*`
- `.tink/memory/*`

Do not use `--force` for ordinary update verification because it changes the preservation behavior.

### 6. Next Command

Check the final `Next` line.

- Claude Code: `/tink:cast <task>`
- Codex: `$tink:cast <task>`

Before starting large work, try a small non-trivial task and confirm that `$tink:cast` or `/tink:cast` asks for approval before proceeding.

## Healthy Update Criteria

- The update command exits successfully.
- `Update Result Summary` appears.
- The intended surface appears in the summary.
- Legacy Codex `skills/tink` is removed.
- Action skills or slash commands are installed.
- Schema files exist.
- User-modified files appear under `Preserved user-modified files` and keep their content.
- The next command matches Claude Code or Codex.

## When To Troubleshoot

Use `docs/update-troubleshooting.md` when:

- old `tink` still appears in the Codex picker;
- schema files are missing;
- update may have run from the wrong repo;
- Windows encoding warnings make output hard to interpret;
- `Update Result Summary` shows an unexpected target path.
