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

const COPY = {
  en: {
    htmlLang: 'en',
    title: 'Tink Harness Health Summary',
    navLabel: 'Navigation',
    operator: 'Operator',
    online: 'Tink Online',
    localHealth: 'LOCAL HARNESS HEALTH',
    knowledgeGraph: 'Knowledge Graph',
    heroText: 'Every visible Tink run, rule, memory reference, and harness relationship mapped into one local dashboard. This report only prepares suggestions and never edits reusable state.',
    generated: 'GENERATED',
    harnessMap: 'HARNESS MAP',
    mapHelp: 'Harnesses, rules, memory, and stages are mapped from visible Tink records. Click a node to inspect it.',
    graphControls: 'Graph controls',
    full: 'Full',
    core: 'Core',
    pause: 'Pause',
    nodeSize: 'node size = usage',
    colorType: 'color = type',
    linesRelations: 'lines = relationships',
    recentRuns: 'RECENT RUNS',
    timeline: 'Recent run timeline',
    noRunEvents: 'No run events found.',
    runRecordsWillAppear: 'Run records will appear here.',
    noHarnessRecorded: 'No harness recorded',
    harnessCards: 'Harness cards',
    harnesses: 'Harnesses',
    tracked: 'tracked',
    nodes: 'Nodes',
    graphItems: 'graph items',
    links: 'Links',
    relations: 'relations',
    active: 'Active',
    recentState: 'recent state',
    uses: 'Uses',
    visibleRecords: 'visible records',
    mapConfidence: 'MAP CONFIDENCE',
    confidenceText: 'of harnesses have visible evidence handles. Lower confidence means observe before changing reusable state.',
    importantHarnesses: 'MOST IMPORTANT HARNESSES',
    candidateScore: 'Candidate score',
    noHarnessEvidence: 'No harness evidence yet.',
    castRoutingRules: 'CAST ROUTING RULES',
    visibleThinking: 'Visible-thinking overlays',
    selected: 'SELECTED',
    noHarnessSelected: 'No harness selected',
    clickNode: 'Click a node to inspect it.',
    recommendation: 'Recommendation',
    lifecycleState: 'Lifecycle state',
    score: 'Score',
    blocked: 'Blocked',
    context: 'Context',
    with: 'With',
    evidenceHandles: 'Evidence handles',
    graphOverview: 'Graph overview',
    nodeTypes: 'Node types',
    edgeTypes: 'Edge types',
    none: 'None',
    type: 'Type',
    weight: 'Weight',
    recommendations: 'RECOMMENDATIONS',
    currentMix: 'Current mix',
    noRecommendations: 'No recommendations yet.',
    sources: 'SOURCES',
    runCount: 'Run count',
    tooltipPrefix: 'Click to inspect',
    filteredTo: 'Filtered to',
    showingAll: 'Showing all graph nodes',
    coreMode: 'Core graph only',
    pauseOn: 'Motion paused',
    pauseOff: 'Motion enabled',
    groups: [
      ['keep', 'Healthy harnesses', 'Ready to keep using'],
      ['weave', 'Weave candidates', 'Worth improving next'],
      ['frog_candidate', 'Cleanup review', 'Needs explicit approval'],
      ['merge_candidate', 'Merge review', 'Overlap to inspect'],
      ['observe', 'Observation pool', 'Needs more evidence']
    ],
    routeRules: [
      ['requirements-interview', 'Ambiguous scope or missing acceptance criteria'],
      ['plan-consensus', 'API, schema, contract, refactor, or tradeoff-heavy plans'],
      ['goal-checkpoint', 'Multi-file, multi-phase, resumed, or release-step work'],
      ['delegation-brief', 'Independent verification, PR handoff, agent, or human handoff']
    ]
  },
  ko: {
    htmlLang: 'ko',
    title: 'Tink 하네스 건강 요약',
    navLabel: '탐색',
    operator: '작업자',
    online: 'Tink 온라인',
    localHealth: '로컬 하네스 건강',
    knowledgeGraph: 'Knowledge Graph',
    heroText: '보이는 Tink run, rule, memory reference, harness 관계를 하나의 로컬 대시보드로 보여줍니다. 이 보고서는 제안만 준비하며 재사용 상태를 직접 수정하지 않습니다.',
    generated: '생성 시각',
    harnessMap: '하네스 지도',
    mapHelp: '보이는 Tink 기록에서 하네스, rule, memory, stage 관계를 그립니다. 노드를 클릭하면 자세히 볼 수 있습니다.',
    graphControls: '그래프 조작',
    full: '전체',
    core: '핵심',
    pause: '정지',
    nodeSize: '노드 크기 = 사용량',
    colorType: '색상 = type',
    linesRelations: '선 = 관계',
    recentRuns: '최근 run',
    timeline: '최근 run 타임라인',
    noRunEvents: '아직 run 이벤트가 없습니다.',
    runRecordsWillAppear: 'run 기록이 생기면 여기에 표시됩니다.',
    noHarnessRecorded: '기록된 하네스 없음',
    harnessCards: '하네스 카드',
    harnesses: '하네스',
    tracked: '추적 중',
    nodes: '노드',
    graphItems: '그래프 항목',
    links: '링크',
    relations: '관계',
    active: '활성',
    recentState: '최근 상태',
    uses: '사용',
    visibleRecords: '보이는 기록',
    mapConfidence: '지도 신뢰도',
    confidenceText: '개 하네스에 보이는 evidence handle이 있습니다. 신뢰도가 낮으면 재사용 상태를 바꾸기 전에 관찰이 필요합니다.',
    importantHarnesses: '중요 하네스',
    candidateScore: '후보 점수',
    noHarnessEvidence: '아직 하네스 evidence가 없습니다.',
    castRoutingRules: 'CAST 선택 규칙',
    visibleThinking: '생각 보조 overlay',
    selected: '선택됨',
    noHarnessSelected: '선택된 하네스 없음',
    clickNode: '노드를 클릭하면 자세히 볼 수 있습니다.',
    recommendation: '추천',
    lifecycleState: '생애주기 상태',
    score: '점수',
    blocked: '막힘',
    context: '컨텍스트',
    with: '함께 사용',
    evidenceHandles: 'Evidence handles',
    graphOverview: '그래프 개요',
    nodeTypes: '노드 type',
    edgeTypes: 'edge type',
    none: '없음',
    type: 'Type',
    weight: 'Weight',
    recommendations: '추천 요약',
    currentMix: '현재 구성',
    noRecommendations: '아직 추천이 없습니다.',
    sources: '소스',
    runCount: 'Run 수',
    tooltipPrefix: '클릭해서 보기',
    filteredTo: '필터',
    showingAll: '전체 그래프 표시 중',
    coreMode: '핵심 그래프만 표시 중',
    pauseOn: '움직임 정지',
    pauseOff: '움직임 켜짐',
    groups: [
      ['keep', '건강한 하네스', '계속 사용해도 좋음'],
      ['weave', '개선 후보', '다음에 다듬을 만함'],
      ['frog_candidate', '정리 검토', '명시 승인 필요'],
      ['merge_candidate', '병합 검토', '겹침 확인 필요'],
      ['observe', '관찰 대상', '증거가 더 필요함']
    ],
    routeRules: [
      ['requirements-interview', '범위가 애매하거나 acceptance criteria가 빠졌을 때'],
      ['plan-consensus', 'API, schema, contract, 큰 리팩터링, tradeoff가 많은 계획일 때'],
      ['goal-checkpoint', 'multi-file, multi-phase, resumed thread, release steps일 때'],
      ['delegation-brief', '독립 검증, PR handoff, 다른 agent/human handoff가 필요할 때']
    ]
  }
};

COPY.zh = COPY.en;

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

function readConfiguredLanguage() {
  const configPath = path.resolve(process.cwd(), '.tink/config.json');
  if (!fs.existsSync(configPath)) return 'en';
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const language = config.language || 'en';
    if (language === 'auto') {
      const lang = String(process.env.LANG || '').toLowerCase();
      if (lang.startsWith('ko')) return 'ko';
      if (lang.startsWith('zh')) return 'zh';
      return 'en';
    }
    return COPY[language] ? language : 'en';
  } catch {
    return 'en';
  }
}

function reportCopy() {
  return COPY[readConfiguredLanguage()] || COPY.en;
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
    const harness = type === 'harness' ? harnessById.get(shortLabel(node.id)) : null;
    return {
      ...node,
      id: String(node.id),
      type,
      label: node.label || shortLabel(node.id),
      recommendation: harness?.recommendation || '',
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

function renderGraphCanvas(summary, copy) {
  const { nodes, edges } = buildGraphLayout(summary);
  const strongest = nodes
    .filter((node) => node.type === 'harness')
    .sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0))
    .slice(0, 8);
  return `
    <section class="map-panel" aria-labelledby="map-title">
      <div class="map-head">
        <div>
          <p class="eyebrow">${escapeHtml(copy.harnessMap)}</p>
          <h2 id="map-title">${escapeHtml(copy.knowledgeGraph)}</h2>
          <p>${escapeHtml(copy.mapHelp)}</p>
        </div>
        <div class="map-controls" aria-label="${escapeAttr(copy.graphControls)}">
          <button class="active" type="button" data-mode="full" aria-pressed="true">${escapeHtml(copy.full)}</button>
          <button type="button" data-mode="core" aria-pressed="false">${escapeHtml(copy.core)}</button>
          <button type="button" data-action="pause" aria-pressed="false">${escapeHtml(copy.pause)}</button>
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
              class="graph-edge"
              data-source="${escapeAttr(edge.source)}"
              data-target="${escapeAttr(edge.target)}"
              data-edge-type="${escapeAttr(edge.type)}"
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
              tabindex="0"
              role="button"
              aria-label="${escapeAttr(`${copy.tooltipPrefix}: ${node.label}`)}"
              data-node-id="${escapeAttr(node.id)}"
              data-node-type="${escapeAttr(node.type)}"
              data-node-label="${escapeAttr(node.label)}"
              data-node-weight="${escapeAttr(node.weight || 0)}"
              data-core="${node.type === 'harness' || node.type === 'rule' || Number(node.weight || 0) > 1 ? 'true' : 'false'}"
              data-recommendation="${escapeAttr(node.recommendation || '')}"
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
      <div class="graph-tooltip" id="graph-tooltip" role="status" aria-live="polite"></div>
      <div class="map-caption">
        <span id="graph-status">${escapeHtml(copy.showingAll)}</span>
        <span>${escapeHtml(copy.nodeSize)}</span>
        <span>${escapeHtml(copy.colorType)}</span>
        <span>${escapeHtml(copy.linesRelations)}</span>
      </div>
    </section>
  `;
}

function renderProjectCards(harnesses, copy) {
  const groups = copy.groups;
  const counts = new Map(countByRecommendation(harnesses));
  return `
    <section class="project-strip" aria-label="Health groups">
      ${groups.map(([key, title, hint]) => `
        <button class="project-card ${recommendationClass(key)}" type="button" data-filter-rec="${escapeAttr(key)}" aria-pressed="false">
          <span class="project-bar"></span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(hint)}</p>
          <strong>${escapeHtml(counts.get(key) || 0)}</strong>
        </button>
      `).join('')}
    </section>
  `;
}

function renderTimeline(events = [], copy) {
  const items = events.slice(0, 8);
  return `
    <section class="timeline">
      <div class="panel-title">
        <p class="eyebrow">${escapeHtml(copy.recentRuns)}</p>
        <h2>${escapeHtml(copy.timeline)}</h2>
      </div>
      <ol>
        ${items.map((event) => `
          <li>
            <span class="dot ${recommendationClass(event.outcome || 'unknown')}"></span>
            <div>
              <strong>${escapeHtml(event.outcome || 'unknown')}</strong>
              <p>${escapeHtml((event.harnesses || []).join(', ') || copy.noHarnessRecorded)}</p>
              <code>${escapeHtml(normalizePath(event.source))}</code>
            </div>
          </li>
        `).join('') || `<li><span class="dot observe"></span><div><strong>${escapeHtml(copy.noRunEvents)}</strong><p>${escapeHtml(copy.runRecordsWillAppear)}</p></div></li>`}
      </ol>
    </section>
  `;
}

function renderStats(summary, copy) {
  const harnesses = Array.isArray(summary.harnesses) ? summary.harnesses : [];
  const graph = graphStats(summary.graph || {});
  const active = harnesses.filter((item) => item.lifecycle_state === 'active').length;
  const checks = harnesses.reduce((sum, item) => sum + Number(item.signals?.uses || 0), 0);
  return `
    <section class="stats-grid">
      <article><span>${escapeHtml(copy.harnesses)}</span><strong>${formatNumber(harnesses.length)}</strong><small>${escapeHtml(copy.tracked)}</small></article>
      <article><span>${escapeHtml(copy.nodes)}</span><strong>${formatNumber(graph.nodes.length)}</strong><small>${escapeHtml(copy.graphItems)}</small></article>
      <article><span>${escapeHtml(copy.links)}</span><strong>${formatNumber(graph.edges.length)}</strong><small>${escapeHtml(copy.relations)}</small></article>
      <article><span>${escapeHtml(copy.active)}</span><strong>${formatNumber(active)}</strong><small>${escapeHtml(copy.recentState)}</small></article>
      <article><span>${escapeHtml(copy.uses)}</span><strong>${formatNumber(checks)}</strong><small>${escapeHtml(copy.visibleRecords)}</small></article>
    </section>
  `;
}

function renderConfidence(summary, copy) {
  const harnesses = Array.isArray(summary.harnesses) ? summary.harnesses : [];
  const withEvidence = harnesses.filter((item) => (item.evidence_handles || []).length > 0).length;
  const confidence = harnesses.length ? Math.round((withEvidence / harnesses.length) * 100) : 0;
  return `
    <section class="insight-card confidence">
      <div class="panel-title">
        <p class="eyebrow">${escapeHtml(copy.mapConfidence)}</p>
        <h2>${confidence}%</h2>
      </div>
      <div class="meter"><span style="width: ${confidence}%"></span></div>
      <p><strong>${withEvidence}</strong> / <strong>${harnesses.length}</strong> ${escapeHtml(copy.confidenceText)}</p>
    </section>
  `;
}

function renderImportantHarnesses(harnesses, copy) {
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
        <p class="eyebrow">${escapeHtml(copy.importantHarnesses)}</p>
        <h2>${escapeHtml(copy.candidateScore)}</h2>
      </div>
      <ol class="ranked">
        ${ranked.map((item, index) => {
          const score = Number(item.candidate_score?.total || 0);
          const width = clamp(score || Number(item.signals?.uses || 0) * 8, 8, 100);
          return `
            <li>
              <button class="ranked-button" type="button" data-select-harness="${escapeAttr(item.id)}">
                <span>${index + 1}. ${escapeHtml(item.id)}</span>
              </button>
              <strong>${escapeHtml(score)}</strong>
              <i style="width:${width}%"></i>
            </li>
          `;
        }).join('') || `<li><span>${escapeHtml(copy.noHarnessEvidence)}</span><strong>0</strong><i></i></li>`}
      </ol>
    </section>
  `;
}

function renderCastRoutingRules(copy) {
  const rules = copy.routeRules;
  return `
    <section class="insight-card routing-card">
      <div class="panel-title">
        <p class="eyebrow">${escapeHtml(copy.castRoutingRules)}</p>
        <h2>${escapeHtml(copy.visibleThinking)}</h2>
      </div>
      <ol class="route-list">
        ${rules.map(([harness, trigger]) => `
          <li>
            <button type="button" class="link-button" data-select-harness="${escapeAttr(harness)}"><code>${escapeHtml(harness)}</code></button>
            <span>${escapeHtml(trigger)}</span>
          </li>
        `).join('')}
      </ol>
    </section>
  `;
}

function renderSelectedPanel(harnesses, copy) {
  const first = harnesses.find((item) => item.signals?.uses > 0) || harnesses[0];
  if (!first) {
    return `<section class="insight-card selected" id="selected-panel"><p class="eyebrow">${escapeHtml(copy.selected)}</p><h2>${escapeHtml(copy.noHarnessSelected)}</h2><p>${escapeHtml(copy.clickNode)}</p></section>`;
  }
  return `
    <section class="insight-card selected" id="selected-panel">
      <p class="eyebrow">${escapeHtml(copy.selected)}</p>
      <h2>${escapeHtml(first.id)}</h2>
      <p>${escapeHtml(first.reason || copy.clickNode)}</p>
      <dl>
        <div><dt>${escapeHtml(copy.recommendation)}</dt><dd>${escapeHtml(first.recommendation || 'unknown')}</dd></div>
        <div><dt>${escapeHtml(copy.lifecycleState)}</dt><dd>${escapeHtml(first.lifecycle_state || 'unknown')}</dd></div>
        <div><dt>${escapeHtml(copy.uses)}</dt><dd>${escapeHtml(first.signals?.uses || 0)}</dd></div>
        <div><dt>${escapeHtml(copy.score)}</dt><dd>${escapeHtml(first.candidate_score?.total || 0)}</dd></div>
      </dl>
    </section>
  `;
}

function renderHarness(item, copy) {
  const signals = item.signals || {};
  const score = Number(item.candidate_score?.total || 0);
  return `
    <article class="harness-card ${recommendationClass(item.recommendation)}" data-harness-id="${escapeAttr(item.id)}" data-recommendation="${escapeAttr(item.recommendation || 'unknown')}" tabindex="0" role="button">
      <div>
        <p class="eyebrow">${escapeHtml(item.recommendation || 'unknown')}</p>
        <h3>${escapeHtml(item.id)}</h3>
      </div>
      <strong>${escapeHtml(score)}</strong>
      <p>${escapeHtml(item.reason)}</p>
      <dl>
        <div><dt>${escapeHtml(copy.lifecycleState)}</dt><dd>${escapeHtml(item.lifecycle_state || 'unknown')}</dd></div>
        <div><dt>${escapeHtml(copy.uses)}</dt><dd>${escapeHtml(signals.uses ?? 0)}</dd></div>
        <div><dt>${escapeHtml(copy.blocked)}</dt><dd>${escapeHtml(signals.blocked ?? 0)}</dd></div>
        <div><dt>${escapeHtml(copy.context)}</dt><dd>${escapeHtml(signals.context_cost || 'unknown')}</dd></div>
        <div><dt>${escapeHtml(copy.with)}</dt><dd>${renderRelated(signals.co_used_with)}</dd></div>
      </dl>
      <details>
        <summary>${escapeHtml(copy.evidenceHandles)}</summary>
        <ul>${renderEvidence(item.evidence_handles)}</ul>
      </details>
    </article>
  `;
}

function renderGraphOverview(graph = {}, copy) {
  const stats = graphStats(graph);
  return `
    <section class="insight-card graph-overview">
      <div class="panel-title">
        <p class="eyebrow">GRAPH OVERVIEW</p>
        <h2>${escapeHtml(copy.graphOverview)}</h2>
      </div>
      <dl>
        <div><dt>${escapeHtml(copy.nodes)}</dt><dd>${escapeHtml(stats.nodes.length)}</dd></div>
        <div><dt>${escapeHtml(copy.links)}</dt><dd>${escapeHtml(stats.edges.length)}</dd></div>
        <div><dt>${escapeHtml(copy.nodeTypes)}</dt><dd>${stats.nodeCounts.map(([key, value]) => `${escapeHtml(key)} (${escapeHtml(value)})`).join(', ') || escapeHtml(copy.none)}</dd></div>
        <div><dt>${escapeHtml(copy.edgeTypes)}</dt><dd>${stats.edgeCounts.map(([key, value]) => `${escapeHtml(key)} (${escapeHtml(value)})`).join(', ') || escapeHtml(copy.none)}</dd></div>
      </dl>
      <p class="edge-sample">${stats.edges.slice(0, 6).map((edge) => `<code>${escapeHtml(edge.type)}</code>`).join(' ') || '<code>none</code>'}</p>
    </section>
  `;
}

function renderScript(harnesses, copy) {
  const payload = JSON.stringify(harnesses.map((item) => ({
    id: item.id,
    reason: item.reason,
    recommendation: item.recommendation,
    lifecycle_state: item.lifecycle_state,
    uses: item.signals?.uses || 0,
    score: item.candidate_score?.total || 0
  }))).replaceAll('<', '\\u003c');
  const copyPayload = JSON.stringify({
    selected: copy.selected,
    recommendation: copy.recommendation,
    lifecycleState: copy.lifecycleState,
    uses: copy.uses,
    score: copy.score,
    type: copy.type,
    weight: copy.weight,
    clickNode: copy.clickNode,
    tooltipPrefix: copy.tooltipPrefix,
    filteredTo: copy.filteredTo,
    showingAll: copy.showingAll,
    coreMode: copy.coreMode,
    pauseOn: copy.pauseOn,
    pauseOff: copy.pauseOff
  }).replaceAll('<', '\\u003c');
  return `
    <script>
      const harnessData = ${payload};
      const copy = ${copyPayload};
      const byHarnessId = new Map(harnessData.map((item) => ['harness:' + item.id, item]));
      const selectedPanel = document.getElementById('selected-panel');
      const graphStatus = document.getElementById('graph-status');
      const tooltip = document.getElementById('graph-tooltip');
      const nodes = Array.from(document.querySelectorAll('.graph-node'));
      const edges = Array.from(document.querySelectorAll('.graph-edge'));
      const cards = Array.from(document.querySelectorAll('.harness-card'));
      const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]);
      const nodeById = (id) => nodes.find((node) => node.dataset.nodeId === id);
      const setStatus = (value) => {
        if (graphStatus) graphStatus.textContent = value;
      };
      function clearSelection() {
        nodes.forEach((item) => item.classList.remove('is-selected', 'is-related'));
        edges.forEach((item) => item.classList.remove('is-related'));
        cards.forEach((item) => item.classList.remove('is-selected'));
      }
      function selectNode(node) {
        clearSelection();
        node.classList.add('is-selected');
        const id = node.dataset.nodeId;
        const item = byHarnessId.get(id);
        edges.forEach((edge) => {
          const related = edge.dataset.source === id || edge.dataset.target === id;
          edge.classList.toggle('is-related', related);
          if (related) {
            const otherId = edge.dataset.source === id ? edge.dataset.target : edge.dataset.source;
            const other = nodeById(otherId);
            if (other) other.classList.add('is-related');
          }
        });
        if (item) {
          cards.forEach((card) => card.classList.toggle('is-selected', card.dataset.harnessId === item.id));
          if (selectedPanel) {
            selectedPanel.innerHTML = '<p class="eyebrow">' + esc(copy.selected) + '</p>' +
              '<h2>' + esc(item.id) + '</h2>' +
              '<p>' + esc(item.reason || copy.clickNode) + '</p>' +
              '<dl>' +
              '<div><dt>' + esc(copy.recommendation) + '</dt><dd>' + esc(item.recommendation) + '</dd></div>' +
              '<div><dt>' + esc(copy.lifecycleState) + '</dt><dd>' + esc(item.lifecycle_state) + '</dd></div>' +
              '<div><dt>' + esc(copy.uses) + '</dt><dd>' + esc(item.uses) + '</dd></div>' +
              '<div><dt>' + esc(copy.score) + '</dt><dd>' + esc(item.score) + '</dd></div>' +
              '</dl>';
          }
        } else if (selectedPanel) {
          selectedPanel.innerHTML = '<p class="eyebrow">' + esc(copy.selected) + '</p><h2>' + esc(node.dataset.nodeLabel) + '</h2><p>' + esc(id) + '</p><dl><div><dt>' + esc(copy.type) + '</dt><dd>' + esc(node.dataset.nodeType) + '</dd></div><div><dt>' + esc(copy.weight) + '</dt><dd>' + esc(node.dataset.nodeWeight) + '</dd></div></dl>';
        }
      }
      function selectHarness(id) {
        const node = nodeById('harness:' + id);
        if (node) {
          selectNode(node);
          node.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
        }
      }
      function applyMode(mode) {
        document.querySelectorAll('[data-mode]').forEach((button) => {
          const active = button.dataset.mode === mode;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        nodes.forEach((node) => node.classList.toggle('is-hidden', mode === 'core' && node.dataset.core !== 'true'));
        const visibleIds = new Set(nodes.filter((node) => !node.classList.contains('is-hidden')).map((node) => node.dataset.nodeId));
        edges.forEach((edge) => edge.classList.toggle('is-hidden', mode === 'core' && (!visibleIds.has(edge.dataset.source) || !visibleIds.has(edge.dataset.target))));
        setStatus(mode === 'core' ? copy.coreMode : copy.showingAll);
      }
      function togglePause(button) {
        const paused = !document.body.classList.contains('is-paused');
        document.body.classList.toggle('is-paused', paused);
        button.classList.toggle('active', paused);
        button.setAttribute('aria-pressed', paused ? 'true' : 'false');
        setStatus(paused ? copy.pauseOn : copy.pauseOff);
      }
      function filterRecommendation(value, button) {
        const alreadyActive = button.classList.contains('active-filter');
        document.querySelectorAll('[data-filter-rec]').forEach((item) => {
          item.classList.remove('active-filter');
          item.setAttribute('aria-pressed', 'false');
        });
        if (alreadyActive) {
          nodes.forEach((node) => node.classList.remove('is-filtered-out'));
          edges.forEach((edge) => edge.classList.remove('is-filtered-out'));
          cards.forEach((card) => card.classList.remove('is-filtered-out'));
          setStatus(copy.showingAll);
          return;
        }
        button.classList.add('active-filter');
        button.setAttribute('aria-pressed', 'true');
        nodes.forEach((node) => {
          const hide = node.dataset.nodeType === 'harness' && node.dataset.recommendation !== value;
          node.classList.toggle('is-filtered-out', hide);
        });
        const visibleIds = new Set(nodes.filter((node) => !node.classList.contains('is-filtered-out')).map((node) => node.dataset.nodeId));
        edges.forEach((edge) => edge.classList.toggle('is-filtered-out', !visibleIds.has(edge.dataset.source) || !visibleIds.has(edge.dataset.target)));
        cards.forEach((card) => card.classList.toggle('is-filtered-out', card.dataset.recommendation !== value));
        setStatus(copy.filteredTo + ': ' + value);
      }
      nodes.forEach((node) => {
        node.addEventListener('click', () => selectNode(node));
        node.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectNode(node);
          }
        });
        node.addEventListener('pointerenter', () => {
          if (!tooltip) return;
          tooltip.textContent = copy.tooltipPrefix + ': ' + node.dataset.nodeLabel + ' · ' + node.dataset.nodeType;
          tooltip.classList.add('is-visible');
        });
        node.addEventListener('pointermove', (event) => {
          if (!tooltip) return;
          tooltip.style.left = Math.min(event.clientX + 14, window.innerWidth - 220) + 'px';
          tooltip.style.top = Math.max(event.clientY - 12, 12) + 'px';
        });
        node.addEventListener('pointerleave', () => {
          if (tooltip) tooltip.classList.remove('is-visible');
        });
      });
      document.querySelectorAll('[data-mode]').forEach((button) => {
        button.addEventListener('click', () => applyMode(button.dataset.mode));
      });
      document.querySelectorAll('[data-action="pause"]').forEach((button) => {
        button.addEventListener('click', () => togglePause(button));
      });
      document.querySelectorAll('[data-select-harness]').forEach((button) => {
        button.addEventListener('click', () => selectHarness(button.dataset.selectHarness));
      });
      cards.forEach((card) => {
        card.addEventListener('click', () => selectHarness(card.dataset.harnessId));
        card.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectHarness(card.dataset.harnessId);
          }
        });
      });
      document.querySelectorAll('[data-filter-rec]').forEach((button) => {
        button.addEventListener('click', () => filterRecommendation(button.dataset.filterRec, button));
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
      text-align: left;
      color: inherit;
      cursor: pointer;
      padding: 16px 14px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(23, 31, 42, .92), rgba(13, 18, 26, .92));
      border-radius: 8px;
      overflow: hidden;
    }
    .project-card:hover, .project-card.active-filter, .harness-card:hover, .harness-card.is-selected {
      border-color: rgba(83, 242, 184, .55);
      box-shadow: 0 0 0 1px rgba(83, 242, 184, .12), 0 20px 60px rgba(0, 0, 0, .24);
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
      cursor: pointer;
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
    .graph-edge { transition: opacity .15s ease, stroke-width .15s ease; }
    .graph-edge.is-related { opacity: 1; stroke-opacity: .55; stroke-width: 3.2; }
    .graph-node {
      cursor: pointer;
      outline: none;
      transition: opacity .15s ease, transform .15s ease, stroke-width .15s ease;
      transform-box: fill-box;
      transform-origin: center;
    }
    .graph-node:hover, .graph-node:focus-visible, .graph-node.is-selected {
      opacity: 1;
      transform: scale(1.22);
      stroke-opacity: .95;
      stroke-width: 2.2;
    }
    .graph-node.is-related { opacity: 1; stroke-opacity: .7; }
    .graph-node.is-hidden, .graph-edge.is-hidden, .graph-node.is-filtered-out, .graph-edge.is-filtered-out {
      opacity: .08;
      pointer-events: none;
    }
    .graph-tooltip {
      position: fixed;
      z-index: 20;
      display: none;
      max-width: 230px;
      padding: 8px 9px;
      border: 1px solid var(--line);
      border-radius: 7px;
      background: rgba(5, 8, 12, .94);
      color: var(--text);
      font-size: 12px;
      line-height: 1.35;
      box-shadow: 0 16px 40px rgba(0,0,0,.35);
      pointer-events: none;
    }
    .graph-tooltip.is-visible { display: block; }
    .is-paused .graph-node, .is-paused .graph-edge, .is-paused .meter span, .is-paused .status i {
      transition: none;
      animation: none;
      filter: none;
      box-shadow: none;
    }
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
    .ranked-button, .link-button {
      width: 100%;
      border: 0;
      background: transparent;
      color: inherit;
      padding: 0;
      text-align: left;
      cursor: pointer;
      font: inherit;
    }
    .ranked-button:hover span, .link-button:hover code { color: var(--green); }
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
    .harness-card {
      padding: 15px;
      border-top: 3px solid var(--blue);
      cursor: pointer;
      transition: opacity .15s ease, border-color .15s ease, box-shadow .15s ease;
    }
    .harness-card.is-filtered-out { opacity: .22; }
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
  const copy = reportCopy();
  const harnesses = Array.isArray(summary.harnesses) ? summary.harnesses : [];
  const generatedAt = summary.generated_at || new Date().toISOString();
  const runWindow = summary.run_window || {};
  const counts = countByRecommendation(harnesses);
  return `<!doctype html>
<html lang="${escapeAttr(copy.htmlLang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(copy.title)}</title>
  ${renderStyles()}
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar" aria-label="${escapeAttr(copy.navLabel)}">
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
        <div><strong>${escapeHtml(copy.operator)}</strong><span>local</span></div>
        <div class="status"><i></i> ${escapeHtml(copy.online)}</div>
      </header>
      <section class="hero">
        <div>
          <p class="eyebrow">${escapeHtml(copy.localHealth)}</p>
          <h1>${escapeHtml(copy.knowledgeGraph)}</h1>
          <p>${escapeHtml(copy.heroText)}</p>
        </div>
        <div>
          <p class="eyebrow">${escapeHtml(copy.generated)}</p>
          <p>${escapeHtml(generatedAt)}</p>
        </div>
      </section>
      ${renderProjectCards(harnesses, copy)}
      <section class="content-grid">
        ${renderGraphCanvas(summary, copy)}
        ${renderTimeline(summary.timeline || [], copy)}
        <section class="harness-section">
          <h2>${escapeHtml(copy.harnessCards)}</h2>
          <div class="harness-grid">
            ${harnesses.map((item) => renderHarness(item, copy)).join('\n')}
          </div>
        </section>
      </section>
    </main>
    <aside class="right-rail" aria-label="Insights">
      ${renderStats(summary, copy)}
      ${renderConfidence(summary, copy)}
      ${renderGraphOverview(summary.graph || {}, copy)}
      ${renderImportantHarnesses(harnesses, copy)}
      ${renderCastRoutingRules(copy)}
      <section class="insight-card">
        <div class="panel-title">
          <p class="eyebrow">${escapeHtml(copy.recommendations)}</p>
          <h2>${escapeHtml(copy.currentMix)}</h2>
        </div>
        <p>${counts.map(([key, value]) => `<strong>${escapeHtml(key)}</strong>: ${escapeHtml(value)}`).join(' | ') || escapeHtml(copy.noRecommendations)}</p>
      </section>
      ${renderSelectedPanel(harnesses, copy)}
      <section class="insight-card">
        <p class="eyebrow">${escapeHtml(copy.sources)}</p>
        <p>${(summary.sources || []).map((source) => `<code>${escapeHtml(source)}</code>`).join(' ')}</p>
        <p>${escapeHtml(copy.runCount)}: <strong>${escapeHtml(runWindow.run_count ?? 0)}</strong></p>
      </section>
    </aside>
  </div>
  ${renderScript(harnesses, copy)}
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
