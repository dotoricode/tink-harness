import { execFileSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
let failed = 0;

function check(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); failed++; }
}

const raw = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: ROOT, encoding: 'utf8' });
const files = JSON.parse(raw)[0].files.map(f => f.path);

const required = ['bin/install.js', 'README.md', 'CHANGELOG.md', 'VERSIONING.md', 'LICENSE'];
for (const f of required) {
  check(files.includes(f), `Missing from pack: ${f}`);
}

check(files.some(f => f.startsWith('templates/')), 'No templates/ in pack');
check(files.some(f => f.startsWith('commands/')), 'No commands/ in pack');
check(files.some(f => f.startsWith('skills/')), 'No skills/ in pack');
check(files.some(f => f.startsWith('hooks/')), 'No hooks/ in pack');
check(files.some(f => f.startsWith('.claude-plugin/')), 'No .claude-plugin/ in pack');

const forbidden = ['.tink/', '.git/', 'node_modules/', 'tests/', '.env', '.DS_Store'];
for (const bad of forbidden) {
  const found = files.filter(f => f === bad || f.startsWith(bad));
  check(found.length === 0, `Leaked into pack: ${found.join(', ')}`);
}

const secrets = files.filter(f => /\b(secret|\.key|credential)\b/i.test(f));
check(secrets.length === 0, `Potential secret files in pack: ${secrets.join(', ')}`);

if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log(`pack: all checks passed (${files.length} files)`);
