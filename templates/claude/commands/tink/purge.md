# /tink:purge

Find harnesses that are probably unused or redundant, then ask before removing them.

## Purpose
Keep Tink small. A large harness set defeats the point.

## Procedure
1. Read `.tink/harnesses/index.json`.
2. Check usage signals if available:
   - `.tink/runs/` summaries
   - `.tink/current/notes.md`
   - references in memory files
   - recent git history touching harness files
3. Identify candidates:
   - never used
   - not used recently
   - overlaps strongly with another harness
   - too broad to guide behavior
   - repeatedly ignored during `/tink:forge`
4. For each candidate, show evidence and a recommendation:
   - keep
   - merge into another harness
   - delete
   - rewrite via `/tink:hone`
5. Ask for approval before changing files.
6. If approved, remove or merge surgically and update `.tink/harnesses/index.json`.

## Approval format
```text
Purge candidates:
- docs: keep. Used recently and distinct.
- ship: hone. Useful but too broad.
- old-research: delete. No index references and no recent use signal.

진행할까요?
1. 승인: 추천안 적용
2. 일부만 적용
3. 취소
```

## Do not
- Do not delete without approval.
- Do not delete built-in harnesses only because usage data is missing.
- Do not treat missing `.tink/runs/` as proof of non-use.
