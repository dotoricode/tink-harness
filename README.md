<p align="center">
  <img src=".github/assets/hero.gif" alt="Tink Hero Banner" width="100%">
</p>

<h1>
  <strong>Tink</strong>
</h1>

<p>A small harness layer for Claude Code</p>

<p>
  Tink helps Claude Code choose the right harness, keep run state visible, and improve the harness set as you work.
</p>

<p>
  <em>Tink is <strong>knit</strong> in reverse: untying tangled workflows and knitting better ones back together. It also nods to Tinker Bell, the small helper at your side.</em>
</p>

<p>
  <a href="https://www.npmjs.com/package/tink-harness"><img src="https://img.shields.io/npm/v/tink-harness?label=npm&color=cb3837" alt="npm version"></a>
  <a href="https://github.com/dotoricode/tink-harness/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/dotoricode/tink-harness/ci.yml?branch=main&label=ci" alt="CI"></a>
  <a href="https://github.com/dotoricode/tink-harness/blob/main/LICENSE"><img src="https://img.shields.io/github/license/dotoricode/tink-harness" alt="License"></a>
  <a href="https://github.com/dotoricode/tink-harness/stargazers"><img src="https://img.shields.io/github/stars/dotoricode/tink-harness?style=social" alt="GitHub stars"></a>
</p>

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

## Commands

Tink keeps the command surface small.

Tink is plugin-first. Commands are namespaced under `tink`, so the public surface stays `/tink:*` and avoids generic command conflicts.

### `/tink:cast`

**cast** means to place the first loops on the needle (코잡기, Cast on). In knitting, casting on is the very first step — it sets the foundation for everything that follows.

In Tink, `cast` is the main path. It reads the task, chooses or drafts the right harness, runs a quick internal sanity check, creates `.tink/current/` as the visible workbench, and starts the first safe step after approval.

Use it when the task is more than a quick answer.

### `/tink:frog`

**frog** means to rip out stitches (풀시오, Frogging). In knitting, frogging unravels rows that went wrong — the name comes from the sound of pulling out yarn, "rip it, rip it."

In Tink, `frog` looks for harnesses that are unused, overlapping, too broad, or no longer worth their context cost. It proposes cleanup, but does not delete without approval.

Use it when the harness set starts to feel noisy.

### `/tink:weave`

**weave** means to weave in the ends (실오라기 정리, Weave in). In knitting, weaving in secures the loose threads left after finishing, giving the work its final shape.

In Tink, `weave` improves an existing harness using real use, failures, and corrections. It should make the next run clearer, safer, or easier to verify.

Use it when a harness is useful but slightly wrong.

### Other commands

- `/tink:setup`: choose language, install scope, git tracking, and hook policy.
- `/tink:list`: inspect available harnesses and recent usage signals.
- `/tink:update`: detect install source and show the safe update command.

## How it works

Tink uses files you can inspect:

- `.tink/harnesses/`: reusable task harnesses
- `.tink/current/`: the current run state
- `.tink/runs/`: compact records from finished, blocked, canceled, or replaced runs
- `.tink/memory/`: approved mistakes, preferences, and lessons

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
