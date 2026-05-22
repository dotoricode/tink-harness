# Preferences

Record stable project or user preferences that reduce repeated steering.

Rules:
- Save only after user approval or explicit instruction.
- Use short declarative bullets.
- Do not store temporary task state.
- Use compact evidence handles when the preference came from a run.

Entry shape:
```text
- [YYYY-MM-DD] kind=preference; source=<run-id|user>; applies_to=<harness|global>; note=<one sentence>; approval=<op-id|explicit-user>
```

## Entries
