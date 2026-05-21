#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cancel, intro, isCancel, log, multiselect, note, outro, select, spinner } from '@clack/prompts';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const command = args[0] || 'install';
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const yes = args.includes('--yes') || args.includes('-y');
const interactive = process.stdin.isTTY && process.stdout.isTTY && !yes && !dryRun;
const source = 'https://github.com/dotoricode/tink-harness.git';

const COMPONENTS = [
  {
    value: 'commands',
    label: 'Claude Code commands',
    hint: '/tiny:setup, /tiny:use, /tiny:list, /tiny:save, /tiny:remember, /tiny:fix'
  },
  {
    value: 'skill',
    label: 'Tink skill',
    hint: 'Claude Code가 Tink 원칙을 읽는 SKILL.md'
  },
  {
    value: 'harnesses',
    label: 'Built-in harnesses',
    hint: 'code-change, bug-fix, research, review, docs, ship'
  },
  {
    value: 'memory',
    label: 'Memory templates',
    hint: 'mistakes, preferences, lessons. 승인 후 저장용'
  },
  {
    value: 'hook',
    label: 'Hook template',
    hint: '선택 사항. 자동 실행이 아니라 harness 추천용'
  }
];

function argValue(name) {
  const prefix = `${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

function usage() {
  console.log(`Tink installer for Claude Code\n\nUsage:\n  npx tink-harness@latest [install] [--scope=repo|global|both] [--global] [--yes] [--dry-run] [--force]\n\nDefault interactive flow:\n  1. Show TINK wizard\n  2. Select components\n  3. Select installation scope\n  4. Select git tracking policy for project state\n\nScopes:\n  repo    Install into the current project.\n  global  Install into your home Claude Code config.\n  both    Install commands/skill globally, project harnesses into the current repo.\n`);
}

function printBanner() {
  console.log(pc.cyan(`
████████╗██╗███╗   ██╗██╗  ██╗
╚══██╔══╝██║████╗  ██║██║ ██╔╝
   ██║   ██║██╔██╗ ██║█████╔╝
   ██║   ██║██║╚██╗██║██╔═██╗
   ██║   ██║██║ ╚████║██║  ██╗
   ╚═╝   ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
`));
}

function handleCancel(value) {
  if (isCancel(value)) {
    cancel('Installation cancelled');
    process.exit(0);
  }
  return value;
}

function readHarnessCount() {
  const dir = path.join(root, 'templates/tiny/harnesses');
  return fs.readdirSync(dir).filter((name) => name.endsWith('.md')).length;
}

function displayPath(base, filePath) {
  return path.relative(base, filePath) || '.';
}

function writeFileFromTemplate(src, dest, base) {
  if (fs.existsSync(dest) && !force) {
    log.message(`skip existing ${displayPath(base, dest)}`);
    return;
  }
  log.message(`${dryRun ? 'would write' : 'write'} ${displayPath(base, dest)}`);
  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function copyDir(src, dest, base) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!dryRun) fs.mkdirSync(d, { recursive: true });
      copyDir(s, d, base);
    } else {
      writeFileFromTemplate(s, d, base);
    }
  }
}

function copySelected(scope, components) {
  const repoTarget = process.cwd();
  const globalTarget = os.homedir();
  const templateRoot = path.join(root, 'templates');

  const installCommandsTo = scope === 'repo' ? repoTarget : globalTarget;
  const installProjectTo = scope === 'global' ? globalTarget : repoTarget;

  if (components.includes('commands')) {
    copyDir(path.join(templateRoot, 'claude/commands'), path.join(installCommandsTo, '.claude/commands'), installCommandsTo);
  }
  if (components.includes('skill')) {
    copyDir(path.join(templateRoot, 'claude/skills'), path.join(installCommandsTo, '.claude/skills'), installCommandsTo);
  }
  if (components.includes('harnesses')) {
    copyDir(path.join(templateRoot, 'tiny/harnesses'), path.join(installProjectTo, '.tiny/harnesses'), installProjectTo);
    writeFileFromTemplate(path.join(templateRoot, 'tiny/config.json'), path.join(installProjectTo, '.tiny/config.json'), installProjectTo);
  }
  if (components.includes('memory')) {
    copyDir(path.join(templateRoot, 'tiny/memory'), path.join(installProjectTo, '.tiny/memory'), installProjectTo);
  }
  if (components.includes('hook')) {
    copyDir(path.join(templateRoot, 'tiny/hooks'), path.join(installProjectTo, '.tiny/hooks'), installProjectTo);
  }

  return { repoTarget, globalTarget, installCommandsTo, installProjectTo };
}

function updateGitignore(target, policy) {
  if (policy === 'all') {
    log.message('skip .gitignore update: tracking all .tiny files');
    return;
  }
  const gitignorePath = path.join(target, '.gitignore');
  const ignoreBlock = policy === 'none'
    ? ['.tiny/']
    : ['.tiny/current/', '.tiny/runs/', '.tiny/cache/'];

  if (fs.existsSync(gitignorePath)) {
    const existing = fs.readFileSync(gitignorePath, 'utf8');
    const missing = ignoreBlock.filter((line) => !existing.includes(line));
    if (missing.length) {
      log.message(`${dryRun ? 'would update' : 'update'} .gitignore`);
      if (!dryRun) fs.appendFileSync(gitignorePath, `\n# Tink runtime state\n${missing.join('\n')}\n`);
    }
  } else {
    log.message(`${dryRun ? 'would write' : 'write'} .gitignore`);
    if (!dryRun) fs.writeFileSync(gitignorePath, `# Tink runtime state\n${ignoreBlock.join('\n')}\n`);
  }
}

function patchConfig(target, scope, hookScope) {
  const configPath = path.join(target, '.tiny/config.json');
  if (!fs.existsSync(configPath) || dryRun) return;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.install_scope = scope;
  config.hook_scope = hookScope;
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

async function resolveChoices() {
  let scope = args.includes('--global') ? 'global' : (argValue('--scope') || undefined);
  if (scope && !['repo', 'global', 'both'].includes(scope)) {
    console.error(`Invalid scope: ${scope}`);
    usage();
    process.exit(1);
  }

  let components = COMPONENTS.map((item) => item.value).filter((value) => value !== 'hook');
  let gitPolicy = 'harnesses';
  let hookScope = 'off';

  if (!interactive) {
    return { scope: scope || 'repo', components, gitPolicy, hookScope };
  }

  printBanner();
  intro(pc.bgCyan(pc.black(' tink ')));
  log.message(`Source: ${source}`);

  const s = spinner();
  s.start('Discovering Tink templates...');
  const harnessCount = readHarnessCount();
  s.stop(`Found ${pc.green(harnessCount)} harnesses`);

  components = handleCancel(await multiselect({
    message: 'Select components to install (space to toggle)',
    options: COMPONENTS,
    initialValues: components,
    required: true
  }));

  scope = handleCancel(await select({
    message: 'Installation scope',
    options: [
      {
        value: 'repo',
        label: 'Repo',
        hint: 'Install into current project. Recommended for project harnesses.'
      },
      {
        value: 'global',
        label: 'Global',
        hint: 'Install into home config. Available across projects.'
      },
      {
        value: 'both',
        label: 'Both',
        hint: 'Global commands/skill, repo-local harnesses.'
      }
    ],
    initialValue: scope || 'repo'
  }));

  if (scope !== 'global' && components.some((item) => ['harnesses', 'memory', 'hook'].includes(item))) {
    note('`.tiny/harnesses/` contains reusable work templates. `.tiny/current/`, `.tiny/runs/`, and `.tiny/cache/` are runtime state.', 'Git tracking');
    gitPolicy = handleCancel(await select({
      message: 'Project .tiny tracking',
      options: [
        {
          value: 'harnesses',
          label: 'Commit harnesses only',
          hint: 'Recommended. Ignore current/runs/cache.'
        },
        {
          value: 'all',
          label: 'Commit all .tiny files',
          hint: 'Usually not recommended.'
        },
        {
          value: 'none',
          label: 'Commit no .tiny files',
          hint: 'Keep Tink local to this machine.'
        }
      ],
      initialValue: 'harnesses'
    }));
  }

  if (components.includes('hook')) {
    hookScope = handleCancel(await select({
      message: 'Hook scope',
      options: [
        {
          value: 'off',
          label: 'Do not enable hooks now',
          hint: 'Recommended for v0. Use /tiny:use manually.'
        },
        {
          value: 'repo',
          label: 'Repo hook template',
          hint: 'Keep hook recommendation local to this project.'
        },
        {
          value: 'global',
          label: 'Global hook template',
          hint: 'Use carefully across projects.'
        }
      ],
      initialValue: 'off'
    }));
  }

  return { scope, components, gitPolicy, hookScope };
}

async function main() {
  if (command === 'help' || args.includes('--help')) {
    usage();
    process.exit(0);
  }

  if (command !== 'install') {
    console.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
  }

  const { scope, components, gitPolicy, hookScope } = await resolveChoices();

  if (!interactive) {
    console.log('Installing Tink for Claude Code');
    console.log(`Source: ${source}`);
    console.log(`scope ${scope}`);
    console.log(`components ${components.join(', ')}`);
  }

  const targets = copySelected(scope, components);

  if (scope !== 'global' && components.some((item) => ['harnesses', 'memory', 'hook'].includes(item))) {
    updateGitignore(targets.repoTarget, gitPolicy);
    patchConfig(targets.repoTarget, scope, hookScope);
  } else if (scope === 'global') {
    patchConfig(targets.globalTarget, scope, hookScope);
    log.message('skip .gitignore for global install');
  }

  const summary = [
    `Scope: ${scope}`,
    `Commands/skill target: ${targets.installCommandsTo}`,
    `Harness target: ${targets.installProjectTo}`,
    `Components: ${components.join(', ')}`,
    `Hook scope: ${hookScope}`,
    'Next: open Claude Code and run /tiny:setup.'
  ].join('\n');

  if (interactive) {
    note(summary, 'Installed');
    outro('Done');
  } else {
    console.log(`\n${summary}`);
    console.log('\nDone. Open Claude Code and run /tiny:setup.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
