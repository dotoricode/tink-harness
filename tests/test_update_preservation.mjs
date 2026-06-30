import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { mktmp, cleanup, runInstaller } from './helpers/install.mjs';

let failed = 0;
const tmp = mktmp();

try {
  runInstaller(tmp, ['install', '--lang=en', '--yes']);

  writeFileSync(join(tmp, '.tink/harnesses/custom.md'), '# Custom harness\n', 'utf8');
  writeFileSync(join(tmp, '.tink/maintenance/ledger.jsonl'), '{"op":"test"}\n', 'utf8');

  runInstaller(tmp, ['update', '--lang=en', '--yes']);

  if (!existsSync(join(tmp, '.tink/harnesses/custom.md'))) {
    console.error('FAIL: .tink/harnesses/custom.md was deleted by update');
    failed++;
  }
  if (!existsSync(join(tmp, '.tink/maintenance/ledger.jsonl'))) {
    console.error('FAIL: .tink/maintenance/ledger.jsonl was deleted by update');
    failed++;
  }
  // Tink-owned files should still exist after update
  if (!existsSync(join(tmp, '.tink/harnesses/index.json'))) {
    console.error('FAIL: .tink/harnesses/index.json missing after update');
    failed++;
  }
} catch (err) {
  console.error('FAIL:', err.stderr || err.message);
  failed++;
} finally {
  cleanup(tmp);
}

if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log('update preservation: all checks passed');
