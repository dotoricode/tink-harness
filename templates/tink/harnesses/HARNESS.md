# Tink 하네스 카탈로그

사람이 빠르게 훑어보기 위한 하네스 요약 모음. `index.json`이 진짜 원본이고, 이 파일은 사람용 색인입니다. 새 작업을 시작하기 전에 먼저 훑어서 기존 하네스를 재사용하거나 여러 하네스의 단계를 조합할 수 있을지 검토하세요.

## 작업용 하네스

- **[code-change](./code-change.md)** (small) — 범위가 명확한 코드 추가·변경·리팩토링. 관련 파일만 손대고 테스트 근거 남기기.
- **[bug-fix](./bug-fix.md)** (small) — 재현 → 근본 원인 → 최소 수정 → 회귀 확인.
- **[research](./research.md)** (small) — 옵션 비교, 문서 읽기, 근거 수집. 추측 분리, 다음 액션 명시.
- **[review](./review.md)** (small) — 변경·위험·PR 검토. 실측 발견점만 기록.
- **[docs](./docs.md)** (tiny) — README, 가이드, PRD. 독자와 다음 행동을 명확히.
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
