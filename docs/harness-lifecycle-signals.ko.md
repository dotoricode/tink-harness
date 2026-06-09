# 하네스 생애주기 신호

하네스 생애주기 신호는 재사용 하네스의 건강 요약이다.
Tink가 지난 실행 기록을 읽고 다음 질문에 답할 수 있게 돕는다.

- 어떤 하네스가 실제로 쓰였는가?
- 어디서 check가 실패하거나 막혔는가?
- 어떤 하네스는 `/tink:weave`로 조금 고치면 좋은가?
- 어떤 하네스는 정리하거나 병합 후보로 볼 수 있는가?

스키마는 `templates/tink/schemas/harness-lifecycle.schema.json`에 둔다.

유용한 신호는 다음과 같다.

- `uses`: 하네스가 선택된 횟수.
- `successes`: 필수 검증까지 완료한 실행.
- `failures`: 필수 check 실패.
- `blocked`: check를 실행할 수 없었던 경우.
- `last_used`: 마지막으로 확인된 사용 시각. 기록이 없으면 `null`.
- `success_rate`: 사용 횟수 대비 검증 완료 비율. 근거가 부족하면 `null`.
- `failure_rate`: 사용 횟수 대비 필수 check 실패 비율. 근거가 부족하면 `null`.
- `co_used_with`: 같은 run에서 자주 함께 나온 하네스.
- `sequence_hints`: 한 하네스 뒤에 다른 단계가 반복해서 따라온 순서 힌트.
- `rule_refs`: 같은 run 기록에 나온 rule id.
- `memory_refs`: 같은 run 기록에 나온 memory 파일.
- `context_cost`: low, medium, high, unknown.

요약에는 이후 리포트와 대시보드가 읽기 쉬운 작은 `graph` 블록도 들어간다.

- `graph.nodes`: harness, rule, memory, stage 노드.
- `graph.edges`: `co_used`, `sequence`, `uses_rule`, `uses_memory` 같은 관계.

이 graph는 같은 보이는 기록에서 만든 보기용 모델이다. hidden cache나 background index가 아니다.

`timeline` 블록은 최근 run event를 최신순으로 담는다. 각 event에는 날짜, source, status, outcome, 선택된 하네스가 들어간다. HTML 리포트는 이 값을 사용해 브라우저에서 파일을 다시 replay하지 않고도 실패, blocked, 성공 검증 흐름을 보여준다.

허용되는 추천은 다음과 같다.

- `keep`
- `weave`
- `frog_candidate`
- `merge_candidate`
- `observe`

각 하네스에는 `candidate_score`가 들어갈 수 있다. 이 값은 0부터 100까지의 `total`과 evidence, trouble, context cost, overlap, recommendation priority 같은 factor로 구성된 정렬 보조 신호다. 승인으로 해석하면 안 되며 자동 수정으로 이어져도 안 된다.

근거 판단은 보수적으로 한다.

- 기록이 없거나 근거가 약함 → `observe`
- 실패나 blocked가 반복됨 → `weave`
- 함께 쓰이는 패턴이 반복됨 → `merge_candidate`
- 미사용, 반복 거절, 대체, 높은 context 비용 같은 강한 근거가 있음 → `frog_candidate`

추천은 제안일 뿐이다. reusable harness 삭제, 병합, 재작성, memory 저장, rule 업데이트는 여전히 명시적인 승인이 필요하다. 생애주기 요약은 다음 행동을 준비할 수 있지만 자동으로 적용하면 안 된다.

## 로컬 HTML 리포트

설치된 repo에는 작은 읽기 전용 helper 두 개가 함께 들어간다. 먼저 보이는 `.tink/` 기록에서 JSON 요약을 만든다.

```bash
node .tink/tools/generate-harness-lifecycle-summary.mjs
```

기본값으로 `.tink/harnesses/index.json`, `.tink/rules/index.json`, `.tink/memory/*.md`, `.tink/runs/*.md`, `.tink/maintenance/weave-queue.json`, `.tink/maintenance/friction.jsonl`을 읽고 `.tink/maintenance/harness-lifecycle.json`을 쓴다.

그 다음 이 요약을 로컬 HTML 리포트로 바꿀 수 있다.

```bash
node .tink/tools/render-harness-health-report.mjs
```

리포트 helper는 `.tink/maintenance/harness-lifecycle.json`을 읽고 `.tink/maintenance/harness-health-report.html`을 쓴다. 테스트할 때는 경로를 직접 줄 수 있다.

```bash
node .tink/tools/generate-harness-lifecycle-summary.mjs repo-root output.json
node .tink/tools/render-harness-health-report.mjs input.json output.html
```

두 helper는 재사용 Tink 상태를 고치지 않는다. 요청한 요약 파일이나 리포트 파일만 쓴다. 하네스 수정, 병합, 보관, 삭제, memory 저장, rule 업데이트는 하지 않는다.

`/tink:weave`와 `/tink:frog`는 생성기가 설치되어 있으면 후보를 정렬하기 전에 이 요약을 먼저 준비해야 한다. 요약은 근거 강도에 따라 후보를 보기 좋게 정렬하는 데 쓰지만, 재사용 상태를 바꾸기 전에는 여전히 기존 승인 payload를 보여줘야 한다.

이 기능은 watcher, hidden cache, 새 public `tink index` 명령이 아니다. 기준이 되는 원본은 계속 `.tink/runs/`, `.tink/maintenance/`, `.tink/harnesses/`, `.tink/rules/` 아래의 보이는 파일이다.
