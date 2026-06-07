# Context Run History Rollup

## 문제

`context-metrics-evaluation.json`으로 current run 하나의 여섯 지표는 계산할 수 있게 되었지만, 반복 작업 전체가 90% 이상을 유지하는지는 아직 확인하기 어려웠다.

## 해결

- `tests/fixtures/maintenance/context-metrics-rollup.json`을 추가해 여러 run의 점수를 묶었다.
- 테스트가 rollup 평균, 최저점, evidence ref, metric 누락 여부를 직접 계산하도록 했다.
- 한국어 우선 문서 `docs/context-run-history-rollup.ko.md`와 영어 companion을 추가했다.
- README에는 링크만 추가해 본문을 늘리지 않았다.

## 검증

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`

## 참고

- 새 public command는 추가하지 않았다.
- `tink index` 명령, watcher, generated cache, hidden runtime index를 만들지 않았다.
- Sentry는 포함하지 않았다.
- release evidence bundling은 포함하지 않았다.
- 이번 값은 대표 run-history fixture 기준이며, production telemetry 전체가 90%에 도달했다는 뜻은 아니다.
- Claude Code와 Codex, macOS와 Windows 동시 지원 기준을 유지했다.
