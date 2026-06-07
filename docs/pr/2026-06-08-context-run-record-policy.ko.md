# Context Run Record Policy로 실제 run rollup 전 안전 기준 추가

## 문제

현재 90% 달성 근거는 current-run fixture와 대표 run-history fixture까지 확장되었지만, 실제 `.tink/runs/*` 기록을 어떤 기준으로 rollup에 포함할지는 아직 명확하지 않다. 이 기준 없이 자동 수집이나 hidden cache부터 만들면 사용자 영역을 침범할 수 있다.

## 해결

- `tests/fixtures/maintenance/context-run-record-policy.json`에 실제 run 기록으로 넘어가기 전 필요한 포함/제외 기준을 정의했다.
- `docs/context-run-record-policy.ko.md`와 영어 companion 문서를 추가했다.
- `tests/test_templates.py`가 새 정책 fixture에서 public command, watcher, hidden runtime index, generated cache, Sentry가 제외되어 있는지 검증하게 했다.
- README에는 관련 문서 링크만 추가했다.

## 검증

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`

## 참고

- 새 public command를 추가하지 않았다.
- `tink index`, watcher, generated cache, hidden runtime index를 추가하지 않았다.
- 실제 run 기록을 자동 수집하지 않는다.
- 사용자에게 보이는 설치/명령/스키마 동작 변경이 아니므로 version bump, npm publish, GitHub Release는 진행하지 않는다.
