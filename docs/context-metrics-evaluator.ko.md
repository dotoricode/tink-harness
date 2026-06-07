# Context Metrics Evaluator

Context Metrics Evaluator는 Context Budget Ledger에 적힌 필드를 실제 비율로 계산하는 테스트 기준이다.

이 기능은 새 public command가 아니다. `tink index` 명령, watcher, generated cache, hidden runtime index를 만들지 않는다. 지금 단계에서는 `tests/fixtures/current-run/context-metrics-evaluation.json`과 `tests/test_templates.py`가 같은 점수를 계산하는지 확인한다.

영어판은 `docs/context-metrics-evaluator.md`에 있다.

## 왜 필요한가

`context-map.json.efficiency_metrics`에 점수를 사람이 직접 적기만 하면, 숫자가 좋아 보여도 근거가 약하다. Evaluator는 fixture를 다시 읽어서 다음을 계산한다.

- excluded context가 `role`, `cost`, `reuse_signal`, `staleness`, `reason`을 갖는 비율.
- included context가 `role`과 `cost`를 갖고, high-cost 항목은 `verification_link`를 갖는 비율.
- included context가 `role`과 `verification_link`를 함께 갖는 비율.
- `verification_target` 항목이 실제 verification command나 verification hint와 연결되는 비율.
- 반복 path-case가 expected context role을 갖는 비율.
- context-diff 변화가 verification link와 metric impact로 추적되는 비율.

## 점수의 의미

`fixture-ratio-v1`에서 90% 이상이라는 말은 “예시 artifact가 내부적으로 측정 가능하고 빠진 필드가 거의 없다”는 뜻이다.

이것은 아직 “실제 모든 사용자 작업에서 90% 효율을 달성했다”는 뜻이 아니다. production telemetry나 여러 run record가 쌓이기 전까지는 scope를 `fixture`로 제한한다.

## 완료 기준

- 여섯 지표가 모두 fixture 계산 기준으로 90% 이상이다.
- `context-map.json.efficiency_metrics.scores[]`와 `context-metrics-evaluation.json`의 점수가 일치한다.
- 각 점수에는 `formula`, `numerator`, `denominator`, `evidence_refs`, `limit`가 있다.
- `measurement_status`는 fixture에서 계산되면 `measured`로 둘 수 있지만, 문서에는 한계를 함께 적는다.

## 호환성 기준

- Claude Code와 Codex가 같은 artifact를 읽을 수 있어야 한다.
- macOS와 Windows 모두에서 `npm test`로 검증되어야 한다.
- 사용자 승인 없이 reusable memory, harness, rule, config를 저장하지 않는다.
- Sentry와 release evidence bundling은 포함하지 않는다.
