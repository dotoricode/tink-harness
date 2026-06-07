# Memory

Tink memory is for preventing repeated frustration.

## Save

- repeated mistakes
- stable preferences
- reusable lessons

## Decision layers

- `approved/`: reusable memory that the user explicitly approved and Tink may load.
- `candidate/`: possible memory that must stay a proposal until approved.
- `rejected/`: declined or replaced proposals so Tink does not keep asking.
- `evidence/`: compact evidence handles for approved memory.

The legacy files `mistakes.md`, `preferences.md`, and `lessons.md` remain compatible.

## Do not save

- raw logs
- full diffs
- secrets
- private data
- one-off task progress
- stale issue or PR numbers

## Rule

Memory changes require user approval.
