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
  return fs.readFileSync(filePath, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
}

function listFiles(dirPath, suffix) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter((name) => name.endsWith(suffix))
    .sort()
    .map((name) => path.join(dirPath, name));
}

function walkFiles(dirPath, suffix) {
  if (!fs.existsSync(dirPath)) return [];
  const found = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkFiles(entryPath, suffix));
    } else if (entry.isFile() && entry.name.endsWith(suffix)) {
      found.push(entryPath);
    }
  }
  return found.sort();
}

function relativeRef(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function parseDateFromRunPath(filePath) {
  const name = path.basename(filePath);
  const match = name.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})-/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:00`;
}

function extractSelectedHarnesses(text, harnessIds) {
  const selected = [];
  const known = new Set(harnessIds);
  const lines = text.split(/\r?\n/);
  let inHarnessBlock = false;

  for (const line of lines) {
    if (/^(#+\s*)?(selected|loaded)?\s*harnesses\s*:?\s*$/i.test(line.trim())) {
      inHarnessBlock = true;
      continue;
    }
    if (!inHarnessBlock) continue;
    if (/^#+\s+\S/.test(line) || (!line.trim() && selected.length > 0)) break;
    const match = line.match(/^\s*[-*]\s*`?([A-Za-z0-9._-]+)`?/);
    if (match && known.has(match[1]) && !selected.includes(match[1])) {
      selected.push(match[1]);
    }
  }

  if (selected.length > 0) return selected;
  const lower = text.toLowerCase();
  return harnessIds.filter((id) => lower.includes(id.toLowerCase()));
}

function extractRefs(text, refs) {
  return refs.filter((ref) => text.includes(ref));
}

function parseRun(filePath, harnessIds, ruleRefs, memoryRefs) {
  const text = fs.readFileSync(filePath, 'utf8');
  const statusMatch = text.match(/^Status:\s*([A-Za-z_-]+)/mi);
  const status = statusMatch ? statusMatch[1].toLowerCase() : 'unknown';
  const harnesses = extractSelectedHarnesses(text, harnessIds);
  const failed = /check_failed|failed check|required check failed|verification failed/i.test(text);
  const blocked = status === 'blocked' || /check_blocked|blocked/i.test(text);
  const completed = status === 'completed' || status === 'pass' || /npm test passed|verification passed/i.test(text);
  return {
    path: filePath,
    date: parseDateFromRunPath(filePath),
    status,
    harnesses,
    ruleRefs: extractRefs(text, ruleRefs),
    memoryRefs: extractRefs(text, memoryRefs),
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
      rule_refs: [],
      memory_refs: [],
      context_cost: contextCost || 'unknown'
    },
    recommendation: 'observe',
    confidence: 'low',
    evidence_grade: 'weak',
    reason: 'No run records mention this harness. Missing records are not evidence that the harness is bad.',
    evidence_handles: [],
    safe_next_action: 'Keep observing until real run, ledger, queue, or friction evidence exists.',
    approval_required_for: [],
    lifecycle_state: 'no_evidence',
    stale_days: null,
    state_reason: 'No run records mention this harness.',
    candidate_score: {
      total: 0,
      factors: []
    }
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

function bumpSequence(sequenceUse, before, after) {
  if (!before || !after || before === after) return;
  const map = sequenceUse.get(before) || new Map();
  map.set(after, (map.get(after) || 0) + 1);
  sequenceUse.set(before, map);
}

function addEvidence(item, evidencePath) {
  if (!evidencePath) return;
  if (!item.evidence_handles.includes(evidencePath)) {
    item.evidence_handles.push(evidencePath);
  }
}

function addSignalRefs(item, field, refs) {
  for (const ref of refs) {
    if (!item.signals[field].includes(ref)) {
      item.signals[field].push(ref);
    }
  }
}

function graphNodeId(type, id) {
  return `${type}:${id}`;
}

function addGraphNode(nodes, node) {
  if (!nodes.has(node.id)) nodes.set(node.id, node);
}

function addGraphEdge(edges, edge) {
  const key = `${edge.source}\0${edge.target}\0${edge.type}`;
  if (!edges.has(key)) edges.set(key, edge);
}

function buildGraph(harnessSummaries) {
  const nodes = new Map();
  const edges = new Map();

  for (const item of harnessSummaries) {
    const harnessNodeId = graphNodeId('harness', item.id);
    addGraphNode(nodes, {
      id: harnessNodeId,
      type: 'harness',
      label: item.id,
      recommendation: item.recommendation,
      confidence: item.confidence,
      weight: item.signals.uses,
      candidate_score: item.candidate_score?.total ?? 0
    });

    for (const related of item.signals.co_used_with) {
      const relatedNodeId = graphNodeId('harness', related.id);
      addGraphEdge(edges, {
        source: harnessNodeId,
        target: relatedNodeId,
        type: 'co_used',
        count: related.count
      });
    }

    for (const hint of item.signals.sequence_hints) {
      const targetType = hint.after === 'verify' ? 'stage' : 'harness';
      const targetNodeId = graphNodeId(targetType, hint.after);
      addGraphNode(nodes, {
        id: targetNodeId,
        type: targetType,
        label: hint.after,
        weight: hint.count
      });
      addGraphEdge(edges, {
        source: graphNodeId('harness', hint.before),
        target: targetNodeId,
        type: 'sequence',
        count: hint.count
      });
    }

    for (const ref of item.signals.rule_refs) {
      const ruleNodeId = graphNodeId('rule', ref);
      addGraphNode(nodes, {
        id: ruleNodeId,
        type: 'rule',
        label: ref,
        weight: 1
      });
      addGraphEdge(edges, {
        source: harnessNodeId,
        target: ruleNodeId,
        type: 'uses_rule',
        count: 1
      });
    }

    for (const ref of item.signals.memory_refs) {
      const memoryNodeId = graphNodeId('memory', ref);
      addGraphNode(nodes, {
        id: memoryNodeId,
        type: 'memory',
        label: ref,
        weight: 1
      });
      addGraphEdge(edges, {
        source: harnessNodeId,
        target: memoryNodeId,
        type: 'uses_memory',
        count: 1
      });
    }
  }

  return {
    nodes: [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...edges.values()].sort((a, b) => (
      a.source.localeCompare(b.source) ||
      a.target.localeCompare(b.target) ||
      a.type.localeCompare(b.type)
    ))
  };
}

function scoreFactor(name, value, reason) {
  return { name, value, reason };
}

function scoreCandidate(item) {
  const factors = [];
  const failuresAndBlocked = (item.signals.failures || 0) + (item.signals.blocked || 0);
  const overlapCount = Math.max(0, ...item.signals.co_used_with.map((related) => related.count || 0));
  const evidenceValue = { weak: 0, medium: 15, strong: 25 }[item.evidence_grade] ?? 0;
  const contextValue = { low: 0, medium: 5, high: 10, unknown: 0 }[item.signals.context_cost] ?? 0;
  const recommendationValue = {
    keep: 0,
    observe: 5,
    merge_candidate: 15,
    weave: 25,
    frog_candidate: 30
  }[item.recommendation] ?? 0;

  if (evidenceValue) {
    factors.push(scoreFactor('evidence', evidenceValue, `${item.evidence_grade} evidence`));
  }
  if (failuresAndBlocked) {
    factors.push(scoreFactor('trouble', Math.min(30, failuresAndBlocked * 15), `${failuresAndBlocked} failed or blocked signals`));
  }
  if (contextValue) {
    factors.push(scoreFactor('context_cost', contextValue, `${item.signals.context_cost} context cost`));
  }
  if (overlapCount >= 2) {
    factors.push(scoreFactor('overlap', Math.min(15, overlapCount * 5), `Repeated overlap count ${overlapCount}`));
  }
  if (recommendationValue) {
    factors.push(scoreFactor('recommendation', recommendationValue, `${item.recommendation} priority`));
  }

  return {
    total: Math.min(100, factors.reduce((sum, factor) => sum + factor.value, 0)),
    factors
  };
}

function daysBetween(fromDate, toDate) {
  if (!fromDate || !toDate) return null;
  const fromMs = Date.parse(fromDate);
  const toMs = Date.parse(toDate);
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs < fromMs) return null;
  return Math.floor((toMs - fromMs) / 86400000);
}

function addApprovalRequirement(item, value) {
  if (!item.approval_required_for.includes(value)) {
    item.approval_required_for.push(value);
  }
}

function applyLifecycleState(item, referenceDate) {
  const staleDays = daysBetween(item.signals.last_used, referenceDate);
  item.stale_days = staleDays;

  if (item.recommendation === 'frog_candidate') {
    item.lifecycle_state = 'cleanup_review';
    item.state_reason = 'Repeated trouble with high context cost needs a cleanup review, not automatic deletion.';
    return;
  }
  if (item.recommendation === 'weave') {
    item.lifecycle_state = 'needs_weave';
    item.state_reason = 'Repeated trouble suggests a small improvement review.';
    return;
  }
  if (item.recommendation === 'merge_candidate') {
    item.lifecycle_state = 'merge_review';
    item.state_reason = 'Repeated overlap suggests a merge review, not automatic merging.';
    return;
  }
  if (item.signals.uses === 0) {
    item.lifecycle_state = 'no_evidence';
    item.state_reason = 'No run records mention this harness. Missing records are not cleanup evidence.';
    return;
  }
  if (staleDays !== null && staleDays >= 30) {
    item.lifecycle_state = 'dormant_candidate';
    item.recommendation = 'observe';
    item.confidence = item.evidence_grade === 'weak' ? 'low' : 'medium';
    item.reason = 'This harness has not appeared in recent run records. Age alone is only a dormant review signal, not delete evidence.';
    item.state_reason = `Last seen ${staleDays} days before the latest indexed run.`;
    item.safe_next_action = 'Review whether to keep active or archive after explicit approval. Do not delete from age alone.';
    addApprovalRequirement(item, 'archive');
    return;
  }

  item.lifecycle_state = 'active';
  item.state_reason = 'Recent enough to keep in normal observation.';
}

function runOutcome(run) {
  if (run.blocked) return 'blocked';
  if (run.failed) return 'failed';
  if (run.completed) return 'success';
  return 'unknown';
}

function buildTimeline(runs, root) {
  return runs
    .map((run) => ({
      date: run.date,
      source: relativeRef(root, run.path),
      status: run.status,
      outcome: runOutcome(run),
      harnesses: run.harnesses
    }))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
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
  const sequenceUse = new Map();
  const ruleIndex = readJson(path.join(root, '.tink/rules/index.json'), {});
  const ruleRefs = Array.isArray(ruleIndex.nodes)
    ? ruleIndex.nodes.map((item) => item.id).filter(Boolean)
    : [];
  const memoryRefs = walkFiles(path.join(root, '.tink/memory'), '.md')
    .map((filePath) => relativeRef(root, filePath));
  const runPaths = listFiles(path.join(root, '.tink/runs'), '.md');
  const runs = runPaths.map((filePath) => parseRun(filePath, harnessIds, ruleRefs, memoryRefs));

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
      addSignalRefs(item, 'rule_refs', run.ruleRefs);
      addSignalRefs(item, 'memory_refs', run.memoryRefs);
      addEvidence(item, relativeRef(root, run.path));
      bumpCoUse(coUse, id, run.harnesses);
    }
    for (let index = 0; index < run.harnesses.length - 1; index += 1) {
      bumpSequence(sequenceUse, run.harnesses[index], run.harnesses[index + 1]);
    }
    if (run.completed && !run.failed && !run.blocked) {
      for (const id of run.harnesses) bumpSequence(sequenceUse, id, 'verify');
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
    item.signals.sequence_hints = [...(sequenceUse.get(id) || new Map()).entries()]
      .filter(([, count]) => count >= 2)
      .map(([after, count]) => ({ before: id, after, count }))
      .sort((a, b) => b.count - a.count || a.after.localeCompare(b.after));
    item.signals.rule_refs.sort();
    item.signals.memory_refs.sort();

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
  const referenceDate = datedRuns[datedRuns.length - 1] || null;
  for (const item of summaries.values()) {
    applyLifecycleState(item, referenceDate);
    item.candidate_score = scoreCandidate(item);
  }
  const harnessSummaries = [...summaries.values()].sort((a, b) => a.id.localeCompare(b.id));

  const ledgerPath = path.join(root, '.tink/maintenance/ledger.jsonl');
  const knownHarnessIds = [...summaries.keys()];
  const maintenanceEvents = parseJsonl(ledgerPath)
    .map((entry) => {
      const refs = [...(Array.isArray(entry.files) ? entry.files : []), ...(Array.isArray(entry.evidence) ? entry.evidence : []), String(entry.op_id || '')];
      const related = knownHarnessIds.filter((id) =>
        refs.some((ref) => String(ref).includes(`${id}.md`) || String(ref).includes(`harness:${id}`) || String(ref).includes(`-${id}-`))
      ).sort();
      return {
        timestamp: entry.timestamp || '',
        op_id: entry.op_id || '',
        type: entry.type || 'unknown',
        files: (Array.isArray(entry.files) ? entry.files : []).slice(0, 8),
        result: entry.result || 'unknown',
        approval: entry.approval || '',
        harnesses: related
      };
    })
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
    .slice(0, 60);

  return {
    generated_at: new Date().toISOString(),
    run_window: {
      from: datedRuns[0] || null,
      to: datedRuns[datedRuns.length - 1] || null,
      run_count: runs.length
    },
    sources: [
      '.tink/harnesses/index.json',
      '.tink/rules/index.json',
      '.tink/memory/*.md',
      '.tink/runs/*.md',
      '.tink/maintenance/weave-queue.json',
      '.tink/maintenance/friction.jsonl',
      '.tink/maintenance/ledger.jsonl'
    ],
    harnesses: harnessSummaries,
    graph: buildGraph(harnessSummaries),
    timeline: buildTimeline(runs, root),
    maintenance_events: maintenanceEvents
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
