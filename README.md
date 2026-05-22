<p align="center">
  <strong>Tink</strong>
</p>

<h1 align="center">A small harness layer for Claude Code</h1>

<p align="center">
  Tink helps Claude Code choose the right harness, keep visible run state, and improve the harness set as you work.
</p>

<p align="center">
  <em>Tink is <strong>knit</strong> in reverse: untying tangled workflows and knitting better ones back together. It also nods to Tinker Bell, the small helper at your side.</em>
</p>

<p align="center">
  <a href="https://github.com/dotoricode/tink-harness/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/dotoricode/tink-harness/ci.yml?branch=main&label=ci" alt="CI"></a>
  <a href="https://github.com/dotoricode/tink-harness/blob/main/LICENSE"><img src="https://img.shields.io/github/license/dotoricode/tink-harness" alt="License"></a>
  <a href="https://github.com/dotoricode/tink-harness/stargazers"><img src="https://img.shields.io/github/stars/dotoricode/tink-harness?style=social" alt="GitHub stars"></a>
</p>

---

## Why I made this

New coding harnesses show up almost every day. Many of them are genuinely useful.

At first, I tried them one by one and kept the ones that fit me. But the more I mixed them, the more my environment got tangled. Resetting everything again and again was tiring, so I ended up falling back to a skill-based workflow that I could understand and control.

Then I used Hermes Agent for a while. What stayed with me was the way it gets better through use: repeated work turns into reusable skills, mistakes become memory, and the system slowly adapts to the person using it.

Tink started from a simple question:

> Could Claude Code grow with me in the same way?

Not by adding a big framework. Not by running more agents. Just by helping Claude choose the right harness for the current task, create one when nothing fits, and improve the set over time.

## Install

Current development install:

```bash
npx github:dotoricode/tink-harness
```

Repo-scoped install:

```bash
npx github:dotoricode/tink-harness install --yes
```

Global install:

```bash
npx github:dotoricode/tink-harness install --global --yes
```

Optional Claude Code `UserPromptSubmit` hook:

```bash
npx github:dotoricode/tink-harness install --yes --with-hook
```

After v1.0.0 is published to npm:

```bash
npx tink-harness@latest
```

## Commands

Tink keeps the command surface small.

### `/tink:forge`

**forge** means to make something by shaping it with heat and pressure.

In Tink, `forge` is the main path. It reads the task, chooses or drafts the right harness, creates `.tink/current/` as the visible workbench, and starts the first safe step after approval.

Use it when the task is more than a quick answer.

### `/tink:purge`

**purge** means to remove what is unnecessary or harmful.

In Tink, `purge` looks for harnesses that are unused, overlapping, too broad, or no longer worth their context cost. It proposes cleanup, but does not delete without approval.

Use it when the harness set starts to feel noisy.

### `/tink:hone`

**hone** means to sharpen through small adjustments.

In Tink, `hone` improves an existing harness using real use, failures, and corrections. It should make the next run clearer, safer, or easier to verify.

Use it when a harness is useful but slightly wrong.

### Other commands

- `/tink:setup`: choose language, install scope, git tracking, and hook policy.
- `/tink:list`: inspect available harnesses and recent usage signals.

## How it works

Tink uses files you can inspect:

- `.tink/harnesses/`: reusable task harnesses
- `.tink/current/`: the current run state
- `.tink/runs/`: compact records from finished, blocked, canceled, or replaced runs
- `.tink/memory/`: approved mistakes, preferences, and lessons

The important rule is approval.

Tink may suggest a harness, a memory entry, a cleanup, or an improvement. It should not silently save reusable state or delete anything without you saying yes.

## What Tink is not

Tink is not:

- a coding agent
- a workflow engine
- a multi-agent runtime
- a prompt library
- a replacement for Claude Code

It is a small harness layer for Claude Code.

## Status

Tink is pre-v1 and being hardened toward v1.0.0.

The current focus is install reliability, simple docs, visible run state, and a release path that can be verified from a clean repo.

## License

MIT
