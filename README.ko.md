<p align="center">
  <img src=".github/assets/hero.gif" alt="Tink Hero Banner" width="100%">
</p>

# Tink

Claude Code와 Codex를 위한 작은 하네스 레이어입니다.

Tink는 지금 작업에 맞는 하네스를 고르고, 실행 상태를 보이게 만들고, 실제 사용 중 생긴 실패와 피드백으로 하네스 세트를 개선합니다.

**최신 패키지:** v1.9.15 — 로컬 건강 리포트가 탭형 대시보드로 바뀌었습니다. 3D 하네스 지도, 쉬운 말 건강 요약, Claude Code와 Codex 양쪽 복사-붙여넣기 명령이 포함된 다음 행동 제안을 제공합니다. 전체 변경 이력은 [CHANGELOG](CHANGELOG.md)를 확인하세요.

[English](README.md) · **한국어** · [변경 이력](CHANGELOG.md)

---

## 빠른 시작

1분이면 Tink를 직접 써볼 수 있습니다.

**Claude Code (플러그인):**

```text
/plugin marketplace add dotoricode/tink-harness
/plugin install tink@tink-harness
/reload-plugins
/tink:setup
```

**Claude Code 또는 Codex (스탠드얼론):**

```bash
npx tink-harness@latest install
```

문서를 더 읽는 대신 실제 작업을 맡겨 보세요:

```text
/tink:cast 인증 모듈 리팩터링     # Claude Code
$tink:cast 인증 모듈 리팩터링     # Codex
```

`cast`는 작업에 맞는 하네스를 고르고(없으면 초안을 만들고), `.tink/current/`에 보이는 계획을 쓰고, 승인 후 첫 안전한 단계를 시작합니다. 끝난 run마다 간결한 기록이 남고 — 그 기록이 아래 대시보드가 됩니다.

## 하네스 건강을 눈으로 확인

몇 번의 run이 쌓이면, 읽기 전용 helper 두 개가 기록을 로컬 대시보드로 바꿔 줍니다:

```bash
node .tink/tools/generate-harness-lifecycle-summary.mjs
node .tink/tools/render-harness-health-report.mjs
# .tink/maintenance/harness-health-report.html 열기
```

하네스와 그들이 쓰는 규칙·메모리, 그 연결을 보여주는 인터랙티브 3D 지도 — 무리마다 고유한 색을 갖고, 살아있는 관계 위로 신호가 흐릅니다:

![Tink 하네스 지도 — 하네스·규칙·메모리·단계를 보여주는 인터랙티브 3D 뷰](.github/assets/dashboard-map.png)

실제 사용량 순으로 정렬된 하네스 카드 — 쉬운 말 건강 요약, 주의 점수, 승인 이력, 그리고 Claude Code·Codex 양쪽 복사용 명령이 포함된 다음 행동 제안:

![사용량 순 하네스 카드와 쉬운 말 건강 요약·히스토리](.github/assets/dashboard-harnesses.png)

서버도, 텔레메트리도, 숨은 캐시도 없습니다 — 제안만 준비하는 정적 로컬 페이지입니다. 재사용되는 변경은 여전히 Tink의 승인 절차를 거칩니다.

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

repo 내부 smoke 검증을 위해서는 `CODEX_HOME`을 고정해서 실행하세요.

```bash
set CODEX_HOME=%CD%\.codex
npx tink-harness@latest install
```

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

업데이트는 질문 하나 — 어떤 agent surface를 갱신할지 — 만 묻고 나머지는 자동으로 처리합니다. Tink가 관리하는 파일(commands, skills, maintenance, 런타임 tools)은 항상 최신으로 덮어쓰고, 사용자가 수정한 하네스·메모리·설정은 보존합니다.

`CODEX_HOME`을 지정하지 않으면 Windows에서는 `%USERPROFILE%\.codex`, macOS/Linux에서는 `~/.codex`에 Codex skill이 설치됩니다.

### 고급 옵션

Interactive install/update 중에는 **고급 옵션** 단계가 나옵니다. 예전에는 CLI flag를 직접 알아야 했지만, 이제는 선택 화면에서 볼 수 있습니다.

- `Preview only (--dry-run)`: 실제 파일을 바꾸기 전에 Tink가 무엇을 쓰고, 보존하고, 지울 예정인지 먼저 보고 싶을 때 씁니다. 파일은 변경하지 않습니다.
- `Overwrite user-modified files (--force)`: 설치가 꼬였고 공식 템플릿으로 되돌리고 싶을 때만 씁니다. 일반 업데이트는 사용자가 고친 파일을 보존합니다.
- `Clean Codex picker (--clean-codex-picker)`: 이 repo에서 Codex만 쓸 때, Codex picker에 `Source Command Tink ...` 중복 항목이 보여서 헷갈리면 씁니다. Claude Code와 Codex를 둘 다 쓰는 설치에서는 이 옵션을 보여주지 않습니다.

패키지는 이미 `tink-harness` 실행 파일 이름을 제공합니다. package manager가 이 실행 파일을 `PATH`에 설치한 환경에서는 `tink-harness update`처럼 입력할 수 있습니다. 아직 설치되어 있지 않다면 `npx tink-harness@latest update`를 계속 쓰면 됩니다. macOS와 Windows에서 직접 명령 경로를 확실히 검증한 뒤 README 예시를 더 짧게 바꾸는 작업은 계획 문서에 따로 남겨둡니다.

업데이트가 정상인지 빠르게 확인하려면 `docs/update-verification-recipe.ko.md` 또는 `docs/update-verification-recipe.md`를 확인하세요.

업데이트 후 Codex skill, schema, Windows 경고가 이상해 보이면 `docs/update-troubleshooting.ko.md` 또는 `docs/update-troubleshooting.md`를 확인하세요.

## 명령

Claude Code에서는 `/tink:*`, Codex에서는 `$tink:*`을 씁니다. 예전 `$tink cast` 형식도 호환되지만, 기본 안내와 자동완성 표면은 `$tink:*`입니다.

### `/tink:cast` / `$tink:cast`

작업을 읽고, 필요한 하네스만 고르고, `.tink/current/` 실행 상태를 만든 뒤 첫 번째 안전한 단계를 시작합니다.

Tink는 이제 비단순 작업에 대해 `.tink/current/contract.json`도 만듭니다. 이 파일에는 작업 종류, 위험, 성공 조건, 금지 사항, 검증 명령이 들어갑니다.

더 크거나 모호한 작업에서는 `cast`가 에이전트의 생각 단계를 파일로 더 잘 드러내는 하네스를 고를 수 있습니다. 모호한 아이디어는 `requirements-interview`, 큰 계획은 `plan-consensus`, 긴 실행은 `goal-checkpoint`, 안전한 인수인계는 `delegation-brief`를 씁니다. 모두 `/tink:cast` 또는 `$tink:cast`가 고르는 재사용 하네스이며, 별도 CLI 명령은 아닙니다.

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

Tink는 이 기록을 읽어 하네스 건강 요약도 만들 수 있습니다. 요약은 어떤 하네스가 쓰였는지, 어디서 check가 실패하거나 막혔는지, 어떤 하네스가 자주 함께 쓰였는지, 어떤 하네스가 weave 개선 후보인지, frog 정리 검토 후보인지, 병합 검토 후보인지, 오래 쉬어서 보관 검토 후보인지, 더 지켜봐야 하는지를 보여줍니다. 후보 점수, 생애주기 상태, graph 관계, 최근 run timeline도 함께 제공합니다. 이것은 여전히 제안일 뿐입니다. 하네스 수정, 병합, 보관, 삭제, memory 저장, rule 업데이트는 Tink의 기존 명시적 승인 절차를 거쳐야 합니다.

설치된 읽기 전용 helper로 JSON 요약과 로컬 HTML 리포트를 만들 수 있습니다.

```bash
node .tink/tools/generate-harness-lifecycle-summary.mjs
node .tink/tools/render-harness-health-report.mjs
```

리포트는 정적인 탭형 로컬 페이지입니다. 홈 요약, 사용량 순 하네스 카드와 평가·생성 히스토리, 메모리 참조, run 활동 피드, 그리고 인터랙티브 3D 하네스 지도(드래그 회전, 우클릭 드래그·두 손가락 스크롤 이동, 휠·핀치 확대 — three.js를 CDN에서 불러오며 오프라인이면 안내가 표시됩니다)를 제공합니다. 하네스나 건강 그룹을 선택하면 쉬운 말 요약과 함께 Claude Code(`/tink:...`)·Codex(`$tink:...`) 양쪽 복사용 명령이 포함된 다음 행동을 제안합니다. 여전히 서버를 시작하거나, 파일을 감시하거나, hidden cache를 만들거나, 새 public `tink index` 명령을 추가하지 않습니다 — 제안만 하며, 재사용 상태 변경은 기존 승인 절차를 그대로 따릅니다.

선택된 하네스에 따라 `.tink/current/goals.json`에는 현재 실행의 목표 체크포인트가, `.tink/current/delegation.md`에는 인수인계 패킷이 추가될 수 있습니다. Tink는 이런 브리프를 보이는 상태로 준비하지만, 별도 승인된 워크플로가 아니면 worker, tmux pane, worktree를 시작하지 않습니다.

Rule graph는 작게 유지합니다. Tink는 먼저 필수 규칙을 고르고, 작업 사실이나 keyword에 맞는 선택 규칙만 가져오며, phase별로 이미 읽은 rule id를 기록해 같은 안내를 반복하지 않습니다.

설계 메모는 `docs/`에 둡니다. 기본 호환성 기준은 `docs/compatibility-policy.md`에 있으며, 새 작업은 Claude Code와 Codex, macOS와 Windows를 함께 고려해야 합니다. Repo Signal 동작은 `docs/repo-signals.ko.md` 또는 `docs/repo-signals.md`에 정리되어 있고, 가벼운 graph 규칙 적용 계획은 `docs/graph-rule-adoption-plan.ko.md`에 정리되어 있습니다. 하네스 건강 요약은 `docs/harness-lifecycle-signals.ko.md` 또는 `docs/harness-lifecycle-signals.md`에 정리되어 있습니다. 외부 context 안전 기준은 `docs/mcp-safe-profile.md`와 `docs/external-context-policy.md`에 정리되어 있습니다. `.tink/current/` 상태를 읽거나 검토할 때는 `docs/work-state.ko.md` 또는 `docs/work-state.md`부터 보면 됩니다. 다음 업데이트 안정화 계획은 `docs/phase-5-update-confidence.ko.md`와 `docs/phase-5-update-confidence.md`에 정리되어 있습니다. Context 효율 관련 문서는 `docs/context-budget-ledger.ko.md`, `docs/context-budget-ledger.md`, `docs/context-metrics-evaluator.ko.md`, `docs/context-metrics-evaluator.md`, `docs/context-run-history-rollup.ko.md`, `docs/context-run-history-rollup.md`, `docs/context-threshold-status.ko.md`, `docs/context-threshold-status.md`, `docs/context-run-record-policy.ko.md`, `docs/context-run-record-policy.md`에서 확인할 수 있습니다. 남은 작업 단위는 `docs/planned-work-units.ko.md` 또는 `docs/planned-work-units.md`에 정리되어 있습니다. 더 큰 아이디어 구현 점검과 로드맵은 `docs/tink-idea-implementation-plan.ko.md`에 정리되어 있습니다.

중요한 원칙은 승인입니다. 현재 작업을 진행하는 승인과, 미래에도 재사용될 상태를 저장하는 승인은 별개입니다. 새 하네스, 메모리, rule graph, hook guard 저장은 항상 별도 승인이 필요합니다.

## 계획된 작업 단위

남은 계획은 번호가 붙은 단계보다 작업 단위 이름으로 관리합니다. 전체 목록은 `docs/planned-work-units.ko.md` 또는 `docs/planned-work-units.md`에 있으며, 세부 문서는 검증 증거 세분화, 외부 컨텍스트 정책, 메모리 결정 계층, 컨텍스트 변화 리뷰, 업데이트 진단으로 나누어 둡니다. 하네스 생애주기 신호는 이제 기본 JSON 요약과 정적 HTML 리포트까지 구현되어 별도 문서에서 관리합니다.

## Tink가 아닌 것

Tink는 코딩 에이전트, 워크플로 엔진, 멀티 에이전트 런타임, 프롬프트 라이브러리가 아닙니다. Claude Code와 Codex 위에 얹는 작은 하네스 레이어입니다.

## 라이선스

MIT
