from pathlib import Path
import json
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_README = [
    'What is Tink?',
    '30-second setup',
    'Use with Claude Code',
    'How Tink chooses harnesses',
    'Built-in harnesses',
    'What kinds of harnesses Tink can create',
    '사용 습관 기반 제안',
    'How Tink remembers without bloating context',
    'How Tink grows',
    'Language behavior',
    'Tone: calm, clear, no jokes',
    'Works with Matt Pocock skills',
    'What Tink borrows from other harness tools',
    'Not a framework',
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


class TemplateTests(unittest.TestCase):
    def test_package_bin_exists(self):
        pkg = json.loads((ROOT / 'package.json').read_text())
        self.assertIn('tink-harness', pkg['bin'])
        self.assertIn('@clack/prompts', pkg['dependencies'])
        self.assertIn('picocolors', pkg['dependencies'])
        installer = (ROOT / pkg['bin']['tink-harness']).read_text(encoding='utf-8')
        self.assertIn('TINK', installer)
        self.assertIn('deep-blue', (ROOT / 'README.md').read_text(encoding='utf-8'))
        self.assertIn('colorLine(line, color)', installer)
        self.assertIn('Language / 언어 / 语言', installer)
        self.assertIn('Installation scope', installer)
        self.assertIn('Select components to install', installer)
        self.assertIn('Hook recommendation template', installer)
        self.assertIn("'tink/harnesses'", installer)
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
        self.assertIn('AI jokes', text)
        self.assertIn('--global', text)
        self.assertIn('TINK` wizard', text)
        self.assertIn('top-level loop', text)
        self.assertIn('npx github:dotoricode/tink-harness', text)
        self.assertIn('English, 한국어, or 中文', text)
        self.assertIn('context` column', text)
        self.assertIn('selected language', text)
        self.assertIn('/grill-me', text)
        self.assertIn('selection-style prompt', text)
        self.assertIn('executes the first safe step', text)
        self.assertIn('plan.md', text)
        self.assertIn('harness-synthesis', text)
        self.assertIn('nextjs-rsc-boundary-refactor', text)
        self.assertIn('behavior-shaping rules', text)
        self.assertIn('Too many tools can make an agent worse', text)
        self.assertIn('harness-curation', text)
        self.assertIn('context-habit-calibration', text)
        self.assertIn('compact cadence', text)
        self.assertIn('context-hoarder', text)
        self.assertIn('실행 중 보정', text)
        self.assertIn('Inline Calibration', text)
        self.assertIn('자동 제안', text)
        self.assertIn('Hook Recommendation', text)
        self.assertIn('/tink:forge', text)
        self.assertIn('/tink:purge', text)
        self.assertIn('/tink:hone', text)
        self.assertIn('setup, forge, list, purge, hone', text)
        self.assertNotIn('/tink:prime', text)
        self.assertNotIn('/tiny:', text)
        self.assertNotIn('.tiny', text)
        self.assertNotIn('dry-wit', text)

    def test_setup_explains_choices_before_asking(self):
        text = (ROOT / 'templates/claude/commands/tink/setup.md').read_text(encoding='utf-8')
        self.assertIn('First question: language', text)
        self.assertIn('Before asking choices', text)
        self.assertIn('Reusable harnesses', text)
        self.assertIn('Repo scope', text)
        self.assertIn('Global scope', text)
        self.assertNotIn('둘 다', text)
        self.assertIn('Hook template', text)
        self.assertNotIn('Hook scope', text)
        self.assertIn('좋은 점', text)
        self.assertIn('다른 팀원, 다른 PC, 새 clone', text)
        self.assertIn('/tink:forge', text)
        self.assertIn('Command map after setup', text)
        self.assertIn('selected language', text)

    def test_forge_purge_hone_behavior(self):
        forge = (ROOT / 'templates/claude/commands/tink/forge.md').read_text(encoding='utf-8')
        purge = (ROOT / 'templates/claude/commands/tink/purge.md').read_text(encoding='utf-8')
        hone = (ROOT / 'templates/claude/commands/tink/hone.md').read_text(encoding='utf-8')
        self.assertIn('Meaning of `context`', forge)
        self.assertIn('Run state contract', forge)
        self.assertIn('execute the first safe step', forge)
        self.assertIn('Do not end with a harness recommendation only', forge)
        self.assertIn('steps.json', forge)
        self.assertIn('Harness synthesis contract', forge)
        self.assertIn('behavior-shaping rules', forge)
        self.assertIn('pre-pr-security-gate', forge)
        self.assertIn('harness-curation', forge)
        self.assertIn('context-habit-calibration', forge)
        self.assertIn('recurring operating habit', forge)
        self.assertIn('smallest effective set', forge)
        self.assertIn('selection-style', forge)
        self.assertIn('Enter should accept', forge)
        self.assertIn('new harness', forge)
        self.assertIn('/grill-me', forge)
        self.assertIn('Do not delete without approval', purge)
        self.assertIn('usage signals', purge)
        self.assertIn('real failures', hone)
        self.assertIn('Ask for approval before saving', hone)

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
            self.assertNotIn('secret=', text.lower())

    def test_installer_dry_run_and_install(self):
        subprocess.run(['node', 'bin/install.js', 'install', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        subprocess.run(['node', 'bin/install.js', 'install', '--global', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        bad = subprocess.run(['node', 'bin/install.js', 'install', '--scope=both', '--dry-run'], cwd=ROOT, capture_output=True, text=True)
        self.assertNotEqual(bad.returncode, 0)
        subprocess.run(['node', 'bin/install.js', 'install', '--lang=en', '--yes', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        subprocess.run(['node', 'bin/install.js', 'install', '--lang=zh', '--yes', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        with tempfile.TemporaryDirectory() as d:
            subprocess.run(['node', str(ROOT / 'bin/install.js'), 'install', '--lang=ko', '--yes'], cwd=d, check=True, capture_output=True, text=True)
            base = Path(d)
            installed_commands = {p.name for p in (base / '.claude/commands/tink').glob('*.md')}
            self.assertEqual(installed_commands, EXPECTED_COMMANDS)
            self.assertTrue((base / '.claude/skills/tink/SKILL.md').exists())
            self.assertTrue((base / '.tink/harnesses/index.json').exists())
            self.assertTrue((base / '.tink/memory/mistakes.md').exists())
            self.assertTrue((base / '.gitignore').exists())

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
            '### 하네스 (Harness)',
            '### 하네스 선택 (Harness Selection)',
            '### 하네스 만들기 (Harness Synthesis)',
            '### 하네스 정리 (Harness Curation)',
            '### 사용 습관 보정 (Habit Calibration)',
            '### 실행 중 보정 (Inline Calibration)',
            '### 자동 제안 (Hook Recommendation)',
            '### 실행 상태 (Run State)',
        ]:
            self.assertIn(term, text)
        self.assertIn('대표 명령', text)
        self.assertIn('단순한 하네스 생성 명령이 아니다', text)
        self.assertIn('기본 사용 습관 보정 방식', text)
        self.assertIn('참고용 추천', text)
        self.assertIn('behavior-shaping rules', text)
        self.assertNotIn('npm ', text)
        self.assertNotIn('TypeScript', text)

    def test_hook_recommendation_stays_advisory(self):
        docs = (ROOT / 'docs/hooks.md').read_text(encoding='utf-8')
        hook = json.loads((ROOT / 'templates/tink/hooks/user-prompt-submit.json').read_text(encoding='utf-8'))
        self.assertIn('실행 중 보정 (Inline Calibration)', docs)
        self.assertIn('자동 제안 (Hook Recommendation)', docs)
        self.assertIn('advisory-only', docs)
        self.assertIn('one line or shorter', docs)
        self.assertIn('short advisory-only automatic suggestions', hook['description'])
        self.assertIn('one line or shorter', hook['behavior'])
        self.assertIn('Never auto-apply harnesses or save memory', hook['behavior'])

    def test_config_has_scope_and_language_defaults(self):
        cfg = json.loads((ROOT / 'templates/tink/config.json').read_text())
        self.assertEqual(cfg['language'], 'auto')
        self.assertEqual(cfg['install_scope'], 'repo')
        self.assertEqual(cfg['hook_scope'], 'off')


if __name__ == '__main__':
    unittest.main()
