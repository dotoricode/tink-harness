# 하네스 생애주기 신호

하네스 생애주기 신호는 Tink가 하네스를 계속 관찰할지, 개선할지, 정리 후보로 둘지, 겹치는 하네스와 병합 후보로 둘지 판단하는 데 도움을 준다.

스키마는 `templates/tink/schemas/harness-lifecycle.schema.json`에 둔다.

유용한 신호는 다음과 같다.

- `uses`: 하네스가 선택된 횟수.
- `successes`: 필수 검증까지 완료한 실행.
- `failures`: 필수 check 실패.
- `blocked`: check를 실행할 수 없었던 경우.
- `context_cost`: low, medium, high, unknown.

허용되는 추천은 다음과 같다.

- `keep`
- `weave`
- `frog_candidate`
- `merge_candidate`
- `observe`

추천은 제안일 뿐이다. reusable harness를 삭제, 병합, 재작성하려면 여전히 명시적인 승인이 필요하다.
