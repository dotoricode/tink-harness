# 스킬 패턴 기반 Tink 하네스 확장

## 문제

Matt Pocock 계열 스킬과 일반 워크플로 스킬을 Tink에 적용하고 싶었지만, 스킬을 그대로 모두 하네스로 복사하면 Tink의 기본 경로가 무거워지고 역할이 흐려질 위험이 있었습니다.

이번 작업의 핵심은 "스킬 목록을 많이 넣기"가 아니라, 반복적인 작업 절차 중 Tink의 선택과 검증 행동을 실제로 바꾸는 것만 선별하는 것이었습니다.

## 해결

새 opt-in 하네스 5개를 추가했습니다.

- `issue-triage`
  - 이슈, 외부 PR, QA 보고, 넓은 계획을 상태·agent-ready brief·세로 slice로 정리합니다.
- `bug-diagnosis-loop`
  - 어려운 버그, 회귀, flake, 성능 문제에서 코드 수정 전 red-capable feedback loop를 먼저 확보하게 합니다.
- `review-two-axis`
  - PR·브랜치·diff 리뷰를 Standards와 Spec 두 축으로 나눠 한쪽 통과가 다른 쪽 실패를 가리지 않게 합니다.
- `decision-map`
  - 여러 세션이 필요한 느슨한 아이디어를 research/prototype/discuss ticket 지도와 frontier로 관리합니다.
- `architecture-deepening`
  - deep module, interface, seam, leverage, locality, testability 관점으로 구조 개선 후보와 계획을 정리합니다.

기존 하네스도 보강했습니다.

- `requirements-interview`: 코드·문서에서 찾을 수 있는 답은 먼저 탐색하고, 결정 분기에는 추천 답안을 제시합니다.
- `plan-consensus`: interface 대안 비교와 미해결 결정 ticket 분해를 반영했습니다.
- `delegation-brief`: handoff 문서처럼 기존 artifact 참조, suggested harnesses/skills, 민감정보 제외 원칙을 추가했습니다.
- `ship`, `pr-merge`: 충돌이나 범위 의심 시 primary source와 원 의도를 확인하고 tradeoff를 기록하게 했습니다.
- `harness-curation`: idea → planning → issue intake → implementation → review/ship/merge 라우팅 힌트를 추가했습니다.

`/tink:cast`와 Codex core rules도 갱신해 새 하네스들이 실제 선택 후보로 고려되도록 했습니다. README와 한국어 README에는 focused harness 선택 표면을 설명했습니다.

## 검증

- `npm test`
- `git diff --check`
- `commands/cast.md`, `templates/claude/commands/tink/cast.md`, `.claude/commands/tink/cast.md` 3-copy 동기화 확인
- `templates/tink/harnesses/index.json` JSON parse 확인
- 새 하네스 필수 섹션 및 100줄 이하 기준 확인

## 참고

- 일반 코드 변경·문서·리뷰는 여전히 기본 절차(base run)가 기본값입니다.
- 새 하네스들은 "조금 더 무거워져도 되는" opt-in 절차로 추가했지만, 기본 cast 경로에서 무조건 로드하지 않도록 trigger를 좁게 두었습니다.
- writing/teaching 계열 스킬은 Tink 핵심 역할과 거리가 있어 하네스로 복사하지 않았습니다.
