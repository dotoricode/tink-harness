# Context Run History Rollup

Context Run History Rollup은 여러 run의 `context-metrics-evaluation.json` 점수를 묶어 90% 목표가 반복 작업에서도 유지되는지 보는 기준이다.

이 기능은 새 public command가 아니다. `tink index` 명령, watcher, generated cache, hidden runtime index를 만들지 않는다. 지금 단계에서는 `tests/fixtures/maintenance/context-metrics-rollup.json`과 `tests/test_templates.py`가 같은 rollup 점수를 계산하는지 확인한다.

영어판은 `docs/context-run-history-rollup.md`에 있다.

## 왜 필요한가

current run 하나가 90% 이상이어도 반복 작업 전체가 안정적이라고 말하기는 어렵다. Rollup은 여러 run의 점수를 모아서 다음을 확인한다.

- 각 지표의 평균 점수.
- 각 지표의 최저 점수.
- 모든 run이 여섯 지표를 빠짐없이 갖는지.
- 각 지표가 평균과 최저점 모두 90% 이상인지.

## 점수의 의미

`scope: "run_history"`는 여러 run record를 묶은 값이라는 뜻이다.

fixture에 있는 rollup은 production telemetry가 아니다. 실제 `.tink/runs/*` 기록이 충분히 쌓이기 전까지는 “대표 run-history fixture에서 90% 이상”이라고만 말한다.

## 완료 기준

- 여섯 지표가 모두 rollup 평균 90% 이상이다.
- 여섯 지표가 모두 run별 최저점 90% 이상이다.
- 각 score에는 `formula`, `numerator`, `denominator`, `evidence_refs`, `minimum_percent`가 있다.
- `limits`에 production telemetry가 아님을 명시한다.

## 호환성 기준

- Claude Code와 Codex가 같은 artifact 이름과 metric 이름을 읽을 수 있어야 한다.
- macOS와 Windows 모두에서 `npm test`로 검증되어야 한다.
- 사용자 승인 없이 reusable memory, harness, rule, config를 저장하지 않는다.
- Sentry와 release evidence bundling은 포함하지 않는다.
