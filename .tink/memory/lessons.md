# Lessons

Record reusable lessons that improve future harness choices.

Rules:
- Save only after user approval.
- Save generalized lessons, not raw transcripts.
- Keep entries short.
- Prefer harness updates when the lesson belongs inside a specific harness.
- Use compact evidence handles so future hone/purge decisions can trace the entry.

Entry shape:
```text
- [YYYY-MM-DD] kind=lesson; source=<run-id|user>; applies_to=<harness|global>; note=<one sentence>; approval=<op-id>
```

## Entries

- [2026-05-23] kind=lesson; source=run-20260523-1505-publish-verify; applies_to=global; note=공개 npm 배포 전엔 CHANGELOG `[Unreleased]`→`[해당 버전]` 병합을 docs-consistency 체크에 명시 포함. Unreleased 누락은 사용자에게 거짓 changelog 전달.; approval=op-20260523-changelog-honesty
- [2026-05-23] kind=lesson; source=run-20260523-1505-publish-verify; applies_to=global; note=글로벌 npm/CLI 패키지의 기본 언어를 단일 로케일(예: ko)로 하드코딩하면 비해당 언어 사용자에게 첫인상이 깨진다. LANG/LANGUAGE/LC_ALL env auto-detect + en fallback이 안전.; approval=op-20260523-i18n-default
- [2026-05-23] kind=lesson; source=run-20260523-1505-publish-verify; applies_to=harness:pre-publish-multi-agent-verify; note=사용자 표적 시나리오를 검증 *시작 전*에 잠그지 않으면 에이전트가 각자 다른 표적을 검증해 보고가 흩어진다. 시나리오 잠금이 멀티 에이전트 검증의 핵심 전제.; approval=op-20260523-scenario-lock
