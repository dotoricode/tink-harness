---
description: Inspect available Tink harnesses and recent usage signals.
---

# /tink:list

List available Tink harnesses without loading every harness body.

## Procedure
1. Read `.tink/harnesses/index.json`.
2. If present, read only compact usage metadata from `.tink/runs/`, `.tink/maintenance/ledger.jsonl`, `.tink/maintenance/hone-queue.json`, or `.tink/current/notes.md`; do not load raw logs.
3. Treat `.tink/current/` as weak evidence unless it is clearly from the same active conversation. If context is uncertain, label it `stale current candidate`, not proof of usage.
4. Show harnesses in a compact list:
   - name
   - purpose
   - context footprint
   - last used or unknown
   - signal: active / quiet / candidate for purge / unknown
   - evidence: compact run IDs, ledger op IDs, or `none`
5. If there is no run, ledger, memory, or active-current evidence for a harness, use `unknown`. Do not call it `quiet` or `candidate for purge` from the static index alone.
6. Explain `context` once if the user has not seen it:

```text
context는 이 harness가 Claude 작업 컨텍스트를 얼마나 차지하는지입니다.
```

## Output style
Use bullets, not tables.

## Do not
- Do not read every harness body by default.
- Do not infer non-use from missing evidence.
- Do not remove anything. Use `/tink:purge` for removal candidates.
