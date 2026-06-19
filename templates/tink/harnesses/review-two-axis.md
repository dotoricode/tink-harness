# review-two-axis

## When to use
Use when the user asks to review a branch, PR, work-in-progress diff, or changes since a fixed point, and the review should separate code standards from product/spec correctness.

Good triggers:
- "review this PR", "review since main", "check this branch"
- changes that should be judged against both repo conventions and a spec, issue, PRD, or user request
- broad diffs where one kind of review could mask the other

Do not use this for security review unless the user explicitly requests security or the diff touches auth, secrets, payments, or permissions. Use the appropriate security workflow instead.

## Ask first
- What is the fixed point: commit, branch, tag, PR, or merge-base?
- What spec, issue, PRD, or user request should the diff satisfy?
- Which standards sources matter: AGENTS.md, CONTRIBUTING.md, README, ADRs, lint rules, or local conventions?
- Should the output be findings only, or findings plus suggested fixes?

Do not repeat questions already answered in `.tink/current/answers.md`.

## Plan
1. Resolve the fixed point and confirm the diff is non-empty.
2. Capture the comparison command and commit list in `.tink/current/notes.md`.
3. Identify the spec source:
   - linked issue or PR,
   - provided path,
   - PRD/spec under docs,
   - conversation request,
   - or "no spec available" if none exists.
4. Identify standards sources:
   - repo instructions,
   - contribution docs,
   - ADRs,
   - style guides,
   - tests or tooling expectations.
5. Review along two separate axes:
   - Standards: violations of documented repo practice, maintainability, test style, compatibility, and local conventions.
   - Spec: missing requirements, incorrect behavior, extra scope, and acceptance criteria gaps.
6. Keep findings evidence-first:
   - file and line when available,
   - cited spec or standard,
   - severity and consequence,
   - concise fix direction.
7. Aggregate without blending the axes. Do not let a clean Standards review hide a Spec failure, or the reverse.
8. If applying fixes is in scope, ask for approval or continue only when the original task included implementation.

## Checks
- The fixed point resolves and the diff is non-empty.
- Standards and Spec are reported separately.
- Each finding cites evidence and explains user or maintenance impact.
- Missing spec is reported as a review limitation, not guessed around.
- Tool-enforced style issues are not over-reported unless tooling is absent or failing.
- Final summary names the worst issue within each axis, if any.

## Done means
- The user can see whether the change follows repo standards.
- The user can see whether the change satisfies the originating request.
- Findings are actionable and ordered by severity within each axis.
- Review limitations and skipped axes are explicit.

## If it fails, Tink back
Return to the last resolved input. If the fixed point is invalid, ask for a valid ref. If the spec is missing, continue with Standards only after stating the limitation.
