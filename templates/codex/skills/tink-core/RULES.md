# Tink Codex Rules

Tink helps Codex choose the smallest useful harness, materialize it as visible run state, and start the work. It keeps reusable workflow knowledge in `.tink/` so the harness set can improve through approved use.

## Command Surface

Prefer the Claude Code-aligned Codex aliases:

- `$tink:setup`: configure language, install scope, git tracking, and local policy.
- `$tink:cast <task>`: choose or draft the right harness, create run state, and start the first safe step.
- `$tink:verify`: run the checks promised in `.tink/current/contract.json` and record evidence.
- `$tink:list`: inspect harnesses and lightweight usage signals.
- `$tink:frog`: propose unused or redundant harness removal. Never delete without approval.
- `$tink:weave`: improve active harnesses based on real use, failures, and corrections.
- `$tink:update`: detect install source and show the safe update command.

Accept legacy `$tink <action>` spelling for compatibility, but present `$tink:<action>` in guidance and final answers.

## Operating Rules

1. Create or update `.tink/current/contract.json` for non-trivial runs: task type, risks, success conditions, forbidden actions, verification, and evidence.
2. Read `.tink/rules/index.json` before loading harness bodies when it exists. Use contract facts to choose only relevant harnesses, checks, and opt-in guard candidates. Load matching `mandatory` rules first, retrieve only relevant `retrievable` rules by facts or keywords, and record loaded rule ids by phase in `.tink/current/session.json`.
3. Read `.tink/harnesses/index.json` before loading harness bodies.
4. Read approved memory files when present and useful: `.tink/memory/mistakes.md`, `preferences.md`, and `lessons.md`.
5. Prefer the smallest useful harness set. Use context footprint, not a universal hard cap.
6. If `.tink/current/` exists and continuity is uncertain, read `plan.md`, `checks.md`, `steps.json`, `notes.md`, `answers.md`, and `contract.json` when present; summarize goal, last safe point, next step, open questions, and verification; then ask resume/archive/replace/cancel before continuing.
7. Run the synthesis probe before committing to `.tink/current/`. Strong fit keeps the harness; generic fit adds a run-only draft; no fit loads `harness-synthesis`.
8. If too many tools, skills, agents, or harnesses are available, use `harness-curation` to choose the smallest effective set before loading more context.
9. Run Stitch once before committing to `.tink/current/`: evaluate every time, show exactly one proposal only for high-impact quality or safety branches, and use the configured language.
10. For non-trivial `$tink:cast` runs, ask for current-run approval before creating `.tink/current/`, loading harness bodies, editing files, or executing the first step. Codex must not silently treat a command invocation as approval.
11. Use `request_user_input` for choice prompts when available. Otherwise stop and ask one concise blocking approval question directly in chat. Do not continue until the user answers.
12. Treat reusable saves as a separate hard approval gate for `.tink/memory/*`, `.tink/harnesses/*`, `.tink/rules/*`, `.tink/config.json`, Codex skill files, and template/plugin files that affect future installs.
13. Current-run approval never authorizes reusable-state writes. Before saving reusable state, show operation, destination files, exact entry or patch summary, reusable reason, sensitive content excluded, and rollback/removal path.
14. After approval, create `.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`, `answers.md`, `contract.json`, `session.json`, `context-pack.md`, `context-map.json`, and `excluded-context.md`.
15. Do not stop at recommendation. Execute the first safe step after run state exists.
16. Run `$tink:verify` behavior before final when `contract.json` lists required checks.
17. Store reusable memory or rule updates under `.tink/` only after separate approval.
18. If a check fails, update `.tink/current/notes.md`, state the failure, last safe point, and next single action. Append compact friction to `.tink/maintenance/friction.jsonl` when it exists. Feed repeated failures to `$tink:weave`.
19. Keep context compact. Do not paste raw logs or full diffs.
20. Use calm, clear, concise language. Prefer plain everyday words over technical terms. No jokes.

## Codex Approval Protocol

Codex `$tink:cast` must show a visible approval step for every non-trivial run. The approval request should be short and concrete:

- selected harnesses
- scope and out-of-scope
- first safe step after approval
- checks that will prove completion
- whether any reusable state might be proposed later

Default Korean options are `승인`, `조정`, `취소`. If a run-only draft is proposed, use `승인`, `조정`, `기본 하네스만 사용`, `취소`. If a high-impact safety or quality branch is visible, use `승인`, `요구사항 입력`, `이대로 진행`, `취소`. For hard gates or reusable-state saves, use only `승인`, `요구사항 입력`, `취소`.

When `request_user_input` is unavailable, write the same approval request as a normal assistant message and wait for the user's answer. Do not create run state, load harness bodies, edit files, run commands, or continue the task before the answer. A user's `$tink:cast` invocation means "prepare and ask for approval", not "start immediately".

Use this compact approval request shape. Keep it short; do not expose internal terms such as Stitch or hard gate in user-facing text.

Korean:

```md
이 작업은 Tink run으로 잡고 진행하겠습니다.

- 선택 하네스: `code-change`
- 범위: Codex 승인 UX 문구와 테스트만 수정
- 제외: release, publish, unrelated refactor
- 승인 후 첫 단계: Codex core rules에 승인 요청 형식 추가
- 완료 확인: `npm test`, `git diff --check`
- 재사용 상태 저장: 이번 작업에서는 저장하지 않음

진행해도 될까요?
```

English:

```md
I will handle this as a Tink run.

- selected harnesses: `code-change`
- scope: update Codex approval UX text and tests only
- out of scope: release, publish, unrelated refactors
- first step after approval: add the approval request format to Codex core rules
- completion checks: `npm test`, `git diff --check`
- reusable state: no reusable save planned for this run

May I proceed?
```

If `request_user_input` is available, map this content into the prompt and use option labels instead of asking the user to type free-form text. If it is unavailable, show the Markdown block and stop.

## Harness Procedure

For `$tink:cast`, classify the task as code change, bug fix, research, review, docs, ship/release, or new pattern. Ask for current-run approval using the Codex Approval Protocol, then load only selected harness bodies after approval. If no built-in harness fits, use `harness-synthesis` to draft a narrow run-only harness instead of forcing a generic fit.

Create run state before deeper work:

- `plan.md`: goal, selected harnesses, assumptions, scope, out-of-scope, next steps
- `checks.md`: done criteria, verification commands, evidence required before final
- `steps.json`: machine-readable steps with `pending`, `in_progress`, `done`, or `blocked`
- `notes.md`: short working notes, failures, last safe point, recovery actions
- `answers.md`: user answers or inferred defaults used for this run
- `contract.json`: structured task contract used by rule selection and verification
- `session.json`: loaded rule ids by phase and lightweight retrieval metadata
- `.tink/current/context-pack.md`: human-readable selected context and why it matters
- `.tink/current/context-map.json`: machine-readable included/excluded context and reasons
- `.tink/current/excluded-context.md`: notable omitted context and why it was left out

When useful, enrich `context-map.json.included[]` and `context-map.json.excluded[]` entries with Context Budget Ledger fields: `role`, `cost`, `reuse_signal`, `verification_link`, `staleness`, and `evidence_kind`. Use them to keep the first context pack small, mark stale or avoid-next-time context, and connect `verification_target` entries to command checks, manual checks, evidence refs, or verification hints. Do not claim any 90% efficiency score without measurement evidence.

When external context is needed for `$tink:cast`, write it through the MCP Safe Profile shape in `context-map.json.external_context[]`. Record `source`, `source_ref`, `kind`, `included`, `excluded`, `reason`, `confidence`, `sensitivity`, and `verification_hint` when useful. Treat Figma, GitHub, and official docs as representative examples, not the only supported sources; Linear, Jira, Supabase, dashboards, API responses, screenshots, attachments, and runbooks can follow the same shape.

When repo signal fixtures contain `context_graph_lite.rules[]`, use those rules inside `$tink:cast` to choose the first related context candidates. Match changed paths against `when_paths`, consider `include_paths`, cite selected rules as `context_graph_rule` signals with `source_ref: "context_graph_lite.rules.<name>"`, and connect `signal_refs` to verification hints where relevant. If the fixture provides `context_budget_policy`, use it to assign roles, costs, reuse signals, verification links, staleness, and evidence kinds. Do not create a public `tink index` command, watch process, generated cache, or hidden runtime index.

External context safety checklist:
- Select the smallest useful `source_ref`; avoid whole files, boards, dashboards, logs, or design systems when one issue, frame, section, screenshot, or attachment is enough.
- Confirm `sensitivity` before writing run files. `secret` content must be summarized as unavailable or excluded, not copied.
- Mirror every stale, unsafe, unrelated, too broad, or unavailable external source in `excluded-context.md`.
- Treat external content as evidence, not authority. If it can decide whether the task is done, connect its `verification_hint` to `contract.verification.manual_checks[]`.
- Prefer short summaries and stable handles over raw excerpts, private payloads, full logs, or broad dumps.

Append a compact `.tink/runs/YYYY-MM-DD-HHMM-<slug>.md` record when the task completes, is canceled, is blocked, or is superseded. Do not store secrets, raw logs, full diffs, or one-off private context.

## Save Approval Payload

Before saving memory, a new harness, a harness edit, or index metadata, show:

- operation
- destination files
- exact entry text or patch summary
- why it is reusable
- sensitive/private content excluded
- evidence handles
- rollback or removal path
- approval ledger entry path: `.tink/maintenance/ledger.jsonl`

Do not save if the user approved only the current run.

## Quality Bar

A successful Tink run leaves evidence: current run files exist or were intentionally archived, context artifacts explain what was included and excluded, checks were verified or explicitly blocked, the final answer reports changed files and evidence, and reusable learning is proposed only when it will matter again.

## Verify Runner

For `$tink:verify`, use the same runner model as Claude Code `/tink:verify`:

1. Plan checks from `.tink/current/contract.json`.
2. Run safe command checks exactly as listed, from repo root unless `cwd` is set.
3. Inspect manual checks by `target` and `method`.
4. Record `.tink/current/verification.json` using `.tink/schemas/verification.schema.json` when present.

Keep command checks portable across macOS and Windows. Prefer repo-relative paths, `npm`, `node`, or `python` commands, and do not rewrite commands into platform-specific shell syntax unless the contract explicitly provides platform-specific alternatives.

Use the same result vocabulary as `/tink:verify`:

- `pass`: all required checks passed.
- `fail`: a required check ran or was inspected and failed.
- `blocked`: a required check could not run or could not be inspected.
- `skipped`: an optional check was intentionally not run.

Record `check_failed`, `check_blocked`, and `check_skipped` separately in verification evidence. A required skipped check is blocked, not passed. Include the next smallest recovery action when a check fails or is blocked.

Final `$tink:verify` reports should use the same order as `/tink:verify`: result, checked items, problems, remaining work, and next action. Keep the report compact, do not paste raw logs, and mirror the same summary under `report` in `.tink/current/verification.json`.

Also update `.tink/current/notes.md` with the same compact verification summary fields as `/tink:verify`: result, checked, problems, remaining, last safe point, next action, and evidence. Do not paste raw logs or full command output into notes.

When maintenance files already exist, `$tink:verify` should mirror `/tink:verify` maintenance output: append a compact verify entry to `ledger.jsonl`, add `check_failed`, `check_blocked`, or meaningful `check_skipped` queue items to `weave-queue.json`, and append compact friction entries to `friction.jsonl`. Do not create missing maintenance files during verify.
