<p align="center">
  <img src=".github/assets/hero.gif" alt="Tink Hero Banner" width="100%">
</p>

# Tink

Claude Code와 Codex를 위한 작은 하네스 레이어입니다.

Tink는 지금 작업에 맞는 하네스를 고르고, 실행 상태를 보이게 만들고, 실제 사용 중 생긴 실패와 피드백으로 하네스 세트를 개선합니다.

**최신 패키지:** v1.7.1 — "둘 다" surface와 "Clean Codex picker"를 함께 선택했을 때 Claude Code 명령이 삭제되던 버그를 수정합니다. 최신 마이너 릴리스 노트: [v1.7.0](https://github.com/dotoricode/tink-harness/releases/tag/v1.7.0).

[English](README.md) · **한국어**

---

## 왜 만들었나

새로운 AI 코딩 하네스와 워크플로는 계속 늘어납니다. 좋은 것도 많지만, 여러 개를 섞다 보면 환경이 무거워지고 매번 다시 정리해야 합니다.

Tink는 큰 프레임워크가 아닙니다. Claude Code나 Codex가 지금 작업에 필요한 절차만 고르고, 없으면 작은 임시 하네스를 만들고, 반복되는 실수만 승인 후 재사용 지식으로 남기도록 돕습니다.

## 설치

Claude Code 플러그인:

```text
/plugin marketplace add dotoricode/tink-harness
/plugin install tink@tink-harness
/reload-plugins
/tink:setup
```

Standalone / Codex 호환 설치:

```bash
npx tink-harness@latest install
```

설치 중 `Claude Code`, `Codex`, 또는 둘 다를 선택할 수 있습니다. Codex에서는 `$tink:cast <task>`로 시작합니다.

## 업데이트

Claude Code 플러그인:

```text
/plugin marketplace update tink-harness
/plugin update tink@tink-harness
/reload-plugins
```

Standalone / Codex:

```bash
npx tink-harness@latest update
```

업데이트가 정상인지 빠르게 확인하려면 `docs/update-verification-recipe.ko.md` 또는 `docs/update-verification-recipe.md`를 확인하세요.

업데이트 후 Codex skill, schema, Windows 경고가 이상해 보이면 `docs/update-troubleshooting.ko.md` 또는 `docs/update-troubleshooting.md`를 확인하세요.

## 1.7.1에서 달라진 점

이번 패치는 "둘 다" surface와 "Clean Codex picker"를 함께 선택했을 때 Claude Code 명령과 skill이 삭제되는 문제를 수정합니다.

- "둘 다 (Claude Code + Codex)"와 "Clean Codex picker"를 동시에 선택해도 Claude Code 명령과 skill이 삭제되지 않습니다. 이 옵션은 이제 Codex만 선택했을 때만 표시됩니다.

## 1.7.0에서 달라진 점

이번 마이너 릴리스는 installer UX의 두 가지 불편함을 해결합니다.

- surface 선택 단계가 단일 선택 프롬프트(Claude Code / Codex / 둘 다(Claude Code + Codex))로 바뀌어, 커서가 이미 선택된 항목 위에 있어도 선택 상태를 바로 알 수 있습니다.
- 컴포넌트 선택 프롬프트가 설정 중인 surface를 명시합니다. "Claude Code 설치 항목" 또는 "Codex 설치 항목"처럼 선택한 surface에 맞는 메시지가 표시됩니다.

## 1.6.3에서 달라진 점

이번 패치는 CLI 옵션을 interactive installer 안에서 직접 고를 수 있게 만듭니다.

- wizard에 `Advanced options` 단계가 추가되어 `Preview only (--dry-run)`, `Overwrite user-modified files (--force)`, `Clean Codex picker (--clean-codex-picker)`를 선택할 수 있습니다.
- install/update 출력에 선택된 옵션 상태를 표시해서 preview, force overwrite, Codex picker cleanup이 켜졌는지 바로 볼 수 있습니다.
- 기존 CLI flag는 그대로 동작하며, interactive wizard에서는 같은 옵션의 초기 선택값으로 반영됩니다.
## 1.6.2에서 달라진 점

이번 패치는 Claude Code와 Codex를 함께 쓰는 설치 흐름을 더 명확하게 만듭니다.

- Codex action skill이 이제 `Cast`/`Verify` 같은 일반 이름 대신 `Tink: Cast`, `Tink: Verify`, `Tink: Update`처럼 설치됩니다.
- Claude Code와 Codex를 함께 선택했을 때 컴포넌트 선택지에서 `Claude Code Tink skill`과 `Codex Tink skills`가 분리되어 보입니다.
- install/update 출력에 repo, shared `.tink`, Claude Code, Codex target 경로를 표시해서 선택한 항목이 어디에 설치되는지 바로 볼 수 있습니다.
- `--clean-codex-picker` 또는 `TINK_CLEAN_CODEX_PICKER=1`로 Codex에 `Source Command Tink ...` 항목을 만들던 repo-local Claude Tink command/skill surface를 정리할 수 있습니다.

## 1.6.1에서 달라진 점

이번 패치는 기존 설치의 update 경로를 고칩니다.

- `tink-harness update`가 v1.5.x에서 생성된 기본 `.tink/rules/index.json`을 새 v1.6.x rule graph seed로 갱신합니다.
- custom rule이나 rule evidence가 들어간 사용자 수정 rule graph는 계속 보존합니다.

## 1.6.0에서 달라진 점

이번 릴리스는 Tink의 작은 rule graph를 실제 작업에서 더 쓸모 있게 만듭니다.

- README 한/영 동기화, 버전 메타데이터 동기화, Claude Code 명령 3-copy 동기화, installer/update smoke check처럼 반복되는 작업에 필요한 관련 파일과 검증 체크를 seed rule로 연결합니다.
- `/tink:cast`와 `$tink:cast`는 rule의 `reason`, `risk`, `include_paths`, `checks`를 context 증거로 남기도록 안내합니다.
- `/tink:weave`와 `/tink:frog`는 rule quality를 함께 점검해서 keep, rewrite, split, merge, needs evidence로 정리할 수 있게 합니다.
- 그래프는 계속 작고 파일 기반으로 유지합니다. 이번 릴리스도 public `tink index` 명령, watcher, generated cache, database, 외부 서비스를 추가하지 않습니다.
## 1.2.0 이후 기반 개선

이번 릴리스는 Tink를 Claude Code와 Codex에서 같은 하네스 레이어로 쓰기 쉽게 정리합니다.

- Codex에는 하나의 넓은 `tink` 스킬 대신 `$tink:cast`, `$tink:verify` 같은 action skill만 보이도록 설치됩니다.
- 비단순 작업은 `context-pack.md`, `context-map.json`, `excluded-context.md`로 어떤 context를 썼고 뺐는지 남깁니다.
- Repo Signal과 Context Graph Lite는 새 `tink index` 명령을 만들지 않고도 관련 테스트, 스키마, 동기화 파일, 검증 힌트를 고르는 데 쓰입니다.
- context 효율 점수화, fixture 비율 계산, run-history rollup, 90% threshold status, 실제 run 기록 경계 기준은 `docs/context-budget-ledger.ko.md`, `docs/context-budget-ledger.md`, `docs/context-metrics-evaluator.ko.md`, `docs/context-metrics-evaluator.md`, `docs/context-run-history-rollup.ko.md`, `docs/context-run-history-rollup.md`, `docs/context-threshold-status.ko.md`, `docs/context-threshold-status.md`, `docs/context-run-record-policy.ko.md`, `docs/context-run-record-policy.md`에서 확인할 수 있습니다.
- `/tink:verify`와 `$tink:verify`는 같은 Verify Runner 모델을 쓰며 `.tink/current/verification.json`에 검증 증거를 남깁니다.
- 외부 context는 MCP Safe Profile을 따릅니다. 가장 작은 source handle만 남기고, 신뢰도와 민감도를 표시하며, 위험하거나 너무 넓은 context는 `excluded-context.md`에 따로 기록합니다.

## 명령

Claude Code에서는 `/tink:*`, Codex에서는 `$tink:*`을 씁니다. 예전 `$tink cast` 형식도 호환되지만, 기본 안내와 자동완성 표면은 `$tink:*`입니다.

### `/tink:cast` / `$tink:cast`

작업을 읽고, 필요한 하네스만 고르고, `.tink/current/` 실행 상태를 만든 뒤 첫 번째 안전한 단계를 시작합니다.

Tink는 이제 비단순 작업에 대해 `.tink/current/contract.json`도 만듭니다. 이 파일에는 작업 종류, 위험, 성공 조건, 금지 사항, 검증 명령이 들어갑니다.

### `/tink:verify` / `$tink:verify`

`contract.json`에 적힌 검증을 실제로 실행하고 증거를 남깁니다.

릴리스, 배포, 공개 PR처럼 "된 것 같다"가 아니라 "확인했다"가 필요한 작업에서 씁니다.

### `/tink:frog` / `$tink:frog`

거의 쓰지 않거나 겹치거나 너무 무거운 하네스를 정리 후보로 제안합니다. 사용자 승인 없이는 삭제하지 않습니다.

### `/tink:weave` / `$tink:weave`

실제 실패, 반복 사용, 사용자 수정 내용을 바탕으로 하네스를 조금 더 정확하게 고칩니다. 필요한 경우 `.tink/rules/`의 rule graph나 opt-in hook guard 후보로 승격합니다.

### 기타

- `/tink:setup` / `$tink:setup`: 언어, 설치 범위, git 추적, hook 정책 설정
- `/tink:list` / `$tink:list`: 사용 가능한 하네스와 사용 신호 확인
- `/tink:update` / `$tink:update`: 설치 출처를 확인하고 안전한 업데이트 안내

## 작동 방식

Tink는 직접 볼 수 있는 파일을 씁니다.

- `.tink/harnesses/`: 재사용 가능한 작업 하네스
- `.tink/rules/`: 계약 내용에 맞춰 필요한 하네스, 체크, guard 후보만 고르는 작은 rule graph
- `.tink/schemas/`: `contract.json` 같은 구조화 파일의 스키마
- `.tink/current/`: 현재 실행 상태
- `.tink/runs/`: 완료, 중단, 취소, 교체된 실행 기록
- `.tink/maintenance/`: 검증, friction, weave 신호 기록
- `.tink/memory/`: 승인된 실수, 선호, 교훈

Rule graph는 작게 유지합니다. Tink는 먼저 필수 규칙을 고르고, 작업 사실이나 keyword에 맞는 선택 규칙만 가져오며, phase별로 이미 읽은 rule id를 기록해 같은 안내를 반복하지 않습니다.

설계 메모는 `docs/`에 둡니다. 기본 호환성 기준은 `docs/compatibility-policy.md`에 있으며, 새 작업은 Claude Code와 Codex, macOS와 Windows를 함께 고려해야 합니다. Repo Signal 동작은 `docs/repo-signals.ko.md` 또는 `docs/repo-signals.md`에 정리되어 있고, 가벼운 graph 규칙 적용 계획은 `docs/graph-rule-adoption-plan.ko.md`에 정리되어 있습니다. 외부 context 안전 기준은 `docs/mcp-safe-profile.md`에 정리되어 있습니다. `.tink/current/` 상태를 읽거나 검토할 때는 `docs/work-state.ko.md` 또는 `docs/work-state.md`부터 보면 됩니다. 다음 업데이트 안정화 계획은 `docs/phase-5-update-confidence.ko.md`와 `docs/phase-5-update-confidence.md`에 정리되어 있습니다. 더 큰 아이디어 구현 점검과 로드맵은 `docs/tink-idea-implementation-plan.ko.md`에 정리되어 있습니다.

중요한 원칙은 승인입니다. 현재 작업을 진행하는 승인과, 미래에도 재사용될 상태를 저장하는 승인은 별개입니다. 새 하네스, 메모리, rule graph, hook guard 저장은 항상 별도 승인이 필요합니다.

## 계획된 작업 단위

남은 계획은 번호가 붙은 단계보다 작업 단위 이름으로 관리합니다. 전체 목록은 `docs/planned-work-units.ko.md` 또는 `docs/planned-work-units.md`에 있으며, 세부 문서는 검증 증거 세분화, 외부 컨텍스트 정책, 하네스 생애주기 신호, 메모리 결정 계층, 컨텍스트 변화 리뷰, 업데이트 진단으로 나누어 둡니다.

## Tink가 아닌 것

Tink는 코딩 에이전트, 워크플로 엔진, 멀티 에이전트 런타임, 프롬프트 라이브러리가 아닙니다. Claude Code와 Codex 위에 얹는 작은 하네스 레이어입니다.

## 라이선스

MIT
