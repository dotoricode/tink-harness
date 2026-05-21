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
```


## Run record schema
Each `.tink/runs/*.md` record starts with YAML frontmatter:

```yaml
---
started_at: "YYYY-MM-DDTHH:MM:SSZ"
ended_at: "YYYY-MM-DDTHH:MM:SSZ"
outcome: completed # completed | blocked | canceled | superseded
selected_harnesses: []
considered_but_rejected: []
checks_result: pass # pass | fail | blocked | not_run
maintenance_suggestions: []
approved_saves: []
---
```

The body should be a short human summary: goal, evidence, negative signals, and next safe action if blocked.

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
5. If no existing harness fits, load `harness-synthesis` and draft a domain-specific harness for this run instead of forcing a bad fit.
6. If too many tools, skills, agents, or harnesses are available, load `harness-curation` and choose the smallest effective set before loading more context.
7. If lightweight signals show a recurring operating habit, load `context-habit-calibration` only if it earns its context cost; otherwise make one advisory recommendation without loading another body.
8. If the user points to research, notes, examples, prior failures, or "what I learned today", synthesize from those inputs. Extract behavior-shaping rules and reusable procedure, not a summary.
9. Ask for selection-style approval before non-trivial work. Enter should accept the recommended option when the host supports it.
10. After approval, read only the selected harness files.
11. Create `.tink/current/` files from the run state contract.
12. Execute the first safe step immediately:
   - inspect relevant files,
   - run a read-only diagnostic,
   - draft the first artifact,
   - or reproduce the issue.
13. Keep `steps.json` and `notes.md` current as work progresses.
14. Before final, verify `checks.md` and report evidence.
15. If the task exposed a repeated mistake or reusable improvement, propose a memory or harness update using the approval payload below. Save only after user approval.


## Context budget policy
Do not use one universal harness cap. Choose by context footprint and task risk. Classify size by how much thinking and checking the harness adds, not only by file length:

- Tiny harnesses: one screen or less, one clear trigger, no extra tool chain, and one or two checks. May exceed 4 when each is directly useful. Still explain why each earns its place.
- Small harnesses: checklist-sized, one work type, a few checks, and limited recovery rules. Usually 1-4 active bodies. Add more only when the task has separate risks that need separate checks.
- Large harnesses: multi-phase, tool-heavy, research-heavy, multi-agent, or broad enough to change the whole workflow. Load one at a time and only after approval.
- Meta harnesses (`harness-curation`, `harness-synthesis`, `context-habit-calibration`): do not do the end-user task directly. They decide whether to choose, reduce, replace, create, or tune other harnesses. Count their context cost and use them to reduce or replace the active set, not to pile on top by default.
- No hard cap mode is allowed for complex tasks, but it must be explicit: state the expected context cost, why no cap is safer, and what will be unloaded or summarized first.

If the harness list feels heavy, stop and use `harness-curation` before loading more bodies.

## Approval payload for saves
Before saving memory, a new harness, a harness edit, or index metadata, show:

- operation: memory-save | harness-create | harness-edit | index-update | purge | hone
- destination files
- exact entry text or patch summary
- why it is reusable
- sensitive/private content excluded
- rollback or removal path

Do not save if the user approved only the current run. Saving reusable state needs separate approval.

## Approval format
Use concise, selection-oriented wording. The recommendation must include the first action Tink will perform, not only the harness name.

```text
분석했습니다.

추천:
- 하네스 (Harness): code-change + review
- 이유: 변경 범위가 좁고, 회귀 확인이 필요합니다.
- 만들 실행 상태 (Run State): `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`
- 첫 실행: 관련 파일을 먼저 읽고 검증 명령 후보를 확정합니다.

진행할까요?
1. 승인 (권장): 실행 상태 (Run State)를 만들고 첫 실행까지 진행
2. 조정: 다른 하네스 (Harness) 조합 선택
3. 새 하네스 (Harness) 초안 만들기
4. 취소
```

If a new harness is needed:

```text
기존 하네스 (Harness)가 딱 맞지 않습니다.

새 하네스 (Harness) 초안:
- name: customer-interview-synthesis
- purpose: 인터뷰 노트에서 반복 pain point와 제품 기회를 추출
- checks: 원문 근거, 추측 분리, 다음 액션
- 첫 실행: 입력 노트의 출처와 인터뷰 단위를 분리합니다.

진행할까요?
1. 승인 (권장): 이 초안으로 이번 작업에만 적용하고 `.tink/current/` 생성
2. 저장까지 승인: 이번 작업 후 `.tink/harnesses/`에 저장 후보로 올림
3. 조정
4. 취소
```

## Harness synthesis contract
When creating a new harness, Tink must create a procedure that would outperform a generic skill recommendation for a repeated task.

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
- Do not create memory entries without approval.
- Do not store raw logs, full diffs, secrets, or one-off task progress as reusable memory.
