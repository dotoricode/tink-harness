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
  <a href="https://github.com/dotoricode/tink-harness/releases/tag/v1.8.0"><img src="https://img.shields.io/github/v/release/dotoricode/tink-harness?label=release&color=2ea44f" alt="GitHub release"></a>
  <a href="https://www.npmjs.com/package/tink-harness"><img src="https://img.shields.io/npm/v/tink-harness?label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://github.com/dotoricode/tink-harness/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/dotoricode/tink-harness/ci.yml?branch=main&label=ci" alt="CI"></a>
  <a href="https://github.com/dotoricode/tink-harness/blob/main/LICENSE"><img src="https://img.shields.io/github/license/dotoricode/tink-harness" alt="License"></a>
  <a href="https://github.com/dotoricode/tink-harness/stargazers"><img src="https://img.shields.io/github/stars/dotoricode/tink-harness?style=social" alt="GitHub stars"></a>
</p>

<p><strong>Latest package:</strong> v1.8.0 - Adds visible-thinking harnesses for requirements interviews, consensus planning, goal checkpoints, and delegation briefs. See <a href="CHANGELOG.md">CHANGELOG</a> for release history.</p>

**English** · [한국어](README.ko.md) · [Changelog](CHANGELOG.md)

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

Tink can also read those records into a harness health summary. The summary is deliberately simple: it shows which harnesses were used, where checks failed or got blocked, and which harnesses may deserve a weave improvement, a frog cleanup review, or more observation. It only prepares suggestions. It does not edit, merge, archive, delete, save memory, or update rules without the same explicit approval gates as the rest of Tink.

If a lifecycle summary exists at `.tink/maintenance/harness-lifecycle.json`, the installed read-only helper can turn it into a local HTML report:

```bash
node .tink/tools/generate-harness-lifecycle-summary.mjs
node .tink/tools/render-harness-health-report.mjs
```

When selected, current-run artifacts may also include `.tink/current/goals.json` for goal checkpoints or `.tink/current/delegation.md` for handoff packets. Tink prepares those briefs as visible state; it does not start workers, tmux panes, or worktrees unless a separate approved workflow does so.

The rule graph stays small on purpose. Tink loads matching mandatory rules first, retrieves only relevant optional rules by task facts or keywords, and records loaded rule ids by phase so the same guidance is not repeated in one run.

Design notes live in `docs/`. The compatibility baseline is `docs/compatibility-policy.md`: every new slice should consider Claude Code and Codex, plus macOS and Windows. Repo signal behavior is described in `docs/repo-signals.md` or `docs/repo-signals.ko.md`. The lightweight graph-rule adoption plan is `docs/graph-rule-adoption-plan.ko.md`. External context safety is described in `docs/mcp-safe-profile.md` and `docs/external-context-policy.md`. To read or review `.tink/current/` state, start with `docs/work-state.md` or `docs/work-state.ko.md`. Update confidence is still documented in `docs/phase-5-update-confidence.md` or `docs/phase-5-update-confidence.ko.md`. Context efficiency docs live in `docs/context-budget-ledger.md`, `docs/context-budget-ledger.ko.md`, `docs/context-metrics-evaluator.md`, `docs/context-metrics-evaluator.ko.md`, `docs/context-run-history-rollup.md`, `docs/context-run-history-rollup.ko.md`, `docs/context-threshold-status.md`, `docs/context-threshold-status.ko.md`, `docs/context-run-record-policy.md`, and `docs/context-run-record-policy.ko.md`. The planned work-unit list is `docs/planned-work-units.md` or `docs/planned-work-units.ko.md`, with details in the verification evidence, harness lifecycle, memory decision, context change, and update diagnosis docs. The broader Korean idea audit and roadmap is `docs/tink-idea-implementation-plan.ko.md`.

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
