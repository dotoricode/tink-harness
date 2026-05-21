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


class TemplateTests(unittest.TestCase):
    def test_package_bin_exists(self):
        pkg = json.loads((ROOT / 'package.json').read_text())
        self.assertIn('tink-harness', pkg['bin'])
        self.assertIn('@clack/prompts', pkg['dependencies'])
        self.assertIn('picocolors', pkg['dependencies'])
        installer = (ROOT / pkg['bin']['tink-harness']).read_text(encoding='utf-8')
        self.assertIn('TINK', installer)
        self.assertIn('Installation scope', installer)
        self.assertIn('Select components to install', installer)
        self.assertTrue((ROOT / pkg['bin']['tink-harness']).exists())

    def test_readme_required_sections(self):
        text = (ROOT / 'README.md').read_text(encoding='utf-8')
        for section in REQUIRED_README:
            self.assertIn(section, text)
        self.assertIn('AI jokes', text)
        self.assertIn('--global', text)
        self.assertIn('TINK` wizard', text)
        self.assertIn('npx github:dotoricode/tink-harness', text)
        self.assertIn('context` column', text)
        self.assertIn('user\'s language', text)
        self.assertNotIn('dry-wit', text)

    def test_setup_explains_choices_before_asking(self):
        text = (ROOT / 'templates/claude/commands/tiny/setup.md').read_text(encoding='utf-8')
        self.assertIn('Before asking choices', text)
        self.assertIn('Reusable harnesses', text)
        self.assertIn('Repo scope', text)
        self.assertIn('Global scope', text)
        self.assertIn('Hook scope', text)
        self.assertIn('Command map after setup', text)
        self.assertIn('Language', text)

    def test_use_explains_context_and_freeform_edits(self):
        text = (ROOT / 'templates/claude/commands/tiny/use.md').read_text(encoding='utf-8')
        self.assertIn('Meaning of `context`', text)
        self.assertIn('prompt/context footprint', text)
        self.assertIn('free-form edits', text)
        self.assertIn('직접 입력', text)

    def test_harness_index_and_files(self):
        index = json.loads((ROOT / 'templates/tiny/harnesses/index.json').read_text())
        names = {item['name'] for item in index}
        self.assertEqual(names, {'code-change', 'bug-fix', 'research', 'review', 'docs', 'ship'})
        for name in names:
            text = (ROOT / f'templates/tiny/harnesses/{name}.md').read_text(encoding='utf-8')
            for section in HARNESS_SECTIONS:
                self.assertIn(section, text)
            self.assertLessEqual(len(text.splitlines()), 100)

    def test_memory_templates_exist(self):
        for name in ['mistakes.md', 'preferences.md', 'lessons.md']:
            text = (ROOT / f'templates/tiny/memory/{name}').read_text(encoding='utf-8')
            self.assertIn('approval', text.lower())
            self.assertNotIn('secret=', text.lower())

    def test_installer_dry_run_and_install(self):
        subprocess.run(['node', 'bin/install.js', 'install', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        subprocess.run(['node', 'bin/install.js', 'install', '--global', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        subprocess.run(['node', 'bin/install.js', 'install', '--scope=both', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        subprocess.run(['node', 'bin/install.js', 'install', '--yes', '--dry-run'], cwd=ROOT, check=True, capture_output=True, text=True)
        with tempfile.TemporaryDirectory() as d:
            subprocess.run(['node', str(ROOT / 'bin/install.js'), 'install', '--yes'], cwd=d, check=True, capture_output=True, text=True)
            base = Path(d)
            self.assertTrue((base / '.claude/commands/tiny/setup.md').exists())
            self.assertTrue((base / '.claude/skills/tink/SKILL.md').exists())
            self.assertTrue((base / '.tiny/harnesses/index.json').exists())
            self.assertTrue((base / '.tiny/memory/mistakes.md').exists())
            self.assertTrue((base / '.gitignore').exists())

    def test_config_has_scope_and_language_defaults(self):
        cfg = json.loads((ROOT / 'templates/tiny/config.json').read_text())
        self.assertEqual(cfg['language'], 'auto')
        self.assertEqual(cfg['install_scope'], 'repo')
        self.assertEqual(cfg['hook_scope'], 'off')


if __name__ == '__main__':
    unittest.main()
