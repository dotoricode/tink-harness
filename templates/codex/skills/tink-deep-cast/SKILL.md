---
name: "Tink: Deep Cast"
description: Run a structured interview before harness selection, without changing cast_mode in config.json.
---

# Tink Deep Cast

This is the Codex alias for `$tink:deep-cast <task>`.

1. Read `../tink-core/RULES.md` first.
2. Treat this invocation as `$tink:cast <task>` with `cast_mode` forced to `deep` for this run only.
3. Do **not** modify `cast_mode` in `.tink/config.json`.
4. Always run the structured interview (Round 0 구성 파악 + Rounds 1–10) before harness selection.
5. After the interview produces a spec, proceed to the full Procedure starting at step 3.
6. Follow the canonical Tink operating rules, approval gates, run state, and verification policy.
7. Accept legacy `$tink deep-cast <task>` wording as the same action, but present `$tink:deep-cast <task>` in guidance.
