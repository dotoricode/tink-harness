# /tiny:use

Use Tink before starting a non-trivial task.

## Procedure
1. Read `.tiny/harnesses/index.json` first. Do not read every harness.
2. Classify the task and suggest at most four harnesses:
   - Primary: the main work type
   - Safety: what prevents mistakes
   - Finish: what proves done
   - Optional: only if clearly useful
3. Ask for approval in a short message.
4. After approval, read only the selected harness files.
5. Create `.tiny/current/` with:
   - `plan.md`
   - `checks.md`
   - `steps.json`
   - `notes.md`
   - `answers.md` if the user answered setup questions for this run
6. Follow the current harness while working.
7. Before final, verify `checks.md` and report evidence.

## Approval format
```text
분석했습니다.

추천 하네스:
- bug-fix
- code-change

이유:
- 재현 확인이 필요합니다.
- 최소 수정과 회귀 검증이 필요합니다.

적용할까요?
```

## Failure behavior
If a check fails, do not make excuses. State:
- what failed
- last safe point
- next single action

Then tink back one step.
