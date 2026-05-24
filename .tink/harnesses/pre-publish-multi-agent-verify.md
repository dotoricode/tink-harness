# pre-publish-multi-agent-verify

## When to use
공개 publish/release/배포 직전 — 단일 에이전트 검토로는 놓치기 쉬운 광범위한 표면(install, UX, docs, leak, slash, contract)을 여러 격리 환경에서 병렬 검증해야 할 때. `ship`의 일반 체크리스트로는 부족하고, npm/crates/PyPI 같은 되돌리기 어려운 매체로 배포할 때 특히 가치 있음.

## Ask first
- 어떤 패키지/아티팩트를 어떤 매체로 publish하는가? (npm/PyPI/GitHub Release/Docker Hub …)
- 사용자 표적 시나리오 3개는 무엇인가? (검증 시작 *전*에 잠그기)
- 격리 환경은 무엇인가? (git worktree / 임시 디렉토리 / 컨테이너)

## Domain rules
1. **시나리오 사전 잠금**: 검증 시작 전에 사용자 표적 시나리오 2~4개를 못박는다. 에이전트가 각자 다르게 해석하면 보고가 흩어진다.
2. **격리 강제**: 각 에이전트는 별도 worktree 또는 임시 디렉토리에서 작업. 본 repo의 working tree를 더럽히지 않는다.
3. **에이전트당 관심사 1개**: install matrix / UX walkthrough / doc consistency / leak audit / slash·contract coverage. 한 에이전트가 두 관심사를 겸하지 않는다.
4. **Evidence-only**: 보고는 "느낌상 불편함" 거부. file:line, 명령 stdout, exit code, sha 비교 같은 재현 가능한 증거만 인정.
5. **300단어 상한**: 에이전트당 보고 ≤300단어. 합산이 가능해진다.
6. **분류 4단계**: blocker / major / minor / nit. 각 에이전트가 자체 분류 후 메인이 합산 시 재조정 가능.
7. **CHANGELOG 정직성**: docs-consistency는 반드시 `[Unreleased]` ↔ `[버전]` 병합 여부 확인. 이번 버전이 ship하는 모든 항목이 해당 버전 entry에 적혀 있어야 한다.

## Plan
1. tarball/build artifact 생성 (`npm pack`, `cargo package`, `python -m build` 등) — 정상 산출 확인.
2. 사용자 표적 시나리오를 사용자와 함께 잠근다 (소프트 게이트가 아닌 하드 게이트).
3. 5개(또는 도메인에 맞춰 3~6개) 에이전트를 격리 환경에서 병렬 실행.
4. 보고 합산 + blocker/major/minor/nit 분류.
5. publish 가/부 권고 + 사용자 결정.

## Checks
- Build artifact 생성 정상 (sha 기록).
- 모든 에이전트 verdict 수집.
- blocker 0건 확인 후에만 publish 권고.
- CHANGELOG `[Unreleased]` 비어 있거나 v+1을 위한 것만 남아 있음.
- 광고된 모든 명령/슬래시/API surface가 실제로 출하 산출물에 존재 (sha 1:1 또는 명시적 차이 문서화).
- 비밀/credentials/개인 경로 누출 없음.

## Done means
- 각 에이전트 PASS/FAIL + evidence가 합산 보고에 기록됨.
- blocker/major/minor/nit 분류 명시.
- publish 가/부 권고와 그 근거가 사용자에게 전달됨.

## If it fails
- blocker 1+ → publish 차단. 마지막 안전 지점(이전 정상 버전)에서 fix 후 재검증.
- major 2+ → 사용자에게 go/no-go 결정 요청. 각 major 별 fix 후보 제시.
- minor만 → publish OK 권고 + 후속 fix 큐에 추가.
- 에이전트 보고가 모순될 때는 사용자 표적 시나리오를 기준으로 재해석.
