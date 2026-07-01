---
description: Audit Korean technical document content completeness using ko-tech-doc-audit harness. Reader is fixed as onboarding junior developer.
---

# /tink:doc-audit

한국어 기술 문서 내용 완성도 감사 단축 커맨드. `ko-tech-doc-audit` 하네스를 직접 호출한다.

고정 기본값:
- 독자: 온보딩 신입 개발자 (변경 불가)
- 페르소나: 한국어 기술 문서 편집자 (기본)

사용법: /tink:doc-audit [문서 경로] ["작업 설명"]

이 명령을 받으면 /tink:cast를 ko-tech-doc-audit 하네스로 실행한다.
Ask first의 "독자" 항목은 "온보딩 신입 개발자"로 이미 답한 것으로 처리하며
.tink/current/answers.md에 자동 기록한다.
나머지 항목(페르소나, 산출물 형태)은 기본값 또는 인자에서 추론한다.

$ARGUMENTS

