# Context Budget Ledger

## 문제

Tink는 `context-map.json`과 `excluded-context.md`로 어떤 context를 사용했는지 설명할 수 있었지만, 컨텍스트 엔지니어링 효율을 90% 목표까지 반복 개선하려면 더 정량적인 근거가 필요했다.

특히 다음 항목은 기존 필드만으로는 자동 점검하기 어려웠다.

- 포함한 context가 핵심인지, 보조인지, 검증 대상인지.
- 처음 context pack에 넣기에는 비용이 높은지.
- 다음 비슷한 작업에서 재사용해야 하는지, 피해야 하는지.
- 선택한 context가 어떤 검증 check와 연결되는지.
- 오래됐거나 stale한 context를 얼마나 빨리 제외할 수 있는지.

## 해결

- `context-map.schema.json`에 `role`, `cost`, `reuse_signal`, `verification_link`, `staleness`, `evidence_kind` 필드를 optional로 추가했다.
- `context-map.json.efficiency_metrics` 예시를 추가해 여섯 효율 지표를 0-100%와 근거로 기록할 수 있게 했다.
- current-run fixture와 context-diff fixture에 역할, 비용, 재사용 신호, 검증 연결, metric impact 예시를 추가했다.
- repo signal fixture에 `context_budget_policy`를 추가해 Context Graph Lite가 선택한 후보를 어떻게 점수화할지 설명했다.
- `/tink:cast`와 `$tink:cast` 지침에 Context Budget Ledger 필드를 기록하는 규칙을 추가했다.
- 한국어 우선 문서 `docs/context-budget-ledger.ko.md`와 영어 companion `docs/context-budget-ledger.md`를 추가하고 README에는 링크만 추가했다.
- 컨텍스트 동작 원리와 정량적 개선 추정치를 설명하는 `docs/context-engineering-efficiency.ko.html`을 repo 문서로 보존했다.

## 검증

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`

## 참고

- 새 public command는 추가하지 않았다. 특히 `tink index` 명령, watcher, generated cache, hidden runtime index를 만들지 않았다.
- Sentry는 포함하지 않았다.
- release evidence bundling은 포함하지 않았다.
- 새 필드는 optional이므로 기존 `context-map.json`을 바로 깨뜨리지 않는다.
- 실제 telemetry가 없으면 `measurement_status: "estimated"`로 남기고, 근거 없이 90% 달성으로 표시하지 않는다.
- Claude Code와 Codex, macOS와 Windows 동시 지원을 기준으로 작성했다.
