# Tink

Self-growing harnesses for Claude Code.

Tink gives Claude a tiny harness before it starts. It helps Claude choose the right working pattern, ask for approval, avoid repeated mistakes, and remember only what should be remembered.

## What is Tink?

Tink is a Claude Code skill and command pack.

It is not an agent framework. It does not run agents. It does not replace Claude Code.

A harness is a small reusable procedure for a kind of work: when to use it, what to ask first, what to check, what done means, and how to recover when something fails.

## 30-second setup

Interactive installer:

```bash
npx tink-harness@latest
```

It opens a deep-blue gradient `TINK` wizard. The first question is language: English, 한국어, or 中文. Then you choose components, repo/global installation scope, and project `.tiny` tracking policy.

Non-interactive repo-scoped install:

```bash
npx tink-harness@latest install --yes
```

Global install, useful when you want the same `/tiny:*` commands available across projects:

```bash
npx tink-harness@latest install --global --yes
```

Before npm publish, install from GitHub:

```bash
npx github:dotoricode/tink-harness
npx github:dotoricode/tink-harness install --global
```

Then open Claude Code and run:

```text
/tiny:setup
```

During setup, Tink explains what `.tiny/harnesses/` contains before asking whether to commit it. The default policy is to commit reusable harnesses and config, while ignoring `.tiny/current/`, `.tiny/runs/`, and `.tiny/cache/`.

## Use with Claude Code

Available commands:

- `/tiny:setup`: choose language, repo/global scope, git tracking, hook policy, and language behavior.
- `/tiny:use`: suggest the best harness set with reasons before a task and ask for selection-style approval.
- `/tiny:list`: list available harnesses without loading all bodies.
- `/tiny:save`: save an approved new or improved harness.
- `/tiny:remember`: save a repeated mistake, stable preference, or reusable lesson after approval.
- `/tiny:fix`: improve a harness after a repeated failure.

For a non-trivial task, run:

```text
/tiny:use
```

Tink will:

1. Read the harness index.
2. Suggest the best harness set, usually 1-3 harnesses and never more than 4.
3. Explain the reason for the recommendation.
4. Ask for approval with a selection-style prompt where Enter accepts the recommended option when possible.
5. Create `.tiny/current/` for the task.

## How Tink chooses harnesses

Tink chooses the smallest useful set:

- Primary: the main work type
- Safety: what prevents mistakes
- Finish: what proves done
- Optional: only when clearly useful

The `context` column in harness lists means expected prompt/context footprint:

- `tiny`: very short guidance
- `small`: normal checklist-sized guidance
- `large`: load only after explicit approval

It does not mean user profile or project context.

Tink reads `.tiny/harnesses/index.json` first, then loads only the selected harness files. This keeps the context clean.

## Built-in harnesses

- `code-change`: scoped code changes with tests and diff evidence
- `bug-fix`: reproduce, root cause, smallest fix, regression check
- `research`: sources, facts vs guesses, conclusion with links
- `review`: changed files, risks, tests, actionable findings
- `docs`: reader, outline, examples, clarity check
- `ship`: release, PR, deployment, or public handoff

## How Tink remembers without bloating context

Tink keeps memory small and explicit:

- `.tiny/memory/mistakes.md`: repeated mistakes and prevention rules
- `.tiny/memory/preferences.md`: stable user or project preferences
- `.tiny/memory/lessons.md`: reusable lessons for future harnesses

Tink does not store raw logs, full diffs, secrets, private data, or one-off task progress.

Memory changes require user approval.

## How Tink grows

When existing harnesses are not enough, Tink proposes a new harness.

A new harness is saved only when:

- it covers a repeated pattern
- it has distinct questions or checks
- failure would be costly
- it is likely to be reused
- the user approves it

Saved harnesses live in `.tiny/harnesses/` and become future candidates.

## Language behavior

Tink should answer in the selected language from setup. The installer asks first: English, 한국어, or 中文. Built-in harness IDs stay in English for stable filenames, but descriptions, approval prompts, `.tiny/current/` run files, and final reports should be localized.

If the project has a documented language policy, Tink should follow it. If language is ambiguous, ask once during `/tiny:setup` and save the preference only after approval.

## Tone: calm, clear, no jokes

Tink uses calm, clear, concise language.

It should not use AI jokes, memes, or excessive character voice. Readability and trust matter more than personality.

## Works with Matt Pocock skills

Tink pairs well with Matt Pocock's skills because it creates task-specific context before using a deeper skill. It does not automatically intercept other slash skills such as `/grill-me`; that is intentional so Tink does not hijack another skill's workflow.

Example flow:

1. `/tiny:use` selects `bug-fix` and `code-change`.
2. Claude proposes the best harness set and asks for approval with reasons.
3. A focused skill such as TDD, diagnose, grill-me, or review can use that context after approval.

Tink does not overwrite `CLAUDE.md` or force a global project structure.

## What Tink borrows from other harness tools

Tink borrows principles, not implementations:

- Matt Pocock skills: small composable skills, setup flow, shared language, feedback loops
- grill-me style workflows: ask before committing to a direction
- Claude workflow projects: commands, skills, hooks, and handoff files
- OpenAI Agents SDK and Pydantic AI: guardrails, handoffs, and tool contracts expressed as plain markdown
- SWE-agent and aider: small git-friendly changes and verification loops
- LangGraph, CrewAI, AutoGen, and OpenHands: state and recovery ideas without becoming a workflow engine
- evaluation harnesses and acorn Harness v2: human-verifiable evidence before saying done

## Not a framework

Tink is not:

- a terminal coding agent
- a workflow engine
- a multi-agent runtime
- a prompt library
- a replacement for Claude Code

Tink is a small approval-based harness system for Claude Code.
