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
5. For each non-keep action, prepare an approval payload with exact files and operation type.
6. If the recommendation is `hone`, write or present a hone handoff packet before ending:
   - target harness
   - evidence
   - proposed direction
   - affected files
   - approval status
7. Ask for approval before changing files.
8. If approved, remove or merge surgically and update `.tink/harnesses/index.json`.

## Approval format
```text
Purge candidates with operation IDs:
- docs: keep. Used recently and distinct.
- op-1 ship: hone. Useful but too broad. Handoff: target=ship, direction=tighten release checks.
- op-2 old-research: delete. Files: `.tink/harnesses/old-research.md`, index entry.

진행할까요?
1. 승인: 추천안 적용
2. 일부만 적용: op ID로 선택
3. 취소
```

## Do not
- Do not delete without approval.
- Do not delete built-in harnesses only because usage data is missing.
- Do not treat missing `.tink/runs/` as proof of non-use.
- Do not apply a delete, merge, hone handoff, or index update without an operation-specific approval payload.
