# Graph rule seed rules 구현

## 문제

Graph 규칙 적용 계획은 문서화됐지만, 실제 설치 템플릿의 `.tink/rules/index.json`에는 README 동기화, version metadata 동기화, command 3-copy sync, installer smoke 같은 안전 규칙이 아직 들어가 있지 않았음.

또한 `cast`, `weave`, `frog`가 새 rule 필드와 rule 품질 점검을 어떻게 다뤄야 하는지 지침이 충분히 구체적이지 않았음.

## 해결

- `templates/tink/rules/index.json`에 `node_shape`와 안전 seed rule을 추가했음.
- `$tink:cast` / `/tink:cast`가 `select_harnesses`, `include_paths`, `checks`, `reason`, `risk`를 기록 대상으로 다루도록 보강했음.
- `$tink:weave` / `/tink:weave`에 reusable rule graph update structural gate를 추가했음.
- `$tink:frog` / `/tink:frog`가 rule quality를 `keep`, `rewrite`, `split`, `merge`, `needs evidence`로 점검하도록 보강했음.
- Claude Code와 Codex surface가 같은 방향을 보도록 root command, Claude template command, repo-local command, Claude skill, Codex core rule을 함께 갱신했음.

## 검증

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`

## 참고

- public `tink index` 명령, watcher, generated cache, Neo4j/FastAPI/vector DB는 추가하지 않았음.
- Sentry와 release evidence bundling은 포함하지 않았음.
- 이 변경은 설치 템플릿과 명령 지침이 바뀌므로 배포가 필요함.
