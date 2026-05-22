---
description: Choose, build, or synthesize the right harness for the current task.
---

# /tink:forge

Forge the right harness for the task, run it, and capture reusable learning.

`forge` is the main Tink command. Use it before non-trivial work.

## Product promise
Tink is not a harness recommendation list. It must leave the user with an active run state and a concrete next action.

Tink should:
1. understand the task,
2. choose the smallest effective harness/tool set,
3. replace heavy harnesses when the current stage or token budget makes them harmful,
4. build or synthesize a narrow harness when none fits,
5. materialize the harness as a run plan,
6. execute the first safe step after approval,
7. prevent repeated mistakes while working,
8. maintain the harness set through approved memory, hone, or purge proposals.

## Default behavior
Do not stop after saying which harness might fit.

A valid `/tink:forge` response must do one of these:
- create or update `.tink/current/` and start the harnessed work,
- ask one blocking question that is required to create `.tink/current/`, or
- cancel because the user chose not to proceed.

If the task is clear enough to classify, do not ask broad clarification first. Make a best recommendation, ask for approval, then act.

## Readiness check
Before normal classification, check whether Tink is fully initialized. If `.tink/harnesses/index.json`, `.tink/config.json`, or `.tink/memory/` is missing, do not fail and do not write anything yet. Show a short recovery prompt:

```text
Tink is not fully initialized.

1. Run /tink:setup to review or repair setup
2. Create the minimal .tink scaffold for this repo
3. Continue once with a lightweight one-run harness
4. Cancel

Reply: 1, 2, 3, or 4
```

If legacy Tiny files such as `.tiny/` or `/tiny:use` instructions are present, treat them as old state. Explain that `/tink:forge` replaces `/tiny:use`, and offer to migrate useful `.tiny/harnesses/`, `.tiny/config.json`, and `.tiny/memory/` into `.tink/` only after approval. Never tell the user to run `/tiny:use`.

Do not advertise Enter as approval unless the host provides a real selectable UI where Enter actually confirms the highlighted option. In plain text prompts, ask for `1`, `2`, `3`, or `4`.

## Grill Gate
Before committing to `.tink/current/`, run Grill Gate exactly once. Grill Gate is an internal quality gate inside `/tink:forge`, not a separate `/tink:grill` command and not a real subagent in v1.0.0.

Evaluate Grill Gate every time, but show it to the user only when it finds a high-impact quality or safety branch. A clean internal Grill Gate pass is not recorded.

When Grill Gate is visible, show exactly one proposal in this order: proposal, reason, choices.
1. proposal
2. reason
3. choices

Choose the one proposal by priority:
1. safety or irreversibility
2. success criteria or verification
3. goal or scope ambiguity
4. harness mismatch
5. reusable improvement opportunity

Grill Gate may change the order or method of work, but it must not change the user's goal without separate approval.

Follow `.tink/config.json` for language. If language is `auto`, use the current user message language and fall back to English only when unclear.

Soft gate choices:
- English: `Approve`, `Add requirements`, `Continue as-is`
- Korean: `승인`, `요구사항 입력`, `이대로 진행`

Hard gate choices:
- English: `Approve`, `Add requirements`, `Cancel`
- Korean: `승인`, `요구사항 입력`, `취소`

Hard gates apply when the next action is difficult or unsafe to reverse: reusable memory or harness saves, harness creation, edits, purge, hone, deleting files, removing configuration, publishing, deploying, tagging, releasing, opening a public PR, changing broad architecture or public contracts, using secrets, credentials, payments, personal data, or running destructive/external side-effect commands.

Hard gates must not offer `Continue as-is` or `이대로 진행`.

If a soft gate user chooses `Continue as-is` / `이대로 진행`, proceed with explicit assumptions and record them in `.tink/current/answers.md`.

If Grill Gate triggers, record only current-run state by default:
- `.tink/current/answers.md`: proposal, choice, explicit assumptions
- `.tink/current/notes.md`: proposal, risk, reason, follow-up needed

Do not record a clean Grill Gate pass.

## Reusable State Save Gate
Reusable State Save Gate is a separate absolute hard approval gate, not merely a Grill Gate subtype. Current-run approval does not authorize reusable-state writes.

Reusable state includes:
- `.tink/memory/*`
- `.tink/harnesses/*`
- `.tink/harnesses/index.json`
- `.tink/config.json` policy changes
- `.claude/` commands, skills, settings, or hooks
- template/plugin files that affect future installs

Before reusable-state writes, show a separate approval payload:
- operation
- destination files
- exact entry text or patch summary
- why it is reusable
- sensitive/private content excluded
- rollback or removal path

Reusable-state approval choices are `Approve`, `Add requirements`, and `Cancel`, localized when appropriate. Never offer `Continue as-is` or `이대로 진행` for reusable-state writes.

## Run state contract
After approval, create `.tink/current/` with these files before doing deeper work. `.tink/current/` is the current workbench: the one active task plan Claude should keep updating while it works. It is temporary, local runtime state, not reusable memory and not a knowledge base:

- `plan.md`: goal, selected harnesses, assumptions, scope, out-of-scope, next steps
- `checks.md`: done criteria, verification commands, evidence required before final
- `steps.json`: machine-readable step list with `pending`, `in_progress`, `done`, or `blocked`
- `notes.md`: short working notes, failures, last safe point, recovery actions
- `answers.md`: user answers or inferred defaults used for this run

Also append a compact run record to `.tink/runs/YYYY-MM-DD-HHMM-<slug>.md` when the task completes, is canceled, is blocked, or is superseded. Do not store secrets, raw logs, full diffs, or one-off private context.

## Current run lifecycle
Before creating a new `.tink/current/`, check whether one already exists:

1. No current run: create `.tink/current/` and start.
2. Same task still active in the same conversation: resume it, update `notes.md`, and continue from the next pending step.
3. `.tink/current/` exists but the conversation context is gone or uncertain: treat it as a recovery candidate, not as active truth. Even if the user says “continue” or “이어서 해”, first read `plan.md`, `checks.md`, `steps.json`, `notes.md`, and `answers.md`, show the five-line recovery summary below, then ask the user to resume, archive, replace, or cancel.
4. Different task requested: ask whether to archive/replace the old current run. Do not overwrite silently.
5. Blocked or canceled task: write a compact run record with `outcome: blocked` or `outcome: canceled`, then clear or replace `.tink/current/` after approval.
6. Superseded task: archive the old state as `outcome: superseded` before creating the new current run.

A completed or archived current run should not remain ambiguous. Either keep it only because the user explicitly chose to resume, or archive it to `.tink/runs/` and replace it. When context was lost, do not silently continue from `steps.json`; first rebuild a short human summary and get a resume/archive/replace decision.

Recovery prompt format:

```text
이전 작업 복구:
- 목표:
- 마지막 안전 지점:
- 다음 단계:
- 열린 질문:
- 검증 상태:

1. 이어가기
2. 보관하고 새 작업
3. 교체
4. 취소

답장: 1, 2, 3, 또는 4
```


## Run record schema
Each `.tink/runs/*.md` record starts with YAML frontmatter:

```yaml
---
run_id: "run-YYYYMMDD-HHMM-slug"
started_at: "YYYY-MM-DDTHH:MM:SSZ"
ended_at: "YYYY-MM-DDTHH:MM:SSZ"
outcome: completed # completed | blocked | canceled | superseded
task_summary: ""
selected_harnesses: []
actually_loaded_harnesses: []
considered_but_rejected: [] # {name, reason}
checks_result: pass # pass | fail | blocked | not_run
user_corrections: [] # compact handles only
maintenance_suggestions: [] # {op_id, type, target, evidence}
approved_saves: [] # approval op IDs from .tink/maintenance/ledger.jsonl
context_footprint: unknown # tiny | small | large | unknown
---
```

The body should be a short human summary: goal, evidence, negative signals, and next safe action if blocked.

## Maintenance evidence
When proposing memory saves, harness edits, index updates, hone, or purge, create an operation ID and cite evidence handles. Evidence handles should be compact paths such as `.tink/runs/<file>.md`, `.tink/current/notes.md`, failed check names, or user correction snippets. Do not use raw logs as evidence.

Approved reusable changes should append one JSON line to `.tink/maintenance/ledger.jsonl` with:

```json
{ "timestamp": "", "op_id": "op-...", "type": "hone|purge|memory|index-update|harness-create|harness-edit", "files": [], "evidence": [], "approval": "", "result": "applied|rejected|deferred", "rollback": "" }
```

## Procedure
1. Read `.tink/harnesses/index.json` first. Do not read every harness.
2. Read small memory files if present:
   - `.tink/memory/mistakes.md`
   - `.tink/memory/preferences.md`
   - `.tink/memory/lessons.md`
3. Classify the task:
   - code change
   - bug fix
   - research
   - review
   - docs
   - ship/release
   - new pattern not covered yet
4. Pick the best existing harness set using the context budget policy below. Prefer 1-3 harnesses, but do not use a hard cap when several tiny harnesses add useful checks without crowding context.
5. Always run the synthesis probe before finalizing the harness choice. The probe decides whether the existing harness is a strong fit, a generic fit, or no fit.
6. If no existing harness fits, load `harness-synthesis` and draft a domain-specific harness for this run instead of forcing a bad fit.
7. If an existing harness is only a generic fit and the synthesis probe has at least two yes answers, propose a run-only draft harness or domain rules alongside the built-in harness. Do not save it by default.
8. If too many tools, skills, agents, or harnesses are available, load `harness-curation` and choose the smallest effective set before loading more context.
9. If lightweight signals show a recurring operating habit, load `context-habit-calibration` only if it earns its context cost; otherwise make one advisory recommendation without loading another body.
10. If the user points to research, notes, examples, prior failures, or "what I learned today", synthesize from those inputs. Extract behavior-shaping rules and reusable procedure, not a summary.
11. Run Grill Gate once before committing to `.tink/current/`. If it triggers, show exactly one proposal before approval. Use a selectable UI only when the host really supports it. In plain text, ask the user to reply with a number; do not say Enter approves.
12. Ask for explicit approval before non-trivial work.
13. After approval, read only the selected harness files and any approved run-only draft.
14. Create `.tink/current/` files from the run state contract.
15. Execute the first safe step immediately:
   - inspect relevant files,
   - run a read-only diagnostic,
   - draft the first artifact,
   - or reproduce the issue.
16. Keep `steps.json` and `notes.md` current as work progresses.
17. Before final, verify `checks.md` and report evidence.
18. If the task exposed a repeated mistake or reusable improvement, use the Reusable State Save Gate approval payload below. Save only after separate user approval.


## Synthesis probe
Run this short probe even when a built-in harness seems usable. It prevents broad default harnesses from hiding repeatable domain workflows.

Answer yes/no:
1. Is this likely to recur in this repo, product, customer segment, release process, or personal workflow?
2. Would a domain-specific rule change the first action, the order of steps, the stop condition, or the verification evidence?
3. Is the selected built-in harness only a loose or generic fit?
4. Did the user correction, prior run note, failed check, research source, or named project context expose a reusable rule?
5. Would a one-screen draft reduce future context or repeated explanation?

Decision:
- 0-1 yes: use the selected built-in harness only. Record why no draft is needed if relevant.
- 2-3 yes: propose a run-only draft harness. It applies to this run, is written into `.tink/current/plan.md` or `notes.md`, and is not saved by default.
- 4-5 yes: propose a run-only draft now and ask whether it should become a save candidate after the run. Saving still needs the approval payload.

Run-only draft format:

```text
임시 하네스 초안 (이번 작업 전용):
- name: <specific-lowercase-name>
- why not just built-in: <one sentence>
- domain rules: <2-4 bullets that change execution>
- checks: <2-4 evidence checks>
- save policy: 이번 run에는 적용, 저장은 반복 근거와 별도 승인 후만
```

A run-only draft is not reusable memory. Do not update `.tink/harnesses/`, `index.json`, or `.tink/maintenance/ledger.jsonl` unless the user separately approves saving.

## Context budget policy
Do not use one universal harness cap. Choose by context footprint and task risk. Classify size by how much thinking and checking the harness adds, not only by file length:

- Tiny harnesses: one screen or less, one clear trigger, no extra tool chain, and one or two checks. May exceed 4 when each is directly useful. Still explain why each earns its place.
- Small harnesses: checklist-sized, one work type, a few checks, and limited recovery rules. Usually 1-4 active bodies. Add more only when the task has separate risks that need separate checks.
- Large harnesses: multi-phase, tool-heavy, research-heavy, multi-agent, or broad enough to change the whole workflow. Load one at a time and only after approval.
- Meta harnesses (`harness-curation`, `harness-synthesis`, `context-habit-calibration`): do not do the end-user task directly. They decide whether to choose, reduce, replace, create, or tune other harnesses. Count their context cost and use them to reduce or replace the active set, not to pile on top by default.
- No hard cap mode is allowed for complex tasks, but it must be explicit: state the expected context cost, why no cap is safer, and what will be unloaded or summarized first.

If the harness list feels heavy, stop and use `harness-curation` before loading more bodies.

## Approval payload for saves
This is the Reusable State Save Gate payload. Before saving memory, a new harness, a harness edit, or index metadata, show:

- operation: memory-save | harness-create | harness-edit | index-update | purge | hone
- destination files
- exact entry text or patch summary
- why it is reusable
- sensitive/private content excluded
- evidence handles
- rollback or removal path
- approval ledger entry path: `.tink/maintenance/ledger.jsonl`

Do not save if the user approved only the current run. Saving reusable state needs separate approval.

## Approval format
Use concise, selection-oriented wording. The recommendation must include the first action Tink will perform, not only the harness name.

```text
분석했습니다.

추천:
- 하네스 (Harness): code-change + review
- synthesis probe: 1 yes, built-in 하네스로 충분
- 이유: 변경 범위가 좁고, 회귀 확인이 필요합니다.
- 만들 실행 상태 (Run State): `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`, `answers.md`
- 첫 실행: 관련 파일을 먼저 읽고 검증 명령 후보를 확정합니다.

진행할까요?
1. 승인 (권장): 실행 상태 (Run State)를 만들고 첫 실행까지 진행
2. 조정: 다른 하네스 (Harness) 조합 선택
3. 새 하네스 (Harness) 초안 만들기
4. 취소

답장: 1, 2, 3, 또는 4
```

If a run-only draft or new harness is useful:

```text
기존 하네스 (Harness)는 쓸 수 있지만 조금 일반적입니다.

synthesis probe: 3 yes

임시 하네스 초안 (이번 작업 전용):
- name: customer-interview-synthesis
- why not just built-in: 일반 research보다 인터뷰 단위, 원문 근거, pain point 반복성이 중요합니다.
- domain rules:
  - 인터뷰별 원문 근거를 먼저 분리
  - 반복 pain point와 단발 의견을 구분
  - 제품 기회와 다음 검증 질문을 함께 남김
- checks: 원문 근거, 추측 분리, 다음 액션
- save policy: 이번 run에는 적용, 저장은 반복 근거와 별도 승인 후만

진행할까요?
1. 승인 (권장): 기본 하네스 + 임시 초안으로 `.tink/current/` 생성
2. 저장 후보까지 표시: 이번 작업 후 저장할지 별도 판단
3. 조정
4. 기본 하네스만 사용
5. 취소

답장: 1, 2, 3, 4, 또는 5
```

## Harness synthesis contract
When creating a new harness or run-only draft, Tink must create a procedure that would outperform a generic skill recommendation for a repeated task.

Do not wait for total mismatch. `generic fit` is enough to draft when the synthesis probe says the task has repeatable domain rules.

A generated harness can encode:
- domain triggers: when this exact workflow should run
- source inputs: research notes, examples, project files, prior run notes, failures, user corrections
- decision rules: how to choose options, reject bad paths, or stop
- tool sequence: what to inspect, search, run, draft, verify, or avoid first
- checks: objective evidence required before final
- recovery: what to do when a check fails
- memory rule: what may become reusable memory or harness improvement

Do not generate broad harnesses like `coding-helper` or `research-assistant`. Generate narrow harnesses like `nextjs-rsc-boundary-refactor`, `pre-pr-security-gate`, or `cafe-menu-validation-note`.

Before saving, score the candidate 1-5 on specificity, actionability, verifiability, reuse likelihood, and context cost. Save only if the weak points are acceptable and the user approves.

## `plan.md` template
```md
# Tink current run

## Goal
-

## Selected harnesses
-

## Why this harness
-

## Scope
-

## Out of scope
-

## Assumptions / answers
-

## Next steps
1.
```

## `checks.md` template
```md
# Checks

## Done means
-

## Verification
-

## Evidence to report
-

## Stop conditions
-
```

## `answers.md` template
```md
# Answers and assumptions

## User answers
-

## Inferred defaults
-

## Open questions
-
```

## `steps.json` template
```json
{
  "goal": "",
  "harnesses": [],
  "steps": [
    { "id": "1", "status": "in_progress", "description": "Create run state and inspect the target", "started_at": "", "completed_at": "" }
  ]
}
```

## Meaning of `context`
When listing harnesses, define `context` once:

```text
context는 이 harness가 Claude 작업 컨텍스트를 얼마나 차지하는지입니다.
- tiny: 아주 짧음
- small: 보통 체크리스트
- large: 별도 승인 후 읽는 큰 하네스
```

## Other slash skills
Tink does not automatically wrap `/grill-me`, `/diagnose`, `/tdd`, or other slash skills. That is intentional. If needed, run `/tink:forge` first, then use the other skill output as input.

## Failure behavior
If a check fails:
- write the failure to `.tink/current/notes.md`,
- identify the last safe point,
- take one recovery action,
- update `steps.json`,
- then update the harness or memory only if the lesson is reusable and approved.

## Do not
- Do not end with a harness recommendation only.
- Do not load every harness body up front.
- Do not create memory entries without separate Reusable State Save Gate approval.
- Do not store raw logs, full diffs, secrets, or one-off task progress as reusable memory.
