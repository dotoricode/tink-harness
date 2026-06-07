# Memory Decision Layers

Tink memory should separate decisions from suggestions.

Installed memory folders:

- `.tink/memory/approved/`: approved reusable memory that may be loaded.
- `.tink/memory/candidate/`: possible memory that must not be loaded as a rule yet.
- `.tink/memory/rejected/`: proposals the user declined or replaced.
- `.tink/memory/evidence/`: compact handles explaining why approved memory exists.

The older files `mistakes.md`, `preferences.md`, and `lessons.md` remain compatible. Newer workflows should prefer the decision folders when the distinction matters.

Do not store secrets, raw logs, full diffs, private payloads, or one-off task progress. Saving reusable memory always requires separate approval.
