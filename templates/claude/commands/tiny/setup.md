# /tiny:setup

Set up Tink for Claude Code.

## Goal
Prepare a small, readable harness system that helps Claude avoid repeated mistakes, preserve context, and ask before adding new project memory.

## Before asking choices
Explain the current files in plain language before asking the user to choose.

Use this wording:

```text
Tink는 두 종류의 파일을 씁니다.

1. Reusable harnesses: `.tiny/harnesses/`
   - 작업 방식 템플릿입니다. 예: bug-fix, research, review.
   - 팀이 같이 쓰면 유용하므로 보통 git에 커밋합니다.

2. Run state: `.tiny/current/`, `.tiny/runs/`, `.tiny/cache/`
   - 이번 작업 계획, 체크, 임시 메모입니다.
   - 개인/임시 기록이라 기본적으로 git에서 제외합니다.
```

## Setup questions
Ask these questions in order. Keep each question short and explain the default.

### 1. Scope
Ask where Tink should be configured:

```text
Tink를 어디에 설정할까요?

1. Repo scope (권장)
   이 프로젝트에만 `.claude/`와 `.tiny/`를 둡니다. 팀 공유와 프로젝트별 하네스에 적합합니다.
2. Global scope
   사용자 홈의 Claude Code 설정에 둡니다. 여러 프로젝트에서 같은 명령을 쓰고 싶을 때 적합합니다.
3. 둘 다
   global 명령을 쓰되, 프로젝트별 `.tiny/harnesses/`는 repo에 둡니다.
```

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
4. 직접 입력
   원하는 정책을 적어주세요.
```

### 3. Hook scope
Explain that hooks are recommendations, not automatic execution.

```text
Hook을 사용할까요?

Hook은 사용자 입력을 보고 harness 후보를 추천하는 용도입니다.
자동 실행하거나 자동 저장하지 않습니다.

1. 사용 안 함 (권장 v0)
   `/tiny:use`를 직접 호출합니다.
2. Repo hook
   이 프로젝트에서만 prompt review hook을 씁니다.
3. Global hook
   여러 프로젝트에서 hook을 씁니다. 아직 환경 차이가 있을 수 있어 신중히 사용합니다.
4. 직접 입력
   원하는 hook 정책을 적어주세요.
```

## Command map after setup
After setup, always explain the `/tiny:*` commands:

```text
사용 가능한 Tink 명령입니다.

- `/tiny:setup`: repo/global scope, git 추적, hook 정책을 정합니다.
- `/tiny:use`: 작업 전에 필요한 harness 1-4개를 제안하고 승인받습니다.
- `/tiny:list`: 사용 가능한 harness를 짧게 보여줍니다.
- `/tiny:save`: 승인된 새 harness 또는 개선안을 저장합니다.
- `/tiny:remember`: 반복 실수, 안정적 선호, reusable lesson을 승인 후 저장합니다.
- `/tiny:fix`: 반복 실패가 생겼을 때 harness를 좁게 개선합니다.
```

## Language
Use the user's language for prompts and generated run files when it is clear. If the project has a documented language preference, follow it. Keep built-in harness names stable in English (`bug-fix`, `review`, etc.) and localize the descriptions.

## Do not
- Do not edit `CLAUDE.md` automatically. Offer a short copy-paste block only if useful.
- Do not ask the user to choose before explaining the consequences.
- Do not use jokes.

## Tone
Calm, clear, concise. No jokes.
