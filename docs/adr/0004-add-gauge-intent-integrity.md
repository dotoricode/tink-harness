# ADR 0004: Gauge로 이해 계약의 무결성 유지

- 상태: Accepted
- 날짜: 2026-07-14

## 문제

Tink의 기존 실행 계약은 성공 조건, 금지 행동, 검증 명령과 증거를 잘 보존하지만, Agent가 사용자의 목적과 우선순위를 어떻게 이해했는지, 작업 중 새 가정을 도입했는지, 성공 조건 자체가 빠졌는지를 명시적으로 보존하지 않았다. 이 상태에서는 검사 명령이 모두 통과해도 원래 요구사항 일부가 누락되거나 범위가 달라진 결과를 완료로 오인할 수 있다.

## 결정

새 공개 명령이나 `understanding-engineering` Harness를 추가하지 않는다. 기존 `cast → work → verify` 흐름을 다음 세 지점에서 강화한다.

1. cast는 non-trivial standard/deep run에 optional `intent`, `understanding_proof`, revisioned `approval`을 기록하고 승인 전에 Intent Proof를 보여준다.
2. Gauge는 Evidence Split 옆의 Base-run habit으로 동작한다. 계획·목표·가정·범위·접근 변경·최종 검증 경계에서 의미 이탈을 확인하고 `notes.md`에 `aligned`, `adjustment_needed`, `blocked`를 기록한다.
3. verify는 명령 실행 전 Phase 0 Contract Coverage를 수행한다. success condition마다 계획·구현·검사·증거를 연결하고 forbidden, open question, assumption, revision 상태를 검토한다.

승인된 `intent.goal`, `intent.priority`, scope, success conditions, forbidden은 자동 변경하지 않는다. 의미 변경은 사용자 승인, revision 증가, `answers.md` 이력을 요구한다. 기존 contract는 새 필드가 모두 optional이므로 legacy 형식으로 계속 지원한다.

## 이유

Gauge는 뜨개질 도중 크기와 밀도가 원래 패턴에서 벗어나지 않았는지 재는 기준이다. Cast가 작업의 형태를 잡고 Verify가 완성 조건의 증거를 확인한다면, Gauge는 작업 중 그 기준 자체가 처음 승인한 의미와 같은지 확인한다. 별도 Harness로 만들면 선택되지 않은 run에서 의미 이탈을 놓칠 수 있으므로 Base-run habit이 더 적합하다.

## 결과와 트레이드오프

- 공개 `/tink:*`와 `$tink:*` 표면은 늘어나지 않는다.
- 새 필수 runtime 파일 없이 기존 `contract.json`, `answers.md`, `notes.md`, `verification.json`, `evidence.md`를 확장한다.
- standard/deep 작업에는 짧은 이해 증명 비용이 생기지만 quick Lane 1은 기본적으로 생략한다.
- strict completion은 command success보다 의미 누락을 우선해 이전보다 더 자주 `blocked`가 될 수 있다.
- Gauge는 코드 스타일, 일반 버그, 성능 최적화, 리팩터링 품질을 평가하지 않는다. 그 책임은 기존 review와 verify에 남는다.

## 검증

- legacy contract와 optional v2 schema 구조를 함께 검사한다.
- omission, drift, unapproved assumption, quick fast path, resume revision fixture를 실행 가능한 테스트 계약으로 유지한다.
- root command와 Claude template/로컬 command의 byte 동일성, Claude skill 사본, Codex 규칙의 의미 동등성을 기존 테스트에 연결한다.
- release 전 `npm run check`, `git diff --check`, package manifest 검사를 통과해야 한다.

## English summary

Tink keeps understanding integrity inside the existing flow: Intent Proof before work, Gauge at meaningful work boundaries, and missingness-first Contract Coverage before command checks. New fields are optional for backward compatibility, approved meaning is revision-protected, and no new public command or standalone harness is introduced.
