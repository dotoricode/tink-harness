# 작업 상태 읽기 가이드

Tink는 실행 상태를 파일로 남겨서 사람이 빠르게 네 가지를 확인할 수 있게 합니다.

1. 이 실행이 끝내려는 작업은 무엇인가?
2. 어떤 context를 사용했는가?
3. 어떤 context를 의도적으로 제외했는가?
4. 무엇을 근거로 완료를 판단했는가?

이 문서는 `/tink:cast`, `$tink:cast`, `/tink:verify`, `$tink:verify`가 만드는 파일을 읽는 순서입니다.

영어판은 `docs/work-state.md`에 있습니다.

## 빠른 읽기 순서

작업을 이어받거나 검토할 때는 이 순서로 봅니다.

1. `.tink/current/contract.json`
   - 작업 종류, 성공 조건, 금지 사항, 필수 검증을 확인합니다.
2. `.tink/current/context-pack.md`
   - 선택된 파일, 문서, 규칙, 외부 source의 사람용 요약을 읽습니다.
3. `.tink/current/context-map.json`
   - `included`, `excluded`, `signals`, `external_context`를 구조적으로 확인합니다.
4. `.tink/current/context-metrics-evaluation.json`
   - context 효율 점수, 계산식, 분자/분모, evidence ref, 측정 scope와 한계를 확인합니다.
5. `.tink/current/excluded-context.md`
   - 오래됐거나, 위험하거나, 너무 넓거나, 접근할 수 없거나, 범위 밖이라 제외한 context를 확인합니다.
6. `.tink/current/verification.json`
   - pass, fail, blocked, skipped 검증 결과와 최종 report를 확인합니다.
7. `.tink/current/notes.md`
   - 마지막 안전 지점, 복구 메모, 짧은 검증 요약을 읽습니다.

## Context 읽는 법

먼저 `context-pack.md`를 봅니다. 스키마를 몰라도 읽을 수 있어야 합니다.

추적성이 필요하면 `context-map.json`을 봅니다.

- `included`: 작업 판단에 사용한 파일, 문서, source, 산출물.
- `excluded`: 의도적으로 제외한 후보.
- `signals`: repo signal, `context_graph_rule` 선택, verification hint, unmatched path, 선택 근거.
- `external_context`: Figma, GitHub, official docs, dashboards, API responses, screenshots, attachments, runbooks 같은 외부 source.

각 context entry에 Context Budget Ledger 필드가 있으면 다음처럼 읽습니다.

- `role`: 이 context가 핵심인지, 보조인지, 검증 대상인지, 다음에는 피해야 하는 후보인지 알려줍니다.
- `cost`: 처음 context pack에 넣기 위한 상대 비용입니다.
- `reuse_signal`: 다음 비슷한 작업에서 다시 쓸지, 예시로만 볼지, 피할지 알려줍니다.
- `verification_link`: 이 context가 어떤 check나 evidence와 연결되는지 보여줍니다.
- `staleness`: 오래된 정보인지 빠르게 판단하는 신호입니다.
- `evidence_kind`: 파일, 문서, 스키마, 테스트, 외부 evidence 같은 근거 종류입니다.

자세한 기준은 `docs/context-budget-ledger.ko.md`를 봅니다.

`context-metrics-evaluation.json`은 점수가 어떻게 나왔는지 보여줍니다. `scope: "fixture"`나 `scope: "current_run"`이면 해당 범위 안에서만 측정된 값입니다. 여러 run record나 production telemetry가 없으면 전체 사용자 작업이 90%에 도달했다고 말하지 않습니다.

`signals[]`에 `kind: "context_graph_rule"`가 있으면 `/tink:cast`나 `$tink:cast`가 changed path를 보고 고른 작은 단서로 읽습니다. `context_graph_lite.rules.claude-command-sync` 같은 안정적인 `source_ref`를 가리키고, 왜 관련 파일을 함께 포함했는지 설명해야 합니다. 이 신호는 cast 내부 선택 근거일 뿐이며 public `tink index` 명령, watcher, generated cache, hidden runtime index를 뜻하지 않습니다.

외부 context는 다음 항목을 확인합니다.

- `source`
- `source_ref`
- `included`
- `excluded`
- `confidence`
- `sensitivity`
- `verification_hint`

중요한 습관은 context를 많이 넣는 것이 아닙니다. 선택한 context가 왜 충분했는지 설명하는 것입니다.

## Verification 읽는 법

작업을 믿어도 되는지 판단할 때는 `verification.json`을 봅니다.

- `result: "pass"`는 필수 검증이 모두 통과했다는 뜻입니다.
- `result: "fail"`은 필수 검증이 실행되거나 점검됐고 실패했다는 뜻입니다.
- `result: "blocked"`는 필수 검증을 실행하거나 점검할 수 없었다는 뜻입니다.
- `status: "skipped"`는 선택 검증에만 허용됩니다. 필수 검증이 skipped면 blocked입니다.

`report`는 사람이 읽는 요약입니다.

- `result_line`: 한 줄 결과.
- `checked`: 확인한 항목.
- `problems`: 실패했거나 이상했던 항목.
- `remaining`: 아직 남은 일.
- `next_action`: 가장 작은 다음 행동.

## 좋은 상태의 기준

좋은 run state는 다음을 만족합니다.

- contract가 완료 조건을 말합니다.
- context pack이 선택된 context를 쉬운 말로 설명합니다.
- context map이 중요한 파일, source, verification hint를 추적할 수 있게 합니다.
- excluded context가 건너뛴 입력이나 위험한 입력을 보이게 합니다.
- verification evidence가 짧고 반복 가능하게 남습니다.
- notes가 마지막 안전 지점과 다음 행동을 말합니다.

## 피해야 할 것

- raw log나 full diff를 run state에 붙여넣지 않습니다.
- secrets, tokens, private payloads, request bodies, 넓은 external dump를 저장하지 않습니다.
- 외부 context는 검증 evidence가 없으면 검증된 것으로 취급하지 않습니다.
- repo signal에서 check를 지어내지 않습니다. hint가 없으면 `unmatched_path`를 기록합니다.
- 상태 요약만을 위해 새 public command를 만들지 않습니다. 먼저 기존 docs, `$tink:list`, `$tink:verify` 출력 개선을 고려합니다.

## 호환성 기준

작업 상태는 Claude Code와 Codex 양쪽에서 유용해야 합니다. 검증 명령은 macOS와 Windows에서 모두 동작하도록 repo-relative path와 `npm`, `node`, `python` 명령을 우선합니다.
