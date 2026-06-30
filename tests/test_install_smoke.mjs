import { existsSync } from 'fs';
import { join } from 'path';
import { mktmp, cleanup, cleanEnv, runInstaller } from './helpers/install.mjs';

let failed = 0;
const tmp = mktmp();

try {
  runInstaller(tmp, ['install', '--lang=en', '--yes']);

  const expected = [
    '.tink/config.json',
    '.tink/harnesses/index.json',
    '.tink/rules/index.json',
    '.tink/schemas/contract.schema.json',
    '.tink/memory/mistakes.md',
    '.claude/commands/tink',
  ];
  for (const f of expected) {
    if (!existsSync(join(tmp, f))) {
      console.error(`FAIL: missing after install: ${f}`);
      failed++;
    }
  }
} catch (err) {
  console.error('FAIL: installer exited non-zero:', err.stderr || err.message);
  failed++;
} finally {
  cleanup(tmp);
}

if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log('install smoke: all checks passed');
