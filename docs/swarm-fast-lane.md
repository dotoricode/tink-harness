# Evidence Split / Parallel Evidence Research Plan

This document describes the step before multi-agent parallelism: Tink should first split large work into small evidence packets without becoming a separate runtime. The goal is not to spawn more agents by default. The goal is to separate probe, patch, verify, review, and decision work into tiny context packets so the main agent reduces rework and context load.

## Problem

Naive multi-agent parallelism usually spends more tokens. Each worker rereads context, independent edits conflict, and the main agent still pays a reconciliation cost.

Evidence Split inverts that model.

- Packets do not understand the whole task.
- Packets do not read broad context.
- If external workers are used, they do not edit files by default.
- Worker output is limited to short evidence and patch candidates.
- The main agent chooses the final path and owns file edits.

## Core Hypothesis

When a task can be split into small contracts with clear boundaries, several workers with narrow observations may reduce rework and main-agent context load compared with one agent scanning broad context sequentially.

The first success metric is not "always faster than Codex fast mode." Tink can directly control these metrics instead:

- less total context read by the main agent
- less rework
- earlier failure detection
- bounded worker-output reconciliation cost
- equal or better final verification pass rate

## Biological Model

Like an ant colony, each worker responds to a local signal rather than reading the whole map.

Examples:

- one worker finds test locations only
- one worker checks public contract risk only
- one worker checks docs drift only
- one worker proposes one small patch strategy only

The main agent acts more like an immune system than a central commander. It rejects conflicts, duplicates, security risks, and missing verification before accepting any candidate.

## Quantum Model

Workers are possibility samplers, not final implementers. Several patch paths stay tentative until the main agent collapses one path based on evidence.

Rules:

- Pre-observation state: patch candidate, risk candidate, test candidate.
- Observation condition: evidence handle, file reference, expected check.
- Collapse condition: smallest edit, lowest conflict risk, clearest verification.
- Rejection condition: broad context demand, direct edit requirement, weak evidence.

## Cosmological Model

The task is split into local universes with weak causal links.

- Files sharing a public API, schema, or command surface stay in the same region.
- Separate docs, tests, and fixtures can become independent exploration candidates.
- Public contracts, release surfaces, schemas, and CLI surfaces are high-gravity boundaries edited only by the main agent.

## Proposed Modes

### parallel-probe

Workers do not edit files. They only find related files, risks, and test candidates. This should be the first default mode.

### patch-candidate-race

Workers propose different minimal patch strategies. The main agent picks one and applies it.

### micro-contract-split

The main agent splits work into 3-5 small contracts. Each worker reviews one contract.

### speculative-verifier

Workers look only for reasons the current implementation approach will fail. This can be safer and cheaper than parallel implementation.

### context-starvation-mode

Workers intentionally receive incomplete minimal context. The point is not high-quality implementation; it is cheaply detecting problems that are visible with little information.

## Core Behavior Contract

Evidence Split is not a separate harness. It is default behavior inside `/tink:cast` and `$tink:cast`. Use it when:

- the task splits into 2-5 independent packets
- each packet is limited to 1-3 input files or questions
- each packet type is `probe`, `patch`, `verify`, `review`, or `decision`
- work should be re-split during implementation because uncertainty, failed checks, context sprawl, or coupled changes appeared
- future worker output is limited to 300 words
- external workers do not edit files by default
- worker output includes evidence, recommended action, and confidence
- the main agent owns final patching and verification

Do not select it when:

- public contract boundaries are unclear
- secrets, credentials, or private payloads are required
- workers need a broad repository scan
- multiple workers must edit the same files
- reconciliation is likely to cost more than a single base run

## Metrics

The first version can start with estimates, but run artifacts should record evidence.

- `worker_count`
- `packet_count`
- `input_context_refs`
- `worker_output_words`
- `accepted_candidates`
- `rejected_candidates`
- `merge_conflicts_avoided`
- `main_context_saved_estimate`
- `checks_passed`
- `checks_failed_or_blocked`

## Done Criteria

The first implementation slice is done when:

- Evidence Split is documented as default behavior in Tink core rules and `/tink:cast`, `$tink:cast`
- packet format is represented in `steps.json`, `context-map.json`, `notes.md`, and optionally `.tink/current/delegation.md`
- direct worker edits are disabled by default
- tiny work can skip the packet ceremony
- verification records context reduction and rework reduction evidence instead of claiming raw speed

## Open Questions

- Should actual worker execution call existing Codex/Claude Code features, or should Tink only document packets?
- Should worker result schema extend `delegation-brief`, or should it use a separate runtime artifact?
- Keep `swarm-fast-lane` only as a research placeholder; prefer Evidence Split or Parallel Evidence in user-facing copy.
