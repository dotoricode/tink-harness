# 업데이트 검증 레시피

이 문서는 `tink-harness update` 후 최소한 무엇을 보면 정상 업데이트라고 판단할 수 있는지 정리한다.

문제가 이미 보인다면 먼저 `docs/update-troubleshooting.ko.md`를 봐도 된다. 이 문서는 문제 해결보다 "업데이트 후 확인 순서"에 초점을 둔다.

## 빠른 검증

repo 개발자는 다음을 실행한다.

```bash
npm test
```

일반 사용자는 설치된 repo에서 다음을 실행한다.

```bash
npx tink-harness@latest update --yes
```

출력에서 `Update Result Summary`를 확인한다.

## 확인 순서

### 1. Surface 확인

`Surfaces`가 의도한 값인지 본다.

- `claude`: Claude Code command와 skill만 갱신
- `codex`: Codex `$tink:*` skill과 repo `.tink/` 파일 갱신
- `all`: Claude Code와 Codex 모두 갱신

Codex를 별도 위치에 설치했다면 `Codex target`도 확인한다.

### 2. Codex skill 확인

Codex surface를 갱신했다면 다음이 있어야 한다.

- `tink-cast`
- `tink-verify`
- `tink-list`
- `tink-frog`
- `tink-weave`
- `tink-setup`
- `tink-update`
- `tink-core/RULES.md`

기대 상태:

- `skills/tink`는 제거되어야 한다.
- picker에는 action skill이 보이고, `tink-core`는 공유 규칙으로만 쓰인다.

### 3. Claude Code command 확인

Claude Code surface를 갱신했다면 다음 command가 있어야 한다.

- `/tink:setup`
- `/tink:cast`
- `/tink:verify`
- `/tink:list`
- `/tink:frog`
- `/tink:weave`
- `/tink:update`

repo 개발 중에는 `npm test`가 3-copy sync를 확인한다.

### 4. Schema 확인

다음 파일이 있어야 한다.

- `.tink/schemas/contract.schema.json`
- `.tink/schemas/context-map.schema.json`
- `.tink/schemas/verification.schema.json`
- `.tink/schemas/session.schema.json`

이 파일들은 `$tink:cast`와 `$tink:verify`가 같은 계약 구조를 쓰는지 확인하는 기준이다.

### 5. 보존된 파일 확인

`Preserved user-modified files`에 예상한 local file이 있는지 본다.

대표적으로 다음 파일들은 사용자 수정이 있으면 보존되는 것이 정상이다.

- `.tink/config.json`
- `.tink/harnesses/*`
- `.tink/memory/*`

`--force`를 쓰면 보존 정책이 달라질 수 있으므로 일반 update 검증에는 쓰지 않는다.

### 6. 다음 명령 확인

summary 마지막의 `Next`를 확인한다.

- Claude Code: `/tink:cast <task>`
- Codex: `$tink:cast <task>`

업데이트 후 바로 큰 작업을 시작하기보다, 작은 non-trivial 작업에서 `$tink:cast` 또는 `/tink:cast`가 승인 요청을 먼저 보여주는지 확인하면 좋다.

## 정상으로 볼 수 있는 기준

- update command가 성공 종료된다.
- `Update Result Summary`가 표시된다.
- 의도한 surface가 summary에 표시된다.
- legacy Codex `skills/tink`가 제거된다.
- action skills나 slash commands가 설치된다.
- schema files가 존재한다.
- 사용자 수정 파일은 `Preserved user-modified files`에 표시되고 내용이 유지된다.
- 다음 명령이 Claude Code와 Codex에 맞게 표시된다.

## 더 확인해야 하는 경우

다음 상황이면 `docs/update-troubleshooting.ko.md`를 본다.

- Codex picker에 예전 `tink`가 계속 보인다.
- schema files가 없다.
- update를 다른 repo에서 실행한 것 같다.
- Windows에서 인코딩 경고가 보여 결과를 해석하기 어렵다.
- `Update Result Summary`의 target path가 예상과 다르다.
