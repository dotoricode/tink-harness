# ADR 0003: Add Stitch to Forge

## Status

Accepted

## Context

Tink's main path is `/tink:cast`: it chooses or drafts a small harness, creates visible run state, and starts the first safe step after approval.

Users often give short or underspecified prompts. If Tink proceeds immediately, it can choose the wrong harness, start without success criteria, or miss a decision that materially changes quality or safety.

At the same time, Tink should not become an interview-heavy workflow. Its command surface should remain small, and v1.0.0 should remain a command/skill contract rather than a separate runtime or multi-agent system.

## Decision

Add Stitch to `/tink:cast`.

Stitch is a lightweight internal quality gate that challenges Tink's initial harness or plan decision before `.tink/current/` is committed.

For v1.0.0:

- Stitch is integrated into `/tink:cast`, not exposed as a separate command.
- Stitch is a logical internal evaluator role, not a real independent subagent.
- Stitch runs once before `/tink:cast` commits to `.tink/current/`.
- Stitch is evaluated every time, but user-visible only when it finds a high-impact quality or safety branch.
- When visible, Stitch shows exactly one proposal.
- The visible proposal uses this order: proposal, reason, choices.
- Stitch may change the order or method of work, but not the user's goal without separate approval.
- A clean internal Stitch pass is not recorded.
- A triggered Stitch is recorded only in current run state by default.

## Gate Strength

Stitch uses a risk-based gate.

Default behavior is a soft gate. Tink proposes the quality-improving step, but the user may choose to continue as-is. If the user continues, Tink proceeds with explicit assumptions and records them in `.tink/current/answers.md`.

Hard gates apply when the next action is difficult or unsafe to reverse, including:

- reusable memory or harness saves
- harness creation, edits, purge, or hone operations
- deleting files or removing configuration
- publishing, deploying, tagging, releasing, or opening a public PR
- changing broad architecture or public contracts
- using secrets, credentials, payments, or personal data
- running destructive or external side-effect commands

Hard gates must not offer `Continue as-is` or `이대로 진행`.

## Proposal Priority

When multiple Stitch triggers are present, choose one proposal by this order:

1. Safety or irreversibility.
2. Success criteria or verification.
3. Goal or scope ambiguity.
4. Harness mismatch.
5. Reusable improvement opportunity.

## Language

Stitch follows `.tink/config.json`.

If language is explicit, use that language for proposal wording and choice labels.

If language is `auto`, use the current user message language and fall back to English only when unclear.

Soft gate canonical choices:

1. Approve
2. Add requirements
3. Continue as-is

Hard gate canonical choices:

1. Approve
2. Add requirements
3. Cancel

Korean localized choices:

- Soft gate: `승인`, `요구사항 입력`, `이대로 진행`
- Hard gate: `승인`, `요구사항 입력`, `취소`

## Reusable State Save Gate

Reusable State Save Gate is a separate absolute rule, not merely a Stitch subtype.

It applies even if Stitch is skipped or passes cleanly.

Any attempt to write reusable state requires a separate hard approval gate. Current-run approval does not authorize reusable-state writes.

Reusable state includes:

- `.tink/memory/*`
- `.tink/harnesses/*`
- `.tink/harnesses/index.json`
- `.tink/config.json` policy changes
- `.claude/` commands, skills, settings, or hooks
- template/plugin files that affect future installs

Before reusable-state writes, Tink must show a separate approval payload:

- operation
- destination files
- exact entry text or patch summary
- why it is reusable
- sensitive/private content excluded
- rollback or removal path

Reusable-state approval choices are `Approve`, `Add requirements`, and `Cancel`, localized when appropriate. Do not offer `Continue as-is`.

## Rejected Alternatives

### Separate `/tink:grill` command

Rejected because it expands the command surface and requires users to remember another command.

### Real independent subagent in v1

Rejected because v1 should remain a command/skill contract, not a multi-agent runtime.

### Multiple questions for ambiguous prompts

Rejected because Tink should show one highest-impact proposal, not turn every task into an interview.

## Consequences

Tink can catch underspecified prompts and high-impact quality branches before committing to a run plan.

The user may see one extra proposal before a non-trivial run, but only when the gate finds a meaningful quality or safety risk.

The v1.0.0 release scope grows because `/tink:cast` command docs, skill docs, context glossary, README wording, and static contract tests must include the gate contract.

Reusable memory and harness changes remain approval-first and cannot be bundled into current-run approval.
