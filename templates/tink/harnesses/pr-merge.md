# pr-merge

## When to use
Merge a GitHub PR after verifying CI, reviewing the diff, and confirming no conflicts. Use when a PR is open and the user wants to merge it safely.

## Ask first
- Which PR? (number, URL, or "current branch")
- Merge strategy: squash (권장), merge, or rebase?
- Any known risks or rollback plan?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
0. git 상태 사전 확인:
   - `git status` — 작업 트리 클린 확인 (uncommitted changes 없어야 함)
   - `git log origin/<base>..HEAD` — 예상치 못한 로컬 커밋 없는지 확인
   - `git fetch origin && git status` — 브랜치가 remote와 동기화 상태 확인
1. `gh pr view <PR>` — title, base branch, author, state 확인
2. `gh pr checks <PR>` — CI 상태 모두 green 확인
2b. 관련 테스트 실행:
   - `package.json`에 `test` 스크립트가 있으면 `npm test`
   - `Makefile`에 `test` 타깃이 있으면 `make test`
   - `pytest`가 감지되면 `pytest`
   - 테스트 없으면 이유 명시 후 진행
3. `gh pr diff <PR>` 또는 `git diff <base>..<head>` — diff 범위 확인
4. `gh pr view <PR> --json mergeable` — 충돌 여부 확인 (`MERGEABLE` 이어야 함)
5. merge 전 base 브랜치 SHA 기록: `git rev-parse origin/<base>` (rollback 기준점)
6. `gh pr merge <PR> --<strategy> --delete-branch` 실행
7. merge 후 `git fetch origin && git log origin/<base> -1` — 반영 확인

## Checks
- 작업 트리 클린 (uncommitted changes 없음)
- 로컬 브랜치가 remote와 동기화됨
- 관련 테스트 통과 (또는 테스트 없는 이유 명시)
- CI 전체 green (또는 skip 이유를 사용자 승인 받음)
- 충돌 없음 (`mergeable: MERGEABLE`)
- diff 범위가 PR 설명과 일치
- rollback 기준점(base SHA before merge) 기록됨
- merge 전략이 사용자 답변과 일치

## Done means
- PR merged and closed (`gh pr view <PR>` state = merged)
- base 브랜치 remote 업데이트 확인
- rollback 기준점 `.tink/current/notes.md`에 기록됨

## If a check fails
- CI 실패: 머지 금지. 실패 체크 이름과 원인 명시. `.tink/current/notes.md`에 기록.
- 충돌 발생: 머지 금지. 사용자에게 충돌 해소 요청 후 재시도.
- diff 범위 불일치: Stitch에 올려 확인 후 진행.
- merge 명령 실패: base SHA rollback 기준점 제시하고 사용자에게 수동 확인 요청.

## Memory rule
merge 실패나 CI 불안정 패턴이 반복되면 `.tink/memory/mistakes.md`에 별도 승인 후 기록.
