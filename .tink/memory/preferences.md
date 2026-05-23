# Preferences

Record stable project or user preferences that reduce repeated steering.

Rules:
- Save only after user approval or explicit instruction.
- Use short declarative bullets.
- Do not store temporary task state.
- Use compact evidence handles when the preference came from a run.

Entry shape:
```text
- [YYYY-MM-DD] kind=preference; source=<run-id|user>; applies_to=<harness|global>; note=<one sentence>; approval=<op-id|explicit-user>
```

## Entries

- [2026-05-23] kind=preference; source=user; applies_to=global; note=설명할 때 전문 용어 대신 쉬운 일상 언어 사용. 추상적 개념에는 구체적 예시 보완.; approval=op-20260523-plain-language
- [2026-05-23] kind=preference; source=user; applies_to=global; note=.tink/ 내부 파일(current, runs, memory, config) 변경 시 개별 narration 생략. 끝에 한 줄로 요약.; approval=op-20260523-tink-internal-quiet
