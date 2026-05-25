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

## Procedure

1. Read `.tink/current/contract.json` first.
2. Validate that `task_type`, `success_conditions`, `forbidden`, and `verification` are present.
3. List the checks that will run. Keep the list short and evidence-oriented.
4. For each `verification.commands[]` entry:
   - run exactly the command listed, unless it is destructive or externally visible;
   - if the command is risky, ask for approval first;
   - capture pass/fail, exit code, and a short evidence handle.
5. For each `verification.manual_checks[]` entry, inspect the named file or artifact and record pass/fail/manual-skip.
6. Write `.tink/current/verification.json` with compact evidence: check name, status, exit code when available, evidence handle, and timestamp. Do not include raw logs.
7. Update `.tink/current/notes.md` with a compact verification summary.
8. If all required checks pass, append a `verify` entry to `.tink/maintenance/ledger.jsonl` when it exists.
9. If any required check fails or is skipped, append a `check_failed` signal to `.tink/maintenance/weave-queue.json` when it exists.
10. If any required check fails, is skipped, or was blocked by missing setup, append a compact entry to `.tink/maintenance/friction.jsonl` when it exists.
11. Report the result in plain language: pass/fail, what was checked, what remains.

## Verification evidence

Write this file:

```json
{
  "timestamp": "",
  "contract": ".tink/current/contract.json",
  "result": "pass",
  "checks": [
    {
      "name": "",
      "status": "pass",
      "exit_code": 0,
      "required": true,
      "evidence": ""
    }
  ]
}
```

## Ledger entry

Append one JSON line:

```json
{ "timestamp": "", "op_id": "verify-...", "type": "verify", "files": [".tink/current/contract.json"], "evidence": [], "approval": "current-run", "result": "pass|fail|blocked", "rollback": "No reusable state changed." }
```

## Weave failure signal

When verification fails, append a compact queue item:

```json
{ "id": "signal-verify-...", "harness": "<primary harness>", "run": ".tink/current", "signal": "check_failed", "check": "<name>", "auto": true, "timestamp": "<ISO>" }
```

Do not create `.tink/maintenance/weave-queue.json` if it does not exist.

## Friction entry

Append one JSON line:

```json
{ "timestamp": "", "source": "verify", "type": "check_failed|check_skipped|blocked", "check": "", "contract": ".tink/current/contract.json", "evidence": ".tink/current/verification.json" }
```

Do not create `.tink/maintenance/friction.jsonl` if it does not exist.

## Do not

- Do not mark work done without running or explicitly skipping required checks.
- Do not paste raw logs into memory, notes, or the final answer.
- Do not add new reusable rules from one failed check unless the user separately approves a weave/save payload.
- Do not run publish, deploy, push, tag, delete, or credential-touching commands without explicit approval.
