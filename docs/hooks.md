# Hooks

Tink may use a Claude Code `UserPromptSubmit` hook as an optional recommendation layer. When the user selects the hook component, the installer registers it in Claude Code settings for the chosen repo/global scope.

The hook should:

- read the user prompt
- stay lightweight and prompt-first
- suggest when `/tink:forge` would help
- stay advisory-only
- keep a hook recommendation to one line or shorter
- print at most one advisory line

The hook should not:

- auto-apply harnesses
- save memory without approval
- run commands without approval
- load all harnesses by default
- intercept other slash skills such as `/grill-me`

Default recommendation: keep hooks off and use `/tink:forge` directly until the hook behavior is clearly useful. If the user turns the hook on, it must be actually registered, not only copied as a template.

## Terms

- 실행 중 보정 (Inline Calibration): `/tink:forge` 안에서 하는 사용 습관 기반 제안. 기본 방식이다.
- 자동 제안 (Hook Recommendation): optional hook을 명시적으로 켰을 때 Claude Code `UserPromptSubmit`에 등록되어 일반 프롬프트 앞에서 나오는 참고용 추천. 짧고, 자동 적용이나 자동 저장을 하지 않는다.
