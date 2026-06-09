#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_INPUT = '.tink/maintenance/harness-lifecycle.json';
const DEFAULT_OUTPUT = '.tink/maintenance/harness-health-report.html';

const inputPath = process.argv[2] || DEFAULT_INPUT;
const outputPath = process.argv[3] || DEFAULT_OUTPUT;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function readSummary(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing harness health summary: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function countByRecommendation(harnesses) {
  const counts = new Map();
  for (const item of harnesses) {
    const key = item.recommendation || 'unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function renderEvidence(handles = []) {
  if (!handles.length) return '<li>No evidence handle yet.</li>';
  return handles.map((handle) => `<li><code>${escapeHtml(handle)}</code></li>`).join('');
}

function renderRelated(items = []) {
  if (!items.length) return 'None';
  return items
    .map((item) => `${escapeHtml(item.id)} (${escapeHtml(item.count)})`)
    .join(', ');
}

function renderHarness(item) {
  const signals = item.signals || {};
  return `
    <section class="harness">
      <h2>${escapeHtml(item.id)}</h2>
      <dl>
        <div><dt>Recommendation</dt><dd>${escapeHtml(item.recommendation)}</dd></div>
        <div><dt>Confidence</dt><dd>${escapeHtml(item.confidence || 'unknown')}</dd></div>
        <div><dt>Evidence grade</dt><dd>${escapeHtml(item.evidence_grade || 'unknown')}</dd></div>
        <div><dt>Uses</dt><dd>${escapeHtml(signals.uses ?? 0)}</dd></div>
        <div><dt>Successes</dt><dd>${escapeHtml(signals.successes ?? 0)}</dd></div>
        <div><dt>Failures</dt><dd>${escapeHtml(signals.failures ?? 0)}</dd></div>
        <div><dt>Blocked</dt><dd>${escapeHtml(signals.blocked ?? 0)}</dd></div>
        <div><dt>Last used</dt><dd>${escapeHtml(signals.last_used || 'No run record')}</dd></div>
        <div><dt>Context cost</dt><dd>${escapeHtml(signals.context_cost || 'unknown')}</dd></div>
        <div><dt>Often used with</dt><dd>${renderRelated(signals.co_used_with)}</dd></div>
      </dl>
      <p>${escapeHtml(item.reason)}</p>
      <p><strong>Safe next action:</strong> ${escapeHtml(item.safe_next_action || 'Review evidence before acting.')}</p>
      <details>
        <summary>Evidence handles</summary>
        <ul>${renderEvidence(item.evidence_handles)}</ul>
      </details>
    </section>
  `;
}

function renderReport(summary) {
  const harnesses = Array.isArray(summary.harnesses) ? summary.harnesses : [];
  const counts = countByRecommendation(harnesses);
  const generatedAt = summary.generated_at || new Date().toISOString();
  const runWindow = summary.run_window || {};
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tink Harness Health Summary</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.5; color: #18212f; background: #f7f8fa; }
    main { max-width: 980px; margin: 0 auto; }
    header, .harness { background: white; border: 1px solid #d8dee8; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
    h1, h2 { margin: 0 0 .75rem; }
    dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: .5rem; margin: 0 0 1rem; }
    dt { font-size: .8rem; color: #596579; }
    dd { margin: 0; font-weight: 650; }
    code { background: #eef1f6; padding: .1rem .25rem; border-radius: 4px; }
    .notice { border-left: 4px solid #4b6bfb; padding-left: .75rem; }
  </style>
</head>
<body>
<main>
  <header>
    <h1>Tink Harness Health Summary</h1>
    <p class="notice">This report only prepares suggestions. It does not edit, merge, archive, delete, save memory, or update rules.</p>
    <dl>
      <div><dt>Generated at</dt><dd>${escapeHtml(generatedAt)}</dd></div>
      <div><dt>Run count</dt><dd>${escapeHtml(runWindow.run_count ?? 0)}</dd></div>
      <div><dt>Window start</dt><dd>${escapeHtml(runWindow.from || 'Unknown')}</dd></div>
      <div><dt>Window end</dt><dd>${escapeHtml(runWindow.to || 'Unknown')}</dd></div>
    </dl>
    <p>${counts.map(([key, value]) => `<strong>${escapeHtml(key)}</strong>: ${escapeHtml(value)}`).join(' · ')}</p>
  </header>
  ${harnesses.map(renderHarness).join('\n')}
</main>
</body>
</html>
`;
}

try {
  const summary = readSummary(inputPath);
  const html = renderReport(summary);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Wrote ${outputPath}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
