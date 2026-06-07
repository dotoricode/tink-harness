# Context Metrics Artifact

## 문제

Context Metrics Evaluator가 fixture 기준으로 여섯 지표를 계산할 수 있게 되었지만, 실제 `/tink:cast`와 `$tink:cast` run state에는 아직 `context-metrics-evaluation.json`이 공식 산출물로 연결되어 있지 않았다. 이 상태에서는 90% 목표를 current run마다 반복 검증하기 어렵다.

## 해결

- `templates/tink/schemas/context-metrics-evaluation.schema.json`을 추가했다.
- `/tink:cast`와 `$tink:cast` 지침에 `.tink/current/context-metrics-evaluation.json` 생성 규칙을 추가했다.
- Work State Guide에 metrics evaluation 읽기 순서를 추가했다.
- Context Metrics Evaluator 문서를 run-state artifact 기준으로 갱신했다.
- `v1.4.0` 릴리즈 메타데이터, README, CHANGELOG, VERSIONING을 갱신했다.

## 검증

- `npm test`
- `git diff --check`
- `claude plugin validate .claude-plugin/plugin.json`
- `claude plugin validate .claude-plugin/marketplace.json`
- `npm pack --dry-run --json`

## 참고

- 새 public command는 추가하지 않았다.
- `tink index` 명령, watcher, generated cache, hidden runtime index를 만들지 않았다.
- Sentry는 포함하지 않았다.
- release evidence bundling은 포함하지 않았다.
- 점수의 scope와 limit를 명시해야 하며, run-history나 telemetry 없이 production-wide 90%를 주장하지 않는다.
- Claude Code와 Codex, macOS와 Windows 동시 지원을 기준으로 작성했다.
