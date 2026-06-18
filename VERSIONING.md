# Versioning

Current version: `1.12.0`

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

- Patch, for example `1.1.2`: docs, tests, installer polish, command wording, small template fixes, non-breaking maintenance structure. Prefer a patch release for each user-visible improvement instead of letting many small changes pile up in `[Unreleased]`.
- Minor, for example `1.1.0`: new command behavior, meaningful installer flow change, new persisted state shape, or anything existing users should deliberately notice — all backwards compatible.
- Major, for example `2.0.0`: breaking change to the command surface, plugin contract, persisted state shape, or installer flow that existing users must migrate for.

## Release checklist

Before publishing a versioned release, always work from a release branch and merge by squash. Do not commit release work directly to `main`; a direct `main` commit makes it impossible to attach the release to a normal PR without rewriting published history.

1. Create a release branch.
2. Update `package.json`, `package-lock.json`, and `.claude-plugin/plugin.json` to the same version.
3. Add a `CHANGELOG.md` entry for the version.
4. Confirm README update instructions still match the actual Claude Code plugin path.
5. Write the PR title with `fix`, `feat`, `chore`, or `docs`, and write the PR body in Korean using the relevant subtitles from `Problem`, `Fix`, `Summary`, `Changes`, `Behavior`, and `Testing`.
6. Run:

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

7. Push the branch, open a PR, and verify GitHub Actions CI.
8. Squash merge the PR into `main`. Do not use merge commits or rebase merge for release PRs.
9. Create the version tag from the squash commit on `main`.
10. Create the GitHub release. The body should list merged PRs as linked entries and use a linked compare range, for example:

```md
## What's Changed

- feat(scope): concise change summary by @author in #123

**Full Changelog**: [v1.7.1...v1.8.0](https://github.com/dotoricode/tink-harness/compare/v1.7.1...v1.8.0)
```

11. Publish to npm only after the GitHub release and package verification are complete.

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

## Release pacing

Batch small fixes on `main` and aim for at most about one release per day. Rapid version churn reads as instability to first-time visitors; a release should bundle a coherent set of changes with a short, plain note.
