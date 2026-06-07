# Phase 5: Update Confidence

Phase 5 should make existing users confident that updating Tink is safe, understandable, and reversible.

This phase is not about adding a new command surface. It should improve the existing `install`, `update`, `$tink:update`, `/tink:update`, docs, and verification flow.

## Why This Is Needed

v1.2.0 added focused Codex skills, context artifacts, Repo Signals, Verify Runner evidence, and MCP Safe Profile guidance. Those changes are useful, but existing users may still wonder:

- Did update remove the old Codex `tink` skill?
- Did it install the new action skills?
- Did it add the new schemas?
- Did it preserve my local harnesses, memory, hooks, and config?
- What should I run first after updating?
- How do I know the update worked?

Phase 5 should answer those questions directly.

## Goals

- Make update behavior explain what changed and what was preserved.
- Add smoke tests for existing installs, not only clean installs.
- Keep update behavior compatible with Claude Code and Codex.
- Keep update behavior portable across macOS and Windows.
- Preserve user-modified files unless a template is explicitly in the always-update set.
- Avoid broad automation, hidden migrations, or a new `tink index` command.

## Proposed Slices

### Slice 1: Existing User Update Smoke Tests

Add test coverage for:

- Codex install with legacy `skills/tink/SKILL.md` updates to focused action skills.
- Existing stale Codex action skill files are refreshed.
- New schemas such as `context-map.schema.json` and `verification.schema.json` are added.
- User-modified preserved files stay preserved.
- Claude Code command 3-copy behavior remains aligned after update.

### Slice 2: Update Result Summary

Improve installer output after `update` so users can see:

- installed surfaces;
- updated command or skill locations;
- removed legacy Codex skill path, when applicable;
- preserved user-modified files;
- next command to run.

This should be plain text, not a new state file.

### Slice 3: Troubleshooting Guide

Add a short update troubleshooting section:

- Codex skill picker still shows old `tink`;
- plugin update does not show latest;
- schema files are missing;
- local `.tink/current/` state is stale;
- Windows shell encoding warning appears during tests.

### Slice 4: Verification Recipe

Document a small verification recipe:

```bash
npm test
npx tink-harness@latest update --yes
```

Then inspect:

- Codex skill directory;
- Claude command copies;
- `.tink/schemas/`;
- `.tink/config.json`;
- `.gitignore` policy.

## Done Means

- Existing-user update tests pass.
- README and Korean README explain the update confidence path.
- `$tink:update` and `/tink:update` guidance mention how to verify an update.
- No new public command is added.
- npm package contents still include the docs needed by README.

## Risks

- Overwriting user-modified files would break trust.
- Too much update output would become noisy.
- Codex and Claude Code behavior could drift if tests cover only one surface.
- Windows and macOS shell behavior can diverge if tests rely on shell-specific syntax.

## Preferred First Step

Start with existing-user update smoke tests. They give the clearest safety signal and make later output/docs changes less speculative.
