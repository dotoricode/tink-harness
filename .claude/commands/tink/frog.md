---
description: Propose unused or redundant harness cleanup without deleting automatically.
---

# /tink:frog

Find harnesses that are probably unused or redundant, then ask before removing them.

## Purpose
Keep Tink small. A large harness set defeats the point.

## Interaction policy
Always call the `AskUserQuestion` tool for choice prompts. Do not render `❯` text format. Do not ask the user to type a number inline.

Map prompt content to `AskUserQuestion` fields:
- `question`: the full question text
- `header`: max 12-character tag (e.g. "진행 방식", "정리 방식")
- `label`: 1–5 word option name. Add "(권장)" if recommended.
- `description`: explanatory text for the option

Use Korean field values when `.tink/config.json` language is `ko` or `auto` with Korean input; use English otherwise.

## Procedure
1. Read `.tink/harnesses/index.json`.
1b. Prepare the harness health summary:
   - If `.tink/tools/generate-harness-lifecycle-summary.mjs` exists, run `node .tink/tools/generate-harness-lifecycle-summary.mjs` from the repo root before ranking candidates.
   - If the generator is missing, continue with the compact evidence below and say the health summary is unavailable.
   - Treat the generated `.tink/maintenance/harness-lifecycle.json` as a report, not as approval or reusable memory.
2. Check compact evidence if available:
   - `.tink/runs/` summaries
   - `.tink/maintenance/ledger.jsonl`
   - `.tink/maintenance/weave-queue.json`
   - `.tink/maintenance/harness-lifecycle.json` or another lifecycle summary that follows `.tink/schemas/harness-lifecycle.schema.json`
   - `.tink/rules/index.json`
   - references in memory files
   - recent git history touching harness files as weak context only
2b. Check `.tink/runs/` accumulation against TTL config:
   - Count files in `.tink/runs/`
   - Find the oldest file by its date prefix
   - If count exceeds `config.runs_ttl_count` (default: 20) OR oldest file is more than `config.runs_ttl_days` (default: 30) days before today:
     → Include a "runs/ 정리 후보" section in the frog output alongside harness candidates
     → Propose moving files outside the TTL window to `.tink/archive/` (not deletion)
     → Apply the same approval rules: show an operation-specific payload with op ID, files, and rollback path
     → If `.tink/archive/` does not exist, include creating it in the operation payload
   - Do not recommend archiving the most recent `runs_ttl_count` files regardless of age.
3. Treat `.tink/current/notes.md` as weak evidence unless it is clearly from the same active conversation. If uncertain, label it `stale current candidate`.
4. Grade evidence before recommending action:
   - strong: multiple run or ledger records show non-use, repeated rejection, replacement, or accepted alternative
   - medium: one run or ledger record plus clear overlap or memory evidence
   - weak: static index, git-only evidence, stale current notes, or model judgment
   If a lifecycle summary is present, treat it as a health summary, not as authority. Use its `confidence`, `evidence_grade`, `evidence_handles`, and `safe_next_action` to explain the recommendation. A low-confidence or weak lifecycle entry must default to `keep`, `observe`, or `needs evidence`.
   Sort lifecycle-backed candidates first by evidence strength, then by recommendation: `frog_candidate`, `merge_candidate`, `weave`, `observe`, `keep`.
5. Identify candidates:
   - never used with strong evidence
   - not used recently with strong evidence
   - overlaps strongly with another harness
   - too broad to guide behavior
   - repeatedly ignored during `/tink:cast`
6. For each candidate, show evidence grade and recommendation:
   - keep
   - merge into another harness
   - delete
   - rewrite via `/tink:weave`
6b. If `.tink/rules/index.json` exists, also inspect rule quality:
   - keep: concrete `when`, `reason`, and useful `checks` or `include_paths`
   - rewrite: too broad, unclear reason, or missing verification
   - split: one rule mixes unrelated paths, tasks, or risks
   - merge: multiple rules cover the same `when`, `include_paths`, and `checks`
   - needs evidence: weak or no run, ledger, friction, or user-correction evidence
   Prefer keep, rewrite, split, merge, or needs evidence before any removal proposal.
   Report rule recommendations separately from harness recommendations.
7. Only strong evidence may recommend `delete`. Medium evidence may recommend `merge` or `hone`. Weak evidence must default to `keep` or `needs evidence`.
   Lifecycle recommendations follow the same rule: `frog_candidate` means "prepare a cleanup review," not "delete." Deletion, archive, merge, harness edit, rule update, and memory save still need the normal approval payload.
8. For each non-keep action, prepare an operation-specific approval payload with exact files, op ID, evidence handles, and rollback.
9. If the recommendation is `weave`, write or present a weave handoff packet and, after approval, add it to `.tink/maintenance/weave-queue.json`:
   - id
   - target harness
   - evidence
   - proposed direction
   - affected files
   - approval status
10. Ask for approval before changing files.
11. If approved, remove or merge surgically, update `.tink/harnesses/index.json`, and append the approval/result to `.tink/maintenance/ledger.jsonl`.

## Approval format
```text
Purge candidates with operation IDs:
- docs: keep. Evidence grade=strong. Used recently and distinct.
- op-1 ship: hone. Evidence grade=medium. Handoff: target=ship, direction=tighten release checks.
- old-research: needs evidence. Evidence grade=weak. Static index only, so no delete recommendation.

? 진행할까요?
❯ 1. 승인 — 추천안 적용
  2. 일부만 적용 — op ID로 선택
  3. 취소
```

## Do not
- Do not delete without approval.
- Do not delete built-in harnesses only because usage data is missing.
- Do not treat missing `.tink/runs/` as proof of non-use.
- Do not recommend delete from weak evidence.
- Do not apply a delete, merge, weave handoff, or index update without an operation-specific approval payload.
