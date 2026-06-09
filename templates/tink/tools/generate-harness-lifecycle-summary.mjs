#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.argv[2] || '.';
const outputPath = process.argv[3] || path.join(rootDir, '.tink/maintenance/harness-lifecycle.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function readLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
}

function listFiles(dirPath, suffix) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter((name) => name.endsWith(suffix))
    .sort()
    .map((name) => path.join(dirPath, name));
}

function parseDateFromRunPath(filePath) {
  const name = path.basename(filePath);
  const match = name.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})-/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:00`;
}

function parseRun(filePath, harnessIds) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lower = text.toLowerCase();
  const statusMatch = text.match(/^Status:\s*([A-Za-z_-]+)/mi);
  const status = statusMatch ? statusMatch[1].toLowerCase() : 'unknown';
  const harnesses = harnessIds.filter((id) => lower.includes(id.toLowerCase()));
  const failed = /check_failed|failed check|required check failed|verification failed/i.test(text);
  const blocked = status === 'blocked' || /check_blocked|blocked/i.test(text);
  const completed = status === 'completed' || status === 'pass' || /npm test passed|verification passed/i.test(text);
  return {
    path: filePath,
    date: parseDateFromRunPath(filePath),
    status,
    harnesses,
    failed,
    blocked,
    completed
  };
}

function parseJsonl(filePath) {
  return readLines(filePath).map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function ensureSummary(id, contextCost) {
  return {
    id,
    signals: {
      uses: 0,
      successes: 0,
      failures: 0,
      blocked: 0,
      last_used: null,
      success_rate: null,
      failure_rate: null,
      co_used_with: [],
      sequence_hints: [],
      context_cost: contextCost || 'unknown'
    },
    recommendation: 'observe',
    confidence: 'low',
    evidence_grade: 'weak',
    reason: 'No run records mention this harness. Missing records are not evidence that the harness is bad.',
    evidence_handles: [],
    safe_next_action: 'Keep observing until real run, ledger, queue, or friction evidence exists.',
    approval_required_for: []
  };
}

function bumpCoUse(coUse, id, others) {
  const map = coUse.get(id) || new Map();
  for (const other of others) {
    if (other === id) continue;
    map.set(other, (map.get(other) || 0) + 1);
  }
  coUse.set(id, map);
}

function addEvidence(item, evidencePath) {
  if (!evidencePath) return;
  if (!item.evidence_handles.includes(evidencePath)) {
    item.evidence_handles.push(evidencePath);
  }
}

function summarize(root) {
  const harnessIndexPath = path.join(root, '.tink/harnesses/index.json');
  const harnessIndex = readJson(harnessIndexPath, []);
  const harnesses = Array.isArray(harnessIndex) ? harnessIndex : [];
  const harnessIds = harnesses.map((item) => item.name).filter(Boolean);
  const summaries = new Map(harnesses.map((item) => [
    item.name,
    ensureSummary(item.name, item.context || 'unknown')
  ]));
  const coUse = new Map();
  const runPaths = listFiles(path.join(root, '.tink/runs'), '.md');
  const runs = runPaths.map((filePath) => parseRun(filePath, harnessIds));

  for (const run of runs) {
    for (const id of run.harnesses) {
      const item = summaries.get(id);
      if (!item) continue;
      item.signals.uses += 1;
      if (run.completed && !run.failed && !run.blocked) item.signals.successes += 1;
      if (run.failed) item.signals.failures += 1;
      if (run.blocked) item.signals.blocked += 1;
      if (run.date && (!item.signals.last_used || run.date > item.signals.last_used)) {
        item.signals.last_used = run.date;
      }
      addEvidence(item, path.relative(root, run.path));
      bumpCoUse(coUse, id, run.harnesses);
    }
  }

  const weaveQueuePath = path.join(root, '.tink/maintenance/weave-queue.json');
  const weaveQueue = readJson(weaveQueuePath, { items: [] });
  for (const entry of Array.isArray(weaveQueue.items) ? weaveQueue.items : []) {
    const id = entry.harness || entry.target;
    const item = summaries.get(id);
    if (!item) continue;
    if (entry.signal === 'check_failed') item.signals.failures += 1;
    if (entry.signal === 'blocked' || entry.signal === 'check_blocked') item.signals.blocked += 1;
    addEvidence(item, '.tink/maintenance/weave-queue.json');
  }

  const frictionPath = path.join(root, '.tink/maintenance/friction.jsonl');
  for (const entry of parseJsonl(frictionPath)) {
    const id = entry.harness || entry.target;
    const item = summaries.get(id);
    if (!item) continue;
    const type = entry.type || entry.signal || entry.outcome;
    if (type === 'check_failed') item.signals.failures += 1;
    if (type === 'blocked' || type === 'check_blocked') item.signals.blocked += 1;
    addEvidence(item, '.tink/maintenance/friction.jsonl');
  }

  for (const [id, item] of summaries) {
    const uses = item.signals.uses;
    const failures = item.signals.failures;
    const blocked = item.signals.blocked;
    const successes = item.signals.successes;
    item.signals.success_rate = uses ? successes / uses : null;
    item.signals.failure_rate = uses ? failures / uses : null;
    item.signals.co_used_with = [...(coUse.get(id) || new Map()).entries()]
      .map(([relatedId, count]) => ({ id: relatedId, count }))
      .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

    const repeatedTrouble = failures + blocked >= 2;
    const hasStrongEvidence = item.evidence_handles.length >= 2 || repeatedTrouble;
    const highCost = item.signals.context_cost === 'high';
    const repeatedOverlap = item.signals.co_used_with.some((related) => related.count >= 2);

    if (uses === 0 && failures + blocked === 0) {
      item.recommendation = 'observe';
      item.confidence = 'low';
      item.evidence_grade = 'weak';
    } else if (repeatedTrouble && highCost) {
      item.recommendation = 'frog_candidate';
      item.confidence = 'high';
      item.evidence_grade = 'strong';
      item.reason = 'Repeated failed or blocked evidence plus high context cost make this a cleanup review candidate.';
      item.safe_next_action = 'Prepare a frog approval payload before any archive, merge, or deletion.';
      item.approval_required_for = ['archive', 'delete'];
    } else if (repeatedTrouble) {
      item.recommendation = 'weave';
      item.confidence = hasStrongEvidence ? 'high' : 'medium';
      item.evidence_grade = hasStrongEvidence ? 'strong' : 'medium';
      item.reason = 'Repeated failed or blocked evidence suggests this harness needs a small improvement.';
      item.safe_next_action = 'Inspect the evidence and prepare a weave approval payload if the pattern is reusable.';
      item.approval_required_for = ['harness_edit', 'rule_update'];
    } else if (repeatedOverlap) {
      item.recommendation = 'merge_candidate';
      item.confidence = 'medium';
      item.evidence_grade = 'medium';
      item.reason = 'This harness often appears with another harness, so it may deserve a combined workflow note. Do not merge automatically.';
      item.safe_next_action = 'Inspect whether the overlap is real before proposing any merge.';
      item.approval_required_for = ['merge'];
    } else if (successes > 0) {
      item.recommendation = 'keep';
      item.confidence = uses >= 2 ? 'high' : 'medium';
      item.evidence_grade = uses >= 2 ? 'strong' : 'medium';
      item.reason = 'Used with successful verification evidence.';
      item.safe_next_action = 'Keep using this harness and watch whether failures repeat.';
    }
  }

  const datedRuns = runs.map((run) => run.date).filter(Boolean).sort();
  return {
    generated_at: new Date().toISOString(),
    run_window: {
      from: datedRuns[0] || null,
      to: datedRuns[datedRuns.length - 1] || null,
      run_count: runs.length
    },
    sources: [
      '.tink/harnesses/index.json',
      '.tink/runs/*.md',
      '.tink/maintenance/weave-queue.json',
      '.tink/maintenance/friction.jsonl'
    ],
    harnesses: [...summaries.values()].sort((a, b) => a.id.localeCompare(b.id))
  };
}

try {
  const summary = summarize(rootDir);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outputPath}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
