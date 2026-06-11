# Contributing to Tink

Thanks for helping make Tink better. This guide is short on purpose — most rules exist to keep the three install surfaces (Claude Code plugin, npx standalone, Codex skills) in sync.

한국어 요약은 각 절 아래에 있습니다.

## Dev setup

```bash
git clone https://github.com/dotoricode/tink-harness
cd tink-harness
npm test   # python tests/test_templates.py + node --check bin/install.js
```

Requirements: Node.js 18+, Python 3.10+. No build step — templates are plain files.

> 개발 환경: Node 18+, Python 3.10+. 빌드 단계 없음. `npm test` 하나로 전체 검증.

## The three-copy rule

When you edit a command file (`commands/<name>.md`), apply the same change to all three copies:

1. `commands/<name>.md` (plugin source)
2. `templates/claude/commands/tink/<name>.md` (npx install template)
3. `.claude/commands/tink/<name>.md` (this repo's own install)

Tests fail if the copies drift.

> 명령 파일 수정 시 세 곳을 모두 동일하게 고쳐야 합니다. 어긋나면 테스트가 실패합니다.

## Version bumps

A release touches three version fields together: `package.json`, `package-lock.json`, and `.claude-plugin/plugin.json`, plus `VERSIONING.md` and a `CHANGELOG.md` entry. Tests assert they stay consistent.

> 버전 올릴 때 세 JSON + VERSIONING.md + CHANGELOG.md를 함께 갱신하세요.

## Pull requests

- Describe changes as **problem / solution / verification** (문제 / 해결 / 검증) — the PR template scaffolds this.
- Run `npm test` before pushing; CI runs the same suite on macOS and Windows targets.
- New behavior that affects installs should consider both Claude Code and Codex, and both macOS and Windows (`docs/compatibility-policy.md`).
- Keep Tink's core promise intact: suggestions only — reusable-state changes (harness edits, memory, deletion) always go through explicit approval gates.

## Reporting issues

Use the issue templates. For dashboard problems, include your OS, how you opened the report (file:// or local server), and the installed version (`npm view tink-harness version` vs your `.tink/tools/` state).
