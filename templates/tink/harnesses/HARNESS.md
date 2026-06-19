# Tink 하네스 카탈로그

사람이 빠르게 훑어보기 위한 하네스 요약 모음. `index.json`이 진짜 원본이고, 이 파일은 사람용 색인입니다. 새 작업을 시작하기 전에 먼저 훑어서 기존 하네스를 재사용하거나 여러 하네스의 단계를 조합할 수 있을지 검토하세요.

## 기본 절차 (하네스 없음)

일반적인 코드 변경·버그 수정·조사·리뷰·문서 작업은 별도 하네스 없이 **기본 절차**로 진행합니다. 실행 상태 계약(`plan.md`, `checks.md`, `steps.json`, `contract.json`)이 범위·검증·증거를 이미 강제하므로, 범용 하네스는 기본 세트에서 퇴역했습니다. 하네스는 아래처럼 절차가 실제로 특화된 경우에만 선택합니다.

## 작업용 하네스

- **[requirements-interview](./requirements-interview.md)** (small) — 모호한 아이디어를 한 번에 한 질문씩 좁혀 성공 조건과 금지 조건을 명확히.
- **[plan-consensus](./plan-consensus.md)** (small) — 큰 설계·리팩토링 계획을 Planner → Architect → Critic → Final 흐름으로 점검.
- **[goal-checkpoint](./goal-checkpoint.md)** (small) — 긴 실행을 2-6개 목표와 완료 증거로 쪼개 `.tink/current/goals.json`에 기록.
- **[delegation-brief](./delegation-brief.md)** (small) — 병렬 작업이나 인수인계를 위한 범위·금지 행동·증거 요구사항을 정리. worker는 자동 실행하지 않음.
- **[issue-triage](./issue-triage.md)** (small) — 이슈·외부 PR·QA 보고·넓은 계획을 상태, agent-ready brief, 세로 slice로 정리.
- **[bug-diagnosis-loop](./bug-diagnosis-loop.md)** (small) — 어려운 버그·회귀·flake·성능 문제에서 코드 수정 전 red-capable feedback loop를 먼저 확보.
- **[review-two-axis](./review-two-axis.md)** (small) — PR·브랜치·diff를 Standards와 Spec 두 축으로 분리해 검토.
- **[decision-map](./decision-map.md)** (small-heavy) — 여러 세션이 필요한 느슨한 아이디어를 research/prototype/discuss ticket 지도와 frontier로 관리.
- **[architecture-deepening](./architecture-deepening.md)** (small-heavy) — deep module, interface, seam, leverage, locality 관점으로 구조 개선 후보와 계획을 정리.
- **[ship](./ship.md)** (small) — PR 준비, 릴리스, 배포. 위험·롤백 명시. cast 시작 시 안전판이 미리 켜집니다.

## 관리용 메타 하네스

- **[harness-curation](./harness-curation.md)** — 도구·하네스가 너무 많거나 무거울 때 최소 묶음 고르기. 컨텍스트·출력 습관 보정도 이 하네스 내 섹션으로 처리.
- **[harness-synthesis](./harness-synthesis.md)** — 기존 하네스로 안 풀리는 반복 도메인일 때 좁은 새 하네스 만들기.
- **[tink-feedback-apply](./tink-feedback-apply.md)** — Tink 동작·UX·출력 품질 피드백을 올바른 레이어에 최소 변경으로 적용.

## 합성된 도메인 하네스

- **[pre-publish-multi-agent-verify](./pre-publish-multi-agent-verify.md)** (small) — 공개 publish 직전 격리 환경에서 여러 에이전트로 install·UX·docs·leak·slash 표면을 병렬 검증. 시나리오 사전 잠금, evidence-only, blocker/major/minor/nit 분류.

## 사용 원칙

1. **재사용 우선**: 새 요구사항이 들어오면 기존 하네스의 단계·검증을 *조합*해서 해결할 수 있는지 먼저 봅니다.
2. **새 하네스는 신중히**: `harness-synthesis`는 *기존 하네스로 정말 안 될 때*만. 호출해도 기본은 임시 초안(이번 실행만 적용), 영구 저장은 별도 승인 필요.
3. **사람용 카탈로그**: 이 파일은 빠른 훑어보기 용도입니다. 자동 검증은 `index.json`이 담당하고, 하네스 추가·제거 시 이 파일은 사람이 직접 업데이트합니다.
