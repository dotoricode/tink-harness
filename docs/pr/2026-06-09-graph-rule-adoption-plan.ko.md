# Graph 규칙 적용 계획

## 문제

Writ의 graph 기반 context 선택 아이디어를 Tink에 적용할 수 있을지 검토했음. 다만 Writ의 Neo4j, FastAPI, vector DB, watcher 같은 구조를 그대로 가져오면 Tink의 장점인 가벼운 파일 기반 흐름이 무거워질 수 있었음.

또한 하네스를 잘못 고르면 릴리스 검증 누락, 과한 절차, companion 문서 누락, version metadata drift 같은 문제가 생길 수 있으므로, 작은 graph 규칙이 어떤 방식으로 안전하게 도움을 줄 수 있는지 먼저 계획으로 정리할 필요가 있었음.

## 해결

- `docs/graph-rule-adoption-plan.ko.md`를 추가해 Tink식 graph 규칙 적용 방향을 정리했음.
- public `tink index`, watcher, generated cache, Neo4j/FastAPI/vector DB를 만들지 않는다는 경계를 명확히 했음.
- `when`, `include_paths`, `checks`, `reason`, `load`, `risk` 중심의 작은 JSON rule graph 방향을 제안했음.
- README와 한국어 README에서 새 계획 문서로 연결되도록 링크를 추가했음.

## 검증

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`

## 참고

- 구현은 포함하지 않았음.
- publish와 release는 포함하지 않았음.
- 새 하네스는 만들지 않았음. 기존 `research`, `docs`, `harness-curation` 관점으로 충분하다고 판단했음.
