# /tiny:fix

Improve a harness after a repeated failure.

## Procedure
1. Identify the repeated failure.
2. Find the harness that should have prevented it.
3. Propose one short change.
4. Ask for approval.
5. After approval, update the harness and `.tiny/memory/mistakes.md`.
6. Keep the fix narrow.

## Report format
```text
반복 실수를 확인했습니다.

개선 제안:
- bug-fix 하네스의 Checks에 "재현 없이 수정하지 않기"를 추가

저장할까요?
```
