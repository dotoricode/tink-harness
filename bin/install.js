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
const isUpdate = command === 'update';
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const yes = args.includes('--yes') || args.includes('-y');
const interactive = process.stdin.isTTY && process.stdout.isTTY && !yes && !dryRun;
const source = 'https://github.com/dotoricode/tink-harness.git';
const validSurfaces = new Set(['claude', 'codex']);
const operationLog = {
  written: [],
  updated: [],
  preserved: [],
  removedLegacy: [],
  keptUnknown: []
};

const COPY = {
  en: {
    intro: ' tink ',
    source: 'Source',
    discovering: 'Discovering Tink templates...',
    found: 'harnesses',
    language: 'Language / 언어 / 语言',
    components: 'Select components to install (space to toggle)',
    scope: 'Installation scope',
    gitNoteTitle: 'Git tracking',
    gitNote: '`.tink/harnesses/` contains reusable work templates. `.tink/current/`, `.tink/runs/`, and `.tink/cache/` are runtime state.',
    gitPolicy: 'Project .tink tracking',
    hookScope: 'Hook scope',
    installed: 'Installed',
    done: 'Done'
  },
  ko: {
    intro: ' tink ',
    source: 'Source',
    discovering: 'Tink 템플릿 확인 중...',
    found: '개 harness 발견',
    language: 'Language / 언어 / 语言',
    components: '설치할 항목을 선택하세요 (space로 토글)',
    scope: '설치 범위',
    gitNoteTitle: 'Git 추적 정책',
    gitNote: '`.tink/harnesses/`는 재사용 작업 템플릿입니다. `.tink/current/`, `.tink/runs/`, `.tink/cache/`는 실행 중 임시 상태입니다.',
    gitPolicy: '프로젝트 .tink 추적 방식',
    hookScope: 'Hook 범위',
    installed: '설치 완료',
    done: '완료'
  },
  zh: {
    intro: ' tink ',
    source: 'Source',
    discovering: '正在检查 Tink 模板...',
    found: '个 harness',
    language: 'Language / 언어 / 语言',
    components: '选择要安装的项目（空格切换）',
    scope: '安装范围',
    gitNoteTitle: 'Git 跟踪策略',
    gitNote: '`.tink/harnesses/` 是可复用工作模板。`.tink/current/`, `.tink/runs/`, `.tink/cache/` 是运行时临时状态。',
    gitPolicy: '项目 .tink 跟踪方式',
    hookScope: 'Hook 范围',
    installed: '安装完成',
    done: '完成'
  }
};

const COMPONENTS = {
  en: [
    { value: 'commands', label: 'Claude Code commands', hint: '/tink:setup, /tink:cast, /tink:verify, /tink:list, /tink:frog, /tink:weave, /tink:update' },
    { value: 'skill', label: 'Tink skill', hint: 'Tink operating rules for Claude Code' },
    { value: 'harnesses', label: 'Built-in harnesses', hint: 'Reusable task templates' },
    { value: 'memory', label: 'Memory templates', hint: 'Approved mistakes/preferences/lessons files' },
    { value: 'hook', label: 'Hook recommendation (optional)', hint: 'Registers a safe UserPromptSubmit hook when selected. Off by default.' }
  ],
  ko: [
    { value: 'commands', label: 'Claude Code 명령', hint: '/tink:setup, /tink:cast, /tink:verify, /tink:list, /tink:frog, /tink:weave, /tink:update' },
    { value: 'skill', label: 'Tink skill', hint: 'Claude Code가 읽는 Tink 작업 원칙' },
    { value: 'harnesses', label: '기본 harness', hint: '재사용 작업 템플릿' },
    { value: 'memory', label: 'Memory 템플릿', hint: '승인된 실수/선호/교훈 파일' },
    { value: 'hook', label: 'Hook 추천 (선택)', hint: '선택하면 안전한 UserPromptSubmit hook으로 등록합니다. 기본 off.' }
  ],
  zh: [
    { value: 'commands', label: 'Claude Code 命令', hint: '/tink:setup, /tink:cast, /tink:verify, /tink:list, /tink:frog, /tink:weave, /tink:update' },
    { value: 'skill', label: 'Tink skill', hint: 'Claude Code 读取的 Tink 工作规则' },
    { value: 'harnesses', label: '内置 harness', hint: '可复用任务模板' },
    { value: 'memory', label: 'Memory 模板', hint: '经批准的错误/偏好/经验文件' },
    { value: 'hook', label: 'Hook 推荐（可选）', hint: '选择后注册安全的 UserPromptSubmit hook。默认关闭。' }
  ]
};

const SURFACE_OPTIONS = {
  en: [
    { value: 'claude', label: 'Claude Code', hint: 'Install /tink:* commands, Claude skill, and optional hook support' },
    { value: 'codex', label: 'Codex', hint: 'Install $tink:* skills into CODEX_HOME or ~/.codex' }
  ],
  ko: [
    { value: 'claude', label: 'Claude Code', hint: '/tink:* 명령, Claude skill, 선택 hook 지원 설치' },
    { value: 'codex', label: 'Codex', hint: '$tink:* skills를 CODEX_HOME 또는 ~/.codex에 설치' }
  ],
  zh: [
    { value: 'claude', label: 'Claude Code', hint: 'Install /tink:* commands, Claude skill, and optional hook support' },
    { value: 'codex', label: 'Codex', hint: 'Install $tink:* skills into CODEX_HOME or ~/.codex' }
  ]
};

function argValue(name) {
  const prefix = `${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

function usage() {
  console.log(`Tink installer for Claude Code and Codex\n\nUsage:\n  npx tink-harness@latest [install] [--scope=repo|global] [--global] [--lang=en|ko|zh] [--yes] [--with-hook] [--dry-run] [--force]\n  npx tink-harness@latest update [--scope=repo|global] [--global] [--lang=en|ko|zh] [--yes] [--dry-run] [--force]\n\nCommands:\n  install  Install Tink.\n  update   Update Tink to the latest templates. Keeps user-modified files.\n\nDefault interactive flow:\n  1. Select language\n  2. Show TINK wizard\n  3. Select Claude Code, Codex, or both\n  4. Select components\n  5. Select repo/global installation scope\n  6. Select git tracking policy for project state\n\nScopes:\n  repo    Install shared .tink files into the current project.\n  global  Install shared .tink files into your home directory.\n`);
}

function normalizeSurfaces(surfaces) {
  const values = [...new Set(surfaces)];
  if (values.some((value) => !validSurfaces.has(value))) {
    console.error(`Invalid install surface: ${values.find((value) => !validSurfaces.has(value))}`);
    usage();
    process.exit(1);
  }
  if (values.includes('claude') && values.includes('codex')) return 'all';
  return values[0] || 'claude';
}

function resolveDefaultSurfaces() {
  if (argValue('--agent')) {
    console.error('--agent is no longer supported. Run the interactive installer and select Claude Code, Codex, or both during setup.');
    usage();
    process.exit(1);
  }

  const envValue = process.env.TINK_INSTALL_SURFACES;
  if (!envValue) return 'claude';
  if (envValue.trim().toLowerCase() === 'all') return 'all';
  return normalizeSurfaces(envValue.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean));
}

function includesClaude(agent) {
  return agent === 'claude' || agent === 'all';
}

function includesCodex(agent) {
  return agent === 'codex' || agent === 'all';
}

function codexHome() {
  return process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
}

function componentOptionsFor(agent, language) {
  const options = COMPONENTS[language].filter((item) => {
    if (item.value === 'commands') return includesClaude(agent);
    if (item.value === 'hook') return includesClaude(agent);
    return true;
  });
  return options.map((item) => {
    if (item.value !== 'skill') return item;
    if (agent === 'codex') {
      return {
        value: 'skill',
        label: language === 'ko' ? 'Codex Tink skills' : language === 'zh' ? 'Codex Tink skills' : 'Codex Tink skills',
        hint: language === 'ko'
          ? 'Codex가 $tink로 읽는 Tink 작업 원칙'
          : language === 'zh'
            ? 'Codex 通过 $tink 读取的 Tink 工作规则'
            : 'Tink operating rules for Codex through $tink:*'
      };
    }
    if (agent === 'all') {
      return {
        value: 'skill',
        label: language === 'ko' ? 'Tink skills' : language === 'zh' ? 'Tink skills' : 'Tink skills',
        hint: language === 'ko'
          ? 'Claude Code와 Codex가 읽는 Tink 작업 원칙'
          : language === 'zh'
            ? 'Claude Code 和 Codex 读取的 Tink 工作规则'
            : 'Tink operating rules for Claude Code and Codex'
      };
    }
    return item;
  });
}

function colorLine(line, color) {
  if (!process.stdout.isTTY && !interactive) return line;
  const [r, g, b] = color;
  return `\x1b[38;2;${r};${g};${b}m${line}\x1b[0m`;
}

function printBanner() {
  const lines = [
    '████████╗██╗███╗   ██╗██╗  ██╗',
    '╚══██╔══╝██║████╗  ██║██║ ██╔╝',
    '   ██║   ██║██╔██╗ ██║█████╔╝',
    '   ██║   ██║██║╚██╗██║██╔═██╗',
    '   ██║   ██║██║ ╚████║██║  ██╗',
    '   ╚═╝   ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝'
  ];
  // Keep the banner readable on dark terminal themes. The previous deep navy
  // top of the gradient blended into black backgrounds.
  const top = [96, 165, 250];
  const bottom = [34, 211, 238];
  console.log('');
  lines.forEach((line, i) => {
    const t = i / Math.max(lines.length - 1, 1);
    const color = [
      Math.round(top[0] + (bottom[0] - top[0]) * t),
      Math.round(top[1] + (bottom[1] - top[1]) * t),
      Math.round(top[2] + (bottom[2] - top[2]) * t)
    ];
    console.log(colorLine(line, color));
  });
  console.log('');
}

function handleCancel(value) {
  if (isCancel(value)) {
    cancel('Installation cancelled');
    process.exit(0);
  }
  return value;
}

function readHarnessCount() {
  const dir = path.join(root, 'templates/tink/harnesses');
  return fs.readdirSync(dir).filter((name) => name.endsWith('.md')).length;
}

function displayPath(base, filePath) {
  return path.relative(base, filePath) || '.';
}

function recordOperation(kind, base, filePath) {
  operationLog[kind].push(displayPath(base, filePath).replace(/\\/g, '/'));
}

function shortList(items, emptyText = '- none') {
  if (!items.length) return emptyText;
  const shown = items.slice(0, 8).map((item) => `- ${item}`);
  if (items.length > shown.length) shown.push(`- ...and ${items.length - shown.length} more`);
  return shown.join('\n');
}

function isAlwaysUpdatePath(src) {
  const rel = path.relative(root, src).replace(/\\/g, '/');
  return rel.startsWith('templates/claude/commands/') ||
    rel.startsWith('templates/claude/skills/') ||
    rel.startsWith('templates/codex/skills/') ||
    rel.startsWith('templates/tink/maintenance/');
}

function writeFileFromTemplate(src, dest, base) {
  const exists = fs.existsSync(dest);
  if (exists && !force) {
    if (isUpdate) {
      const srcContent = fs.readFileSync(src);
      const destContent = fs.readFileSync(dest);
      if (Buffer.compare(srcContent, destContent) === 0) {
        return;
      }
      if (!isAlwaysUpdatePath(src)) {
        log.message(`keep user-modified ${displayPath(base, dest)}`);
        recordOperation('preserved', base, dest);
        return;
      }
      // commands/skills/maintenance: always update to new version
    } else {
      log.message(`skip existing ${displayPath(base, dest)}`);
      return;
    }
  }
  log.message(`${dryRun ? 'would write' : (exists ? 'update' : 'write')} ${displayPath(base, dest)}`);
  recordOperation(exists ? 'updated' : 'written', base, dest);
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

function copyTinkCommands(templateRoot, target) {
  const commandSrc = path.join(templateRoot, 'claude/commands/tink');
  const commandDest = path.join(target, '.claude/commands/tink');
  const flatCommandDest = path.join(target, '.claude/commands');
  const legacyFlatCommands = ['tink-setup.md', 'tink-forge.md', 'tink-list.md', 'tink-purge.md', 'tink-hone.md'];
  const legacyNamespaceCommands = ['forge.md', 'purge.md', 'hone.md'];
  const legacyTinyCommands = ['tiny-setup.md', 'tiny-use.md', 'tiny-list.md', 'tiny-save.md'];
  const legacyDirs = [path.join(flatCommandDest, 'tiny'), path.join(target, '.claude/skills/tiny')];
  for (const name of legacyFlatCommands) {
    const legacy = path.join(flatCommandDest, name);
    if (fs.existsSync(legacy)) {
      log.message(`${dryRun ? 'would remove legacy' : 'remove legacy'} ${displayPath(target, legacy)}`);
      recordOperation('removedLegacy', target, legacy);
      if (!dryRun) fs.rmSync(legacy, { force: true });
    }
  }
  for (const name of legacyNamespaceCommands) {
    const legacy = path.join(commandDest, name);
    if (fs.existsSync(legacy)) {
      log.message(`${dryRun ? 'would remove legacy' : 'remove legacy'} ${displayPath(target, legacy)}`);
      recordOperation('removedLegacy', target, legacy);
      if (!dryRun) fs.rmSync(legacy, { force: true });
    }
  }
  for (const name of legacyTinyCommands) {
    const legacy = path.join(flatCommandDest, name);
    if (fs.existsSync(legacy)) {
      log.message(`${dryRun ? 'would remove legacy Tiny' : 'remove legacy Tiny'} ${displayPath(target, legacy)}`);
      recordOperation('removedLegacy', target, legacy);
      if (!dryRun) fs.rmSync(legacy, { force: true });
    }
  }
  for (const legacyDir of legacyDirs) {
    if (fs.existsSync(legacyDir)) {
      log.message(`${dryRun ? 'would remove legacy Tiny' : 'remove legacy Tiny'} ${displayPath(target, legacyDir)}`);
      recordOperation('removedLegacy', target, legacyDir);
      if (!dryRun) fs.rmSync(legacyDir, { recursive: true, force: true });
    }
  }
  for (const entry of fs.readdirSync(commandSrc, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    writeFileFromTemplate(path.join(commandSrc, entry.name), path.join(commandDest, entry.name), target);
  }
}

function removeLegacyCodexSkill(codexTarget) {
  const legacyDir = path.join(codexTarget, 'skills/tink');
  const legacySkill = path.join(legacyDir, 'SKILL.md');
  if (!fs.existsSync(legacyDir)) return;

  let shouldRemove = false;
  if (fs.existsSync(legacySkill)) {
    const text = fs.readFileSync(legacySkill, 'utf8');
    shouldRemove = text.includes('name: tink') && text.includes('Tink');
  }

  if (!shouldRemove) {
    log.message(`keep unknown ${displayPath(codexTarget, legacyDir)}`);
    recordOperation('keptUnknown', codexTarget, legacyDir);
    return;
  }

  log.message(`${dryRun ? 'would remove legacy' : 'remove legacy'} ${displayPath(codexTarget, legacyDir)}`);
  recordOperation('removedLegacy', codexTarget, legacyDir);
  if (!dryRun) fs.rmSync(legacyDir, { recursive: true, force: true });
}

function removeIfExists(base, filePath, label = 'legacy') {
  if (!fs.existsSync(filePath)) return false;
  log.message(`${dryRun ? `would remove ${label}` : `remove ${label}`} ${displayPath(base, filePath)}`);
  recordOperation('removedLegacy', base, filePath);
  if (!dryRun) fs.rmSync(filePath, { recursive: true, force: true });
  return true;
}

function removeRepoLocalClaudeTinkSurface(target) {
  const commandDir = path.join(target, '.claude/commands/tink');
  const flatCommandDir = path.join(target, '.claude/commands');
  const commandFiles = ['setup.md', 'cast.md', 'verify.md', 'list.md', 'frog.md', 'weave.md', 'update.md'];
  for (const name of commandFiles) {
    removeIfExists(target, path.join(commandDir, name), 'repo-local Claude command');
  }
  if (fs.existsSync(commandDir) && fs.readdirSync(commandDir).length === 0) {
    removeIfExists(target, commandDir, 'empty repo-local Claude command dir');
  }

  const legacyFlatCommands = [
    'tink-setup.md',
    'tink-cast.md',
    'tink-verify.md',
    'tink-list.md',
    'tink-frog.md',
    'tink-weave.md',
    'tink-update.md',
    'tink-forge.md',
    'tink-purge.md',
    'tink-hone.md'
  ];
  for (const name of legacyFlatCommands) {
    removeIfExists(target, path.join(flatCommandDir, name), 'repo-local Claude command');
  }
  if (fs.existsSync(flatCommandDir) && fs.readdirSync(flatCommandDir).length === 0) {
    removeIfExists(target, flatCommandDir, 'empty repo-local Claude commands dir');
  }

  const skillDir = path.join(target, '.claude/skills/tink');
  const skillParentDir = path.join(target, '.claude/skills');
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillDir)) {
    if (fs.existsSync(skillParentDir) && fs.readdirSync(skillParentDir).length === 0) {
      removeIfExists(target, skillParentDir, 'empty repo-local Claude skills dir');
    }
    return;
  }
  if (!fs.existsSync(skillFile)) {
    log.message(`keep unknown ${displayPath(target, skillDir)}`);
    recordOperation('keptUnknown', target, skillDir);
    return;
  }
  const text = fs.readFileSync(skillFile, 'utf8');
  if (text.includes('name: tink') && text.includes('# Tink')) {
    removeIfExists(target, skillDir, 'repo-local Claude skill');
    if (fs.existsSync(skillParentDir) && fs.readdirSync(skillParentDir).length === 0) {
      removeIfExists(target, skillParentDir, 'empty repo-local Claude skills dir');
    }
    return;
  }
  log.message(`keep unknown ${displayPath(target, skillDir)}`);
  recordOperation('keptUnknown', target, skillDir);
}

function readJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, value, base) {
  log.message(`${dryRun ? 'would write' : 'write'} ${displayPath(base, filePath)}`);
  if (!dryRun) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
  }
}

function hookCommandFor(scope, target) {
  const script = path.join(target, '.tink/hooks/user-prompt-submit.mjs');
  const display = scope === 'repo' ? '.tink/hooks/user-prompt-submit.mjs' : script;
  return `node ${JSON.stringify(display)}`;
}

function registerClaudeHook(target, scope, base) {
  const settingsPath = path.join(target, '.claude/settings.json');
  const settings = readJsonFile(settingsPath, {});
  const command = hookCommandFor(scope, target);
  settings.hooks ||= {};
  const entries = Array.isArray(settings.hooks.UserPromptSubmit) ? settings.hooks.UserPromptSubmit : [];
  const filtered = entries.filter((entry) => !JSON.stringify(entry).includes('user-prompt-submit.mjs'));
  filtered.push({
    matcher: '',
    hooks: [{ type: 'command', command }]
  });
  settings.hooks.UserPromptSubmit = filtered;
  writeJsonFile(settingsPath, settings, base);
}

function copySelected(scope, components, agent) {
  const repoTarget = process.cwd();
  const globalTarget = os.homedir();
  const codexTarget = codexHome();
  const target = scope === 'global' ? globalTarget : repoTarget;
  const templateRoot = path.join(root, 'templates');

  if (includesClaude(agent) && components.includes('commands')) {
    copyTinkCommands(templateRoot, target);
  }
  if (agent === 'codex') {
    removeRepoLocalClaudeTinkSurface(target);
  }
  if (components.includes('skill')) {
    if (includesClaude(agent)) {
      copyDir(path.join(templateRoot, 'claude/skills'), path.join(target, '.claude/skills'), target);
    }
    if (includesCodex(agent)) {
      removeLegacyCodexSkill(codexTarget);
      copyDir(path.join(templateRoot, 'codex/skills'), path.join(codexTarget, 'skills'), codexTarget);
    }
  }
  if (components.includes('harnesses')) {
    copyDir(path.join(templateRoot, 'tink/harnesses'), path.join(target, '.tink/harnesses'), target);
    copyDir(path.join(templateRoot, 'tink/rules'), path.join(target, '.tink/rules'), target);
    copyDir(path.join(templateRoot, 'tink/schemas'), path.join(target, '.tink/schemas'), target);
    copyDir(path.join(templateRoot, 'tink/maintenance'), path.join(target, '.tink/maintenance'), target);
    writeFileFromTemplate(path.join(templateRoot, 'tink/config.json'), path.join(target, '.tink/config.json'), target);
  }
  if (components.includes('memory')) {
    copyDir(path.join(templateRoot, 'tink/memory'), path.join(target, '.tink/memory'), target);
  }
  if (includesClaude(agent) && components.includes('hook')) {
    copyDir(path.join(templateRoot, 'tink/hooks'), path.join(target, '.tink/hooks'), target);
    registerClaudeHook(target, scope, target);
  }

  return { repoTarget, globalTarget, codexTarget, installTarget: target };
}

function updateGitignore(target, policy) {
  if (policy === 'all') {
    log.message('skip .gitignore update: tracking all .tink files');
    return;
  }
  const gitignorePath = path.join(target, '.gitignore');
  const ignoreBlock = policy === 'none'
    ? ['.tink/']
    : ['.tink/current/', '.tink/runs/', '.tink/cache/'];

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

function patchConfig(target, scope, hookScope, language) {
  const configPath = path.join(target, '.tink/config.json');
  if (!fs.existsSync(configPath) || dryRun) return;
  const rel = displayPath(target, configPath).replace(/\\/g, '/');
  if (isUpdate && !force && operationLog.preserved.includes(rel)) return;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.install_scope = scope;
  config.hook_scope = hookScope;
  config.language = language;
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

function nextStepFor(agent) {
  if (agent === 'codex') {
    return 'Next: open Codex and use $tink:cast <task> to start. Use $tink:setup only to review or change settings.';
  }
  if (agent === 'all') {
    return 'Next: in Claude Code run /tink:cast <task>, or in Codex use $tink:cast <task>.';
  }
  return 'Next: open Claude Code and run /tink:cast <task> to start. Run /tink:setup only to review or change settings.';
}

function doneLineFor(agent) {
  if (agent === 'codex') return '\nDone. Open Codex and use $tink:cast <task> to start.';
  if (agent === 'all') return '\nDone. Use /tink:cast <task> in Claude Code or $tink:cast <task> in Codex to start.';
  return '\nDone. Open Claude Code and run /tink:cast <task> to start.';
}

function updateResultSummary(agent, targets) {
  const locations = [
    includesClaude(agent) ? `Claude Code commands: ${path.join(targets.installTarget, '.claude/commands/tink')}` : null,
    includesClaude(agent) ? `Claude Code skill: ${path.join(targets.installTarget, '.claude/skills/tink')}` : null,
    includesCodex(agent) ? `Codex skills: ${path.join(targets.codexTarget, 'skills')}` : null,
    `Tink shared files: ${path.join(targets.installTarget, '.tink')}`
  ].filter(Boolean);

  return [
    'Update Result Summary',
    `Surfaces: ${agent}`,
    `Install target: ${targets.installTarget}`,
    includesCodex(agent) ? `Codex target: ${targets.codexTarget}` : null,
    '',
    'Updated or added:',
    shortList([...operationLog.updated, ...operationLog.written]),
    '',
    'Preserved user-modified files:',
    shortList(operationLog.preserved),
    '',
    'Removed legacy paths:',
    shortList(operationLog.removedLegacy),
    operationLog.keptUnknown.length ? ['', 'Kept unknown legacy-looking paths:', shortList(operationLog.keptUnknown)] : null,
    '',
    'Installed locations:',
    locations.map((item) => `- ${item}`).join('\n'),
    '',
    `Next: ${nextStepFor(agent).replace(/^Next: /, '')}`
  ].flat().filter((line) => line !== null).join('\n');
}

function detectLanguage() {
  const envLang = (process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || '').toLowerCase();
  if (envLang.startsWith('ko') || envLang.includes('.ko') || envLang.includes('_kr')) return 'ko';
  if (envLang.startsWith('zh') || envLang.includes('_cn') || envLang.includes('_tw') || envLang.includes('_hk')) return 'zh';
  return 'en';
}

async function resolveChoices() {
  let agent = resolveDefaultSurfaces();
  let scope = args.includes('--global') ? 'global' : (argValue('--scope') || undefined);
  let language = argValue('--lang') || argValue('--language') || detectLanguage();
  if (scope && !['repo', 'global'].includes(scope)) {
    console.error(`Invalid scope: ${scope}`);
    usage();
    process.exit(1);
  }
  if (!['en', 'ko', 'zh'].includes(language)) language = 'en';

  let components = componentOptionsFor(agent, language).map((item) => item.value).filter((value) => value !== 'hook');
  if (includesClaude(agent) && args.includes('--with-hook')) components.push('hook');
  let gitPolicy = 'harnesses';
  let hookScope = 'off';

  if (!interactive) {
    scope = scope || 'repo';
    if (components.includes('hook')) hookScope = scope;
    return { agent, scope, components, gitPolicy, hookScope, language };
  }

  language = handleCancel(await select({
    message: COPY[language].language,
    options: [
      { value: 'ko', label: '한국어', hint: '설치 안내와 Tink 기본 문구를 한국어로 설정' },
      { value: 'en', label: 'English', hint: 'Use English setup copy' },
      { value: 'zh', label: '中文', hint: '使用中文安装说明' }
    ],
    initialValue: language
  }));

  const copy = COPY[language];
  printBanner();
  intro(pc.bgBlue(pc.white(copy.intro)));
  log.message(`${copy.source}: ${source}`);

  const s = spinner();
  s.start(copy.discovering);
  const harnessCount = readHarnessCount();
  s.stop(language === 'ko' ? `Found ${pc.green(harnessCount)} ${copy.found}` : `Found ${pc.green(harnessCount)} ${copy.found}`);

  note(
    language === 'ko'
      ? '기본 항목은 대부분 그대로 설치하면 됩니다. Hook은 선택 사항이며 기본으로 꺼져 있습니다.'
      : language === 'zh'
        ? '默认项目通常保持选中即可。Hook 是可选项，默认关闭。'
        : 'The defaults are usually enough. Hook is optional and off by default.',
    language === 'ko' ? '항목 설명' : language === 'zh' ? '项目说明' : 'Component notes'
  );

  agent = normalizeSurfaces(handleCancel(await multiselect({
    message: language === 'ko'
      ? '설치할 agent surface를 선택하세요 (space로 토글)'
      : 'Select agent surfaces to install (space to toggle)',
    options: SURFACE_OPTIONS[language],
    initialValues: agent === 'all' ? ['claude', 'codex'] : [agent],
    required: true
  })));
  components = componentOptionsFor(agent, language).map((item) => item.value).filter((value) => value !== 'hook');
  if (includesClaude(agent) && args.includes('--with-hook')) components.push('hook');

  components = handleCancel(await multiselect({
    message: copy.components,
    options: componentOptionsFor(agent, language),
    initialValues: components,
    required: true
  }));

  scope = handleCancel(await select({
    message: copy.scope,
    options: [
      {
        value: 'repo',
        label: language === 'ko' ? 'Repo' : language === 'zh' ? 'Repo' : 'Repo',
        hint: language === 'ko'
          ? '현재 프로젝트에 설치. 프로젝트 harness에 권장.'
          : language === 'zh'
            ? '安装到当前项目。推荐用于项目 harness。'
            : 'Install into current project. Recommended for project harnesses.'
      },
      {
        value: 'global',
        label: language === 'ko' ? 'Global' : language === 'zh' ? 'Global' : 'Global',
        hint: language === 'ko'
          ? '사용자 홈에 설치. 여러 프로젝트에서 같은 명령 사용.'
          : language === 'zh'
            ? '安装到用户目录。多个项目共用命令。'
            : 'Install into home config. Available across projects.'
      }
    ],
    initialValue: scope || 'repo'
  }));

  if (scope === 'repo' && components.some((item) => ['harnesses', 'memory', 'hook'].includes(item))) {
    note(copy.gitNote, copy.gitNoteTitle);
    gitPolicy = handleCancel(await select({
      message: copy.gitPolicy,
      options: [
        {
          value: 'harnesses',
          label: language === 'ko' ? 'Harnesses만 커밋' : language === 'zh' ? '只提交 harnesses' : 'Commit harnesses only',
          hint: language === 'ko' ? '권장. current/runs/cache 제외.' : language === 'zh' ? '推荐。忽略 current/runs/cache。' : 'Recommended. Ignore current/runs/cache.'
        },
        {
          value: 'all',
          label: language === 'ko' ? '전부 커밋' : language === 'zh' ? '全部提交' : 'Commit all .tink files',
          hint: language === 'ko' ? '대부분 비권장.' : language === 'zh' ? '通常不推荐。' : 'Usually not recommended.'
        },
        {
          value: 'none',
          label: language === 'ko' ? '커밋 안 함' : language === 'zh' ? '不提交 .tink' : 'Commit no .tink files',
          hint: language === 'ko' ? '이 머신에만 유지.' : language === 'zh' ? '仅保留在本机。' : 'Keep Tink local to this machine.'
        }
      ],
      initialValue: 'harnesses'
    }));
  }

  if (includesClaude(agent) && components.includes('hook')) {
    hookScope = scope;
    note(
      language === 'ko'
        ? `Hook 추천을 ${scope} 범위의 Claude Code UserPromptSubmit에 등록합니다. 추가 범위 질문은 하지 않습니다. 작업 실행/저장 없이 일반 프롬프트에서만 Tink 사용을 추천합니다.`
        : language === 'zh'
          ? `Hook 推荐模板将安装到 ${scope} 范围。不再询问额外 hook 范围。它不会执行或保存内容，只在普通提示中建议使用 Tink。`
          : `Hook recommendation will be registered as a Claude Code UserPromptSubmit hook in ${scope} scope. No extra hook scope question. It does not execute or save anything; it only suggests Tink on normal prompts.`,
      language === 'ko' ? 'Hook 안전성' : language === 'zh' ? 'Hook 安全性' : 'Hook safety'
    );
  }

  return { agent, scope, components, gitPolicy, hookScope, language };
}

async function main() {
  if (command === 'help' || args.includes('--help')) {
    usage();
    process.exit(0);
  }

  if (command !== 'install' && command !== 'update') {
    console.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
  }

  const { agent, scope, components, gitPolicy, hookScope, language } = await resolveChoices();

  if (!interactive) {
    console.log(`${isUpdate ? 'Updating' : 'Installing'} Tink for ${agent === 'claude' ? 'Claude Code' : agent === 'codex' ? 'Codex' : 'Claude Code and Codex'}`);
    console.log(`Source: ${source}`);
    console.log(`surfaces ${agent}`);
    console.log(`language ${language}`);
    console.log(`scope ${scope}`);
    console.log(`components ${components.join(', ')}`);
  }

  const targets = copySelected(scope, components, agent);

  if (scope === 'repo' && components.some((item) => ['harnesses', 'memory', 'hook'].includes(item))) {
    updateGitignore(targets.repoTarget, gitPolicy);
  } else if (scope === 'global') {
    log.message('skip .gitignore for global install');
  }
  patchConfig(targets.installTarget, scope, hookScope, language);

  const summary = [
    `Language: ${language}`,
    `Surfaces: ${agent}`,
    `Scope: ${scope}`,
    `Install target: ${targets.installTarget}`,
    includesCodex(agent) ? `Codex target: ${targets.codexTarget}` : null,
    `Components: ${components.join(', ')}`,
    `Hook scope: ${hookScope}`,
    nextStepFor(agent)
  ].filter(Boolean).join('\n');

  if (interactive) {
    note(summary, COPY[language].installed);
    if (isUpdate) note(updateResultSummary(agent, targets), 'Update Result Summary');
    outro(COPY[language].done);
  } else {
    console.log(`\n${summary}`);
    if (isUpdate) console.log(`\n${updateResultSummary(agent, targets)}`);
    console.log(doneLineFor(agent));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
