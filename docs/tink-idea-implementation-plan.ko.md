# Tink 아이디어 구현 점검과 다음 계획

이 문서는 지금까지 논의한 Tink 확장 아이디어가 v1.2.x 기준으로 어디까지 구현되었는지 점검하고, 다음에 어떤 순서로 확장하면 좋은지 정리한다.

핵심 방향은 그대로 유지한다. Tink는 자체 거대 런타임이 아니라 Claude Code와 Codex 위에 얹는 경량 하네스 계층이다. 목표는 더 많은 명령을 만드는 것이 아니라, 작업 전 context 설계, 작업 계약, 검증 가능한 완료, 반복 개선을 더 안정적으로 만드는 것이다.

## 요약

v1.2.0에서 가장 크게 들어간 것은 Codex 지원, context artifact, Repo Signal, Verify Runner, MCP Safe Profile의 기반이다. 즉, Tink가 단순한 명령 묶음에서 "작업 상태와 검증 계약을 남기는 하네스 레이어"로 이동하기 시작했다.

다만 첨부 아이디어에서 말한 완전한 graph 기반 context compiler, 실제 MCP gateway, productivity dashboard, harness registry, subagent adapter는 아직 구현되지 않았다. 지금 단계에서는 이들을 한 번에 크게 만들기보다, 현재 surface를 유지한 채 내부 artifact와 검증 품질을 조금씩 강화하는 편이 맞다.

중요한 제약도 명확하다.

- Claude Code와 Codex를 모두 지원한다.
- macOS와 Windows를 모두 지원한다.
- 새 public `tink index` command는 만들지 않는다.
- Sentry 연동은 현재 계획에서 제외한다.
- 문서는 한국어로도 제공한다.
- 사용자 수정 파일, local memory, local harness는 update 과정에서 보존한다.

## 구현 상태 매트릭스

| 아이디어 | 현재 상태 | 구현된 부분 | 아직 필요한 부분 |
| --- | --- | --- | --- |
| Codex/Claude Code 동시 지원 | 상당 부분 구현 | Codex action skills, Claude Code commands, installer surface 선택, focused Codex picker, compatibility policy | update 결과 요약, 기존 설치 진단, 양쪽 surface를 함께 검증하는 recipe 강화 |
| Contract-first execution | 구현 기반 있음 | `.tink/current/contract.json`, verification command/manual check schema, success/risk/evidence 구조 | 실제 작업 중 contract 변경 이력, diff evidence 연결, blocked 복구 흐름 강화 |
| Context Pack / Context Map | 부분 구현 | `context-pack.md`, `context-map.json`, `excluded-context.md`, external context profile, repo signal fixture | 실제 dependency graph 분석, changed path 기반 context 선택 고도화, 왜 제외했는지의 품질 개선 |
| Repo Signals | 부분 구현 | fixture 기반 instruction files, schema files, verification hints, sync groups | 내부 Context Graph Lite로 확장, 테스트/문서/명령 연결 자동 추론, confidence 점수 개선 |
| Verify Runner | 부분 구현 | `verification.json`, pass/fail/blocked/skipped, final report, notes summary, maintenance signals | command 실행 증거 요약, diff/coverage/security/manual evidence 연결, 재실행 recipe 자동화 |
| MCP Safe Profile | 문서와 schema 기반 있음 | 외부 context 안전 체크리스트, sensitivity/confidence/source_ref, Figma/GitHub/docs 예시 | 실제 `.tink/mcp-policy.json`, allowlist, read-only 기본값, secret redaction, prompt injection scanner |
| Hook 기반 safety | 일부 구현 | advisory-only `UserPromptSubmit` hook 추천 | PreToolUse/PostToolUse/Stop/PreCompact에 대응하는 안전 profile 설계, 승인된 경우에만 guard화 |
| Productivity dashboard | 미구현 | ledger/friction/weave queue로 원천 신호는 있음 | token/context cost, 실패 유형, 검증 누락, update 이슈를 사람이 읽기 쉬운 요약으로 변환 |
| Harness 자동 개선과 삭제 | 부분 구현 | `/tink:weave`, `/tink:frog`, evidence grade, maintenance ledger | 사용 빈도와 실패 신호 기반 scoring, 삭제/병합 후보 설명 품질, 승인 전 preview |
| Harness registry/signing/lockfile | 미구현 | plugin/package release 흐름은 있음 | `.tink/lock.json`, registry metadata, source trust, version pinning |
| Subagent adapter | 미구현 | multi-agent 자체 런타임을 만들지 않는 방향만 정해짐 | Claude/Codex의 기존 subagent 기능에 맞춘 얇은 adapter contract |
| Memory knowledge layers | 부분 구현 | `.tink/memory/`, reusable save gate | `approved/`, `candidate/`, `rejected/`, `evidence/` 계층화와 승인 이력 |

## 다음 구현 원칙

### 1. 새 명령보다 기존 흐름 강화

첨부 아이디어에는 `tink index` 같은 graph 명령이 있었지만, 이 프로젝트에서는 새 public command를 만들지 않는다. 대신 `$tink:cast`와 `/tink:cast` 내부에서 context selection 품질을 높인다.

이름은 "Context Graph Lite" 정도로 문서화하되, 사용자는 새 명령을 외우지 않아도 된다.

### 2. artifact를 먼저 안정화

큰 기능을 바로 자동화하기 전에 다음 파일들의 의미를 더 안정적으로 만든다.

- `.tink/current/context-pack.md`
- `.tink/current/context-map.json`
- `.tink/current/excluded-context.md`
- `.tink/current/contract.json`
- `.tink/current/verification.json`
- `.tink/maintenance/ledger.jsonl`
- `.tink/maintenance/friction.jsonl`

Tink의 장점은 "AI가 알아서 했다"가 아니라 "왜 이 context와 검증을 선택했는지 확인할 수 있다"에 있다.

### 3. 모든 확장은 양쪽 surface와 양쪽 OS를 기준으로 설계

새 기능은 Claude Code command와 Codex skill에서 같은 개념으로 설명되어야 한다. 또한 shell 예시, path, installer/update 동작은 macOS와 Windows 모두에서 자연스럽게 동작해야 한다.

## 제안 로드맵

### Phase 5: Update Confidence

기존 사용자가 v1.2.x로 업데이트할 때 무엇이 바뀌고 무엇이 보존되는지 확신할 수 있게 만든다.

생기는 기능:

- update 후 설치된 surface 요약
- refresh된 command/skill 목록
- 제거된 legacy Codex `skills/tink/SKILL.md` 표시
- 보존된 user-modified files 표시
- 다음에 실행할 검증 command 안내

개선 효과:

- 기존 사용자가 update 후 Codex picker나 Claude command 상태를 덜 헷갈린다.
- update가 local harness, memory, config를 건드렸는지 확인하기 쉬워진다.
- 이후 큰 기능을 넣기 전에 업데이트 안정성을 먼저 확보한다.

### Phase 6: Context Graph Lite

새 public command 없이 `$tink:cast`와 `/tink:cast`가 내부적으로 더 나은 context 후보를 고르게 만든다.

생기는 기능:

- changed paths를 기준으로 관련 tests, schemas, docs, command copies를 더 잘 찾는다.
- sync group이나 verification hint가 왜 선택됐는지 `context-map.json.signals[]`에 더 구체적으로 남긴다.
- 제외한 파일은 `excluded-context.md`에 "왜 제외했는지"를 짧게 남긴다.

개선 효과:

- context pack이 더 작고 정확해진다.
- Codex와 Claude Code 모두 같은 판단 근거를 공유한다.
- `tink index` 같은 별도 명령 없이도 graph 느낌의 도움을 받을 수 있다.

### Phase 7: Evidence Runner Plus

검증 결과를 더 행동 가능한 증거로 만든다.

생기는 기능:

- command evidence, manual evidence, diff evidence를 구분한다.
- 실패한 check마다 `next_action`을 더 명확히 기록한다.
- blocked 상태일 때 마지막 안전 지점과 재개 방법을 더 잘 남긴다.

개선 효과:

- 검증 실패가 단순한 "실패"가 아니라 다음 행동으로 이어진다.
- PR/release history에 들어갈 검증 근거가 더 깔끔해진다.
- weave가 반복 실패를 더 정확하게 개선 후보로 받을 수 있다.

### Phase 8: MCP Gateway Policy

외부 context를 가져올 때의 안전 기준을 실제 정책 파일로 만든다. Sentry는 현재 제외하고, Figma, GitHub, official docs, dashboard, attachment 같은 일반 source를 우선한다.

생기는 기능:

- `.tink/mcp-policy.schema.json`
- optional `.tink/mcp-policy.json`
- source allowlist
- read-only 기본값
- secret/sensitive context redaction 규칙
- prompt injection 의심 문구를 evidence에 남기는 규칙

개선 효과:

- 외부 context를 더 많이 쓰더라도 안전 기준이 흐려지지 않는다.
- "가져온 정보"와 "신뢰해도 되는 정보"를 분리할 수 있다.
- 회사/개인 프로젝트에서 source별 정책을 조정하기 쉬워진다.

### Phase 9: Harness Lifecycle Metrics

하네스가 실제로 도움이 되는지, 오래되어 정리해야 하는지 판단할 수 있게 만든다.

생기는 기능:

- harness별 사용 신호 요약
- 반복 실패와 반복 성공 신호
- context-cost 증가 신호
- frog/weave 후보 목록
- 삭제, 병합, 유지 추천 이유

개선 효과:

- Tink가 하네스를 무작정 늘리지 않는다.
- 실제 도움이 된 하네스와 헷갈리게 만드는 하네스를 구분한다.
- `/tink:frog`가 더 설득력 있는 정리 제안을 할 수 있다.

### Phase 10: Memory Knowledge Layers

메모리를 "승인된 지식"과 "후보"로 분리한다.

생기는 기능:

- `.tink/memory/approved/`
- `.tink/memory/candidate/`
- `.tink/memory/rejected/`
- `.tink/memory/evidence/`

개선 효과:

- 한 번 나온 말이 곧바로 영구 규칙이 되는 위험을 줄인다.
- 사용자 승인 전에는 candidate로만 남긴다.
- 왜 어떤 기억이 저장되었는지 evidence를 추적할 수 있다.

## 더 추가하면 좋은 아이디어

### Context Diff Review

작업 시작 전후로 context-map이 어떻게 달라졌는지 비교한다. 예를 들어 처음에는 빠졌지만 작업 중 필요해진 파일, 처음에는 포함했지만 실제로는 쓰지 않은 파일을 기록한다.

이 기능은 Context Graph Lite와 Harness Lifecycle Metrics 사이를 이어준다.

### Update Doctor

`update` 결과가 이상할 때 사람이 바로 확인할 수 있는 체크리스트를 제공한다. 새 명령을 만들기보다 `$tink:update`와 `/tink:update` 문서 안에 "진단 모드" 절차로 넣는다.

## 제외한 아이디어

### Release Evidence Pack

release나 PR 작업이 끝났을 때 `contract.json`, `verification.json`, changelog, npm pack 결과, GitHub release 상태를 하나의 요약으로 묶는 아이디어는 현재 계획에서 제외한다.

이 기능은 릴리즈 판단, 공개 기록, 포트폴리오성 서술까지 Tink가 지나치게 많이 제안하게 만들 수 있다. 그 영역은 사용자나 팀이 직접 결정해야 하므로, Tink는 필요한 검증 artifact를 남기는 선에서 멈춘다.

## 바로 다음 Slice 추천

다음 slice는 Phase 5의 "Update Result Summary"가 가장 좋다.

이유:

- 이미 update smoke test가 있으므로 실패를 잡을 안전망이 있다.
- 기존 사용자에게 바로 체감되는 개선이다.
- 이후 Context Graph Lite나 MCP Gateway처럼 더 큰 기능을 넣기 전에 update 신뢰도를 확보할 수 있다.

그 다음에는 Phase 6 "Context Graph Lite"로 넘어가는 흐름을 추천한다. 이때도 새 `tink index` command는 만들지 않고, cast의 내부 context selection과 artifact 품질을 개선하는 방향으로 진행한다.
