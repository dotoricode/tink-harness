# Research notes

Tink was shaped by a small survey of harness, agent, workflow, and skill projects. The survey goal was to learn invariants, not copy implementations.

## Borrowed principles

- Small composable skills reduce setup friction.
- Feedback loops are the speed limit.
- Handoffs and guardrails should be explicit.
- State and recovery matter, but a full workflow engine is too heavy for Tink v0.
- Verification should happen before completion claims.
- Repeated mistakes should become short reusable rules after approval.

## Product decision

Tink v0 is Claude Code-only. This keeps the first version easy to understand and install.
