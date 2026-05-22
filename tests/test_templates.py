from pathlib import Path
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
    'Status',
]

HARNESS_SECTIONS = [
    '## When to use',
    '## Ask first',
    '## Plan',
    '## Checks',
    '## Done means',
    '## If it fails, Tink back',
]

EXPECTED_COMMANDS = {'setup.md', 'forge.md', 'list.md', 'purge.md', 'hone.md'}
EXPECTED_INSTALLED_COMMANDS = {'setup.md', 'forge.md', 'list.md', 'purge.md', 'hone.md'}


class TemplateTests(unittest.TestCase):
    def test_package_bin_exists(self):
        pkg = json.loads((ROOT / 'package.json').read_text())
        self.assertIn('tink-harness', pkg['bin'])
        self.assertIn('@clack/prompts', pkg['dependencies'])
        self.assertIn('picocolors', pkg['dependencies'])
        installer = (ROOT / pkg['bin']['tink-harness']).read_text(encoding='utf-8')
        self.assertIn('TINK', installer)
        self.assertIn('A small harness layer for Claude Code', (ROOT / 'README.md').read_text(encoding='utf-8'))
        self.assertIn('<strong>knit</strong> in reverse', (ROOT / 'README.md').read_text(encoding='utf-8'))
        self.assertIn('Tinker Bell', (ROOT / 'README.md').read_text(encoding='utf-8'))
        self.assertIn('colorLine(line, color)', installer)

        self.assertIn('Installation scope', installer)
        self.assertIn('Select components to install', installer)
        self.assertIn('Hook recommendation', installer)
        self.assertIn('UserPromptSubmit', installer)
        self.assertIn('--with-hook', installer)
        self.assertIn("'tink/harnesses'", installer)
        self.assertIn('copyTinkCommands', installer)
        self.assertTrue((ROOT / '.claude-plugin/plugin.json').exists())
        self.assertTrue((ROOT / '.claude-plugin/marketplace.json').exists())
        self.assertTrue((ROOT / 'commands/forge.md').exists())
        self.assertTrue((ROOT / 'skills/tink/SKILL.md').exists())
        self.assertIn('remove legacy', installer)
        self.assertIn('path.join(commandDest, entry.name)', installer)
        self.assertIn('/tink:forge <task> to start', installer)
        self.assertIn('legacyTinyCommands', installer)
        self.assertIn('tink/maintenance', installer)
        self.assertNotIn("value: 'both'", installer)
        self.assertNotIn("'tiny/harnesses'", installer)
        self.assertTrue((ROOT / pkg['bin']['tink-harness']).exists())

    def test_command_surface_is_focused(self):
        command_dir = ROOT / 'templates/claude/commands/tink'
        names = {p.name for p in command_dir.glob('*.md')}
        self.assertEqual(names, EXPECTED_COMMANDS)
        for forbidden in ['prime.md', 'save.md', 'remember.md', 'fix.md']:
            self.assertFalse((command_dir / forbidden).exists())
        self.assertFalse((ROOT / 'templates/claude/commands/tiny').exists())

    def test_readme_required_sections(self):
        text = (ROOT / 'README.md').read_text(encoding='utf-8')
        for section in REQUIRED_README:
            self.assertIn(section, text)
        self.assertIn('img.shields.io', text)
        self.assertIn('/plugin marketplace add dotoricode/tink-harness', text)
        self.assertIn('/plugin install tink@tink-harness', text)
        self.assertIn('/reload-plugins', text)
        self.assertIn('npx github:dotoricode/tink-harness install', text)
        self.assertNotIn('npx github:dotoricode/tink-harness install --yes', text)
        self.assertNotIn('claude --plugin-dir .', text)
        self.assertIn('Hermes Agent', text)
        self.assertIn('untying tangled workflows', text)
        self.assertIn('the small helper at your side', text)
        self.assertIn('Could Claude Code grow with me in the same way?', text)
        self.assertIn('/tink:forge', text)
        self.assertIn('/tink:purge', text)
        self.assertIn('/tink:hone', text)
        self.assertIn('plugin-first', text)
        self.assertIn('forge** means', text)
        self.assertIn('purge** means', text)
        self.assertIn('hone** means', text)
        self.assertIn('.tink/current/', text)
        self.assertIn('.tink/runs/', text)
        self.assertIn('approval', text.lower())
        self.assertIn('pre-v1', text)
        self.assertNotIn('30-second', text)
        self.assertNotIn('AI jokes', text)
        self.assertNotIn('/tink:prime', text)
        self.assertNotIn('/tiny:', text)
        self.assertNotIn('.tiny', text)
        self.assertNotIn('dry-wit', text)


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
        self.assertIn('/tink:forge', text)
        self.assertIn('Command map after setup', text)
        self.assertIn('selected language', text)
        self.assertIn('Setup review mode', text)
        self.assertIn('current-settings review', text)
        self.assertIn('톤은 선택 항목이 아니라 Tink의 고정 정책입니다', text)
        self.assertIn('Do not ask for tone selection', text)
        self.assertIn('Legacy Tiny migration', text)
        self.assertIn('/tink:forge` replaces `/tiny:use', (ROOT / 'templates/claude/commands/tink/forge.md').read_text(encoding='utf-8'))
        self.assertIn('do not claim Enter confirms a default', text)

    def test_forge_purge_hone_behavior(self):
        forge = (ROOT / 'templates/claude/commands/tink/forge.md').read_text(encoding='utf-8')
        purge = (ROOT / 'templates/claude/commands/tink/purge.md').read_text(encoding='utf-8')
        hone = (ROOT / 'templates/claude/commands/tink/hone.md').read_text(encoding='utf-8')
        self.assertIn('Meaning of `context`', forge)
        self.assertIn('Run state contract', forge)
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
        self.assertIn('behavior-shaping rules', forge)
        self.assertIn('pre-pr-security-gate', forge)
        self.assertIn('harness-curation', forge)
        self.assertIn('context-habit-calibration', forge)
        self.assertIn('recurring operating habit', forge)
        self.assertIn('smallest effective set', forge)
        self.assertIn('explicit approval', forge)
        self.assertIn('Readiness check', forge)
        self.assertIn('Tink is not fully initialized', forge)
        self.assertIn('do not say Enter approves', forge)
        self.assertIn('answers.md', forge)
        self.assertIn('`.tink/current/plan.md`, `checks.md`, `steps.json`, `notes.md`, `answers.md`', forge)
        self.assertNotIn('Enter should accept', forge)
        self.assertIn('new harness', forge)
        self.assertIn('/grill-me', forge)
        self.assertIn('Do not delete without approval', purge)
        self.assertIn('compact evidence', purge)
        self.assertIn('hone handoff packet', purge)
        self.assertIn('operation-specific approval payload', purge)
        self.assertIn('real failures', hone)
        self.assertIn('hone handoff packet', hone)
        self.assertIn('Approval payload', hone)
        self.assertIn('Ask for approval before saving', hone)
        list_cmd = (ROOT / 'templates/claude/commands/tink/list.md').read_text(encoding='utf-8')
        self.assertIn('unknown', list_cmd)
        self.assertIn('Do not infer non-use from missing evidence', list_cmd)
        self.assertIn('stale current candidate', list_cmd)
        self.assertIn('Evidence grade', purge)
        self.assertIn('Only strong evidence may recommend `delete`', purge)
        self.assertIn('.tink/maintenance/hone-queue.json', purge)
        self.assertIn('.tink/maintenance/ledger.jsonl', purge)
        self.assertIn('evidence handles', hone)
        self.assertIn('context-cost delta', hone)
        self.assertIn('.tink/maintenance/ledger.jsonl', hone)
        skill = (ROOT / 'templates/claude/skills/tink/SKILL.md').read_text(encoding='utf-8')
        self.assertIn('purge', skill)
        self.assertNotIn('prune', skill.lower())

    def test_harness_index_and_files(self):
        index = json.loads((ROOT / 'templates/tink/harnesses/index.json').read_text())
        names = {item['name'] for item in index}
        self.assertEqual(names, {'code-change', 'bug-fix', 'research', 'review', 'docs', 'ship', 'harness-synthesis', 'harness-curation', 'context-habit-calibration'})
        for name in names:
            text = (ROOT / f'templates/tink/harnesses/{name}.md').read_text(encoding='utf-8')
            for section in HARNESS_SECTIONS:
                self.assertIn(section, text)
            self.assertIn('.tink/current/answers.md', text)
            self.assertLessEqual(len(text.splitlines()), 100)

    def test_memory_templates_exist(self):
        for name in ['mistakes.md', 'preferences.md', 'lessons.md']:
            text = (ROOT / f'templates/tink/memory/{name}').read_text(encoding='utf-8')
            self.assertIn('approval', text.lower())
            self.assertIn('Entry shape', text)
            self.assertIn('source=<run-id|user>', text)
            self.assertNotIn('secret=', text.lower())

    def test_installer_dry_run_and_install(self):
        subprocess.run(['node', 'bin/install.js', 'install', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        subprocess.run(['node', 'bin/install.js', 'install', '--global', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        bad = subprocess.run(['node', 'bin/install.js', 'install', '--scope=both', '--dry-run'], cwd=ROOT, capture_output=True, text=True)
        self.assertNotEqual(bad.returncode, 0)
        subprocess.run(['node', 'bin/install.js', 'install', '--lang=en', '--yes', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        subprocess.run(['node', 'bin/install.js', 'install', '--lang=zh', '--yes', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        with tempfile.TemporaryDirectory() as d:
            legacy = Path(d) / '.claude/commands/tink-forge.md'
            legacy.parent.mkdir(parents=True)
            legacy.write_text('legacy command', encoding='utf-8')
            legacy_tiny_file = Path(d) / '.claude/commands/tiny-use.md'
            legacy_tiny_file.write_text('legacy tiny command', encoding='utf-8')
            legacy_tiny_dir = Path(d) / '.claude/commands/tiny'
            legacy_tiny_dir.mkdir(parents=True)
            (legacy_tiny_dir / 'use.md').write_text('legacy nested tiny command', encoding='utf-8')
            subprocess.run(['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes'], cwd=d, check=True, capture_output=True, text=True)
            base = Path(d)
            installed_commands = {p.name for p in (base / '.claude/commands/tink').glob('*.md')}
            self.assertEqual(installed_commands, EXPECTED_INSTALLED_COMMANDS)
            self.assertFalse((base / '.claude/commands/tink-forge.md').exists())
            self.assertFalse((base / '.claude/commands/tiny-use.md').exists())
            self.assertFalse((base / '.claude/commands/tiny').exists())
            self.assertTrue((base / '.claude/skills/tink/SKILL.md').exists())
            self.assertTrue((base / '.tink/harnesses/index.json').exists())
            self.assertTrue((base / '.tink/maintenance/ledger.jsonl').exists())
            self.assertTrue((base / '.tink/maintenance/hone-queue.json').exists())
            self.assertTrue((base / '.tink/memory/mistakes.md').exists())
            self.assertTrue((base / '.gitignore').exists())

        with tempfile.TemporaryDirectory() as d:
            subprocess.run(['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes', '--with-hook'], cwd=d, check=True, capture_output=True, text=True)
            base = Path(d)
            settings = json.loads((base / '.claude/settings.json').read_text(encoding='utf-8'))
            hooks = settings['hooks']['UserPromptSubmit']
            self.assertEqual(len(hooks), 1)
            self.assertIn('user-prompt-submit.mjs', hooks[0]['hooks'][0]['command'])
            cfg = json.loads((base / '.tink/config.json').read_text(encoding='utf-8'))
            self.assertEqual(cfg['hook_scope'], 'repo')
            self.assertTrue((base / '.tink/hooks/user-prompt-submit.mjs').exists())

    def test_package_contents_are_release_ready(self):
        result = subprocess.run([NPM, 'pack', '--dry-run', '--json'], cwd=ROOT, check=True, capture_output=True, text=True)
        pack = json.loads(result.stdout)[0]
        paths = {item['path'] for item in pack['files']}

        for required in [
            'bin/install.js',
            '.claude-plugin/plugin.json',
            '.claude-plugin/marketplace.json',
            'commands/setup.md',
            'commands/forge.md',
            'commands/list.md',
            'commands/purge.md',
            'commands/hone.md',
            'skills/tink/SKILL.md',
            'templates/claude/commands/tink/setup.md',
            'templates/claude/commands/tink/forge.md',
            'templates/claude/commands/tink/list.md',
            'templates/claude/commands/tink/purge.md',
            'templates/claude/commands/tink/hone.md',
            'templates/claude/skills/tink/SKILL.md',
            'templates/tink/config.json',
            'templates/tink/harnesses/index.json',
            'templates/tink/maintenance/ledger.jsonl',
            'templates/tink/maintenance/hone-queue.json',
            'templates/tink/hooks/user-prompt-submit.mjs',
            'templates/tink/memory/mistakes.md',
            'README.md',
            'LICENSE',
        ]:
            self.assertIn(required, paths)

        for forbidden_prefix in ['tests/', 'docs/plans/', '.tink/', '.claude/', '.serena/']:
            self.assertFalse(any(path.startswith(forbidden_prefix) for path in paths), forbidden_prefix)

    def test_packaged_tarball_installs_in_clean_repo(self):
        result = subprocess.run([NPM, 'pack', '--json'], cwd=ROOT, check=True, capture_output=True, text=True)
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
                )
                installed_commands = {p.name for p in (base / '.claude/commands/tink').glob('*.md')}
                self.assertEqual(installed_commands, EXPECTED_INSTALLED_COMMANDS)
                self.assertFalse((base / '.claude/commands/tink-forge.md').exists())
                self.assertTrue((base / '.claude/skills/tink/SKILL.md').exists())
                self.assertTrue((base / '.tink/harnesses/index.json').exists())
                self.assertTrue((base / '.tink/maintenance/ledger.jsonl').exists())
                self.assertTrue((base / '.tink/maintenance/hone-queue.json').exists())
                self.assertTrue((base / '.tink/memory/mistakes.md').exists())
                self.assertTrue((base / '.tink/config.json').exists())
        finally:
            tarball.unlink(missing_ok=True)

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

    def test_context_glossary_exists(self):
        text = (ROOT / 'CONTEXT.md').read_text(encoding='utf-8')
        for term in [
            '### Tink',
            '### Forge',
            '### Forge',
            '### Purge',
            '### Hone',
            '### 하네스 (Harness)',
            '### 하네스 선택 (Harness Selection)',
            '### 하네스 만들기 (Harness Synthesis)',
            '### 하네스 정리 (Harness Curation)',
            '### 사용 습관 보정 (Habit Calibration)',
            '### 실행 중 보정 (Inline Calibration)',
            '### 자동 제안 (Hook Recommendation)',
            '### 실행 상태 (Run State)',
            '### 컨텍스트 사용량 (Context Footprint)',
            '### 작업 맥락 (Work Context)',
            '### 실행 상태 복구 (Run State Recovery)',
            '### 설정 리뷰 (Setup Review)',
            '### 명령 이름 정책 (Command Naming Policy)',
            '### 톤 정책 (Tone Policy)',
            '### 하네스 크기 (Harness Size)',
            '### 메타 하네스 (Meta Harness)',
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
        self.assertIn('/tink:forge', script)
        self.assertIn('console.log', script)

    def test_language_command_naming_adr_exists(self):
        text = (ROOT / 'docs/adr/0001-language-and-command-naming-policy.md').read_text(encoding='utf-8')
        self.assertIn('forge', text)
        self.assertIn('purge', text)
        self.assertIn('hone', text)
        self.assertIn('Korean-first', text)
        self.assertIn('English parenthetical', text)

        command_text = (ROOT / 'docs/adr/0002-claude-code-command-naming.md').read_text(encoding='utf-8')
        self.assertIn('/tink:forge', command_text)
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


if __name__ == '__main__':
    unittest.main()
