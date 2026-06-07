# 컨텍스트 변화 리뷰

컨텍스트 변화 리뷰는 작업 중 선택된 context가 어떻게 바뀌었는지 기록한다.

예시 fixture는 `tests/fixtures/current-run/context-diff.json`이다.

기록할 내용은 다음과 같다.

- 선택된 context에 추가되거나 제거된 path
- 추가되거나 제거된 signal ref
- 새 항목이 왜 관련 있어졌는지
- 무엇이 계속 제외되었는지

이것은 run evidence다. 새 command도 아니고, watcher도 아니고, generated index도 아니며, hidden runtime cache도 아니다.
