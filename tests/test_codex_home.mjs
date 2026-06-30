import { existsSync } from 'fs';
import { join } from 'path';
import { mktmp, cleanup, cleanEnv, runInstaller } from './helpers/install.mjs';

let failed = 0;
const tmp = mktmp();
const codexHome = join(tmp, '.codex');

try {
  runInstaller(tmp, ['install', '--lang=en', '--yes'], cleanEnv({
    CODEX_HOME: codexHome,
    TINK_INSTALL_SURFACES: 'codex',
  }));

  if (!existsSync(join(codexHome, 'skills/tink-cast/SKILL.md'))) {
    console.error(`FAIL: CODEX_HOME skills not installed — expected ${join(codexHome, 'skills/tink-cast/SKILL.md')}`);
    failed++;
  }
  if (!existsSync(join(tmp, '.tink/harnesses/index.json'))) {
    console.error('FAIL: .tink/harnesses/index.json missing after codex install');
    failed++;
  }
  // Claude surfaces must NOT appear when surface=codex
  if (existsSync(join(tmp, '.claude/commands/tink'))) {
    console.error('FAIL: .claude/commands/tink created unexpectedly for codex-only install');
    failed++;
  }
} catch (err) {
  console.error('FAIL:', err.stderr || err.message);
  failed++;
} finally {
  cleanup(tmp);
}

if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log('codex home: all checks passed');
