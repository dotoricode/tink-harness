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

const payload = safeJson(readStdin());
const prompt = String(payload.prompt || payload.user_prompt || payload.message || '');

if (!prompt.trim()) process.exit(0);
if (prompt.trim().startsWith('/')) process.exit(0);

const nonTrivialSignals = [
  /fix|debug|refactor|implement|review|ship|deploy|research|investigate/i,
  /버그|수정|구현|검토|배포|조사|정리|개선/,
  /\b(파일|repo|PR|테스트|CI|로그)\b/i
];

if (nonTrivialSignals.some((pattern) => pattern.test(prompt))) {
  console.log('Tink 제안: 복잡한 작업이면 /tink:forge로 하네스와 실행 상태를 먼저 잡을 수 있습니다.');
}
