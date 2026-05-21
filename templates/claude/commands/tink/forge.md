# /tink:forge

Forge the right harness for the task, run it, and capture reusable learning.

`forge` is the main Tink command. Use it before non-trivial work.

## Product promise
Tink is not a harness recommendation list. It must leave the user with an active run state and a concrete next action.

Tink should:
1. understand the task,
2. choose or build the smallest useful harness,
3. materialize the harness as a run plan,
4. execute the first safe step after approval,
5. prevent repeated mistakes while working,
6. remember only reusable lessons after approval.

## Default behavior
Do not stop after saying which harness might fit.

A valid `/tink:forge` response must do one of these:
- create or update `.tink/current/` and start the harnessed work,
- ask one blocking question that is required to create `.tink/current/`, or
- cancel because the user chose not to proceed.

If the task is clear enough to classify, do not ask broad clarification first. Make a best recommendation, ask for approval, then act.

## Run state contract
After approval, create `.tink/current/` with these files before doing deeper work:

- `plan.md`: goal, selected harnesses, assumptions, scope, out-of-scope, next steps
- `checks.md`: done criteria, verification commands, evidence required before final
- `steps.json`: machine-readable step list with `pending`, `in_progress`, `done`, or `blocked`
- `notes.md`: short working notes, failures, last safe point, recovery actions
- `answers.md`: user answers or inferred defaults used for this run

Also append a compact completed-run record to `.tink/runs/YYYY-MM-DD-HHMM-<slug>.md` at the end when the task finishes. Do not store secrets, raw logs, full diffs, or one-off private context.

## Procedure
1. Read `.tink/harnesses/index.json` first. Do not read every harness.
2. Read small memory files if present:
   - `.tink/memory/mistakes.md`
   - `.tink/memory/preferences.md`
   - `.tink/memory/lessons.md`
3. Classify the task:
   - code change
   - bug fix
   - research
   - review
   - docs
   - ship/release
   - new pattern not covered yet
4. Pick the best existing harness set, usually 1-3 and max 4.
5. If no existing harness fits, draft a small new harness for this run instead of forcing a bad fit.
6. Ask for selection-style approval before non-trivial work. Enter should accept the recommended option when the host supports it.
7. After approval, read only the selected harness files.
8. Create `.tink/current/` files from the run state contract.
9. Execute the first safe step immediately:
   - inspect relevant files,
   - run a read-only diagnostic,
   - draft the first artifact,
   - or reproduce the issue.
10. Keep `steps.json` and `notes.md` current as work progresses.
11. Before final, verify `checks.md` and report evidence.
12. If the task exposed a repeated mistake or reusable improvement, propose a memory or harness update. Save only after user approval.

## Approval format
Use concise, selection-oriented wording. The recommendation must include the first action Tink will perform, not only the harness name.

```text
분석했습니다.

추천:
- harness: code-change + review
- 이유: 변경 범위가 좁고, 회귀 확인이 필요합니다.
- 만들 run state: `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`
- 첫 실행: 관련 파일을 먼저 읽고 검증 명령 후보를 확정합니다.

진행할까요?
1. 승인 (권장): run state 만들고 첫 실행까지 진행
2. 조정: 다른 harness 조합 선택
3. 새 harness 초안 만들기
4. 취소
```

If a new harness is needed:

```text
기존 harness가 딱 맞지 않습니다.

새 harness 초안:
- name: customer-interview-synthesis
- purpose: 인터뷰 노트에서 반복 pain point와 제품 기회를 추출
- checks: 원문 근거, 추측 분리, 다음 액션
- 첫 실행: 입력 노트의 출처와 인터뷰 단위를 분리합니다.

진행할까요?
1. 승인 (권장): 이 초안으로 이번 작업에만 적용하고 `.tink/current/` 생성
2. 저장까지 승인: 이번 작업 후 `.tink/harnesses/`에 저장 후보로 올림
3. 조정
4. 취소
```

## `plan.md` template
```md
# Tink current run

## Goal
-

## Selected harnesses
-

## Why this harness
-

## Scope
-

## Out of scope
-

## Assumptions / answers
-

## Next steps
1.
```

## `checks.md` template
```md
# Checks

## Done means
-

## Verification
-

## Evidence to report
-

## Stop conditions
-
```

## `steps.json` template
```json
{
  "goal": "",
  "harnesses": [],
  "steps": [
    { "id": "1", "status": "in_progress", "description": "Create run state and inspect the target" }
  ]
}
```

## Meaning of `context`
When listing harnesses, define `context` once:

```text
context는 이 harness가 Claude 작업 컨텍스트를 얼마나 차지하는지입니다.
- tiny: 아주 짧음
- small: 보통 체크리스트
- large: 별도 승인 후 읽는 큰 하네스
```

## Other slash skills
Tink does not automatically wrap `/grill-me`, `/diagnose`, `/tdd`, or other slash skills. That is intentional. If needed, run `/tink:forge` first, then use the other skill output as input.

## Failure behavior
If a check fails:
- write the failure to `.tink/current/notes.md`,
- identify the last safe point,
- take one recovery action,
- update `steps.json`,
- then update the harness or memory only if the lesson is reusable and approved.

## Do not
- Do not end with a harness recommendation only.
- Do not load every harness body up front.
- Do not create memory entries without approval.
- Do not store raw logs, full diffs, secrets, or one-off task progress as reusable memory.
