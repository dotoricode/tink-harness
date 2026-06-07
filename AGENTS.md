# tink-harness

Codex용 하네스 관리자. 용어 정의는 `CONTEXT.md` 참고.

## 명령

```bash
npm test       # python tests/test_templates.py && node --check bin/install.js
npm publish    # npm 배포 (.npmrc 토큰 필요)
```

## 구조

```
bin/install.js                        # npx 진입점 (install / update 서브커맨드)
commands/*.md                         # 소스 명령 파일 (plugin용)
templates/claude/commands/tink/      # npx 설치 시 복사되는 Claude Code 명령 파일
templates/codex/skills/              # npx 설치 시 복사되는 Codex skill 파일
templates/tink/harnesses/             # npx 설치 시 복사되는 하네스 파일
.claude/commands/tink/               # 이 repo에서 직접 사용하는 Claude Code 명령 파일
.tink/                                # Tink 런타임 상태 (로컬 전용, git 제외)
```

## 3-copy 규칙

`commands/*.md` 수정 시 반드시 세 곳 모두 동일하게 적용:

1. `commands/<name>.md`
2. `templates/claude/commands/tink/<name>.md`
3. `.claude/commands/tink/<name>.md`

## 버전 bump

`package.json`, `package-lock.json`, `.claude-plugin/plugin.json` 세 곳 모두 수정 필요.

## PR 작성 원칙

PR 설명은 추후 포트폴리오나 구직 자료로도 참고할 수 있게 작성하되, 과장이나 대필처럼 보이지 않게 사실 기반 초안으로 남긴다.

- 1인칭 초안으로 작성하되, 사용자가 검토·수정·승인할 수 있는 형태로 둔다.
- 사용자가 실제로 판단하거나 수행한 내용과 Codex가 도운 내용을 섞어 과장하지 않는다.
- 단순 변경 목록보다 "어떤 문제가 있었는지", "왜 이 해결책을 선택했는지", "검증으로 무엇을 확인했는지"를 먼저 남긴다.
- 기술적 판단이 드러나게 쓰되 과장하지 않는다. 트레이드오프나 호환성 고려가 있으면 함께 적는다.
- 기본 구조는 `문제`, `해결`, `검증`, `참고` 순서를 선호한다.

## 문서 작성 언어

- 새 문서나 큰 문서 변경은 한국어도 함께 제공한다.
- 영어 문서를 유지해야 할 때는 같은 파일에 한국어 요약을 넣거나, `*.ko.md` companion 문서를 둔다.
- README처럼 이미 한국어판이 있는 문서는 영어판과 한국어판을 함께 갱신한다.
- 릴리스/PR 히스토리는 사용자가 바로 검토할 수 있도록 한국어 설명을 우선 포함한다.

## 주의

- Windows cp949 환경에서 테스트 실행 시 UnicodeDecodeError 경고 발생 — 기존 이슈, 테스트 통과에 영향 없음
- `ROADMAP.md`는 커밋하지 않음
- `.npmrc`는 `.gitignore`에 포함됨 (토큰 보안)
- `npm pkg fix --dry-run`은 실제로 파일을 수정함 (dry-run 미작동)
