# tink-harness

Claude Code용 하네스 관리자. 용어 정의는 `CONTEXT.md` 참고.

## 명령

```bash
npm test       # python tests/test_templates.py && node --check bin/install.js
npm publish    # npm 배포 (.npmrc 토큰 필요)
```

## 구조

```
bin/install.js                        # npx 진입점 (install / update 서브커맨드)
commands/*.md                         # 소스 명령 파일 (plugin용)
templates/claude/commands/tink/       # npx 설치 시 복사되는 명령 파일
templates/tink/harnesses/             # npx 설치 시 복사되는 하네스 파일
.claude/commands/tink/                # 이 repo에서 직접 사용하는 명령 파일
.tink/                                # Tink 런타임 상태 (로컬 전용, git 제외)
```

## 3-copy 규칙

`commands/*.md` 수정 시 반드시 세 곳 모두 동일하게 적용:

1. `commands/<name>.md`
2. `templates/claude/commands/tink/<name>.md`
3. `.claude/commands/tink/<name>.md`

## 주의

- Windows cp949 환경에서 테스트 실행 시 UnicodeDecodeError 경고 발생 — 기존 이슈, 테스트 통과에 영향 없음
- `ROADMAP.md`는 커밋하지 않음
- `.npmrc`는 `.gitignore`에 포함됨 (토큰 보안)
