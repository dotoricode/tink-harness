# /tink:hone

Improve harnesses that are actually being used.

## Purpose
Tink should get sharper through use, not grow randomly.

## Procedure
1. Read `.tink/harnesses/index.json`.
2. Identify one or a few active harnesses to improve using real failures and evidence:
   - repeated mistakes
   - user corrections
   - failed checks
   - confusing approval prompts
   - too much context footprint
   - missing done criteria
3. Read only the target harness files.
4. Propose small edits:
   - clearer when-to-use trigger
   - better ask-first question
   - tighter checks
   - smaller context footprint
   - explicit failure recovery
5. Ask for approval before saving.
6. Apply surgical changes and update index metadata if needed.

## Approval format
```text
Hone target:
- code-change

Why:
- 자주 쓰이지만 검증 명령을 매번 다시 정리하고 있습니다.

Proposed improvement:
- Checks 섹션에 “검증 명령과 실패 시 마지막 안전 지점 기록” 추가

진행할까요?
1. 승인: 이 개선 저장
2. 조정
3. 취소
```

## Do not
- Do not rewrite a harness from scratch unless the user asks.
- Do not add broad principles that do not change behavior.
- Do not save one-off task progress as harness knowledge.
