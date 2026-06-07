# 검증 증거 세분화

검증은 단순히 통과 여부만 말하는 것이 아니라 어떤 종류의 증거가 있는지도 설명해야 한다.

`templates/tink/schemas/verification.schema.json`의 다음 필드를 사용한다.

- `evidence_kind`: command, manual, diff, coverage, security, external, package, unknown.
- `evidence_ref`: `npm test`, `docs/work-state.md`, `source_ref`, PR check URL 같은 짧은 포인터.
- `observed`: 증거에서 확인한 내용을 짧게 쓴 문장.
- `next_action`: 필수 check가 실패하거나 막혔을 때 가장 작은 복구 행동.

raw log나 full diff를 붙여 넣지 않는다. 자세한 근거가 필요하면 파일, check 이름, source ref, 외부 handle을 인용한다.

이 흐름은 Claude Code `/tink:verify`와 Codex `$tink:verify`에서 같아야 하며, 검증 명령은 macOS와 Windows 모두에서 실행 가능해야 한다.
