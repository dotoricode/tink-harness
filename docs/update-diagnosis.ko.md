# 업데이트 진단

업데이트 진단은 새 command를 추가하지 않고 update 문제를 더 쉽게 확인하기 위한 흐름이다.

이 흐름은 `/tink:update`, `$tink:update`, troubleshooting 문서, verification recipe 안에서 사용한다.

확인할 항목은 다음과 같다.

- 기대한 install surface: Claude Code, Codex, 또는 둘 다
- 실제 command와 skill 파일
- 보존된 user-modified file
- 제거된 legacy Codex skill 경로
- 누락된 schema 또는 maintenance file
- 최종 `Update Result Summary`

다음 행동은 보통 `docs/update-verification-recipe.ko.md` 또는 `docs/update-troubleshooting.ko.md` 같은 가장 작은 recipe로 안내한다.
