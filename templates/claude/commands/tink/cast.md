---
description: Choose, build, or synthesize the right harness for the current task.
---

# /tink:cast

Cast the right harness for the task, run it, and capture reusable learning.

`cast` is the main Tink command. Use it before non-trivial work.

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
8. maintain the harness set through approved memory, weave, or frog proposals.

## Default behavior
Do not stop after saying which harness might fit.

A valid `/tink:cast` response must do one of these:
- create or update `.tink/current/` and start the harnessed work,
- ask one blocking question that is required to create `.tink/current/`, or
- cancel because the user chose not to proceed.

If the task is clear enough to classify, do not ask broad clarification first. Make a best recommendation, ask for approval, then act.

## Interaction policy
Always call the `AskUserQuestion` tool for choice prompts. Do not render `❯` text format. Do not ask the user to type a number inline.

Map prompt content to `AskUserQuestion` fields:
- `question`: the full question text
- `header`: max 12-character tag (e.g. "진행 방식", "하네스 선택", "Git 설정")
- `label`: 1–5 word option name (e.g. "승인", "조정", "취소"). Add "(권장)" to the first option label if it is recommended.
- `description`: explanatory text for the option

Label quality rules:
- Use short, common, readable labels only. Good Korean labels are `승인`, `조정`, `취소`, `요구사항 입력`, `기본 하네스만 사용`, `새 하네스 초안 만들기`, `구조 점검`, `내용 점검`, `전체 점검`.
- Do not invent compressed Korean labels, transliterated fragments, or unclear summaries such as `콘데의달 지질`.
- If the idea is too specific for a clean 1-5 word label, put the detail in `description` and use a generic label such as `내용 점검` or `전체 점검`.
- Before calling `AskUserQuestion`, reread each Korean label. If it looks misspelled, unnatural, or semantically unclear, replace it with a plain fallback label.

Use Korean field values when `.tink/config.json` language is `ko` or `auto` with Korean input; use English otherwise.

## Readiness check
Before normal classification, check whether Tink is fully initialized. If `.tink/harnesses/index.json`, `.tink/config.json`, or `.tink/memory/` is missing, do not fail and do not write anything yet. Show a short recovery prompt:

```text
Tink is not fully initialized.

? What would you like to do?
❯ 1. Run /tink:setup to review or repair setup
  2. Create the minimal .tink scaffold for this repo
  3. Continue once with a lightweight one-run harness
  4. Cancel
```

If legacy Tiny files such as `.tiny/` or `/tiny:use` instructions are present, treat them as old state. Explain that `/tink:cast` replaces `/tiny:use`, and offer to migrate useful `.tiny/harnesses/`, `.tiny/config.json`, and `.tiny/memory/` into `.tink/` only after approval. Never tell the user to run `/tiny:use`.

After the initialization check, count files in `.tink/runs/`. If the count exceeds `config.runs_ttl_count` (default: 20), show one advisory line before proceeding:
- Korean: `💡 runs/에 N개 파일이 쌓여 있습니다. /tink:frog로 정리를 권장합니다.`
- English: `💡 N run records accumulated. Consider /tink:frog to clean up.`
This is advisory only — do not block or pause the task.

## Stitch
Before committing to `.tink/current/`, run Stitch exactly once. Stitch is an internal quality gate inside `/tink:cast`, not a separate `/tink:grill` command and not a real subagent in v1.0.0.

Evaluate Stitch every time, but show it to the user only when it finds a high-impact quality or safety branch. A clean internal Stitch pass is not recorded.

When Stitch is visible, show exactly one proposal in this order: proposal, reason, choices.
1. proposal
2. reason
3. choices

Choose the one proposal by priority:
1. safety or irreversibility
2. success criteria or verification
3. goal or scope ambiguity
4. harness mismatch
5. reusable improvement opportunity

Stitch may change the order or method of work, but it must not change the user's goal without separate approval.

Follow `.tink/config.json` for language. If language is `auto`, use the current user message language and fall back to English only when unclear.

Soft gate choices:
- English: `Approve`, `Add requirements`, `Continue as-is`
- Korean: `승인`, `요구사항 입력`, `이대로 진행`

Hard gate choices:
- English: `Approve`, `Add requirements`, `Cancel`
- Korean: `승인`, `요구사항 입력`, `취소`

Hard gates apply when at least one of the following is true for the next action: it is difficult or unsafe to reverse (reusable memory or harness saves, harness creation, edits, frog, weave, deleting files, removing configuration); it has external side-effects or visibility (publishing, deploying, tagging, releasing, opening a public PR, changing broad architecture or public contracts); or it involves sensitive data (secrets, credentials, payments, personal data, or destructive/external side-effect commands).

Some harnesses are inherently hard-gate territory regardless of the immediate next action. `ship` covers release/publish/deploy/PR, which are listed above. When such a harness is selected, trigger Stitch as a `safety` hard gate during the initial approval — even if the first action is read-only inspection. The hard gate protects the entire run, not just one step.

Hard gates must not offer `Continue as-is` or `이대로 진행`.

When Stitch triggers as a **soft gate**, do not call a separate `AskUserQuestion` for Stitch. Instead, add a `**🔍 Stitch**` section inside the main approval format and use a single `AskUserQuestion`. Hard gate Stitch remains a separate call.

When Stitch is visible and the user responds, record current-run state:
- `.tink/current/answers.md`: proposal, user choice, explicit assumptions
- `.tink/current/notes.md`: proposal, risk, reason, follow-up needed

If the user chooses `Continue as-is` / `이대로 진행`, proceed with the explicit assumptions recorded in `answers.md`.

Do not record a clean Stitch pass.

## Reusable State Save Gate
Reusable State Save Gate is a separate absolute hard approval gate, not merely a Stitch subtype. Current-run approval does not authorize reusable-state writes.

Reusable state includes:
- `.tink/memory/*`
- `.tink/harnesses/*`
- `.tink/harnesses/index.json`
- `.tink/config.json` policy changes
- `.claude/` workflow-affecting commands, skills, settings, or hooks (not simple preferences such as theme or model)
- template/plugin files that affect future installs

Before reusable-state writes, show a separate approval payload:
- operation
- destination files
- exact entry text or patch summary
- why it is reusable
- sensitive/private content excluded
- rollback or removal path

Reusable-state approval choices are `Approve`, `Add requirements`, and `Cancel`, localized when appropriate. Never offer `Continue as-is` or `이대로 진행` for reusable-state writes.

Show the payload directly at the point of proposal. Do not add a preliminary "do you want to save?" question before it — the payload IS the question.

When the plan's only non-trivial action is a reusable-state write, create run state silently first, then use Save Gate as the sole approval — skip the separate run-approval question.

## Run state contract
After approval, create `.tink/current/` with these files before doing deeper work. `.tink/current/` is the current workbench: the one active task plan Claude should keep updating while it works. It is temporary, local runtime state, not reusable memory and not a knowledge base:

- `plan.md`: goal, selected harnesses, assumptions, scope, out-of-scope, next steps
- `checks.md`: done criteria, verification commands, evidence required before final
- `steps.json`: machine-readable step list with `pending`, `in_progress`, `done`, or `blocked`
- `notes.md`: short working notes, failures, last safe point, recovery actions
- `answers.md`: user answers or inferred defaults used for this run
- `contract.json`: structured task contract used by rule selection and `/tink:verify`
- `session.json`: lightweight session metadata, especially rule ids already loaded by phase
- `context-pack.md`: human-readable selected context, including why each item is relevant
- `context-map.json`: machine-readable included and excluded context with reasons
- `context-metrics-evaluation.json`: measured or estimated context-efficiency scores, formulas, evidence refs, and limits
- `excluded-context.md`: notable omitted files, tools, sources, or claims and why they were excluded

Optional current-run artifacts are created only when their harness is selected:

- `goals.json`: current-run goals for `goal-checkpoint`; keep 2-6 goals, one active goal, status, done criteria, verification, and evidence.
- `delegation.md`: handoff or parallel-work packets for `delegation-brief`; include packet scope, forbidden actions, expected evidence, and reconciliation notes. Do not start tmux panes, worktrees, workers, or external agents from this harness.

Create `contract.json` before loading harness bodies. It should be short, factual, and based on the user request plus visible project context:

```json
{
  "task_type": "code_change",
  "surface": "claude",
  "risk": [],
  "success_conditions": [],
  "forbidden": [],
  "verification": {
    "commands": [],
    "manual_checks": []
  },
  "evidence": {
    "required": []
  }
}
```

For release, publish, deploy, public PR, deletion, migration, security, or broad contract work, include the relevant risk tags and required verification before asking for approval. Use risk tags such as `public_publish`, `external_visibility`, `destructive`, `secrets`, and `broad_contract`.

If `.tink/schemas/contract.schema.json` exists, use it as the contract shape. Do not paste the schema into the user response.

Create `session.json` before loading harness bodies. Keep it compact:

```json
{
  "loaded_rule_ids_by_phase": {},
  "context_budget": "compact",
  "retrieval": {
    "method": "keyword",
    "query": "",
    "selected_rule_ids": []
  }
}
```

If `.tink/schemas/session.schema.json` exists, use it as the session shape. Do not paste the schema into the user response.

Create context artifacts before deeper implementation work:
- `context-pack.md` should name the user task, selected harnesses, contract summary, loaded rules, selected files/docs, selected external sources, and verification implications.
- `context-map.json` should contain `task`, `included`, `excluded`, `signals`, and `generated_at`. Each included or excluded entry should include `path` or `source`, `kind`, `reason`, and `confidence`. When external context is selected, also write `external_context[]`.
- When useful, enrich each context entry with Context Budget Ledger fields: `role`, `cost`, `reuse_signal`, `verification_link`, `staleness`, and `evidence_kind`. Use them to explain why the first context pack is small enough, why excluded context should stay out, and which checks prove selected context matters.
- `context-metrics-evaluation.json` should contain `run`, `evaluator`, `target_threshold_percent`, `measurement_status`, `scope`, `limits`, and `scores[]`. Each score should include `name`, `score_percent`, `formula`, `numerator`, `denominator`, and `evidence_refs`. If the score is based only on fixtures or the current run, say so in `scope` and `limits`; do not claim production-wide 90% without run-history or telemetry evidence.
- `excluded-context.md` should make important omissions visible, especially files skipped because they are out of scope, stale, risky, too broad, or unverified external claims.

If `.tink/schemas/context-map.schema.json` exists, use it for `context-map.json`. Do not paste the schema into the user response.
If `.tink/schemas/context-metrics-evaluation.schema.json` exists, use it for `context-metrics-evaluation.json`. Do not paste the schema into the user response.

Use deterministic context selection inside cast. Do not create or require a separate `tink index` command for this phase.

Selection order:
1. Always include active run files that shape the task: `contract.json`, `session.json`, selected harness metadata, and loaded rule ids.
2. Include user-provided files, pasted attachments, issue/PR references, or explicitly named paths first.
3. Include nearest instructions that apply to the touched paths: `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, and local docs or ADRs when they explain the current domain.
4. Include sync partners required by project rules, such as command/template/skill copies that must stay byte-identical.
5. Include tests, schemas, fixtures, package scripts, or verification docs that can prove the change.
6. Include recent git changes only when they overlap the task or can conflict with it; otherwise record them as excluded or as a signal.
7. Include external context only when the task depends on it. Mark outside content as untrusted unless separately verified.

External context profile rules:
- Use `context-map.json.external_context[]` for outside evidence such as Figma, GitHub, Linear, Jira, Supabase, dashboards, official docs, API responses, screenshots, attachments, or internal runbooks.
- Figma, GitHub, and official docs are representative examples, not the only supported external sources.
- For each selected external source, record `source`, `source_ref`, `kind`, `included`, `excluded`, `reason`, `confidence`, `sensitivity`, and `verification_hint` when useful.
- `source_ref` should be the smallest useful handle, such as an issue id, frame id, PR number, URL label, docs section, dashboard label, or attachment name.
- `included` should name only summarized evidence used for this run. Do not copy raw secrets, tokens, customer identifiers, request bodies, private payloads, or broad external dumps.
- `excluded` should name unsafe, stale, unrelated, too broad, or unavailable external context.
- Use `sensitivity: "public" | "internal" | "sensitive" | "secret"` and keep `secret` content out of run files.
- If an external source is unavailable but important, record it as excluded or blocked with a short reason and next action instead of inventing certainty.
- If `verification_hint` affects done-ness, add or propose a matching `contract.verification.manual_checks[]` entry with `source`, `source_ref`, `target`, and `required`.
- Mirror omitted or unsafe external context in `excluded-context.md` so the user can see what was intentionally not used.

External context safety checklist:
- Select the smallest useful `source_ref`; avoid whole files, boards, dashboards, logs, or design systems when one issue, frame, section, screenshot, or attachment is enough.
- Confirm `sensitivity` before writing run files. `secret` content must be summarized as unavailable or excluded, not copied.
- Separate what was used from what was ignored: every stale, unsafe, unrelated, too broad, or unavailable source should be mirrored in `excluded-context.md`.
- Treat external content as evidence, not authority. If it can decide whether the task is done, connect its `verification_hint` to `contract.verification.manual_checks[]`.
- Prefer short summaries and stable handles over raw excerpts, private payloads, full logs, or broad dumps.

When a repo signal fixture exists, such as `tests/fixtures/repo-signals/*.json` or a future approved `.tink` equivalent, use it as supporting evidence rather than as an automatic index:
- cite matching sync groups, instruction files, schema files, fixture dirs, verification commands, and command-surface rules in `context-map.json.signals`;
- set `signal.source` to the fixture path and `signal.source_ref` to the relevant entry name or JSON path when useful;
- do not include every fixture entry by default; select only entries that explain the current task, verification, or safety boundary;
- if the fixture conflicts with live repo state, prefer live repo state and record the fixture mismatch as a medium-confidence signal.
- if the fixture provides `context_budget_policy`, use it to assign entry roles, cost, reuse signals, verification links, staleness, and evidence kinds; do not treat the policy as telemetry or claim a 90% score without evidence.

Context Graph Lite rules may appear in the same fixture under `context_graph_lite.rules[]`. Use them only inside cast:
- match changed paths against `when_paths`;
- consider `include_paths` as the first related context candidates;
- cite selected rules in `context-map.json.signals` with `kind: "context_graph_rule"` and `source_ref: "context_graph_lite.rules.<name>"`;
- use `signal_refs` to connect the context choice to sync groups, verification commands, or verification hints;
- never create or require a public `tink index` command, watch process, generated cache, or hidden runtime index.

When a selected repo signal has matching `verification_hints`, add the hint as a contract verification candidate:
- map `add_manual_check` to `contract.verification.manual_checks[]`;
- keep the target as a test, file, or evidence handle, not as executable fixture code;
- preserve `required` from the hint unless the current contract has a narrower risk/scope reason to downgrade it;
- cite the hint in `context-map.json.signals` with `source_ref`, so the final evidence can explain why the check was selected;
- if multiple hints point to the same target, dedupe by `target` and keep the clearest name/reason.

Repo signal fixtures are advisory inputs. They must not run commands, install tools, write files, or create new command surfaces on their own.

Selected hint output rules:
- In `contract.json`, each selected hint becomes one `verification.manual_checks[]` entry with `name`, `target`, `required`, `source`, and `source_ref`.
- `source` should point to the repo signal fixture or approved `.tink` signal file.
- `source_ref` should use `verification_hints.<hint-name>` so the check can be traced back to the rule that selected it.
- In `context-map.json.signals`, add a `verification_hint` signal for each selected hint with `value`, `reason`, `source`, `source_ref`, and `confidence`.
- The `reason` should name the changed path or selected context entry that matched the hint.
- If a changed path matches no hint, record that as an `unmatched_path` signal with `confidence: "medium"` instead of inventing a check.
- If a hint is considered but not selected because it is out of scope, record it in `excluded-context.md` rather than `contract.json`.

Exclusion rules:
- Exclude files outside the contract scope, generated artifacts, secrets, broad directories, stale docs, and unrelated dirty work.
- Exclude product phases that are explicitly deferred, and name the deferral in `excluded-context.md`.
- Prefer a short high-confidence context pack over a broad low-confidence one.
- When unsure, include the uncertainty in `reason` and set `confidence` to `low` or `medium` rather than silently expanding scope.
- For repeated false starts, mark the entry with `reuse_signal: "avoid_next_time"` or `role: "stale"` instead of deleting the evidence. This lets later runs skip it faster while preserving the reason.

Candidate limits:
- Start with 5-12 included entries for normal code/doc work.
- Add more only when each extra entry changes the first action, verification, or safety boundary.
- Do not load entire directories unless the directory itself is the artifact under review.

Also append a compact run record to `.tink/runs/YYYY-MM-DD-HHMM-<slug>.md` when the task completes, is canceled, is blocked, or is superseded. Do not store secrets, raw logs, full diffs, or one-off private context.

When appending a run record, also append a signal to `.tink/maintenance/weave-queue.json` if it exists:
```json
{ "id": "signal-<run_id>", "harness": "<primary_selected_harness>", "run": ".tink/runs/<slug>.md", "signal": "<outcome>", "auto": true, "timestamp": "<ISO>" }
```
Use `check_failed` as the signal when any check in `checks.md` did not pass; otherwise use the run outcome (`completed`, `blocked`, `canceled`, or `superseded`). Do not create `.tink/maintenance/weave-queue.json` if it does not exist — only append when it is already present.

## Current run lifecycle
Before creating a new `.tink/current/`, check whether one already exists:

1. No current run: create `.tink/current/` and start.
2. Same task still active in the same conversation: resume it, update `notes.md`, and continue from the next pending step.
3. `.tink/current/` exists but the conversation context is gone or uncertain: treat it as a recovery candidate, not as active truth. Even if the user says “continue” or “이어서 해”, first read `plan.md`, `checks.md`, `steps.json`, `notes.md`, and `answers.md`, show the five-line recovery summary below, then ask the user to resume, archive, replace, or cancel. If the user resumes, reuse the prior Stitch decision recorded in `answers.md`; do not re-evaluate Stitch.
4. Different task requested: if every step in `steps.json` is `done`, auto-archive to `.tink/runs/` without asking and create the new current run. If any step is not `done`, ask whether to archive/replace the old current run. Do not overwrite silently.
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

? 어떻게 할까요?
❯ 1. 이어가기
  2. 보관하고 새 작업
  3. 교체
  4. 취소
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
When proposing memory saves, harness edits, index updates, weave, or frog, create an operation ID and cite evidence handles. Evidence handles should be compact paths such as `.tink/runs/<file>.md`, `.tink/current/notes.md`, failed check names, or user correction snippets. Do not use raw logs as evidence.

Approved reusable changes should append one JSON line to `.tink/maintenance/ledger.jsonl` with:

```json
{ "timestamp": "", "op_id": "op-...", "type": "weave|frog|memory|index-update|harness-create|harness-edit", "files": [], "evidence": [], "approval": "", "result": "applied|rejected|deferred", "rollback": "" }
```

## Trivial task check
Before normal harness classification, check whether the task is trivial. Evaluate in this exact order:

**Step 1 — Hard-gate override (runs first, no exceptions):**
If any of the following is true, the task is NOT trivial:
- Irreversible or hard-to-reverse action (delete, reset, overwrite uncommitted work)
- External visibility (publish, deploy, tag, push to remote, open a PR, post to a public system)
- Sensitive data (secrets, credentials, payments, personal data)
- The task description mentions any of the above concepts

**Step 2 — Trivial criteria (only evaluated if step 1 finds no hard-gate):**
A task is trivial only when ALL of the following are true:
1. Single file target explicitly stated
2. Goal expressed completely in 1–2 sentences
3. No external effects (confirmed by step 1)

**If trivial:**
- Skip Stitch evaluation
- Create minimal run state: `steps.json` only
- Replace the approval question with a single inline confirmation: `진행할까요? (y/n)` or `Proceed? (y/n)`
- Begin work immediately after confirmation

**If not trivial:** proceed to normal classification below.

## Procedure
1. Build a draft `.tink/current/contract.json` from the request. If `.tink/schemas/contract.schema.json` exists, follow that shape.
2. Read `.tink/rules/index.json` if present. Use it as a small rule graph to choose candidate harnesses, checks, and opt-in guard candidates from contract facts. Do not read every harness.
   - Load `mandatory` nodes first when their `when` facts match the contract.
   - Retrieve `retrievable` nodes only when their `when` facts or `keywords` fit the task.
   - Treat `select_harnesses`, `include_paths`, `checks`, `reason`, and `risk` as first-class routing data when present.
   - Respect `budget_cost` and `selection_policy.retrieval.max_retrievable_per_phase` when present.
   - Record every loaded rule id in `.tink/current/session.json` under `loaded_rule_ids_by_phase.<phase>`.
   - Record selected `include_paths` in `context-map.json.included[]` with `role: "supporting"` or `role: "verification_target"` when the rule also adds a check.
   - Record rule `checks` in `contract.json.verification.manual_checks[]` or `commands[]` only when they are relevant and cheap; otherwise record them in `notes.md` as deferred checks.
   - Record rule `reason` and `risk` in `context-map.json.signals[]` with `kind: "rule_graph"` so reviewers can see why the context or check was chosen.
   - If a rule id is already listed for the same phase, do not repeat its guidance; cite the existing session entry instead.
3. Read `.tink/harnesses/index.json`. Use it to validate the candidates from the rule graph and to fall back when no rule node matches.
4. Read small memory files where `config.json` sets `memory_has_entries.<name>: true`. Skip files set to `false`. After a Save Gate approves a new memory entry, set that file's flag to `true` in `config.json`.
   - `.tink/memory/mistakes.md`
   - `.tink/memory/preferences.md`
   - `.tink/memory/lessons.md`
5. Classify the task:
   - code change
   - bug fix
   - research
   - review
   - docs
   - ship/release
   - new pattern not covered yet
6. Consider GJC-style visible-thinking overlays as normal Tink harnesses, not as new command surfaces:
   - If the request is an ambiguous idea, early product concept, or underspecified implementation prompt, prefer `requirements-interview` before planning or coding. This is the default harness when Stitch is expected to trigger for goal ambiguity or missing acceptance criteria.
   - If the request asks for a plan, architecture decision, large refactor, migration, or broad public contract change, consider `plan-consensus`.
   - If the work naturally splits into multiple durable milestones, add `goal-checkpoint` and create `.tink/current/goals.json` after approval.
   - If parallel review, independent verification, or handoff would reduce risk, add `delegation-brief` and create `.tink/current/delegation.md` after approval. This harness prepares briefs only; it never starts tmux, worktrees, workers, or external agents.
7. Pick the best existing harness set using the context budget policy below. Prefer 1-3 harnesses, but do not use a hard cap when several tiny harnesses add useful checks without crowding context. When the task is ambiguous (Stitch goal-ambiguity is expected to trigger), start with `requirements-interview` alone; add a second harness only after the user clarifies. Do not bundle 2+ harnesses for ambiguous tasks upfront.

   After selecting, run a quick quality check using the index metadata for each chosen harness:
   - If fewer than 2 words in `use_when` match the current task description (case-insensitive) → treat as a Stitch harness-mismatch signal
   - If `checks` is empty or missing → treat as a Stitch harness-mismatch signal
   - If `asks` is empty or missing and the task goal is not self-evident → treat as a Stitch goal-ambiguity signal
   Feed any signals into the Stitch evaluation at step 16.

8. Add any rule graph check candidates to `contract.json` verification if they are relevant and cheap. For risky commands, set `approval_required: true`.
9. Add opt-in guard candidates to `notes.md` only as suggestions. Do not register enforcement hooks unless the user separately approves.
10. Run the synthesis probe on the initial harness choice. The probe produces one of three outcomes: strong fit (0-1 yes), generic fit (2-3 yes), or no fit (4-5 yes or no harness matches).
11. If the probe finds no fit, load `harness-synthesis` and draft a domain-specific harness for this run instead of forcing a bad fit.
12. If the probe finds a generic fit (2-3 yes), propose a run-only draft harness or domain rules alongside the built-in harness. Do not save it by default.
13. If too many tools, skills, agents, or harnesses are available, load `harness-curation` and choose the smallest effective set before loading more context.
14. If lightweight signals show a recurring operating habit, use `harness-curation` (its habit calibration section) to make one advisory recommendation without loading a separate body.
15. If the user points to research, notes, examples, prior failures, or "what I learned today", synthesize from those inputs. Extract behavior-shaping rules and reusable procedure, not a summary.
16. Run Stitch once before committing to `.tink/current/`. If it triggers, show exactly one proposal before approval. Call `AskUserQuestion` as described in the Interaction policy section.
17. Ask for explicit approval before non-trivial work.
18. After approval, read only the selected harness files and any approved run-only draft.
19. Create `.tink/current/` files from the run state contract, including `contract.json`, `session.json`, `context-pack.md`, `context-map.json`, `context-metrics-evaluation.json`, and `excluded-context.md`. If selected, also create `goals.json` for `goal-checkpoint` and `delegation.md` for `delegation-brief`.
20. Execute the first safe step immediately:
   - inspect relevant files,
   - run a read-only diagnostic,
   - draft the first artifact,
   - or reproduce the issue.
21. Keep `steps.json`, `notes.md`, `contract.json`, and `session.json` current as work progresses. When present, keep `goals.json` and `delegation.md` aligned with actual status and evidence.
22. Before final, run `/tink:verify` behavior for required contract checks or state why verification is blocked.
23. If the task exposed a repeated mistake or reusable improvement, use the Reusable State Save Gate approval payload below. Save only after separate user approval.


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
- Meta harnesses (`harness-curation`, `harness-synthesis`): do not do the end-user task directly. They decide whether to choose, reduce, replace, create, or tune other harnesses. Count their context cost and use them to reduce or replace the active set, not to pile on top by default.
- No hard cap mode is allowed for complex tasks, but it must be explicit: state the expected context cost, why no cap is safer, and what will be unloaded or summarized first.

If the harness list feels heavy, stop and use `harness-curation` before loading more bodies.

## Approval payload for saves
This is the Reusable State Save Gate payload. Before saving memory, a new harness, a harness edit, or index metadata, show:

- operation: memory-save | harness-create | harness-edit | index-update | frog | weave
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

User-facing approval wording:
- Do not show internal terms such as `Probe`, `probe`, `합성 프로브`, `generic fit`, `제너릭 fit`, or `Stitch`.
- Translate the synthesis probe result as `맞춤 절차 판단`.
- Translate `generic fit` as `기본 하네스는 큰 틀만 맞음` or `기본 하네스만으로는 부족함`.
- Translate visible Stitch output as `확인할 점`, not `Stitch 점검`.
- Explain what each selected harness does in one short phrase before asking for approval.
- Show a short `하네스 선택 과정` when more than one harness or a run-only draft is selected: candidate considered, selected harnesses, and why each was chosen.
- Prefer natural scope wording such as `완료 기준을 먼저 나누겠습니다` or `이번 점검은 두 범위로 보겠습니다` instead of awkward wording like `"더 잘 동작하기"의 기준이 두 갈래입니다`.

Approval option counts (always exactly one applies):
- Default (no Stitch, no run-only draft): 4 options — 승인 / 조정 / 새 하네스 초안 만들기 / 취소
- Run-only draft offered: 4 options — 승인 / 조정 / 기본 하네스만 사용 / 취소
- Stitch soft gate: 4 options — 승인 / 요구사항 입력 / 이대로 진행 / 취소
- Stitch hard gate (or Save Gate): 3 options — 승인 / 요구사항 입력 / 취소. Never offer `이대로 진행` / `Continue as-is`.

```text
### 🧶 Run: <task name>

**🎯 Goals**
- <goal>

**🛠️ 선택한 하네스**: `code-change + review`
- `code-change`: 범위가 정해진 코드 변경을 작게 수행하는 하네스
- `review`: 변경 위험과 누락을 확인하는 점검 하네스

**하네스 선택 과정**
- 후보: `code-change`, `review`, `harness-synthesis`
- 선택: `code-change + review`
- 이유: 변경 범위가 좁고, 회귀 확인이 필요합니다. 별도 맞춤 초안은 필요하지 않습니다.

- **맞춤 절차 판단:** 기본 하네스로 충분
- **첫 실행:** 관련 파일을 먼저 읽고 검증 명령 후보를 확정합니다.

? 진행할까요?
❯ 1. 승인 (권장) — 실행 상태 생성 후 첫 실행까지 진행
  2. 조정 — 다른 하네스 조합 선택
  3. 새 하네스 초안 만들기
  4. 취소
```

If a run-only draft or new harness is useful:

```text
### 🧶 Run: <task name>

**🎯 Goals**
- <goal>

**🛠️ 선택한 하네스**: `<built-in> + 임시 초안`
- `<built-in>`: 기본 작업 흐름을 잡는 하네스
- `customer-interview-synthesis`: 이번 작업의 인터뷰 분석 순서를 보강하는 임시 초안

**하네스 선택 과정**
- 후보: `<built-in>`, `harness-synthesis`, `customer-interview-synthesis`
- 선택: `<built-in> + customer-interview-synthesis`
- 이유: 기본 하네스는 큰 틀만 맞고, 인터뷰 원문 근거와 pain point 구분은 별도 절차가 필요합니다.

**맞춤 절차 판단:** 기본 하네스만으로는 부족함

**임시 하네스 초안** (이번 작업 전용):
- **name:** `customer-interview-synthesis`
- **why not just built-in:** 일반 research보다 인터뷰 단위, 원문 근거, pain point 반복성이 중요합니다.
- **domain rules:**
  - 인터뷰별 원문 근거를 먼저 분리
  - 반복 pain point와 단발 의견을 구분
  - 제품 기회와 다음 검증 질문을 함께 남김
- **checks:** 원문 근거, 추측 분리, 다음 액션
- **save policy:** 이번 run에는 적용, 저장은 반복 근거와 별도 승인 후만

? 진행할까요?
❯ 1. 승인 (권장) — 기본 하네스 + 임시 초안으로 `.tink/current/` 생성
  2. 조정
  3. 기본 하네스만 사용
  4. 취소
```

If Stitch triggers as a soft gate, merge it into the approval format. The user-facing block uses plain language — never the word `Stitch`. The Korean default uses `확인할 점`; English uses `Review note`:

```text
### 🧶 Run: <task name>

**🎯 Goals**
- <goal>

**🔍 확인할 점**
- 제안: <one proposal>
- 이유: <reason>
- 이대로 진행 시 가정: <explicit assumption>

**🛠️ 선택한 하네스**: `<harness>`
- `<harness>`: <what this harness does in one short phrase>

**하네스 선택 과정**
- 후보: <candidate harnesses>
- 선택: `<harness>`
- 이유: <why selected>

- **맞춤 절차 판단:** <기본 하네스로 충분 | 기본 하네스만으로는 부족함 | 새 맞춤 절차 필요>
- **이유:** ...
- **첫 실행:** ...

? 진행할까요?
❯ 1. 승인 (권장) — 점검 가정 포함 진행
  2. 요구사항 입력 — 점검 제안 또는 계획 조정
  3. 이대로 진행 — 점검 무시하고 원래 계획대로
  4. 취소
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

## `goals.json` template
Use only when `goal-checkpoint` is selected:

```json
{
  "goals": [
    {
      "id": "G1",
      "status": "active",
      "description": "",
      "done_criteria": [],
      "verification": [],
      "evidence": [],
      "next_action": ""
    }
  ]
}
```

## `delegation.md` template
Use only when `delegation-brief` is selected:

```md
# Delegation brief

## Shared constraints
-

## Packets
### Packet 1: <owner label>
- Scope:
- Forbidden:
- Expected evidence:
- Reconciliation notes:
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
Tink does not automatically wrap `/grill-me`, `/diagnose`, `/tdd`, or other slash skills. That is intentional. If needed, run `/tink:cast` first, then use the other skill output as input.

## Failure behavior
If a check fails:
- write the failure to `.tink/current/notes.md`,
- append a compact friction entry to `.tink/maintenance/friction.jsonl` when it exists,
- identify the last safe point,
- take one recovery action,
- update `steps.json`,
- then update the harness or memory only if the lesson is reusable and approved.

## Do not
- Do not end with a harness recommendation only.
- Do not load every harness body up front.
- Do not create memory entries without separate Reusable State Save Gate approval.
- Do not store raw logs, full diffs, secrets, or one-off task progress as reusable memory.
- Do not ask "do you want to save?" before showing the Reusable State Save Gate payload. Show the payload directly.
- Do not narrate .tink/ file writes (current/, runs/, memory/, config.json) in the response body. Do not show diff summaries, file lists, or "I created X / I updated Y" breakdowns. The tool-use header is sufficient on its own. At the end of the response, add at most one short sentence summarizing what changed across all .tink/ writes.
- Do not use Tink-internal jargon (Stitch, Probe, synthesis probe, generic fit, hard gate, Save Gate, Reusable State, or temporary labels like G1/G2/G3) when writing user-facing responses. Translate to plain language matching `config.json` language. Internal documentation and code keep original terms for consistency.
