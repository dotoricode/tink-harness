# 업데이트 문제 해결 가이드

이 문서는 `tink-harness update` 이후 뭔가 오래된 상태처럼 보이거나, 설치 결과가 예상과 다를 때 확인할 항목을 정리한다.

README에는 긴 문제 해결 내용을 넣지 않는다. 평소에는 설치와 사용 흐름을 가볍게 유지하고, 문제가 생겼을 때만 이 문서를 본다.

## 먼저 볼 것

`tink-harness update`가 끝나면 출력의 `Update Result Summary`를 먼저 확인한다.

- `Surfaces`: 새로 고친 대상이 `claude`, `codex`, 또는 `all`인지 확인한다.
- `Updated or added`: 새 command, skill, schema가 들어갔는지 확인한다.
- `Preserved user-modified files`: 사용자가 고친 파일이 보존됐는지 확인한다.
- `Removed legacy paths`: 오래된 Codex `skills/tink` 같은 legacy path가 제거됐는지 확인한다.
- `Installed locations`: 실제 파일이 들어간 위치를 확인한다.

## Codex skill picker에 예전 `tink`가 보일 때

가능한 원인:

- 이전 버전의 넓은 Codex `skills/tink/SKILL.md`가 남아 있다.
- `CODEX_HOME`이 예상한 위치와 다르다.
- Codex UI가 아직 skill 목록을 새로 읽지 않았다.

확인:

```bash
npx tink-harness@latest update --yes
```

그 다음 `Update Result Summary`에서 다음을 본다.

- `Codex target`
- `Removed legacy paths`
- `Codex skills`

기대 상태:

- `skills/tink`는 없어야 한다.
- `tink-cast`, `tink-verify`, `tink-list`, `tink-frog`, `tink-weave`, `tink-setup`, `tink-update`가 있어야 한다.
- `tink-core/RULES.md`는 내부 공유 규칙으로 존재하지만 picker에 action으로 보이지 않는 것이 정상이다.

## schema files가 없을 때

가능한 원인:

- update 대상 surface만 Codex로 맞췄지만 repo `.tink/` 설치 경로가 다르다.
- update를 다른 working directory에서 실행했다.
- 기존 사용자 수정 파일이 보존되어 새 템플릿으로 덮이지 않았다.

확인할 파일:

- `.tink/schemas/contract.schema.json`
- `.tink/schemas/context-map.schema.json`
- `.tink/schemas/verification.schema.json`
- `.tink/schemas/session.schema.json`

`Update Result Summary`의 `Install target`이 현재 repo인지 먼저 확인한다.

## 사용자 수정 파일이 덮였는지 걱정될 때

Tink update는 기본적으로 사용자 수정 파일을 보존한다. 특히 local harness, memory, config는 함부로 덮지 않는 것이 원칙이다.

확인:

- `Preserved user-modified files`에 해당 파일이 있는지 본다.
- `--force`를 쓰지 않았는지 확인한다.

주의:

- `commands`, `skills`, `maintenance` template은 새 버전과 맞추기 위해 update 대상이다.
- reusable local state는 사용자 승인 없이 새 의미로 바꾸지 않는다.

## Claude Code command가 오래된 것 같을 때

Claude Code command는 세 copy가 같은 내용이어야 한다.

- `commands/<name>.md`
- `templates/claude/commands/tink/<name>.md`
- `.claude/commands/tink/<name>.md`

repo 개발 중이라면 다음 검증을 실행한다.

```bash
npm test
```

일반 사용자라면 update 후 Claude Code를 다시 열거나 `/reload-plugins`를 실행한다.

## Windows에서 인코딩 경고가 보일 때

Windows PowerShell이나 cp949 환경에서는 일부 테스트 출력에서 인코딩 경고가 보일 수 있다. 테스트가 `OK`로 끝났다면 기존에 알려진 환경 경고일 수 있다.

중요한 기준:

- `npm test`가 성공했는가
- `node --check bin/install.js`가 성공했는가
- 실제 파일 내용이 깨진 것이 아니라 terminal 출력만 깨진 것인가

문서 파일은 UTF-8로 저장한다.

## 여전히 이상할 때

다음을 함께 기록하면 다음 진단이 쉬워진다.

- 실행한 update command
- `Update Result Summary`
- 사용한 OS
- `CODEX_HOME` 값
- 현재 repo path
- 기대한 surface: Claude Code, Codex, 또는 둘 다

이 정보는 Tink가 자동으로 결정을 대신하기 위한 것이 아니라, 사용자가 어떤 설치 상태인지 빠르게 확인하기 위한 증거다.
