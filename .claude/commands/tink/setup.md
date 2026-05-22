---
description: Configure Tink language, install scope, git tracking, and hook policy.
---

# /tink:setup

Set up Tink for Claude Code.

## Goal
Prepare one small self-growing harness system that helps Claude choose/build harnesses, avoid repeated mistakes, and remember reusable lessons only after approval.

## Setup review mode
If `.tink/config.json` already exists, do not jump straight to git tracking. First show a short current-settings review, then ask what to change.

Use this wording in Korean:

```text
현재 Tink 설정입니다.

- 언어: {language}
- 범위 (Scope): {install_scope}
- 톤 (Tone): calm, clear, concise, no jokes
- Hook: {hook_scope}
- Git 추적: {git_policy_or_inferred_policy}

톤은 선택 항목이 아니라 Tink의 고정 정책입니다. 조용하고 명확하게, 농담 없이 답하는 것을 기본으로 합니다.

무엇을 바꿀까요?
1. 그대로 사용 (권장)
2. 언어 변경
3. 범위 변경
4. Hook 설정 변경
5. Git 추적 변경
```

If the user chooses `그대로 사용`, summarize available commands and stop. Do not re-ask git tracking.

## First question: language
Always ask language first if it is not already clear from `.tink/config.json`.

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

1. 재사용 하네스 (Reusable Harnesses): `.tink/harnesses/`
   작업 방식 템플릿입니다. 예: bug-fix, research, review.
   팀이 같이 쓰면 유용하므로 보통 git에 커밋합니다.

2. 실행 상태 (Run State): `.tink/current/`, `.tink/runs/`, `.tink/cache/`
   이번 작업 계획, 체크, 임시 메모입니다.
   개인/임시 기록이라 기본적으로 git에서 제외합니다.
```

## Setup questions
Ask these questions in order. Use a selection UI when the host supports it, so Enter confirms the highlighted default.

### 1. Scope
```text
Tink를 어디에 설정할까요?

1. Repo 범위 (Repo Scope, 권장)
   이 프로젝트에만 `.claude/`와 `.tink/`를 둡니다. 팀 공유와 프로젝트별 하네스에 적합합니다.
2. Global 범위 (Global Scope)
   사용자 홈의 Claude Code 설정에 둡니다. 여러 프로젝트에서 같은 명령을 쓰고 싶을 때 적합합니다.
```

There is no `Both` option by default.

### 2. Git tracking
Ask only after explaining consequences.

```text
프로젝트 하네스 (Harness)를 git에 커밋할까요?

먼저 차이를 설명합니다.

1. 하네스만 커밋 (Harnesses only, 권장)
   좋은 점:
   - 팀원과 같은 작업 방식, 체크리스트, 선호를 공유합니다.
   - 다른 PC나 새 clone에서도 Tink가 같은 기준으로 동작합니다.
   - 실행 기록은 빠져서 repo가 지저분해지지 않습니다.

   실제로 커밋되는 것:
   - `.tink/harnesses/`: 작업 방식 템플릿
   - `.tink/config.json`: 언어/scope 같은 기본 설정
   - `.tink/memory/`: 승인된 반복 실수, 선호, 교훈

   제외되는 것:
   - `.tink/current/`, `.tink/runs/`, `.tink/cache/`: 이번 실행 기록/임시 상태

2. 전부 커밋
   좋은 점:
   - 실행 과정까지 전부 남길 수 있습니다.
   주의:
   - 임시 메모, 작업 중 파일, 개인 맥락이 섞일 수 있어 대부분 비권장입니다.

3. 커밋 안 함
   좋은 점:
   - repo에는 아무 흔적을 남기지 않고 개인 도구로만 씁니다.
   결과:
   - 다른 팀원, 다른 PC, 새 clone에서는 harness가 공유되지 않습니다.
   - 프로젝트별로 쌓은 개선이 유실되거나 재설정이 필요할 수 있습니다.
```

### 3. Hook registration
Hook is optional and off by default. If selected in the installer, it is registered as a Claude Code `UserPromptSubmit` hook. Do not ask for hook scope again. Use the already selected repo/global scope.

Explain:

```text
Hook은 선택 사항입니다.

무엇을 하나요?
- Claude Code `UserPromptSubmit`에 등록되어 일반 사용자 프롬프트를 보고 “/tink:forge를 먼저 쓰면 좋겠다”는 추천만 합니다.
- 작업을 자동 실행하지 않습니다.
- 메모리 (Memory)나 하네스 (Harness)를 자동 저장하지 않습니다.
- `/grill-me` 같은 다른 slash skill 명령은 가로채지 않습니다.

지금은 hook 없이 `/tink:forge`를 직접 쓰는 흐름을 권장합니다.
```

## Command map after setup
Explain the five commands:

```text
사용 가능한 Tink 명령입니다.

- `/tink:setup`: 언어, repo/global 범위 (Scope), git 추적, 훅 (Hook) 정책을 정합니다.
- `/tink:forge`: 작업에 맞는 하네스 (Harness)를 고르거나 만들고, 적용하고, 재사용 교훈을 저장 제안합니다. 가장 자주 쓰는 명령입니다.
- `/tink:list`: 사용 가능한 하네스 (Harness)와 최근 사용 신호를 짧게 보여줍니다.
- `/tink:purge`: 거의 쓰지 않는 하네스 (Harness)를 근거와 함께 제거 후보로 제안합니다. 승인 전 삭제하지 않습니다.
- `/tink:hone`: 자주 쓰는 하네스 (Harness)를 실제 실패/반복/피드백 기준으로 개선합니다. 승인 전 저장하지 않습니다.
```

## Do not
- Do not edit `CLAUDE.md` automatically.
- Do not ask the user to choose before explaining the consequences.
- Do not ask for tone selection. Tone is a fixed Tink policy, not a setup choice.
- Do not use jokes.
- Do not intercept other slash commands with Tink hooks.

## Tone
Calm, clear, concise. No jokes. Show this as a fixed policy during setup review; do not turn it into another preference menu.
