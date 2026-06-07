# 메모리 결정 계층

Tink memory는 결정된 내용과 제안을 분리해야 한다.

설치되는 memory 폴더는 다음과 같다.

- `.tink/memory/approved/`: 로드할 수 있는 승인된 reusable memory.
- `.tink/memory/candidate/`: 아직 rule처럼 로드하면 안 되는 memory 후보.
- `.tink/memory/rejected/`: 사용자가 거절했거나 대체한 제안.
- `.tink/memory/evidence/`: approved memory가 왜 생겼는지 설명하는 짧은 근거 handle.

기존 `mistakes.md`, `preferences.md`, `lessons.md` 파일은 계속 호환된다. 새 흐름에서는 구분이 중요할 때 decision folder를 우선 사용한다.

secret, raw log, full diff, private payload, 일회성 작업 진행 상황은 저장하지 않는다. reusable memory 저장은 항상 별도 승인이 필요하다.
