# MCP Safe Profile

Phase 4 defines how Tink should use external context safely.

External context means information that does not live in the repo but may be needed to make a good decision. Examples include Figma frames, GitHub PRs or issues, Linear or Jira tickets, deployment logs, database dashboards, official docs, API responses, screenshots, and user attachments.

This phase is not about making one or two tools the only supported sources. Figma, GitHub, official docs, dashboards, and attachments are representative examples. The goal is a general safety profile for any outside context source.

## Why This Is Needed

External context can make Tink much more useful, but it also creates risk.

### Trust Risk

Outside information can be stale, partial, speculative, or from the wrong environment.

For example:

- A Figma frame may be approved design, a draft, or an outdated experiment.
- A GitHub issue may contain clear acceptance criteria or only discussion.
- Official docs may describe current behavior or an older version.
- A dashboard screenshot may be useful but not enough to prove the current state.

Tink should not treat all external context as equal. It should record where the context came from, why it was included, and how confident it is.

### Scope Risk

Too much outside context can make a run worse.

One Figma frame can clarify a UI change. A full design file can pull the task away from the requested slice. One GitHub issue can clarify scope. A whole project board can distract the run. One docs section can resolve an API question. A full documentation site can be too broad.

Tink should include only the external context needed for the current contract and record skipped external context in `excluded-context.md`.

### Safety Risk

External context may contain secrets, tokens, internal URLs, customer data, personal information, or private business details.

Tink should not store raw sensitive content in `.tink/current/`, `.tink/runs/`, notes, memory, or maintenance files. It should keep evidence handles and short summaries instead of copying raw external data.

## How It Will Be Used

When `/tink:cast` or `$tink:cast` needs external context, Tink should treat each source as an evidence item with a safety profile.

For each external source, record:

- `source`: where it came from, such as Figma, GitHub, Linear, docs, attachment, or dashboard.
- `source_ref`: the smallest useful reference, such as an issue id, frame id, PR number, URL label, or attachment name.
- `included`: what was used.
- `excluded`: what was intentionally not used.
- `reason`: why it matters for this run.
- `confidence`: high, medium, or low.
- `sensitivity`: public, internal, sensitive, or secret.
- `verification_hint`: any follow-up check needed before claiming the work is done.

This information should flow into the current run artifacts:

```text
external source
-> context-map.json included/excluded entries and signals
-> context-pack.md short human summary
-> excluded-context.md skipped or unsafe outside context
-> contract.verification.manual_checks[] when external evidence needs verification
```

## Examples

### Figma

If the user asks Tink to implement a design from Figma:

- Include the selected frame id, relevant component names, layout constraints, text changes, color or spacing tokens, and interaction notes.
- Exclude unrelated pages, draft alternatives, hidden layers, comments outside the requested scope, and assets that should not be copied into the repo.
- Mark uncertainty when the frame is not clearly approved or current.
- Add verification hints for screenshot comparison, responsive behavior, or visual QA.

### Other Sources

The same profile can apply to:

- GitHub issues or pull requests
- Linear or Jira tickets
- Supabase dashboard evidence
- deployment logs
- official documentation
- screenshots or pasted attachments
- internal runbooks
- API responses

The connector name is less important than the safety rule: include only what the task needs, cite the source, mark confidence, exclude unsafe or stale context, and connect important claims to verification.

## Advantages

MCP Safe Profile gives Tink a safer external-context habit:

- External context becomes traceable instead of invisible.
- Figma, GitHub, official docs, dashboards, and attachments are supported without hard-coding them as the only source types.
- Stale, speculative, or low-confidence outside claims are less likely to become hidden assumptions.
- Sensitive data is less likely to be copied into run state or reusable memory.
- `context-map.json` can explain why an outside source was used.
- `excluded-context.md` can explain why an outside source was skipped.
- `/tink:verify` and `$tink:verify` can connect external claims to manual checks.
- Claude Code and Codex can follow the same external-context policy.
- macOS and Windows behavior stays portable because the profile is data- and evidence-oriented, not shell-specific.

## Boundaries

MCP Safe Profile must not:

- create a new public command surface;
- make any single connector mandatory;
- fetch broad external context by default;
- store raw secrets, tokens, customer data, or private payloads;
- treat external claims as verified without evidence;
- replace normal verification flow.

If external context is useful but unsafe to store, keep a short evidence handle and record the reason in `excluded-context.md`.

If external context is unavailable, record the missing source as a blocked or low-confidence signal rather than inventing certainty.
