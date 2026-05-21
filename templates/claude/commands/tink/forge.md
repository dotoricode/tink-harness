# /tink:forge

Forge the right harness for the task, apply it, and capture reusable learning.

`forge` is the main Tink command. Use it before non-trivial work.

## Philosophy
Tink should not feel like choosing from a toolbox manually. It should:
1. understand the task,
2. choose or build the smallest useful harness,
3. apply it with approval,
4. prevent repeated mistakes,
5. remember only reusable lessons after approval.

## Procedure
1. Read `.tink/harnesses/index.json` first. Do not read every harness.
2. Classify the task:
   - code change
   - bug fix
   - research
   - review
   - docs
   - ship/release
   - new pattern not covered yet
3. Pick the best existing harness set, usually 1-3 and max 4.
4. If no existing harness fits, propose a small new harness draft instead of forcing a bad fit.
5. Ask for selection-style approval before starting. Enter should accept the recommended option when the host supports it.
6. After approval, read only the selected harness files.
7. Create `.tink/current/` with:
   - `plan.md`
   - `checks.md`
   - `steps.json`
   - `notes.md`
   - `answers.md` if the user answered questions for this run
8. Work inside the selected or newly drafted harness.
9. Before final, verify `checks.md` and report evidence.
10. If the task exposed a repeated mistake or reusable improvement, propose a memory or harness update. Save only after user approval.

## Approval format
Use concise, selection-oriented wording:

```text
분석했습니다.

추천:
- 기존 harness: code-change + review
- 이유: 변경 범위가 좁고, 문구 변경은 동작에 영향을 줄 수 있어 회귀 확인이 필요합니다.

진행할까요?
1. 승인 (권장): 이 harness로 바로 시작
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

진행할까요?
1. 승인 (권장): 이 초안으로 이번 작업에만 적용
2. 저장까지 승인: 이번 작업 후 `.tink/harnesses/`에 저장
3. 조정
4. 취소
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
- say what failed,
- identify the last safe point,
- take one recovery action,
- then update the harness only if the lesson is reusable and approved.
