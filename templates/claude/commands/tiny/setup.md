# /tiny:setup

Set up Tink for Claude Code.

## Goal
Prepare a small, readable harness system that helps Claude avoid repeated mistakes, preserve context, and ask before adding new project memory.

## First question: language
Always ask language first if it is not already clear from `.tiny/config.json`.

```text
언어를 선택해주세요.
1. 한국어
2. English
3. 中文
```

Use the selected language for setup prompts, run files, approval prompts, and final reports. Keep built-in harness IDs in English for stable filenames.

## Before asking choices
Explain the current files in plain language before asking the user to choose. Keep the explanation short.

Use this wording in Korean:

```text
Tink는 두 종류의 파일을 씁니다.

1. Reusable harnesses: `.tiny/harnesses/`
   작업 방식 템플릿입니다. 예: bug-fix, research, review.
   팀이 같이 쓰면 유용하므로 보통 git에 커밋합니다.

2. Run state: `.tiny/current/`, `.tiny/runs/`, `.tiny/cache/`
   이번 작업 계획, 체크, 임시 메모입니다.
   개인/임시 기록이라 기본적으로 git에서 제외합니다.
```

## Setup questions
Ask these questions in order. Use a selection UI when the host supports it, so Enter confirms the highlighted default. Do not force the user to type prose for normal choices.

### 1. Scope
Ask where Tink should be configured:

```text
Tink를 어디에 설정할까요?

1. Repo scope (권장)
   이 프로젝트에만 `.claude/`와 `.tiny/`를 둡니다. 팀 공유와 프로젝트별 하네스에 적합합니다.
2. Global scope
   사용자 홈의 Claude Code 설정에 둡니다. 여러 프로젝트에서 같은 명령을 쓰고 싶을 때 적합합니다.
```

There is no default `Both` option. If the user explicitly asks for a split install, explain the tradeoff and handle it manually.

If the current install is repo-scoped and the user wants global, tell them to run:

```bash
npx tink-harness@latest install --global
```

Before npm publish:

```bash
npx github:dotoricode/tink-harness install --global
```

### 2. Git tracking
Ask only after explaining what `.tiny/harnesses/` contains.

```text
프로젝트 harness를 git에 커밋할까요?

1. Harnesses만 커밋 (권장)
   `.tiny/harnesses/`, `.tiny/config.json`, `.tiny/memory/`는 공유하고,
   `.tiny/current/`, `.tiny/runs/`, `.tiny/cache/`는 제외합니다.
2. 전부 커밋
   실행 기록까지 공유합니다. 대부분의 프로젝트에는 권장하지 않습니다.
3. 커밋 안 함
   `.tiny/` 전체를 개인 설정으로 둡니다.
```

### 3. Hook scope
Hook is optional and off by default. Explain safety before asking.

```text
Hook은 선택 사항입니다.

무엇을 하나요?
- 일반 사용자 프롬프트를 보고 “/tiny:use를 먼저 쓰면 좋겠다”는 추천만 합니다.
- 작업을 자동 실행하지 않습니다.
- memory나 harness를 자동 저장하지 않습니다.
- `/grill-me` 같은 다른 slash skill 명령은 가로채지 않습니다. 이건 의도입니다.

Hook을 사용할까요?
1. 사용 안 함 (권장 v0)
2. Repo hook 추천 템플릿
3. Global hook 추천 템플릿
```

If the user asks why hooks do not apply to `/grill-me` or other skills, answer:

```text
의도된 동작입니다. Tink hook은 다른 slash skill의 흐름을 가로채지 않습니다.
다른 skill 작업에도 Tink를 적용하고 싶으면 `/tiny:use`를 먼저 실행하거나, 해당 요청에 “Tink로 먼저 하네스 추천해줘”라고 적어주세요.
```

## Command map after setup
After setup, always explain the `/tiny:*` commands:

```text
사용 가능한 Tink 명령입니다.

- `/tiny:setup`: 언어, repo/global scope, git 추적, hook 정책을 정합니다.
- `/tiny:use`: 작업 전에 최적 harness 조합을 이유와 함께 제안하고 승인받습니다.
- `/tiny:list`: 사용 가능한 harness를 짧게 보여줍니다.
- `/tiny:save`: 승인된 새 harness 또는 개선안을 저장합니다.
- `/tiny:remember`: 반복 실수, 안정적 선호, reusable lesson을 승인 후 저장합니다.
- `/tiny:fix`: 반복 실패가 생겼을 때 harness를 좁게 개선합니다.
```

## Do not
- Do not edit `CLAUDE.md` automatically. Offer a short copy-paste block only if useful.
- Do not ask the user to choose before explaining the consequences.
- Do not use jokes.
- Do not intercept other slash commands with Tink hooks.

## Tone
Calm, clear, concise. No jokes.
