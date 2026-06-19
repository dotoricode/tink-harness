# Evidence Split / Parallel Evidence 연구 계획

이 문서는 멀티 에이전트 작업 병렬화의 전 단계로, Tink가 큰 작업을 작은 evidence packet으로 나누는 기본 동작을 갖도록 제한하는 연구 계획이다. 목표는 "에이전트를 많이 띄우기"가 아니라, 작은 컨텍스트 패킷으로 조사, 수정, 검증, 리뷰, 결정을 분리해 메인 에이전트의 재작업과 전체 컨텍스트 부담을 줄이는 것이다.

## 문제 정의

일반적인 멀티 에이전트 병렬화는 토큰을 더 많이 쓴다. 각 worker가 같은 문맥을 다시 읽고, 서로 다른 수정이 충돌하며, 메인 에이전트가 합산 비용을 다시 치르기 때문이다.

Evidence Split은 이 문제를 반대로 접근한다.

- packet이 전체 작업을 이해하지 않는다.
- packet이 넓은 파일을 읽지 않는다.
- 외부 worker가 쓰이더라도 기본적으로 직접 수정하지 않는다.
- worker 출력은 짧은 evidence와 patch candidate로 제한한다.
- 메인 에이전트만 최종 경로를 선택하고 파일을 수정한다.

## 핵심 가설

작업이 작게 나뉘고 경계 계약이 명확하다면, 여러 worker가 좁은 관측을 병렬 수행하는 편이 단일 에이전트가 넓은 컨텍스트를 순차 탐색하는 것보다 빠르고 덜 낭비적일 수 있다.

성공 기준은 "항상 Codex fast mode보다 빠름"이 아니다. Tink가 직접 통제할 수 있는 1차 지표는 다음이다.

- 메인 에이전트가 읽는 총 컨텍스트 감소
- 재작업 감소
- 실패 지점 조기 발견
- worker 출력 합산 비용 제한
- 최종 검증 통과율 유지 또는 개선

## 생물학적 모델

개미 군집처럼 각 worker는 전체 지도를 보지 않는다. 각 worker는 단일 자극에 반응한다.

예:

- 한 worker는 테스트 위치만 찾는다.
- 한 worker는 public contract 위험만 찾는다.
- 한 worker는 docs drift만 찾는다.
- 한 worker는 작은 patch strategy 하나만 제안한다.

메인 에이전트는 중앙 지휘자가 아니라 면역계처럼 행동한다. 들어온 제안을 그대로 합치지 않고, 충돌, 중복, 보안 위험, 검증 누락을 먼저 거른다.

## 양자역학적 모델

worker는 확정된 구현자가 아니라 가능성 샘플러다. 여러 patch 경로를 짧게 만든 뒤, 메인 에이전트가 evidence를 보고 하나의 경로로 collapse한다.

규칙:

- 관측 전 상태: patch candidate, risk candidate, test candidate.
- 관측 조건: evidence handle, file reference, expected check.
- collapse 조건: 가장 작은 수정, 가장 낮은 충돌 위험, 가장 명확한 검증.
- 폐기 조건: 넓은 컨텍스트 요구, 직접 파일 수정 필요, evidence 부족.

## 우주론적 모델

작업 전체를 하나의 큰 우주로 보지 않고, 서로 인과 연결이 약한 국소 영역으로 나눈다.

- 같은 public API, schema, command surface를 공유하면 같은 영역에 둔다.
- 서로 다른 docs/test/fixture 영역은 독립 탐색 후보로 둔다.
- public contract, release, schema, CLI surface는 중력장이 강한 경계로 보고 메인 에이전트만 수정한다.

## 제안 모드

### parallel-probe

worker는 파일 수정 없이 관련 파일, 위험, 테스트 후보만 찾는다. 초기 버전의 기본 모드로 둔다.

### patch-candidate-race

여러 worker가 서로 다른 최소 patch strategy를 제안한다. 메인 에이전트는 하나만 선택해 적용한다.

### micro-contract-split

메인 에이전트가 작업을 3-5개의 작은 계약으로 나누고, worker는 계약 하나만 검토한다.

### speculative-verifier

구현 중간에 worker들이 "이 접근이 실패할 이유"만 찾는다. 구현 병렬화보다 안전하고 비용 대비 효과가 클 수 있다.

### context-starvation-mode

worker에게 의도적으로 불완전한 최소 컨텍스트만 준다. 목적은 좋은 구현이 아니라, 작은 정보로도 잡히는 문제를 싸게 찾는 것이다.

## Core Behavior 계약

Evidence Split은 별도 하네스가 아니라 `/tink:cast`와 `$tink:cast`의 기본 동작이다. 다음 조건에서 사용한다.

- 작업이 2-5개의 독립 packet으로 나뉜다.
- 각 packet은 입력 파일 또는 질문이 1-3개로 제한된다.
- packet type은 `probe`, `patch`, `verify`, `review`, `decision` 중 하나다.
- 실제 작업 중 불확실성, 검증 실패, context 확대, 변경 결합이 생기면 다시 packet으로 나눈다.
- 외부 worker의 출력은 future runtime에서도 300단어 이하로 제한한다.
- 외부 worker는 기본적으로 직접 파일을 수정하지 않는다.
- worker 출력에는 evidence, 추천 행동, confidence가 포함된다.
- 메인 에이전트가 최종 patch와 검증을 책임진다.

선택하지 않아야 하는 경우:

- public contract 경계가 불명확하다.
- secrets, credentials, private payload가 필요하다.
- worker가 넓은 repository scan을 해야만 한다.
- 여러 worker가 같은 파일을 수정해야 한다.
- 합산 비용이 단일 base run보다 커질 가능성이 높다.

## 측정 항목

초기 구현은 추정값부터 시작하되, run artifact에 근거를 남겨야 한다.

- `worker_count`
- `packet_count`
- `input_context_refs`
- `worker_output_words`
- `accepted_candidates`
- `rejected_candidates`
- `merge_conflicts_avoided`
- `main_context_saved_estimate`
- `checks_passed`
- `checks_failed_or_blocked`

## 완료 기준

첫 구현 slice는 다음을 완료로 본다.

- Evidence Split이 Tink core rules와 `/tink:cast`, `$tink:cast` 문서에 기본 동작으로 들어간다.
- packet 형식이 `steps.json`, `context-map.json`, `notes.md`, 필요 시 `.tink/current/delegation.md`로 표현된다.
- worker 직접 수정은 기본 비활성이다.
- 작은 작업에서는 생략 가능하다는 lightweight rule이 있다.
- 검증은 "더 빠름"을 단정하지 않고, context 감소와 재작업 감소 근거를 기록한다.

## 열린 질문

- 실제 worker 실행은 Codex/Claude Code의 기존 기능을 얇게 호출할지, Tink는 packet 문서화까지만 할지 결정해야 한다.
- worker 결과 schema를 `delegation-brief`에 통합할지, 별도 runtime artifact로 둘지 결정해야 한다.
- `swarm-fast-lane` 이름은 연구 문서의 임시 이름으로만 남기고, 사용자 문구는 Evidence Split 또는 Parallel Evidence를 우선한다.
