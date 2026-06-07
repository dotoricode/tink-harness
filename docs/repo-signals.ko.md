# Repo Signals

Repo signal은 `/tink:cast`와 `$tink:cast`가 관련 context와 검증 힌트를 고를 때 참고하는 작고 정적인 힌트다.

이것은 생성된 index가 아니고, cache가 아니며, 새 `tink index` command도 아니다. 현재 단계에서는 fixture로만 관리해서 동작을 리뷰하고 테스트할 수 있게 둔다.

Repo signal은 `docs/compatibility-policy.md`의 기본 원칙을 따른다. 새 동작은 Claude Code와 Codex를 모두 고려해야 하며, macOS와 Windows에서 모두 동작해야 한다.

## 목적

Repo signal은 네 가지 질문에 답한다.

1. 어떤 파일이 보통 같이 움직이는가?
2. 어떤 check가 그 파일들이 일관되게 유지됐음을 증명하는가?
3. 현재 signal set이 모르는 changed path는 무엇인가?
4. cast가 먼저 확인해야 할 작은 related context set은 무엇인가?

이 덕분에 Tink는 왜 어떤 파일을 `context-map.json`에 포함했는지, 왜 어떤 검증 check를 `contract.json`에 넣었는지, 언제 check를 지어내지 말아야 하는지 설명할 수 있다.

## Context Graph Lite

Phase 6에서는 static fixture에 `context_graph_lite`를 추가한다. 이것은 changed path를 작은 related context 후보로 연결하는 cast 내부 규칙이다.

중요한 경계:

- 새 command가 아니다.
- watch process가 아니다.
- generated cache가 아니다.
- runtime indexer가 아니다.
- `tink index`를 만들거나 요구하지 않는다.

각 rule은 다음 필드를 가진다.

- `when_paths`: rule을 활성화하는 changed path pattern.
- `include_paths`: cast가 먼저 고려할 관련 파일.
- `signal_refs`: 선택 이유를 설명하는 sync group, verification command, verification hint.
- `reason`: 사람이 읽는 근거.
- `confidence`: 선택 신뢰도.

Context Graph Lite는 넓은 파일 목록보다 작고 신뢰도 높은 context pack을 우선한다. 어떤 rule도 맞지 않으면 관계를 지어내지 않고 `unmatched_path` signal을 남긴다.

## 현재 Fixture

- `tests/fixtures/repo-signals/tink-harness.json`: sync group, instruction file, schema file, command surface, verification hint, Context Graph Lite rule.
- `tests/fixtures/repo-signals/path-cases.json`: changed path가 어떤 verification hint와 context graph rule을 선택해야 하는지 보여주는 예시.
- `tests/fixtures/current-run/context-map.json`: repo signal source를 인용하는 context signal 예시.
- `tests/fixtures/current-run/contract.json`: 선택된 verification hint가 manual check로 기록된 예시.

## 흐름

의도한 cast 흐름은 다음과 같다.

```text
changed path
-> matching context_graph_lite rules
-> small related context set
-> matching repo signal verification_hints
-> contract.verification.manual_checks[]
-> context-map.json signals
```

예:

```text
commands/cast.md
-> context_graph_lite.rules.claude-command-sync
-> matching command copies and tests/test_templates.py
-> verification_hints.command-template-sync
-> manual check: test_dual_format_paths_stay_in_sync
-> context-map signal: verification_hint
```

contract는 무엇을 검증해야 하는지 기록한다. context map은 왜 그 context와 check가 선택됐는지 기록한다.

## Unmatched Paths

changed path가 어떤 verification hint나 graph rule에도 맞지 않으면 Tink는 check를 지어내지 않는다.

대신 `context-map.json`에 `unmatched_path` signal을 남긴다.

예:

```text
docs/memory.md
-> no matching verification hint
-> no manual check added
-> context-map signal: unmatched_path
```

이렇게 하면 모르는 context도 보이지만, 가짜 확신을 만들지는 않는다.

## 경계

Repo signal fixture는 advisory input이다.

절대 하면 안 되는 일:

- command 실행
- tool 설치
- 파일 쓰기
- 새 command surface 생성
- runtime indexer처럼 행동

나중에 runtime 지원을 추가하더라도 같은 contract를 유지해야 한다. signal은 context와 verification 선택을 설명하고, 실제 check는 기존 verification flow를 통해 실행된다.
