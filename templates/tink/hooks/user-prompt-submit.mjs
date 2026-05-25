#!/usr/bin/env node
import fs from 'node:fs';

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text || '{}');
  } catch {
    return {};
  }
}

function readConfigLanguage() {
  try {
    const cfg = safeJson(fs.readFileSync('.tink/config.json', 'utf8'));
    return cfg.language || 'auto';
  } catch {
    return 'auto';
  }
}

const payload = safeJson(readStdin());
const prompt = String(payload.prompt || payload.user_prompt || payload.message || '');
const language = readConfigLanguage();
const trimmed = prompt.trim();

if (!trimmed) process.exit(0);
if (trimmed.startsWith('/')) process.exit(0);

const nonTrivialSignals = [
  /fix|debug|refactor|implement|review|ship|deploy|release|publish|research|investigate/i,
  /bug|test|ci|repo|pr|package|docs|changelog/i,
  /버그|수정|구현|검토|배포|릴리스|조사|문서|테스트|개선/,
  /修复|实现|审查|发布|部署|研究|测试|文档/
];

if (nonTrivialSignals.some((pattern) => pattern.test(trimmed))) {
  const message = language === 'en'
    ? 'Tink suggestion: for complex work, run /tink:cast first to choose a harness and create run state.'
    : language === 'zh'
      ? 'Tink 建议：复杂任务先运行 /tink:cast，选择 harness 并创建运行状态。'
      : 'Tink 제안: 복잡한 작업이면 먼저 /tink:cast로 하네스를 고르고 실행 상태를 만드세요.';
  console.log(message);
}
