# Context Threshold Status로 90% 달성 근거 정리

## 문제

current-run fixture와 run-history rollup은 각각 존재하지만, 여섯 지표가 90% 이상인지 한곳에서 보기 어렵다. 리뷰자는 current run 점수, rollup 평균, rollup 최저점을 다시 대조해야 한다.

## 해결

- `tests/fixtures/maintenance/context-threshold-status.json`에 여섯 지표의 current-run 점수, rollup 평균, rollup 최저점을 함께 기록했다.
- `tests/test_templates.py`가 이 상태판을 기존 fixture 두 개에서 다시 계산해 검증하도록 했다.
- `docs/context-threshold-status.ko.md`와 영어 companion 문서를 추가해 90% 달성 범위와 한계를 설명했다.
- README에는 본문을 늘리지 않고 관련 문서 링크만 추가했다.

## 검증

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`

## 참고

- 새 public command를 추가하지 않았다.
- `tink index`, watcher, generated cache, hidden runtime index를 추가하지 않았다.
- Sentry와 release evidence bundling은 포함하지 않았다.
- 현재 근거는 production telemetry가 아니라 repository fixture와 대표 run-history fixture다.
