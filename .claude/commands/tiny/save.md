# /tiny:save

Save a new or improved Tink harness after user approval.

## Rules
- Never save automatically.
- Save only reusable procedures, not one-off task state.
- Keep each harness under 100 lines when possible.
- Do not store raw logs, full diffs, secrets, customer data, issue numbers, or temporary progress.
- Update `.tiny/harnesses/index.json` after saving.

## Harness sections
- When to use
- Ask first
- Plan
- Checks
- Done means
- If it fails, Tink back
