# tink-feedback-apply

## Trigger
사용자가 Tink의 동작, 상호작용 패턴, 출력 품질에 대해 피드백을 줄 때 — 멈춰야 할 것, 바꿔야 할 것, 개선해야 할 것.

## Domain rules

### 1. 피드백 분류
- **behavioral rule**: cast/frog/weave가 어떻게 행동해야 하는지
- **UX pattern**: 상호작용 흐름 (무엇을 보여줄지, 무엇을 건너뛸지)
- **preference**: 지속 선호 (톤, 언어, 상세도)
- **harness procedure**: 특정 하네스 절차가 틀렸거나 빠진 단계가 있음
- **new harness**: 반복 작업에 별도 하네스 필요

### 2. 레이어 위치
- behavioral / UX → `commands/cast.md` — 3-layer 동시 수정: `.claude/commands/tink/`, `templates/claude/commands/tink/`, `commands/`
- preference → `.tink/memory/preferences.md`
- harness procedure → `.tink/harnesses/<name>.md`
- new harness → `.tink/harnesses/<name>.md` 생성 + `index.json` 업데이트

### 3. 최소 유효 변경
- 한 줄 또는 한 단락. 구조 재작성 금지.
- "Do not" 규칙 → `## Do not` 섹션에 추가
- 절차 단계 → 해당 단계만 수정

### 4. 트리거 시나리오 검증
- 피드백을 유발한 상황을 설명 형태로 재현
- 변경이 그 상황을 방지했을지 확인

## Checks
- 올바른 레이어에 변경됐는지 (preference ≠ harness ≠ command)
- 변경이 최소한인지 — 관련 없는 수정 없음
- 트리거 시나리오 통과 (설명 형태)
- command / harness / memory 파일 변경 시 Reusable State Save Gate 페이로드 직접 제시

## Recovery
변경이 다른 동작을 깨뜨리면, git으로 되돌리고 변경 범위를 더 좁혀서 재시도.