#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const command = args[0] || 'install';
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const target = process.cwd();

function usage() {
  console.log(`Tink installer for Claude Code\n\nUsage:\n  npx tink-harness@latest install [--dry-run] [--force]\n\nInstalls Claude Code commands, the Tink skill, and starter harnesses into the current project.`);
}

function copyDir(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!dryRun) fs.mkdirSync(d, { recursive: true });
      copyDir(s, d);
    } else {
      if (fs.existsSync(d) && !force) {
        console.log(`skip existing ${path.relative(target, d)}`);
        continue;
      }
      console.log(`${dryRun ? 'would write' : 'write'} ${path.relative(target, d)}`);
      if (!dryRun) {
        fs.mkdirSync(path.dirname(d), { recursive: true });
        fs.copyFileSync(s, d);
      }
    }
  }
}

if (command === 'help' || args.includes('--help')) {
  usage();
  process.exit(0);
}

if (command !== 'install') {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(1);
}

const templateRoot = path.join(root, 'templates');
const mappings = [
  ['claude/commands', '.claude/commands'],
  ['claude/skills', '.claude/skills'],
  ['tiny', '.tiny']
];

console.log('Installing Tink for Claude Code');
console.log(`target ${target}`);
for (const [from, to] of mappings) {
  const src = path.join(templateRoot, from);
  const dest = path.join(target, to);
  if (!fs.existsSync(src)) continue;
  if (!dryRun) fs.mkdirSync(dest, { recursive: true });
  copyDir(src, dest);
}

const gitignorePath = path.join(target, '.gitignore');
const ignoreBlock = ['.tiny/current/', '.tiny/runs/', '.tiny/cache/'];
if (fs.existsSync(gitignorePath)) {
  const existing = fs.readFileSync(gitignorePath, 'utf8');
  const missing = ignoreBlock.filter(line => !existing.includes(line));
  if (missing.length) {
    console.log(`${dryRun ? 'would update' : 'update'} .gitignore`);
    if (!dryRun) fs.appendFileSync(gitignorePath, `\n# Tink runtime state\n${missing.join('\n')}\n`);
  }
} else {
  console.log(`${dryRun ? 'would write' : 'write'} .gitignore`);
  if (!dryRun) fs.writeFileSync(gitignorePath, `# Tink runtime state\n${ignoreBlock.join('\n')}\n`);
}

console.log('\nDone. Open Claude Code and run /tiny:setup.');
