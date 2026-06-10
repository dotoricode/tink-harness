# Advanced options 설명과 직접 CLI 계획 정리

## 문제

Interactive install/update에 `--dry-run`, `--force`, `--clean-codex-picker`가 선택지로 들어갔지만, 사용자가 실제로 보는 설명은 아직 짧은 label 중심이었다.

그 결과 각 옵션이 "언제 쓰는지", "무엇을 건드리는지", "주의할 점이 무엇인지"를 README나 help에서 바로 이해하기 어려웠다. 또한 사용자는 매번 `npx tink-harness@latest ...`를 입력하는 대신 `tink-harness ...`처럼 짧게 입력할 수 있는 경로를 원했다.

## 해결

- installer help의 usage를 `tink-harness ...` 직접 명령 중심으로 정리하고, 아직 설치 전이면 `npx tink-harness@latest ...`를 bootstrap 경로로 쓰도록 안내했다.
- Advanced options help에 세 옵션의 의미를 쉬운 문장으로 풀어썼다.
- README와 README.ko에 Advanced options 섹션을 추가해 각 옵션의 사용 시점과 위험을 설명했다.
- planned-work 문서에 직접 CLI command shim 검증과 `tink-harness dashboard` 명령 계획을 추가했다.
- 새 visible-thinking 하네스 4개가 더 자주 선택되도록 `cast` 선택 규칙과 rule graph seed를 넓혔다. 모호한 범위, 누락된 acceptance criteria, API/schema/contract 변경, multi-step run, 독립 검증·인수인계 같은 신호를 더 잘 잡도록 했다.
- `requirements-interview`, `plan-consensus`, `goal-checkpoint`, `delegation-brief`를 단독 명령이 아니라 기존 작업 하네스에 얹을 수 있는 작은 overlay 후보로 명시했다.
- Graphify식 knowledge graph 화면을 참고해 하네스 health report를 왼쪽 navigation, 중앙 graph canvas, 오른쪽 insight rail 구조의 정적 대시보드로 바꿨다.
- 실제 graph 관계가 적을 때도 하네스 사용량, evidence, candidate score factor를 작은 위성 노드로 보여줘 지도 형태를 더 읽기 쉽게 했다.
- 오른쪽 insight rail에 Cast routing rules 카드를 추가해 새 visible-thinking 하네스가 어떤 상황에서 붙는지 바로 볼 수 있게 했다.
- setup에서 선택한 언어에 맞춰 dashboard 설명, 버튼, 패널 제목은 한국어로 표시하고, 하네스 ID·명령어·graph relation type 같은 안정 식별자는 영어로 유지했다.
- `Full/Core/Pause` 컨트롤, recommendation 필터 카드, 하네스 카드 선택, 중요 하네스/routing rule 클릭, 노드 선택 강조를 실제 동작으로 연결했다.

## 검증

- `npm test`
- `git diff --check`
- 인앱 브라우저에서 dashboard 로드 후 `전체/핵심/정지`, recommendation 필터, 하네스 카드, graph node 선택 동작과 콘솔 error/warn 0건을 확인했다.

## 참고

- 이번 PR은 문구와 계획 정리까지 다룬다.
- `dashboard` 명령 실제 구현, npm publish, GitHub Release 생성은 포함하지 않는다.
