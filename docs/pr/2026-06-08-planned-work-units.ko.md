# 계획된 작업 단위 정리

## 문제

남은 로드맵이 번호가 붙은 단계 중심으로 설명되어 있어, 실제로 어떤 작업이 생기고 어떤 산출물이 필요한지 한눈에 보기 어려웠다. 또한 검증 증거, 외부 context 정책, 하네스 생애주기, memory 저장 경계 같은 항목은 자동화를 바로 넣기 전에 문서와 스키마로 경계를 먼저 고정할 필요가 있었다.

## 해결

- 남은 계획을 `docs/planned-work-units.ko.md`와 `docs/planned-work-units.md`에 작업 단위 이름으로 다시 정리했다.
- 검증 증거를 `evidence_kind`, `evidence_ref`, `observed`로 더 자세히 남길 수 있게 verification schema를 확장했다.
- 외부 context 정책을 `templates/tink/schemas/mcp-policy.schema.json`과 예시 fixture로 표현했다.
- 하네스 생애주기 추천을 `templates/tink/schemas/harness-lifecycle.schema.json`과 maintenance fixture로 표현했다.
- memory를 `approved`, `candidate`, `rejected`, `evidence` decision folder로 나누는 설치 template을 추가했다.
- 컨텍스트 변화 리뷰와 업데이트 진단은 새 command가 아니라 문서와 fixture로 먼저 고정했다.

## 검증

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`

## 참고

- 새 public command는 추가하지 않았다.
- Sentry는 현재 계획에 포함하지 않았다.
- release evidence bundling은 계속 제외했다.
- Claude Code와 Codex, macOS와 Windows 동시 지원을 기준으로 작성했다.
