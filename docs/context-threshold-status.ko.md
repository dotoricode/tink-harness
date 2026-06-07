# Context Threshold Status

Context Threshold Status는 여섯 가지 컨텍스트 효율 지표가 90% 목표를 넘었는지 한눈에 확인하는 상태판이다.

현재 상태판은 `tests/fixtures/current-run/context-metrics-evaluation.json`과 `tests/fixtures/maintenance/context-metrics-rollup.json`을 함께 본다. 즉, 단일 current run fixture와 여러 대표 run을 묶은 run-history rollup이 모두 90% 이상인지 확인한다.

이 문서는 새 public command가 아니다. `tink index` 명령, watcher, generated cache, hidden runtime index를 만들지 않는다. 자동으로 사용자의 repo 데이터를 수집하지도 않는다.

영어 문서는 `docs/context-threshold-status.md`에 있다.

## 현재 상태

| 지표 | current run | rollup 평균 | rollup 최저 | 상태 |
| --- | ---: | ---: | ---: | --- |
| 불필요 context 포함률 감소 | 100% | 97% | 94% | 90% 이상 |
| 초기 context pack 크기 감소 | 100% | 95% | 92% | 90% 이상 |
| 리뷰자가 근거 찾는 시간 감소 | 100% | 98% | 96% | 90% 이상 |
| 검증 누락 탐지율 개선 | 100% | 99% | 98% | 90% 이상 |
| 반복 작업 context 재사용 정확도 | 100% | 96% | 94% | 90% 이상 |
| 재작업 가능성 감소 | 100% | 95% | 91% | 90% 이상 |

## 왜 필요한가

이 상태판이 없으면 90% 이상이라는 말을 어디까지 믿어도 되는지 다시 추리해야 한다.

- current run fixture는 지금 만든 artifact가 완전한지 본다.
- run-history rollup은 반복 작업에서도 점수가 유지되는지 본다.
- minimum score는 특정 작업 단위가 90% 아래로 떨어지는지 본다.

## 한계

현재 상태는 repository fixture와 대표 run-history fixture 기준이다. production telemetry가 아니다.

따라서 사용자에게 “모든 실제 프로젝트에서 90% 이상 보장”이라고 말하면 안 된다. 실제 `.tink/runs/*` 기록이 충분히 쌓이면 같은 계산식으로 다시 rollup해야 한다.

## 완료 기준

- 여섯 지표 모두 current run score가 90% 이상이다.
- 여섯 지표 모두 rollup 평균이 90% 이상이다.
- 여섯 지표 모두 rollup 최저점이 90% 이상이다.
- `limits`에 production telemetry가 아니라는 한계를 명시한다.
- Claude Code와 Codex 모두 같은 artifact 이름과 metric 이름을 읽을 수 있다.
- macOS와 Windows 모두 `npm test`로 검증할 수 있다.
