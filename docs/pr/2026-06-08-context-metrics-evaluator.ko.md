# Context Metrics Evaluator

## 문제

Context Budget Ledger로 context entry에 역할, 비용, 재사용 신호, 검증 연결을 남길 수 있게 되었지만, `efficiency_metrics` 점수는 아직 사람이 적은 값에 가까웠다. 목표 지표를 90% 이상으로 반복 개선하려면 점수가 실제 fixture에서 다시 계산되어야 한다.

## 해결

- `tests/fixtures/current-run/context-metrics-evaluation.json`을 추가해 여섯 지표의 계산식, 분자, 분모, evidence ref를 기록했다.
- `context-map.json.efficiency_metrics`를 `fixture-ratio-v1` 기준의 `measured` 점수로 갱신했다.
- `tests/test_templates.py`가 context-map, context-diff, contract, repo signal, path-case fixture를 다시 읽어 점수를 직접 계산하도록 했다.
- 반복 path-case에 expected context role을 보강해 재사용 정확도도 계산할 수 있게 했다.
- 한국어 우선 문서 `docs/context-metrics-evaluator.ko.md`와 영어 companion을 추가했다.

## 검증

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`

## 참고

- 새 public command는 추가하지 않았다.
- `tink index` 명령, watcher, generated cache, hidden runtime index를 만들지 않았다.
- Sentry는 포함하지 않았다.
- release evidence bundling은 포함하지 않았다.
- 이번 점수는 fixture scope의 측정값이며, production telemetry 전체가 90%에 도달했다는 뜻은 아니다.
- Claude Code와 Codex, macOS와 Windows 동시 지원 기준을 유지했다.
