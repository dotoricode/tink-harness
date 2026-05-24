# Versioning

Current version: `1.0.0`

Tink follows semver from `1.0.0` onward.

## Source of truth

Keep these versions aligned for every versioned release:

- `package.json`
- `package-lock.json`
- `.claude-plugin/plugin.json`
- `CHANGELOG.md`

Claude Code uses `.claude-plugin/plugin.json` to decide whether plugin users can receive an update. If this value does not change, `/plugin update` can report that the plugin is already latest even after new commits.

## Bump rules

Use semver.

- Patch, for example `1.0.1`: docs, tests, installer polish, command wording, small template fixes, non-breaking maintenance structure.
- Minor, for example `1.1.0`: new command behavior, meaningful installer flow change, new persisted state shape, or anything existing users should deliberately notice — all backwards compatible.
- Major, for example `2.0.0`: breaking change to the command surface, plugin contract, persisted state shape, or installer flow that existing users must migrate for.

## Release checklist

Before pushing a versioned release:

1. Update `package.json`, `package-lock.json`, and `.claude-plugin/plugin.json` to the same version.
2. Add a `CHANGELOG.md` entry for the version.
3. Confirm README update instructions still match the actual Claude Code plugin path.
4. Run:

```bash
npm test
```

```bash
git diff --check
```

```bash
claude plugin validate .claude-plugin/plugin.json
```

```bash
claude plugin validate .claude-plugin/marketplace.json
```

```bash
npm pack --dry-run --json
```

5. Push and verify GitHub Actions CI.

## Existing-user update path

Claude Code plugin users:

```text
/plugin marketplace update tink-harness
/plugin update tink@tink-harness
/reload-plugins
```

Standalone compatibility installer users:

```bash
npx tink-harness@latest update
```

`update` preserves user-modified files. The `--force` flag is reserved for emergency repair and is not the recommended path.
