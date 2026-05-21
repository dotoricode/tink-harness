# Tink Context

## Glossary

### Tink

Claude Code용 approval-based harness curator.

Tink는 최대한 많은 도구를 쓰게 하는 시스템이 아니다. 현재 작업, 환경 제약, 사용 습관을 보고 가장 작은 유효 harness/tool set을 고르고, 없으면 좁은 harness를 만들고, 반복 실수를 줄이며, harness set을 유지보수한다.

### Forge

현재 상황을 보고 가장 작은 실행 루프를 구성하는 Tink의 상위 명령.

Forge는 단순한 harness 생성 명령이 아니다. 작업, 환경 제약, 사용 습관을 바탕으로 harness selection, harness synthesis, harness curation, habit calibration 중 필요한 판단을 하고 run state를 만든 뒤 첫 안전 행동을 시작한다.

### Harness

특정 종류의 반복 작업을 위한 작은 재사용 절차.

Harness는 언제 쓰는지, 무엇을 먼저 물어볼지, 어떤 순서로 진행할지, 무엇을 검증해야 하는지, 실패하면 어디로 돌아갈지를 정의한다.

### Harness Selection

기존 harness 중 현재 작업에 가장 작은 유효 set을 고르는 판단.

### Harness Synthesis

기존 harness가 맞지 않을 때 research, 실패, 사용자 피드백, 반복 작업에서 behavior-shaping rules를 추출해 새롭고 좁은 domain-specific harness를 만드는 판단.

### Harness Curation

도구나 harness가 너무 많거나 무거울 때 현재 작업에 맞게 쓰기, 교체, 합성, 개선, 제거 후보를 고르는 판단.

### Habit Calibration

명시적 작업 지시가 없어도 context 사용, token 사용, 입력 품질, 출력 길이, reset/compact 습관, evidence 선호 같은 관측 신호를 바탕으로 작은 운영 보정을 제안하는 판단.

### Inline Calibration

`/tink:forge` 실행 안에서만 수행하는 habit calibration.

Inline Calibration은 기본 habit calibration 방식이다. Forge가 이미 호출된 상태에서 관측 신호를 바탕으로 한 가지 작은 보정을 제안한다.

### Hook Recommendation

사용자가 optional hook을 명시적으로 켰을 때 일반 프롬프트 앞에서 제공하는 짧은 advisory-only 추천.

Hook Recommendation은 harness를 자동 적용하거나 memory를 자동 저장하지 않는다. 다른 slash skill을 가로채지 않으며, 반복 관측 신호가 있을 때만 한 줄 이하로 `/tink:forge` 또는 작은 보정을 추천한다.

### Run State

현재 forge 실행을 위해 `.tink/current/` 아래에 남기는 임시 상태.

Run State는 이번 실행의 목표, 선택한 harness, 검증 기준, 단계 상태, 메모, 사용자 답변을 담는다. 재사용 지식이나 장기 기억이 아니다.
