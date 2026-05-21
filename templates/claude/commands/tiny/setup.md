# /tiny:setup

Set up Tink for this Claude Code project.

## Goal
Prepare a small, readable harness system that helps Claude avoid repeated mistakes, preserve context, and ask before adding new project memory.

## Steps
1. Check `.tiny/config.json`, `.tiny/harnesses/index.json`, and `.tiny/memory/` exist.
2. Explain the default flow in three lines:
   - Use `/tiny:use` before non-trivial work.
   - Tink suggests 1-4 harnesses and asks for approval.
   - New or improved harnesses are saved only after approval.
3. Ask at most three setup questions:
   - Should Tink use compact mode? Default: yes.
   - Should Tink suggest hooks for prompt review? Default: ask before enabling.
   - Should project harnesses be committed? Default: harnesses yes, runs no.
4. Do not edit `CLAUDE.md` automatically. Offer a short copy-paste block only if useful.

## Tone
Calm, clear, concise. No jokes.
