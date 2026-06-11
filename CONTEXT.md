# Tink Context

## Glossary

### Tink

Claude Code용 하네스 관리자 (Harness Curator).

Tink라는 이름은 `knit`의 거꾸로에서 왔다. 꼬인 작업 흐름을 풀고 다시 엮는다는 의미와, Tinker Bell처럼 옆에서 작게 조언하고 돕는다는 의미를 함께 담는다.

Tink는 도구를 최대한 많이 쓰게 하는 시스템이 아니다. 현재 작업, 환경 제약, 사용 습관을 보고 가장 작은 유효 도구/하네스 묶음 (Tool/Harness Set)을 고르고, 없으면 좁은 하네스를 만들고, 반복 실수를 줄이며, 하네스 묶음을 계속 정리한다.

### Cast

작업의 첫 코를 잡는 Tink의 대표 명령 (코잡기, Cast on).

Cast는 단순한 하네스 생성 명령이 아니다. 작업, 환경 제약, 사용 습관을 바탕으로 하네스 선택 (Harness Selection), 하네스 만들기 (Harness Synthesis), 하네스 정리 (Harness Curation), 사용 습관 보정 (Habit Calibration) 중 필요한 판단을 하고 실행 상태 (Run State)를 만든 뒤 첫 안전 행동을 시작한다.


### Frog

거의 쓰지 않거나 겹치는 하네스를 제거 후보로 정리하는 Tink 명령 (풀시오, Frogging).

Frog는 하네스를 바로 삭제하지 않는다. 사용 신호와 중복 여부를 근거로 제거, 보관, 병합, weave 후보를 제안하고 승인 후에만 변경한다.

### Weave

실제 실패, 반복 사용, 사용자 피드백을 바탕으로 하네스를 다듬는 Tink 명령 (실오라기 정리, Weave in).

Weave는 새 기능을 크게 추가하기보다 기존 하네스의 질문, 단계, 검증, 실패 복구를 더 정확하게 만든다. 승인 전에는 저장하지 않는다.

### Harness (하네스)

특정 종류의 반복 작업을 위한 작은 재사용 절차.

하네스는 언제 쓰는지, 무엇을 먼저 물어볼지, 어떤 순서로 진행할지, 무엇을 검증해야 하는지, 실패하면 어디로 돌아갈지를 정의한다.

### Base Run (기본 절차)

하네스 없이 실행 상태 계약(`plan.md`, `checks.md`, `steps.json`, `contract.json`)만으로 진행하는 실행 방식.

일반적인 코드 변경·버그 수정·조사·리뷰·문서 작업의 기본값이다. 과거의 범용 하네스(code-change, bug-fix, research, review, docs)는 기본 세트에서 퇴역했고, 하네스는 특화 절차가 실제 결과를 바꿀 때만 선택한다. 사용자에게는 한국어 `기본 절차`, 영어 `base run`으로 표기한다.

### Harness Selection (하네스 선택)

기본 절차 위에 얹을 가장 작은 유효 하네스 묶음(0-3개)을 고르는 판단. 맞는 특화 하네스가 없으면 기본 절차만 선택하는 것이 정상이다.

### Harness Synthesis (하네스 만들기)

기존 하네스가 맞지 않을 때 조사, 실패, 사용자 피드백, 반복 작업에서 행동을 바꾸는 규칙 (behavior-shaping rules)을 추출해 새롭고 좁은 하네스를 만드는 판단.

### Harness Curation (하네스 정리)

도구나 하네스가 너무 많거나 무거울 때 현재 작업에 맞게 쓰기, 교체, 만들기, 개선, 제거 후보를 고르는 판단.

### Habit Calibration (사용 습관 보정)

명시적 작업 지시가 없어도 context 사용, token 사용, 입력 품질, 출력 길이, reset/compact 습관, 근거 선호 같은 관측 신호를 바탕으로 작은 운영 보정을 제안하는 판단.

### Inline Calibration (실행 중 보정)

`/tink:cast` 실행 안에서만 수행하는 사용 습관 보정.

실행 중 보정은 기본 사용 습관 보정 방식이다. Cast가 이미 호출된 상태에서 관측 신호를 바탕으로 한 가지 작은 보정을 제안한다.

### Hook Recommendation (자동 제안)

사용자가 optional hook을 명시적으로 켰을 때 일반 프롬프트 앞에서 제공하는 짧은 참고용 추천.

자동 제안은 하네스를 자동 적용하거나 memory를 자동 저장하지 않는다. 다른 slash skill을 가로채지 않으며, 반복 관측 신호가 있을 때만 한 줄 이하로 `/tink:cast` 또는 작은 보정을 추천한다.

### Run State (실행 상태)

현재 cast 실행을 위해 `.tink/current/` 아래에 남기는 임시 상태.

실행 상태는 이번 실행의 목표, 선택한 하네스, 검증 기준, 단계 상태, 메모, 사용자 답변을 담는다. 재사용 지식이나 장기 기억이 아니다.

### Stitch

`/tink:cast`가 `.tink/current/`를 확정하기 전에 한 번 수행하는 내부 품질 게이트 (뜨개질 은유: 다음 단계의 첫 코를 미리 잡아두는 Stitch).

뜨개질을 서둘러 시작했다가 줄이 통째로 엉켜 처음부터 풀어야 하는 일을 막기 위해, 첫 코를 걸기 직전 잠시 멈춰서 "지금 가려는 방향과 방법이 정말 안전한가?"를 다시 확인하고 첫 루프를 단단히 고정하는 뜨개질 동작에서 이름을 가져왔다.

Stitch는 별도 `/tink:grill` 명령이나 실제 subagent가 아니다. 매번 내부 평가를 하지만, 품질이나 안전에 큰 영향을 주는 갈림길이 있을 때만 사용자에게 보인다. 보일 때는 proposal, reason, choices 순서로 정확히 하나의 제안만 보여준다.

Soft gate는 `Approve`, `Add requirements`, `Continue as-is` 또는 `승인`, `요구사항 입력`, `이대로 진행`을 쓴다. Hard gate는 `Approve`, `Add requirements`, `Cancel` 또는 `승인`, `요구사항 입력`, `취소`를 쓰며 `Continue as-is`나 `이대로 진행`을 제공하지 않는다.

### Reusable State Save Gate

재사용 상태를 쓰기 전에 별도로 거치는 절대 hard approval gate.

현재 실행 승인만으로 `.tink/memory/*`, `.tink/harnesses/*`, `.tink/harnesses/index.json`, `.tink/config.json`, `.claude/`, 향후 설치에 영향을 주는 template/plugin 파일을 쓰면 안 된다. 저장 전에는 operation, destination files, exact entry text or patch summary, why reusable, sensitive/private content excluded, rollback or removal path를 보여주고 승인받는다. `Continue as-is`나 `이대로 진행`은 제공하지 않는다.

### Run-only Draft (임시 하네스 초안)

이번 실행에만 적용하는 좁은 하네스 초안.

임시 하네스 초안은 `.tink/current/plan.md` 또는 `notes.md`에만 기록되며, `.tink/harnesses/`나 `index.json`에 저장되지 않는다. 반복 근거가 생기고 사용자가 별도 승인하면 저장 후보가 될 수 있다.

### Soft Gate / Hard Gate (소프트/하드 게이트)

Stitch가 사용자에게 보일 때 제공하는 선택지 유형.

소프트 게이트는 `Approve`, `Add requirements`, `Continue as-is` (또는 `승인`, `요구사항 입력`, `이대로 진행`)를 제공하며, `이대로 진행`을 선택하면 명시적 가정과 함께 진행한다. 하드 게이트는 `Approve`, `Add requirements`, `Cancel` (또는 `승인`, `요구사항 입력`, `취소`)만 제공하며, 되돌리기 어렵거나 외부 영향이 있는 동작에 적용된다.

### Synthesis Probe (합성 탐침)

초기 하네스 선택을 평가하고 임시 초안 또는 harness-synthesis 로드 여부를 결정하는 짧은 5가지 질문.

사용자에게 보여줄 때는 "사전 진단" 또는 "하네스 사전 진단"으로 풀어 쓴다. 내부 코드와 명세는 영문 용어 `Synthesis Probe`를 유지한다(grep과 일관성 유지).

합성 탐침은 0-1 yes(기존 하네스 유지), 2-3 yes(임시 초안 추가), 4-5 yes(harness-synthesis 로드) 중 하나로 결론을 낸다. 넓은 기본 하네스가 반복 도메인 절차를 숨기는 것을 막기 위해 매번 실행한다.

### Context Budget Policy (컨텍스트 예산 정책)

작업 위험도와 컨텍스트 사용량을 기준으로 하네스 수를 결정하는 정책.

하네스 크기를 tiny, small, large로 분류하고, 메타 하네스는 하네스 묶음을 줄이거나 교체하는 데만 쓴다. 모든 작업에 적용하는 단일 상한선을 두지 않는다.

### Approval Payload (저장 승인 페이로드)

재사용 상태(하네스, 메모리, 설정)를 저장하기 전에 사용자에게 보여주는 구조화된 승인 요청.

operation, destination files, exact entry or patch summary, why reusable, sensitive content excluded, evidence handles, rollback path, approval ledger entry path를 포함한다. 현재 실행 승인과 별개로 요청해야 한다.

### Context Footprint (컨텍스트 사용량)

하네스나 문서가 Claude 작업 컨텍스트를 얼마나 차지하는지 나타내는 크기 감각.

컨텍스트 사용량은 사용자 프로필이나 프로젝트 배경이 아니라, 현재 실행에서 읽고 유지해야 하는 지침의 무게를 뜻한다.

### Work Context (작업 맥락)

현재 작업을 이해하는 데 필요한 목표, 배경, 제약, 입력, 성공 기준.

작업 맥락은 컨텍스트 사용량과 다르다. 작업 맥락은 무엇을 해야 하는지에 관한 의미이고, 컨텍스트 사용량은 그 의미를 다루는 데 드는 공간 비용이다.


### Run State Recovery (실행 상태 복구)

새 세션이나 context 손실 뒤에 `.tink/current/`를 읽어 이전 작업을 이어갈지, 보관할지, 새 작업으로 바꿀지 판단하는 절차.

실행 상태 복구는 `.tink/current/`를 곧바로 진실로 믿지 않는다. 사용자가 “이어서 해”라고 해도 먼저 목표, 마지막 안전 지점, 다음 단계, 열린 질문, 검증 상태를 5줄로 요약하고 사용자에게 이어가기, 보관하고 새 작업, 교체, 취소 중 하나를 선택하게 한다.

### Setup Review (설정 리뷰)

이미 `.tink/config.json`이 있을 때 `/tink:setup`이 현재 설정을 먼저 요약하고, 그대로 쓸지 특정 항목만 바꿀지 묻는 절차.

설정 리뷰는 git 추적 여부만 바로 묻지 않는다. 언어, 범위, 톤 정책, Hook, Git 추적 상태를 짧게 보여준 뒤 변경할 항목을 고르게 한다.

### Command Naming Policy (명령 이름 정책)

Claude Code가 실제로 인식하는 파일명 기반 slash command 이름을 우선하는 정책.

Tink는 `/tink:cast` 같은 colon namespace 표기를 쓰지 않는다. 설치 시 `.claude/commands/tink:cast.md`처럼 plugin namespace command을 만들고, 사용자는 `/tink:cast`를 실행한다.

### Tone Policy (톤 정책)

Tink의 응답 태도에 대한 고정 정책.

톤 정책은 사용자가 고르는 설정값이 아니다. Tink는 기본적으로 차분하고 명확하고 간결하게 답하며, 농담을 쓰지 않는다.

### Harness Size (하네스 크기)

하네스가 현재 작업 컨텍스트를 얼마나 차지하고 결정 부담을 얼마나 늘리는지 나타내는 분류.

하네스 크기는 파일 줄 수만 뜻하지 않는다. 읽어야 하는 규칙 수, 필요한 도구 수, 승인/검증 단계 수, 실패 복구 복잡도를 함께 본다.

### Meta Harness (메타 하네스)

작업 자체를 수행하기보다 어떤 하네스를 고르고, 만들고, 줄이고, 다듬을지 판단하는 하네스.

메타 하네스는 기본 작업 하네스 위에 계속 쌓는 장식이 아니다. 하네스 선택을 줄이거나 교체하기 위해 쓰며, 필요 없으면 한 줄 판단으로 끝낼 수 있다.

### CLI Select Policy (상호작용 정책)

Tink 명령이 사용자에게 선택지를 제시할 때 항상 `AskUserQuestion` 도구를 호출하는 정책.

텍스트 포맷(`❯` 형식)은 사용하지 않는다. `AskUserQuestion`은 실제 화살표 선택 UI를 렌더링하며, 최대 4개 옵션 제한이 있다. 5개 이상이 필요한 경우에는 먼저 옵션을 합쳐 4개 이하로 줄인다. 이 정책은 모든 Tink 명령 파일의 `## Interaction policy` 섹션에 명시되며, 하네스 파일이 특정 도구 호출을 지시하는 이유가 된다.
