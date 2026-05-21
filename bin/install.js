#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const command = args[0] || 'install';
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');

function argValue(name) {
  const prefix = `${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

const explicitScope = argValue('--scope');
const scope = args.includes('--global') ? 'global' : (explicitScope || 'repo');
const target = scope === 'global' ? os.homedir() : process.cwd();

function usage() {
  console.log(`Tink installer for Claude Code\n\nUsage:\n  npx tink-harness@latest install [--scope=repo|global] [--global] [--dry-run] [--force]\n\nScopes:\n  repo    Install into the current project. This is the default.\n  global  Install into your home Claude Code config. Project harnesses can still live per repo.\n\nInstalls Claude Code commands, the Tink skill, and starter harnesses.`);
}

function displayPath(filePath) {
  return path.relative(target, filePath) || '.';
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
        console.log(`skip existing ${displayPath(d)}`);
        continue;
      }
      console.log(`${dryRun ? 'would write' : 'write'} ${displayPath(d)}`);
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

if (!['repo', 'global'].includes(scope)) {
  console.error(`Invalid scope: ${scope}`);
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
console.log(`scope ${scope}`);
console.log(`target ${target}`);
for (const [from, to] of mappings) {
  const src = path.join(templateRoot, from);
  const dest = path.join(target, to);
  if (!fs.existsSync(src)) continue;
  if (!dryRun) fs.mkdirSync(dest, { recursive: true });
  copyDir(src, dest);
}

if (scope === 'repo') {
  const gitignorePath = path.join(target, '.gitignore');
  const ignoreBlock = ['.tiny/current/', '.tiny/runs/', '.tiny/cache/'];
  if (fs.existsSync(gitignorePath)) {
    const existing = fs.readFileSync(gitignorePath, 'utf8');
    const missing = ignoreBlock.filter((line) => !existing.includes(line));
    if (missing.length) {
      console.log(`${dryRun ? 'would update' : 'update'} .gitignore`);
      if (!dryRun) fs.appendFileSync(gitignorePath, `\n# Tink runtime state\n${missing.join('\n')}\n`);
    }
  } else {
    console.log(`${dryRun ? 'would write' : 'write'} .gitignore`);
    if (!dryRun) fs.writeFileSync(gitignorePath, `# Tink runtime state\n${ignoreBlock.join('\n')}\n`);
  }
} else {
  console.log('skip .gitignore for global install');
}

console.log('\nDone. Open Claude Code and run /tiny:setup.');
