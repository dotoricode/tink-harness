# Tink v1.0.0 Roadmap

**v1.0.0 정의:** 공개 npm publish 가능한 첫 stable 버전.

현재: `0.1.5`. 아래 항목을 완료하면 v1.0.0으로 올립니다.

---

## 블로커 — 없으면 publish 불가

### 1. 미커밋 파일 커밋

git status에 staged/unstaged 변경이 남아있습니다.

- `.claude/commands/tink/list.md` (staged)
- `commands/list.md` (unstaged)
- `templates/claude/commands/tink/list.md` (unstaged)
- `README.md` (unstaged)
- `.tink/maintenance/ledger.jsonl` (unstaged)

이 파일들이 커밋되지 않으면 publish 내용과 repo 상태가 불일치합니다.

### 2. Plugin 유효성 검사

VERSIONING.md의 릴리스 체크리스트에 명시되지만 CI에 포함되어 있지 않습니다.

```bash
claude plugin validate .claude-plugin/plugin.json
claude plugin validate .claude-plugin/marketplace.json
```

두 명령 모두 오류 없이 통과해야 합니다.

### 3. npm pack --dry-run 확인

shipped 파일 목록을 확인하여 의도하지 않은 파일(비밀, 내부 상태)이 포함되지 않았는지 검증합니다.

```bash
npm pack --dry-run --json
```

확인 기준:
- `.tink/` 내부 상태 파일 미포함
- `templates/` 파일 포함
- `.claude/commands/tink/` 파일 포함
- `bin/` 파일 포함

### 4. pre-publish 다중 에이전트 검증 실행

`pre-publish-multi-agent-verify` 하네스로 실제 설치 경로, UX 흐름, 문서 일관성, 비밀 누출을 병렬 검증합니다.

검증 범위:
- 신규 환경에서 `npx github:dotoricode/tink-harness install` → `/tink:setup` → `/tink:cast` 흐름
- 플러그인 설치 경로: `/plugin marketplace add` → `/tink:setup`
- CHANGELOG와 실제 shipped 버전 일치
- 광고된 명령(`/tink:cast`, `/tink:frog`, `/tink:weave`, `/tink:setup`, `/tink:list`, `/tink:update`)이 shipped 파일에 존재

### 5. npm publish

```bash
npm publish
```

처음 공개되는 버전. 72시간 내 `npm unpublish`가 가능하지만 이후에는 deprecate만 가능합니다.

---

## 권장 — 있으면 v1.0.0 품질이 올라감

### A. CI에 plugin validate 추가

현재 CI는 `npm test`만 실행합니다. `claude plugin validate` 단계를 추가하면 plugin.json 깨짐을 자동으로 잡습니다.

단, `claude` CLI가 CI 환경에서 사용 가능한지 확인 필요합니다. 사용할 수 없다면 로컬 pre-release 체크리스트에 명시하는 것으로 대체합니다.

### B. 클린 설치 스모크 테스트

신규 사용자와 동일한 조건(빈 디렉터리, tink 없는 상태)에서 설치가 실제로 작동하는지 수동으로 확인합니다.

흐름:
1. 빈 디렉터리 생성
2. `npx github:dotoricode/tink-harness install` 실행
3. `/tink:setup` 진행
4. `/tink:cast` 로 간단한 작업 실행

### C. GitHub Release v1.0.0 태그

npm publish 후 GitHub에 `v1.0.0` 태그와 릴리스 노트를 달면 사용자가 버전 이력을 추적하기 쉽습니다.

릴리스 노트: CHANGELOG [0.1.0] ~ [1.0.0] 요약.

### D. README docs truthfulness 검토

README에 설명된 명령 흐름이 실제 동작과 일치하는지 확인합니다.

점검 항목:
- Install 명령이 현재 설치 경로와 정확히 일치하는가
- Update 명령 순서가 맞는가
- 명령 설명이 실제 동작과 다른 부분이 없는가

---

## 나중에 — v1.1+

이 항목들은 v1.0.0 범위 밖입니다. CHANGELOG `[Unreleased]`에 이미 기록되어 있습니다.

### 레이어드 스코프 모델

`global` (`~/.tink/`) + `repo` (`.tink/`) + `local` (`.tink/local/`) 세 단계 설정 병합.

Claude Code의 User/Project/Local 설정 구조와 동일한 패턴을 따릅니다.

### 커뮤니티 피드백 반영

Reddit 및 GitHub Issues를 통해 수집된 실제 사용 패턴을 기반으로 하네스를 추가하거나 개선합니다.

---

## 버전 계획

| 버전 | 내용 | 기준 |
|------|------|------|
| 0.1.6 | 미커밋 파일 커밋 + 작은 픽스 | patch |
| 0.2.0 | 있다면 v1.0.0 전 의미있는 기능 추가 | minor |
| **1.0.0** | **블로커 완료 + pre-publish 검증 통과 + npm publish** | **major** |
| 1.1.0 | 레이어드 스코프 모델 | minor |
