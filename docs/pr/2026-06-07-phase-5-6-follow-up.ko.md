# Phase 5/6 후속 작업 PR 초안

## 문제

v1.2.x에서 Codex/Claude Code surface, context artifact, verify runner의 기반은 들어왔지만 기존 사용자가 `update` 후 무엇이 바뀌었는지 확인하기 어렵고, Context Graph Lite가 실제 run artifact에서 어떻게 읽혀야 하는지 충분히 드러나지 않았다.

또한 Codex에서 `$tink:cast`를 사용할 때 승인 요청이 눈에 띄지 않으면 사용자가 의도하지 않은 파일 수정이나 실행이 바로 시작되는 것처럼 느낄 수 있었다. 이 작업에서는 새 public `tink index` 명령을 만들지 않고, 기존 `/tink:cast`와 `$tink:cast` 흐름 안에서 context 선택 근거를 더 잘 남기는 방향을 택했다.

## 해결

- `tink-harness update` 출력에 `Update Result Summary`를 추가해 갱신된 파일, 보존된 사용자 수정 파일, 제거된 legacy Codex skill, 설치 위치, 다음 명령을 한 번에 확인할 수 있게 했다.
- 기존 사용자의 `.tink/config.json`은 `--force` 없이는 보존되도록 update 흐름을 보강했다.
- Codex `$tink:cast`가 non-trivial run에서 먼저 승인 요청을 보여야 한다는 규칙과 예시를 Codex core rules와 cast skill에 추가했다.
- Context Graph Lite를 repo signal fixture에 추가하고, changed path가 관련 command copy, Codex skill surface, installer/update docs, schema artifact를 고르는 과정을 테스트로 고정했다.
- `context-pack.md`, `context-map.json`, `excluded-context.md` fixture가 `context_graph_rule` 신호와 public graph indexing 제외 이유를 보여주도록 보강했다.
- Work State Guide, Update Troubleshooting, Update Verification Recipe, Repo Signals companion docs를 영어와 한국어로 정리했다.
- Release Evidence Pack 아이디어는 사용자나 팀의 릴리즈 판단 영역을 침범할 수 있어 현재 계획에서 제외했다.

## 검증

- `npm test`
  - 33개 테스트 통과
  - command 3-copy sync, Codex update smoke test, package contents, Context Graph Lite path cases, current-run artifact fixture 확인
- `git diff --check`
  - 실패 없음
  - Windows 줄끝 변환 경고만 출력됨
- `npm pack --dry-run --json`
  - 새 문서와 docs/pr 산출물이 패키지에 포함되는 것을 확인

## 참고

- npm publish와 버전 bump는 이번 PR 범위에서 제외했다.
- Sentry 연동은 사용자의 결정에 따라 포함하지 않았다.
- 새 `tink index` 명령, watcher, generated cache, hidden runtime index는 추가하지 않았다.
- 모든 변경은 Claude Code와 Codex, macOS와 Windows 동시 지원을 기준으로 검토했다.
