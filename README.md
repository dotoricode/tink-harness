<p align="center">
  <img src=".github/assets/hero.webp" alt="Tink Hero Banner" width="100%">
</p>

<h1><strong>Tink</strong></h1>

<p><strong>Claude Code and Codex agent tasks — visible, reusable, approval-gated. No server, no hidden state.</strong></p>

<p><sub>A small harness layer for Claude Code and Codex</sub></p>

<p>
  <a href="https://github.com/dotoricode/tink-harness/releases/latest"><img src="https://img.shields.io/github/v/release/dotoricode/tink-harness?label=release&color=2ea44f" alt="GitHub release"></a>
  <a href="https://www.npmjs.com/package/tink-harness"><img src="https://img.shields.io/npm/v/tink-harness?label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://github.com/dotoricode/tink-harness/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/dotoricode/tink-harness/ci.yml?branch=main&label=ci" alt="CI"></a>
  <a href="https://github.com/dotoricode/tink-harness/blob/main/LICENSE"><img src="https://img.shields.io/github/license/dotoricode/tink-harness" alt="License"></a>
  <a href="https://github.com/dotoricode/tink-harness/stargazers"><img src="https://img.shields.io/github/stars/dotoricode/tink-harness?style=social" alt="GitHub stars"></a>
</p>

**English** · [한국어](README.ko.md) · [Changelog](CHANGELOG.md)

---

Without Tink, agent tasks live only in chat history — context resets on every run, workflows repeat by hand, and nothing gets better over time.

With Tink, every non-trivial task leaves plain files you can read, diff, and commit: a task contract, a visible plan, verification steps. Reusable workflows — *harnesses* — are saved only after your explicit approval, then improved from real run data. One command turns those records into a local health dashboard.

## Try it in one minute

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

The installer auto-detects `LANG` (English fallback); pass `--lang=en|ko|zh` to override. During install you can pick `Claude Code`, `Codex`, or both.

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

`cast` picks (or drafts) the right harness, writes a visible plan into `.tink/current/`, and starts the first safe step after your approval.

![Tink dashboard demo - clicking a health group, browsing harness cards, and inspecting the 3D map](.github/assets/demo.gif)

<sub>If this matches your workflow, a ⭐ helps other developers find it.</sub>

---

## When to use Tink

- Claude Code or Codex keeps losing task context between runs
- You repeat the same review / refactor / debug workflow by hand
- You want visible run state instead of hidden chat memory
- You want reusable agent workflows — saved only after explicit approval

---

## What you actually get

Every non-trivial task leaves plain files you can open, diff, and commit:

```text
.tink/current/                      # the active run — always inspectable
  contract.json                     #   what must be true when the task is done
  plan.md                           #   the visible plan
  checks.md                         #   verification to run before claiming "done"
.tink/runs/
  2026-06-11-1430-auth-refactor.md  # compact record of each finished run
.tink/harnesses/
  refactor-review.md                # reusable ways of working — approval-gated
```

## Why not just CLAUDE.md / slash commands / skills?

| Tooling | What it gives you | What Tink adds on top |
|---|---|---|
| CLAUDE.md | project-wide instructions | per-task contracts, run state, and verification |
| Slash commands | reusable prompts | harness selection, run records, progress tracking |
| Skills | reusable capability | usage lifecycle: health scores, cleanup and improvement signals |
| MCP | external context and tools | local, approval-gated workflow memory |

Tink composes with all of these — it does not replace them.

---

## Harness health dashboard

After a few runs, one command turns your records into a local dashboard and opens it in your browser:

```bash
npx tink-harness dashboard          # add --no-open to just generate the file
```

An interactive 3D map of your harnesses, the rules and memory they use, and how they connect:

![Tink harness map - an interactive 3D view of harnesses, rules, memory, and stages](.github/assets/dashboard-map.png)

Harness cards sorted by real usage, with plain-language health summaries, attention scores, approval history, and copy-paste next actions for both Claude Code and Codex:

![Harness cards sorted by usage with plain-language health and history](.github/assets/dashboard-harnesses.png)

Under the hood it runs two read-only helpers (`node .tink/tools/generate-harness-lifecycle-summary.mjs`, then `node .tink/tools/render-harness-health-report.mjs`) and opens `.tink/maintenance/harness-health-report.html`. The harness health summary shows usage, failed checks, run review cards, ROI hints, and weave/frog candidates. No server, no telemetry, no hidden cache — a static local page. It only prepares suggestions; acting on them keeps the approval gates above.

---

## Why I made this

*Tink is <strong>knit</strong> in reverse: untying tangled workflows and knitting better ones back together. It also nods to Tinker Bell, the small helper at your side.*

New coding harnesses show up almost every day. Many are genuinely useful. But the more I mixed them, the more my environment got tangled. Resetting everything again and again was tiring.

Then I used Hermes Agent for a while. What stayed with me was the way it gets better through use: repeated work turns into reusable skills, mistakes become memory, and the system slowly adapts to the person using it.

Tink started from a simple question:

> Could Claude Code or Codex grow with me in the same way?

Not by adding a big framework. Not by running more agents. Just by helping Claude or Codex choose the right harness for the current task, create one when nothing fits, and improve the set over time.

---

<details>
<summary><strong>Commands reference</strong></summary>

Tink is plugin-first in Claude Code. Commands are namespaced under `tink`: `/tink:*` in Claude Code, `$tink:*` in Codex. Legacy `$tink cast` style still works, but `$tink:*` is preferred.

**cast** means to place the first loops on the needle (코잡기, Cast on). In Tink, `cast` is the main path — it reads the task, picks or drafts the right harness, creates `.tink/current/` as the visible workbench, and starts the first safe step after approval.

**frog** means to rip out stitches (풀시오, Frogging). In Tink, `frog` looks for harnesses that are unused, overlapping, too broad, or no longer worth their context cost. It proposes cleanup, but does not delete without approval.

**weave** means to weave in the ends (실오라기 정리, Weave in). In Tink, `weave` improves an existing harness using real use, failures, and corrections.

| Command | What it does |
|---|---|
| `/tink:cast` | Read the task, pick or draft the right harness, create `.tink/current/`, start the first safe step |
| `/tink:verify` | Run the checks promised in `contract.json` — proves "done" with evidence, not vibes |
| `/tink:frog` | Find unused, overlapping, or too-broad harnesses — proposes cleanup, never deletes without approval |
| `/tink:weave` | Improve a harness from real failures and corrections — saves only after approval |
| `/tink:setup` | Choose language, install scope, git tracking, and hook policy |
| `/tink:list` | Inspect available harnesses and recent usage signals |
| `/tink:update` | Detect install source and show the safe update command |

**Cast details:** for bigger or fuzzier work, `cast` can surface visible-thinking harnesses: `requirements-interview` (ambiguous ideas), `plan-consensus` (big plans), `goal-checkpoint` (long runs), `delegation-brief` (safe handoffs). Focused harnesses like `issue-triage`, `bug-diagnosis-loop`, `review-two-axis`, `decision-map`, and `architecture-deepening` are also available — all selected by `cast`, not separate workflows.

</details>

<details>
<summary><strong>How it works</strong></summary>

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
- Planned work: `docs/planned-work-units.md`, `docs/planned-work-units.ko.md` · roadmap and idea audit: `docs/tink-idea-implementation-plan.ko.md`

</details>
</details>

<details>
<summary><strong>Update</strong></summary>

**Claude Code plugin:**

```text
/plugin marketplace update tink-harness
/plugin update tink@tink-harness
/reload-plugins
```

If update does not find the latest version, uninstall and reinstall:

```text
/plugin uninstall tink@tink-harness
/plugin install tink@tink-harness
```

**Standalone (Claude Code or Codex):**

```bash
npx tink-harness@latest update
```

Update asks one question — which agent surface to refresh — and handles the rest automatically. Language, install scope, and git policy are reused from install; if you chose not to commit `.tink`, update never touches your `.gitignore`. Tink-owned files are always brought to the latest version; your customized harnesses, memory, config, and all `.tink/maintenance/` history records are preserved.

If `CODEX_HOME` is not set, Codex skills default to `%USERPROFILE%\.codex` on Windows and `~/.codex` on macOS/Linux.

**Advanced options** (visible in the interactive wizard):

- `Preview only (--dry-run)`: see exactly what Tink would write, preserve, or remove — no file changes.
- `Overwrite user-modified files (--force)`: use only when an install is broken and you want official templates to replace local edits. Normal updates keep user-modified files.
- `Clean Codex picker (--clean-codex-picker)`: removes duplicate `Source Command Tink ...` entries when switching a repo to Codex-only. Not shown for mixed Claude Code + Codex installs.

The package exposes a `tink-harness` binary — if it is on your `PATH`, you can run `tink-harness update` directly; otherwise keep using `npx tink-harness@latest update`.

Verify: `docs/update-verification-recipe.md` or `docs/update-verification-recipe.ko.md`. Troubleshoot: `docs/update-troubleshooting.md` or `docs/update-troubleshooting.ko.md`.

</details>

<details>
<summary><strong>GEO visibility benchmark</strong></summary>

Tink includes a geobench product spec so maintainers can measure how often LLM answers mention, rank, and cite Tink across providers.

- Spec: [`geobench/tink-harness.yaml`](geobench/tink-harness.yaml)
- Runbook: [`docs/geobench.md`](docs/geobench.md)
- Metrics: hit rate, MRR, share of voice, citation rate/share, and confidence intervals

Use the benchmark for aggregate visibility checks only. Do not publish raw provider answers, secrets, or private run logs.

</details>

---

## What Tink is not

Tink is not:

- a coding agent
- a workflow engine
- a multi-agent runtime
- a prompt library
- a replacement for Claude Code or Codex

It is a small harness layer for Claude Code or Codex.

## Contributing

Issues and pull requests are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md) — the short version: run `npm test`, keep command templates in sync across their three copies, and describe changes as problem / solution / verification.

If Tink saves you time, a ⭐ helps other developers find it.

## License

MIT
