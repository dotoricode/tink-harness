# ADR 0001: Language and command naming policy

## Status

Accepted

## Context

Tink is used through Claude Code slash commands and project files. Some names need to remain stable for command invocation, filenames, and harness IDs. At the same time, Korean users should not have to understand product-team English terms before using Tink.

The trade-off is between stable English identifiers and clear Korean product language.

## Decision

Keep slash command names in English, drawn from the knitting metaphor (뜨개질):

- `cast` (코잡기, Cast on — the first step that sets the foundation)
- `frog` (풀시오, Frogging — ripping out to start fresh)
- `weave` (실오라기 정리, Weave in — securing loose ends to finish the work)

Keep built-in harness IDs and filenames in English for compatibility and stable references.

Use Korean-first terminology with an English parenthetical for Korean user-facing prose and glossary entries. Examples:

- 하네스 (Harness)
- 실행 상태 (Run State)
- 컨텍스트 사용량 (Context Footprint)
- 작업 맥락 (Work Context)

English-primary documentation may remain English, but Korean examples, prompts, and explanations should use the Korean-first form on first mention.

## Consequences

- Command usage stays stable across languages.
- Korean users see clearer product language in prompts and examples.
- Some documents intentionally mix English identifiers with Korean explanations.
- Tests should protect the command names and the Korean-first terminology rule for Korean-facing text.
