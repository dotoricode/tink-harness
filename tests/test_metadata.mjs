import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
let failed = 0;

function check(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); failed++; }
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const plugin = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/plugin.json'), 'utf8'));

check(
  pkg.version === plugin.version,
  `Version mismatch: package.json is ${pkg.version} but .claude-plugin/plugin.json is ${plugin.version}`
);

const requiredInFiles = ['bin/', 'templates/', 'commands/', 'skills/', 'hooks/', 'README.md', 'CHANGELOG.md', 'VERSIONING.md', 'LICENSE'];
for (const entry of requiredInFiles) {
  const present = (pkg.files || []).some(f =>
    f === entry || f === entry.replace(/\/$/, '') ||
    f.startsWith(entry.replace(/\/$/, '')) ||
    entry.startsWith(f.replace(/\/$/, ''))
  );
  check(present, `package.json "files" missing entry covering: ${entry}`);
}

const requiredPaths = ['bin/install.js', 'commands', 'skills', 'hooks', 'templates', 'README.md', 'CHANGELOG.md', 'VERSIONING.md', 'LICENSE'];
for (const p of requiredPaths) {
  check(existsSync(join(ROOT, p)), `Required path missing on disk: ${p}`);
}

check(typeof plugin.name === 'string' && plugin.name.length > 0, 'plugin.json missing or empty "name"');
check(typeof plugin.version === 'string', 'plugin.json missing "version"');

const marketplacePath = join(ROOT, '.claude-plugin/marketplace.json');
if (existsSync(marketplacePath)) {
  const marketplace = JSON.parse(readFileSync(marketplacePath, 'utf8'));
  check(typeof marketplace.name === 'string', 'marketplace.json missing "name"');
}

if (failed) { console.error(`\n${failed} check(s) failed`); process.exit(1); }
console.log('metadata: all checks passed');
