---
description: Detect install source, diagnose user-modified files, and show the safe update command.
---

# /tink:update

Tink를 최신 버전으로 안전하게 업데이트하는 방법을 안내합니다.

## What this command does
This command does not run the update itself. It detects how Tink was installed in this project, diagnoses whether any user-modified files are at risk, and shows the correct command to run.

## Procedure
1. **Source-repo guard (first):** If the project root contains all of `templates/tink/`, `bin/install.js`, and a `package.json` whose `name` is `"tink-harness"`, this is the tink-harness source repository itself — not a consumer install. Skip the rest of the procedure and emit the "source repo" output (see below). Do not show plugin or npx update commands in this case.
2. Detect install source:
   - If the project root (or `cwd`) has `.claude-plugin/plugin.json` and a top-level `commands/` directory, Tink was installed via Claude Code plugin marketplace.
   - Otherwise, treat it as an `npx tink-harness install` (standalone) installation.
3. Scan for files that have diverged from the latest installed templates (read-only inspection only):
   - **Always updated**: `.claude/commands/tink/`, `.claude/skills/tink/`, `.tink/tools/` — template changes always propagate here.
   - **Never overwritten once they exist**: `.tink/maintenance/` record files (`ledger.jsonl`, `friction.jsonl`, `weave-queue.json`) hold user history; the template only seeds them when missing.
   - **Preserved if user-modified**: `.tink/harnesses/`, `.tink/hooks/`, `.tink/memory/`, `.tink/config.json` — respects `weave` customizations and local configuration.
4. Show the appropriate update path and a short list of files in the "preserved" category that have diverged.

## Update path: Claude Code plugin
```text
/plugin marketplace update tink-harness
/plugin update tink@tink-harness
/reload-plugins
```
If update is not detected, uninstall and reinstall:
```text
/plugin uninstall tink@tink-harness
/plugin install tink@tink-harness
```
The plugin path is handled by Claude Code and does not touch the local `.tink/` directory.

## Update path: npx (standalone)
```text
npx tink-harness@latest update
```

The `update` subcommand asks only one question - which agent surface to refresh (Claude Code, Codex, or both). Everything else updates automatically:
- **Always overwrites**: commands, skills, and runtime tools (`.claude/commands/tink/`, `.claude/skills/tink/`, `.tink/tools/`) — so you get the latest harness runner, report tools, and command behavior automatically.
- **Never overwrites records**: `.tink/maintenance/` ledger, friction, and weave-queue files are user history; they are only seeded when missing.
- **Preserves if modified**: harnesses, hooks, memory, and config (`.tink/harnesses/`, `.tink/hooks/`, `.tink/memory/`, `.tink/config.json`) — respects your `weave` customizations and local settings.
- **Reuses stored choices**: language, install scope, and git policy come from `.tink/config.json`. With `git_policy: "none"` (커밋 안 함) the updater never creates or edits `.gitignore`, and an existing whole-directory `.tink/` ignore line is left as-is.

## Output format (source repo)

If the source-repo guard triggers, print only this and stop — do not present plugin or npx commands:

```text
### 🧶 Tink 업데이트 안내

이 디렉토리는 tink-harness **소스 리포지토리**입니다. 일반 사용자 업데이트 대상이 아니에요.

- 개발 변경 반영: `git pull` 후 일반적인 빌드/테스트 흐름을 사용하세요.
- 사용자 환경에서 업데이트 흐름을 검증하려면 별도의 프로젝트 디렉토리에서 이 명령을 실행하세요.
```

## Output format

```text
### 🧶 Tink 업데이트 안내

**설치 경로**: <plugin marketplace | npx standalone>

**항상 업데이트됨**: commands, skills, tools (최신 버전으로 자동 반영) · maintenance 기록 파일은 보존

**사용자 수정 파일** (업데이트 시 보존):
- <path1>
- <path2>
- (보존할 파일 없음)

**업데이트 명령**:
<command lines>

? 어떻게 할까요?
1. 위 명령 복사해서 직접 실행
2. 변경 사항 미리 보기 (`npx tink-harness update --dry-run`)  ← npx standalone에서만 표시
3. 취소
```

Use `AskUserQuestion`. Show option 2 (dry-run) **only on the npx standalone path** — Claude Code plugin updates have no dry-run equivalent. So: plugin path → 2 options (run / cancel); npx path → 3 options (run / dry-run / cancel).

## Do not
- Do not actually run the update command — show it for the user to run in their shell or Claude Code.
- Do not modify `.tink/` files during diagnosis.
- Do not bypass the user choice; always offer cancel.
- Do not present plugin or npx update commands when the source-repo guard triggers — the user is editing tink-harness itself and would get misleading instructions.
