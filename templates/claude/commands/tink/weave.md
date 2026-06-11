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
   If `.tink/maintenance/friction.jsonl` exists, read only compact recent entries and count repeated `check_failed`, `check_skipped`, `blocked`, gate denial, or rollback events. Repeated friction can justify a harness edit, rule graph update, or opt-in guard candidate.
   If `.tink/tools/generate-harness-lifecycle-summary.mjs` exists, run `node .tink/tools/generate-harness-lifecycle-summary.mjs` from the repo root before ranking candidates. The generated `.tink/maintenance/harness-lifecycle.json` is a report, not approval or reusable memory.
   If `.tink/maintenance/harness-lifecycle.json` or another summary following `.tink/schemas/harness-lifecycle.schema.json` exists, read it as a harness health summary. Prefer entries with recommendation `weave`, high or medium confidence, and concrete `evidence_handles`. Low-confidence entries should stay as observation unless the user explicitly asks to act on them.
1b. Scan promotion candidates (임시초안 승격) - weave promotes as well as improves:
   - **Run-only draft harnesses**: read recent `.tink/runs/*.md` for recorded draft names and domain rules. If the same draft (same name, or clearly the same domain rules) appears in 2+ run records, propose promoting it into `.tink/harnesses/<name>.md` plus an `index.json` entry with `kind: "synthesized"`. Score it with the harness synthesis contract (specificity, actionability, verifiability, reuse likelihood, context cost) before proposing.
   - **Candidate memory**: read `.tink/memory/candidate/` when it exists. If 2+ runs, ledger, or friction entries support one candidate, propose moving it to `.tink/memory/approved/` as one compact file, with evidence handles recorded under `.tink/memory/evidence/`. If the user declines, move it to `.tink/memory/rejected/` with a one-line reason so it is not proposed again.
   - Every promotion is a reusable-state write: it always goes through the Save Gate approval payload and is appended to `.tink/maintenance/ledger.jsonl`. Without 2+ independent evidence handles, present the candidate as an observation, not a proposal.
2. Identify one or a few active harnesses to improve using real failures and evidence. When invoked without a specific target, the health summary's `weave` recommendations plus the promotion scan above form the default agenda:
   - repeated mistakes
   - user corrections
   - failed checks
   - repeated friction entries
   - confusing approval prompts
   - too much context footprint
   - missing done criteria
   Rank lifecycle-backed `weave` candidates ahead of raw queue counts when they cite concrete evidence handles and medium or high confidence. Use raw queue and friction counts to break ties.
3. Require concrete evidence handles before proposing a save:
   - run record path or run ID
   - current notes path when same-conversation certainty exists
   - failed check name
   - friction entry timestamp/type
   - compact user correction snippet
   - purge handoff ID from `.tink/maintenance/weave-queue.json`
   - lifecycle summary evidence handle plus the source run, ledger, queue, or friction entry it points to
4. Classify the evidence as repeated or single-run. Single-run evidence may suggest a trial edit, but should not become broad policy unless the user explicitly approves.
5. Explain why the change belongs in the harness rather than `.tink/memory/` or `.tink/current/notes.md`.
6. Decide the right destination:
   - harness edit: a procedure, ask-first question, check, or recovery step should change;
   - rule graph update: a contract fact should select a harness, check, or guard candidate earlier;
   - opt-in hook guard candidate: the same failure should be blocked by `PreToolUse`, `PostToolUse`, or `Stop` after user approval;
   - friction logging update: the run should record a missing evidence pattern more clearly.
7. Read only the target harness files and `.tink/rules/index.json` when the evidence points to rule selection.
   For rule graph updates, run a structural gate before proposing a save:
   - duplicate: does an existing rule already cover the same `when`, `include_paths`, or `checks`?
   - breadth: is the rule too broad, such as "always check docs", instead of tied to concrete paths, task facts, or risks?
   - evidence: does the proposal cite a run, failed check, user correction, or friction entry?
   - verification: does the rule add a check or explain why no check is needed?
   - compatibility: does the rule make sense for both Claude Code and Codex, and for macOS and Windows?
   - portability: does it avoid OS-specific shell syntax unless alternatives are listed?
8. Propose small edits:
   - clearer when-to-use trigger
   - better ask-first question
   - tighter checks
   - smaller context footprint
   - explicit failure recovery
   - rule graph node or edge
   - opt-in guard template
9. Show an approval payload: destination files, exact patch summary, evidence handles, repeated vs single-run classification, why reusable, context-cost delta, sensitive content excluded, rollback path.
   For rule graph updates, also show structural gate results: duplicate, breadth, evidence, verification, compatibility, and portability.
10. Ask for approval before saving.
11. Apply surgical changes, update index metadata or `.tink/rules/index.json` if needed, mark the weave queue item status, and append the approval/result to `.tink/maintenance/ledger.jsonl`.

## Approval format
```text
Hone target:
- ship

Evidence:
- source: `.tink/runs/2026-05-22-release-pipeline.md`
- classification: repeated
- observed failure: verification command was unclear in two runs

Approval payload:
- operation: weave
- destination files: `.tink/harnesses/ship.md`, `.tink/harnesses/index.json` if metadata changes, `.tink/rules/index.json` if routing changes
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

Promotion proposal format (run-only draft → saved harness):

```text
승격 후보:
- `customer-interview-synthesis` (임시 초안, 2개 run에서 반복 사용)

Evidence:
- `.tink/runs/2026-06-01-1010-interview-analysis.md`
- `.tink/runs/2026-06-09-1430-interview-round2.md`
- classification: repeated

Approval payload:
- operation: harness-create (promotion)
- destination files: `.tink/harnesses/customer-interview-synthesis.md`, `.tink/harnesses/index.json`
- synthesis score: specificity 4 · actionability 4 · verifiability 3 · reuse 4 · context cost tiny
- ledger: append op ID to `.tink/maintenance/ledger.jsonl`
- rollback: delete the file and index entry, or rerun `/tink:frog`

? 진행할까요?
❯ 1. 승인 — 하네스로 승격 저장
  2. 조정
  3. 거절 — 다시 제안하지 않도록 기록
```

## Do not
- Do not rewrite a harness from scratch unless the user asks.
- Do not add broad principles that do not change behavior.
- Do not save one-off task progress as harness knowledge.
- Do not propose a harness edit without evidence handles.
- Do not register enforcement hooks by default. Save guard templates as opt-in candidates unless the user explicitly approves installation.
