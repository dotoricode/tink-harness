# Excluded Context

## Files
- `bin/install.js`: excluded because schema directory copying is already generic.
- `package.json`: excluded because this fixture does not require a version or dependency change.

## External Sources
- External articles and research links are excluded because this task can be verified from local repo behavior.
- Figma unrelated pages and hidden draft layers are excluded because they are outside the selected frame scope.
- GitHub unrelated discussion and stale workaround comments are excluded because they do not affect the acceptance check.
- Official docs examples from older versions are excluded because they may not describe current behavior.
- Deployment dashboard evidence is blocked when access is unavailable; keep a short evidence handle instead of inventing certainty.

## Deferred Work
- Public graph indexing is intentionally excluded. Context Graph Lite stays inside `/tink:cast` and `$tink:cast`; it does not create a `tink index` command, watcher, generated cache, or hidden runtime index.
- Broad external connector automation is deferred until the MCP Safe Profile is represented by fixtures and tests.
