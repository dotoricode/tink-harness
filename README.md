# Tink

Self-growing harnesses for Claude Code.

Tink helps Claude forge the right harness, materialize it as run state, and start the work. It chooses the smallest effective tool/harness set, builds a narrow harness when none fits, applies it with approval, creates `.tink/current/`, executes the first safe step, avoids repeated mistakes, and maintains the harness set over time.

## What is Tink?

Tink is a Claude Code skill and command pack.

Tink's job is harness curation, not maximum tool use. Too many tools can make an agent worse. Tink should keep the active set small, often 3-5 and rarely more than 10, swap harnesses when the task changes, synthesize a lean harness when existing ones are too generic or too heavy, prevent repeated mistakes, and maintain the harness set through hone/purge proposals. It can also suggest small calibrations from observed environment and operating habits: context resets, compact cadence, token pressure, prompt quality, output length, and evidence preferences.

It is not an agent framework. It does not run agents. It does not replace Claude Code.

A harness is a small reusable procedure for a kind of work: when to use it, what to ask first, what to check, what done means, and how to recover when something fails.

## 30-second setup

Interactive installer:

```bash
npx tink-harness@latest
```

It opens a deep-blue gradient `TINK` wizard. The first question is language: English, 한국어, or 中文. Then you choose components, repo/global installation scope, and project `.tink` tracking policy.

Non-interactive repo-scoped install:

```bash
npx tink-harness@latest install --yes
```

Global install, useful when you want the same `/tink:*` commands available across projects:

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
/tink:setup
```

During setup, Tink explains what `.tink/harnesses/` contains before asking whether to commit it. The default policy is to commit reusable harnesses and config, while ignoring `.tink/current/`, `.tink/runs/`, and `.tink/cache/`.

## Use with Claude Code

Available commands:

- `/tink:setup`: choose language, repo/global scope, git tracking, and hook policy.
- `/tink:forge`: top-level loop that chooses, replaces, synthesizes, or calibrates the right harness set, creates run state, starts work, and proposes reusable memory or harness updates. This is the main command.
- `/tink:list`: list available harnesses and lightweight usage signals without loading all bodies.
- `/tink:purge`: propose unused or redundant harnesses for removal. Deletes only after approval.
- `/tink:hone`: improve active harnesses using real failures, corrections, and repeated use. Saves only after approval.

Tink intentionally keeps one focused command surface: setup, forge, list, purge, hone.

For a non-trivial task, run:

```text
/tink:forge
```

Tink will:

1. Read the harness index and small approved memory files.
2. Choose an existing harness set or synthesize a new domain-specific harness if none fits, usually 1-3 harnesses and never more than 4.
3. When research notes, prior failures, or examples are available, extract behavior-shaping rules from them: triggers, decision rules, checks, stop conditions, recovery, and evidence.
4. Explain why the chosen or newly drafted harness fits.
5. Ask for approval with a selection-style prompt where Enter accepts the recommended option when possible.
6. Create `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`, and `answers.md` for the task.
7. Execute the first safe step immediately after approval, such as inspecting files, running a read-only diagnostic, drafting the first artifact, or reproducing the issue.
8. Propose reusable memory or harness updates only after approval.

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

Tink reads `.tink/harnesses/index.json` first, then loads only the selected harness files. This keeps the context clean.

## Built-in harnesses

- `code-change`: scoped code changes with tests and diff evidence
- `bug-fix`: reproduce, root cause, smallest fix, regression check
- `research`: sources, facts vs guesses, conclusion with links
- `review`: changed files, risks, tests, actionable findings
- `docs`: reader, outline, examples, clarity check
- `ship`: release, PR, deployment, or public handoff
- `harness-synthesis`: create a narrow domain-specific harness from research, failures, examples, or repeated work
- `harness-curation`: choose, replace, synthesize, hone, or purge harnesses when too many tools or heavy workflows would hurt the task
- `context-habit-calibration`: suggest harnesses or small operating calibrations from observed context, token, input, reset, and output habits

## What kinds of harnesses Tink can create

Tink can create harnesses that are narrower than the built-ins. The built-ins are routing primitives; generated harnesses should encode project or domain knowledge.

Good generated harnesses include:

- `harness-curation`: keep active tools/harnesses small, swap heavy workflows out, and trigger hone/purge when needed
- `nextjs-rsc-boundary-refactor`: split client/server boundaries with Next.js docs, target files, and build checks
- `pre-pr-security-gate`: dependency/security review before PR using available audit tools and evidence
- `customer-interview-synthesis`: extract pain points from interviews with source quotes and assumptions separated
- `weekly-trend-report-validation`: validate public trend sources before producing a customer-facing note
- `pricing-copy-experiment`: turn price/value hypotheses into copy variants and verification criteria
- `accessibility-regression-gate`: check keyboard, labels, contrast, axe/pa11y, and screenshots before shipping UI

Generated harnesses should not be generic names like `coding-helper` or `research-assistant`. They should change the next action, the checks, and the failure recovery for a repeated task.

## 사용 습관 기반 제안 (Habit-aware recommendations)

Tink는 꼭 작업 지시가 들어온 뒤에만 움직일 필요가 없다. 가벼운 관측 신호에서 반복되는 사용 습관이 보이면 작은 제안을 하나 할 수 있다.

- context-hoarder: compact까지 기다리며 오래된 context가 쌓이는 경우
- context-resetter: `/new`를 자주 써서 유용한 흐름이 끊기는 경우
- over-loader: 도구, 에이전트, 하네스를 너무 많이 여는 경우
- under-specifier: 목표는 있지만 성공 기준이 빠지는 경우
- over-explainer: 짧은 근거만 있으면 되는데 출력이 길어지는 경우
- evidence-seeker: 자체 보고보다 실제 근거와 부정 신호가 필요한 경우

이 제안은 성격 추측이 아니라 관측 신호에 기반해야 한다. 작고 되돌릴 수 있어야 하며, 저장은 승인 후에만 한다.

기본은 `/tink:forge` 안에서 하는 **실행 중 보정 (Inline Calibration)**이다. 일반 프롬프트 앞에서 나오는 **자동 제안 (Hook Recommendation)**은 optional hook을 명시적으로 켰을 때만 허용한다. 자동 제안은 참고용이어야 하고, 한 줄 이하여야 하며, 하네스 자동 적용이나 memory 자동 저장을 하면 안 된다.

## How Tink remembers without bloating context

Tink keeps memory small and explicit:

- `.tink/memory/mistakes.md`: repeated mistakes and prevention rules
- `.tink/memory/preferences.md`: stable user or project preferences
- `.tink/memory/lessons.md`: reusable lessons for future harnesses

Tink does not store raw logs, full diffs, secrets, private data, or one-off task progress.

Memory changes require user approval.

## How Tink grows

When existing harnesses are not enough, `/tink:forge` loads `harness-synthesis` and proposes a new domain-specific harness instead of forcing a bad fit. If the user provides research notes, prior runs, examples, or failures, Tink extracts behavior-shaping rules from them rather than summarizing them.

A new harness is saved only when:

- it covers a repeated pattern
- it has distinct questions or checks
- failure would be costly
- it is likely to be reused
- the user approves it

Saved harnesses live in `.tink/harnesses/` and become future candidates.

## Language behavior

Tink should answer in the selected language from setup. The installer asks first: English, 한국어, or 中文. Built-in harness IDs stay in English for stable filenames, but descriptions, approval prompts, `.tink/current/` run files, and final reports should be localized.

If the project has a documented language policy, Tink should follow it. If language is ambiguous, ask once during `/tink:setup` and save the preference only after approval.

## Tone: calm, clear, no jokes

Tink uses calm, clear, concise language.

It should not use AI jokes, memes, or excessive character voice. Readability and trust matter more than personality.

## Works with Matt Pocock skills

Tink pairs well with Matt Pocock's skills because it creates task-specific context before using a deeper skill. It does not automatically intercept other slash skills such as `/grill-me`; that is intentional so Tink does not hijack another skill's workflow.

Example flow:

1. `/tink:forge` chooses `bug-fix` and `code-change`, or drafts a new harness if needed.
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
