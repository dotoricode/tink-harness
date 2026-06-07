# Context Run Record Policy

Context Run Record Policy는 실제 `.tink/runs/*` 기록을 나중에 rollup할 때 어떤 기록을 써도 되는지 정하는 기준이다.

이 문서는 새 public command가 아니다. `tink index` 명령, watcher, generated cache, hidden runtime index를 만들지 않는다. 자동 수집도 하지 않는다.

영어 문서는 `docs/context-run-record-policy.md`에 있다.

## 왜 필요한가

현재 90% 달성 근거는 repository fixture와 대표 run-history fixture 기준이다. 이것만으로 “모든 실제 프로젝트에서 production-wide 90%가 보장된다”고 말하면 안 된다.

실제 run 기록으로 넘어가려면 먼저 다음을 정해야 한다.

- 어떤 `.tink/runs/*` 기록을 rollup에 포함할 수 있는가.
- 어떤 정보는 민감하거나 너무 넓어서 제외해야 하는가.
- metric score가 verification evidence와 연결되어 있는가.
- Claude Code와 Codex, macOS와 Windows에서 같은 기준으로 검증할 수 있는가.

## 포함 가능한 기록

포함 가능한 기록은 사용자가 승인한 current-run에서 나온 완료 기록이어야 한다.

- run id 또는 run path.
- 완료 시각.
- 사용한 surface: Claude Code 또는 Codex.
- 사용한 platform: macOS 또는 Windows.
- `context-metrics-evaluation.json` 형태의 여섯 지표 점수.
- 검증 결과와 check 목록.
- 짧은 evidence handle.
- production telemetry인지, fixture인지, 대표 run인지에 대한 limit.

## 제외해야 할 기록

다음은 run-history rollup에 넣지 않는다.

- token, credential, raw private payload.
- private issue, dashboard, Figma file, discussion 전체 복사본.
- 별도 승인 없는 `.tink/memory/*`, `.tink/rules/*`, `.tink/harnesses/*` reusable state 변경.
- Sentry 연동.
- release evidence bundling.

## 완료 기준

- 여섯 지표가 모두 기록에 존재한다.
- metric score마다 근거가 있다.
- verification result와 checks가 연결되어 있다.
- limit가 production telemetry인지 아닌지 명확히 말한다.
- 새 public command, watcher, generated cache, hidden runtime index가 없다.
- macOS와 Windows 모두 `npm test`로 검증할 수 있다.
