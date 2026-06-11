from pathlib import Path
import hashlib
import fnmatch
import json
import os
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
NPM = 'npm.cmd' if os.name == 'nt' else 'npm'

REQUIRED_README = [
    'Why I made this',
    'Install',
    'Commands',
    'How it works',
    'What Tink is not',
]

HARNESS_SECTIONS = [
    '## When to use',
    '## Ask first',
    '## Plan',
    '## Checks',
    '## Done means',
    '## If it fails, Tink back',
]

EXPECTED_COMMANDS = {'setup.md', 'cast.md', 'verify.md', 'list.md', 'frog.md', 'weave.md', 'update.md'}
EXPECTED_INSTALLED_COMMANDS = {'setup.md', 'cast.md', 'verify.md', 'list.md', 'frog.md', 'weave.md', 'update.md'}
EXPECTED_CODEX_SKILLS = {
    'tink-cast',
    'tink-verify',
    'tink-list',
    'tink-setup',
    'tink-frog',
    'tink-weave',
    'tink-update',
}
FORBIDDEN_INDEX_SURFACES = {'index.md', 'tink-index.md'}
CONTEXT_EFFICIENCY_METRICS = {
    'unnecessary_context_reduction',
    'initial_context_pack_size_reduction',
    'review_evidence_lookup_time_reduction',
    'verification_omission_detection',
    'repeated_context_reuse_accuracy',
    'rework_probability_reduction',
}


def pct(numerator, denominator):
    if denominator == 0:
        return 100
    return round((numerator / denominator) * 100)


class TemplateTests(unittest.TestCase):
    def test_package_bin_exists(self):
        pkg = json.loads((ROOT / 'package.json').read_text())
        lock = json.loads((ROOT / 'package-lock.json').read_text())
        plugin = json.loads((ROOT / '.claude-plugin/plugin.json').read_text())

        self.assertEqual(pkg['version'], '1.9.20')
        self.assertEqual(lock['version'], pkg['version'])
        self.assertEqual(lock['packages']['']['version'], pkg['version'])
        self.assertEqual(plugin['version'], pkg['version'])

        self.assertIn('tink-harness', pkg['bin'])
        self.assertIn('@clack/prompts', pkg['dependencies'])
        self.assertIn('picocolors', pkg['dependencies'])
        self.assertIn('CHANGELOG.md', pkg['files'])
        self.assertIn('VERSIONING.md', pkg['files'])
        installer = (ROOT / pkg['bin']['tink-harness']).read_text(encoding='utf-8')
        self.assertIn('TINK', installer)
        self.assertIn('A small harness layer for Claude Code and Codex', (ROOT / 'README.md').read_text(encoding='utf-8'))
        pkg_version = json.loads((ROOT / 'package.json').read_text())['version']
        self.assertIn(f'Latest package:</strong> v{pkg_version}', (ROOT / 'README.md').read_text(encoding='utf-8'))
        self.assertIn('href="CHANGELOG.md"', (ROOT / 'README.md').read_text(encoding='utf-8'))
        self.assertIn('## [1.8.0]', (ROOT / 'CHANGELOG.md').read_text(encoding='utf-8'))
        self.assertIn('graph-rule seed rules', (ROOT / 'CHANGELOG.md').read_text(encoding='utf-8'))
        self.assertIn('<strong>knit</strong> in reverse', (ROOT / 'README.md').read_text(encoding='utf-8'))
        self.assertIn('Tinker Bell', (ROOT / 'README.md').read_text(encoding='utf-8'))
        self.assertIn('colorLine(line, color)', installer)
        self.assertIn('const top = [96, 165, 250]', installer)
        self.assertIn('const bottom = [34, 211, 238]', installer)
        self.assertNotIn('const top = [5, 18, 58]', installer)

        self.assertIn('Installation scope', installer)
        self.assertIn('Select components to install', installer)
        self.assertIn('--clean-codex-picker', installer)
        self.assertIn('Select run options', installer)
        self.assertIn('Preview only (--dry-run)', installer)
        self.assertIn('Overwrite user-modified files (--force)', installer)
        self.assertIn('Clean Codex picker (--clean-codex-picker)', installer)
        self.assertIn('Preview what will be written or removed before changing files.', installer)
        self.assertIn('Replace local edits with official templates. Use only for recovery.', installer)
        self.assertIn('For Codex-only use. Reduce duplicate Source Command Tink entries.', installer)
        self.assertIn('tink-harness update', installer)
        self.assertIn('npx tink-harness@latest update', installer)
        self.assertIn('Hook recommendation', installer)
        self.assertIn('UserPromptSubmit', installer)
        self.assertIn('--with-hook', installer)
        self.assertIn('Select Claude Code, Codex, or both', installer)
        self.assertIn('Select agent surface to install', installer)
        self.assertIn('--agent is no longer supported', installer)
        self.assertIn('codexHome', installer)
        self.assertIn("'tink/harnesses'", installer)
        self.assertIn('copyTinkCommands', installer)
        self.assertTrue((ROOT / '.claude-plugin/plugin.json').exists())
        self.assertTrue((ROOT / '.claude-plugin/marketplace.json').exists())
        self.assertTrue((ROOT / 'commands/cast.md').exists())
        self.assertTrue((ROOT / 'skills/tink/SKILL.md').exists())
        self.assertIn('remove legacy', installer)
        self.assertIn('path.join(commandDest, entry.name)', installer)
        self.assertIn('/tink:cast <task> to start', installer)
        self.assertIn('$tink:cast <task>', installer)
        self.assertIn('legacyTinyCommands', installer)
        self.assertIn('tink/maintenance', installer)
        self.assertIn('removeLegacyCodexSkill', installer)
        self.assertIn('removeRepoLocalClaudeTinkSurface', installer)
        self.assertNotIn("value: 'both'", installer)
        self.assertNotIn("'tiny/harnesses'", installer)
        self.assertTrue((ROOT / pkg['bin']['tink-harness']).exists())

    def test_command_surface_is_focused(self):
        command_dir = ROOT / 'templates/claude/commands/tink'
        names = {p.name for p in command_dir.glob('*.md')}
        self.assertEqual(names, EXPECTED_COMMANDS)
        self.assertFalse(names & FORBIDDEN_INDEX_SURFACES)
        local_command_dir = ROOT / '.claude/commands/tink'
        self.assertEqual({p.name for p in local_command_dir.glob('*.md')}, EXPECTED_COMMANDS)
        for forbidden in ['prime.md', 'save.md', 'remember.md', 'fix.md']:
            self.assertFalse((command_dir / forbidden).exists())
        self.assertFalse((command_dir / 'index.md').exists())
        self.assertFalse((local_command_dir / 'index.md').exists())
        self.assertFalse((ROOT / 'commands/index.md').exists())
        self.assertFalse((ROOT / 'templates/codex/skills/tink-index').exists())
        self.assertFalse((ROOT / 'templates/claude/commands/tiny').exists())

    def test_codex_skill_surface_is_focused(self):
        core = (ROOT / 'templates/codex/skills/tink-core/RULES.md').read_text(encoding='utf-8')
        self.assertFalse((ROOT / 'templates/codex/skills/tink').exists())
        visible_codex_skills = {
            p.name
            for p in (ROOT / 'templates/codex/skills').iterdir()
            if p.is_dir() and (p / 'SKILL.md').exists()
        }
        self.assertEqual(visible_codex_skills, EXPECTED_CODEX_SKILLS)
        self.assertIn('Tink helps Codex', core)
        self.assertIn('$tink:cast <task>', core)
        self.assertIn('$tink:setup', core)
        self.assertIn('$tink:update', core)
        self.assertIn('Accept legacy `$tink <action>` spelling', core)
        self.assertIn('request_user_input', core)
        self.assertIn('Codex Approval Protocol', core)
        self.assertIn('Codex must not silently treat a command invocation as approval', core)
        self.assertIn('A user\'s `$tink:cast` invocation means "prepare and ask for approval"', core)
        self.assertIn('Do not create run state, load harness bodies, edit files, run commands, or continue the task before the answer', core)
        self.assertIn('Use this compact approval request shape', core)
        self.assertIn('Probe, synthesis probe, generic fit', core)
        self.assertIn('맞춤 절차 판단', core)
        self.assertIn('하네스 선택 과정', core)
        self.assertIn('이번 점검은 두 범위로 보겠습니다', core)
        self.assertIn('Option label quality rules', core)
        self.assertIn('콘데의달 지질', core)
        self.assertIn('내용 점검', core)
        self.assertIn('전체 점검', core)
        self.assertIn('이 작업은 Tink run으로 잡고 진행하겠습니다.', core)
        self.assertIn('- 승인 후 첫 단계:', core)
        self.assertIn('I will handle this as a Tink run.', core)
        self.assertIn('- first step after approval:', core)
        self.assertIn('If `request_user_input` is available, map this content into the prompt', core)
        self.assertIn('.tink/current/plan.md', core)
        self.assertIn('.tink/current/context-pack.md', core)
        self.assertIn('.tink/current/context-map.json', core)
        self.assertIn('.tink/current/context-metrics-evaluation.json', core)
        self.assertIn('.tink/current/excluded-context.md', core)
        self.assertIn('.tink/current/session.json', core)
        self.assertIn('Codex skill files', core)
        self.assertNotIn('AskUserQuestion', core)
        self.assertNotIn('UserPromptSubmit', core)
        for skill_dir in EXPECTED_CODEX_SKILLS:
            self.assertTrue((ROOT / f'templates/codex/skills/{skill_dir}/SKILL.md').exists())
        alias = (ROOT / 'templates/codex/skills/tink-cast/SKILL.md').read_text(encoding='utf-8')
        self.assertIn('name: "Tink: Cast"', alias)
        self.assertIn('description: Start a Tink run for a non-trivial task.', alias)
        self.assertIn('../tink-core/RULES.md', alias)
        self.assertIn('asks for approval first', alias)
        self.assertNotIn('name: tink:', alias.lower())

    def test_dual_format_paths_stay_in_sync(self):
        pairs = [
            ('commands/cast.md', 'templates/claude/commands/tink/cast.md'),
            ('commands/cast.md', '.claude/commands/tink/cast.md'),
            ('commands/verify.md', 'templates/claude/commands/tink/verify.md'),
            ('commands/verify.md', '.claude/commands/tink/verify.md'),
            ('commands/frog.md', 'templates/claude/commands/tink/frog.md'),
            ('commands/frog.md', '.claude/commands/tink/frog.md'),
            ('commands/list.md', 'templates/claude/commands/tink/list.md'),
            ('commands/list.md', '.claude/commands/tink/list.md'),
            ('commands/setup.md', 'templates/claude/commands/tink/setup.md'),
            ('commands/setup.md', '.claude/commands/tink/setup.md'),
            ('commands/update.md', 'templates/claude/commands/tink/update.md'),
            ('commands/update.md', '.claude/commands/tink/update.md'),
            ('commands/weave.md', 'templates/claude/commands/tink/weave.md'),
            ('commands/weave.md', '.claude/commands/tink/weave.md'),
            ('skills/tink/SKILL.md', 'templates/claude/skills/tink/SKILL.md'),
        ]
        drift = []
        for root_path, template_path in pairs:
            h1 = hashlib.sha256((ROOT / root_path).read_bytes()).hexdigest()
            h2 = hashlib.sha256((ROOT / template_path).read_bytes()).hexdigest()
            if h1 != h2:
                drift.append(f'{root_path} <-> {template_path}')
        self.assertFalse(
            drift,
            f'dual format drift detected. Plugin marketplace path (root) and '
            f'installer template path must stay byte-identical: {drift}',
        )

    def test_readme_required_sections(self):
        text = (ROOT / 'README.md').read_text(encoding='utf-8')
        pkg = json.loads((ROOT / 'package.json').read_text())
        for section in REQUIRED_README:
            self.assertIn(section, text)
        self.assertIn('img.shields.io', text)
        self.assertIn('/plugin marketplace add dotoricode/tink-harness', text)
        self.assertIn('/plugin install tink@tink-harness', text)
        self.assertIn('/reload-plugins', text)
        self.assertIn('npx tink-harness@latest install', text)
        self.assertIn('npx tink-harness@latest update', text)
        self.assertIn('Advanced options', text)
        self.assertIn('tink-harness update', text)
        self.assertIn('Preview only (--dry-run)', text)
        self.assertIn('Clean Codex picker (--clean-codex-picker)', text)
        self.assertNotIn('claude --plugin-dir .', text)
        self.assertIn('Hermes Agent', text)
        self.assertIn('untying tangled workflows', text)
        self.assertIn('the small helper at your side', text)
        self.assertIn('Could Claude Code or Codex grow with me in the same way?', text)
        self.assertIn('/tink:cast', text)
        self.assertIn('$tink:cast', text)
        self.assertIn('/tink:frog', text)
        self.assertIn('/tink:weave', text)
        self.assertIn('plugin-first', text)
        self.assertIn('cast** means', text)
        self.assertIn('frog** means', text)
        self.assertIn('weave** means', text)
        self.assertIn('.tink/current/', text)
        self.assertIn('.tink/rules/', text)
        self.assertIn('.tink/runs/', text)
        self.assertIn('docs/context-budget-ledger.md', text)
        self.assertIn('harness health summary', text)
        self.assertIn('It only prepares suggestions', text)
        self.assertIn('generate-harness-lifecycle-summary.mjs', text)
        self.assertIn('render-harness-health-report.mjs', text)
        self.assertIn('approval', text.lower())
        self.assertIn('docs/compatibility-policy.md', text)
        self.assertIn('docs/repo-signals.md', text)
        self.assertIn('docs/mcp-safe-profile.md', text)
        self.assertNotIn('30-second', text)
        self.assertNotIn('AI jokes', text)
        self.assertNotIn('/tink:prime', text)
        self.assertNotIn('/tiny:', text)
        self.assertNotIn('.tiny', text)
        self.assertNotIn('dry-wit', text)

    def test_versioning_docs_track_current_version(self):
        pkg = json.loads((ROOT / 'package.json').read_text())
        changelog = (ROOT / 'CHANGELOG.md').read_text(encoding='utf-8')
        versioning = (ROOT / 'VERSIONING.md').read_text(encoding='utf-8')

        self.assertIn(f"## [{pkg['version']}]", changelog)
        self.assertIn(f"Current version: `{pkg['version']}`", versioning)
        self.assertIn('Tink follows semver', versioning)
        self.assertIn('.claude-plugin/plugin.json', versioning)
        self.assertIn('/plugin update tink@tink-harness', versioning)
        pr_draft = (ROOT / 'docs/pr/2026-06-07-v1.2.0.md').read_text(encoding='utf-8')
        for section in ['## 문제', '## 해결', '## 검증', '## 참고']:
            self.assertIn(section, pr_draft)
        self.assertIn('npm latest `1.1.1`', pr_draft)


    def test_setup_explains_choices_before_asking(self):
        text = (ROOT / 'templates/claude/commands/tink/setup.md').read_text(encoding='utf-8')
        self.assertIn('First question: language', text)
        self.assertIn('Before asking choices', text)
        self.assertIn('재사용 하네스 (Reusable Harnesses)', text)
        self.assertIn('Repo 범위 (Repo Scope', text)
        self.assertIn('Global 범위 (Global Scope)', text)
        self.assertNotIn('둘 다', text)
        self.assertIn('Hook registration', text)
        self.assertIn('UserPromptSubmit', text)
        self.assertNotIn('Hook scope', text)
        self.assertIn('좋은 점', text)
        self.assertIn('다른 팀원, 다른 PC, 새 clone', text)
        self.assertIn('/tink:cast', text)
        self.assertIn('Command map after setup', text)
        self.assertIn('selected language', text)
        self.assertIn('Setup review mode', text)
        self.assertIn('current-settings review', text)
        self.assertIn('톤은 선택 항목이 아니라 Tink의 고정 정책입니다', text)
        self.assertIn('Do not ask for tone selection', text)
        self.assertIn('Legacy Tiny migration', text)
        self.assertIn('/tink:cast` replaces `/tiny:use', (ROOT / 'templates/claude/commands/tink/cast.md').read_text(encoding='utf-8'))
        self.assertIn('AskUserQuestion` tool for all choice prompts', text)

    def test_cast_frog_weave_behavior(self):
        forge = (ROOT / 'templates/claude/commands/tink/cast.md').read_text(encoding='utf-8')
        purge = (ROOT / 'templates/claude/commands/tink/frog.md').read_text(encoding='utf-8')
        hone = (ROOT / 'templates/claude/commands/tink/weave.md').read_text(encoding='utf-8')
        self.assertIn('Meaning of `context`', forge)
        self.assertIn('Run state contract', forge)
        self.assertIn('context-pack.md', forge)
        self.assertIn('context-map.json', forge)
        self.assertIn('context-metrics-evaluation.json', forge)
        self.assertIn('external_context[]', forge)
        self.assertIn('External context profile rules', forge)
        self.assertIn('External context safety checklist', forge)
        self.assertIn('Figma, GitHub, and official docs are representative examples', forge)
        self.assertIn('smallest useful `source_ref`', forge)
        self.assertIn('sensitivity: "public" | "internal" | "sensitive" | "secret"', forge)
        self.assertIn('contract.verification.manual_checks[]', forge)
        self.assertIn('excluded-context.md', forge)
        self.assertIn('context-map.schema.json', forge)
        self.assertIn('context-metrics-evaluation.schema.json', forge)
        self.assertIn('deterministic context selection', forge)
        self.assertIn('Selection order', forge)
        self.assertIn('Context Graph Lite rules', forge)
        self.assertIn('context_graph_lite.rules[]', forge)
        self.assertIn('kind: "context_graph_rule"', forge)
        self.assertIn('Context Budget Ledger fields', forge)
        self.assertIn('reuse_signal: "avoid_next_time"', forge)
        self.assertIn('hidden runtime index', forge)
        self.assertIn('Selected hint output rules', forge)
        self.assertIn('unmatched_path', forge)
        self.assertIn('Exclusion rules', forge)
        self.assertIn('Candidate limits', forge)
        self.assertIn('Do not create or require a separate `tink index` command', forge)
        self.assertIn('execute the first safe step', forge)
        self.assertIn('Do not end with a harness recommendation only', forge)
        self.assertIn('steps.json', forge)
        self.assertIn('Current run lifecycle', forge)
        self.assertIn('Run record schema', forge)
        self.assertIn('recovery candidate', forge)
        self.assertIn('resume, archive, replace, or cancel', forge)
        self.assertIn('Even if the user says', forge)
        self.assertIn('Recovery prompt format', forge)
        self.assertIn('이전 작업 복구', forge)
        self.assertIn('run_id', forge)
        self.assertIn('selected_harnesses', forge)
        self.assertIn('actually_loaded_harnesses', forge)
        self.assertIn('considered_but_rejected', forge)
        self.assertIn('context_footprint', forge)
        self.assertIn('Maintenance evidence', forge)
        self.assertIn('.tink/maintenance/ledger.jsonl', forge)
        self.assertIn('answers.md` template', forge)
        self.assertIn('Context budget policy', forge)
        self.assertIn('No hard cap mode', forge)
        self.assertIn('one screen or less', forge)
        self.assertIn('do not do the end-user task directly', forge)
        self.assertIn('Approval payload for saves', forge)
        self.assertIn('Harness synthesis contract', forge)
        self.assertIn('Synthesis probe', forge)
        self.assertIn('generic fit', forge)
        self.assertIn('User-facing approval wording', forge)
        self.assertIn('Label quality rules', forge)
        self.assertIn('콘데의달 지질', forge)
        self.assertIn('내용 점검', forge)
        self.assertIn('전체 점검', forge)
        self.assertIn('맞춤 절차 판단', forge)
        self.assertIn('하네스 선택 과정', forge)
        self.assertIn('확인할 점', forge)
        self.assertIn('Do not show internal terms such as `Probe`', forge)
        self.assertIn('Do not use Tink-internal jargon (Stitch, Probe, synthesis probe, generic fit', forge)
        self.assertIn('이번 점검은 두 범위로 보겠습니다', forge)
        self.assertIn('`review`: 변경 위험과 누락을 확인하는 점검 하네스', forge)
        self.assertIn('run-only draft', forge)
        self.assertIn('Do not wait for total mismatch', forge)
        self.assertIn('이번 작업 전용', forge)
        self.assertIn('save policy', forge)
        self.assertIn('behavior-shaping rules', forge)
        self.assertIn('pre-pr-security-gate', forge)
        self.assertIn('harness-curation', forge)
        self.assertIn('recurring operating habit', forge)
        self.assertIn('smallest effective set', forge)
        self.assertIn('explicit approval', forge)
        self.assertIn('Readiness check', forge)
        self.assertIn('Tink is not fully initialized', forge)
        self.assertIn('Call `AskUserQuestion` as described in the Interaction policy', forge)
        self.assertIn('answers.md', forge)
        self.assertIn('first read `plan.md`, `checks.md`, `steps.json`, `notes.md`, and `answers.md`', forge)
        self.assertNotIn('Enter should accept', forge)
        self.assertIn('new harness', forge)
        self.assertIn('/grill-me', forge)
        self.assertIn('Do not delete without approval', purge)
        self.assertIn('compact evidence', purge)
        self.assertIn('weave handoff packet', purge)
        self.assertIn('operation-specific approval payload', purge)
        self.assertIn('rule quality', purge)
        self.assertIn('keep, rewrite, split, merge, or needs evidence', purge)
        self.assertIn('real failures', hone)
        self.assertIn('weave handoff packet', hone)
        self.assertIn('Approval payload', hone)
        self.assertIn('Ask for approval before saving', hone)
        self.assertIn('structural gate', hone)
        list_cmd = (ROOT / 'templates/claude/commands/tink/list.md').read_text(encoding='utf-8')
        self.assertIn('unknown', list_cmd)
        self.assertIn('Do not infer non-use from missing evidence', list_cmd)
        self.assertIn('stale current candidate', list_cmd)
        self.assertIn('Evidence grade', purge)
        self.assertIn('Only strong evidence may recommend `delete`', purge)
        self.assertIn('.tink/maintenance/weave-queue.json', purge)
        self.assertIn('.tink/maintenance/ledger.jsonl', purge)
        self.assertIn('evidence handles', hone)
        self.assertIn('context-cost delta', hone)
        self.assertIn('.tink/maintenance/ledger.jsonl', hone)
        skill = (ROOT / 'templates/claude/skills/tink/SKILL.md').read_text(encoding='utf-8')
        self.assertIn('frog', skill)
        self.assertNotIn('prune', skill.lower())

        synthesis = (ROOT / 'templates/tink/harnesses/harness-synthesis.md').read_text(encoding='utf-8')
        self.assertIn('no fit', synthesis)
        self.assertIn('generic fit', synthesis)
        self.assertIn('run-only draft by default', synthesis)
        self.assertIn('separate save approval', synthesis)

    def test_stitch_contract(self):
        forge_paths = [
            ROOT / 'commands/cast.md',
            ROOT / 'templates/claude/commands/tink/cast.md',
        ]
        for path in forge_paths:
            text = path.read_text(encoding='utf-8')
            self.assertIn('Stitch', text)
            self.assertIn('Reusable State Save Gate', text)
            self.assertIn('exactly one proposal', text)
            self.assertIn('proposal, reason, choices', text)
            self.assertIn('Hard gates must not offer `Continue as-is` or `이대로 진행`', text)
            self.assertIn('separate approval payload', text)
            self.assertIn('Current-run approval does not authorize reusable-state writes', text)
            self.assertIn('.tink/current/answers.md', text)
            self.assertIn('.tink/current/notes.md', text)

        for path in [
            ROOT / 'skills/tink/SKILL.md',
            ROOT / 'templates/claude/skills/tink/SKILL.md',
        ]:
            text = path.read_text(encoding='utf-8')
            self.assertIn('Run Stitch once before committing to `.tink/current/`', text)
            self.assertIn('Reusable State Save Gate as a separate hard approval gate', text)
            self.assertIn('Current-run approval never authorizes reusable-state writes', text)

        context = (ROOT / 'CONTEXT.md').read_text(encoding='utf-8')
        self.assertIn('### Stitch', context)
        self.assertIn('### Reusable State Save Gate', context)
        self.assertIn('정확히 하나의 제안', context)
        self.assertIn('현재 실행 승인만으로', context)

        adr = (ROOT / 'docs/adr/0003-add-stitch-to-forge.md').read_text(encoding='utf-8')
        self.assertIn('## Status', adr)
        self.assertIn('Accepted', adr)

    def test_harness_index_and_files(self):
        index = json.loads((ROOT / 'templates/tink/harnesses/index.json').read_text(encoding='utf-8'))
        names = {item['name'] for item in index}
        expected_names = {
            'code-change', 'bug-fix', 'research', 'review', 'docs', 'ship',
            'requirements-interview', 'plan-consensus',
            'goal-checkpoint', 'delegation-brief',
            'harness-synthesis', 'harness-curation',
            'pre-publish-multi-agent-verify', 'tink-feedback-apply',
            'pr-merge',
        }
        self.assertEqual(names, expected_names)
        work_harnesses = {
            'code-change', 'bug-fix', 'research', 'review', 'docs', 'ship',
            'requirements-interview', 'plan-consensus',
            'goal-checkpoint', 'delegation-brief',
        }
        for name in work_harnesses:
            text = (ROOT / f'templates/tink/harnesses/{name}.md').read_text(encoding='utf-8')
            for section in HARNESS_SECTIONS:
                self.assertIn(section, text)
            self.assertIn('.tink/current/answers.md', text)
            self.assertLessEqual(len(text.splitlines()), 100)

        cast = (ROOT / 'commands/cast.md').read_text(encoding='utf-8')
        codex_core = (ROOT / 'templates/codex/skills/tink-core/RULES.md').read_text(encoding='utf-8')
        for text in [cast, codex_core]:
            self.assertIn('requirements-interview', text)
            self.assertIn('plan-consensus', text)
            self.assertIn('goal-checkpoint', text)
            self.assertIn('delegation-brief', text)
            self.assertIn('goals.json', text)
            self.assertIn('delegation.md', text)
            self.assertIn('Do not start tmux panes', text)
            self.assertIn('overlay', text)
            self.assertIn('missing acceptance criteria', text)
            self.assertIn('independent verification', text)

    def test_memory_templates_exist(self):
        for name in ['mistakes.md', 'preferences.md', 'lessons.md']:
            text = (ROOT / f'templates/tink/memory/{name}').read_text(encoding='utf-8')
            self.assertIn('approval', text.lower())
            self.assertIn('Entry shape', text)
            self.assertIn('source=<run-id|user>', text)
            self.assertNotIn('secret=', text.lower())

    def test_installer_dry_run_and_install(self):
        subprocess.run(['node', 'bin/install.js', 'install', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8')
        subprocess.run(['node', 'bin/install.js', 'install', '--global', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8')
        bad = subprocess.run(['node', 'bin/install.js', 'install', '--scope=both', '--dry-run'], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
        self.assertNotEqual(bad.returncode, 0)
        bad_agent = subprocess.run(['node', 'bin/install.js', 'install', '--agent=other', '--dry-run'], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
        self.assertNotEqual(bad_agent.returncode, 0)
        subprocess.run(['node', 'bin/install.js', 'install', '--lang=en', '--yes', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8')
        subprocess.run(['node', 'bin/install.js', 'install', '--lang=zh', '--yes', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8')
        env = os.environ.copy()
        env['TINK_INSTALL_SURFACES'] = 'codex'
        subprocess.run(['node', 'bin/install.js', 'install', '--lang=ko', '--yes', '--dry-run'], cwd=ROOT, env=env, check=True, capture_output=True, text=True, encoding='utf-8')
        with tempfile.TemporaryDirectory() as d:
            legacy = Path(d) / '.claude/commands/tink-forge.md'
            legacy.parent.mkdir(parents=True)
            legacy.write_text('legacy command', encoding='utf-8')
            legacy_tiny_file = Path(d) / '.claude/commands/tiny-use.md'
            legacy_tiny_file.write_text('legacy tiny command', encoding='utf-8')
            legacy_tiny_dir = Path(d) / '.claude/commands/tiny'
            legacy_tiny_dir.mkdir(parents=True)
            (legacy_tiny_dir / 'use.md').write_text('legacy nested tiny command', encoding='utf-8')
            subprocess.run(['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes'], cwd=d, check=True, capture_output=True, text=True, encoding='utf-8')
            base = Path(d)
            installed_commands = {p.name for p in (base / '.claude/commands/tink').glob('*.md')}
            self.assertEqual(installed_commands, EXPECTED_INSTALLED_COMMANDS)
            self.assertFalse((base / '.claude/commands/tink-forge.md').exists())
            self.assertFalse((base / '.claude/commands/tiny-use.md').exists())
            self.assertFalse((base / '.claude/commands/tiny').exists())
            self.assertTrue((base / '.claude/skills/tink/SKILL.md').exists())
            self.assertTrue((base / '.tink/harnesses/index.json').exists())
            self.assertTrue((base / '.tink/rules/index.json').exists())
            self.assertTrue((base / '.tink/schemas/contract.schema.json').exists())
            self.assertTrue((base / '.tink/schemas/context-map.schema.json').exists())
            self.assertTrue((base / '.tink/schemas/context-metrics-evaluation.schema.json').exists())
            self.assertTrue((base / '.tink/schemas/verification.schema.json').exists())
            self.assertTrue((base / '.tink/schemas/session.schema.json').exists())
            self.assertTrue((base / '.tink/maintenance/ledger.jsonl').exists())
            self.assertTrue((base / '.tink/maintenance/weave-queue.json').exists())
            self.assertTrue((base / '.tink/maintenance/friction.jsonl').exists())
            self.assertTrue((base / '.tink/tools/generate-harness-lifecycle-summary.mjs').exists())
            self.assertTrue((base / '.tink/tools/render-harness-health-report.mjs').exists())
            self.assertTrue((base / '.tink/memory/mistakes.md').exists())
            self.assertTrue((base / '.gitignore').exists())

        with tempfile.TemporaryDirectory() as d:
            subprocess.run(['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes', '--with-hook'], cwd=d, check=True, capture_output=True, text=True, encoding='utf-8')
            base = Path(d)
            settings = json.loads((base / '.claude/settings.json').read_text(encoding='utf-8'))
            hooks = settings['hooks']['UserPromptSubmit']
            self.assertEqual(len(hooks), 1)
            self.assertIn('user-prompt-submit.mjs', hooks[0]['hooks'][0]['command'])
            cfg = json.loads((base / '.tink/config.json').read_text(encoding='utf-8'))
            self.assertEqual(cfg['hook_scope'], 'repo')
            self.assertTrue((base / '.tink/hooks/user-prompt-submit.mjs').exists())

        with tempfile.TemporaryDirectory() as d:
            base = Path(d)
            codex_home = base / '.codex-home'
            legacy_codex_skill = codex_home / 'skills/tink/SKILL.md'
            legacy_codex_skill.parent.mkdir(parents=True)
            legacy_codex_skill.write_text('---\nname: tink\n---\n\n# Tink\n\nLegacy Tink skill.\n', encoding='utf-8')
            env = os.environ.copy()
            env['CODEX_HOME'] = str(codex_home)
            env['TINK_INSTALL_SURFACES'] = 'codex'
            subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes'],
                cwd=base,
                env=env,
                check=True,
                capture_output=True,
                text=True,
                encoding='utf-8',
            )
            self.assertTrue((codex_home / 'skills/tink-core/RULES.md').exists())
            self.assertFalse((codex_home / 'skills/tink/SKILL.md').exists())
            installed_codex_skills = {
                p.name
                for p in (codex_home / 'skills').iterdir()
                if p.is_dir() and (p / 'SKILL.md').exists()
            }
            self.assertEqual(installed_codex_skills, EXPECTED_CODEX_SKILLS)
            self.assertIn('name: "Tink: Cast"', (codex_home / 'skills/tink-cast/SKILL.md').read_text(encoding='utf-8'))
            self.assertTrue((base / '.tink/harnesses/index.json').exists())
            self.assertTrue((base / '.tink/rules/index.json').exists())
            self.assertTrue((base / '.tink/schemas/context-map.schema.json').exists())
            self.assertTrue((base / '.tink/schemas/context-metrics-evaluation.schema.json').exists())
            self.assertTrue((base / '.tink/schemas/verification.schema.json').exists())
            self.assertTrue((base / '.tink/maintenance/ledger.jsonl').exists())
            self.assertTrue((base / '.tink/maintenance/friction.jsonl').exists())
            self.assertTrue((base / '.tink/tools/generate-harness-lifecycle-summary.mjs').exists())
            self.assertTrue((base / '.tink/tools/render-harness-health-report.mjs').exists())
            self.assertTrue((base / '.tink/memory/mistakes.md').exists())
            self.assertTrue((base / '.tink/config.json').exists())
            self.assertFalse((base / '.claude/commands').exists())
            self.assertFalse((base / '.claude/skills').exists())

        with tempfile.TemporaryDirectory() as d:
            base = Path(d)
            codex_home = base / '.codex-home'
            env = os.environ.copy()
            env['CODEX_HOME'] = str(codex_home)
            env['TINK_INSTALL_SURFACES'] = 'all'
            result = subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'install', '--lang=en', '--yes', '--dry-run'],
                cwd=base,
                env=env,
                check=True,
                capture_output=True,
                text=True,
                encoding='utf-8',
            )
            self.assertIn('components commands, claude-skill, codex-skills, harnesses, memory', result.stdout)
            self.assertIn('Preview only (--dry-run): yes', result.stdout)
            self.assertIn('Overwrite user-modified files (--force): no', result.stdout)
            self.assertNotIn('Clean Codex picker (--clean-codex-picker)', result.stdout)
            self.assertIn('Claude Code command target:', result.stdout)
            self.assertIn('Codex skills target:', result.stdout)
            self.assertIn('Codex picker cleanup target:', result.stdout)
            self.assertNotIn('codex-picker-cleanup', result.stdout.split('components ', 1)[1].splitlines()[0])

        with tempfile.TemporaryDirectory() as d:
            base = Path(d)
            codex_home = base / '.codex-home'
            repo_command = base / '.claude/commands/tink/cast.md'
            repo_command.parent.mkdir(parents=True)
            repo_command.write_text('# /tink:cast\n\nlegacy repo-local command\n', encoding='utf-8')
            repo_skill = base / '.claude/skills/tink/SKILL.md'
            repo_skill.parent.mkdir(parents=True)
            repo_skill.write_text('---\nname: tink\n---\n\n# Tink\n\nlegacy repo-local skill\n', encoding='utf-8')
            env = os.environ.copy()
            env['CODEX_HOME'] = str(codex_home)
            env['TINK_INSTALL_SURFACES'] = 'all'
            result = subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'update', '--lang=en', '--yes', '--clean-codex-picker'],
                cwd=base,
                env=env,
                check=True,
                capture_output=True,
                text=True,
                encoding='utf-8',
            )
            self.assertFalse(repo_command.exists())
            self.assertFalse(repo_skill.exists())
            self.assertTrue((codex_home / 'skills/tink-cast/SKILL.md').exists())
            self.assertIn('name: "Tink: Cast"', (codex_home / 'skills/tink-cast/SKILL.md').read_text(encoding='utf-8'))
            self.assertIn('Removed legacy paths:', result.stdout)
            self.assertIn('.claude/commands/tink/cast.md', result.stdout)
            self.assertIn('.claude/skills/tink', result.stdout)

    def test_codex_update_refreshes_existing_install(self):
        with tempfile.TemporaryDirectory() as d:
            base = Path(d)
            codex_home = base / '.codex-home'
            legacy_codex_skill = codex_home / 'skills/tink/SKILL.md'
            legacy_codex_skill.parent.mkdir(parents=True)
            legacy_codex_skill.write_text('---\nname: tink\n---\n\n# Tink\n\nLegacy Tink skill.\n', encoding='utf-8')
            stale_cast = codex_home / 'skills/tink-cast/SKILL.md'
            stale_cast.parent.mkdir(parents=True)
            stale_cast.write_text('---\nname: cast\n---\n\n# stale cast\n', encoding='utf-8')
            stale_contract = base / '.tink/schemas/contract.schema.json'
            stale_contract.parent.mkdir(parents=True)
            stale_contract.write_text('{"old": true}\n', encoding='utf-8')
            stale_config = base / '.tink/config.json'
            stale_config.write_text('{"language": "custom", "install_scope": "custom", "local": true}\n', encoding='utf-8')
            stale_rules = base / '.tink/rules/index.json'
            stale_rules.parent.mkdir(parents=True)
            stale_rules.write_text(json.dumps({
                'version': 1,
                'nodes': [
                    {'id': 'harness:code-change'},
                    {'id': 'harness:bug-fix'},
                    {'id': 'harness:ship'},
                    {'id': 'harness:pre-publish-multi-agent-verify'},
                    {'id': 'check:package-dry-run'},
                    {'id': 'check:readme-cli-match'},
                    {'id': 'guard:release-verification-stop'},
                    {'id': 'guard:forbidden-path-write'},
                ],
            }) + '\n', encoding='utf-8')
            repo_command = base / '.claude/commands/tink/frog.md'
            repo_command.parent.mkdir(parents=True)
            repo_command.write_text('# /tink:frog\n\nTink frog command.\n', encoding='utf-8')
            repo_update_command = base / '.claude/commands/tink/update.md'
            repo_update_command.write_text('# /tink:update\n\nTink update command.\n', encoding='utf-8')
            repo_flat_command = base / '.claude/commands/tink-frog.md'
            repo_flat_command.write_text('legacy flat Tink command\n', encoding='utf-8')
            repo_claude_skill = base / '.claude/skills/tink/SKILL.md'
            repo_claude_skill.parent.mkdir(parents=True)
            repo_claude_skill.write_text('---\nname: tink\n---\n\n# Tink\n\nClaude Tink skill.\n', encoding='utf-8')

            env = os.environ.copy()
            env['CODEX_HOME'] = str(codex_home)
            env['TINK_INSTALL_SURFACES'] = 'codex'
            result = subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'update', '--lang=ko', '--yes'],
                cwd=base,
                env=env,
                check=True,
                capture_output=True,
                text=True,
                encoding='utf-8',
            )
            output = result.stdout

            self.assertFalse((codex_home / 'skills/tink/SKILL.md').exists())
            self.assertTrue((codex_home / 'skills/tink-core/RULES.md').exists())
            self.assertIn('This is the Codex alias for `$tink:cast <task>`.', stale_cast.read_text(encoding='utf-8'))
            installed_codex_skills = {
                p.name
                for p in (codex_home / 'skills').iterdir()
                if p.is_dir() and (p / 'SKILL.md').exists()
            }
            self.assertEqual(installed_codex_skills, EXPECTED_CODEX_SKILLS)
            self.assertTrue((base / '.tink/schemas/context-map.schema.json').exists())
            self.assertTrue((base / '.tink/schemas/context-metrics-evaluation.schema.json').exists())
            self.assertTrue((base / '.tink/schemas/verification.schema.json').exists())
            updated_rules = json.loads(stale_rules.read_text(encoding='utf-8'))
            updated_rule_ids = {node['id'] for node in updated_rules['nodes']}
            self.assertIn('node_shape', updated_rules)
            self.assertIn('context:version-metadata-sync', updated_rule_ids)
            self.assertIn('context:claude-command-three-copy-sync', updated_rule_ids)
            self.assertIn('"old": true', stale_contract.read_text(encoding='utf-8'))
            config_after_update = json.loads(stale_config.read_text(encoding='utf-8'))
            self.assertEqual(config_after_update['language'], 'custom')
            self.assertEqual(config_after_update['install_scope'], 'custom')
            self.assertTrue(config_after_update['local'])
            self.assertFalse((base / '.claude/commands').exists())
            self.assertFalse((base / '.claude/skills').exists())
            self.assertFalse(repo_command.exists())
            self.assertFalse(repo_update_command.exists())
            self.assertFalse(repo_flat_command.exists())
            self.assertFalse(repo_claude_skill.exists())
            self.assertIn('Updating Tink for Codex', output)
            self.assertIn('Update Result Summary', output)
            self.assertIn('Surfaces: codex', output)
            self.assertIn('Codex skills:', output)
            self.assertIn('Updated or added:', output)
            self.assertIn('skills/tink-cast/SKILL.md', output)
            self.assertIn('.tink/rules/index.json', output)
            self.assertIn('Preserved user-modified files:', output)
            self.assertIn('.tink/schemas/contract.schema.json', output)
            self.assertIn('.tink/config.json', output)
            self.assertIn('Removed legacy paths:', output)
            self.assertIn('skills/tink', output)
            self.assertIn('.claude/commands/tink/frog.md', output)
            self.assertIn('.claude/skills/tink', output)
            self.assertIn('Next: open Codex and use $tink:cast <task> to start.', output)

    def test_update_refreshes_runtime_tools(self):
        with tempfile.TemporaryDirectory() as d:
            base = Path(d)
            tool_path = base / '.tink/tools/render-harness-health-report.mjs'
            tool_path.parent.mkdir(parents=True)
            tool_path.write_text('// stale tool' + chr(10), encoding='utf-8')

            env = os.environ.copy()
            env['TINK_INSTALL_SURFACES'] = 'claude'
            subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'update', '--lang=ko', '--yes'],
                cwd=base,
                env=env,
                check=True,
                capture_output=True,
                text=True,
                encoding='utf-8',
            )

            updated = tool_path.read_text(encoding='utf-8')
            self.assertNotIn('stale tool', updated)
            self.assertIn('renderGraphCanvas', updated)
            generator = (base / '.tink/tools/generate-harness-lifecycle-summary.mjs').read_text(encoding='utf-8')
            self.assertIn('maintenance_events', generator)

    def test_update_uses_stored_language(self):
        with tempfile.TemporaryDirectory() as d:
            base = Path(d)
            env = os.environ.copy()
            env['TINK_INSTALL_SURFACES'] = 'claude'
            env.pop('LANG', None)
            env.pop('LC_ALL', None)
            subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes'],
                cwd=base, env=env, check=True, capture_output=True, text=True, encoding='utf-8',
            )
            config = json.loads((base / '.tink/config.json').read_text(encoding='utf-8'))
            self.assertEqual(config['language'], 'ko')

            result = subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'update', '--yes'],
                cwd=base, env=env, check=True, capture_output=True, text=True, encoding='utf-8',
            )
            self.assertIn('language ko', result.stdout)

            override = subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'update', '--lang=en', '--yes'],
                cwd=base, env=env, check=True, capture_output=True, text=True, encoding='utf-8',
            )
            self.assertIn('language en', override.stdout)

    def test_update_preserves_user_modified_rule_graph(self):
        with tempfile.TemporaryDirectory() as d:
            base = Path(d)
            rules_path = base / '.tink/rules/index.json'
            rules_path.parent.mkdir(parents=True)
            rules_path.write_text(json.dumps({
                'version': 1,
                'nodes': [
                    {'id': 'harness:code-change'},
                    {'id': 'custom:team-rule', 'reason': 'Team-specific rule.'},
                ],
            }) + '\n', encoding='utf-8')

            env = os.environ.copy()
            env['TINK_INSTALL_SURFACES'] = 'claude'
            result = subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'update', '--lang=ko', '--yes'],
                cwd=base,
                env=env,
                check=True,
                capture_output=True,
                text=True,
                encoding='utf-8',
            )

            updated_rules = json.loads(rules_path.read_text(encoding='utf-8'))
            self.assertNotIn('node_shape', updated_rules)
            self.assertIn('custom:team-rule', {node['id'] for node in updated_rules['nodes']})
            self.assertIn('Preserved user-modified files:', result.stdout)
            self.assertIn('.tink/rules/index.json', result.stdout)

    def test_package_contents_are_release_ready(self):
        result = subprocess.run([NPM, 'pack', '--dry-run', '--json'], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8')
        pack = json.loads(result.stdout)[0]
        paths = {item['path'] for item in pack['files']}

        for required in [
            'bin/install.js',
            '.claude-plugin/plugin.json',
            '.claude-plugin/marketplace.json',
            'commands/setup.md',
            'commands/cast.md',
            'commands/verify.md',
            'commands/list.md',
            'commands/frog.md',
            'commands/weave.md',
            'commands/update.md',
            'skills/tink/SKILL.md',
            'templates/claude/commands/tink/setup.md',
            'templates/claude/commands/tink/cast.md',
            'templates/claude/commands/tink/verify.md',
            'templates/claude/commands/tink/list.md',
            'templates/claude/commands/tink/frog.md',
            'templates/claude/commands/tink/weave.md',
            'templates/claude/commands/tink/update.md',
            'templates/claude/skills/tink/SKILL.md',
            'templates/codex/skills/tink-core/RULES.md',
            'templates/codex/skills/tink-cast/SKILL.md',
            'templates/codex/skills/tink-verify/SKILL.md',
            'templates/codex/skills/tink-list/SKILL.md',
            'templates/codex/skills/tink-setup/SKILL.md',
            'templates/codex/skills/tink-frog/SKILL.md',
            'templates/codex/skills/tink-weave/SKILL.md',
            'templates/codex/skills/tink-update/SKILL.md',
            'templates/tink/config.json',
            'templates/tink/rules/index.json',
            'templates/tink/schemas/contract.schema.json',
            'templates/tink/schemas/context-map.schema.json',
            'templates/tink/schemas/context-metrics-evaluation.schema.json',
            'templates/tink/schemas/verification.schema.json',
            'templates/tink/schemas/session.schema.json',
            'templates/tink/schemas/mcp-policy.schema.json',
            'templates/tink/schemas/harness-lifecycle.schema.json',
            'templates/tink/harnesses/index.json',
            'templates/tink/maintenance/ledger.jsonl',
            'templates/tink/maintenance/weave-queue.json',
            'templates/tink/maintenance/friction.jsonl',
            'templates/tink/tools/generate-harness-lifecycle-summary.mjs',
            'templates/tink/tools/render-harness-health-report.mjs',
            'templates/tink/hooks/user-prompt-submit.mjs',
            'templates/tink/memory/mistakes.md',
            'templates/tink/memory/approved/README.md',
            'templates/tink/memory/candidate/README.md',
            'templates/tink/memory/rejected/README.md',
            'templates/tink/memory/evidence/README.md',
            'docs/compatibility-policy.md',
            'docs/planned-work-units.md',
            'docs/planned-work-units.ko.md',
            'docs/verification-evidence-details.md',
            'docs/verification-evidence-details.ko.md',
            'docs/external-context-policy.md',
            'docs/external-context-policy.ko.md',
            'docs/harness-lifecycle-signals.md',
            'docs/harness-lifecycle-signals.ko.md',
            'docs/memory-decision-layers.md',
            'docs/memory-decision-layers.ko.md',
            'docs/context-change-review.md',
            'docs/context-change-review.ko.md',
            'docs/context-budget-ledger.md',
            'docs/context-budget-ledger.ko.md',
            'docs/context-metrics-evaluator.md',
            'docs/context-metrics-evaluator.ko.md',
            'docs/context-run-history-rollup.md',
            'docs/context-run-history-rollup.ko.md',
            'docs/context-threshold-status.md',
            'docs/context-threshold-status.ko.md',
            'docs/context-run-record-policy.md',
            'docs/context-run-record-policy.ko.md',
            'docs/update-diagnosis.md',
            'docs/update-diagnosis.ko.md',
            'docs/phase-5-update-confidence.md',
            'docs/phase-5-update-confidence.ko.md',
            'docs/mcp-safe-profile.md',
            'docs/repo-signals.md',
            'docs/repo-signals.ko.md',
            'docs/graph-rule-adoption-plan.ko.md',
            'docs/tink-idea-implementation-plan.ko.md',
            'docs/update-troubleshooting.md',
            'docs/update-troubleshooting.ko.md',
            'docs/update-verification-recipe.md',
            'docs/update-verification-recipe.ko.md',
            'docs/work-state.md',
            'docs/work-state.ko.md',
            'docs/pr/2026-06-07-v1.2.0.md',
            'docs/pr/2026-06-07-v1.2.1.md',
            'docs/pr/2026-06-08-context-budget-ledger.ko.md',
            'docs/pr/2026-06-08-context-metrics-artifact.ko.md',
            'docs/pr/2026-06-08-context-metrics-evaluator.ko.md',
            'docs/pr/2026-06-08-context-run-history-rollup.ko.md',
            'docs/pr/2026-06-08-context-threshold-status.ko.md',
            'docs/pr/2026-06-08-context-run-record-policy.ko.md',
            'docs/pr/2026-06-08-codex-surface-cleanup.ko.md',
            'docs/pr/2026-06-08-v1.5.0.ko.md',
            'docs/pr/2026-06-09-graph-rule-adoption-plan.ko.md',
            'docs/pr/2026-06-09-graph-rule-seed-rules.ko.md',
            'docs/pr/2026-06-09-v1.6.0.ko.md',
            'docs/pr/2026-06-09-v1.6.1.ko.md',
            'docs/pr/2026-06-09-v1.6.2.ko.md',
            'docs/pr/2026-06-09-v1.6.3.ko.md',
            'docs/pr/2026-06-09-v1.7.0.ko.md',
            'docs/pr/2026-06-09-v1.7.1.ko.md',
            'docs/pr/2026-06-09-v1.8.0.ko.md',
            'README.md',
            'LICENSE',
        ]:
            self.assertIn(required, paths)

        for forbidden_prefix in ['tests/', 'docs/plans/', '.tink/', '.claude/', '.serena/']:
            self.assertFalse(any(path.startswith(forbidden_prefix) for path in paths), forbidden_prefix)

    def test_packaged_tarball_installs_in_clean_repo(self):
        result = subprocess.run([NPM, 'pack', '--json'], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8')
        tarball = ROOT / json.loads(result.stdout)[0]['filename']
        try:
            with tempfile.TemporaryDirectory() as d:
                base = Path(d)
                subprocess.run(
                    [NPM, 'exec', '--yes', '--package', str(tarball), '--', 'tink-harness', 'install', '--lang=ko', '--yes', '--scope=repo'],
                    cwd=base,
                    check=True,
                    capture_output=True,
                    text=True,
                    encoding='utf-8',
                )
                installed_commands = {p.name for p in (base / '.claude/commands/tink').glob('*.md')}
                self.assertEqual(installed_commands, EXPECTED_INSTALLED_COMMANDS)
                self.assertFalse((base / '.claude/commands/tink-forge.md').exists())
                self.assertTrue((base / '.claude/skills/tink/SKILL.md').exists())
                self.assertTrue((base / '.tink/harnesses/index.json').exists())
                self.assertTrue((base / '.tink/rules/index.json').exists())
                self.assertTrue((base / '.tink/schemas/context-map.schema.json').exists())
                self.assertTrue((base / '.tink/schemas/context-metrics-evaluation.schema.json').exists())
                self.assertTrue((base / '.tink/schemas/verification.schema.json').exists())
                self.assertTrue((base / '.tink/maintenance/ledger.jsonl').exists())
                self.assertTrue((base / '.tink/maintenance/weave-queue.json').exists())
                self.assertTrue((base / '.tink/maintenance/friction.jsonl').exists())
                self.assertTrue((base / '.tink/memory/mistakes.md').exists())
                self.assertTrue((base / '.tink/memory/approved/README.md').exists())
                self.assertTrue((base / '.tink/memory/candidate/README.md').exists())
                self.assertTrue((base / '.tink/memory/rejected/README.md').exists())
                self.assertTrue((base / '.tink/memory/evidence/README.md').exists())
                self.assertTrue((base / '.tink/config.json').exists())
        finally:
            tarball.unlink(missing_ok=True)

    def test_npx_install_matches_root_dual_format(self):
        with tempfile.TemporaryDirectory() as d:
            subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes'],
                cwd=d, check=True, capture_output=True, text=True, encoding='utf-8',
            )
            base = Path(d)
            pairs = [
                ('commands/cast.md', '.claude/commands/tink/cast.md'),
                ('commands/verify.md', '.claude/commands/tink/verify.md'),
                ('commands/frog.md', '.claude/commands/tink/frog.md'),
                ('commands/list.md', '.claude/commands/tink/list.md'),
                ('commands/setup.md', '.claude/commands/tink/setup.md'),
                ('commands/update.md', '.claude/commands/tink/update.md'),
                ('commands/weave.md', '.claude/commands/tink/weave.md'),
                ('skills/tink/SKILL.md', '.claude/skills/tink/SKILL.md'),
            ]
            mismatches = []
            for root_path, installed_path in pairs:
                h1 = hashlib.sha256((ROOT / root_path).read_bytes()).hexdigest()
                h2 = hashlib.sha256((base / installed_path).read_bytes()).hexdigest()
                if h1 != h2:
                    mismatches.append(f'{root_path} != {installed_path}')
            self.assertFalse(
                mismatches,
                f'installer output diverged from plugin root: {mismatches}',
            )

    def test_force_reinstall_overwrites_modifications(self):
        with tempfile.TemporaryDirectory() as d:
            base = Path(d)
            subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes'],
                cwd=d, check=True, capture_output=True, text=True, encoding='utf-8',
            )
            target = base / '.claude/commands/tink/cast.md'
            original = target.read_bytes()
            target.write_text('TAMPERED', encoding='utf-8')
            subprocess.run(
                ['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes', '--force'],
                cwd=d, check=True, capture_output=True, text=True, encoding='utf-8',
            )
            self.assertEqual(
                target.read_bytes(),
                original,
                'force reinstall did not restore modified file',
            )

    def test_version_consistent_across_surfaces(self):
        pkg = json.loads((ROOT / 'package.json').read_text())
        version = pkg['version']
        lock = json.loads((ROOT / 'package-lock.json').read_text())
        plugin = json.loads((ROOT / '.claude-plugin/plugin.json').read_text())

        self.assertEqual(lock['version'], version)
        self.assertEqual(lock['packages']['']['version'], version)
        self.assertEqual(plugin['version'], version)

        readme = (ROOT / 'README.md').read_text(encoding='utf-8')
        versioning = (ROOT / 'VERSIONING.md').read_text(encoding='utf-8')
        changelog = (ROOT / 'CHANGELOG.md').read_text(encoding='utf-8')

        self.assertIn(f'Current version: `{version}`', versioning)
        self.assertIn(f'## [{version}]', changelog)
        self.assertIn('docs/work-state.md', readme)
        self.assertIn('docs/work-state.ko.md', readme)
        self.assertIn('docs/phase-5-update-confidence.md', readme)
        self.assertIn('docs/phase-5-update-confidence.ko.md', readme)
        self.assertIn('docs/repo-signals.ko.md', readme)
        self.assertIn('docs/graph-rule-adoption-plan.ko.md', readme)
        self.assertIn('docs/tink-idea-implementation-plan.ko.md', readme)
        self.assertIn('docs/update-troubleshooting.md', readme)
        self.assertIn('docs/update-troubleshooting.ko.md', readme)
        self.assertIn('docs/update-verification-recipe.md', readme)
        self.assertIn('docs/update-verification-recipe.ko.md', readme)
        self.assertIn('docs/planned-work-units.md', readme)
        self.assertIn('docs/planned-work-units.ko.md', readme)
        self.assertIn('docs/external-context-policy.md', readme)
        self.assertIn('docs/context-metrics-evaluator.md', readme)
        self.assertIn('docs/context-metrics-evaluator.ko.md', readme)
        self.assertIn('docs/context-run-history-rollup.md', readme)
        self.assertIn('docs/context-run-history-rollup.ko.md', readme)
        self.assertIn('docs/context-threshold-status.md', readme)
        self.assertIn('docs/context-threshold-status.ko.md', readme)
        self.assertIn('docs/context-run-record-policy.md', readme)
        self.assertIn('docs/context-run-record-policy.ko.md', readme)

    def test_work_state_phase5_and_idea_plan_docs_exist(self):
        work_state = (ROOT / 'docs/work-state.md').read_text(encoding='utf-8')
        work_state_ko = (ROOT / 'docs/work-state.ko.md').read_text(encoding='utf-8')
        phase5 = (ROOT / 'docs/phase-5-update-confidence.md').read_text(encoding='utf-8')
        phase5_ko = (ROOT / 'docs/phase-5-update-confidence.ko.md').read_text(encoding='utf-8')
        idea_plan = (ROOT / 'docs/tink-idea-implementation-plan.ko.md').read_text(encoding='utf-8')
        troubleshooting = (ROOT / 'docs/update-troubleshooting.md').read_text(encoding='utf-8')
        troubleshooting_ko = (ROOT / 'docs/update-troubleshooting.ko.md').read_text(encoding='utf-8')
        verification_recipe = (ROOT / 'docs/update-verification-recipe.md').read_text(encoding='utf-8')
        verification_recipe_ko = (ROOT / 'docs/update-verification-recipe.ko.md').read_text(encoding='utf-8')
        planned = (ROOT / 'docs/planned-work-units.md').read_text(encoding='utf-8')
        planned_ko = (ROOT / 'docs/planned-work-units.ko.md').read_text(encoding='utf-8')
        evidence_details = (ROOT / 'docs/verification-evidence-details.md').read_text(encoding='utf-8')
        evidence_details_ko = (ROOT / 'docs/verification-evidence-details.ko.md').read_text(encoding='utf-8')
        external_policy = (ROOT / 'docs/external-context-policy.md').read_text(encoding='utf-8')
        external_policy_ko = (ROOT / 'docs/external-context-policy.ko.md').read_text(encoding='utf-8')
        lifecycle = (ROOT / 'docs/harness-lifecycle-signals.md').read_text(encoding='utf-8')
        lifecycle_ko = (ROOT / 'docs/harness-lifecycle-signals.ko.md').read_text(encoding='utf-8')
        memory_layers = (ROOT / 'docs/memory-decision-layers.md').read_text(encoding='utf-8')
        memory_layers_ko = (ROOT / 'docs/memory-decision-layers.ko.md').read_text(encoding='utf-8')
        context_change = (ROOT / 'docs/context-change-review.md').read_text(encoding='utf-8')
        context_change_ko = (ROOT / 'docs/context-change-review.ko.md').read_text(encoding='utf-8')
        context_budget = (ROOT / 'docs/context-budget-ledger.md').read_text(encoding='utf-8')
        context_budget_ko = (ROOT / 'docs/context-budget-ledger.ko.md').read_text(encoding='utf-8')
        context_metrics = (ROOT / 'docs/context-metrics-evaluator.md').read_text(encoding='utf-8')
        context_metrics_ko = (ROOT / 'docs/context-metrics-evaluator.ko.md').read_text(encoding='utf-8')
        context_rollup = (ROOT / 'docs/context-run-history-rollup.md').read_text(encoding='utf-8')
        context_rollup_ko = (ROOT / 'docs/context-run-history-rollup.ko.md').read_text(encoding='utf-8')
        context_threshold = (ROOT / 'docs/context-threshold-status.md').read_text(encoding='utf-8')
        context_threshold_ko = (ROOT / 'docs/context-threshold-status.ko.md').read_text(encoding='utf-8')
        context_run_record = (ROOT / 'docs/context-run-record-policy.md').read_text(encoding='utf-8')
        context_run_record_ko = (ROOT / 'docs/context-run-record-policy.ko.md').read_text(encoding='utf-8')
        context_summary_html = (ROOT / 'docs/context-work-summary.ko.html').read_text(encoding='utf-8')
        context_efficiency_html = (ROOT / 'docs/context-engineering-efficiency.ko.html').read_text(encoding='utf-8')
        update_diagnosis = (ROOT / 'docs/update-diagnosis.md').read_text(encoding='utf-8')
        update_diagnosis_ko = (ROOT / 'docs/update-diagnosis.ko.md').read_text(encoding='utf-8')

        for term in [
            'Quick Reading Order',
            '.tink/current/context-map.json',
            '.tink/current/context-metrics-evaluation.json',
            '.tink/current/excluded-context.md',
            '.tink/current/verification.json',
            'Do not create a new command surface',
            'Claude Code and Codex',
            'macOS and Windows',
            'Context Budget Ledger',
            'context-metrics-evaluation.json',
            'verification_link',
        ]:
            self.assertIn(term, work_state)

        for term in [
            'Phase 5: Update Confidence',
            'existing users',
            'Codex install with legacy `skills/tink/SKILL.md`',
            'Update Result Summary',
            'Troubleshooting Guide',
            'Verification Recipe',
            'No new public command is added',
        ]:
            self.assertIn(term, phase5)

        for term in [
            '구현 상태 매트릭스',
            '새 public `tink index` command는 만들지 않는다',
            'Claude Code와 Codex',
            'macOS와 Windows',
            'Context Graph Lite',
            'Evidence Runner Plus',
            'MCP Gateway Policy',
            'Harness Lifecycle Metrics',
            'Sentry 연동은 현재 계획에서 제외한다',
            'Release Evidence Pack',
            '현재 계획에서 제외한다',
            '사용자나 팀이 직접 결정해야',
        ]:
            self.assertIn(term, idea_plan)

        for term in [
            '작업 상태 읽기 가이드',
            '빠른 읽기 순서',
            '.tink/current/verification.json',
            'Claude Code와 Codex',
            'macOS와 Windows',
            'Context Budget Ledger',
            'context-metrics-evaluation.json',
            'verification_link',
        ]:
            self.assertIn(term, work_state_ko)

        for term in [
            'Phase 5: 업데이트 신뢰도',
            '기존 사용자',
            'Update Result Summary',
            'Troubleshooting Guide',
            '새 public command가 추가되지 않습니다',
        ]:
            self.assertIn(term, phase5_ko)

        for term in [
            'Update Troubleshooting',
            'Update Result Summary',
            'Old `tink` Still Appears In Codex',
            'Source Command Tink',
            'Codex-only update',
            'Schema Files Are Missing',
            'Windows Encoding Warnings',
            'Claude Code, Codex, or both',
        ]:
            self.assertIn(term, troubleshooting)

        for term in [
            '업데이트 문제 해결 가이드',
            'Update Result Summary',
            'Codex skill picker에 예전 `tink`가 보일 때',
            'Source Command Tink',
            'Codex-only update',
            'schema files가 없을 때',
            'Windows에서 인코딩 경고가 보일 때',
            'Claude Code, Codex, 또는 둘 다',
        ]:
            self.assertIn(term, troubleshooting_ko)

        for term in [
            'Update Verification Recipe',
            'Quick Check',
            'Update Result Summary',
            'Codex Skills',
            'Source Command Tink',
            'Claude Code Commands',
            'Healthy Update Criteria',
            'docs/update-troubleshooting.md',
        ]:
            self.assertIn(term, verification_recipe)

        for term in [
            '업데이트 검증 레시피',
            '빠른 검증',
            'Update Result Summary',
            'Codex skill 확인',
            'Source Command Tink',
            'Claude Code command 확인',
            '정상으로 볼 수 있는 기준',
            'docs/update-troubleshooting.ko.md',
        ]:
            self.assertIn(term, verification_recipe_ko)

        for term in [
            'Planned Work Units',
            'Verification Evidence Details',
            'External Context Policy',
            'Harness Lifecycle Signals',
            'Memory Decision Layers',
            'Context Change Review',
            'Update Diagnosis',
            'Release evidence bundling remains excluded',
        ]:
            self.assertIn(term, planned)

        for term in [
            '계획된 작업 단위',
            '검증 증거 세분화',
            '외부 컨텍스트 정책',
            '하네스 생애주기 신호',
            '메모리 결정 계층',
            '컨텍스트 변화 리뷰',
            '업데이트 진단',
            'release evidence bundling은 계속 제외한다',
        ]:
            self.assertIn(term, planned_ko)

        for text, terms in [
            (evidence_details, ['evidence_kind', 'evidence_ref', 'observed', 'Claude Code', 'Codex']),
            (evidence_details_ko, ['evidence_kind', 'evidence_ref', 'observed', 'Claude Code', 'Codex']),
            (external_policy, ['mcp-policy.schema.json', 'read-only', 'Sentry is not part of the current plan']),
            (external_policy_ko, ['mcp-policy.schema.json', 'read-only', 'Sentry는 현재 계획에 포함하지 않는다']),
            (lifecycle, ['harness-lifecycle.schema.json', 'frog_candidate', 'plain health summary', 'generate-harness-lifecycle-summary.mjs', 'render-harness-health-report.mjs', 'weave` and `/tink:frog` should prepare this summary', 'normal approval payload']),
            (lifecycle_ko, ['harness-lifecycle.schema.json', 'frog_candidate', '하네스 생애주기 신호는 재사용 하네스의 건강 요약이다', 'generate-harness-lifecycle-summary.mjs', 'render-harness-health-report.mjs', '요약을 먼저 준비해야 한다', '승인 payload']),
            (memory_layers, ['approved/', 'candidate/', 'rejected/', 'evidence/']),
            (memory_layers_ko, ['approved/', 'candidate/', 'rejected/', 'evidence/']),
            (context_change, ['context-diff.json', 'not a new command', 'not a hidden runtime cache']),
            (context_change_ko, ['context-diff.json', '새 command도 아니고', 'hidden runtime cache도 아니다']),
            (context_budget, ['Context Budget Ledger', 'verification_link', 'measurement_status: "estimated"', 'measurement_status: "measured"', 'Do not claim 90% without evidence']),
            (context_budget_ko, ['Context Budget Ledger', 'verification_link', 'measurement_status: "estimated"', 'measurement_status: "measured"', '근거 없이 90% 달성으로 표시하지 않는다']),
            (context_metrics, ['Context Metrics Evaluator', 'fixture-ratio-v1', 'not a new public command', 'production telemetry']),
            (context_metrics_ko, ['Context Metrics Evaluator', 'fixture-ratio-v1', '새 public command가 아니다', 'production telemetry']),
            (context_rollup, ['Context Run History Rollup', 'run_history', 'not a new public command', 'production telemetry']),
            (context_rollup_ko, ['Context Run History Rollup', 'run_history', '새 public command가 아니다', 'production telemetry']),
            (context_threshold, ['Context Threshold Status', '90 percent', 'not a new public command', 'production telemetry']),
            (context_threshold_ko, ['Context Threshold Status', '90% 목표', '새 public command가 아니다', 'production telemetry']),
            (context_run_record, ['Context Run Record Policy', 'not a new public command', 'automatic', 'Sentry integration']),
            (context_run_record_ko, ['Context Run Record Policy', '새 public command가 아니다', '자동 수집', 'Sentry 연동']),
            (context_summary_html, ['Tink 컨텍스트 엔지니어링 작업 요약', 'PR #12', '다음 작업 방향']),
            (context_efficiency_html, ['Tink 컨텍스트 엔지니어링', 'role', 'reuse_signal', 'verification_link', '예상 개선 효과']),
            (update_diagnosis, ['without adding a new command', 'Update Result Summary']),
            (update_diagnosis_ko, ['새 command를 추가하지 않고', 'Update Result Summary']),
        ]:
            for term in terms:
                self.assertIn(term, text)

    def test_command_surface_consistent_across_surfaces(self):
        expected_slash_commands = {
            '/tink:setup', '/tink:cast', '/tink:list', '/tink:frog', '/tink:weave', '/tink:update',
            '/tink:verify',
        }
        legacy_commands = [
            '/tink:forge', '/tink:purge', '/tink:hone', '/tink:prime',
            '/tiny:', '/tink:save', '/tink:remember', '/tink:fix',
        ]
        surfaces = {
            'README.md': ROOT / 'README.md',
            'skills/tink/SKILL.md': ROOT / 'skills/tink/SKILL.md',
        }
        for surface_name, path in surfaces.items():
            text = path.read_text(encoding='utf-8')
            for cmd in expected_slash_commands:
                self.assertIn(cmd, text, f'{surface_name} missing {cmd}')
            for old_cmd in legacy_commands:
                self.assertNotIn(old_cmd, text, f'{surface_name} still contains legacy {old_cmd}')

    def test_harness_synthesis_dogfood_example(self):
        text = (ROOT / 'examples/harness-synthesis-dogfood.md').read_text(encoding='utf-8')
        self.assertIn('Harness synthesis dogfood: harness-curation', text)
        self.assertIn('Tools become poison when there are too many', text)
        self.assertIn('Extracted behavior-shaping rules', text)
        self.assertIn('harness-curation', text)
        self.assertIn('Specificity: 5/5', text)
        self.assertIn('Validation checklist', text)

    def test_context_habit_calibration_dogfood_example(self):
        text = (ROOT / 'examples/context-habit-calibration-dogfood.md').read_text(encoding='utf-8')
        self.assertIn('Context habit calibration dogfood', text)
        self.assertIn('observed signals', text)
        self.assertIn('context-hoarding', text)
        self.assertIn('output length', text)
        self.assertIn('context-habit-calibration', text)
        self.assertIn('Validation checklist', text)

    def test_repo_signals_doc_explains_flow(self):
        text = (ROOT / 'docs/repo-signals.md').read_text(encoding='utf-8')
        ko_text = (ROOT / 'docs/repo-signals.ko.md').read_text(encoding='utf-8')
        self.assertIn('Repo Signals', text)
        self.assertIn('not a `tink index` command', text)
        self.assertIn('docs/compatibility-policy.md', text)
        self.assertIn('verification_hints', text)
        self.assertIn('Context Graph Lite', text)
        self.assertIn('context_graph_lite', text)
        self.assertIn('when_paths', text)
        self.assertIn('include_paths', text)
        self.assertIn('not a new command', text)
        self.assertIn('contract.verification.manual_checks[]', text)
        self.assertIn('context-map.json signals', text)
        self.assertIn('unmatched_path', text)
        self.assertIn('must not', text)
        self.assertIn('Repo signal', ko_text)
        self.assertIn('Context Graph Lite', ko_text)
        self.assertIn('context_graph_lite', ko_text)
        self.assertIn('새 command가 아니다', ko_text)
        self.assertIn('tink index', ko_text)
        self.assertIn('unmatched_path', ko_text)
        self.assertIn('Claude Code와 Codex', ko_text)
        self.assertIn('macOS와 Windows', ko_text)

    def test_mcp_safe_profile_explains_phase_4(self):
        text = (ROOT / 'docs/mcp-safe-profile.md').read_text(encoding='utf-8')
        self.assertIn('MCP Safe Profile', text)
        self.assertIn('Phase 4', text)
        self.assertIn('Figma, GitHub, official docs, dashboards, and attachments are representative examples', text)
        self.assertIn('not about making one or two tools the only supported sources', text)
        self.assertIn('Trust Risk', text)
        self.assertIn('Scope Risk', text)
        self.assertIn('Safety Risk', text)
        self.assertIn('context-map.json', text)
        self.assertIn('excluded-context.md', text)
        self.assertIn('contract.verification.manual_checks[]', text)
        self.assertIn('Claude Code and Codex', text)
        self.assertIn('macOS and Windows', text)
        self.assertIn('must not', text)

    def test_compatibility_policy_sets_default_support_matrix(self):
        text = (ROOT / 'docs/compatibility-policy.md').read_text(encoding='utf-8')
        self.assertIn('Claude Code and Codex are both supported surfaces', text)
        self.assertIn('macOS and Windows are both supported operating systems', text)
        self.assertIn('Do not add a feature that only works for Claude Code', text)
        self.assertIn('Do not add a feature that only works for Codex', text)
        self.assertIn('repo-local `.claude` command copy', text)
        self.assertIn('matching Codex skill behavior', text)
        self.assertIn('What changes for Claude Code?', text)
        self.assertIn('Does this work on Windows?', text)

    def test_current_run_context_artifact_fixture(self):
        fixture_dir = ROOT / 'tests/fixtures/current-run'
        pack = (fixture_dir / 'context-pack.md').read_text(encoding='utf-8')
        notes = (fixture_dir / 'notes.md').read_text(encoding='utf-8')
        maintenance_ledger = [
            json.loads(line)
            for line in (fixture_dir / 'maintenance-ledger.jsonl').read_text(encoding='utf-8').splitlines()
            if line.strip()
        ]
        maintenance_friction = [
            json.loads(line)
            for line in (fixture_dir / 'maintenance-friction.jsonl').read_text(encoding='utf-8').splitlines()
            if line.strip()
        ]
        maintenance_weave = json.loads((fixture_dir / 'maintenance-weave-queue.json').read_text(encoding='utf-8'))
        contract = json.loads((fixture_dir / 'contract.json').read_text(encoding='utf-8'))
        context_map = json.loads((fixture_dir / 'context-map.json').read_text(encoding='utf-8'))
        context_metrics = json.loads((fixture_dir / 'context-metrics-evaluation.json').read_text(encoding='utf-8'))
        context_diff = json.loads((fixture_dir / 'context-diff.json').read_text(encoding='utf-8'))
        external_profile = json.loads((fixture_dir / 'external-context-profile.json').read_text(encoding='utf-8'))
        verification = json.loads((fixture_dir / 'verification.json').read_text(encoding='utf-8'))
        verification_failure = json.loads((fixture_dir / 'verification-failure.json').read_text(encoding='utf-8'))
        verification_blocked = json.loads((fixture_dir / 'verification-blocked.json').read_text(encoding='utf-8'))
        excluded = (fixture_dir / 'excluded-context.md').read_text(encoding='utf-8')
        schema = json.loads((ROOT / 'templates/tink/schemas/context-map.schema.json').read_text(encoding='utf-8'))
        verification_schema = json.loads((ROOT / 'templates/tink/schemas/verification.schema.json').read_text(encoding='utf-8'))
        repo_signals = json.loads((ROOT / 'tests/fixtures/repo-signals/tink-harness.json').read_text(encoding='utf-8'))
        path_cases = json.loads((ROOT / 'tests/fixtures/repo-signals/path-cases.json').read_text(encoding='utf-8'))

        for required in schema['required']:
            self.assertIn(required, context_map)

        self.assertIn('Included Context', pack)
        self.assertIn('Excluded Context', pack)
        self.assertIn('Verification Implications', pack)
        self.assertIn('Repo Signals', pack)
        self.assertIn('context_graph_lite.rules.claude-command-sync', pack)
        self.assertIn('verification_hints.command-template-sync', pack)
        self.assertIn('External Sources', excluded)
        self.assertIn('Deferred Work', excluded)
        self.assertIn('Public graph indexing is intentionally excluded', excluded)
        self.assertIn('does not create a `tink index` command', excluded)
        self.assertIn('Figma unrelated pages', excluded)
        self.assertIn('GitHub unrelated discussion', excluded)
        self.assertIn('Official docs examples from older versions', excluded)
        self.assertIn('Deployment dashboard evidence is blocked', excluded)
        self.assertIn('Verification Summary', notes)
        self.assertIn('Verification Failure Summary', notes)
        self.assertIn('Verification Blocked Summary', notes)
        for field in ['result:', 'checked:', 'problems:', 'remaining:', 'last_safe_point:', 'next_action:', 'evidence:']:
            self.assertIn(field, notes)
        self.assertIn('remaining: none', notes)
        self.assertIn('last_safe_point: verification is incomplete', notes)
        self.assertNotIn('Traceback', notes)
        self.assertNotIn('npm ERR!', notes)

        self.assertGreaterEqual(len(context_map['included']), 3)
        self.assertGreaterEqual(len(context_map['excluded']), 1)
        self.assertGreaterEqual(len(context_map['signals']), 1)
        self.assertIn('external_context', context_map)
        self.assertGreaterEqual(len(context_map['external_context']), 3)
        external_schema = schema['$defs']['external_context_profile']
        external_required = set(external_schema['required'])
        allowed_external_confidence = set(external_schema['properties']['confidence']['enum'])
        allowed_sensitivity = set(external_schema['properties']['sensitivity']['enum'])
        all_external_sources = context_map['external_context'] + external_profile['sources']
        for item in all_external_sources:
            self.assertTrue(external_required.issubset(item), item)
            self.assertIn(item['confidence'], allowed_external_confidence)
            self.assertIn(item['sensitivity'], allowed_sensitivity)
            self.assertGreaterEqual(len(item['included']), 1)
            self.assertGreaterEqual(len(item['excluded']), 1)
            self.assertNotIn('raw token', ' '.join(item['included']).lower())
        source_names = {item['source'] for item in all_external_sources}
        self.assertIn('Figma', source_names)
        self.assertIn('GitHub', source_names)
        self.assertIn('official docs', source_names)
        self.assertNotIn('Sentry', source_names)
        self.assertTrue(source_names - {'Figma'})
        for blocked in external_profile['blocked_sources']:
            self.assertIn('blocked_reason', blocked)
            self.assertIn('next_action', blocked)
            self.assertIn(blocked['sensitivity'], allowed_sensitivity)
        for required in verification_schema['required']:
            self.assertIn(required, verification)
        self.assertIn(verification['surface'], verification_schema['properties']['surface']['enum'])
        self.assertIn(verification['platform'], verification_schema['properties']['platform']['enum'])
        self.assertIn(verification['result'], verification_schema['properties']['result']['enum'])
        self.assertGreaterEqual(len(verification['checks']), 1)
        check_required = set(verification_schema['$defs']['check_result']['required'])
        allowed_kinds = verification_schema['$defs']['check_result']['properties']['kind']['enum']
        allowed_statuses = verification_schema['$defs']['check_result']['properties']['status']['enum']
        allowed_failure_types = verification_schema['$defs']['check_result']['properties']['failure_type']['enum']
        allowed_maintenance_signals = verification_schema['$defs']['check_result']['properties']['maintenance_signal']['enum']
        for evidence in [verification, verification_failure, verification_blocked]:
            for required in verification_schema['required']:
                self.assertIn(required, evidence)
            self.assertIn(evidence['result'], verification_schema['properties']['result']['enum'])
            self.assertIn('report', evidence)
            for required in verification_schema['$defs']['report']['required']:
                self.assertIn(required, evidence['report'])
            self.assertIsInstance(evidence['report']['checked'], list)
            self.assertIsInstance(evidence['report']['remaining'], list)
            self.assertGreater(len(evidence['report']['result_line']), 10)
            self.assertGreater(len(evidence['report']['next_action']), 10)
            for check in evidence['checks']:
                self.assertTrue(check_required.issubset(check), check)
                self.assertIn(check['kind'], allowed_kinds)
                self.assertIn(check['status'], allowed_statuses)
                if 'failure_type' in check:
                    self.assertIn(check['failure_type'], allowed_failure_types)
                if 'maintenance_signal' in check:
                    self.assertIn(check['maintenance_signal'], allowed_maintenance_signals)
                    self.assertIn('next_action', check)

        self.assertEqual(verification_failure['result'], 'fail')
        self.assertIn('check_failed', {signal['type'] for signal in verification_failure['maintenance_signals']})
        self.assertEqual(verification_blocked['result'], 'blocked')
        blocked_signal_types = {signal['type'] for signal in verification_blocked['maintenance_signals']}
        self.assertIn('check_blocked', blocked_signal_types)
        self.assertIn('check_skipped', blocked_signal_types)
        ledger_results = {entry['result'] for entry in maintenance_ledger}
        self.assertEqual(ledger_results, {'pass', 'fail', 'blocked'})
        for entry in maintenance_ledger:
            self.assertEqual(entry['type'], 'verify')
            self.assertIn('.tink/current/contract.json', entry['files'])
            self.assertIn('.tink/current/verification.json', entry['files'])
            self.assertEqual(entry['approval'], 'current-run')
            self.assertEqual(entry['rollback'], 'No reusable state changed.')
        queue_signals = {item['signal'] for item in maintenance_weave['items']}
        self.assertEqual(queue_signals, {'check_failed', 'check_blocked', 'check_skipped'})
        for item in maintenance_weave['items']:
            self.assertEqual(item['run'], '.tink/current')
            self.assertTrue(item['auto'])
            self.assertIn('reason', item)
        friction_types = {entry['type'] for entry in maintenance_friction}
        self.assertEqual(friction_types, {'check_failed', 'check_blocked', 'check_skipped'})
        for entry in maintenance_friction:
            self.assertEqual(entry['source'], 'verify')
            self.assertEqual(entry['contract'], '.tink/current/contract.json')
            self.assertEqual(entry['evidence'], '.tink/current/verification.json')
        required_skipped = [
            check
            for check in verification_blocked['checks']
            if check['required'] and check['status'] == 'skipped'
        ]
        self.assertEqual(required_skipped, [])

        entry_required = set(schema['$defs']['context_entry']['required'])
        allowed_confidence = set(schema['$defs']['context_entry']['properties']['confidence']['enum'])
        allowed_roles = set(schema['$defs']['context_entry']['properties']['role']['enum'])
        allowed_costs = set(schema['$defs']['context_entry']['properties']['cost']['enum'])
        allowed_reuse_signals = set(schema['$defs']['context_entry']['properties']['reuse_signal']['enum'])
        allowed_staleness = set(schema['$defs']['context_entry']['properties']['staleness']['enum'])
        allowed_evidence_kinds = set(schema['$defs']['context_entry']['properties']['evidence_kind']['enum'])
        for entry in [*context_map['included'], *context_map['excluded']]:
            self.assertTrue(entry_required.issubset(entry), entry)
            self.assertTrue(('path' in entry) or ('source' in entry), entry)
            self.assertIn(entry['confidence'], allowed_confidence)
            for field in ['role', 'cost', 'reuse_signal', 'staleness', 'evidence_kind']:
                self.assertIn(field, entry)
            self.assertIn(entry['role'], allowed_roles)
            self.assertIn(entry['cost'], allowed_costs)
            self.assertIn(entry['reuse_signal'], allowed_reuse_signals)
            self.assertIn(entry['staleness'], allowed_staleness)
            self.assertIn(entry['evidence_kind'], allowed_evidence_kinds)
            if entry['role'] == 'verification_target':
                self.assertIn('verification_link', entry)
            self.assertIsInstance(entry['reason'], str)
            self.assertGreater(len(entry['reason']), 10)

        included_with_links = [
            entry
            for entry in context_map['included']
            if 'role' in entry and 'verification_link' in entry
        ]
        self.assertEqual(len(included_with_links), len(context_map['included']))
        avoid_next_time = [
            entry
            for entry in context_map['excluded']
            if entry.get('reuse_signal') == 'avoid_next_time'
        ]
        self.assertGreaterEqual(len(avoid_next_time), 1)

        metrics = context_map['efficiency_metrics']
        self.assertEqual(metrics['target_threshold_percent'], 90)
        self.assertEqual(metrics['measurement_status'], 'measured')
        self.assertEqual(metrics['evaluator'], 'fixture-ratio-v1')
        metric_names = {item['name'] for item in metrics['scores']}
        self.assertEqual(metric_names, CONTEXT_EFFICIENCY_METRICS)
        for metric in metrics['scores']:
            self.assertGreaterEqual(metric['score_percent'], 0)
            self.assertLessEqual(metric['score_percent'], 100)
            self.assertIn(metric['confidence'], {'low', 'medium', 'high'})
            self.assertIn('limit', metric)
            self.assertIn('formula', metric)
            self.assertIn('numerator', metric)
            self.assertIn('denominator', metric)

        self.assertEqual(context_metrics['evaluator'], metrics['evaluator'])
        self.assertEqual(context_metrics['measurement_status'], 'measured')
        self.assertEqual(context_metrics['scope'], 'fixture')
        self.assertIn('not production telemetry', ' '.join(context_metrics['limits']))
        expected_metric_scores = {item['name']: item for item in context_metrics['scores']}
        self.assertEqual(set(expected_metric_scores), CONTEXT_EFFICIENCY_METRICS)

        budget_fields = ['role', 'cost', 'reuse_signal', 'staleness', 'reason']
        excluded_budget_ready = [
            entry
            for entry in context_map['excluded']
            if all(field in entry for field in budget_fields)
        ]
        included_pack_ready = [
            entry
            for entry in context_map['included']
            if 'role' in entry
            and 'cost' in entry
            and (entry['cost'] != 'high' or 'verification_link' in entry)
        ]
        included_review_ready = [
            entry
            for entry in context_map['included']
            if 'role' in entry and 'verification_link' in entry
        ]
        known_verification_links = {
            'verification_commands.test suite',
            *{f"verification_hints.{hint['name']}" for hint in repo_signals['verification_hints']},
            *{check['source_ref'] for check in contract['verification']['manual_checks'] if 'source_ref' in check},
        }
        verification_targets = [
            entry for entry in context_map['included'] if entry.get('role') == 'verification_target'
        ]
        verification_targets_linked = [
            entry for entry in verification_targets if entry.get('verification_link') in known_verification_links
        ]
        context_entries = [*context_map['included'], *context_map['excluded']]
        context_entries_with_reuse = [entry for entry in context_entries if 'reuse_signal' in entry]
        graph_path_cases = [
            case for case in path_cases['cases'] if case.get('expected_context_rules')
        ]
        graph_path_cases_with_roles = [
            case for case in graph_path_cases if case.get('expected_context_roles')
        ]
        diff_changes_linked = [
            item for item in context_diff['changes'] if 'verification_link' in item
        ]
        metric_impacts_with_direction = [
            item for item in context_diff['metric_impacts'] if 'direction' in item and 'metric' in item
        ]
        avoid_next_time_exclusions = [
            item for item in context_diff['excluded'] if item.get('reuse_signal') == 'avoid_next_time'
        ]
        calculated_scores = {
            'unnecessary_context_reduction': (
                len(excluded_budget_ready),
                len(context_map['excluded']),
            ),
            'initial_context_pack_size_reduction': (
                len(included_pack_ready),
                len(context_map['included']),
            ),
            'review_evidence_lookup_time_reduction': (
                len(included_review_ready),
                len(context_map['included']),
            ),
            'verification_omission_detection': (
                len(verification_targets_linked),
                len(verification_targets),
            ),
            'repeated_context_reuse_accuracy': (
                len(context_entries_with_reuse) + len(graph_path_cases_with_roles),
                len(context_entries) + len(graph_path_cases),
            ),
            'rework_probability_reduction': (
                len(diff_changes_linked) + len(metric_impacts_with_direction) + len(avoid_next_time_exclusions),
                len(context_diff['changes']) + len(context_diff['metric_impacts']) + len(context_diff['excluded']),
            ),
        }
        context_map_scores = {item['name']: item for item in metrics['scores']}
        for name, (numerator, denominator) in calculated_scores.items():
            expected = expected_metric_scores[name]
            self.assertEqual(expected['numerator'], numerator, name)
            self.assertEqual(expected['denominator'], denominator, name)
            self.assertEqual(expected['score_percent'], pct(numerator, denominator), name)
            self.assertGreaterEqual(expected['score_percent'], context_metrics['target_threshold_percent'], name)
            self.assertEqual(context_map_scores[name]['score_percent'], expected['score_percent'], name)
            self.assertEqual(context_map_scores[name]['formula'], expected['formula'], name)

        for signal in context_map['signals']:
            for required in ['kind', 'value', 'reason']:
                self.assertIn(required, signal)
            if 'source' in signal:
                source_path = ROOT / signal['source']
                self.assertTrue(source_path.exists(), signal['source'])
                self.assertIn('source_ref', signal)
                self.assertIn('confidence', signal)

        hint_names = {hint['name'] for hint in repo_signals['verification_hints']}
        manual_checks = contract['verification']['manual_checks']
        hint_signals = {
            signal['source_ref']
            for signal in context_map['signals']
            if signal.get('kind') == 'verification_hint'
        }
        graph_signals = {
            signal['source_ref']
            for signal in context_map['signals']
            if signal.get('kind') == 'context_graph_rule'
        }
        unmatched_paths = {
            signal['value']
            for signal in context_map['signals']
            if signal.get('kind') == 'unmatched_path'
        }
        self.assertIn('context_graph_lite.rules.claude-command-sync', graph_signals)
        self.assertIn('docs/memory.md', unmatched_paths)
        self.assertGreaterEqual(len(manual_checks), 1)
        external_manual_checks = [
            check
            for check in manual_checks
            if check.get('source') == 'tests/fixtures/current-run/external-context-profile.json'
        ]
        self.assertGreaterEqual(len(external_manual_checks), 3)
        external_check_refs = {check['source_ref'] for check in external_manual_checks}
        self.assertIn('sources.Figma.verification_hint', external_check_refs)
        self.assertIn('sources.GitHub.verification_hint', external_check_refs)
        self.assertIn('sources.official docs.verification_hint', external_check_refs)
        verification_external_refs = {
            check.get('source_ref')
            for check in verification['checks']
            if check.get('source') == 'tests/fixtures/current-run/external-context-profile.json'
        }
        self.assertTrue(external_check_refs.issubset(verification_external_refs))
        for check in manual_checks:
            self.assertIn('target', check)
            if check.get('source_ref', '').startswith('verification_hints.'):
                self.assertIn(check['source_ref'].split('.', 1)[1], hint_names)
                self.assertIn(check['source_ref'], hint_signals)
                self.assertEqual(check['source'], 'tests/fixtures/repo-signals/tink-harness.json')

    def test_context_metrics_run_history_rollup_fixture(self):
        rollup = json.loads((ROOT / 'tests/fixtures/maintenance/context-metrics-rollup.json').read_text(encoding='utf-8'))

        self.assertEqual(rollup['rollup'], '.tink/maintenance/context-metrics-rollup.json')
        self.assertEqual(rollup['evaluator'], 'run-history-rollup-v1')
        self.assertEqual(rollup['target_threshold_percent'], 90)
        self.assertEqual(rollup['measurement_status'], 'measured')
        self.assertEqual(rollup['scope'], 'run_history')
        self.assertIn('not production telemetry', ' '.join(rollup['limits']))
        self.assertGreaterEqual(len(rollup['runs']), 3)

        for run in rollup['runs']:
            self.assertIn('run', run)
            self.assertIn('source_ref', run)
            self.assertIn(run['scope'], {'fixture', 'current_run', 'run_history'})
            self.assertEqual(set(run['scores']), CONTEXT_EFFICIENCY_METRICS)

        rollup_scores = {item['name']: item for item in rollup['scores']}
        self.assertEqual(set(rollup_scores), CONTEXT_EFFICIENCY_METRICS)

        for name in CONTEXT_EFFICIENCY_METRICS:
            values = [run['scores'][name] for run in rollup['runs']]
            score = rollup_scores[name]
            self.assertEqual(score['numerator'], sum(values), name)
            self.assertEqual(score['denominator'], len(values), name)
            self.assertEqual(score['score_percent'], round(sum(values) / len(values)), name)
            self.assertEqual(score['minimum_percent'], min(values), name)
            self.assertGreaterEqual(score['score_percent'], rollup['target_threshold_percent'], name)
            self.assertGreaterEqual(score['minimum_percent'], rollup['target_threshold_percent'], name)
            self.assertIn('average(run_scores.', score['formula'])
            self.assertGreaterEqual(len(score['evidence_refs']), len(rollup['runs']))

    def test_context_threshold_status_matches_metric_fixtures(self):
        current = json.loads((ROOT / 'tests/fixtures/current-run/context-metrics-evaluation.json').read_text(encoding='utf-8'))
        rollup = json.loads((ROOT / 'tests/fixtures/maintenance/context-metrics-rollup.json').read_text(encoding='utf-8'))
        status = json.loads((ROOT / 'tests/fixtures/maintenance/context-threshold-status.json').read_text(encoding='utf-8'))

        self.assertEqual(status['status'], '.tink/maintenance/context-threshold-status.json')
        self.assertEqual(status['target_threshold_percent'], 90)
        self.assertEqual(status['measurement_status'], 'measured')
        self.assertEqual(status['scope'], 'representative_run_history')
        self.assertIn('not production telemetry', ' '.join(status['limits']))
        self.assertEqual(set(status['evidence_sources']), {
            'tests/fixtures/current-run/context-metrics-evaluation.json',
            'tests/fixtures/maintenance/context-metrics-rollup.json',
        })

        current_scores = {item['name']: item for item in current['scores']}
        rollup_scores = {item['name']: item for item in rollup['scores']}
        status_scores = {item['name']: item for item in status['scores']}
        self.assertEqual(set(status_scores), CONTEXT_EFFICIENCY_METRICS)

        for name in CONTEXT_EFFICIENCY_METRICS:
            item = status_scores[name]
            self.assertEqual(item['current_run_percent'], current_scores[name]['score_percent'], name)
            self.assertEqual(item['rollup_average_percent'], rollup_scores[name]['score_percent'], name)
            self.assertEqual(item['rollup_minimum_percent'], rollup_scores[name]['minimum_percent'], name)
            self.assertGreaterEqual(item['current_run_percent'], status['target_threshold_percent'], name)
            self.assertGreaterEqual(item['rollup_average_percent'], status['target_threshold_percent'], name)
            self.assertGreaterEqual(item['rollup_minimum_percent'], status['target_threshold_percent'], name)
            self.assertEqual(item['status'], 'meets_threshold')
            self.assertEqual(item['evidence_strength'], 'fixture_and_representative_rollup')

    def test_context_run_record_policy_keeps_real_rollup_boundary_safe(self):
        policy = json.loads((ROOT / 'tests/fixtures/maintenance/context-run-record-policy.json').read_text(encoding='utf-8'))

        self.assertEqual(policy['policy'], '.tink/maintenance/context-run-record-policy.json')
        self.assertEqual(policy['scope'], 'future_runtime_records')
        self.assertEqual(policy['measurement_status'], 'policy_only')
        self.assertEqual(policy['target_threshold_percent'], 90)
        self.assertFalse(policy['public_command'])
        self.assertFalse(policy['automatic_collection'])
        self.assertFalse(policy['watcher'])
        self.assertFalse(policy['hidden_runtime_index'])
        self.assertFalse(policy['generated_cache'])
        self.assertIn('Sentry', policy['excluded_integrations'])

        included_kinds = {item['kind']: item for item in policy['included_records']}
        self.assertEqual(set(included_kinds), {
            'approved_current_run_record',
            'context_metrics_artifact',
            'verification_evidence',
        })
        approved_fields = set(included_kinds['approved_current_run_record']['required_fields'])
        for field in ['run', 'completed_at', 'surface', 'platform', 'context_metrics', 'verification', 'evidence_refs', 'limits']:
            self.assertIn(field, approved_fields)

        metric_fields = set(included_kinds['context_metrics_artifact']['required_fields'])
        for field in ['evaluator', 'target_threshold_percent', 'measurement_status', 'scope', 'scores']:
            self.assertIn(field, metric_fields)

        excluded_kinds = {item['kind'] for item in policy['excluded_records']}
        self.assertIn('secret_or_private_payload', excluded_kinds)
        self.assertIn('unapproved_reusable_state', excluded_kinds)
        self.assertIn('broad_external_context', excluded_kinds)

        readiness = {item['name']: item for item in policy['rollup_readiness_checks']}
        self.assertIn('all_metrics_present', readiness)
        self.assertIn('verification_linked', readiness)
        self.assertIn('limits_declared', readiness)
        self.assertIn('privacy_boundary_kept', readiness)
        for check in readiness.values():
            self.assertTrue(check['required'])
            self.assertGreaterEqual(len(check['covers']), 1)
        self.assertEqual(set(readiness['all_metrics_present']['covers']), CONTEXT_EFFICIENCY_METRICS)

        self.assertEqual(set(policy['compatibility']['surfaces']), {'Claude Code', 'Codex'})
        self.assertEqual(set(policy['compatibility']['platforms']), {'macOS', 'Windows'})
        self.assertEqual(policy['compatibility']['verification_command'], 'npm test')

    def test_repo_signal_fixture_matches_repo(self):
        fixture = json.loads((ROOT / 'tests/fixtures/repo-signals/tink-harness.json').read_text(encoding='utf-8'))
        test_source = (ROOT / 'tests/test_templates.py').read_text(encoding='utf-8')

        self.assertEqual(fixture['repo'], 'tink-harness')
        self.assertIn('This is not a generated index', fixture['purpose'])
        self.assertNotIn('index.md', fixture['command_surface']['allowed'])
        self.assertIn('index.md', fixture['command_surface']['forbidden'])

        for item in fixture['instruction_files']:
            self.assertTrue((ROOT / item['path']).exists(), item['path'])
            self.assertGreater(len(item['reason']), 10)

        for schema_path in fixture['schema_files']:
            self.assertTrue((ROOT / schema_path).exists(), schema_path)
            json.loads((ROOT / schema_path).read_text(encoding='utf-8'))

        for item in fixture['fixture_dirs']:
            self.assertTrue((ROOT / item['path']).is_dir(), item['path'])

        graph = fixture['context_graph_lite']
        self.assertEqual(graph['mode'], 'internal-cast-only')
        self.assertFalse(graph['public_command'])
        self.assertIn('not a generated index', graph['description'])
        self.assertGreaterEqual(len(graph['rules']), 4)
        graph_rule_names = {rule['name'] for rule in graph['rules']}
        self.assertIn('claude-command-sync', graph_rule_names)
        self.assertIn('codex-skill-surface', graph_rule_names)
        self.assertIn('installer-update-flow', graph_rule_names)
        self.assertIn('schema-contract-artifacts', graph_rule_names)
        for rule in graph['rules']:
            for field in ['name', 'when_paths', 'include_paths', 'signal_refs', 'reason', 'confidence']:
                self.assertIn(field, rule)
            self.assertGreater(len(rule['reason']), 10)
            self.assertIn(rule['confidence'], {'low', 'medium', 'high'})
            for pattern in rule['when_paths']:
                self.assertNotEqual(pattern, '')
            for include_path in rule['include_paths']:
                self.assertTrue((ROOT / include_path).exists(), include_path)

        for command in fixture['verification_commands']:
            self.assertEqual(command['command'], 'npm test')
            self.assertIn('template sync', command['covers'])

        for group in fixture['sync_groups']:
            self.assertEqual(group['rule'], 'byte-identical')
            self.assertIn(group['verified_by'], test_source)
            self.assertGreaterEqual(len(group['files']), 2)
            for path in group['files']:
                self.assertTrue((ROOT / path).exists(), path)

        hint_names = set()
        for hint in fixture['verification_hints']:
            hint_names.add(hint['name'])
            self.assertIn('when', hint)
            self.assertIn('add_manual_check', hint)
            self.assertIn('reason', hint)
            check = hint['add_manual_check']
            self.assertIn(check['target'], test_source)
            self.assertIsInstance(check['required'], bool)
            for pattern in hint['when']['paths']:
                self.assertNotEqual(pattern, '')
        self.assertIn('command-template-sync', hint_names)
        self.assertIn('schema-shape', hint_names)
        self.assertIn('installer-update-confidence', hint_names)

        budget_policy = fixture['context_budget_policy']
        self.assertEqual(budget_policy['target_threshold_percent'], 90)
        for field in ['role', 'cost', 'reuse_signal', 'verification_link', 'staleness', 'evidence_kind']:
            self.assertIn(field, budget_policy['entry_fields'])
        role_defaults = {item['role'] for item in budget_policy['role_defaults']}
        self.assertIn('primary', role_defaults)
        self.assertIn('verification_target', role_defaults)
        self.assertIn('avoid_next_time', role_defaults)
        self.assertIn('verification_target entries with matching checks', budget_policy['scoring_basis'])

        allowed = set(fixture['command_surface']['allowed'])
        forbidden = set(fixture['command_surface']['forbidden'])
        self.assertEqual(allowed, EXPECTED_COMMANDS)
        self.assertFalse(allowed & forbidden)
        self.assertIn(fixture['command_surface']['verified_by'], test_source)

    def test_repo_signal_path_cases_select_verification_hints(self):
        signals = json.loads((ROOT / 'tests/fixtures/repo-signals/tink-harness.json').read_text(encoding='utf-8'))
        path_cases = json.loads((ROOT / 'tests/fixtures/repo-signals/path-cases.json').read_text(encoding='utf-8'))
        hints = signals['verification_hints']
        hint_names = {hint['name'] for hint in hints}
        graph_rules = signals['context_graph_lite']['rules']
        graph_rule_names = {rule['name'] for rule in graph_rules}
        known_context_roles = {item['role'] for item in signals['context_budget_policy']['role_defaults']}

        self.assertEqual(path_cases['repo'], 'tink-harness')
        self.assertGreaterEqual(len(path_cases['cases']), 4)

        for case in path_cases['cases']:
            selected = set()
            selected_graph_rules = set()
            selected_context_paths = set()
            selected_signal_refs = set()
            for changed_path in case['changed_paths']:
                self.assertTrue((ROOT / changed_path).exists(), changed_path)
                for hint in hints:
                    patterns = hint['when']['paths']
                    if any(fnmatch.fnmatch(changed_path, pattern) for pattern in patterns):
                        selected.add(hint['name'])
                for rule in graph_rules:
                    if any(fnmatch.fnmatch(changed_path, pattern) for pattern in rule['when_paths']):
                        selected_graph_rules.add(rule['name'])
                        selected_context_paths.update(rule['include_paths'])
                        selected_signal_refs.update(rule['signal_refs'])

            expected = set(case['expected_hints'])
            self.assertTrue(expected.issubset(hint_names), case)
            self.assertEqual(
                selected,
                expected,
                f"{case['name']} selected {sorted(selected)} instead of {sorted(expected)}",
            )
            expected_graph_rules = set(case.get('expected_context_rules', []))
            self.assertTrue(expected_graph_rules.issubset(graph_rule_names), case)
            self.assertEqual(
                selected_graph_rules,
                expected_graph_rules,
                f"{case['name']} selected graph rules {sorted(selected_graph_rules)} instead of {sorted(expected_graph_rules)}",
            )
            for context_path in case.get('expected_context_paths', []):
                self.assertIn(context_path, selected_context_paths, case)
                self.assertTrue((ROOT / context_path).exists(), context_path)
            for hint in expected:
                self.assertTrue(
                    any(ref == f'verification_hints.{hint}' for ref in selected_signal_refs) or not expected_graph_rules,
                    f"{case['name']} did not connect graph rules to verification_hints.{hint}",
                )
            for role in case.get('expected_context_roles', []):
                self.assertIn(role, known_context_roles, case)
            if not expected:
                self.assertEqual(case.get('expected_signal'), 'unmatched_path')
            self.assertGreater(len(case['reason']), 10)

    def test_context_glossary_exists(self):
        text = (ROOT / 'CONTEXT.md').read_text(encoding='utf-8')
        for term in [
            '### Tink',
            '### Cast',
            '### Cast',
            '### Frog',
            '### Weave',
            '### Harness (하네스)',
            '### Harness Selection (하네스 선택)',
            '### Harness Synthesis (하네스 만들기)',
            '### Harness Curation (하네스 정리)',
            '### Habit Calibration (사용 습관 보정)',
            '### Inline Calibration (실행 중 보정)',
            '### Hook Recommendation (자동 제안)',
            '### Run State (실행 상태)',
            '### Context Footprint (컨텍스트 사용량)',
            '### Work Context (작업 맥락)',
            '### Run State Recovery (실행 상태 복구)',
            '### Setup Review (설정 리뷰)',
            '### Command Naming Policy (명령 이름 정책)',
            '### Tone Policy (톤 정책)',
            '### Harness Size (하네스 크기)',
            '### Meta Harness (메타 하네스)',
            '### CLI Select Policy (상호작용 정책)',
        ]:
            self.assertIn(term, text)
        self.assertIn('knit', text)
        self.assertIn('Tinker Bell', text)
        self.assertIn('대표 명령', text)
        self.assertIn('단순한 하네스 생성 명령이 아니다', text)
        self.assertIn('기본 사용 습관 보정 방식', text)
        self.assertIn('참고용 추천', text)
        self.assertIn('behavior-shaping rules', text)
        self.assertIn('거의 쓰지 않거나 겹치는 하네스', text)
        self.assertIn('실제 실패, 반복 사용, 사용자 피드백', text)
        self.assertIn('사용자가 “이어서 해”라고 해도', text)
        self.assertIn('git 추적 여부만 바로 묻지 않는다', text)
        self.assertIn('plugin namespace command', text)
        self.assertIn('사용자가 고르는 설정값이 아니다', text)
        self.assertNotIn('npm ', text)
        self.assertNotIn('TypeScript', text)

    def test_hook_recommendation_stays_advisory(self):
        docs = (ROOT / 'docs/hooks.md').read_text(encoding='utf-8')
        hook = json.loads((ROOT / 'templates/tink/hooks/user-prompt-submit.json').read_text(encoding='utf-8'))
        self.assertIn('실행 중 보정 (Inline Calibration)', docs)
        self.assertIn('자동 제안 (Hook Recommendation)', docs)
        self.assertIn('UserPromptSubmit', docs)
        self.assertIn('advisory-only', docs)
        self.assertIn('one line or shorter', docs)
        self.assertIn('actually registered', docs)
        self.assertIn('short advisory-only automatic suggestions', hook['description'])
        self.assertIn('UserPromptSubmit', hook['behavior'])
        self.assertIn('at most one advisory line', hook['behavior'])
        self.assertIn('never auto-applies harnesses or saves memory', hook['behavior'])
        self.assertEqual(hook['command'], 'node .tink/hooks/user-prompt-submit.mjs')
        script = (ROOT / 'templates/tink/hooks/user-prompt-submit.mjs').read_text(encoding='utf-8')
        self.assertIn('readConfigLanguage', script)
        self.assertIn('startsWith', script)
        self.assertIn('/tink:cast', script)
        self.assertIn('console.log', script)

    def test_contract_rule_graph_and_verify_templates_exist(self):
        schema = json.loads((ROOT / 'templates/tink/schemas/contract.schema.json').read_text(encoding='utf-8'))
        context_schema = json.loads((ROOT / 'templates/tink/schemas/context-map.schema.json').read_text(encoding='utf-8'))
        context_metrics_schema = json.loads((ROOT / 'templates/tink/schemas/context-metrics-evaluation.schema.json').read_text(encoding='utf-8'))
        verification_schema = json.loads((ROOT / 'templates/tink/schemas/verification.schema.json').read_text(encoding='utf-8'))
        mcp_policy_schema = json.loads((ROOT / 'templates/tink/schemas/mcp-policy.schema.json').read_text(encoding='utf-8'))
        lifecycle_schema = json.loads((ROOT / 'templates/tink/schemas/harness-lifecycle.schema.json').read_text(encoding='utf-8'))
        mcp_policy_fixture = json.loads((ROOT / 'tests/fixtures/current-run/mcp-policy.json').read_text(encoding='utf-8'))
        context_diff = json.loads((ROOT / 'tests/fixtures/current-run/context-diff.json').read_text(encoding='utf-8'))
        lifecycle_fixture = json.loads((ROOT / 'tests/fixtures/maintenance/harness-lifecycle-summary.json').read_text(encoding='utf-8'))
        rules = json.loads((ROOT / 'templates/tink/rules/index.json').read_text(encoding='utf-8'))
        verify = (ROOT / 'templates/claude/commands/tink/verify.md').read_text(encoding='utf-8')
        codex_core = (ROOT / 'templates/codex/skills/tink-core/RULES.md').read_text(encoding='utf-8')
        cast = (ROOT / 'templates/claude/commands/tink/cast.md').read_text(encoding='utf-8')
        weave = (ROOT / 'templates/claude/commands/tink/weave.md').read_text(encoding='utf-8')

        self.assertIn('task_type', schema['required'])
        self.assertIn('verification', schema['properties'])
        self.assertIn('included', context_schema['required'])
        self.assertIn('excluded', context_schema['required'])
        self.assertIn('context_entry', context_schema['$defs'])
        self.assertIn('external_context_profile', context_schema['$defs'])
        self.assertIn('external_context', context_schema['properties'])
        self.assertIn('efficiency_metrics', context_schema['properties'])
        self.assertIn('source_ref', context_schema['properties']['signals']['items']['properties'])
        self.assertIn('confidence', context_schema['properties']['signals']['items']['properties'])
        entry_props = context_schema['$defs']['context_entry']['properties']
        for field in ['role', 'cost', 'reuse_signal', 'verification_link', 'staleness', 'evidence_kind']:
            self.assertIn(field, entry_props)
        self.assertIn('verification_target', entry_props['role']['enum'])
        self.assertIn('avoid_next_time', entry_props['reuse_signal']['enum'])
        metric_props = context_schema['$defs']['efficiency_metrics']['properties']
        self.assertIn('target_threshold_percent', metric_props)
        self.assertIn('measurement_status', metric_props)
        self.assertIn('scores', metric_props)
        for field in ['run', 'evaluator', 'target_threshold_percent', 'measurement_status', 'scope', 'scores']:
            self.assertIn(field, context_metrics_schema['required'])
        context_metric_score = context_metrics_schema['$defs']['metric_score']
        for field in ['name', 'score_percent', 'formula', 'numerator', 'denominator', 'evidence_refs']:
            self.assertIn(field, context_metric_score['required'])
        for metric_name in CONTEXT_EFFICIENCY_METRICS:
            self.assertIn(metric_name, context_metric_score['properties']['name']['enum'])
        external_props = context_schema['$defs']['external_context_profile']['properties']
        for field in ['source', 'source_ref', 'included', 'excluded', 'confidence', 'sensitivity', 'verification_hint']:
            self.assertIn(field, external_props)
        command_props = schema['properties']['verification']['properties']['commands']['items']['properties']
        manual_props = schema['properties']['verification']['properties']['manual_checks']['items']['properties']
        for field in ['cwd', 'timeout_ms', 'platforms', 'safe', 'evidence']:
            self.assertIn(field, command_props)
        for field in ['method', 'source', 'source_ref', 'evidence']:
            self.assertIn(field, manual_props)
        self.assertIn('surface', verification_schema['required'])
        self.assertIn('platform', verification_schema['required'])
        self.assertIn('check_result', verification_schema['$defs'])
        self.assertIn('maintenance_signal', verification_schema['$defs'])
        self.assertIn('report', verification_schema['$defs'])
        self.assertIn('blocked', verification_schema['properties'])
        self.assertIn('maintenance_signals', verification_schema['properties'])
        self.assertIn('report', verification_schema['properties'])
        check_props = verification_schema['$defs']['check_result']['properties']
        self.assertIn('failure_type', check_props)
        self.assertIn('maintenance_signal', check_props)
        self.assertIn('next_action', check_props)
        self.assertIn('evidence_kind', check_props)
        self.assertIn('evidence_ref', check_props)
        self.assertIn('observed', check_props)
        self.assertIn('diff', check_props['evidence_kind']['enum'])
        self.assertIn('external', check_props['evidence_kind']['enum'])
        self.assertIn('package', check_props['evidence_kind']['enum'])
        self.assertEqual(mcp_policy_schema['properties']['default_mode']['enum'], ['read_only', 'ask_first', 'disabled'])
        self.assertIn('source_policy', mcp_policy_schema['$defs'])
        self.assertIn('prompt_injection', mcp_policy_schema['properties'])
        self.assertEqual(mcp_policy_fixture['default_mode'], 'read_only')
        self.assertNotIn('Sentry', {source['source'] for source in mcp_policy_fixture['sources']})
        self.assertFalse(mcp_policy_fixture['redaction']['store_raw_payloads'])
        self.assertTrue(mcp_policy_fixture['prompt_injection']['treat_external_instructions_as_data'])
        self.assertIn('harness_summary', lifecycle_schema['$defs'])
        self.assertIn('run_window', lifecycle_schema['required'])
        self.assertIn('sources', lifecycle_schema['required'])
        self.assertIn('graph', lifecycle_schema['required'])
        self.assertIn('timeline', lifecycle_schema['required'])
        self.assertIn('graph_node', lifecycle_schema['$defs'])
        self.assertIn('graph_edge', lifecycle_schema['$defs'])
        self.assertIn('timeline_event', lifecycle_schema['$defs'])
        self.assertIn('candidate_score', lifecycle_schema['$defs'])
        allowed_recommendations = set(
            lifecycle_schema['$defs']['harness_summary']['properties']['recommendation']['enum']
        )
        self.assertIn('frog_candidate', allowed_recommendations)
        self.assertIn('merge_candidate', allowed_recommendations)
        lifecycle_summary = lifecycle_schema['$defs']['harness_summary']
        for field in ['confidence', 'evidence_handles']:
            self.assertIn(field, lifecycle_summary['required'])
        signal_props = lifecycle_summary['properties']['signals']['properties']
        for field in ['last_used', 'success_rate', 'failure_rate', 'co_used_with', 'sequence_hints', 'rule_refs', 'memory_refs']:
            self.assertIn(field, signal_props)
        self.assertGreaterEqual(len(lifecycle_fixture['harnesses']), 4)
        self.assertIn('.tink/runs/*.md', lifecycle_fixture['sources'])
        self.assertGreaterEqual(lifecycle_fixture['run_window']['run_count'], 0)
        lifecycle_by_id = {item['id']: item for item in lifecycle_fixture['harnesses']}
        graph_node_ids = {item['id'] for item in lifecycle_fixture['graph']['nodes']}
        graph_edge_types = {item['type'] for item in lifecycle_fixture['graph']['edges']}
        timeline_outcomes = {item['outcome'] for item in lifecycle_fixture['timeline']}
        self.assertEqual(lifecycle_by_id['bug-fix']['recommendation'], 'observe')
        self.assertEqual(lifecycle_by_id['bug-fix']['confidence'], 'low')
        self.assertEqual(lifecycle_by_id['release-preflight']['evidence_grade'], 'weak')
        self.assertNotEqual(lifecycle_by_id['release-preflight']['recommendation'], 'frog_candidate')
        self.assertEqual(lifecycle_by_id['experimental-wide-context']['recommendation'], 'frog_candidate')
        self.assertIn('delete', lifecycle_by_id['experimental-wide-context']['approval_required_for'])
        self.assertEqual(lifecycle_by_id['docs']['recommendation'], 'merge_candidate')
        self.assertTrue(lifecycle_by_id['docs']['signals']['co_used_with'])
        self.assertTrue(lifecycle_by_id['code-change']['signals']['sequence_hints'])
        self.assertIn('harness:code-change', lifecycle_by_id['code-change']['signals']['rule_refs'])
        self.assertIn('.tink/memory/preferences.md', lifecycle_by_id['code-change']['signals']['memory_refs'])
        self.assertIn('harness:code-change', graph_node_ids)
        self.assertIn('rule:harness:code-change', graph_node_ids)
        self.assertIn('memory:.tink/memory/preferences.md', graph_node_ids)
        self.assertIn('stage:verify', graph_node_ids)
        self.assertIn('co_used', graph_edge_types)
        self.assertIn('sequence', graph_edge_types)
        self.assertIn('uses_rule', graph_edge_types)
        self.assertIn('uses_memory', graph_edge_types)
        self.assertIn('success', timeline_outcomes)
        self.assertIn('blocked', timeline_outcomes)
        self.assertGreater(lifecycle_by_id['experimental-wide-context']['candidate_score']['total'], lifecycle_by_id['docs']['candidate_score']['total'])
        self.assertEqual(lifecycle_by_id['bug-fix']['candidate_score']['factors'][0]['name'], 'recommendation')
        self.assertEqual(lifecycle_by_id['experimental-wide-context']['lifecycle_state'], 'cleanup_review')
        self.assertEqual(lifecycle_by_id['bug-fix']['lifecycle_state'], 'no_evidence')
        for item in lifecycle_fixture['harnesses']:
            self.assertIn(item['recommendation'], allowed_recommendations)
            self.assertIn(item['confidence'], ['low', 'medium', 'high'])
            self.assertIsInstance(item['evidence_handles'], list)
            self.assertIn('candidate_score', item)
            self.assertIn('lifecycle_state', item)
            self.assertIn('state_reason', item)
            self.assertIn('context_cost', item['signals'])
            self.assertGreater(len(item['reason']), 10)
        generator_script = ROOT / 'templates/tink/tools/generate-harness-lifecycle-summary.mjs'
        report_script = ROOT / 'templates/tink/tools/render-harness-health-report.mjs'
        self.assertTrue(generator_script.exists())
        self.assertTrue(report_script.exists())
        subprocess.run(['node', '--check', str(generator_script)], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8')
        subprocess.run(['node', '--check', str(report_script)], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8')
        with tempfile.TemporaryDirectory() as d:
            base = Path(d)
            (base / '.tink/harnesses').mkdir(parents=True)
            (base / '.tink/runs').mkdir(parents=True)
            (base / '.tink/maintenance').mkdir(parents=True)
            (base / '.tink/rules').mkdir(parents=True)
            (base / '.tink/memory').mkdir(parents=True)
            (base / '.tink/harnesses/index.json').write_text(json.dumps([
                {'name': 'code-change', 'context': 'medium'},
                {'name': 'wide-context', 'context': 'high'},
                {'name': 'bug-fix', 'context': 'unknown'},
                {'name': 'old-research', 'context': 'high'},
            ]), encoding='utf-8')
            (base / '.tink/rules/index.json').write_text(json.dumps({
                'nodes': [
                    {'id': 'harness:code-change'},
                    {'id': 'harness:wide-context'},
                ]
            }), encoding='utf-8')
            (base / '.tink/memory/preferences.md').write_text('# Preferences\n', encoding='utf-8')
            (base / '.tink/runs/2026-06-01-1000-code-change.md').write_text(
                '# Run\n\nStatus: completed\n\nSelected harnesses:\n- code-change\n\nLoaded rules:\n- harness:code-change\n\nMemory:\n- .tink/memory/preferences.md\n',
                encoding='utf-8',
            )
            (base / '.tink/runs/2026-04-01-1000-old-research.md').write_text(
                '# Run\n\nStatus: completed\n\nSelected harnesses:\n- old-research\n',
                encoding='utf-8',
            )
            (base / '.tink/runs/2026-06-01-1100-code-change.md').write_text(
                '# Run\n\nStatus: completed\n\nSelected harnesses:\n- code-change\n\nLoaded rules:\n- harness:code-change\n',
                encoding='utf-8',
            )
            (base / '.tink/runs/2026-06-02-1000-wide-context.md').write_text(
                '# Run\n\nStatus: blocked\n\nSelected harnesses:\n- wide-context\n\ncheck_blocked\n',
                encoding='utf-8',
            )
            (base / '.tink/maintenance/weave-queue.json').write_text(json.dumps({
                'items': [
                    {'harness': 'wide-context', 'signal': 'check_failed', 'auto': True}
                ]
            }), encoding='utf-8')
            (base / '.tink/maintenance/friction.jsonl').write_text(
                json.dumps({'harness': 'wide-context', 'type': 'blocked'}) + '\n',
                encoding='utf-8',
            )
            output = base / '.tink/maintenance/harness-lifecycle.json'
            subprocess.run(
                ['node', str(generator_script), str(base), str(output)],
                cwd=ROOT,
                check=True,
                capture_output=True,
                text=True,
                encoding='utf-8',
            )
            generated = json.loads(output.read_text(encoding='utf-8'))
            generated_by_id = {item['id']: item for item in generated['harnesses']}
            self.assertEqual(generated['run_window']['run_count'], 4)
            self.assertEqual(generated_by_id['code-change']['recommendation'], 'keep')
            self.assertEqual(generated_by_id['wide-context']['recommendation'], 'frog_candidate')
            self.assertEqual(generated_by_id['bug-fix']['recommendation'], 'observe')
            self.assertEqual(generated_by_id['old-research']['lifecycle_state'], 'dormant_candidate')
            self.assertEqual(generated_by_id['old-research']['recommendation'], 'observe')
            self.assertIn('archive', generated_by_id['old-research']['approval_required_for'])
            self.assertNotIn('delete', generated_by_id['old-research']['approval_required_for'])
            self.assertGreater(generated_by_id['wide-context']['candidate_score']['total'], generated_by_id['code-change']['candidate_score']['total'])
            self.assertEqual(generated_by_id['wide-context']['candidate_score']['factors'][-1]['name'], 'recommendation')
            self.assertEqual(generated_by_id['code-change']['signals']['sequence_hints'], [
                {'before': 'code-change', 'after': 'verify', 'count': 2}
            ])
            self.assertIn('harness:code-change', generated_by_id['code-change']['signals']['rule_refs'])
            self.assertIn('.tink/memory/preferences.md', generated_by_id['code-change']['signals']['memory_refs'])
            generated_graph_nodes = {item['id'] for item in generated['graph']['nodes']}
            generated_graph_edges = {(item['source'], item['target'], item['type']) for item in generated['graph']['edges']}
            generated_timeline = generated['timeline']
            self.assertIn('harness:code-change', generated_graph_nodes)
            self.assertIn('rule:harness:code-change', generated_graph_nodes)
            self.assertIn('memory:.tink/memory/preferences.md', generated_graph_nodes)
            self.assertIn(('harness:code-change', 'stage:verify', 'sequence'), generated_graph_edges)
            self.assertIn(('harness:code-change', 'rule:harness:code-change', 'uses_rule'), generated_graph_edges)
            self.assertIn(('harness:code-change', 'memory:.tink/memory/preferences.md', 'uses_memory'), generated_graph_edges)
            self.assertEqual(generated_timeline[0]['source'], '.tink/runs/2026-06-02-1000-wide-context.md')
            self.assertEqual(generated_timeline[0]['outcome'], 'blocked')
            self.assertEqual(generated_timeline[-1]['outcome'], 'success')
            self.assertIn('.tink/maintenance/weave-queue.json', generated_by_id['wide-context']['evidence_handles'])
        with tempfile.TemporaryDirectory() as d:
            output = Path(d) / 'harness-health-report.html'
            subprocess.run(
                [
                    'node',
                    str(report_script),
                    str(ROOT / 'tests/fixtures/maintenance/harness-lifecycle-summary.json'),
                    str(output),
                ],
                cwd=ROOT,
                check=True,
                capture_output=True,
                text=True,
                encoding='utf-8',
            )
            html = output.read_text(encoding='utf-8')
            self.assertIn('Tink 하네스 건강 요약', html)
            self.assertIn('이 보고서는 제안만 준비', html)
            self.assertIn('하네스 지도', html)
            self.assertIn('Knowledge Graph', html)
            self.assertIn('그래프 개요', html)
            self.assertIn('노드 type', html)
            self.assertIn('uses_rule', html)
            self.assertIn('최근 run 타임라인', html)
            self.assertIn('중요 하네스', html)
            self.assertIn('CAST 선택 규칙', html)
            self.assertIn('requirements-interview', html)
            self.assertIn('독립 검증', html)
            self.assertIn('후보 점수', html)
            self.assertIn('생애주기 상태', html)
            self.assertIn('data-mode="core"', html)
            self.assertIn('data-action="pause"', html)
            self.assertIn('data-select-harness="requirements-interview"', html)
            self.assertIn('data-filter-rec="keep"', html)
            self.assertIn('id="graph-tooltip"', html)
            self.assertIn('핵심 그래프만 표시 중', html)
            self.assertIn('blocked', html)
            self.assertIn('experimental-wide-context', html)
            self.assertIn('frog_candidate', html)
        self.assertIn('changes', context_diff)
        self.assertIn('public graph indexing', {item['value'] for item in context_diff['excluded']})
        self.assertIn('verification_hints.command-template-sync', context_diff['after']['signal_refs'])
        self.assertIn('metric_impacts', context_diff)
        self.assertTrue(any(item['metric'] == 'verification_omission_detection' for item in context_diff['metric_impacts']))
        report_required = verification_schema['$defs']['report']['required']
        for field in ['result_line', 'checked', 'remaining', 'next_action']:
            self.assertIn(field, report_required)
        self.assertTrue(any(node['type'] == 'guard-candidate' for node in rules['nodes']))
        self.assertIn('node_shape', rules)
        for field in ['id', 'type', 'load', 'phase', 'budget_cost', 'when', 'reason']:
            self.assertIn(field, rules['node_shape']['required'])
        self.assertIn('mandatory', rules['selection_policy']['load_order'])
        self.assertTrue(all('load' in node for node in rules['nodes']))
        self.assertTrue(all('budget_cost' in node for node in rules['nodes']))
        self.assertTrue(all('reason' in node for node in rules['nodes']))
        self.assertTrue(all('risk' in node for node in rules['nodes']))
        self.assertTrue(all('checks' in node for node in rules['nodes']))
        rule_ids = {node['id'] for node in rules['nodes']}
        for rule_id in [
            'context:readme-bilingual-sync',
            'context:version-metadata-sync',
            'context:claude-command-three-copy-sync',
            'context:installer-update-smoke',
            'context:codex-only-update-surface-cleanup',
        ]:
            self.assertIn(rule_id, rule_ids)
        nodes_by_id = {node['id']: node for node in rules['nodes']}
        self.assertIn('missing_acceptance_criteria', nodes_by_id['harness:requirements-interview']['when']['risk'])
        self.assertIn('code_change', nodes_by_id['harness:requirements-interview']['when']['task_type'])
        self.assertIn('api', nodes_by_id['harness:plan-consensus']['keywords'])
        self.assertIn('public_contract', nodes_by_id['harness:plan-consensus']['when']['risk'])
        self.assertIn('multi_step', nodes_by_id['harness:goal-checkpoint']['when']['risk'])
        self.assertIn('needs_resume', nodes_by_id['harness:goal-checkpoint']['when']['risk'])
        self.assertIn('independent_verification', nodes_by_id['harness:delegation-brief']['when']['risk'])
        self.assertIn('code_change', nodes_by_id['harness:delegation-brief']['when']['task_type'])
        self.assertIn('README.ko.md', nodes_by_id['context:readme-bilingual-sync']['include_paths'])
        self.assertIn('.claude-plugin/plugin.json', nodes_by_id['context:version-metadata-sync']['include_paths'])
        self.assertIn('templates/claude/commands/tink/*.md', nodes_by_id['context:claude-command-three-copy-sync']['include_paths'])
        self.assertIn('docs/update-verification-recipe.ko.md', nodes_by_id['context:installer-update-smoke']['include_paths'])
        self.assertIn('Source Command Tink', nodes_by_id['context:codex-only-update-surface-cleanup']['risk'])
        self.assertNotIn('tink index', json.dumps(rules))
        self.assertIn('/tink:verify', verify)
        self.assertIn('.tink/current/contract.json', verify)
        self.assertIn('.tink/current/verification.json', verify)
        self.assertIn('Verify runner contract', verify)
        self.assertIn('.tink/schemas/verification.schema.json', verify)
        self.assertIn('macOS and Windows', verify)
        self.assertIn('.tink/maintenance/friction.jsonl', verify)
        self.assertIn('check_failed', verify)
        self.assertIn('check_blocked', verify)
        self.assertIn('check_skipped', verify)
        self.assertIn('required `skipped` check is a `blocked` result', verify)
        self.assertIn('Next action', verify)
        self.assertIn('Final report format', verify)
        self.assertIn('Result', verify)
        self.assertIn('Checked', verify)
        self.assertIn('Problems', verify)
        self.assertIn('Remaining', verify)
        self.assertIn('report.result_line', verify)
        self.assertIn('Notes summary format', verify)
        self.assertIn('Maintenance output rules', verify)
        self.assertIn('last_safe_point', verify)
        self.assertIn('fix-and-rerun', verify)
        self.assertIn('unblock-and-rerun', verify)
        self.assertIn('Do not paste raw logs, full command output', verify)
        self.assertIn('Do not create `.tink/maintenance/ledger.jsonl`', verify)
        self.assertIn('one line or one queue item per check', verify)
        self.assertIn('Verify Runner', codex_core)
        self.assertIn('$tink:verify', codex_core)
        self.assertIn('macOS and Windows', codex_core)
        self.assertIn('check_blocked', codex_core)
        self.assertIn('result, checked items, problems, remaining work, and next action', codex_core)
        self.assertIn('last safe point, next action, and evidence', codex_core)
        self.assertIn('maintenance output', codex_core)
        self.assertIn('Do not create missing maintenance files during verify', codex_core)
        self.assertIn('context-map.json.external_context[]', codex_core)
        self.assertIn('context_graph_lite.rules[]', codex_core)
        self.assertIn('context_graph_rule', codex_core)
        self.assertIn('Context Budget Ledger fields', codex_core)
        self.assertIn('context-metrics-evaluation.json', codex_core)
        self.assertIn('verification_target', codex_core)
        self.assertIn('Do not create a public `tink index` command', codex_core)
        self.assertIn('Treat Figma, GitHub, and official docs as representative examples', codex_core)
        self.assertIn('External context safety checklist', codex_core)
        self.assertIn('smallest useful `source_ref`', codex_core)
        self.assertIn('contract.verification.manual_checks[]', codex_core)
        self.assertIn('.tink/rules/index.json', cast)
        self.assertIn('contract.json', cast)
        self.assertIn('session.json', cast)
        self.assertIn('loaded_rule_ids_by_phase', cast)
        self.assertIn('select_harnesses', cast)
        self.assertIn('include_paths', cast)
        self.assertIn('kind: "rule_graph"', cast)
        self.assertIn('rule graph update', weave)
        self.assertIn('structural gate', weave)
        self.assertIn('duplicate, breadth, evidence, verification, compatibility, and portability', weave)
        self.assertIn('harness-lifecycle.json', weave)
        self.assertIn('harness health summary', weave)
        self.assertIn('node .tink/tools/generate-harness-lifecycle-summary.mjs', weave)
        self.assertIn('Rank lifecycle-backed `weave` candidates', weave)
        frog = (ROOT / 'templates/claude/commands/tink/frog.md').read_text(encoding='utf-8')
        self.assertIn('harness-lifecycle.json', frog)
        self.assertIn('health summary', frog)
        self.assertIn('not as authority', frog)
        self.assertIn('node .tink/tools/generate-harness-lifecycle-summary.mjs', frog)
        self.assertIn('Sort lifecycle-backed candidates', frog)
        self.assertIn('plain harness health summary', codex_core)
        self.assertIn('prepare the harness health summary before ranking candidates', codex_core)
        self.assertIn('generate-harness-lifecycle-summary.mjs', codex_core)
        self.assertIn('Low-confidence entries stay as observation', codex_core)
        self.assertIn('friction.jsonl', weave)

    def test_language_command_naming_adr_exists(self):
        text = (ROOT / 'docs/adr/0001-language-and-command-naming-policy.md').read_text(encoding='utf-8')
        self.assertIn('cast', text)
        self.assertIn('frog', text)
        self.assertIn('weave', text)
        self.assertIn('Korean-first', text)
        self.assertIn('English parenthetical', text)

        command_text = (ROOT / 'docs/adr/0002-claude-code-command-naming.md').read_text(encoding='utf-8')
        self.assertIn('/tink:cast', command_text)
        self.assertIn('plugin-first command surface', command_text)
        self.assertIn('removes the earlier flat hyphen files', command_text)
        self.assertIn('Public docs and hook suggestions use `/tink:*`', command_text)

    def test_config_has_scope_and_language_defaults(self):
        cfg = json.loads((ROOT / 'templates/tink/config.json').read_text())
        self.assertEqual(cfg['language'], 'auto')
        self.assertEqual(cfg['context_budget'], 'soft')
        self.assertIn('default_harnesses_per_task', cfg)
        self.assertIn('harness_lines_warning', cfg)
        self.assertEqual(cfg['install_scope'], 'repo')
        self.assertEqual(cfg['hook_scope'], 'off')
        self.assertIn('rule_selection', cfg)
        self.assertEqual(cfg['rule_selection']['mode'], 'small-writ')


if __name__ == '__main__':
    unittest.main()
