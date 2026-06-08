# Codex-only update에서 repo-local Claude surface 정리

## 문제

다른 repo에서 `npx tink-harness@latest update` 후 Codex skill picker에 `Source Command Tink Frog/List/...`와 넓은 `Tink` 항목이 보일 수 있었음.

이 항목들은 Codex action skill이 아니라 repo-local `.claude/commands/tink/*.md`와 `.claude/skills/tink/SKILL.md`가 Codex에 함께 노출된 것이었음. 사용자는 Codex용 `$tink:*` action skill만 기대하기 때문에 설치가 잘못된 것처럼 보일 수 있었음.

## 해결

- Codex-only install/update에서는 repo-local Tink Claude command와 Claude skill을 정리하도록 installer를 보강했음.
- `tink-cast`, `tink-verify`, `tink-list`, `tink-frog`, `tink-weave`, `tink-setup`, `tink-update` Codex action skill은 그대로 유지함.
- Claude Code와 Codex를 둘 다 선택한 `all` surface에서는 repo-local Claude command가 남을 수 있음을 troubleshooting 문서에 명확히 적었음.
- update verification recipe에 Codex-only 기대 상태를 추가했음.

## 검증

- `npm test`
- `git diff --check`
- `npm pack --dry-run --json`

## 참고

- 새 public command를 추가하지 않았음.
- `tink index`, watcher, generated cache, hidden runtime index를 추가하지 않았음.
- Sentry와 release evidence bundling은 포함하지 않았음.
- 다른 repo에서 바로 적용하려면 npm publish가 필요함.
