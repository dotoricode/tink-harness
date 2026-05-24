---
description: Improve active harnesses based on real use, failures, and corrections.
---

# /tink:weave

Improve harnesses that are actually being used.

## Purpose
Tink should get sharper through use, not grow randomly.

## Interaction policy
Always call the `AskUserQuestion` tool for choice prompts. Do not render `❯` text format. Do not ask the user to type a number inline.

Map prompt content to `AskUserQuestion` fields:
- `question`: the full question text
- `header`: max 12-character tag (e.g. "진행 방식", "저장 여부")
- `label`: 1–5 word option name. Add "(권장)" if recommended.
- `description`: explanatory text for the option

Use Korean field values when `.tink/config.json` language is `ko` or `auto` with Korean input; use English otherwise.

## Procedure
1. Read `.tink/harnesses/index.json`. If `.tink/maintenance/weave-queue.json` exists, read it to find:
   - Handoff packets from `/tink:frog` (entries where `auto` is absent or false)
   - Auto signals from completed runs (entries where `auto: true`)
   Count auto signals per harness: `check_failed` signals count as 2, all other outcomes count as 1. Use this frequency to rank improvement candidates — harnesses with the highest signal count should be improved first. If invoked from `/tink:frog`, also read the purge output and `.tink/current/notes.md` for the weave handoff packet.
2. Identify one or a few active harnesses to improve using real failures and evidence:
   - repeated mistakes
   - user corrections
   - failed checks
   - confusing approval prompts
   - too much context footprint
   - missing done criteria
3. Require concrete evidence handles before proposing a save:
   - run record path or run ID
   - current notes path when same-conversation certainty exists
   - failed check name
   - compact user correction snippet
   - purge handoff ID from `.tink/maintenance/weave-queue.json`
4. Classify the evidence as repeated or single-run. Single-run evidence may suggest a trial edit, but should not become broad policy unless the user explicitly approves.
5. Explain why the change belongs in the harness rather than `.tink/memory/` or `.tink/current/notes.md`.
6. Read only the target harness files.
7. Propose small edits:
   - clearer when-to-use trigger
   - better ask-first question
   - tighter checks
   - smaller context footprint
   - explicit failure recovery
8. Show an approval payload: destination files, exact patch summary, evidence handles, repeated vs single-run classification, why reusable, context-cost delta, sensitive content excluded, rollback path.
9. Ask for approval before saving.
10. Apply surgical changes, update index metadata if needed, mark the weave queue item status, and append the approval/result to `.tink/maintenance/ledger.jsonl`.

## Approval format
```text
Hone target:
- code-change

Evidence:
- source: `.tink/runs/2026-05-22-code-change.md`
- classification: repeated
- observed failure: verification command was unclear in two runs

Approval payload:
- operation: weave
- destination files: `.tink/harnesses/code-change.md`, `.tink/harnesses/index.json` if metadata changes
- context-cost delta: neutral or smaller
- ledger: append op ID to `.tink/maintenance/ledger.jsonl`
- rollback: revert this patch or rerun `/tink:weave` with the previous trigger

Proposed improvement:
- Checks 섹션에 “검증 명령과 실패 시 마지막 안전 지점 기록” 추가

? 진행할까요?
❯ 1. 승인 — 이 개선 저장
  2. 조정
  3. 취소
```

## Do not
- Do not rewrite a harness from scratch unless the user asks.
- Do not add broad principles that do not change behavior.
- Do not save one-off task progress as harness knowledge.
- Do not propose a harness edit without evidence handles.
