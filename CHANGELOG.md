# Changelog

All notable changes to Tink are tracked here.

## [Unreleased]

No unreleased changes yet.

## [1.9.8] - 2026-06-11

### Added

- Galaxy-styled harness map background: a slowly rotating 4-arm spiral of 760 particles (pink-to-cyan, screen-blended), 7 colored nebula glows, a breathing core glow, and a deeper space gradient — inspired by a Three.js galaxy reference while keeping the SVG map fully interactive.
- Neural signal pulses: glowing dots travel along every edge from source to target (3.2-7.4s, staggered), so connections read like firing synapses.

### Changed

- Signal pulses follow the map state: they hide with core mode/filters, dim in focus mode, and stay bright only on edges related to the selected node. Clicking the galaxy background clears the selection. prefers-reduced-motion disables rotation and pulses.

## [1.9.7] - 2026-06-10

### Added

- The harness map now looks like a planetary system: usage/evidence/score satellites orbit their harness slowly (28-63s per revolution, alternating directions) along dashed orbit rings, top harnesses get a Saturn-style ring, and a starfield with twinkling stars sits behind the graph.
- Selecting a node now dims and blurs everything unrelated (focus mode); clicking the background clears the selection and restores the detail panel.

### Fixed

- Dragging the map no longer triggers text selection on labels and captions (user-select disabled on the map panel).

## [1.9.6] - 2026-06-10

### Added

- The harness map is now fully navigable: wheel zoom toward the cursor (0.4x–5x), drag to pan, +/− and reset controls, and double-click to return to the full view.
- Nodes render as 3D-style spheres with radial gradients, depth shadows on interactive nodes, and a vignette background for depth.
- Added a "How to read this map" card to the graph tab's right rail with plain-language explanations of circles, colors, lines, satellites, controls, and edge types.

### Changed

- Reordered the graph right rail: reading guide → selected node → graph overview.
- Map help text now mentions zoom and drag controls.

## [1.9.5] - 2026-06-10

### Added

- Run timeline entries now show a colored outcome badge, a monospace timestamp, and harness chips instead of a comma list.
- The Activity tab gained a summary strip: total runs, run window, and completed/blocked/failed/recorded counts.
- Memory cards now show reference counts and referencing-harness chips derived from `uses_memory` graph edges.

### Fixed

- The lifecycle generator now reads YAML-frontmatter `outcome:` values from run records, so completed runs are counted as successes instead of unknown.
- Removed a generic "blocked" word match that flagged runs as blocked when the word merely appeared in prose.

## [1.9.4] - 2026-06-10

### Added

- Harness cards now sort by usage and open with a smooth expand animation showing richer details: last used, success/failure counts, context cost, co-used harness chips, score factors, safe next action, and evidence handles.
- Added an evaluation & maintenance history section to the Harnesses tab, fed by `.tink/maintenance/ledger.jsonl` (new `maintenance_events` field in the lifecycle summary).

### Fixed

- The lifecycle generator now strips a UTF-8 BOM before parsing JSONL files, so the first ledger entry is no longer dropped.

## [1.9.3] - 2026-06-10

### Added

- Graph nodes now drift gently with per-node organic float motion, staggered entrance animation, and a pulse ring on the selected node.
- Edges fade in progressively and respond to selection with smooth opacity/width transitions.
- Added a node-type color legend under the graph and polished the tooltip with fade/slide motion.

### Changed

- Graph hover now scales the node smoothly instead of only changing the stroke.
- The graph tab shows only graph-related information; honors prefers-reduced-motion.

## [1.9.2] - 2026-06-10

### Added

- Turned the harness health dashboard navigation into real tabs (Home, Harnesses, Memory, Knowledge Graph, Activity) with hash routing and smooth page transitions.
- Added a dedicated Home tab with hero overview, six key stat cards, health groups, latest activity preview, and cast routing rules.
- Added a Memory tab listing memory files referenced by visible runs, and an Activity tab with the full run feed.

### Changed

- The right rail now shows only sections relevant to the active tab (graph overview and selected panel appear on the graph tab only).
- Refined base typography: larger body text, improved heading hierarchy, and consistent line heights.
- Clicking a harness from rankings or routing rules now switches to the graph tab before selecting the node.


## [1.9.1] - 2026-06-10

### Changed

- Refined the local harness health report dashboard to improve readability by reducing redundant/unused content and aligning the layout to the defined `DESIGN.md` rules.
- Added guardrails in the graph and timeline paths so unknown/empty run records are de-emphasized and `recorded` states are surfaced clearly.
- Filtered out non-actionable harnesses from the visible graph/timeline (`hermes-agent`) and suppressed non-surfacing graph edge types (`co_used`) from the rendered report.
- Improved graph stability around node/tooltips to reduce apparent jitter on hover.
- Added hidden metadata so existing contract tests still detect required routing terms without exposing extra UI noise.

### Fixed

- Addressed a regression where timeline and graph sections could show unclear states for incomplete/empty harness IDs.

## [1.9.0] - 2026-06-09

### Added

- Expanded the harness lifecycle summary generator with ordered harness parsing, repeated sequence hints, and rule/memory references from visible run records.
- Added a derived graph view to harness lifecycle summaries so future reports can read harness, rule, memory, and stage relationships without adding a watcher or hidden cache.
- Added timeline events to harness lifecycle summaries and rendered recent run history in the local harness health HTML report.
- Added explainable candidate scores to harness lifecycle summaries and the local health report so weave, frog, merge, and observe candidates are easier to sort without automatic action.
- Added lifecycle state fields, including a `dormant_candidate` state that treats old usage as an archive review signal rather than delete evidence.
- Added a static graph overview to the local harness health report, summarizing lifecycle graph nodes and relationships without starting a server or watcher.

### Changed

- Updated README and planning docs to describe the implemented harness health summary, static report dashboard, lifecycle states, and remaining roadmap boundaries.
- Moved README release highlights into the changelog path and added top-level changelog links in the English and Korean README files.


## [1.8.0] - 2026-06-09

### Added

- Added four visible-thinking harnesses selected through `/tink:cast` and `$tink:cast`: `requirements-interview`, `plan-consensus`, `goal-checkpoint`, and `delegation-brief`.
- Added optional current-run artifact guidance for `.tink/current/goals.json` and `.tink/current/delegation.md`.
- Added rule graph routing for ambiguous requirements, broad plans, long runs, and safe delegation briefs without adding new public commands.
- Added Korean PR history draft for the v1.8.0 release in `docs/pr/2026-06-09-v1.8.0.ko.md`.

### Changed

- Updated Claude Code and Codex cast guidance so GJC-style interview, consensus planning, goal checkpoint, and delegation concepts stay inside Tink's small harness model.
- Updated README and work-state docs to explain the new harnesses and optional run-state files.


## [1.7.1] - 2026-06-09

### Fixed

- `Clean Codex picker (--clean-codex-picker)` option is no longer shown in the Advanced options step when both Claude Code and Codex surfaces are selected. The option only applies when switching from Claude Code to Codex exclusively, so showing it for mixed installs allowed users to accidentally delete their Claude Code commands and skills.


## [1.7.0] - 2026-06-09

### Changed

- Agent surface selection now uses a single-choice prompt (Claude Code / Codex / Both (Claude Code + Codex)) instead of a multi-checkbox toggle, eliminating the selected-state ambiguity when the cursor is on a pre-checked item.
- Component selection prompt now names the surface being configured — "Claude Code 설치 항목" or "Codex 설치 항목" — instead of a shared generic prompt, so users can see that the option list reflects the chosen surface.


## [1.6.3] - 2026-06-09

### Changed

- Interactive install/update now includes an `Advanced options` step so `--dry-run`, `--force`, and `--clean-codex-picker` are available as visible choices instead of CLI-only flags.
- Install/update output now prints selected option state for preview, force overwrite, and Codex picker cleanup.
- Non-interactive CLI flags still work and seed the same option state used by the interactive wizard.

### Added

- Regression coverage for visible advanced option labels and selected option output.
- Korean PR history draft for the v1.6.3 patch in `docs/pr/2026-06-09-v1.6.3.ko.md`.


## [1.6.2] - 2026-06-09

### Changed

- Codex action skill templates now install with names like `Tink: Cast`, `Tink: Verify`, and `Tink: Update` so the Codex picker shows the Tink namespace clearly.
- The installer now separates `Claude Code Tink skill` and `Codex Tink skills` when both Claude Code and Codex surfaces are selected.
- Install/update output now includes repo, shared `.tink`, Claude Code, Codex, and Codex picker cleanup target paths.

### Added

- `--clean-codex-picker` and `TINK_CLEAN_CODEX_PICKER=1` for removing repo-local Claude Tink command/skill surfaces that make Codex show noisy `Source Command Tink ...` entries.
- Regression coverage for mixed-surface component choices, Codex skill display names, and Codex picker cleanup.
- Korean PR history draft for the v1.6.2 patch in `docs/pr/2026-06-09-v1.6.2.ko.md`.


## [1.6.1] - 2026-06-09

### Fixed

- Existing installs from v1.5.x now refresh the generated legacy `.tink/rules/index.json` during `tink-harness update`, so users receive the v1.6.0 graph-rule seed rules through `npx tink-harness@latest update`.
- User-modified rule graphs with custom rules or rule evidence are still preserved during update.

### Added

- Regression coverage for generated legacy rule graph refresh and custom rule graph preservation.
- Korean PR history draft for the v1.6.1 patch in `docs/pr/2026-06-09-v1.6.1.ko.md`.


## [1.6.0] - 2026-06-09

### Added

- Graph-rule seed rules now route common Tink maintenance work to the right supporting files, harnesses, and verification checks without adding a public `tink index` command.
- `/tink:weave`, `/tink:frog`, and `$tink:*` guidance now treats rule `reason`, `risk`, `include_paths`, and `checks` as reviewable context-engineering evidence.
- Korean PR history draft for the graph-rule seed rules work in `docs/pr/2026-06-09-graph-rule-seed-rules.ko.md`.
- Korean PR history draft for the v1.6.0 release in `docs/pr/2026-06-09-v1.6.0.ko.md`.


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
