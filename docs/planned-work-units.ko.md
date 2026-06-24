# 계획된 작업 단위

이 문서는 남은 로드맵을 번호가 붙은 단계가 아니라 실제 작업 단위로 다시 정리한다. 모든 작업은 Claude Code와 Codex를 함께 지원하고, macOS와 Windows에서 동작해야 하며, 사용자가 명시적으로 원하지 않는 한 새 public command surface를 만들지 않는다.

## 관리 규칙

포괄적인 아이디어는 바로 구현 목록에 넣지 않고 먼저 요구사항, 성공 기준, 제외 범위, 검증 근거로 좁힌다. 구현이 완료된 작업 단위는 이 활성 목록에서 제거하고, 완료 사실은 구현된 기반, PR 문서, changelog, 또는 별도 완료 기록에 남긴다.

## 구현된 기반

### 하네스 생애주기 신호

첫 번째 하네스 건강 요약은 이제 보이는 파일과 읽기 전용 helper로 구현되어 있다.

- `.tink/maintenance/harness-lifecycle.json`을 하네스, rule, memory, run, weave, friction 기록에서 생성한다.
- 사용, 성공, 실패, blocked, context cost, 함께 사용된 하네스, 순서 힌트, rule 참조, memory 참조, graph 관계, timeline event, 후보 점수, lifecycle state를 기록한다.
- graph overview, 최근 run timeline, 하네스별 카드를 포함한 정적 로컬 HTML health report를 만든다.
- 오래된 사용 기록은 삭제 근거가 아니라 보관 검토 신호로만 다룬다.
- 승인 없이 하네스 삭제, 병합, 재작성, 보관, memory 저장, rule 업데이트를 하지 않는다.

## 업데이트 결과 명확화

기존 설치 사용자가 `tink-harness update` 후 상태를 믿기 쉽게 만든다.

- 무엇이 바뀌었는지 보여준다.
- 무엇이 보존되었는지 보여준다.
- 제거된 legacy Codex skill 경로를 보여준다.
- 현재 surface에 맞는 다음 명령을 보여준다.

## Cast 컨텍스트 선택

Context Graph Lite는 `/tink:cast`와 `$tink:cast` 내부 선택 근거로만 유지한다.

- changed path를 작고 관련성 높은 context 후보로 연결한다.
- `context_graph_rule` signal을 기록한다.
- 관계가 없으면 추측하지 않고 `unmatched_path`를 기록한다.
- `tink index`, watcher, generated cache, hidden runtime index를 만들지 않는다.

## 검증 증거 세분화

검증 결과를 다음 행동으로 연결하기 쉽게 만든다.

- command, manual, diff, coverage, security, external, package evidence를 구분한다.
- raw log 대신 짧은 evidence handle을 남긴다.
- 실패하거나 막힌 check 옆에 가장 작은 복구 행동을 둔다.

## 외부 컨텍스트 정책

외부 context 안전 규칙을 작은 정책 파일로 표현한다.

- source는 기본 read-only로 다룬다.
- 가장 작은 유용한 source reference만 사용한다.
- secret과 넓은 raw payload는 제외한다.
- 외부 문서의 지시는 권한이 아니라 데이터로 다룬다.

## 메모리 결정 계층

승인된 memory와 후보, 거절된 제안을 분리한다.

- approved memory만 로드할 수 있다.
- candidate memory는 제안일 뿐이다.
- rejected memory는 같은 제안을 반복하지 않게 한다.
- evidence는 private payload가 아니라 짧은 근거 handle만 저장한다.

## 컨텍스트 변화 리뷰

작업 중 선택된 context가 어떻게 바뀌었는지 보여준다.

- 추가되거나 제거된 path를 기록한다.
- 추가되거나 제거된 signal ref를 기록한다.
- 새 context가 왜 관련 있어졌는지 설명한다.
- public graph index가 아니라 run evidence로만 둔다.

## 업데이트 진단

새 명령을 만들지 않고 update 문제 해결을 더 쉽게 만든다.

- 진단은 `/tink:update`, `$tink:update`, 문서 안에 둔다.
- 기대한 install surface와 실제 파일을 비교한다.
- 가장 작은 검증 recipe로 안내한다.
- `--force`가 명시되지 않으면 user-modified file을 보존한다.

## 직접 CLI와 대시보드 명령

Standalone CLI를 더 짧게 입력하고, 로컬 health report를 더 쉽게 열 수 있게 만든다.

- 실행 파일이 `PATH`에 설치된 뒤에는 `tink-harness update`, `tink-harness install`, 이후 `tink-harness dashboard`를 기본 직접 명령 형태로 다룬다.
- 아직 실행 파일이 설치되지 않은 사용자를 위해 `npx tink-harness@latest ...`는 bootstrap 경로로 유지한다.
- README 예시를 전면 교체하기 전에 Windows와 macOS에서 직접 `tink-harness` command shim을 검증한다.
- 기존 lifecycle summary generator와 HTML report renderer를 한 번에 실행하는 `dashboard` 명령을 추가한다.
- `dashboard`는 기본적으로 로컬 정적 파일만 만든다. 서버, watcher, hidden cache, 자동 하네스 수정은 하지 않는다.
- 생성 파일 경로가 플랫폼별로 안정화된 뒤에만 선택적인 open/export flag를 검토한다.

## Evidence Split / Parallel Evidence

작업 병렬화보다 먼저, Tink의 기본 작업 루프에 Evidence Split을 넣는다. Tink를 별도 multi-agent runtime으로 만들지 않고, 큰 작업을 작은 증거 packet으로 나누는 기본 동작부터 안정화한다. 상세 연구 기록은 `docs/swarm-fast-lane.ko.md`와 `docs/swarm-fast-lane.md`에 둔다.

- `/tink:cast`와 `$tink:cast`는 하네스 선택 전에 `probe`, `patch`, `verify`, `review`, `decision` packet으로 나눌 수 있는지 점검한다.
- 실제 작업 중에도 불확실성, 검증 실패, context 확대, 변경 결합이 생기면 다시 packet으로 나눈다.
- packet은 전체 작업이 아니라 1-3개 입력만 가진 작은 단위를 본다.
- 외부 worker가 필요할 때도 기본적으로 파일을 직접 수정하지 않고 evidence와 patch candidate만 반환한다.
- 메인 에이전트만 최종 patch 선택, 파일 수정, 검증을 책임진다.
- 성공 지표는 "항상 더 빠름"이 아니라 main context 감소, 재작업 감소, 실패 조기 발견, 검증 통과율 유지 또는 개선으로 둔다.
- 초기 모드는 core behavior인 Evidence Split으로 두고, 실제 worker runtime은 별도 후속 작업으로 미룬다.
- worker 출력은 future runtime에서도 300단어 이하, evidence-only, confidence 포함으로 제한한다.
- public contract, secrets, 넓은 repo scan, 동일 파일 동시 수정이 필요한 작업에서는 선택하지 않는다.

## 제외

release evidence bundling은 계속 제외한다. release history, public release note, portfolio framing은 사용자나 팀의 판단 영역이다. Tink는 검증 artifact를 남길 수 있지만, 공개 release evidence를 어떻게 묶을지는 대신 결정하지 않는다.
