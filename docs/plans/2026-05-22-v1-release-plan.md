# Tink v1.0.0 Release Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Ship Tink v1.0.0 as a small, reliable Claude Code harness pack that can be installed with `npx`, used in a fresh repo, and trusted through visible run state and approval-first saves.

**Architecture:** Tink remains a template installer plus Claude Code command/skill pack. The v1.0.0 work should harden install, command contracts, docs, package metadata, and release automation rather than turning Tink into a standalone agent runtime.

**Tech Stack:** Node ESM installer, @clack/prompts, Python unittest static/contract tests, GitHub Actions, npm package release.

---

## Current verified state

- Repo: `D:/hermes/tink-harness`
- Git: `main...origin/main`, only existing untracked `.serena/`
- Version: `0.1.0`
- npm registry: `tink-harness` currently returns `E404`, so no published package is visible yet
- Local tests: `npm test` passes, 14 tests OK
- Latest CI: success at `https://github.com/dotoricode/tink-harness/actions/runs/26246615439`
- Dry package: `npm pack --dry-run` includes 26 files, about 80 KB unpacked

## v1.0.0 release bar

Tink v1.0.0 is ready only when all are true:

1. Fresh repo install works from the packaged artifact without relying on the local clone.
2. `/tink:setup`, `/tink:forge`, `/tink:list`, `/tink:purge`, `/tink:hone` are present and internally consistent.
3. Optional hook registration writes a real Claude Code `UserPromptSubmit` entry and remains advisory-only.
4. `.tink/current/` lifecycle is documented, tested by contract, and usable for recovery.
5. `.tink/runs/` record schema is explicit enough for list/purge/hone maintenance commands.
6. README install instructions match the actual publication state.
7. Package metadata, files, bin, license, repository, and keywords are correct.
8. Release workflow is repeatable: test, pack, install smoke test, tag, publish, verify GitHub/npm.
9. No CupMargin, prompt-grill, private acorn operating context, raw logs, or unrelated artifacts are part of the public package.

## Phase 0: Release decision and guardrails

### Task 0.1: Freeze v1.0.0 scope

**Objective:** Make v1.0.0 a hardening/release milestone, not a product expansion.

**Files:**
- Modify: `docs/plans/2026-05-22-v1-release-plan.md`

**Step 1:** Confirm these are in scope:
- install/package/release hardening
- smoke tests
- docs matching actual behavior
- command contract consistency
- npm/GitHub release

**Step 2:** Keep these out of scope unless explicitly re-approved:
- standalone CLI agent runtime
- multi-agent orchestration
- web UI
- telemetry/analytics
- automatic memory saving
- automatic hook execution beyond one advisory line

**Verification:** Plan remains focused on shipping the current product shape.

## Phase 1: Audit package and install path

### Task 1.1: Add package contents regression test

**Objective:** Ensure `npm pack` always includes every file needed by installed Tink and excludes development-only files.

**Files:**
- Modify: `tests/test_templates.py`

**Implementation idea:** Add a test that runs `npm pack --dry-run --json`, parses the file list, and asserts required files:
- `bin/install.js`
- `templates/claude/commands/tink/setup.md`
- `templates/claude/commands/tink/forge.md`
- `templates/claude/skills/tink/SKILL.md`
- `templates/tink/harnesses/index.json`
- `templates/tink/hooks/user-prompt-submit.mjs`
- `templates/tink/memory/mistakes.md`
- `README.md`
- `LICENSE`

Also assert excluded files:
- `tests/`
- `.tink/`
- `.claude/`
- `.serena/`
- `docs/plans/`

**Verification command:**
```bash
npm test
```

### Task 1.2: Add installed artifact smoke test

**Objective:** Prove the packaged tarball can install into a clean temp repo.

**Files:**
- Modify: `tests/test_templates.py`

**Implementation idea:** In a temp dir:
1. run `npm pack --json`
2. create another temp dir as target repo
3. run `node <extracted-or-local-bin> install --lang=ko --yes --force --scope=repo`
4. assert installed command, skill, harness, memory, and config files

If full tarball execution is too heavy for unittest, create a script under `scripts/smoke-install.mjs` and call it from CI.

**Verification command:**
```bash
npm test
```

### Task 1.3: Verify global install path

**Objective:** Ensure `--global` does not accidentally write repo-local paths into global hook commands.

**Files:**
- Modify: `tests/test_templates.py`
- Possibly modify: `bin/install.js`

**Verification cases:**
- repo `--with-hook` command uses `.tink/hooks/user-prompt-submit.mjs`
- global `--with-hook` command uses an absolute path under the chosen global target
- both write `.claude/settings.json` with `hooks.UserPromptSubmit`

**Verification command:**
```bash
npm test
```

## Phase 2: Command contract hardening

### Task 2.1: Strengthen list/purge/hone contract around run records

**Objective:** Ensure maintenance commands can consume the run-record schema emitted by forge.

**Files:**
- Modify: `templates/claude/commands/tink/list.md`
- Modify: `templates/claude/commands/tink/purge.md`
- Modify: `templates/claude/commands/tink/hone.md`
- Modify: `tests/test_templates.py`

**Expected behavior:**
- `/tink:list` reads `.tink/runs/*.md` frontmatter when present and reports selected harnesses, outcomes, checks result, and maintenance suggestions.
- `/tink:purge` uses run records as evidence, not just file age.
- `/tink:hone` can consume purge handoff packets and run-record failure evidence.

**Verification command:**
```bash
npm test
```

### Task 2.2: Add current-run archive/teardown fixture

**Objective:** Make `.tink/current/` lifecycle testable, not only described.

**Files:**
- Create: `tests/fixtures/current-run/plan.md`
- Create: `tests/fixtures/current-run/checks.md`
- Create: `tests/fixtures/current-run/steps.json`
- Create: `tests/fixtures/current-run/notes.md`
- Create: `tests/fixtures/current-run/answers.md`
- Modify: `tests/test_templates.py`

**Verification:** Static tests confirm required lifecycle wording and schema examples match the fixture fields.

## Phase 3: README and release docs truthfulness

### Task 3.1: Fix npm instruction truthfulness before first publish

**Objective:** Avoid advertising `npx tink-harness@latest` as available before npm publication is actually verified.

**Files:**
- Modify: `README.md`
- Modify: `tests/test_templates.py`

**Decision:** Until publish succeeds, README should make GitHub install the reliable path and mark npm as release path.

Recommended wording before publish:
```md
Development install from GitHub:

npx github:dotoricode/tink-harness

After v1.0.0 is published to npm:

npx tink-harness@latest
```

After npm verify, flip npm back to the primary path.

**Verification:**
```bash
npm view tink-harness version --json
npm test
```

### Task 3.2: Add release checklist

**Objective:** Make v1 release repeatable.

**Files:**
- Create: `docs/release.md`
- Modify: `README.md` if linking is useful

**Checklist:**
1. `git status --short --branch`
2. `npm test`
3. `git diff --check`
4. `npm pack --dry-run --json`
5. temp install without hook
6. temp install with hook and inspect `.claude/settings.json`
7. update version to `1.0.0`
8. commit `v1.0.0 release prep`
9. tag `v1.0.0`
10. publish npm
11. verify `npm view tink-harness version`
12. verify GitHub release and CI

## Phase 4: Version and publication

### Task 4.1: Bump package version to 1.0.0 only after hardening tasks pass

**Objective:** Avoid a symbolic v1 tag before install and docs are truthful.

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Command:**
```bash
npm version 1.0.0 --no-git-tag-version
```

**Verification:**
```bash
node -e "const p=require('./package.json'); if (p.version !== '1.0.0') process.exit(1)"
npm test
```

### Task 4.2: Tag, publish, and verify

**Objective:** Publish v1.0.0 only after local and CI evidence are clean.

**Commands:**
```bash
git status --short --branch
npm test
git diff --check
npm pack --dry-run --json
git add package.json package-lock.json README.md docs/ tests/ templates/ bin/
git commit -m "Tink v1.0.0 릴리스 준비"
git tag v1.0.0
git push origin main --tags
npm publish --access public
npm view tink-harness version --json
```

**Verification:**
- GitHub Actions success on the release commit
- npm registry returns `"1.0.0"`
- `npx tink-harness@latest install --lang=ko --yes --dry-run` works from outside the repo

## Recommended first implementation slice

Start with Phase 1 and Phase 3.1 together:

1. Add package contents and smoke-install tests.
2. Fix README so install instructions are truthful while npm is still unpublished.
3. Run `npm test`, `git diff --check`, and `npm pack --dry-run --json`.

This gives the fastest risk reduction before touching version numbers or publishing.
