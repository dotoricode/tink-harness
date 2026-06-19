#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
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
let dryRun = args.includes('--dry-run');
let force = args.includes('--force');
let cleanCodexPicker = args.includes('--clean-codex-picker') || process.env.TINK_CLEAN_CODEX_PICKER === '1';
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
    { value: 'commands', label: 'Claude Code commands (/tink:*)', hint: '7 slash commands (cast, verify, frog, ...) → .claude/commands/tink/' },
    { value: 'skill', label: 'Tink skill', hint: 'Tink operating rules for Claude Code' },
    { value: 'harnesses', label: 'Built-in harnesses', hint: 'Specialized task procedures → .tink/harnesses/' },
    { value: 'memory', label: 'Memory templates', hint: 'Approved mistakes/preferences/lessons files → .tink/memory/' },
    { value: 'hook', label: 'Hook recommendation (optional)', hint: 'Registers a safe UserPromptSubmit hook when selected. Off by default.' }
  ],
  ko: [
    { value: 'commands', label: 'Claude Code 명령 (/tink:*)', hint: '슬래시 명령 7개 (cast, verify, frog 등) → .claude/commands/tink/' },
    { value: 'skill', label: 'Tink skill', hint: 'Claude Code가 읽는 Tink 작업 원칙' },
    { value: 'harnesses', label: '기본 harness', hint: '기능 특화 작업 절차 → .tink/harnesses/' },
    { value: 'memory', label: 'Memory 템플릿', hint: '승인된 실수/선호/교훈 파일 → .tink/memory/' },
    { value: 'hook', label: 'Hook 추천 (선택)', hint: '선택하면 안전한 UserPromptSubmit hook으로 등록합니다. 기본 off.' }
  ],
  zh: [
    { value: 'commands', label: 'Claude Code 命令 (/tink:*)', hint: '7 个斜杠命令 (cast, verify, frog 等) → .claude/commands/tink/' },
    { value: 'skill', label: 'Tink skill', hint: 'Claude Code 读取的 Tink 工作规则' },
    { value: 'harnesses', label: '内置 harness', hint: '功能特化任务流程 → .tink/harnesses/' },
    { value: 'memory', label: 'Memory 模板', hint: '经批准的错误/偏好/经验文件 → .tink/memory/' },
    { value: 'hook', label: 'Hook 推荐（可选）', hint: '选择后注册安全的 UserPromptSubmit hook。默认关闭。' }
  ]
};

const SURFACE_OPTIONS = {
  en: [
    { value: 'claude', label: 'Claude Code', hint: 'Install /tink:* commands, Claude skill, and optional hook support' },
    { value: 'codex', label: 'Codex', hint: 'Install $tink:* skills into CODEX_HOME or ~/.codex' },
    { value: 'all', label: 'Both (Claude Code + Codex)', hint: 'Install all surfaces' }
  ],
  ko: [
    { value: 'claude', label: 'Claude Code', hint: '/tink:* 명령, Claude skill, 선택 hook 지원 설치' },
    { value: 'codex', label: 'Codex', hint: '$tink:* skills를 CODEX_HOME 또는 ~/.codex에 설치' },
    { value: 'all', label: '둘 다 (Claude Code + Codex)', hint: 'Claude Code와 Codex 모두 설치' }
  ],
  zh: [
    { value: 'claude', label: 'Claude Code', hint: '安装 /tink:* 命令、Claude skill 及可选 hook 支持' },
    { value: 'codex', label: 'Codex', hint: '将 $tink:* skills 安装到 CODEX_HOME 或 ~/.codex' },
    { value: 'all', label: '两者 (Claude Code + Codex)', hint: '安装所有 surface' }
  ]
};

function argValue(name) {
  const prefix = `${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

function usage() {
  console.log(`Tink installer for Claude Code and Codex\n\nUsage:\n  tink-harness [install] [--scope=repo|global] [--global] [--lang=en|ko|zh] [--yes] [--with-hook] [--clean-codex-picker] [--dry-run] [--force]\n  tink-harness update [--scope=repo|global] [--global] [--lang=en|ko|zh] [--yes] [--clean-codex-picker] [--dry-run] [--force]\n  tink-harness update --all-repos\n  tink-harness dashboard [--no-open]\n\nIf the command is not installed yet, use:\n  npx tink-harness@latest [install]\n  npx tink-harness@latest update\n\nCommands:\n  install  Install Tink.\n  update   Update Tink to the latest templates. Asks only the agent surface; Tink-owned files always refresh, user-modified harness/memory/config files are kept.\n  dashboard  Generate the harness health report from local .tink records and open it in your browser. Use --no-open to skip opening.\n\nDefault interactive flow:\n  1. Select language\n  2. Show TINK wizard\n  3. Select Claude Code, Codex, or both\n  4. Select components\n  5. Select repo/global installation scope\n  6. Select Advanced options\n  7. Select git tracking policy for project state\n\nAdvanced options:\n  --dry-run             Preview only. Show what would be written or removed, but do not change files.\n  --force               Overwrite user-modified files. Use only when you want official templates to replace local edits.\n  --clean-codex-picker  Codex-only cleanup. Remove repo-local Claude Tink surfaces that show as Source Command Tink entries.\n  --all-repos           Update all repos with Tink under the home directory. Uses direnv if available to load per-repo .envrc.\n\nEnvironment:\n  TINK_INSTALL_SURFACES=claude|codex|all\n  TINK_CLEAN_CODEX_PICKER=1\n  CLAUDE_CONFIG_DIR  Override ~/.claude for global installs (e.g. set by direnv per project)\n  CODEX_HOME         Override ~/.codex for Codex skill installs\n\nScopes:\n  repo    Install shared .tink files into the current project.\n  global  Install shared .tink files into your home directory.\n`);
}

function findTinkRoot() {
  for (const dir of [process.cwd(), os.homedir()]) {
    if (fs.existsSync(path.join(dir, '.tink'))) return dir;
  }
  return null;
}

function openInBrowser(file) {
  let result;
  if (process.platform === 'win32') {
    result = spawnSync('cmd', ['/c', 'start', '', file], { stdio: 'ignore' });
  } else if (process.platform === 'darwin') {
    result = spawnSync('open', [file], { stdio: 'ignore' });
  } else {
    result = spawnSync('xdg-open', [file], { stdio: 'ignore' });
  }
  return !result.error && result.status === 0;
}

function runDashboard() {
  const target = findTinkRoot();
  const language = detectInstalledLanguage() || detectLanguage();
  if (!target) {
    console.error(language === 'ko'
      ? '.tink 디렉토리를 찾을 수 없습니다(현재 디렉토리·홈 디렉토리 확인). 먼저 `npx tink-harness@latest install`을 실행하세요.'
      : 'No .tink directory found in the current or home directory. Run `npx tink-harness@latest install` first.');
    process.exit(1);
  }
  const toolFor = (name) => {
    const installed = path.join(target, '.tink/tools', name);
    return fs.existsSync(installed) ? installed : path.join(root, 'templates/tink/tools', name);
  };
  const steps = [
    toolFor('generate-harness-lifecycle-summary.mjs'),
    toolFor('render-harness-health-report.mjs')
  ];
  for (const tool of steps) {
    const result = spawnSync(process.execPath, [tool], { cwd: target, stdio: 'inherit' });
    if (result.status !== 0) {
      console.error(language === 'ko'
        ? `대시보드 생성 실패: ${path.basename(tool)}`
        : `Dashboard step failed: ${path.basename(tool)}`);
      process.exit(result.status || 1);
    }
  }
  const reportPath = path.join(target, '.tink/maintenance/harness-health-report.html');
  if (!fs.existsSync(reportPath)) {
    console.error(language === 'ko'
      ? `리포트 파일이 없습니다: ${reportPath}`
      : `Report not found: ${reportPath}`);
    process.exit(1);
  }
  console.log(language === 'ko' ? `대시보드: ${reportPath}` : `Dashboard: ${reportPath}`);
  if (args.includes('--no-open')) return;
  if (openInBrowser(reportPath)) {
    console.log(language === 'ko' ? '기본 브라우저에서 열었습니다.' : 'Opened in your default browser.');
  } else {
    console.log(language === 'ko'
      ? '브라우저 자동 열기에 실패했습니다. 위 경로의 파일을 직접 열어주세요.'
      : 'Could not open a browser automatically. Open the file above manually.');
  }
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

// CLAUDE_CONFIG_DIR replaces ~/.claude for global installs (like direnv per-project overrides).
// Repo-scope installs always use <repo>/.claude regardless of this env var.
function claudeDir(target) {
  if (process.env.CLAUDE_CONFIG_DIR && target === os.homedir()) {
    return process.env.CLAUDE_CONFIG_DIR;
  }
  return path.join(target, '.claude');
}

function legacyComponentOptionsFor(agent, language) {
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

function componentOptionsFor(agent, language) {
  const options = COMPONENTS[language].flatMap((item) => {
    if (item.value === 'commands') return includesClaude(agent) ? [item] : [];
    if (item.value === 'hook') return includesClaude(agent) ? [item] : [];
    if (item.value !== 'skill') return [item];

    const claudeSkill = {
      value: 'claude-skill',
      label: language === 'ko' ? 'Claude Code skill (작업 원칙)' : language === 'zh' ? 'Claude Code skill（工作规则）' : 'Claude Code skill (operating rules)',
      hint: language === 'ko'
        ? '명령과 별개 항목 — Claude Code가 항상 읽는 동작 규칙 문서 → .claude/skills/tink/'
        : language === 'zh'
          ? '与命令不同的项目 — Claude Code 始终读取的工作规则 → .claude/skills/tink/'
          : 'Different from the commands - the rules document Claude Code always reads → .claude/skills/tink/'
    };
    const codexSkills = {
      value: 'codex-skills',
      label: language === 'ko' ? 'Codex skills ($tink:*)' : 'Codex skills ($tink:*)',
      hint: language === 'ko'
        ? 'Codex 전용 — $tink:* action skills → ~/.codex/skills/ (CODEX_HOME)'
        : language === 'zh'
          ? '仅用于 Codex — $tink:* action skills → ~/.codex/skills/ (CODEX_HOME)'
          : 'Codex only - $tink:* action skills → ~/.codex/skills/ (CODEX_HOME)'
    };

    if (agent === 'claude') return [claudeSkill];
    if (agent === 'codex') return [codexSkills];
    return [claudeSkill, codexSkills];
  });

  return options;
}

function wantsClaudeSkill(components) {
  return components.includes('skill') || components.includes('claude-skill');
}

function wantsCodexSkills(components) {
  return components.includes('skill') || components.includes('codex-skills');
}

function wantsCodexPickerCleanup(components, agent) {
  return cleanCodexPicker || components.includes('codex-picker-cleanup') || agent === 'codex';
}

function advancedOptionChoices(agent, language) {
  const choices = [
    {
      value: 'dry-run',
      label: 'Preview only (--dry-run)',
      hint: language === 'ko'
        ? '파일을 바꾸기 전에 무엇을 쓸지, 지울지 미리 보여줍니다.'
        : 'Preview what will be written or removed before changing files.'
    },
    {
      value: 'force',
      label: 'Overwrite user-modified files (--force)',
      hint: language === 'ko'
        ? '로컬에서 고친 파일도 공식 템플릿으로 덮어씁니다. 복구용일 때만 쓰세요.'
        : 'Replace local edits with official templates. Use only for recovery.'
    }
  ];
  if (agent === 'codex') {
    choices.push({
      value: 'clean-codex-picker',
      label: 'Clean Codex picker (--clean-codex-picker)',
      hint: language === 'ko'
        ? 'Codex만 쓸 때 Source Command Tink 중복 항목을 줄입니다.'
        : 'For Codex-only use. Reduce duplicate Source Command Tink entries.'
    });
  }
  return choices;
}

function defaultAdvancedValues(agent) {
  return [
    dryRun ? 'dry-run' : null,
    force ? 'force' : null,
    agent === 'codex' && cleanCodexPicker ? 'clean-codex-picker' : null
  ].filter(Boolean);
}

function applyAdvancedOptions(values) {
  dryRun = values.includes('dry-run');
  force = values.includes('force');
  cleanCodexPicker = values.includes('clean-codex-picker');
}

function optionsSummary(agent) {
  return [
    `Preview only (--dry-run): ${dryRun ? 'yes' : 'no'}`,
    `Overwrite user-modified files (--force): ${force ? 'yes' : 'no'}`,
    agent === 'codex' ? `Clean Codex picker (--clean-codex-picker): ${cleanCodexPicker ? 'yes' : 'no'}` : null
  ].filter(Boolean).join('\n');
}

function locationSummary(agent, scope) {
  const repoTarget = process.cwd();
  const installTarget = scope === 'global' ? os.homedir() : repoTarget;
  return [
    `Repo target: ${repoTarget}`,
    `Shared .tink target: ${path.join(installTarget, '.tink')}`,
    includesClaude(agent) ? `Claude Code command target: ${path.join(claudeDir(installTarget), 'commands/tink')}` : null,
    includesClaude(agent) ? `Claude Code skill target: ${path.join(claudeDir(installTarget), 'skills/tink')}` : null,
    includesCodex(agent) ? `Codex skills target: ${path.join(codexHome(), 'skills')}` : null,
    includesCodex(agent) ? `Codex picker cleanup target: ${path.join(process.cwd(), '.claude')}` : null
  ].filter(Boolean).join('\n');
}

function defaultComponentValues(agent, language) {
  return componentOptionsFor(agent, language)
    .map((item) => item.value)
    .filter((value) => value !== 'hook');
}

function componentMessage(agent, language) {
  if (language === 'ko') {
    if (agent === 'claude') return 'Claude Code 설치 항목을 선택하세요 (space로 토글)';
    if (agent === 'codex') return 'Codex 설치 항목을 선택하세요 (space로 토글)';
    return '설치할 항목을 선택하세요 (space로 토글)';
  }
  if (language === 'zh') {
    if (agent === 'claude') return '选择 Claude Code 安装项目（空格切换）';
    if (agent === 'codex') return '选择 Codex 安装项目（空格切换）';
    return '选择要安装的项目（空格切换）';
  }
  if (agent === 'claude') return 'Select Claude Code components to install (space to toggle)';
  if (agent === 'codex') return 'Select Codex components to install (space to toggle)';
  return 'Select components to install (space to toggle)';
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
  // HARNESS.md is the human catalog, not a harness
  return fs.readdirSync(dir).filter((name) => name.endsWith('.md') && name !== 'HARNESS.md').length;
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

function readInstalledConfig() {
  const candidates = [
    path.join(process.cwd(), '.tink/config.json'),
    path.join(os.homedir(), '.tink/config.json')
  ];
  for (const configPath of candidates) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      // keep looking
    }
  }
  return null;
}

function detectInstalledLanguage() {
  const config = readInstalledConfig();
  if (config && ['en', 'ko', 'zh'].includes(config.language)) return config.language;
  return null;
}

function isAlwaysUpdatePath(src) {
  const rel = path.relative(root, src).replace(/\\/g, '/');
  return rel.startsWith('templates/claude/commands/') ||
    rel.startsWith('templates/claude/skills/') ||
    rel.startsWith('templates/codex/skills/') ||
    rel.startsWith('templates/tink/tools/');
}

function isSeedOnlyPath(src) {
  // Runtime record files (ledger, friction, weave queue): the template only
  // seeds them. Once they exist they hold user history and must never be
  // overwritten by install or update.
  const rel = path.relative(root, src).replace(/\\/g, '/');
  return rel.startsWith('templates/tink/maintenance/');
}

// Generic task-type harnesses retired from the default set: generic work now
// runs on the base run contract alone. Values are normalized (CR-stripped)
// sha256 hashes of every version ever shipped, so update can tell shipped
// content (safe to remove) from user-woven content (preserved).
const RETIRED_HARNESSES = {
  'code-change': [
    '883396f8a7c69f097476ffd23288597814c5eabfae4ada2ef8a643afb3a80345',
    'b9320a0fc7f89a7e8898107f0e289758b7265c1fddce3497fc9297703a3edb44'
  ],
  'bug-fix': [
    '94f747e2cd299ae84fa82b8c54954e518fcca1e95a30edfe571fbf504dd70906',
    'e2fe201b3de7d7ec748ebd6b7f8f11bb1f702d0deda21c87d21d7ce82867ce1f'
  ],
  research: [
    '57fc4446a0e7d831a1fbd8047f45ad1b3bb595606cb4e643a7fce97308d38197',
    '8e36fa4e3f5f2cb87b5357b33c46a9f9428038f344a12a5b46c79dee0c474aa1'
  ],
  review: [
    '9f0c3f093885b9cf2d796bf60b8f1e5e08805273343a42b1bc87c06d36b7a2a0',
    '3b46487689af1a19e436ea672ccfa78cbf82ffcce4540b826ee95239c968c889'
  ],
  docs: [
    '25e6a8fc0c7ba3b4c50519c91157172f8b551ff847f30cc96a5b3ef64cb2c530',
    '3e42f06aad78f2b18cb5c0c1a0efca17f86cbba9d189f5dbf64efe1c8c75d9b0'
  ]
};

function normalizedSha256(content) {
  return crypto.createHash('sha256').update(content.replace(/\r/g, '')).digest('hex');
}

// Default harnesses the user explicitly removed via an approved /tink:frog
// operation. Update must not resurrect them.
const retiredByFrog = new Set();

function harnessNameFromDest(dest) {
  const match = String(dest).replace(/\\/g, '/').match(/\.tink\/harnesses\/([^/]+)\.md$/);
  return match ? match[1] : '';
}

function loadFroggedHarnessNames(target) {
  retiredByFrog.clear();
  const ledgerPath = path.join(target, '.tink/maintenance/ledger.jsonl');
  if (!fs.existsSync(ledgerPath)) return;
  let lines;
  try {
    lines = fs.readFileSync(ledgerPath, 'utf8').split('\n');
  } catch {
    return;
  }
  for (const line of lines) {
    const text = line.replace(/^﻿/, '').trim();
    if (!text) continue;
    try {
      const entry = JSON.parse(text);
      if (entry && entry.type === 'frog' && entry.result === 'applied' && Array.isArray(entry.files)) {
        for (const file of entry.files) {
          const name = harnessNameFromDest(file);
          if (name && name !== 'index') retiredByFrog.add(name);
        }
      }
    } catch {
      // skip malformed ledger lines
    }
  }
}

function removeRetiredHarnesses(templateRoot, target) {
  const harnessDir = path.join(target, '.tink/harnesses');
  if (!fs.existsSync(harnessDir)) return;
  const cleared = [];
  for (const [name, hashes] of Object.entries(RETIRED_HARNESSES)) {
    const file = path.join(harnessDir, `${name}.md`);
    if (!fs.existsSync(file)) {
      cleared.push(name);
      continue;
    }
    if (hashes.includes(normalizedSha256(fs.readFileSync(file, 'utf8')))) {
      log.message(`${dryRun ? 'would remove retired' : 'remove retired'} ${displayPath(target, file)}`);
      recordOperation('removedLegacy', target, file);
      if (!dryRun) fs.rmSync(file, { force: true });
      cleared.push(name);
    } else {
      log.message(`keep user-modified retired harness ${displayPath(target, file)}`);
      recordOperation('preserved', target, file);
    }
  }
  syncHarnessIndex(templateRoot, target, cleared);
  pruneRetiredRuleNodes(target, cleared);
}

function syncHarnessIndex(templateRoot, target, cleared) {
  const indexPath = path.join(target, '.tink/harnesses/index.json');
  const templateIndexPath = path.join(templateRoot, 'tink/harnesses/index.json');
  if (!fs.existsSync(indexPath) || !fs.existsSync(templateIndexPath)) return;
  try {
    const installed = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const template = JSON.parse(fs.readFileSync(templateIndexPath, 'utf8'));
    if (!Array.isArray(installed) || !Array.isArray(template)) return;
    // keep user entries and metadata; drop entries whose retired file is gone;
    // append default entries the installed index does not know yet
    const kept = installed.filter((entry) => !(entry && cleared.includes(entry.name)));
    const knownNames = new Set(kept.map((entry) => entry && entry.name));
    const added = template.filter((entry) =>
      entry && !knownNames.has(entry.name) && !retiredByFrog.has(entry.name));
    const next = [...kept, ...added];
    if (next.length === installed.length && added.length === 0) return;
    log.message(`${dryRun ? 'would sync' : 'sync'} ${displayPath(target, indexPath)} (${installed.length - kept.length} retired removed, ${added.length} default added)`);
    recordOperation('updated', target, indexPath);
    if (!dryRun) fs.writeFileSync(indexPath, `${JSON.stringify(next, null, 2)}\n`);
  } catch {
    // unreadable index: leave it untouched
  }
}

function pruneRetiredRuleNodes(target, cleared) {
  const rulesPath = path.join(target, '.tink/rules/index.json');
  if (!fs.existsSync(rulesPath)) return;
  try {
    const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    if (!rules || !Array.isArray(rules.nodes)) return;
    const nodes = rules.nodes.filter((node) =>
      !(node && node.type === 'harness' && cleared.includes(node.target)));
    if (nodes.length === rules.nodes.length) return;
    const removedIds = new Set(rules.nodes.filter((node) => !nodes.includes(node)).map((node) => node.id));
    rules.nodes = nodes;
    if (Array.isArray(rules.edges)) {
      rules.edges = rules.edges.filter((edge) => !removedIds.has(edge.from) && !removedIds.has(edge.to));
    }
    log.message(`${dryRun ? 'would prune' : 'prune'} retired rule nodes from ${displayPath(target, rulesPath)}`);
    recordOperation('updated', target, rulesPath);
    if (!dryRun) fs.writeFileSync(rulesPath, `${JSON.stringify(rules, null, 2)}\n`);
  } catch {
    // unreadable rule graph: leave it untouched
  }
}

function isGeneratedLegacyRuleGraph(src, dest) {
  const rel = path.relative(root, src).replace(/\\/g, '/');
  if (rel !== 'templates/tink/rules/index.json') return false;
  try {
    const rules = JSON.parse(fs.readFileSync(dest, 'utf8'));
    if (rules.node_shape) return false;
    const legacyIds = [
      'harness:code-change',
      'harness:bug-fix',
      'harness:ship',
      'harness:pre-publish-multi-agent-verify',
      'check:package-dry-run',
      'check:readme-cli-match',
      'guard:release-verification-stop',
      'guard:forbidden-path-write'
    ];
    const nodes = Array.isArray(rules.nodes) ? rules.nodes : [];
    if (nodes.length !== legacyIds.length) return false;
    const ids = nodes.map((node) => node && node.id);
    if (!legacyIds.every((id) => ids.includes(id))) return false;
    return nodes.every((node) =>
      node &&
      !Object.prototype.hasOwnProperty.call(node, 'reason') &&
      !Object.prototype.hasOwnProperty.call(node, 'risk') &&
      !Object.prototype.hasOwnProperty.call(node, 'checks') &&
      !Object.prototype.hasOwnProperty.call(node, 'include_paths') &&
      !Object.prototype.hasOwnProperty.call(node, 'select_harnesses')
    );
  } catch {
    return false;
  }
}

function writeFileFromTemplate(src, dest, base) {
  const exists = fs.existsSync(dest);
  if (exists && !force && isSeedOnlyPath(src)) {
    return;
  }
  if (isUpdate && !exists && retiredByFrog.has(harnessNameFromDest(dest))) {
    log.message(`skip frog-removed ${displayPath(base, dest)}`);
    return;
  }
  if (exists && !force) {
    if (isUpdate) {
      const srcContent = fs.readFileSync(src);
      const destContent = fs.readFileSync(dest);
      if (Buffer.compare(srcContent, destContent) === 0) {
        return;
      }
      if (!isAlwaysUpdatePath(src) && !isGeneratedLegacyRuleGraph(src, dest)) {
        log.message(`keep user-modified ${displayPath(base, dest)}`);
        recordOperation('preserved', base, dest);
        return;
      }
      // commands/skills/maintenance and generated legacy rule graph: update to new version
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
  const commandDest = path.join(claudeDir(target), 'commands/tink');
  const flatCommandDest = path.join(claudeDir(target), 'commands');
  const legacyFlatCommands = ['tink-setup.md', 'tink-forge.md', 'tink-list.md', 'tink-purge.md', 'tink-hone.md'];
  const legacyNamespaceCommands = ['forge.md', 'purge.md', 'hone.md'];
  const legacyTinyCommands = ['tiny-setup.md', 'tiny-use.md', 'tiny-list.md', 'tiny-save.md'];
  const legacyDirs = [path.join(flatCommandDest, 'tiny'), path.join(claudeDir(target), 'skills/tiny')];
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
  const settingsPath = path.join(claudeDir(target), 'settings.json');
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
  const cleanupCodexPicker = wantsCodexPickerCleanup(components, agent);

  if (includesClaude(agent) && components.includes('commands') && !cleanupCodexPicker) {
    copyTinkCommands(templateRoot, target);
  }
  if (cleanupCodexPicker) {
    removeRepoLocalClaudeTinkSurface(repoTarget);
  }
  if (wantsClaudeSkill(components)) {
    if (includesClaude(agent) && !cleanupCodexPicker) {
      copyDir(path.join(templateRoot, 'claude/skills'), path.join(claudeDir(target), 'skills'), target);
    }
  }
  if (wantsCodexSkills(components)) {
    if (includesCodex(agent)) {
      removeLegacyCodexSkill(codexTarget);
      copyDir(path.join(templateRoot, 'codex/skills'), path.join(codexTarget, 'skills'), codexTarget);
    }
  }
  if (components.includes('harnesses')) {
    if (isUpdate) loadFroggedHarnessNames(target);
    copyDir(path.join(templateRoot, 'tink/harnesses'), path.join(target, '.tink/harnesses'), target);
    copyDir(path.join(templateRoot, 'tink/rules'), path.join(target, '.tink/rules'), target);
    copyDir(path.join(templateRoot, 'tink/schemas'), path.join(target, '.tink/schemas'), target);
    copyDir(path.join(templateRoot, 'tink/maintenance'), path.join(target, '.tink/maintenance'), target);
    copyDir(path.join(templateRoot, 'tink/tools'), path.join(target, '.tink/tools'), target);
    writeFileFromTemplate(path.join(templateRoot, 'tink/config.json'), path.join(target, '.tink/config.json'), target);
    if (isUpdate) removeRetiredHarnesses(templateRoot, target);
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
  if (policy === 'none') {
    // the user chose to keep .tink out of git; do not touch their .gitignore
    log.message('skip .gitignore update: .tink stays untracked by your choice');
    return;
  }
  const gitignorePath = path.join(target, '.gitignore');
  const ignoreBlock = ['.tink/current/', '.tink/runs/', '.tink/cache/'];

  if (fs.existsSync(gitignorePath)) {
    const existing = fs.readFileSync(gitignorePath, 'utf8');
    if (/^\.tink\/\s*$/m.test(existing)) {
      // a legacy install already ignores the whole directory; nothing to add
      log.message('skip .gitignore update: .tink/ already ignored');
      return;
    }
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

function patchConfig(target, scope, hookScope, language, gitPolicy) {
  const configPath = path.join(target, '.tink/config.json');
  if (!fs.existsSync(configPath) || dryRun) return;
  const rel = displayPath(target, configPath).replace(/\\/g, '/');
  if (isUpdate && !force && operationLog.preserved.includes(rel)) return;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.install_scope = scope;
  config.hook_scope = hookScope;
  config.language = language;
  if (gitPolicy) config.git_policy = gitPolicy;
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

function githubPointer(language) {
  if (language === 'ko') {
    return '문서·데모·로드맵: https://github.com/dotoricode/tink-harness' + String.fromCharCode(10) + 'Tink가 Claude Code·Codex 워크플로에 도움이 됐다면, star 하나가 다른 개발자들이 찾는 데 힘이 됩니다.';
  }
  if (language === 'zh') {
    return '文档、演示与路线图: https://github.com/dotoricode/tink-harness' + String.fromCharCode(10) + '如果 Tink 对你的 Claude Code/Codex 工作流有帮助，一个 star 能帮助更多人发现它。';
  }
  return 'Docs, demo, and roadmap: https://github.com/dotoricode/tink-harness' + String.fromCharCode(10) + 'If Tink helps your Claude Code or Codex workflow, a star helps others find it.';
}

function doneLineFor(agent) {
  if (agent === 'codex') return '\nDone. Open Codex and use $tink:cast <task> to start.';
  if (agent === 'all') return '\nDone. Use /tink:cast <task> in Claude Code or $tink:cast <task> in Codex to start.';
  return '\nDone. Open Claude Code and run /tink:cast <task> to start.';
}

function updateResultSummary(agent, targets) {
  const locations = [
    includesClaude(agent) ? `Claude Code commands: ${path.join(claudeDir(targets.installTarget), 'commands/tink')}` : null,
    includesClaude(agent) ? `Claude Code skill: ${path.join(claudeDir(targets.installTarget), 'skills/tink')}` : null,
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

  let components = defaultComponentValues(agent, language);
  if (includesClaude(agent) && args.includes('--with-hook')) components.push('hook');
  let advancedOptions = defaultAdvancedValues(agent);
  let gitPolicy = 'harnesses';
  let hookScope = 'off';

  const explicitLanguage = Boolean(argValue('--lang') || argValue('--language'));
  if (isUpdate && !explicitLanguage) {
    language = detectInstalledLanguage() || language;
    components = defaultComponentValues(agent, language);
    if (includesClaude(agent) && args.includes('--with-hook')) components.push('hook');
  }
  if (isUpdate) {
    // reuse the choices stored at install time; only the agent surface is asked
    const stored = readInstalledConfig();
    const cwdHasTink = fs.existsSync(path.join(process.cwd(), '.tink'));
    if (!scope && cwdHasTink) scope = 'repo';
    if (stored) {
      if (!scope && ['repo', 'global'].includes(stored.install_scope)) scope = stored.install_scope;
      if (['harnesses', 'all', 'none'].includes(stored.git_policy)) gitPolicy = stored.git_policy;
    }
  }

  if (!interactive) {
    scope = scope || 'repo';
    if (components.includes('hook')) hookScope = scope;
    return { agent, scope, components, gitPolicy, hookScope, language };
  }

  if (isUpdate) {
    const copy = COPY[language];
    printBanner();
    intro(pc.bgBlue(pc.white(copy.intro)));
    log.message(`${copy.source}: ${source}`);
    agent = handleCancel(await select({
      message: language === 'ko'
        ? '업데이트할 agent surface를 선택하세요 (나머지는 자동으로 최신화됩니다)'
        : language === 'zh'
          ? '选择要更新的 agent surface（其余将自动更新到最新）'
          : 'Select agent surface to update (everything else refreshes automatically)',
      options: SURFACE_OPTIONS[language],
      initialValue: agent
    }));
    components = defaultComponentValues(agent, language);
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

  agent = handleCancel(await select({
    message: language === 'ko'
      ? '설치할 agent surface를 선택하세요'
      : language === 'zh'
        ? '选择要安装的 agent surface'
        : 'Select agent surface to install',
    options: SURFACE_OPTIONS[language],
    initialValue: agent
  }));
  components = defaultComponentValues(agent, language);
  if (includesClaude(agent) && args.includes('--with-hook')) components.push('hook');
  advancedOptions = defaultAdvancedValues(agent);

  components = handleCancel(await multiselect({
    message: componentMessage(agent, language),
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

  advancedOptions = handleCancel(await multiselect({
    message: language === 'ko' ? '실행 옵션을 선택하세요 (space로 토글)' : 'Select run options (space to toggle)',
    options: advancedOptionChoices(agent, language),
    initialValues: advancedOptions,
    required: false
  }));
  applyAdvancedOptions(advancedOptions);
  note(optionsSummary(agent), language === 'ko' ? '선택된 옵션' : 'Selected options');

  note(locationSummary(agent, scope), language === 'ko' ? '설치 위치' : 'Install locations');

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

function findAllTinkRepos() {
  const found = [];
  const skip = new Set(['node_modules', '.git', 'vendor', 'dist', 'build', 'out', 'target', '.cache']);

  function scan(dir, depth) {
    if (depth > 4) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    let hasTink = false;
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === '.tink') { hasTink = true; continue; }
      if (skip.has(entry.name) || entry.name.startsWith('.')) continue;
      scan(path.join(dir, entry.name), depth + 1);
    }
    if (hasTink) found.push(dir);
  }

  scan(os.homedir(), 0);
  return found;
}

function isDirenvAvailable() {
  return spawnSync('direnv', ['version'], { encoding: 'utf8' }).status === 0;
}

function parseEnvrc(envrcPath, repoDir) {
  if (!fs.existsSync(envrcPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envrcPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*export\s+([A-Z_][A-Z0-9_]*)=(.*)/);
    if (!m) continue;
    let val = m[2].trim().replace(/^["']|["']$/g, '');
    val = val
      .replace(/\$HOME|\bHOME\b/g, os.homedir())
      .replace(/\$PWD|\bPWD\b/g, repoDir)
      .replace(/^~/, os.homedir());
    env[m[1]] = val;
  }
  return env;
}

async function runAllRepos() {
  const allRepos = findAllTinkRepos();
  const sourceRoot = path.resolve(root);
  const repos = allRepos.filter((r) => path.resolve(r) !== sourceRoot);

  if (repos.length === 0) {
    console.log('No repos with Tink installed found under home directory.');
    return;
  }

  const hasDirenv = isDirenvAvailable();
  const installScript = path.join(root, 'bin/install.js');

  console.log(`Found ${repos.length} repo(s) with Tink installed:\n`);
  for (const repo of repos) {
    const envrc = path.join(repo, '.envrc');
    const envVars = hasDirenv ? {} : parseEnvrc(envrc, repo);
    const claudeTarget = envVars.CLAUDE_CONFIG_DIR
      ? envVars.CLAUDE_CONFIG_DIR
      : path.join(repo, '.claude');
    const note = fs.existsSync(envrc)
      ? hasDirenv
        ? `(direnv)`
        : envVars.CLAUDE_CONFIG_DIR
          ? `(.envrc → CLAUDE_CONFIG_DIR=${envVars.CLAUDE_CONFIG_DIR})`
          : `(.envrc, no CLAUDE_CONFIG_DIR)`
      : '';
    console.log(`  ${repo} ${note}`);
    console.log(`    → ${claudeTarget}/commands/tink`);
  }
  console.log('');

  for (const repo of repos) {
    console.log(`▶ ${path.basename(repo)} (${repo})`);
    const envrc = path.join(repo, '.envrc');
    const extraEnv = hasDirenv ? {} : parseEnvrc(envrc, repo);
    const mergedEnv = { ...process.env, ...extraEnv };

    let result;
    if (hasDirenv && fs.existsSync(envrc)) {
      result = spawnSync(
        'direnv', ['exec', repo, 'node', installScript, 'update', '--yes', '--scope=repo'],
        { cwd: repo, env: process.env, stdio: 'inherit', encoding: 'utf8' }
      );
    } else {
      result = spawnSync(
        process.execPath, [installScript, 'update', '--yes', '--scope=repo'],
        { cwd: repo, env: mergedEnv, stdio: 'inherit', encoding: 'utf8' }
      );
    }

    if (result.status !== 0) {
      console.error(`  ✗ failed (exit ${result.status})`);
    } else {
      console.log(`  ✓ done`);
    }
    console.log('');
  }
}

async function main() {
  if (command === 'help' || args.includes('--help')) {
    usage();
    process.exit(0);
  }

  if (command === 'update' && args.includes('--all-repos')) {
    await runAllRepos();
    return;
  }

  if (command === 'dashboard') {
    runDashboard();
    return;
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
    console.log(optionsSummary(agent));
    console.log(locationSummary(agent, scope));
  }

  const targets = copySelected(scope, components, agent);

  if (scope === 'repo' && components.some((item) => ['harnesses', 'memory', 'hook'].includes(item))) {
    updateGitignore(targets.repoTarget, gitPolicy);
  } else if (scope === 'global') {
    log.message('skip .gitignore for global install');
  }
  patchConfig(targets.installTarget, scope, hookScope, language, gitPolicy);

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
    note(githubPointer(language), 'GitHub');
    outro(COPY[language].done);
  } else {
    console.log(`\n${summary}`);
    if (isUpdate) console.log(`\n${updateResultSummary(agent, targets)}`);
    console.log(`\n${githubPointer(language)}`);
    console.log(doneLineFor(agent));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
