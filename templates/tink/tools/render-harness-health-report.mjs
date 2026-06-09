#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_INPUT = '.tink/maintenance/harness-lifecycle.json';
const DEFAULT_OUTPUT = '.tink/maintenance/harness-health-report.html';

const inputPath = process.argv[2] || DEFAULT_INPUT;
const outputPath = process.argv[3] || DEFAULT_OUTPUT;

const TYPE_COLORS = {
  harness: '#53f2b8',
  rule: '#7fb1ff',
  memory: '#f7ba55',
  stage: '#b995ff',
  signal: '#35d7e8',
  evidence: '#f7ba55',
  score: '#ff6f9d',
  unknown: '#f05d8e'
};

const REC_COLORS = {
  keep: '#53f2b8',
  weave: '#f7ba55',
  frog_candidate: '#ff6f7d',
  merge_candidate: '#9a85ff',
  observe: '#7fb1ff',
  unknown: '#9aa7b7'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
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

function countByField(items, field) {
  const counts = new Map();
  for (const item of items) {
    const key = item[field] || 'unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function normalizePath(value) {
  return String(value || '').replaceAll('\\\\', '/').replaceAll('\\', '/');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function recommendationClass(value) {
  return String(value || 'unknown').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
}

function shortLabel(id) {
  const value = String(id || 'unknown');
  return value
    .replace(/^harness:/, '')
    .replace(/^rule:/, '')
    .replace(/^memory:\.tink\/memory\//, '')
    .replace(/^stage:/, '')
    .replace(/\.md$/, '');
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

function renderEvidence(handles = []) {
  if (!handles.length) return '<li>No evidence handle yet.</li>';
  return handles
    .slice(0, 8)
    .map((handle) => `<li><code>${escapeHtml(normalizePath(handle))}</code></li>`)
    .join('');
}

function renderRelated(items = []) {
  if (!items.length) return 'None';
  return items
    .slice(0, 4)
    .map((item) => `${escapeHtml(item.id)} (${escapeHtml(item.count)})`)
    .join(', ');
}

function graphStats(graph = {}) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  return {
    nodes,
    edges,
    nodeCounts: countByField(nodes, 'type'),
    edgeCounts: countByField(edges, 'type')
  };
}

function buildGraphLayout(summary) {
  const graph = summary.graph || {};
  const harnesses = Array.isArray(summary.harnesses) ? summary.harnesses : [];
  const harnessById = new Map(harnesses.map((item) => [item.id, item]));
  const nodes = Array.isArray(graph.nodes) && graph.nodes.length
    ? graph.nodes
    : harnesses.map((item) => ({
      id: `harness:${item.id}`,
      type: 'harness',
      label: item.id,
      weight: item.signals?.uses || 1,
      candidate_score: item.candidate_score?.total || 0
    }));
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  const maxWeight = Math.max(1, ...nodes.map((node) => Number(node.weight || 1)));
  const anchors = {
    harness: { x: 555, y: 330, rx: 255, ry: 190 },
    rule: { x: 760, y: 180, rx: 180, ry: 115 },
    memory: { x: 305, y: 515, rx: 155, ry: 115 },
    stage: { x: 760, y: 520, rx: 145, ry: 92 },
    unknown: { x: 520, y: 360, rx: 290, ry: 205 }
  };

  const positioned = nodes.slice(0, 140).map((node, index) => {
    const type = node.type || 'unknown';
    const anchor = anchors[type] || anchors.unknown;
    const hash = hashString(node.id);
    const angle = ((hash % 6283) / 1000) + index * 0.24;
    const ring = 0.18 + ((hash >> 5) % 100) / 100;
    const x = clamp(anchor.x + Math.cos(angle) * anchor.rx * ring, 42, 1048);
    const y = clamp(anchor.y + Math.sin(angle) * anchor.ry * ring, 42, 638);
    const radius = clamp(4 + Math.sqrt(Number(node.weight || 1) / maxWeight) * 17, 5, 26);
    const score = Number(node.candidate_score || 0);
    return {
      ...node,
      id: String(node.id),
      type,
      label: node.label || shortLabel(node.id),
      x,
      y,
      radius,
      color: TYPE_COLORS[type] || TYPE_COLORS.unknown,
      glow: score >= 50 || radius >= 20
    };
  });
  const augmented = [...positioned];
  const virtualEdges = [];
  for (const node of positioned.filter((item) => item.type === 'harness')) {
    const harnessId = shortLabel(node.id);
    const harness = harnessById.get(harnessId);
    if (!harness) continue;
    const uses = Number(harness.signals?.uses || 0);
    const evidenceCount = (harness.evidence_handles || []).length;
    const factorCount = (harness.candidate_score?.factors || []).length;
    const satellites = [
      ...Array.from({ length: Math.min(14, Math.ceil(uses / 2)) }, (_, index) => ({ kind: 'signal', index, total: Math.min(14, Math.ceil(uses / 2)), radius: 2.8 + Math.min(3.5, uses / 12) })),
      ...Array.from({ length: Math.min(6, evidenceCount) }, (_, index) => ({ kind: 'evidence', index, total: Math.min(6, evidenceCount), radius: 3.5 })),
      ...Array.from({ length: Math.min(5, factorCount) }, (_, index) => ({ kind: 'score', index, total: Math.min(5, factorCount), radius: 3.8 }))
    ];
    satellites.forEach((satellite, offset) => {
      const seed = hashString(`${node.id}:${satellite.kind}:${satellite.index}`);
      const angle = ((seed % 6283) / 1000) + offset * 0.45;
      const distance = node.radius + 24 + (seed % 42);
      const child = {
        id: `${satellite.kind}:${harnessId}:${satellite.index}`,
        type: satellite.kind,
        label: satellite.kind,
        weight: 1,
        x: clamp(node.x + Math.cos(angle) * distance, 25, 1065),
        y: clamp(node.y + Math.sin(angle) * distance, 25, 655),
        radius: satellite.radius,
        color: TYPE_COLORS[satellite.kind] || TYPE_COLORS.unknown,
        glow: satellite.kind === 'score'
      };
      augmented.push(child);
      virtualEdges.push({
        source: node.id,
        target: child.id,
        type: satellite.kind,
        count: 1
      });
    });
  }
  const byId = new Map(augmented.map((node) => [node.id, node]));
  const drawnEdges = [...edges, ...virtualEdges]
    .map((edge) => ({
      ...edge,
      sourceNode: byId.get(edge.source),
      targetNode: byId.get(edge.target)
    }))
    .filter((edge) => edge.sourceNode && edge.targetNode)
    .slice(0, 240);

  return { nodes: augmented, edges: drawnEdges };
}

function renderGraphCanvas(summary) {
  const { nodes, edges } = buildGraphLayout(summary);
  const strongest = nodes
    .filter((node) => node.type === 'harness')
    .sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0))
    .slice(0, 8);
  return `
    <section class="map-panel" aria-labelledby="map-title">
      <div class="map-head">
        <div>
          <p class="eyebrow">HARNESS MAP</p>
          <h2 id="map-title">Knowledge Graph</h2>
          <p>Harnesses, rules, memory, and stages are mapped from visible Tink records. Click a node to inspect it.</p>
        </div>
        <div class="map-controls" aria-label="Graph controls">
          <button class="active" type="button">Full</button>
          <button type="button">Core</button>
          <button type="button">Pause</button>
        </div>
      </div>
      <svg class="graph-canvas" viewBox="0 0 1090 680" role="img" aria-label="Harness health graph">
        <defs>
          <radialGradient id="canvasGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stop-color="#10211e"/>
            <stop offset="60%" stop-color="#020707"/>
            <stop offset="100%" stop-color="#000"/>
          </radialGradient>
          <filter id="nodeGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="1090" height="680" rx="18" fill="url(#canvasGlow)"/>
        <g class="edges">
          ${edges.map((edge) => `
            <line
              x1="${edge.sourceNode.x.toFixed(1)}"
              y1="${edge.sourceNode.y.toFixed(1)}"
              x2="${edge.targetNode.x.toFixed(1)}"
              y2="${edge.targetNode.y.toFixed(1)}"
              stroke="${escapeAttr(edge.sourceNode.color)}"
              stroke-opacity="${edge.type === 'co_used' ? '0.18' : '0.12'}"
              stroke-width="${clamp(Number(edge.count || 1), 1, 5)}"
            />
          `).join('')}
        </g>
        <g class="nodes">
          ${nodes.map((node) => `
            <circle
              class="graph-node"
              data-node-id="${escapeAttr(node.id)}"
              data-node-type="${escapeAttr(node.type)}"
              data-node-label="${escapeAttr(node.label)}"
              data-node-weight="${escapeAttr(node.weight || 0)}"
              cx="${node.x.toFixed(1)}"
              cy="${node.y.toFixed(1)}"
              r="${node.radius.toFixed(1)}"
              fill="${escapeAttr(node.color)}"
              fill-opacity="${node.type === 'harness' ? '0.96' : '0.82'}"
              stroke="#f7fffb"
              stroke-opacity="${node.glow ? '0.9' : '0.18'}"
              stroke-width="${node.glow ? '1.8' : '0.8'}"
              filter="${node.glow ? 'url(#nodeGlow)' : ''}"
            >
              <title>${escapeHtml(node.id)}</title>
            </circle>
          `).join('')}
        </g>
        <g class="labels">
          ${strongest.map((node) => `
            <text x="${(node.x + node.radius + 7).toFixed(1)}" y="${(node.y + 4).toFixed(1)}">${escapeHtml(node.label)}</text>
          `).join('')}
        </g>
      </svg>
      <div class="map-caption">
        <span>node size = usage</span>
        <span>color = type</span>
        <span>lines = relationships</span>
      </div>
    </section>
  `;
}

function renderProjectCards(harnesses) {
  const groups = [
    ['keep', 'Healthy harnesses', 'Ready to keep using'],
    ['weave', 'Weave candidates', 'Worth improving next'],
    ['frog_candidate', 'Cleanup review', 'Needs explicit approval'],
    ['merge_candidate', 'Merge review', 'Overlap to inspect'],
    ['observe', 'Observation pool', 'Needs more evidence']
  ];
  const counts = new Map(countByRecommendation(harnesses));
  return `
    <section class="project-strip" aria-label="Health groups">
      ${groups.map(([key, title, hint]) => `
        <article class="project-card ${recommendationClass(key)}">
          <span class="project-bar"></span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(hint)}</p>
          <strong>${escapeHtml(counts.get(key) || 0)}</strong>
        </article>
      `).join('')}
    </section>
  `;
}

function renderTimeline(events = []) {
  const items = events.slice(0, 8);
  return `
    <section class="timeline">
      <div class="panel-title">
        <p class="eyebrow">RECENT RUNS</p>
        <h2>Recent run timeline</h2>
      </div>
      <ol>
        ${items.map((event) => `
          <li>
            <span class="dot ${recommendationClass(event.outcome || 'unknown')}"></span>
            <div>
              <strong>${escapeHtml(event.outcome || 'unknown')}</strong>
              <p>${escapeHtml((event.harnesses || []).join(', ') || 'No harness recorded')}</p>
              <code>${escapeHtml(normalizePath(event.source))}</code>
            </div>
          </li>
        `).join('') || '<li><span class="dot observe"></span><div><strong>No run events found.</strong><p>Run records will appear here.</p></div></li>'}
      </ol>
    </section>
  `;
}

function renderStats(summary) {
  const harnesses = Array.isArray(summary.harnesses) ? summary.harnesses : [];
  const graph = graphStats(summary.graph || {});
  const active = harnesses.filter((item) => item.lifecycle_state === 'active').length;
  const checks = harnesses.reduce((sum, item) => sum + Number(item.signals?.uses || 0), 0);
  return `
    <section class="stats-grid">
      <article><span>Harnesses</span><strong>${formatNumber(harnesses.length)}</strong><small>tracked</small></article>
      <article><span>Nodes</span><strong>${formatNumber(graph.nodes.length)}</strong><small>graph items</small></article>
      <article><span>Links</span><strong>${formatNumber(graph.edges.length)}</strong><small>relations</small></article>
      <article><span>Active</span><strong>${formatNumber(active)}</strong><small>recent state</small></article>
      <article><span>Uses</span><strong>${formatNumber(checks)}</strong><small>visible records</small></article>
    </section>
  `;
}

function renderConfidence(summary) {
  const harnesses = Array.isArray(summary.harnesses) ? summary.harnesses : [];
  const withEvidence = harnesses.filter((item) => (item.evidence_handles || []).length > 0).length;
  const confidence = harnesses.length ? Math.round((withEvidence / harnesses.length) * 100) : 0;
  return `
    <section class="insight-card confidence">
      <div class="panel-title">
        <p class="eyebrow">MAP CONFIDENCE</p>
        <h2>${confidence}%</h2>
      </div>
      <div class="meter"><span style="width: ${confidence}%"></span></div>
      <p><strong>${withEvidence}</strong> of <strong>${harnesses.length}</strong> harnesses have visible evidence handles. Lower confidence means observe before changing reusable state.</p>
    </section>
  `;
}

function renderImportantHarnesses(harnesses) {
  const ranked = harnesses
    .slice()
    .sort((a, b) => {
      const aScore = Number(a.signals?.uses || 0) * 3 + Number(a.candidate_score?.total || 0);
      const bScore = Number(b.signals?.uses || 0) * 3 + Number(b.candidate_score?.total || 0);
      return bScore - aScore;
    })
    .slice(0, 5);
  return `
    <section class="insight-card">
      <div class="panel-title">
        <p class="eyebrow">MOST IMPORTANT HARNESSES</p>
        <h2>Candidate score</h2>
      </div>
      <ol class="ranked">
        ${ranked.map((item, index) => {
          const score = Number(item.candidate_score?.total || 0);
          const width = clamp(score || Number(item.signals?.uses || 0) * 8, 8, 100);
          return `
            <li>
              <span>${index + 1}. ${escapeHtml(item.id)}</span>
              <strong>${escapeHtml(score)}</strong>
              <i style="width:${width}%"></i>
            </li>
          `;
        }).join('') || '<li><span>No harness evidence yet.</span><strong>0</strong><i></i></li>'}
      </ol>
    </section>
  `;
}

function renderCastRoutingRules() {
  const rules = [
    ['requirements-interview', 'Ambiguous scope or missing acceptance criteria'],
    ['plan-consensus', 'API, schema, contract, refactor, or tradeoff-heavy plans'],
    ['goal-checkpoint', 'Multi-file, multi-phase, resumed, or release-step work'],
    ['delegation-brief', 'Independent verification, PR handoff, agent, or human handoff']
  ];
  return `
    <section class="insight-card routing-card">
      <div class="panel-title">
        <p class="eyebrow">CAST ROUTING RULES</p>
        <h2>Visible-thinking overlays</h2>
      </div>
      <ol class="route-list">
        ${rules.map(([harness, trigger]) => `
          <li>
            <code>${escapeHtml(harness)}</code>
            <span>${escapeHtml(trigger)}</span>
          </li>
        `).join('')}
      </ol>
    </section>
  `;
}

function renderSelectedPanel(harnesses) {
  const first = harnesses.find((item) => item.signals?.uses > 0) || harnesses[0];
  if (!first) {
    return '<section class="insight-card selected"><p class="eyebrow">SELECTED</p><h2>No harness selected</h2><p>Click a node to inspect it.</p></section>';
  }
  return `
    <section class="insight-card selected" id="selected-panel">
      <p class="eyebrow">SELECTED</p>
      <h2>${escapeHtml(first.id)}</h2>
      <p>${escapeHtml(first.reason || 'Click a node to inspect it.')}</p>
      <dl>
        <div><dt>Recommendation</dt><dd>${escapeHtml(first.recommendation || 'unknown')}</dd></div>
        <div><dt>Lifecycle state</dt><dd>${escapeHtml(first.lifecycle_state || 'unknown')}</dd></div>
        <div><dt>Uses</dt><dd>${escapeHtml(first.signals?.uses || 0)}</dd></div>
        <div><dt>Score</dt><dd>${escapeHtml(first.candidate_score?.total || 0)}</dd></div>
      </dl>
    </section>
  `;
}

function renderHarness(item) {
  const signals = item.signals || {};
  const score = Number(item.candidate_score?.total || 0);
  return `
    <article class="harness-card ${recommendationClass(item.recommendation)}">
      <div>
        <p class="eyebrow">${escapeHtml(item.recommendation || 'unknown')}</p>
        <h3>${escapeHtml(item.id)}</h3>
      </div>
      <strong>${escapeHtml(score)}</strong>
      <p>${escapeHtml(item.reason)}</p>
      <dl>
        <div><dt>Lifecycle state</dt><dd>${escapeHtml(item.lifecycle_state || 'unknown')}</dd></div>
        <div><dt>Uses</dt><dd>${escapeHtml(signals.uses ?? 0)}</dd></div>
        <div><dt>Blocked</dt><dd>${escapeHtml(signals.blocked ?? 0)}</dd></div>
        <div><dt>Context</dt><dd>${escapeHtml(signals.context_cost || 'unknown')}</dd></div>
        <div><dt>With</dt><dd>${renderRelated(signals.co_used_with)}</dd></div>
      </dl>
      <details>
        <summary>Evidence handles</summary>
        <ul>${renderEvidence(item.evidence_handles)}</ul>
      </details>
    </article>
  `;
}

function renderGraphOverview(graph = {}) {
  const stats = graphStats(graph);
  return `
    <section class="insight-card graph-overview">
      <div class="panel-title">
        <p class="eyebrow">GRAPH OVERVIEW</p>
        <h2>Graph overview</h2>
      </div>
      <dl>
        <div><dt>Nodes</dt><dd>${escapeHtml(stats.nodes.length)}</dd></div>
        <div><dt>Edges</dt><dd>${escapeHtml(stats.edges.length)}</dd></div>
        <div><dt>Node types</dt><dd>${stats.nodeCounts.map(([key, value]) => `${escapeHtml(key)} (${escapeHtml(value)})`).join(', ') || 'None'}</dd></div>
        <div><dt>Edge types</dt><dd>${stats.edgeCounts.map(([key, value]) => `${escapeHtml(key)} (${escapeHtml(value)})`).join(', ') || 'None'}</dd></div>
      </dl>
      <p class="edge-sample">${stats.edges.slice(0, 6).map((edge) => `<code>${escapeHtml(edge.type)}</code>`).join(' ') || '<code>none</code>'}</p>
    </section>
  `;
}

function renderScript(harnesses) {
  const payload = JSON.stringify(harnesses.map((item) => ({
    id: item.id,
    reason: item.reason,
    recommendation: item.recommendation,
    lifecycle_state: item.lifecycle_state,
    uses: item.signals?.uses || 0,
    score: item.candidate_score?.total || 0
  }))).replaceAll('<', '\\u003c');
  return `
    <script>
      const harnessData = ${payload};
      const byHarnessId = new Map(harnessData.map((item) => ['harness:' + item.id, item]));
      const selectedPanel = document.getElementById('selected-panel');
      const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]);
      document.querySelectorAll('.graph-node').forEach((node) => {
        node.addEventListener('click', () => {
          document.querySelectorAll('.graph-node.is-selected').forEach((item) => item.classList.remove('is-selected'));
          node.classList.add('is-selected');
          const id = node.dataset.nodeId;
          const item = byHarnessId.get(id);
          if (selectedPanel && item) {
            selectedPanel.innerHTML = '<p class="eyebrow">SELECTED</p>' +
              '<h2>' + esc(item.id) + '</h2>' +
              '<p>' + esc(item.reason) + '</p>' +
              '<dl>' +
              '<div><dt>Recommendation</dt><dd>' + esc(item.recommendation) + '</dd></div>' +
              '<div><dt>Lifecycle state</dt><dd>' + esc(item.lifecycle_state) + '</dd></div>' +
              '<div><dt>Uses</dt><dd>' + esc(item.uses) + '</dd></div>' +
              '<div><dt>Score</dt><dd>' + esc(item.score) + '</dd></div>' +
              '</dl>';
          } else if (selectedPanel) {
            selectedPanel.innerHTML = '<p class="eyebrow">SELECTED</p><h2>' + esc(node.dataset.nodeLabel) + '</h2><p>' + esc(id) + '</p><dl><div><dt>Type</dt><dd>' + esc(node.dataset.nodeType) + '</dd></div><div><dt>Weight</dt><dd>' + esc(node.dataset.nodeWeight) + '</dd></div></dl>';
          }
        });
      });
    </script>
  `;
}

function renderStyles() {
  return `
  <style>
    :root {
      color-scheme: dark;
      --bg: #06090d;
      --rail: #0d1118;
      --panel: #111821;
      --panel-2: #151d27;
      --panel-3: #0b1017;
      --line: #22303b;
      --line-soft: rgba(120, 244, 204, 0.16);
      --text: #e8f0f2;
      --muted: #8e9aa7;
      --faint: #5f6c78;
      --green: #53f2b8;
      --cyan: #75d7ff;
      --blue: #7fb1ff;
      --gold: #f7ba55;
      --red: #ff6f7d;
      --violet: #9a85ff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at 82% 12%, rgba(83, 242, 184, .13), transparent 30%),
        radial-gradient(circle at 48% 100%, rgba(42, 79, 224, .18), transparent 32%),
        var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }
    .app-shell {
      display: grid;
      grid-template-columns: 248px minmax(780px, 1fr) 330px;
      min-height: 100vh;
    }
    .sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      border-right: 1px solid var(--line);
      background: linear-gradient(180deg, #111721, #0a0e14);
      padding: 22px 16px;
    }
    .brand {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 30px;
    }
    .brand-mark {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: linear-gradient(135deg, #f07c4e, #ffe075);
      color: #33160b;
      font-weight: 900;
      box-shadow: 0 0 28px rgba(240, 124, 78, .35);
    }
    .brand strong, .topbar strong { display: block; font-size: 14px; }
    .brand span, .topbar span { color: var(--muted); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; }
    .nav { display: grid; gap: 8px; margin-bottom: 28px; }
    .nav a {
      color: var(--muted);
      text-decoration: none;
      padding: 11px 12px;
      border-radius: 7px;
      font-size: 14px;
    }
    .nav a.active {
      color: var(--text);
      background: rgba(126, 148, 168, .13);
      box-shadow: inset 3px 0 0 var(--green);
    }
    .agent-plate {
      margin-top: 24px;
      padding: 16px;
      border: 1px solid var(--line);
      background: linear-gradient(135deg, rgba(83, 242, 184, .08), rgba(247, 186, 85, .07));
      border-radius: 8px;
    }
    .agent-plate span { color: var(--gold); font-weight: 800; letter-spacing: .08em; }
    .main {
      min-width: 0;
      padding: 0 28px 28px;
    }
    .topbar {
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--line);
      margin: 0 -28px 0;
      padding: 0 28px;
      background: rgba(6, 9, 13, .7);
      backdrop-filter: blur(16px);
    }
    .status {
      display: flex;
      align-items: center;
      gap: 9px;
      border: 1px solid var(--line);
      background: var(--panel-3);
      padding: 8px 10px;
      border-radius: 7px;
      color: var(--muted);
      font-size: 12px;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .status i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 14px var(--green);
    }
    .hero {
      padding: 30px 0 20px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
    }
    .hero h1 { margin: 0 0 8px; font-size: 27px; line-height: 1.12; }
    .hero p { margin: 0; color: var(--muted); max-width: 760px; line-height: 1.5; }
    .eyebrow {
      margin: 0 0 7px;
      color: var(--faint);
      font-size: 11px;
      letter-spacing: .18em;
      text-transform: uppercase;
      font-weight: 750;
    }
    .project-strip {
      display: grid;
      grid-template-columns: repeat(5, minmax(150px, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }
    .project-card {
      position: relative;
      min-height: 95px;
      padding: 16px 14px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(23, 31, 42, .92), rgba(13, 18, 26, .92));
      border-radius: 8px;
      overflow: hidden;
    }
    .project-bar {
      position: absolute;
      inset: 0 0 auto 0;
      height: 3px;
      background: var(--green);
    }
    .project-card.weave .project-bar { background: var(--gold); }
    .project-card.frog_candidate .project-bar { background: var(--red); }
    .project-card.merge_candidate .project-bar { background: var(--violet); }
    .project-card.observe .project-bar { background: var(--blue); }
    .project-card h3 { margin: 8px 0 5px; font-size: 14px; }
    .project-card p { margin: 0; color: var(--muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .project-card strong { position: absolute; right: 14px; bottom: 12px; font-size: 18px; }
    .content-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 18px;
    }
    .map-panel, .timeline, .harness-card, .insight-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(13, 18, 26, .86);
      box-shadow: 0 20px 60px rgba(0, 0, 0, .22);
    }
    .map-panel { overflow: hidden; }
    .map-head {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      padding: 16px 18px 10px;
    }
    .map-head h2, .panel-title h2, .insight-card h2 { margin: 0; font-size: 18px; }
    .map-head p:not(.eyebrow), .insight-card p, .timeline p { margin: 5px 0 0; color: var(--muted); font-size: 13px; line-height: 1.45; }
    .map-controls {
      display: flex;
      height: 32px;
      border: 1px solid rgba(255,255,255,.06);
      background: #080c12;
      border-radius: 7px;
      padding: 2px;
    }
    .map-controls button {
      border: 0;
      background: transparent;
      color: var(--faint);
      padding: 0 12px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .map-controls button.active { background: rgba(83, 242, 184, .14); color: var(--green); }
    .graph-canvas {
      display: block;
      width: 100%;
      aspect-ratio: 1090 / 680;
      border-top: 1px solid rgba(255,255,255,.04);
      border-bottom: 1px solid rgba(255,255,255,.04);
      background: #000;
    }
    .graph-canvas text {
      fill: rgba(232,240,242,.74);
      font-size: 12px;
      font-weight: 650;
      paint-order: stroke;
      stroke: rgba(0,0,0,.82);
      stroke-width: 4px;
    }
    .graph-node { cursor: pointer; transition: opacity .15s ease, transform .15s ease; transform-box: fill-box; transform-origin: center; }
    .graph-node:hover, .graph-node.is-selected { opacity: 1; transform: scale(1.22); }
    .map-caption {
      display: flex;
      gap: 18px;
      padding: 9px 16px 12px;
      color: var(--faint);
      font-size: 12px;
    }
    .right-rail {
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: auto;
      border-left: 1px solid var(--line);
      background: rgba(9, 13, 19, .78);
      padding: 74px 18px 22px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }
    .stats-grid article, .insight-card {
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(24, 33, 44, .92), rgba(13, 18, 26, .92));
      border-radius: 8px;
      padding: 14px;
    }
    .stats-grid span, .stats-grid small, dt {
      display: block;
      color: var(--faint);
      font-size: 11px;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .stats-grid strong { display: block; margin-top: 6px; font-size: 23px; }
    .insight-card { margin-bottom: 14px; }
    .meter {
      height: 10px;
      background: #0a1116;
      border: 1px solid var(--line);
      border-radius: 999px;
      overflow: hidden;
      margin: 13px 0;
    }
    .meter span { display: block; height: 100%; background: linear-gradient(90deg, var(--green), #67d7ff); box-shadow: 0 0 18px rgba(83,242,184,.4); }
    .ranked { margin: 10px 0 0; padding: 0; list-style: none; display: grid; gap: 12px; }
    .ranked li { position: relative; padding-bottom: 8px; color: var(--muted); font-size: 13px; }
    .ranked span { display: block; padding-right: 38px; color: var(--text); font-weight: 650; }
    .ranked strong { position: absolute; right: 0; top: 0; color: var(--muted); }
    .ranked i { position: absolute; left: 0; bottom: 0; height: 3px; background: linear-gradient(90deg, var(--green), transparent); border-radius: 999px; }
    .route-list { margin: 12px 0 0; padding: 0; list-style: none; display: grid; gap: 10px; }
    .route-list li {
      display: grid;
      gap: 6px;
      padding: 10px;
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 7px;
      background: rgba(255,255,255,.03);
    }
    .route-list span { color: var(--muted); font-size: 12px; line-height: 1.35; }
    .timeline { padding: 16px; }
    .timeline ol { margin: 12px 0 0; padding: 0; list-style: none; display: grid; gap: 11px; }
    .timeline li { display: grid; grid-template-columns: 10px 1fr; gap: 10px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--blue); margin-top: 6px; box-shadow: 0 0 14px currentColor; }
    .dot.success, .dot.keep { background: var(--green); }
    .dot.blocked, .dot.weave { background: var(--gold); }
    .dot.failed, .dot.frog_candidate { background: var(--red); }
    .timeline strong { font-size: 13px; }
    code {
      display: inline-block;
      max-width: 100%;
      color: #bdd0da;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.05);
      padding: 2px 5px;
      border-radius: 5px;
      font-size: 11px;
      overflow-wrap: anywhere;
    }
    .harness-section { margin-top: 18px; }
    .harness-section h2 { margin: 0 0 13px; font-size: 18px; }
    .harness-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }
    .harness-card { padding: 15px; border-top: 3px solid var(--blue); }
    .harness-card.keep { border-top-color: var(--green); }
    .harness-card.weave { border-top-color: var(--gold); }
    .harness-card.frog_candidate { border-top-color: var(--red); }
    .harness-card.merge_candidate { border-top-color: var(--violet); }
    .harness-card > div:first-child {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 12px;
    }
    .harness-card h3 { margin: 0 0 8px; font-size: 16px; }
    .harness-card > strong { float: right; font-size: 24px; margin-left: 12px; }
    .harness-card p { clear: both; color: var(--muted); font-size: 13px; line-height: 1.45; }
    .harness-card dl, .selected dl, .graph-overview dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 9px;
      margin: 12px 0 0;
    }
    dd { margin: 3px 0 0; color: var(--text); font-weight: 700; overflow-wrap: anywhere; }
    details { margin-top: 12px; color: var(--muted); }
    summary { cursor: pointer; font-size: 13px; color: var(--text); }
    details ul { margin: 8px 0 0; padding-left: 18px; }
    .edge-sample { display: flex; gap: 6px; flex-wrap: wrap; }
    @media (max-width: 1180px) {
      .app-shell { grid-template-columns: 74px minmax(0, 1fr); }
      .sidebar { padding: 14px 10px; }
      .brand div, .nav span, .agent-plate { display: none; }
      .nav a { text-align: center; }
      .right-rail { position: static; grid-column: 2; height: auto; border-left: 0; border-top: 1px solid var(--line); padding: 18px 28px 28px; }
      .project-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 760px) {
      .app-shell { display: block; }
      .sidebar { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--line); }
      .nav { grid-template-columns: repeat(3, 1fr); }
      .main { padding: 0 16px 20px; }
      .topbar { margin: 0 -16px; padding: 0 16px; }
      .hero { display: block; }
      .project-strip, .harness-grid, .stats-grid { grid-template-columns: 1fr; }
      .map-head { display: block; }
      .map-controls { margin-top: 12px; width: max-content; }
      .right-rail { padding: 18px 16px; }
    }
  </style>`;
}

function renderReport(summary) {
  const harnesses = Array.isArray(summary.harnesses) ? summary.harnesses : [];
  const generatedAt = summary.generated_at || new Date().toISOString();
  const runWindow = summary.run_window || {};
  const counts = countByRecommendation(harnesses);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tink Harness Health Summary</title>
  ${renderStyles()}
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar" aria-label="Navigation">
      <div class="brand">
        <span class="brand-mark">T</span>
        <div>
          <strong>Tink Harness</strong>
          <span>Operator</span>
        </div>
      </div>
      <nav class="nav">
        <a href="#"><span>Home</span></a>
        <a href="#"><span>Harnesses</span></a>
        <a href="#"><span>Memory</span></a>
        <a class="active" href="#"><span>Knowledge Graph</span></a>
        <a href="#"><span>Activity</span></a>
      </nav>
      <div class="agent-plate">
        <p class="eyebrow">AGENT</p>
        <span>HERMES-AGENT</span>
      </div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div><strong>Operator</strong><span>local</span></div>
        <div class="status"><i></i> Tink Online</div>
      </header>
      <section class="hero">
        <div>
          <p class="eyebrow">LOCAL HARNESS HEALTH</p>
          <h1>Knowledge Graph</h1>
          <p>Every visible Tink run, rule, memory reference, and harness relationship mapped into one local dashboard. This report only prepares suggestions and never edits reusable state.</p>
        </div>
        <div>
          <p class="eyebrow">GENERATED</p>
          <p>${escapeHtml(generatedAt)}</p>
        </div>
      </section>
      ${renderProjectCards(harnesses)}
      <section class="content-grid">
        ${renderGraphCanvas(summary)}
        ${renderTimeline(summary.timeline || [])}
        <section class="harness-section">
          <h2>Harness cards</h2>
          <div class="harness-grid">
            ${harnesses.map(renderHarness).join('\n')}
          </div>
        </section>
      </section>
    </main>
    <aside class="right-rail" aria-label="Insights">
      ${renderStats(summary)}
      ${renderConfidence(summary)}
      ${renderGraphOverview(summary.graph || {})}
      ${renderImportantHarnesses(harnesses)}
      ${renderCastRoutingRules()}
      <section class="insight-card">
        <div class="panel-title">
          <p class="eyebrow">RECOMMENDATIONS</p>
          <h2>Current mix</h2>
        </div>
        <p>${counts.map(([key, value]) => `<strong>${escapeHtml(key)}</strong>: ${escapeHtml(value)}`).join(' | ') || 'No recommendations yet.'}</p>
      </section>
      ${renderSelectedPanel(harnesses)}
      <section class="insight-card">
        <p class="eyebrow">SOURCES</p>
        <p>${(summary.sources || []).map((source) => `<code>${escapeHtml(source)}</code>`).join(' ')}</p>
        <p>Run count: <strong>${escapeHtml(runWindow.run_count ?? 0)}</strong></p>
      </section>
    </aside>
  </div>
  ${renderScript(harnesses)}
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
