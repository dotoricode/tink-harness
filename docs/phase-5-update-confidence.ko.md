# Phase 5: 업데이트 신뢰도

Phase 5의 목표는 기존 사용자가 Tink를 업데이트할 때 안전하고, 이해 가능하고, 되돌릴 수 있다고 느끼게 만드는 것입니다.

이 phase는 새 command surface를 추가하는 작업이 아닙니다. 기존 `install`, `update`, `$tink:update`, `/tink:update`, 문서, 검증 흐름을 더 신뢰할 수 있게 만드는 작업입니다.

영어판은 `docs/phase-5-update-confidence.md`에 있습니다.

## 왜 필요한가

v1.2.0은 focused Codex skills, context artifacts, Repo Signals, Verify Runner evidence, MCP Safe Profile guidance를 추가했습니다. 하지만 기존 사용자는 업데이트 후에도 이런 질문을 하게 됩니다.

- update가 예전 Codex `tink` skill을 제거했나?
- 새 action skills가 설치됐나?
- 새 schemas가 추가됐나?
- 내 local harnesses, memory, hooks, config는 보존됐나?
- 업데이트 후 처음 무엇을 실행하면 되나?
- 업데이트가 제대로 됐는지 어떻게 확인하나?

Phase 5는 이 질문에 직접 답해야 합니다.

## 목표

- update가 무엇을 바꿨고 무엇을 보존했는지 설명합니다.
- clean install뿐 아니라 기존 install에 대한 smoke test를 추가합니다.
- Claude Code와 Codex를 모두 지원합니다.
- macOS와 Windows에서 모두 동작하게 유지합니다.
- 명시적으로 always-update 대상인 template이 아니라면 user-modified files를 보존합니다.
- 넓은 자동화, 숨은 migration, 새 `tink index` command를 추가하지 않습니다.

## 제안 Slice

### Slice 1: 기존 사용자 update smoke tests

다음을 테스트합니다.

- legacy `skills/tink/SKILL.md`가 있는 Codex install이 focused action skills로 업데이트되는지.
- 오래된 Codex action skill files가 refresh되는지.
- `context-map.schema.json`, `verification.schema.json` 같은 새 schemas가 추가되는지.
- user-modified preserved files가 보존되는지.
- update 후에도 Claude Code command 3-copy 동기화가 유지되는지.

### Slice 2: Update Result Summary

`update` 후 installer output을 개선해서 사용자가 다음을 볼 수 있게 합니다.

- 설치된 surfaces.
- 업데이트된 command 또는 skill 위치.
- legacy Codex skill path가 제거됐는지.
- 보존된 user-modified files.
- 다음에 실행할 command.

새 state file을 만들지 않고 plain text output으로 시작합니다.

### Slice 3: Troubleshooting Guide

짧은 update troubleshooting section을 추가합니다.

- Codex skill picker에 여전히 old `tink`가 보일 때.
- plugin update가 latest를 못 찾을 때.
- schema files가 없을 때.
- local `.tink/current/` state가 오래됐을 때.
- Windows shell encoding warning이 테스트 중 보일 때.

### Slice 4: Verification Recipe

작은 검증 recipe를 문서화합니다.

```bash
npm test
npx tink-harness@latest update --yes
```

그 다음 확인할 항목:

- Codex skill directory.
- Claude command copies.
- `.tink/schemas/`.
- `.tink/config.json`.
- `.gitignore` policy.

## 완료 기준

- 기존 사용자 update tests가 통과합니다.
- README와 한국어 README가 update confidence path를 설명합니다.
- `$tink:update`와 `/tink:update` 지침이 update 검증 방법을 언급합니다.
- 새 public command가 추가되지 않습니다.
- README가 참조하는 docs가 npm package에 포함됩니다.

## 위험

- user-modified files를 덮어쓰면 신뢰가 깨집니다.
- update output이 너무 길면 오히려 시끄러워집니다.
- 한 surface만 테스트하면 Codex와 Claude Code 동작이 갈라질 수 있습니다.
- shell-specific syntax에 의존하면 Windows와 macOS 동작이 달라질 수 있습니다.

## 추천 첫 단계

기존 사용자 update smoke tests부터 시작합니다. 가장 명확한 안전 신호를 만들고, 이후 output이나 docs 변경이 추측이 아니라 검증 위에 올라가게 해줍니다.
