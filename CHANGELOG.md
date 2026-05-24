# Changelog

All notable changes to Tink are tracked here.

## [Unreleased]

### Planned (v1.1)

- Layered scope model: merge `global` (`~/.tink/`) + `repo` (`.tink/`) + `local` (`.tink/local/` or `.tink/settings.local.json`) following the Claude Code settings pattern. Tracked separately.


## [1.0.0] - 2026-05-25

First stable release. All hardening gates passed.

### Added

- `pre-publish-multi-agent-verify` harness: 5-agent parallel verification harness for npm publish readiness. Agents cover install matrix, UX walkthrough, doc consistency, secret leak audit, and slash/contract coverage.

### Fixed

- `update` subcommand never propagated template changes to existing installs. Commands, skills, and maintenance files now always overwrite on update; harnesses, hooks, memory, and config are preserved when user-modified (respects `weave` customizations).
- `VERSIONING.md` update command used `npx tink-harness@latest update` (npm registry form, fails before first publish). Changed to `npx github:dotoricode/tink-harness update` (GitHub form, always works).

### Removed

- Remaining phantom references to `context-habit-calibration` in `cast.md`, `list.md`, and `SKILL.md` (harness was merged into `harness-curation` in v0.1.5).


## [0.1.5] - 2026-05-24

### Added

- `tink-feedback-apply` harness: classify user feedback about Tink into the correct layer (behavioral, UX, preference, harness procedure, or new harness) and apply the minimum viable change.
- `/tink:list` output redesign: multi-line per harness, header field description, three categories (작업용 / 메타 / 이 저장소 전용), assessment section, and next-command suggestions.

### Changed

- Built-in harness `## Checks` sections replaced generic boilerplate with domain-specific checks:
  - `research`: decision named, options compared, facts/guesses labeled, recommendation follows evidence.
  - `review`: correctness/security/data/UX risk addressed, severity labeled, no speculative blockers.
  - `ship`: CI checks pass or reason stated, rollback documented, artifacts listed, risks explicit.
- `ship` Plan step 3: "Prepare notes for humans" → "Draft PR or release summary: what changed, what risks, what rollback."
- `harness-curation` now includes context habit calibration (signals, 6 habit types, calibration procedure) as an inline section. No separate harness needed.
- `index.json`: `harness-synthesis` and `harness-curation` classified as `kind: "meta"` to distinguish from work harnesses.

### Removed

- `context-habit-calibration` standalone harness. Its content is now part of `harness-curation`.


## [0.1.4] - 2026-05-23

### Added

- `/tink:update` slash command: detects install source, diagnoses user-modified files, and shows the safe update command.
- `npx tink-harness update` subcommand: data-preserving update that keeps user-modified files. Use `--force` to overwrite everything (data loss risk).
- HARNESS.md harness catalog for fast human scanning.
- Hard-gate behavior for `ship` harness (release/publish/deploy/PR) — runs the safety gate at initial approval, not just at the first risky step.

### Changed

- Default installer language now auto-detects from `LANG`/`LANGUAGE`/`LC_ALL`, falling back to English; previously hardcoded to Korean.
- README Update section recommends `npx ... update` only. The `install --force` path is no longer documented as a user-facing option (the `--force` flag remains in the code for emergency use but is not advertised).
- `/tink:cast` approval format uses plain language for the soft-gate review block; internal labels are kept in code/docs but not shown to the user.
- `/tink:cast` UX overhauls: shorter prompts, fewer approval gates for trivial tasks, single consolidated approval for soft-gate cases.

### Fixed

- Restored the README hero image after the previous fix targeted the wrong surface.
- Increased the installer TINK banner contrast for dark terminal themes.


## [0.1.3]

Skipped during pre-v1 sequencing.


## [0.1.2] - 2026-05-22

### Changed

- Added a synthesis probe so `/tink:cast` can detect when a built-in harness is only a generic fit.
- Made run-only draft harnesses the default path for generic-fit cases, with saving still requiring separate approval.
- Clarified that `harness-synthesis` should handle both `no fit` and `generic fit` cases.

## [0.1.1] - 2026-05-22

### Added

- Existing-user update instructions for Claude Code plugin installs.
- Standalone compatibility installer refresh command using `--force`.
- Maintenance evidence structure: approval ledger and weave queue templates.
- Run record fields for selected, rejected, actually loaded, and maintenance evidence.

### Changed

- Bumped the Claude Code plugin version to make `/plugin update` detect the latest release.
- Clarified `unknown` evidence handling for `/tink:list`.
- Added evidence grades for `/tink:frog` and evidence handles for `/tink:weave`.

## [0.1.0] - 2026-05-22

### Added

- Initial pre-v1 plugin shape for Tink.
- Plugin-first `/tink:*` command surface.
- Standalone compatibility installer.
- Built-in harnesses, setup flow, optional hook recommendation, and visible `.tink/` state model.
