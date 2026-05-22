# Mistakes

Record repeated mistakes that should not happen again.

Rules:
- Save only after user approval.
- Keep entries short and reusable.
- Do not store raw logs, full diffs, secrets, private data, or one-off task progress.
- Use compact evidence handles so future hone/purge decisions can trace the entry.

Entry shape:
```text
- [YYYY-MM-DD] kind=mistake; source=<run-id|user>; applies_to=<harness|global>; note=<one sentence>; approval=<op-id>
```

## Entries

- [2026-05-23] kind=mistake; source=run-20260523-1430-knitting-rename; applies_to=global; note=PowerShell WriteAllText(path, content, Encoding.UTF8)는 BOM(0xEF 0xBB 0xBF)을 추가해 JSON 파싱 실패를 유발한다. New-Object System.Text.UTF8Encoding($false)로 BOM 없이 써야 한다.; approval=op-20260523-bom
