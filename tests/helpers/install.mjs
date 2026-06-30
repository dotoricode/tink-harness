import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

export function mktmp(prefix = 'tink-smoke-') {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function cleanup(dir) {
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
}

export function cleanEnv(overrides = {}) {
  const env = { ...process.env };
  delete env.CODEX_HOME;
  delete env.CLAUDE_CONFIG_DIR;
  delete env.TINK_INSTALL_SURFACES;
  return { ...env, ...overrides };
}

export function runInstaller(cwd, args, env = cleanEnv()) {
  execFileSync('node', [join(ROOT, 'bin/install.js'), ...args], {
    cwd,
    env,
    stdio: 'pipe',
    encoding: 'utf8',
  });
}
