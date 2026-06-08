# Changelog

All notable changes to Tink are tracked here.

## [Unreleased]

No unreleased changes yet.


## [1.5.0] - 2026-06-08

### Changed

- Codex-only install/update now removes repo-local Tink Claude Code command files under `.claude/commands/tink/*.md` so Codex no longer shows them as stale `Source Command Tink ...` entries after a Codex-only refresh.
- Codex-only install/update now removes the old repo-local `.claude/skills/tink/SKILL.md` Tink surface when it matches the known generated Tink skill, while preserving unknown user-authored content.
- Update troubleshooting and verification docs now explain when `Source Command Tink ...` is stale and when it is expected because the repo intentionally keeps the Claude Code surface.
- README and Korean README now highlight the v1.5.0 update behavior for existing Codex users.

### Added

- Regression coverage for Codex-only update cleanup of repo-local Claude command and skill surfaces.
- Korean PR history draft for the v1.5.0 release in `docs/pr/2026-06-08-v1.5.0.ko.md`.


## [1.4.0] - 2026-06-08

### Added

- `context-metrics-evaluation.schema.json` for `.tink/current/context-metrics-evaluation.json`.
- Context Metrics Evaluator run-state artifact guidance for `/tink:cast` and `$tink:cast`.
- Fixture-ratio evaluation docs in Korean and English, explaining measured fixture scope versus production telemetry.
- Test-backed context metrics evaluation fixture that calculates all six context-efficiency metrics at or above the 90% target within fixture scope.
- Korean PR history draft for the Context Metrics Artifact work in `docs/pr/2026-06-08-context-metrics-artifact.ko.md`.

### Changed

- Work State Guide now includes `context-metrics-evaluation.json` in the reading order.
- README and Korean README now link to the Context Metrics Evaluator docs without adding a new command.


## [1.3.0] - 2026-06-08

### Added

- Context Budget Ledger fields for `context-map.json` entries: `role`, `cost`, `reuse_signal`, `verification_link`, `staleness`, and `evidence_kind`.
- `context-map.json.efficiency_metrics` example shape for recording six context-efficiency scores with basis, confidence, evidence refs, and limits.
- Current-run fixture examples that connect selected context to verification links and mark avoid-next-time exclusions.
- Repo signal `context_budget_policy` fixture guidance for scoring selected Context Graph Lite candidates without adding a public `tink index` command.
- Korean-first Context Budget Ledger documentation with an English companion.
- Korean context-engineering efficiency HTML explainer for the current operating model and expected improvement ranges.
- Korean PR history draft for the Context Budget Ledger work in `docs/pr/2026-06-08-context-budget-ledger.ko.md`.

### Changed

- `/tink:cast` and `$tink:cast` guidance now asks context artifacts to record role, cost, reuse signal, verification link, staleness, and evidence kind when useful.
- Work State Guide now explains how to read Context Budget Ledger fields.
- README and Korean README now link to the Context Budget Ledger docs without expanding the main body.


## [1.2.2] - 2026-06-08

### Added

- Work-unit docs for the remaining roadmap: verification evidence details, external context policy, harness lifecycle signals, memory decision layers, context change review, and update diagnosis.
- External context policy and harness lifecycle schemas, plus fixtures for context changes, policy examples, and lifecycle recommendations.
- Installed memory decision folders for approved, candidate, rejected, and evidence-backed memory.
- Work State Guide explaining how to read `.tink/current/contract.json`, `context-pack.md`, `context-map.json`, `excluded-context.md`, `verification.json`, and `notes.md`.
- Phase 5 Update Confidence plan for safer existing-user update flows.
- Korean companion docs for the Work State Guide and Phase 5 Update Confidence plan.
- Korean implementation audit and roadmap for the larger Tink idea set in `docs/tink-idea-implementation-plan.ko.md`.
- HTML summary of v1.2.0 improvements in `docs/pr/2026-06-07-v1.2.0-improvements.html`.
- Existing-user Codex update smoke test covering legacy `skills/tink/SKILL.md` cleanup, refreshed action skills, new schemas, and preserved user-modified schema files.
- Codex `$tink:cast` approval protocol and compact approval request examples so non-trivial runs ask before creating run state, loading harnesses, editing files, or running commands.
- Update Result Summary output for `tink-harness update`, including changed paths, preserved user-modified files, removed legacy paths, install locations, and the next command.
- Existing user-modified `.tink/config.json` is now fully preserved during update unless `--force` is used.
- Update troubleshooting docs in English and Korean, linked from README without expanding the README body.
- Update verification recipe docs in English and Korean, linked from README as a short post-update checklist.
- Context Graph Lite fixture rules for cast context selection, including changed-path-to-context coverage without adding a public `tink index` command.
- Korean companion doc for Repo Signals and Context Graph Lite.
- Current-run context artifact examples now show how `context_graph_rule` signals explain selected related files and excluded public graph indexing.
- Korean PR history draft for the Phase 5/6 follow-up work in `docs/pr/2026-06-07-phase-5-6-follow-up.ko.md`.

### Changed

- README and Korean README now link to the work-state guide, Phase 5 update-confidence plan, update verification recipe, and update troubleshooting docs.


## [1.2.1] - 2026-06-07

### Changed

- README now shows a GitHub Release badge and an explicit latest release line so the repository front page reflects the current release even when badge caches lag.
- Published the README/release-display patch so GitHub source and the npm package stay aligned after the v1.2.0 publish.


## [1.2.0] - 2026-06-07

### Added

- Codex autocomplete aliases matching the Claude Code command surface: `$tink:cast`, `$tink:verify`, `$tink:list`, `$tink:frog`, `$tink:weave`, `$tink:setup`, and `$tink:update`.
- Contract-first context artifacts for non-trivial runs: `context-pack.md`, `context-map.json`, and `excluded-context.md`.
- Repo Signal fixtures and documentation so `/tink:cast` can select relevant tests, schemas, sync partners, and verification hints without adding a new `tink index` command.
- Verify Runner schema and fixtures for `.tink/current/verification.json`, including pass, fail, blocked, skipped, final report, notes summary, and maintenance signal behavior.
- MCP Safe Profile documentation and external-context profile schema support for sources such as Figma, GitHub, official docs, dashboards, API responses, screenshots, attachments, and runbooks.
- Compatibility policy documenting that new Tink work must support Claude Code and Codex, plus macOS and Windows.
- PR history draft for this release in `docs/pr/2026-06-07-v1.2.0.md`.

### Changed

- Codex documentation and installer next-step guidance now prefer `$tink:*` spelling while keeping legacy `$tink <action>` prompts compatible.
- Project guidance now uses lower-case `templates/codex/skills/` and the actual `.claude/` / `.claude-plugin/` paths so Mac/Linux case-sensitive filesystems match the documented structure.
- Codex skill display is focused on action aliases only; shared Codex rules now live in non-visible `tink-core/RULES.md`.
- `/tink:cast` records included, excluded, and external context more explicitly, including sensitivity, confidence, source handles, and verification hints.
- `/tink:verify` now uses one portable runner model for Claude Code `/tink:verify` and Codex `$tink:verify`.
- README and Korean README now explain the 1.2.0 release highlights and point to compatibility, repo signal, and MCP Safe Profile docs.

### Fixed

- Existing Codex installs that still have the old visible `skills/tink/SKILL.md` directory are cleaned up during install/update when it is recognized as the legacy Tink skill.

### Removed

- Removed the old installable Codex `tink` skill surface so the picker no longer shows duplicate or awkward `Tink: Tink` entries.


## [1.1.1] - 2026-05-26

### Added

- Small Writ-inspired rule selection: rule graph nodes now distinguish `mandatory` and `retrievable` guidance with phase, budget cost, and keyword metadata.
- Current-run `session.json` schema so Tink can record `loaded_rule_ids_by_phase` and avoid repeating the same rule guidance during a run.
- Verification evidence and friction templates: `/tink:verify` now documents `.tink/current/verification.json` evidence and `.tink/maintenance/friction.jsonl` failure signals.

### Changed

- `/tink:cast`, `/tink:verify`, and `/tink:weave` now describe the smaller rule-loading path: mandatory first, keyword retrieval second, phase dedupe, compact evidence, then repeated-friction promotion through weave.
- README and graph docs now explain the compact rule graph, verification evidence, and friction signal flow.


## [1.1.0] - 2026-05-26

### Added

- Contract-first run model: `/tink:cast` now writes `.tink/current/contract.json` for non-trivial runs so task type, risks, success conditions, forbidden actions, verification, and evidence are structured before harness bodies are loaded.
- `/tink:verify` command: runs the checks promised in the current contract, records compact evidence, and feeds failed checks into weave as `check_failed` signals.
- Repo-local rule graph templates in `.tink/rules/index.json`, plus `contract.schema.json`, so Tink can select relevant harnesses, checks, and opt-in guard candidates without loading large Markdown by default.
- Opt-in guard templates for repeated failures that should become real Claude Code hook boundaries after explicit approval.
- Documentation for graph contracts, verification, and guard promotion.

### Changed

- `/tink:weave` can now classify improvements as harness edits, rule graph updates, or opt-in hook guard candidates.
- Hook recommendation script now uses readable multilingual messages and keeps the default hook advisory-only.

### Planned

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
