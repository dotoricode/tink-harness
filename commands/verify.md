---
description: Run the checks promised in the current Tink contract and record evidence.
---

# /tink:verify

Run the verification commands and manual checks listed in `.tink/current/contract.json`.

Use this when a Tink run needs evidence before it can be called done, especially before release, publish, deploy, public PR, or broad workflow changes.

## Purpose

Tink should not rely on "I think it passed." It should run the checks named in the current contract, record what happened, and send failures back into weave as improvement signals.

## Inputs

Read these files if present:

- `.tink/current/contract.json`
- `.tink/current/checks.md`
- `.tink/current/plan.md`
- `.tink/current/notes.md`
- `.tink/current/verification.json`
- `.tink/current/evidence.md`
- `.tink/schemas/verification.schema.json`
- `.tink/maintenance/weave-queue.json`
- `.tink/maintenance/ledger.jsonl`
- `.tink/maintenance/friction.jsonl`

If `contract.json` is missing, do not invent one silently. Summarize the missing contract and ask whether to create it from the current run files.

## Contract fields

The command expects this shape:

```json
{
  "task_type": "release",
  "risk": ["public_publish"],
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

Unknown fields are allowed. Missing required fields should be reported as contract gaps.

## Verify runner contract

Use one runner model for Claude Code `/tink:verify` and Codex `$tink:verify`.

The runner has three phases:

1. **Plan**: read the contract, normalize checks into a short runner plan, and classify each check as `command` or `manual`.
2. **Run**: execute safe command checks and inspect manual checks.
3. **Record**: write `.tink/current/verification.json`, write `.tink/current/evidence.md`, update notes, and append maintenance signals only when their files already exist.

Runner plan entries should contain:

- `name`
- `kind`: `command` or `manual`
- `required`
- `command` or `target`
- `approval_required`
- `cwd`
- `platforms`
- `source` and `source_ref` when selected from repo signals

For command checks:

- Run from repo root unless `cwd` is set.
- Treat repo-relative `cwd` with forward slashes as portable. Resolve it on the current OS before running.
- Run exactly the listed command. Do not rewrite it into platform-specific shell syntax unless the contract gives platform-specific alternatives.
- Prefer commands that work on both macOS and Windows, such as `npm test`, `node ...`, or `python ...`.
- If `platforms` excludes the current platform, mark the check `skipped` when optional and `blocked` when required.
- If `approval_required` is true, or if the command can publish, deploy, push, tag, delete, mutate credentials, or contact external services, ask before running.

For manual checks:

- Use `target` as the evidence handle: a test name, file path, doc section, fixture entry, or human-review item.
- If `method` is present, use it to decide how to inspect the target.
- If a required manual target cannot be inspected, mark it `blocked` rather than pass.
- Preserve `source` and `source_ref` in the evidence when the check came from repo signals.

Result rules:

- Overall `pass`: all required checks are `pass`; optional checks may be `pass`, `skipped`, or absent with a reason.
- Overall `fail`: at least one required check ran and failed.
- Overall `blocked`: at least one required check could not run or could not be inspected.
- A required `skipped` check is a `blocked` result, not a pass.
- A failed optional check does not fail the whole run unless the contract says it is required, but it should still be visible in evidence.

Failure, blocked, and skipped handling:

- Use `check_failed` only when a check actually ran or was inspected and produced a failing result.
- Use `check_blocked` when a required check could not run or could not be inspected, including missing setup, missing manual evidence, required approval that was not granted, or platform exclusion on a required check.
- Use `check_skipped` only for optional checks that were intentionally not run, such as a platform-specific smoke check on the wrong OS.
- Set `failure_type` to the clearest reason: `command_failed`, `manual_failed`, `platform_excluded`, `approval_required`, `missing_target`, or `not_run`.
- Set `next_action` on failed or blocked checks so the user knows the smallest useful recovery step.
- Do not append a weave signal for an optional skip unless the skip reveals a repeated harness or contract problem.

## Procedure

1. Read `.tink/current/contract.json` first.
2. Validate that `task_type`, `success_conditions`, `forbidden`, and `verification` are present.
3. Build a verify runner plan from `verification.commands[]` and `verification.manual_checks[]`.
4. List the checks that will run. Keep the list short and evidence-oriented.
5. For each `verification.commands[]` entry:
   - run exactly the command listed, unless it is destructive or externally visible;
   - if the command is risky, ask for approval first;
   - capture pass/fail, exit code, and a short evidence handle.
6. For each `verification.manual_checks[]` entry, inspect the named file or artifact and record pass/fail/skipped/blocked.
7. Write `.tink/current/verification.json` with compact evidence: check name, kind, status, exit code when available, evidence handle, and timestamp. Do not include raw logs.
8. Write `.tink/current/evidence.md` as a short evidence summary card. Keep it human-readable and compact:
   - `Done claim`: what can honestly be called done.
   - `Evidence`: checks that passed or were inspected.
   - `Not verified`: checks not run, optional skips, or claims outside this run.
   - `Risk`: remaining manual, environment, or release risk.
   - `Next action`: smallest useful continuation or recovery step.
9. If `.tink/schemas/verification.schema.json` exists, use it as the JSON evidence shape. Do not paste the schema into the user response.
10. Update `.tink/current/notes.md` with the notes summary format below.
11. Append a `verify` entry to `.tink/maintenance/ledger.jsonl` when it exists, using result `pass`, `fail`, or `blocked`.
12. If any required check fails, append a `check_failed` signal to `.tink/maintenance/weave-queue.json` when it exists.
13. If any required check is blocked, append a `check_blocked` signal to `.tink/maintenance/weave-queue.json` when it exists.
14. If an optional check is skipped and the skip matters for future harness quality, append a `check_skipped` signal to `.tink/maintenance/weave-queue.json` when it exists.
15. If any check fails, is skipped, or is blocked, append a compact entry to `.tink/maintenance/friction.jsonl` when it exists.
16. Report the result using the final report format below.

## Final report format

After writing `.tink/current/verification.json`, answer in this order:

1. **Result**: one sentence with `pass`, `fail`, or `blocked`.
2. **Checked**: short list of command and manual checks that ran, passed, failed, were blocked, or were skipped.
3. **Problems**: only include failed, blocked, or meaningful skipped checks. Omit this section when empty.
4. **Remaining**: what is still needed before the run can be called done. Use `none` or omit when nothing remains.
5. **Next action**: the smallest useful recovery or continuation step.

Keep the report compact. Do not paste raw logs. Mention `.tink/current/verification.json` and `.tink/current/evidence.md` as the evidence files when useful.

Use these result lines:

- `Verification passed: all required checks passed.`
- `Verification failed: one or more required checks failed.`
- `Verification blocked: one or more required checks could not be completed.`

In `.tink/current/verification.json`, mirror this user-facing summary under `report.result_line`, `report.checked[]`, `report.problems[]`, `report.remaining[]`, and `report.next_action`.

## Notes summary format

Append or update a compact verification block in `.tink/current/notes.md`.

Use these fields:

- `result`: `pass`, `fail`, or `blocked`
- `checked`: semicolon-separated check names
- `problems`: failed, blocked, or meaningful skipped checks; use `none` when empty
- `remaining`: work still needed before the run can be called done; use `none` when empty
- `last_safe_point`: the state the user can safely return to
- `next_action`: the smallest useful recovery or continuation step
- `evidence`: `.tink/current/verification.json`
- `evidence_summary`: `.tink/current/evidence.md`

For `pass`, set `last_safe_point` to the completed verification state and `remaining` to `none`.

For `fail`, name the failed check, keep the last safe point before completion, and make `next_action` a fix-and-rerun step.

For `blocked`, name the missing setup, evidence, approval, or platform mismatch, keep the last safe point as incomplete verification, and make `next_action` an unblock-and-rerun step.

Do not paste raw logs, full command output, stack traces, or large diffs into `notes.md`. Keep the notes summary short enough to read during resume.

## Evidence summary card

Write this file after every verification attempt:

```md
# Evidence Summary

## Done claim
- ...

## Evidence
- ...

## Not verified
- ...

## Risk
- ...

## Next action
- ...
```

In strict completion mode, the run is not done unless this file exists and every required check is represented as passed, failed, or blocked.

## Verification evidence

Write this file:

```json
{
  "timestamp": "",
  "contract": ".tink/current/contract.json",
  "surface": "claude|codex|cli|ci|repo|unknown",
  "platform": "windows|macos|linux|unknown",
  "result": "pass",
  "summary": "",
  "checks": [
    {
      "name": "",
      "kind": "command|manual",
      "status": "pass",
      "exit_code": 0,
      "required": true,
      "evidence": "",
      "failure_type": "",
      "maintenance_signal": "",
      "next_action": ""
    }
  ],
  "blocked": [],
  "maintenance_signals": [],
  "report": {
    "result_line": "",
    "checked": [],
    "problems": [],
    "remaining": [],
    "next_action": ""
  },
  "next_action": ""
}
```

## Ledger entry

Append one JSON line:

```json
{ "timestamp": "", "op_id": "verify-...", "type": "verify", "files": [".tink/current/contract.json", ".tink/current/verification.json", ".tink/current/evidence.md"], "evidence": [], "approval": "current-run", "result": "pass|fail|blocked", "rollback": "No reusable state changed." }
```

Do not create `.tink/maintenance/ledger.jsonl` if it does not exist.

## Maintenance output rules

- `ledger.jsonl` records that a verify attempt happened and points to evidence. It may record `pass`, `fail`, or `blocked`.
- `weave-queue.json` records only improvement signals: `check_failed`, `check_blocked`, and meaningful `check_skipped`.
- `friction.jsonl` records compact failure, blocked, or skipped friction for later review.
- Keep maintenance entries one line or one queue item per check.
- Use short reasons and evidence handles; never paste raw logs or full command output.
- Do not create missing maintenance files during verify. Append or update only when the target maintenance file already exists.

## Weave verification signals

When verification fails, is blocked, or reveals a meaningful optional skip, append a compact queue item:

```json
{ "id": "signal-verify-...", "harness": "<primary harness>", "run": ".tink/current", "signal": "check_failed|check_blocked|check_skipped", "check": "<name>", "reason": "<short reason>", "auto": true, "timestamp": "<ISO>" }
```

Do not create `.tink/maintenance/weave-queue.json` if it does not exist.

## Friction entry

Append one JSON line:

```json
{ "timestamp": "", "source": "verify", "type": "check_failed|check_blocked|check_skipped", "check": "", "reason": "", "contract": ".tink/current/contract.json", "evidence": ".tink/current/verification.json" }
```

Do not create `.tink/maintenance/friction.jsonl` if it does not exist.

## Do not

- Do not mark work done without running or explicitly skipping required checks.
- Do not paste raw logs into memory, notes, or the final answer.
- Do not add new reusable rules from one failed check unless the user separately approves a weave/save payload.
- Do not run publish, deploy, push, tag, delete, or credential-touching commands without explicit approval.
