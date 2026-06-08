# Graph 규칙 적용 계획

이 문서는 Writ의 graph 기반 context 선택 아이디어를 Tink에 맞게 가볍게 적용하는 계획이다.

목표는 Neo4j, FastAPI, vector DB, watcher, generated cache를 도입하는 것이 아니다. Tink의 장점인 작은 파일 기반 구조를 유지하면서, 작업에 맞는 하네스와 검증을 더 안정적으로 고르는 작은 규칙 지도를 만드는 것이다.

## 왜 필요한가

Tink는 현재 작업을 보고 `research`, `docs`, `code-change`, `ship` 같은 하네스를 고른다. 이 선택이 맞으면 context가 작고 검증도 선명하다. 하지만 작업이 애매하면 다음 문제가 생길 수 있다.

- 릴리스 작업인데 `docs`만 골라서 `npm pack`이나 changelog 확인을 놓친다.
- 작은 문서 수정인데 `ship`까지 골라 작업이 과해진다.
- README를 고치면서 한국어 companion 문서를 빼먹는다.
- version bump를 하면서 `.claude-plugin/plugin.json`을 놓친다.

Graph 규칙은 이런 실수를 줄이기 위한 작은 연결 규칙이다.

```text
작업 사실
  -> 필요한 하네스
  -> 같이 봐야 하는 파일
  -> 반드시 확인할 검증
  -> 적용 이유
```

## 원칙

1. **파일 기반으로 유지한다.**
   `.tink/rules/index.json` 같은 작은 JSON을 사용한다.

2. **사람 승인 없이 규칙을 저장하지 않는다.**
   AI는 후보를 제안하고, 사람은 승인한다.

3. **항상 필요한 규칙과 필요할 때만 가져오는 규칙을 나눈다.**
   예: 비밀키 노출 금지는 항상 중요하지만, npm publish 검증은 release 작업에서만 필요하다.

4. **규칙은 작고 구체적이어야 한다.**
   “문서를 잘 확인한다”보다 “README.md를 수정하면 README.ko.md도 확인한다”가 좋다.

5. **왜 선택됐는지 run artifact에 남긴다.**
   선택된 규칙은 `.tink/current/session.json`, `context-map.json`, `verification.json`에서 추적 가능해야 한다.

## 좋은 규칙의 모양

좋은 규칙은 네 가지를 가진다.

- 언제 적용되는가
- 무엇을 context로 가져오는가
- 무엇을 검증하는가
- 왜 필요한가

예시:

```json
{
  "id": "readme-bilingual-sync",
  "when": {
    "changed_paths": ["README.md"]
  },
  "include_paths": ["README.ko.md"],
  "checks": ["README language pair stays aligned"],
  "reason": "README has a Korean companion document."
}
```

## 작업 단위

### 1. 규칙 schema 정리

`templates/tink/rules/index.json`의 노드 형식을 더 명확히 한다.

추가하면 좋은 필드:

- `when`: 적용 조건
- `select_harnesses`: 선택할 하네스
- `include_paths`: 같이 볼 파일
- `checks`: 추가할 검증
- `reason`: 선택 이유
- `load`: `mandatory` 또는 `retrievable`
- `risk`: 잘못 적용됐을 때의 위험

완료 기준:

- Claude Code와 Codex 둘 다 같은 JSON을 읽을 수 있다.
- macOS와 Windows 테스트에서 통과한다.
- public `tink index` 명령, watcher, generated cache를 만들지 않는다.

### 2. 첫 번째 안전 규칙 세트 추가

처음에는 자주 실수할 수 있고 근거가 뚜렷한 규칙만 넣는다.

후보:

- `README.md` 변경 시 `README.ko.md` 확인
- `package.json` version 변경 시 `package-lock.json`, `.claude-plugin/plugin.json`, `CHANGELOG.md`, `VERSIONING.md` 확인
- `commands/*.md` 변경 시 3-copy sync 확인
- `bin/install.js` 변경 시 install/update smoke 경로 확인
- release/publish 작업 시 `npm test`, `git diff --check`, `npm pack --dry-run --json` 확인
- Codex-only update 작업 시 repo-local `.claude/commands/tink/*.md`와 `.claude/skills/tink/SKILL.md` 정리 여부 확인

완료 기준:

- 각 규칙은 적용 조건과 검증 이유를 가진다.
- 너무 넓은 규칙은 넣지 않는다.
- 테스트 fixture로 선택 결과를 확인한다.

### 3. `$tink:cast` 선택 기록 강화

`$tink:cast`가 규칙을 적용했을 때 다음을 남긴다.

- 어떤 rule id가 적용됐는지
- 어떤 하네스가 선택됐는지
- 어떤 파일이 context 후보가 됐는지
- 어떤 검증이 추가됐는지
- 어떤 후보를 제외했는지

기록 위치:

- `.tink/current/session.json`
- `.tink/current/context-map.json`
- `.tink/current/excluded-context.md`

완료 기준:

- 사람이 “왜 이 파일을 봤는지” 다시 추리하지 않아도 된다.
- 불필요 context와 제외 context가 분리된다.

### 4. reusable 규칙 제안 gate 추가

`$tink:weave`가 새 rule을 저장하기 전에 다음을 확인한다.

- 기존 규칙과 중복되는가
- 너무 넓은가
- 실제 evidence가 있는가
- 검증 가능한가
- Claude Code와 Codex 모두에서 의미가 있는가
- macOS와 Windows에 묶인 명령은 아닌가

완료 기준:

- AI는 rule 후보를 제안할 수 있다.
- 저장은 별도 승인 후에만 가능하다.
- 거절된 후보는 반복 제안을 줄이기 위해 이유를 남길 수 있다.

### 5. frog/weave 점검 루프 연결

`$tink:frog`와 `$tink:weave`가 규칙 품질도 점검하게 한다.

점검 대상:

- 자주 적용됐지만 검증 도움이 없던 규칙
- 자주 제외된 규칙
- 너무 많은 context를 끌고 오는 규칙
- 실패를 반복해서 놓친 규칙

완료 기준:

- 삭제보다 먼저 `keep`, `rewrite`, `split`, `merge`, `needs evidence`로 분류한다.
- 강한 근거 없이 규칙을 삭제하지 않는다.

## 나쁜 시나리오와 방어

| 나쁜 시나리오 | 결과 | 방어 |
| --- | --- | --- |
| 너무 넓은 규칙 | context가 커짐 | `risk`, `cost`, `reason` 필수화 |
| 필요한 규칙 누락 | 검증 빠짐 | 자주 실패한 check를 weave 후보로 기록 |
| docs 작업에 release 규칙 적용 | 작업이 과해짐 | `when` 조건을 path와 task_type으로 좁힘 |
| AI가 rule을 자동 저장 | 사용자의 작업 방식 침범 | reusable save 별도 승인 유지 |
| OS 전용 명령이 rule에 고정 | Windows/macOS 한쪽 실패 | portable command 또는 플랫폼별 대안 요구 |

## 권장 순서

1. `templates/tink/rules/index.json` schema를 정리한다.
2. README, version, command sync, release 같은 안전 규칙 5-6개만 넣는다.
3. fixture 테스트로 규칙 선택 결과를 확인한다.
4. `$tink:cast`가 적용 rule id를 current artifact에 남기게 한다.
5. `$tink:weave`에 reusable rule proposal gate를 붙인다.
6. 충분한 run 기록이 쌓인 뒤 `$tink:frog`에서 rule 정리 후보를 제안한다.

## 지금 당장 만들지 않을 것

- public `tink index` 명령
- runtime watcher
- generated graph cache
- Neo4j, FastAPI, vector DB
- Sentry integration
- release evidence bundling
- 사용자 승인 없는 rule 자동 저장

## 첫 PR 제안

첫 PR은 “Graph Rule Schema and Seed Rules”가 좋다.

범위:

- `templates/tink/rules/index.json`에 필드 의미를 명확히 반영한다.
- README/version/command sync/release 관련 seed rule을 추가한다.
- fixture와 테스트를 추가해 선택 결과를 확인한다.
- 문서에 “이것은 public index가 아니라 작은 rule graph”라고 명시한다.

완료 확인:

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`
- Claude Code와 Codex 설명 문구가 같은 방향을 가리키는지 수동 확인
