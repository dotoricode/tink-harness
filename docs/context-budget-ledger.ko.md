# Context Budget Ledger

Context Budget Ledger는 Tink가 context를 많이 모으는 대신, 왜 넣었고 왜 뺐는지 점수화할 수 있게 만드는 작은 기록 규칙이다.

이 기능은 새 public command가 아니다. `tink index` 명령, watcher, generated cache, hidden runtime index도 만들지 않는다. `/tink:cast`와 `$tink:cast`가 이미 남기는 `context-map.json`과 `context-diff.json`의 항목을 더 읽기 쉽게 만드는 방식이다.

영어판은 `docs/context-budget-ledger.md`에 있다.

## 왜 필요한가

지금의 `context-map.json`은 어떤 파일과 source를 포함하거나 제외했는지 설명할 수 있다. 하지만 반복 작업에서 다음 질문을 정량적으로 답하기에는 정보가 부족했다.

- 이 context가 핵심인가, 보조인가, 검증 대상인가?
- 처음 context pack에 넣기에는 비용이 높은가?
- 다음 비슷한 작업에서 다시 불러와야 하는가, 피해야 하는가?
- 어떤 검증 check와 연결되는가?
- 오래됐거나 stale한 정보인가?

그래서 context entry에 다음 optional 필드를 추가한다.

- `role`: `primary`, `supporting`, `verification_target`, `external_evidence`, `exclusion_candidate`, `example_only`, `stale`, `avoid_next_time`.
- `cost`: `low`, `medium`, `high`.
- `reuse_signal`: `always`, `often`, `rare`, `example_only`, `avoid_next_time`.
- `verification_link`: 연결되는 check, evidence ref, verification hint.
- `staleness`: `fresh`, `aging`, `stale`, `unknown`.
- `evidence_kind`: `file`, `doc`, `schema`, `test`, `command`, `external`, `signal`, `diff`, `unknown`.

## 어떻게 쓰는가

작업 시작 시에는 `role`과 `cost`로 첫 context pack을 작게 고른다.

작업 중에는 새로 필요해진 context를 `context-diff.json`에 남긴다. 이때 `verification_link`가 있으면 리뷰자가 왜 그 파일을 봤는지 다시 추리하지 않아도 된다.

작업 후에는 `reuse_signal`과 `staleness`를 보고 다음 반복에서 제외할 후보를 더 빨리 고른다. 예를 들어 `reuse_signal: "avoid_next_time"`인 외부 research link는 비슷한 로컬-only 작업에서 다시 불러오지 않는다.

`role: "verification_target"`인 항목은 반드시 검증과 연결되어야 한다. 연결이 없으면 검증 누락 후보로 본다.

## 점수화 방식

`context-map.json.efficiency_metrics`는 여섯 지표를 0-100%로 기록한다.

- 불필요 context 포함률 감소: 제외 항목이 `reuse_signal`, `staleness`, 제외 이유를 갖는 비율.
- 초기 context pack 크기 감소: included 항목이 `role`과 `cost`로 우선순위화되는 비율.
- 리뷰자가 근거 찾는 시간 감소: included 항목 중 `role`과 `verification_link`가 함께 있는 비율.
- 검증 누락 탐지율 개선: `verification_target` 항목 중 연결 check가 있는 비율.
- 반복 작업 context 재사용 정확도: `reuse_signal`이 있는 항목 비율과 path-case 재선택 결과.
- 재작업 가능성 감소: context-diff에서 뒤늦게 추가된 필수 context와 누락 check가 줄어드는지.

실제 telemetry가 없으면 `measurement_status: "estimated"`로 두고 한계를 함께 적는다. 근거 없이 90% 달성으로 표시하지 않는다.

## 호환성 기준

- Claude Code와 Codex가 같은 schema와 fixture를 읽는다.
- macOS와 Windows 모두에서 동작해야 하므로 shell 전용 경로나 OS 전용 명령을 요구하지 않는다.
- 사용자 승인 없이 reusable memory, harness, rule, config를 저장하지 않는다.
- Sentry와 release evidence bundling은 포함하지 않는다.
