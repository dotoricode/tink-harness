<p align="center">
  <img src=".github/assets/hero.gif" alt="Tink Hero Banner" width="100%">
</p>

<h1>
  <strong>Tink</strong>
</h1>

<p>A small harness layer for Claude Code and Codex</p>

<p>
  Tink helps Claude Code or Codex choose the right harness, keep run state visible, and improve the harness set as you work.
</p>

<p>
  <em>Tink is <strong>knit</strong> in reverse: untying tangled workflows and knitting better ones back together. It also nods to Tinker Bell, the small helper at your side.</em>
</p>

<p>
  <a href="https://github.com/dotoricode/tink-harness/releases/tag/v1.6.0"><img src="https://img.shields.io/github/v/release/dotoricode/tink-harness?label=release&color=2ea44f" alt="GitHub release"></a>
  <a href="https://www.npmjs.com/package/tink-harness"><img src="https://img.shields.io/npm/v/tink-harness?label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://github.com/dotoricode/tink-harness/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/dotoricode/tink-harness/ci.yml?branch=main&label=ci" alt="CI"></a>
  <a href="https://github.com/dotoricode/tink-harness/blob/main/LICENSE"><img src="https://img.shields.io/github/license/dotoricode/tink-harness" alt="License"></a>
  <a href="https://github.com/dotoricode/tink-harness/stargazers"><img src="https://img.shields.io/github/stars/dotoricode/tink-harness?style=social" alt="GitHub stars"></a>
</p>

<p><strong>Latest package:</strong> v1.8.0 - Adds visible-thinking harnesses for requirements interviews, consensus planning, goal checkpoints, and delegation briefs. Latest minor release notes: <a href="https://github.com/dotoricode/tink-harness/releases/tag/v1.8.0">v1.8.0</a>.</p>

**English** · [한국어](README.ko.md)

---

## Why I made this

New coding harnesses show up almost every day. Many of them are genuinely useful.

At first, I tried them one by one and kept the ones that fit me. But the more I mixed them, the more my environment got tangled. Resetting everything again and again was tiring, so I ended up falling back to a skill-based workflow that I could understand and control.

Then I used Hermes Agent for a while. What stayed with me was the way it gets better through use: repeated work turns into reusable skills, mistakes become memory, and the system slowly adapts to the person using it.

Tink started from a simple question:

> Could Claude Code or Codex grow with me in the same way?

Not by adding a big framework. Not by running more agents. Just by helping Claude or Codex choose the right harness for the current task, create one when nothing fits, and improve the set over time.

## Install

Claude Code plugin install:

```text
/plugin marketplace add dotoricode/tink-harness
```

```text
/plugin install tink@tink-harness
```

```text
/reload-plugins
```

```text
/tink:setup
```

Standalone compatibility installer:

```bash
npx tink-harness@latest install
```

Standalone installer auto-detects `LANG` (English fallback). Pass `--lang=en|ko|zh` to override.

Codex skill install:

```bash
npx tink-harness@latest install
```

During install, select `Codex` when asked which agent surface to install. You can select both `Claude Code` and `Codex` in the same run. Then open Codex and use `$tink:cast <task>`.

## Update

Claude Code plugin users:

```text
/plugin marketplace update tink-harness
```

```text
/plugin update tink@tink-harness
```

```text
/reload-plugins
```

If update does not find the latest version, uninstall and install again:

```text
/plugin uninstall tink@tink-harness
```

```text
/plugin install tink@tink-harness
```

To update an existing standalone install (keeps user-modified files):

```bash
npx tink-harness@latest update
```

For Codex:

```bash
npx tink-harness@latest update
```

During update, select the installed agent surface you want to refresh.

To quickly verify the updated install, see `docs/update-verification-recipe.md` or `docs/update-verification-recipe.ko.md`.

If an update looks stale or incomplete, see `docs/update-troubleshooting.md` or `docs/update-troubleshooting.ko.md`.

## What's new in 1.8.0

This minor release brings GJC-style visible thinking into Tink without adding new commands.

- `/tink:cast` and `$tink:cast` can now select `requirements-interview`, `plan-consensus`, `goal-checkpoint`, and `delegation-brief`.
- Long runs can record `.tink/current/goals.json`; handoff or parallel-review plans can record `.tink/current/delegation.md`.
- Tink still does not start workers, tmux panes, or worktrees from these harnesses. Delegation remains a visible brief unless another approved workflow runs it.

## What's new in 1.7.1

This patch fixes a destructive interaction between the "Both" surface selection and "Clean Codex picker."

- Selecting "Both (Claude Code + Codex)" and "Clean Codex picker" in the same install/update run no longer deletes the Claude Code commands and skills. The option is now hidden when both surfaces are selected — it only appears when Codex is the sole surface.

## What's new in 1.7.0

This minor release removes two installer UX rough edges.

- The surface selection step now uses a single-choice prompt — Claude Code, Codex, or Both — instead of a multi-checkbox toggle, so the selected state is immediately visible on any terminal.
- The component selection prompt now names the surface being configured, so you see a surface-specific prompt rather than the same generic message regardless of what you selected.

## What's new in 1.6.3

This patch makes CLI options visible in the interactive installer.

- The wizard now has an `Advanced options` step with `Preview only (--dry-run)`, `Overwrite user-modified files (--force)`, and `Clean Codex picker (--clean-codex-picker)` when Codex is selected.
- Install/update output now prints the selected option state, so you can see whether preview, force overwrite, or Codex picker cleanup is active.
- CLI flags still work for non-interactive runs and seed the same visible choices when the wizard is used.

## What's new in 1.6.2

This patch makes the installer clearer for mixed Claude Code + Codex setups.

- Codex action skills now install with names like `Tink: Cast`, `Tink: Verify`, and `Tink: Update` instead of generic `Cast`/`Verify` labels.
- The component picker now separates `Claude Code Tink skill` from `Codex Tink skills` when both surfaces are selected.
- Install/update output now prints the repo, shared `.tink`, Claude Code, and Codex target paths so you can see where the selected choices will land.
- `--clean-codex-picker` and `TINK_CLEAN_CODEX_PICKER=1` can remove repo-local Claude Tink command/skill surfaces that make Codex show noisy `Source Command Tink ...` entries.

## What's new in 1.6.1

This patch fixes the update path for existing installs.

- `tink-harness update` now refreshes the generated legacy `.tink/rules/index.json` from v1.5.x so existing users receive the v1.6.0 graph-rule seed rules.
- User-modified rule graphs are still preserved when they contain custom rules or rule evidence.

## What's new in 1.6.0

This release makes Tink's small rule graph more useful during real work.

- Seed rules now connect common maintenance work to related files, harnesses, and checks, such as README bilingual sync, version metadata sync, Claude Code command 3-copy sync, and installer/update smoke checks.
- `/tink:cast` and `$tink:cast` guidance now records rule `reason`, `risk`, `include_paths`, and `checks` as reviewable context evidence instead of silently loading extra files.
- `/tink:weave` and `/tink:frog` now include rule-quality review so reusable rules can be kept, rewritten, split, merged, or marked as needing more evidence.
- The graph remains file-based and small. This release still does not add a public `tink index` command, watcher, generated cache, database, or external service.

## Recent foundation from 1.2.0+

This release makes Tink work as one harness layer across Claude Code and Codex.

- Codex now installs focused `$tink:*` action skills instead of one broad visible `tink` skill, so the picker shows commands like `$tink:cast` and `$tink:verify` cleanly.
- Non-trivial runs now create context artifacts: `context-pack.md`, `context-map.json`, and `excluded-context.md`.
- Repo Signals and Context Graph Lite help `/tink:cast` and `$tink:cast` choose relevant tests, schemas, sync partners, and verification hints without adding a new `tink index` command.
- Context Budget Ledger fields, fixture-ratio evaluation, run-history rollup, the 90 percent threshold status, and future real-run record boundaries are documented in `docs/context-budget-ledger.md`, `docs/context-budget-ledger.ko.md`, `docs/context-metrics-evaluator.md`, `docs/context-metrics-evaluator.ko.md`, `docs/context-run-history-rollup.md`, `docs/context-run-history-rollup.ko.md`, `docs/context-threshold-status.md`, `docs/context-threshold-status.ko.md`, `docs/context-run-record-policy.md`, and `docs/context-run-record-policy.ko.md` without adding a new command.
- `/tink:verify` and `$tink:verify` share one portable Verify Runner model and write compact evidence to `.tink/current/verification.json`.
- External context now follows the MCP Safe Profile: include only the smallest useful source handle, mark confidence and sensitivity, exclude unsafe context visibly, and connect important claims to verification.

## Commands

Tink keeps the command surface small.

Tink is plugin-first in Claude Code. Commands are namespaced under `tink`, so the public surface stays `/tink:*` and avoids generic command conflicts. In Codex, Tink installs matching `$tink:*` skills for autocomplete: `$tink:cast`, `$tink:verify`, `$tink:list`, `$tink:frog`, `$tink:weave`, `$tink:setup`, and `$tink:update`. Legacy `$tink cast` style prompts still work, but `$tink:*` is the preferred spelling.

### `/tink:cast` / `$tink:cast`

**cast** means to place the first loops on the needle (코잡기, Cast on). In knitting, casting on is the very first step — it sets the foundation for everything that follows.

In Tink, `cast` is the main path. It reads the task, chooses or drafts the right harness, runs a quick internal sanity check, creates `.tink/current/` as the visible workbench, and starts the first safe step after approval.

Use it when the task is more than a quick answer.

For bigger or fuzzier work, `cast` can expose more of the agent's thinking as files without adding new commands. Ambiguous ideas can start with `requirements-interview`, broad plans with `plan-consensus`, long runs with `goal-checkpoint`, and safe handoffs with `delegation-brief`. These are reusable harnesses selected by `/tink:cast` or `$tink:cast`, not separate CLI workflows.

### `/tink:verify` / `$tink:verify`

`verify` runs the checks promised in `.tink/current/contract.json`.

Tink now writes a small task contract for non-trivial runs: what kind of work this is, what must be true when it is done, what is forbidden, and which commands or manual checks prove it. `/tink:verify` uses that contract instead of relying on a vague "looks done" claim.

Use it before release, publish, deploy, public PR, or any task where evidence matters.

### `/tink:frog` / `$tink:frog`

**frog** means to rip out stitches (풀시오, Frogging). In knitting, frogging unravels rows that went wrong — the name comes from the sound of pulling out yarn, "rip it, rip it."

In Tink, `frog` looks for harnesses that are unused, overlapping, too broad, or no longer worth their context cost. It proposes cleanup, but does not delete without approval.

Use it when the harness set starts to feel noisy.

### `/tink:weave` / `$tink:weave`

**weave** means to weave in the ends (실오라기 정리, Weave in). In knitting, weaving in secures the loose threads left after finishing, giving the work its final shape.

In Tink, `weave` improves an existing harness using real use, failures, and corrections. It should make the next run clearer, safer, or easier to verify.

Use it when a harness is useful but slightly wrong.

### Other commands

- `/tink:setup` / `$tink:setup`: choose language, install scope, git tracking, and hook policy.
- `/tink:list` / `$tink:list`: inspect available harnesses and recent usage signals.
- `/tink:update` / `$tink:update`: detect install source and show the safe update command.

## How it works

Tink uses files you can inspect:

- `.tink/harnesses/`: reusable task harnesses
- `.tink/rules/`: a small rule graph that chooses only relevant harnesses, checks, and opt-in guard candidates
- `.tink/schemas/`: structured file schemas, including the current run contract
- `.tink/current/`: the current run state
- `.tink/runs/`: compact records from finished, blocked, canceled, or replaced runs
- `.tink/maintenance/`: verification, friction, and weave signals that help repeated failures become approved improvements
- `.tink/memory/`: approved mistakes, preferences, and lessons

When selected, current-run artifacts may also include `.tink/current/goals.json` for goal checkpoints or `.tink/current/delegation.md` for handoff packets. Tink prepares those briefs as visible state; it does not start workers, tmux panes, or worktrees unless a separate approved workflow does so.

The rule graph stays small on purpose. Tink loads matching mandatory rules first, retrieves only relevant optional rules by task facts or keywords, and records loaded rule ids by phase so the same guidance is not repeated in one run.

Design notes live in `docs/`. The compatibility baseline is `docs/compatibility-policy.md`: every new slice should consider Claude Code and Codex, plus macOS and Windows. Repo signal behavior is described in `docs/repo-signals.md` or `docs/repo-signals.ko.md`. The lightweight graph-rule adoption plan is `docs/graph-rule-adoption-plan.ko.md`. External context safety is described in `docs/mcp-safe-profile.md` and `docs/external-context-policy.md`. To read or review `.tink/current/` state, start with `docs/work-state.md` or `docs/work-state.ko.md`. Update confidence is still documented in `docs/phase-5-update-confidence.md` or `docs/phase-5-update-confidence.ko.md`. The planned work-unit list is `docs/planned-work-units.md` or `docs/planned-work-units.ko.md`, with details in the verification evidence, harness lifecycle, memory decision, context change, and update diagnosis docs. The broader Korean idea audit and roadmap is `docs/tink-idea-implementation-plan.ko.md`.

The important rule is approval.

Tink may suggest a harness, a memory entry, a cleanup, or an improvement. Before each run is committed, Tink runs one quick sanity check and surfaces a proposal only when something important is at stake. Low-risk steps let you continue with recorded assumptions; irreversible or externally visible actions (publish, deploy, deletions, broad changes) require explicit approval. Saving anything reusable — a new harness, a memory entry, a `.claude/` workflow file — always needs its own separate approval; approving the current run does not authorize saves that future installs would inherit.

## What Tink is not

Tink is not:

- a coding agent
- a workflow engine
- a multi-agent runtime
- a prompt library
- a replacement for Claude Code or Codex

It is a small harness layer for Claude Code or Codex.

## License

MIT
