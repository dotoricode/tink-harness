---
description: Inspect available Tink harnesses and recent usage signals.
---

# /tink:list

List available Tink harnesses without loading every harness body.

## Procedure
1. Read `.tink/harnesses/index.json`.
2. If present, read only compact usage metadata from `.tink/runs/` or `.tink/current/notes.md`; do not load raw logs.
3. Show harnesses in a compact list:
   - name
   - purpose
   - context footprint
   - last used or unknown
   - signal: active / quiet / candidate for purge
4. Explain `context` once if the user has not seen it:

```text
context는 이 harness가 Claude 작업 컨텍스트를 얼마나 차지하는지입니다.
```

## Output style
Use bullets, not tables.

## Do not
- Do not read every harness body by default.
- Do not remove anything. Use `/tink:purge` for removal candidates.
