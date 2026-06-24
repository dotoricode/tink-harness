<p align="center">
  <img src=".github/assets/hero.webp" alt="Tink Hero Banner" width="100%">
</p>

<h1>
  <strong>Tink</strong>
</h1>

<p><strong>Stop losing context between Claude Code and Codex runs.</strong></p>

<p>
  Tink keeps every non-trivial agent task in visible files - a task contract, run state,
  verification steps, and reusable harnesses that are saved only after your approval.
  No server, no telemetry, no hidden state.
</p>

<p><sub>A small harness layer for Claude Code and Codex</sub></p>

<p>
  <a href="https://github.com/dotoricode/tink-harness/releases/tag/v1.14.0"><img src="https://img.shields.io/github/v/release/dotoricode/tink-harness?label=release&color=2ea44f" alt="GitHub release"></a>
  <a href="https://www.npmjs.com/package/tink-harness"><img src="https://img.shields.io/npm/v/tink-harness?label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://github.com/dotoricode/tink-harness/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/dotoricode/tink-harness/ci.yml?branch=main&label=ci" alt="CI"></a>
  <a href="https://github.com/dotoricode/tink-harness/blob/main/LICENSE"><img src="https://img.shields.io/github/license/dotoricode/tink-harness" alt="License"></a>
  <a href="https://github.com/dotoricode/tink-harness/stargazers"><img src="https://img.shields.io/github/stars/dotoricode/tink-harness?style=social" alt="GitHub stars"></a>
</p>

<p><strong>Latest package:</strong> v1.15.2 - <code>/tink:cast</code> without an argument now shows mode descriptions directly; setting a mode is silent. See <a href="CHANGELOG.md">CHANGELOG</a> for release history.</p>

**English** · [한국어](README.ko.md) · [Changelog](CHANGELOG.md)

---

## Who this is for

Use Tink when:

- Claude Code or Codex keeps losing task context between runs
- you repeat the same review / refactor / debug workflow by hand
- you want visible run state instead of hidden chat memory
- you want reusable agent workflows - saved only after explicit approval

If that sounds like your day, try it on a throwaway repo first:

```bash
npx tink-harness@latest install
```

## What you actually get

Every non-trivial task leaves plain files you can open, diff, and commit:

```text
.tink/current/                      # the active run - always inspectable
  contract.json                     #   what must be true when the task is done
  plan.md                           #   the visible plan
  checks.md                         #   verification to run before claiming "done"
.tink/runs/
  2026-06-11-1430-auth-refactor.md  # compact record of each finished run
.tink/harnesses/
  refactor-review.md                # reusable ways of working - approval-gated
```

## Why not just CLAUDE.md / slash commands / skills?

| Tooling | What it gives you | What Tink adds on top |
|---|---|---|
| CLAUDE.md | project-wide instructions | per-task contracts, run state, and verification |
| Slash commands | reusable prompts | harness selection, run records, progress tracking |
| Skills | reusable capability | usage lifecycle: health scores, cleanup and improvement signals |
| MCP | external context and tools | local, approval-gated workflow memory |

Tink composes with all of these - it does not replace them.

---

## Install & quick start

Try Tink in about a minute.

**Claude Code (plugin):**

```text
/plugin marketplace add dotoricode/tink-harness
/plugin install tink@tink-harness
/reload-plugins
/tink:setup
```

**Claude Code or Codex (standalone):**

```bash
npx tink-harness@latest install
```

The standalone installer auto-detects `LANG` (English fallback); pass `--lang=en|ko|zh` to override. During install you can pick `Claude Code`, `Codex`, or both - in Codex, start with `$tink:cast <task>`.

<details>
<summary>Repo-local Codex smoke test (CODEX_HOME)</summary>

```bash
set CODEX_HOME=%CD%/.codex
npx tink-harness@latest install --yes
```

</details>

Then hand Tink a real task instead of reading more docs:

```text
/tink:cast refactor the auth module     # Claude Code
$tink:cast refactor the auth module     # Codex
```

`cast` picks (or drafts) the right harness, writes a visible plan into `.tink/current/`, and starts the first safe step after your approval. Every finished run leaves a compact record - and those records become the dashboard below.

## See your harness health

After a few runs, one command turns your records into a local dashboard and opens it in your browser:

```bash
npx tink-harness dashboard          # add --no-open to just generate the file
```

Under the hood it runs the two read-only helpers (`node .tink/tools/generate-harness-lifecycle-summary.mjs`, then `node .tink/tools/render-harness-health-report.mjs`) and opens `.tink/maintenance/harness-health-report.html`.

![Tink dashboard demo - clicking a health group, browsing harness cards, and inspecting the 3D map](.github/assets/demo.gif)

<sub>If this matches your workflow, a ⭐ helps others find it.</sub>

An interactive 3D map of your harnesses, the rules and memory they use, and how they connect - each cluster gets its own color, and neural pulses travel along live relationships:

![Tink harness map - an interactive 3D view of harnesses, rules, memory, and stages](.github/assets/dashboard-map.png)

Harness cards sorted by real usage, with plain-language health summaries, an attention score, the approval history, and a suggested next action with copy-paste commands for both Claude Code and Codex:

![Harness cards sorted by usage with plain-language health and history](.github/assets/dashboard-harnesses.png)

No server, no telemetry, no hidden cache - it is a static local page that only prepares suggestions. Anything reusable still goes through Tink's approval gates.

---

## Measure GEO visibility

Tink includes a geobench product spec so maintainers can measure how often LLM answers mention, rank, and cite Tink across providers.

- Spec: [`geobench/tink-harness.yaml`](geobench/tink-harness.yaml)
- Runbook: [`docs/geobench.md`](docs/geobench.md)
- Metrics: hit rate, MRR, share of voice, citation rate/share, and confidence intervals

Use the benchmark for aggregate visibility checks only. Do not publish raw provider answers, secrets, or private run logs.

---

## Why I made this

*Tink is <strong>knit</strong> in reverse: untying tangled workflows and knitting better ones back together. It also nods to Tinker Bell, the small helper at your side.*

New coding harnesses show up almost every day. Many of them are genuinely useful.

At first, I tried them one by one and kept the ones that fit me. But the more I mixed them, the more my environment got tangled. Resetting everything again and again was tiring, so I ended up falling back to a skill-based workflow that I could understand and control.

Then I used Hermes Agent for a while. What stayed with me was the way it gets better through use: repeated work turns into reusable skills, mistakes become memory, and the system slowly adapts to the person using it.

Tink started from a simple question:

> Could Claude Code or Codex grow with me in the same way?

Not by adding a big framework. Not by running more agents. Just by helping Claude or Codex choose the right harness for the current task, create one when nothing fits, and improve the set over time.

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

To update an existing standalone install (Claude Code or Codex):

```bash
npx tink-harness@latest update
```

Update asks one question - which agent surface to refresh - and handles the rest automatically. Language, install scope, and git policy are reused from the choices you made at install time; if you chose not to commit `.tink`, update never touches your `.gitignore`. Tink-owned files (commands, skills, runtime tools) are always brought to the latest version; your customized harnesses, memory, config, and all `.tink/maintenance/` history records are preserved.

If `CODEX_HOME` is not set, Codex skills default to `%USERPROFILE%\.codex` on Windows and `~/.codex` on macOS/Linux.

### Advanced options

Interactive install/update includes an **Advanced options** step. These options used to require CLI flags, but now they are visible in the wizard:

- `Preview only (--dry-run)`: use this first when you want to see the exact files Tink would write, preserve, or remove. It does not change files.
- `Overwrite user-modified files (--force)`: use this only when an install is broken and you want official templates to replace local edits. Normal updates keep user-modified files.
- `Clean Codex picker (--clean-codex-picker)`: use this when you are switching a repo to Codex-only Tink and Codex shows duplicate `Source Command Tink ...` entries. It is not shown for mixed Claude Code + Codex installs.

The package already exposes a `tink-harness` binary. If your package manager has installed that binary on your `PATH`, you can run `tink-harness update`. If not, keep using `npx tink-harness@latest update`. A shorter direct-command path is tracked in the planned work docs so it can be verified across macOS and Windows before the README examples switch over.

To quickly verify the updated install, see `docs/update-verification-recipe.md` or `docs/update-verification-recipe.ko.md`.

If an update looks stale or incomplete, see `docs/update-troubleshooting.md` or `docs/update-troubleshooting.ko.md`.

## Commands

Tink keeps the command surface small.

Tink is plugin-first in Claude Code. Commands are namespaced under `tink`, so the public surface stays `/tink:*` and avoids generic command conflicts. In Codex, Tink installs matching `$tink:*` skills for autocomplete: `$tink:cast`, `$tink:verify`, `$tink:list`, `$tink:frog`, `$tink:weave`, `$tink:setup`, and `$tink:update`. Legacy `$tink cast` style prompts still work, but `$tink:*` is the preferred spelling.

### `/tink:cast` / `$tink:cast`

**cast** means to place the first loops on the needle (코잡기, Cast on). In knitting, casting on is the very first step — it sets the foundation for everything that follows.

In Tink, `cast` is the main path. It reads the task, chooses or drafts the right harness, runs a quick internal sanity check, creates `.tink/current/` as the visible workbench, and starts the first safe step after approval.

Use it when the task is more than a quick answer.

For bigger or fuzzier work, `cast` can expose more of the agent's thinking as files without adding new commands. Ambiguous ideas can start with `requirements-interview`, broad plans with `plan-consensus`, long runs with `goal-checkpoint`, and safe handoffs with `delegation-brief`.

More specialized work can opt into focused harnesses: `issue-triage` for issue/PR/QA intake, `bug-diagnosis-loop` for hard bugs that need a red-capable repro loop, `review-two-axis` for Standards vs Spec review, `decision-map` for multi-session unknowns, and `architecture-deepening` for module/interface/seam design. These are selected by `/tink:cast` or `$tink:cast`; they are not separate CLI workflows.

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

Everything Tink knows lives in plain files you can read, diff, and delete:

| Path | What it holds |
| --- | --- |
| `.tink/harnesses/` | the harness set — specialized procedures only |
| `.tink/current/` | the active run: plan, steps, contract, verification checks |
| `.tink/runs/` | compact records of finished runs |
| `.tink/memory/` | approved lessons and preferences; drafts wait in `memory/candidate/` |
| `.tink/rules/` + `.tink/schemas/` | a small rule graph for harness selection, plus file schemas |
| `.tink/maintenance/` + `.tink/tools/` | usage signals and the read-only helpers that render the local dashboard |

Three rules drive all of it:

1. **Generic work runs without a harness.** An ordinary code change, review, or doc edit runs on the base run contract alone — plan, steps, verification evidence. A harness is loaded only when a specialized procedure actually changes what happens: release gates, goal checkpoints, plan critique, requirements interviews, issue triage, hard-bug diagnosis loops, two-axis reviews, decision maps, architecture deepening, or other domain workflows.
2. **Suggestions only.** The dashboard, `frog`, and `weave` prepare proposals from real usage signals. Nothing reusable — a harness, a memory entry, a deletion — is saved without its own explicit approval. Approving today's run never authorizes changes that future runs would inherit.
3. **Evidence over vibes.** Run records, failed checks, evidence summary cards, and friction events decide what gets improved (`weave`), promoted from draft to harness, or cleaned up (`frog`). Weak evidence defaults to keep-and-observe, never to delete.

The dashboard is a static local page rendered from those files — the harness health summary behind it shows usage, failed checks, run review cards, ROI hints, and weave/frog candidates. No server, no file watching, no hidden cache, no public `tink index` command, and no replay command. It only prepares suggestions; acting on them keeps the approval gates above.

<details>
<summary><strong>Design docs index</strong> — details for contributors</summary>

- Compatibility baseline (Claude Code + Codex, macOS + Windows): `docs/compatibility-policy.md`
- Repo signals: `docs/repo-signals.md`, `docs/repo-signals.ko.md` · graph-rule adoption plan: `docs/graph-rule-adoption-plan.ko.md`
- Harness health summary: `docs/harness-lifecycle-signals.md`, `docs/harness-lifecycle-signals.ko.md`
- External context safety: `docs/mcp-safe-profile.md`, `docs/external-context-policy.md`
- Reading `.tink/current/` state: `docs/work-state.md`, `docs/work-state.ko.md`
- GEO visibility benchmark: `docs/geobench.md` · spec: `geobench/tink-harness.yaml`
- Update confidence: `docs/phase-5-update-confidence.md`, `docs/phase-5-update-confidence.ko.md`
- Context efficiency: `docs/context-budget-ledger.md`, `docs/context-budget-ledger.ko.md`, `docs/context-metrics-evaluator.md`, `docs/context-metrics-evaluator.ko.md`, `docs/context-run-history-rollup.md`, `docs/context-run-history-rollup.ko.md`, `docs/context-threshold-status.md`, `docs/context-threshold-status.ko.md`, `docs/context-run-record-policy.md`, `docs/context-run-record-policy.ko.md`
- Planned work units: `docs/planned-work-units.md`, `docs/planned-work-units.ko.md` · roadmap and idea audit: `docs/tink-idea-implementation-plan.ko.md`

</details>

## What Tink is not

Tink is not:

- a coding agent
- a workflow engine
- a multi-agent runtime
- a prompt library
- a replacement for Claude Code or Codex

It is a small harness layer for Claude Code or Codex.

## Contributing

Issues and pull requests are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md) - the short version: run `npm test`, keep command templates in sync across their three copies, and describe changes as problem / solution / verification.

If Tink saves you time, a ⭐ helps other developers find it.

## License

MIT
