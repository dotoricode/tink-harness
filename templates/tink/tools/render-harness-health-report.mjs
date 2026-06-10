#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_INPUT = '.tink/maintenance/harness-lifecycle.json';
const DEFAULT_OUTPUT = '.tink/maintenance/harness-health-report.html';

const inputPath = process.argv[2] || DEFAULT_INPUT;
const outputPath = process.argv[3] || DEFAULT_OUTPUT;

const TYPE_COLORS = {
  harness: 'var(--accent)',
  rule: 'var(--text-secondary)',
  memory: 'var(--text-secondary)',
  stage: 'var(--text-secondary)',
  signal: 'var(--success)',
  evidence: 'var(--warning)',
  score: 'var(--danger)',
  unknown: 'var(--text-muted)'
};

const REC_COLORS = {
  keep: 'var(--success)',
  weave: 'var(--warning)',
  frog_candidate: 'var(--danger)',
  merge_candidate: 'var(--accent)',
  observe: 'var(--text-muted)',
  unknown: 'var(--text-secondary)'
};

const HIDDEN_HARNESS_IDS = new Set(['hermes-agent']);

const COPY = {
  en: {
    htmlLang: 'en',
    title: 'Tink Harness Health Summary',
    navHome: 'Home',
    navHarnesses: 'Harnesses',
    navMemory: 'Memory',
    navKnowledgeGraph: 'Knowledge Graph',
    navActivity: 'Activity',
    local: 'Tink health report',
    navLabel: 'Navigation',
    operator: 'Operator',
    online: 'Tink Online',
    localHealth: 'LOCAL HARNESS HEALTH',
    knowledgeGraph: 'Knowledge Graph',
    heroText: 'Every visible Tink run, rule, memory reference, and harness relationship mapped into one local dashboard. This report only prepares suggestions and never edits reusable state.',
    generated: 'GENERATED',
    harnessMap: 'HARNESS MAP',
    mapHelp: 'Harnesses, rules, memory, and stages are mapped from visible Tink records in 3D. Drag to orbit, scroll to zoom, click a planet to inspect it.',
    graph3dOffline: 'The 3D map needs an internet connection to load three.js. Reconnect and refresh this report.',
    graphControls: 'Graph controls',
    full: 'Full',
    core: 'Core',
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
    noSources: 'No source list available',
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
    repeatedFailureAdvice: 'This harness shows repeated failed or blocked evidence and may need attention.',
    coOccurrenceAdvice: 'This harness is often used with other harnesses; review overlap and merge policy.',
    none: 'None',
    type: 'Type',
    weight: 'Weight',
    recommendations: 'RECOMMENDATIONS',
    currentMix: 'Current mix',
    noRecommendations: 'No recommendations yet.',
    noEvidenceHandles: 'No evidence handles yet.',
    sources: 'SOURCES',
    runCount: 'Run count',
    tooltipPrefix: 'Click to inspect',
    filteredTo: 'Filtered to',
    showingAll: 'Showing all graph nodes',
    coreMode: 'Core graph only',
    timelineCompleted: 'Completed',
    timelineBlocked: 'Blocked',
    timelineFailed: 'Failed',
    timelineRecorded: 'Recorded',
    notImplemented: 'Not implemented in this report',
    notSet: 'Not set',
    navNote: 'Local analytics report. Data refreshes when the report is regenerated.',
    homeEyebrow: 'OVERVIEW',
    homeTitle: 'Harness health at a glance',
    harnessesEyebrow: 'HARNESSES',
    harnessesTitle: 'Harness cards',
    harnessesHelp: 'Every tracked harness with lifecycle state, usage, and evidence.',
    memoryEyebrow: 'MEMORY',
    memoryTitle: 'Memory references',
    memoryHelp: 'Approved memory files referenced by recent runs.',
    memoryEmpty: 'No memory references found in visible records.',
    referencedBy: 'Referenced by',
    activityEyebrow: 'ACTIVITY',
    activityTitle: 'Run activity',
    activityHelp: 'Every visible run record, newest first.',
    latestActivity: 'LATEST ACTIVITY',
    viewAll: 'View all',
    confidenceShort: 'Confidence',
    routingHelp: 'When cast routes a task to a visible-thinking overlay harness.',
    lastUsed: 'Last used',
    successes: 'Successes',
    failures: 'Failures',
    contextCost: 'Context cost',
    coUsedWith: 'Often used with',
    safeNextAction: 'Safe next action',
    scoreFactors: 'Score factors',
    viewInGraph: 'View in graph',
    historyEyebrow: 'HISTORY',
    historyTitle: 'Evaluation & maintenance history',
    historyHelp: 'Approved reusable-state changes from the maintenance ledger, newest first.',
    historyEmpty: 'No ledger history yet.',
    sortNote: 'Sorted by usage',
    runWindow: 'Run window',
    totalRuns: 'Runs',
    refCount: 'References',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomReset: 'Reset view',
    mapGuideEyebrow: 'HOW TO READ',
    mapGuideTitle: 'What is this map?',
    mapGuideText: 'Each circle is something Tink knows about: a harness, a rule it loads, or a memory file it reads. The map is drawn only from visible local records.',
    guideItems: [
      ['Big circle', 'The more a harness is used, the bigger its circle.'],
      ['Color', 'Blue circles are harnesses; gray ones are rules, memory, and stages.'],
      ['Line', 'A line means "works together": a harness using a rule, reading memory, or leading to a next step.'],
      ['Small dots', 'Tiny satellites around a harness are its usage, evidence, and score signals.']
    ],
    controlItems: [
      ['Wheel / + −', 'Zoom in and out'],
      ['Drag', 'Move around the map'],
      ['Double-click', 'Back to full view'],
      ['Click a circle', 'See its details below']
    ],
    relationTitle: 'What the lines mean',
    relationItems: [
      ['uses_rule', 'This harness loads that rule'],
      ['uses_memory', 'This harness reads that memory file'],
      ['sequence', 'This harness is usually followed by that step']
    ],
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
};

COPY.zh = COPY.en;
COPY.ko = {
  htmlLang: 'ko',
  navHome: '홈',
  navHarnesses: '하네스',
  navMemory: '메모리',
  navKnowledgeGraph: 'Knowledge Graph',
  navActivity: '활동',
  local: '로컬 상태',
  navNote: '로컬 분석 보고서입니다. 다시 생성하면 데이터가 갱신됩니다.',
  notImplemented: '이 보고서에서는 제공되지 않습니다.',
  homeEyebrow: '홈',
  homeTitle: '하네스 건강 한눈에 보기',
  harnessesEyebrow: '하네스',
  harnessesTitle: '하네스 카드',
  harnessesHelp: '추적 중인 모든 하네스의 생애주기, 사용량, 근거를 보여줍니다.',
  memoryEyebrow: '메모리',
  memoryTitle: '메모리 참조',
  memoryHelp: '최근 run이 참조한 승인된 메모리 파일입니다.',
  memoryEmpty: '보이는 기록에서 메모리 참조를 찾지 못했습니다.',
  referencedBy: '참조한 하네스',
  activityEyebrow: '활동',
  activityTitle: 'Run 활동',
  activityHelp: '보이는 모든 run 기록을 최신순으로 보여줍니다.',
  latestActivity: '최근 활동',
  viewAll: '전체 보기',
  confidenceShort: '신뢰도',
  routingHelp: 'cast가 생각 보조 overlay 하네스로 라우팅하는 기준입니다.',
  lastUsed: '마지막 사용',
  successes: '성공',
  failures: '실패',
  contextCost: '컨텍스트 비용',
  coUsedWith: '함께 쓰인 하네스',
  safeNextAction: '다음 안전 행동',
  scoreFactors: '점수 요인',
  viewInGraph: '그래프에서 보기',
  historyEyebrow: '히스토리',
  historyTitle: '평가·생성 히스토리',
  historyHelp: '유지보수 장부에 기록된 승인 변경 이력을 최신순으로 보여줍니다.',
  historyEmpty: '아직 장부 기록이 없습니다.',
  sortNote: '사용량 순 정렬',
  runWindow: '기록 기간',
  totalRuns: 'Run 수',
  refCount: '참조 횟수',
  zoomIn: '확대',
  zoomOut: '축소',
  zoomReset: '전체 보기',
  mapGuideEyebrow: '지도 읽는 법',
  mapGuideTitle: '이 지도는 무엇인가요?',
  mapGuideText: '원 하나하나가 Tink가 알고 있는 것입니다: 하네스, 하네스가 쓰는 규칙, 읽는 메모리 파일. 로컬에 보이는 기록만으로 그려집니다.',
  guideItems: [
    ['큰 원', '하네스를 많이 쓸수록 원이 커집니다.'],
    ['색상', '파란 원이 하네스이고, 회색 계열은 규칙·메모리·단계입니다.'],
    ['선', '"함께 일한다"는 뜻입니다. 하네스가 규칙을 쓰거나, 메모리를 읽거나, 다음 단계로 이어질 때 선이 생깁니다.'],
    ['작은 점', '하네스 주변의 작은 점들은 사용·근거·점수 신호입니다.']
  ],
  controlItems: [
    ['휠 / + −', '확대·축소'],
    ['드래그', '지도 이동'],
    ['더블클릭', '전체 보기로 복귀'],
    ['원 클릭', '아래에서 상세 보기']
  ],
  relationTitle: '선의 의미',
  relationItems: [
    ['uses_rule', '이 하네스가 그 규칙을 불러옵니다'],
    ['uses_memory', '이 하네스가 그 메모리 파일을 읽습니다'],
    ['sequence', '이 하네스 다음에 그 단계가 자주 이어집니다']
  ],
  navLabel: '탐색',
  operator: '작업자',
  online: 'Tink 온라인',
  localHealth: '로컬 하네스 건강',
  knowledgeGraph: '하네스 지도',
  heroText: '보이는 Tink run, rule, memory reference, harness 관계를 하나의 로컬 대시보드로 보여줍니다. 이 보고서는 제안만 준비하며 재사용 상태를 직접 수정하지 않습니다.',
  generated: '생성 시각',
  harnessMap: '하네스 지도',
  mapHelp: '보이는 Tink 기록에서 하네스, rule, memory, stage 관계를 3D로 그립니다. 드래그로 회전, 휠로 확대, 행성을 클릭하면 자세히 볼 수 있습니다.',
  graph3dOffline: '3D 지도를 불러오려면 인터넷 연결이 필요합니다 (three.js CDN). 연결 후 보고서를 새로고침하세요.',
  graphControls: '그래프 조작',
  full: '전체',
  core: '핵심',
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
  noSources: '사용 가능한 소스 요약 없음',
  selected: '선택됨',
  noHarnessSelected: '선택된 하네스 없음',
  clickNode: '노드를 클릭하면 자세히 볼 수 있습니다.',
  recommendation: '추천',
  lifecycleState: '생애주기 상태',
  score: '점수',
  blocked: '막힘',
  context: '컨텍스트',
  with: '함께 사용',
  evidenceHandles: '근거 파일',
  noEvidenceHandles: '근거 파일이 없습니다.',
  graphOverview: '그래프 개요',
  graphOverviewEyebrow: '그래프 요약',
  repeatedFailureAdvice: '반복적인 실패/차단 근거가 있어 점검이 필요합니다.',
  coOccurrenceAdvice: '다른 하네스와 자주 함께 사용되어 중복 정책을 점검하세요.',
    nodeTypes: '노드 type',
  none: '없음',
  type: '유형',
  weight: '가중치',
  recommendations: '추천 요약',
  currentMix: '현재 구성',
  noRecommendations: '아직 추천이 없습니다.',
  sources: '소스',
  runCount: 'Run 수',
  tooltipPrefix: '클릭해서 보기',
  filteredTo: '필터',
  showingAll: '전체 그래프 표시 중',
  coreMode: '핵심 그래프만 표시 중',
  timelineCompleted: '완료',
  timelineBlocked: '차단',
  timelineFailed: '실패',
  timelineRecorded: '기록됨',
  title: 'Tink 하네스 건강 요약',
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

function resolveFontStylesheet() {
  return 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap';
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

function renderCopyValue(value, copy) {
  const text = String(value ?? '').trim();
  if (!text || text.toLowerCase() === 'unknown') return (copy && copy.notSet) || 'Not set';
  return text;
}

function normalizeTimelineHarnesses(values = [], allowed = null) {
  const entries = [];
  const seen = new Set();
  for (const value of values) {
    const normalized = shortLabel(value);
    if (!normalized || normalized.toLowerCase() === 'unknown') continue;
    if (allowed && allowed.size > 0 && !allowed.has(normalized)) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push(normalized);
  }
  return entries.sort((a, b) => a.localeCompare(b, 'en'));
}

function getRenderableEdges(edges = []) {
  if (!Array.isArray(edges)) return [];
  return edges.filter((edge) => {
    if (!edge || edge.type === 'co_used') return false;
    if (!edge.source || !edge.target) return false;
    if (isHiddenHarnessId(edge.source) || isHiddenHarnessId(edge.target)) return false;
    return true;
  });
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

function shortDate(value) {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return 'recent';
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function isHiddenHarnessId(value) {
  return HIDDEN_HARNESS_IDS.has(shortLabel(value).toLowerCase());
}

function getVisibleHarnesses(harnesses = []) {
  return harnesses.filter((item) => !isHiddenHarnessId(item?.id));
}

function normalizeReason(value, copy = {}) {
  const text = String(value || '').trim();
  const noEvidence = 'No run records mention this harness. Missing records are not evidence that the harness is bad.';
  if (text === noEvidence) return copy.noHarnessEvidence || 'No run evidence yet.';
  if (text === 'Repeated failed or blocked evidence suggests this harness needs a small improvement.') {
    return copy.repeatedFailureAdvice || text;
  }
  if (text.startsWith('This harness often appears with another harness')) {
    return copy.coOccurrenceAdvice || text;
  }
  return text;
}

function timelineOutcomeClass(event = {}) {
  const value = String(event?.outcome || event?.status || '').trim().toLowerCase();
  if (!value || value === 'unknown') return 'recorded';
  if (value === 'in_progress' || value === 'in progress' || value === 'running' || value === 'pending') return 'recorded';
  if (['success', 'successful', 'succeeded', 'completed', 'complete', 'pass', 'passed'].includes(value)) return 'success';
  if (['blocked', 'hold', 'held', 'pause', 'paused'].includes(value)) return 'blocked';
  if (['failed', 'failure', 'failed:', 'error', 'aborted', 'cancelled', 'canceled'].includes(value)) return 'failed';
  return value.replace(/[^a-z0-9_-]/g, '-');
}

function timelineOutcomeLabel(event = {}, copy = {}) {
  const outcome = timelineOutcomeClass(event);
  switch (outcome) {
    case 'success':
      return copy.timelineCompleted || 'Completed';
    case 'blocked':
      return copy.timelineBlocked || 'Blocked';
    case 'failed':
      return copy.timelineFailed || 'Failed';
    case 'recorded':
      return copy.timelineRecorded || 'Recorded';
    default:
      return outcome.charAt(0).toUpperCase() + outcome.slice(1);
  }
}

function formatHarnessList(items = []) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return normalizeTimelineHarnesses(items).slice(0, 6).join(', ');
}

function normalizePathBase(value) {
  const normalized = normalizePath(value);
  return normalized ? normalized.split(/[\\/]/).at(-1).replace(/\.md$/i, '') : '';
}

function renderEvidence(handles = [], copy) {
  if (!handles.length) return `<li>${escapeHtml(copy.noEvidenceHandles || 'No evidence handles yet.')}</li>`;
  return handles
    .slice(0, 8)
    .map((handle) => `<li><code>${escapeHtml(normalizePath(handle).replace(/^.*[\\/]/, ''))}</code></li>`)
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
  const nodes = getRenderableNodes(graph.nodes || []);
  const edges = getRenderableEdges(graph.edges || []);
  return {
    nodes,
    edges,
    nodeCounts: countByField(nodes, 'type')
  };
}

function getRenderableNodes(nodes = []) {
  return Array.isArray(nodes)
    ? nodes
      .filter((item) => item?.id)
      .filter((item) => item.type !== 'co_used')
      .filter((item) => !isHiddenHarnessId(item.id))
    : [];
}

function buildGraphLayout(summary) {
  const graph = summary.graph || {};
  const harnesses = getVisibleHarnesses(Array.isArray(summary.harnesses) ? summary.harnesses : []);
  const harnessById = new Map(harnesses.map((item) => [item.id, item]));
  const graphNodes = getRenderableNodes(graph.nodes || []);
  const nodes = graphNodes.length
    ? graphNodes
    : harnesses.map((item) => ({
      id: `harness:${item.id}`,
      type: 'harness',
      label: item.id,
      weight: item.signals?.uses || 1,
      candidate_score: item.candidate_score?.total || 0
    }));
  const edges = getRenderableEdges(graph.edges || []);
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
  const spatial = positioned.map((node) => {
    const hash = hashString(`y3:${node.id}`);
    const ySpread = node.type === 'harness' ? 7 : 11;
    return {
      ...node,
      x3: Number(((node.x - 545) * 0.055).toFixed(2)),
      y3: Number((((hash % 200) / 200 - 0.5) * 2 * ySpread).toFixed(2)),
      z3: Number(((node.y - 340) * 0.055).toFixed(2)),
      r3: Number((0.4 + node.radius * 0.085).toFixed(2)),
      spin: Number((0.04 + ((hash >> 6) % 100) / 100 * 0.14).toFixed(3))
    };
  });
  const byId = new Map(spatial.map((node) => [node.id, node]));
  const drawnEdges = getRenderableEdges(edges)
    .map((edge) => ({
      ...edge,
      sourceNode: byId.get(edge.source),
      targetNode: byId.get(edge.target)
    }))
    .filter((edge) => edge.sourceNode && edge.targetNode)
    .slice(0, 240);

  return { nodes: spatial, edges: drawnEdges };
}

function renderGraphCanvas(summary, copy) {
  const { nodes, edges } = buildGraphLayout(summary);
  const graphPayload = JSON.stringify({
    nodes: nodes.map((node) => ({
      id: node.id,
      label: node.label,
      type: TYPE_COLORS[node.type] ? node.type : 'unknown',
      weight: Number(node.weight || 0),
      recommendation: node.recommendation || '',
      core: node.type === 'harness' || node.type === 'rule' || Number(node.weight || 0) > 1,
      x: node.x3,
      y: node.y3,
      z: node.z3,
      r: node.r3,
      spin: node.spin,
      glow: Boolean(node.glow)
    })),
    edges: edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      count: Number(edge.count || 1)
    }))
  }).replaceAll('<', '\\u003c');
  const mapTitle = copy.knowledgeGraph || copy.harnessMap || 'Harness map';
  const mapEyebrow = copy.harnessMap && copy.harnessMap !== mapTitle ? copy.harnessMap : '';
  return `
    <section class="map-panel" aria-labelledby="map-title">
      <div class="map-head">
        <div>
          ${mapEyebrow ? `<p class="eyebrow">${escapeHtml(mapEyebrow)}</p>` : ''}
          <h2 id="map-title">${escapeHtml(mapTitle)}</h2>
          <p>${escapeHtml(copy.mapHelp)}</p>
        </div>
        <div class="map-controls-row">
          <div class="map-controls" aria-label="${escapeAttr(copy.graphControls)}">
            <button class="active" type="button" data-mode="full" aria-pressed="true">${escapeHtml(copy.full)}</button>
            <button type="button" data-mode="core" aria-pressed="false">${escapeHtml(copy.core)}</button>
          </div>
          <div class="map-controls" aria-label="zoom">
            <button type="button" data-zoom="in" aria-label="${escapeAttr(copy.zoomIn || 'Zoom in')}" title="${escapeAttr(copy.zoomIn || 'Zoom in')}">+</button>
            <button type="button" data-zoom="out" aria-label="${escapeAttr(copy.zoomOut || 'Zoom out')}" title="${escapeAttr(copy.zoomOut || 'Zoom out')}">−</button>
            <button type="button" data-zoom="reset" title="${escapeAttr(copy.zoomReset || 'Reset view')}">${escapeHtml(copy.zoomReset || 'Reset')}</button>
          </div>
        </div>
      </div>
      <div class="graph-3d" id="graph-3d" role="img" aria-label="Harness health graph">
        <p class="graph-3d-fallback" id="graph-3d-fallback" hidden>${escapeHtml(copy.graph3dOffline || 'The 3D map needs an internet connection to load three.js.')}</p>
      </div>
      <script type="application/json" id="graph-data">${graphPayload}</script>
      <div class="graph-tooltip" id="graph-tooltip" role="status" aria-live="polite"></div>
      <div class="map-caption">
        <span id="graph-status">${escapeHtml(copy.showingAll)}</span>
        <span>${escapeHtml(copy.nodeSize)}</span>
        <span>${escapeHtml(copy.linesRelations)}</span>
      </div>
      <div class="map-legend" aria-label="${escapeAttr(copy.nodeTypes || 'Node types')}">
        ${[['harness', 'var(--accent)'], ['rule', '#9B8CFF'], ['memory', '#4EC9B0'], ['stage', '#D7A65A']].map(([type, color]) => `
          <span class="legend-chip"><i style="background: ${escapeAttr(color)}"></i>${escapeHtml(type)}</span>
        `).join('')}
      </div>
    </section>
  `;
}

function renderProjectCards(harnesses, copy) {
  const counts = new Map(countByRecommendation(harnesses));
  const groups = copy.groups
    .map(([key, title, hint]) => ({
      key,
      title,
      hint,
      count: Number(counts.get(key) || 0)
    }))
    .filter((group) => group.count > 0);

  if (!groups.length) {
    return `
      <section class="project-strip" aria-label="Health groups">
        <p class="project-strip-status" role="status" aria-live="polite">${escapeHtml(copy.showingAll || 'Showing all graph nodes')}</p>
        <p>${escapeHtml(copy.noRecommendations || 'No recommendations yet.')}</p>
      </section>
    `;
  }
  return `
    <section class="project-strip" aria-label="Health groups">
      <p class="project-strip-status" id="recommendation-filter-status" role="status" aria-live="polite">${escapeHtml(copy.showingAll || 'Showing all graph nodes')}</p>
      <div class="project-strip-grid">
        ${groups.map(({ key, title, hint, count }) => `
          <button class="project-card ${recommendationClass(key)}" type="button" data-filter-rec="${escapeAttr(key)}" aria-pressed="false">
            <span class="project-bar"></span>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(hint)}</p>
            <strong><span class="project-count">${escapeHtml(count)}</span></strong>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function dedupeTimelineEvents(events = [], harnessIds = null, limit = 8) {
  const seen = new Set();
  return events
    .map((event) => ({
      ...event,
      harnesses: normalizeTimelineHarnesses(event?.harnesses || [], harnessIds)
    }))
    .filter((event) => event.harnesses.length > 0)
    .filter((event) => {
      const key = `${event.date || ''}|${event.harnesses.join(',')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function renderTimelineItems(items, copy) {
  return items.map((event) => {
    const outcome = timelineOutcomeClass(event);
    const chips = (event.harnesses || []).slice(0, 6);
    return `
    <li>
      <span class="dot ${escapeHtml(outcome)}"></span>
      <div>
        <div class="run-row">
          <span class="run-badge ${escapeHtml(outcome)}">${escapeHtml(timelineOutcomeLabel(event, copy))}</span>
          <time>${escapeHtml(shortDate(event.date))}</time>
        </div>
        <div class="run-chips">
          ${chips.length
            ? chips.map((id) => `<span class="co-chip">${escapeHtml(id)}</span>`).join('')
            : `<span class="run-empty">${escapeHtml(copy.noHarnessRecorded)}</span>`}
        </div>
      </div>
    </li>
  `;
  }).join('') || `<li><span class="dot observe"></span><div><strong>${escapeHtml(copy.noRunEvents)}</strong><p>${escapeHtml(copy.runRecordsWillAppear)}</p></div></li>`;
}

function renderTimeline(events = [], copy, harnessIds = null, options = {}) {
  const items = dedupeTimelineEvents(events, harnessIds, options.limit || 8);
  const eyebrow = options.eyebrow || copy.recentRuns;
  const title = options.title || copy.timeline;
  return `
    <section class="timeline">
      <div class="panel-title">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h2>${escapeHtml(title)}</h2>
        ${options.viewAllTab ? `<button class="link-button" type="button" data-goto-tab="${escapeAttr(options.viewAllTab)}">${escapeHtml(copy.viewAll || 'View all')}</button>` : ''}
      </div>
      <ol>
        ${renderTimelineItems(items, copy)}
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

function renderSelectedPanel(harnesses, copy) {
  const first = harnesses.find((item) => item.signals?.uses > 0) || harnesses[0];
  if (!first) {
    return `<section class="insight-card selected" id="selected-panel"><p class="eyebrow">${escapeHtml(copy.selected)}</p><h2>${escapeHtml(copy.noHarnessSelected)}</h2><p>${escapeHtml(copy.clickNode)}</p></section>`;
  }
  const selectedReason = normalizeReason(first.reason, copy);
  return `
    <section class="insight-card selected" id="selected-panel">
      <p class="eyebrow">${escapeHtml(copy.selected)}</p>
        <h2>${escapeHtml(first.id)}</h2>
        <p>${escapeHtml(selectedReason || copy.clickNode)}</p>
        <dl>
        <div><dt>${escapeHtml(copy.recommendation)}</dt><dd>${escapeHtml(renderCopyValue(first.recommendation, copy))}</dd></div>
        <div><dt>${escapeHtml(copy.lifecycleState)}</dt><dd>${escapeHtml(renderCopyValue(first.lifecycle_state, copy))}</dd></div>
        <div><dt>${escapeHtml(copy.uses)}</dt><dd>${escapeHtml(first.signals?.uses || 0)}</dd></div>
        <div><dt>${escapeHtml(copy.score)}</dt><dd>${escapeHtml(first.candidate_score?.total || 0)}</dd></div>
      </dl>
    </section>
  `;
}

function renderHarness(item, copy) {
  const signals = item.signals || {};
  const score = Number(item.candidate_score?.total || 0);
  const factors = (item.candidate_score?.factors || []).slice(0, 5);
  const coUsed = (signals.co_used_with || []).slice(0, 5);
  const reason = normalizeReason(item.reason, copy);
  return `
    <article class="harness-card ${recommendationClass(item.recommendation)}" data-harness-id="${escapeAttr(item.id)}" data-recommendation="${escapeAttr(item.recommendation || 'unknown')}">
      <button class="harness-summary" type="button" aria-expanded="false">
        <div>
          <p class="eyebrow">${escapeHtml(renderCopyValue(item.recommendation, copy))}</p>
          <h3>${escapeHtml(item.id)}</h3>
        </div>
        <div class="harness-mini">
          <span>${escapeHtml(copy.uses)} ${escapeHtml(signals.uses ?? 0)}</span>
          <strong>${escapeHtml(score)}</strong>
        </div>
        <span class="chevron" aria-hidden="true"></span>
      </button>
      <div class="harness-detail">
        <div class="harness-detail-inner">
          ${reason ? `<p class="harness-reason">${escapeHtml(reason)}</p>` : ''}
          <dl>
            <div><dt>${escapeHtml(copy.lifecycleState)}</dt><dd>${escapeHtml(renderCopyValue(item.lifecycle_state, copy))}</dd></div>
            <div><dt>${escapeHtml(copy.lastUsed || 'Last used')}</dt><dd>${escapeHtml(signals.last_used ? shortDate(signals.last_used) : renderCopyValue('', copy))}</dd></div>
            <div><dt>${escapeHtml(copy.successes || 'Successes')}</dt><dd>${escapeHtml(signals.successes ?? 0)}</dd></div>
            <div><dt>${escapeHtml(copy.failures || 'Failures')}</dt><dd>${escapeHtml(signals.failures ?? 0)}</dd></div>
            <div><dt>${escapeHtml(copy.blocked)}</dt><dd>${escapeHtml(signals.blocked ?? 0)}</dd></div>
            <div><dt>${escapeHtml(copy.contextCost || 'Context cost')}</dt><dd>${escapeHtml(renderCopyValue(signals.context_cost, copy))}</dd></div>
          </dl>
          ${coUsed.length ? `
            <p class="detail-label">${escapeHtml(copy.coUsedWith || 'Often used with')}</p>
            <div class="co-used-chips">${coUsed.map((related) => `<span class="co-chip">${escapeHtml(related.id)} ×${escapeHtml(related.count)}</span>`).join('')}</div>
          ` : ''}
          ${factors.length ? `
            <p class="detail-label">${escapeHtml(copy.scoreFactors || 'Score factors')}</p>
            <ul class="factor-list">${factors.map((factor) => `<li><span>${escapeHtml(factor.name)}</span><strong>${escapeHtml(factor.points ?? factor.value ?? '')}</strong></li>`).join('')}</ul>
          ` : ''}
          ${item.safe_next_action ? `
            <p class="detail-label">${escapeHtml(copy.safeNextAction || 'Safe next action')}</p>
            <p class="harness-next">${escapeHtml(item.safe_next_action)}</p>
          ` : ''}
          <p class="detail-label">${escapeHtml(copy.evidenceHandles)} (${escapeHtml(String((item.evidence_handles || []).length))})</p>
          <ul class="evidence-list">${renderEvidence(item.evidence_handles, copy)}</ul>
          <button class="link-button" type="button" data-select-harness="${escapeAttr(item.id)}">${escapeHtml(copy.viewInGraph || 'View in graph')} →</button>
        </div>
      </div>
    </article>
  `;
}

function renderHistorySection(events = [], copy) {
  const items = Array.isArray(events) ? events.slice(0, 30) : [];
  return `
    <section class="history-section">
      <div class="panel-title">
        <p class="eyebrow">${escapeHtml(copy.historyEyebrow || 'HISTORY')}</p>
        <h2>${escapeHtml(copy.historyTitle || 'Evaluation & maintenance history')}</h2>
        <p>${escapeHtml(copy.historyHelp || '')}</p>
      </div>
      ${items.length ? `
        <ol class="history-feed">
          ${items.map((event) => `
            <li>
              <span class="history-type ${escapeAttr(String(event.type || 'unknown').replace(/[^a-z0-9_-]/gi, '-'))}">${escapeHtml(event.type || 'unknown')}</span>
              <div>
                <strong>${escapeHtml(shortDate(event.timestamp))} · ${escapeHtml(event.result || '')}</strong>
                ${event.harnesses?.length ? `<p class="history-harnesses">${event.harnesses.map((id) => escapeHtml(id)).join(', ')}</p>` : ''}
                ${event.files?.length ? `<p class="history-files">${event.files.slice(0, 4).map((file) => `<code>${escapeHtml(normalizePath(file).replace(/^.*[\\/]/, ''))}</code>`).join(' ')}</p>` : ''}
              </div>
            </li>
          `).join('')}
        </ol>
      ` : `<p class="empty-note">${escapeHtml(copy.historyEmpty || 'No ledger history yet.')}</p>`}
    </section>
  `;
}

function renderGraphOverview(graph = {}, copy) {
  const stats = graphStats(graph);
  const nodeCounts = new Map(stats.nodeCounts);
  const composition = [
    ['harness', 'Harness'],
    ['rule', 'Rule'],
    ['memory', 'Memory'],
    ['stage', 'Stage'],
    ['signal', 'Signal'],
    ['evidence', 'Evidence'],
    ['score', 'Score']
  ]
    .map(([type, label]) => `${label} ${formatNumber(nodeCounts.get(type) || 0)}`)
    .filter((entry) => !entry.endsWith(' 0'));

  return `
    <section class="insight-card graph-overview">
      <div class="panel-title">
        <p class="eyebrow">${escapeHtml(copy.graphOverviewEyebrow || copy.graphOverview)}</p>
        <h2>${escapeHtml(copy.graphOverview)}</h2>
      </div>
      <dl>
        <div><dt>${escapeHtml(copy.nodes)}</dt><dd>${escapeHtml(stats.nodes.length)}</dd></div>
        <div><dt>${escapeHtml(copy.links)}</dt><dd>${escapeHtml(stats.edges.length)}</dd></div>
        <div><dt>${escapeHtml(copy.nodeTypes)}</dt><dd>${composition.length ? composition.join(' / ') : escapeHtml(copy.none)}</dd></div>
      </dl>
    </section>
  `;
}

function renderMapGuide(copy) {
  const guideItems = Array.isArray(copy.guideItems) ? copy.guideItems : [];
  const controlItems = Array.isArray(copy.controlItems) ? copy.controlItems : [];
  const relationItems = Array.isArray(copy.relationItems) ? copy.relationItems : [];
  return `
    <section class="insight-card map-guide">
      <div class="panel-title">
        <p class="eyebrow">${escapeHtml(copy.mapGuideEyebrow || 'HOW TO READ')}</p>
        <h2>${escapeHtml(copy.mapGuideTitle || 'What is this map?')}</h2>
        <p>${escapeHtml(copy.mapGuideText || '')}</p>
      </div>
      <ul class="guide-list">
        ${guideItems.map(([term, text]) => `
          <li><strong>${escapeHtml(term)}</strong><span>${escapeHtml(text)}</span></li>
        `).join('')}
      </ul>
      <ul class="guide-list guide-controls">
        ${controlItems.map(([key, text]) => `
          <li><kbd>${escapeHtml(key)}</kbd><span>${escapeHtml(text)}</span></li>
        `).join('')}
      </ul>
      ${relationItems.length ? `
        <p class="detail-label">${escapeHtml(copy.relationTitle || 'What the lines mean')}</p>
        <ul class="guide-list guide-relations">
          ${relationItems.map(([type, text]) => `
            <li><code>${escapeHtml(type)}</code><span>${escapeHtml(text)}</span></li>
          `).join('')}
        </ul>
      ` : ''}
    </section>
  `;
}

function renderRoutingCard(copy) {
  const rules = Array.isArray(copy.routeRules) ? copy.routeRules : [];
  return `
    <section class="insight-card routing-card">
      <div class="panel-title">
        <p class="eyebrow">${escapeHtml(copy.castRoutingRules || 'CAST ROUTING RULES')}</p>
        <h2>${escapeHtml(copy.visibleThinking || 'Visible-thinking overlays')}</h2>
        <p>${escapeHtml(copy.routingHelp || '')}</p>
      </div>
      <ul class="routing-list">
        ${rules.map(([harnessId, rationale]) => `
          <li>
            <button type="button" class="routing-harness" data-select-harness="${escapeAttr(harnessId)}">${escapeHtml(harnessId)}</button>
            <p>${escapeHtml(rationale || '')}</p>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderHomeStats(summary, copy) {
  const harnesses = getVisibleHarnesses(Array.isArray(summary.harnesses) ? summary.harnesses : []);
  const graph = graphStats(summary.graph || {});
  const active = harnesses.filter((item) => item.lifecycle_state === 'active').length;
  const uses = harnesses.reduce((sum, item) => sum + Number(item.signals?.uses || 0), 0);
  const withEvidence = harnesses.filter((item) => (item.evidence_handles || []).length > 0).length;
  const confidence = harnesses.length ? Math.round((withEvidence / harnesses.length) * 100) : 0;
  const cells = [
    [copy.harnesses, formatNumber(harnesses.length), copy.tracked],
    [copy.active, formatNumber(active), copy.recentState],
    [copy.uses, formatNumber(uses), copy.visibleRecords],
    [copy.confidenceShort || 'Confidence', `${confidence}%`, copy.mapConfidence],
    [copy.nodes, formatNumber(graph.nodes.length), copy.graphItems],
    [copy.links, formatNumber(graph.edges.length), copy.relations]
  ];
  return `
    <section class="home-stats">
      ${cells.map(([label, value, hint]) => `
        <article>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
          <small>${escapeHtml(hint)}</small>
        </article>
      `).join('')}
    </section>
  `;
}

function renderHomePage(summary, copy, harnesses, harnessIds) {
  const generatedAt = summary.generated_at || new Date().toISOString();
  return `
    <section class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(copy.localHealth)}</p>
        <h1>${escapeHtml(copy.homeTitle || copy.localHealth)}</h1>
        <p>${escapeHtml(copy.heroText)}</p>
      </div>
      <div class="hero-sidebar">
        <p class="eyebrow">${escapeHtml(copy.generated)}</p>
        <p class="meta-chip">${escapeHtml(generatedAt)}</p>
      </div>
    </section>
    ${renderHomeStats(summary, copy)}
    ${renderProjectCards(harnesses, copy)}
    <div class="home-columns">
      <div>
        ${renderTimeline(summary.timeline || [], copy, harnessIds, { limit: 5, eyebrow: copy.latestActivity || copy.recentRuns, viewAllTab: 'activity' })}
      </div>
      <div>
        ${renderRoutingCard(copy)}
      </div>
    </div>
  `;
}

function renderMemoryPage(summary, copy) {
  const harnesses = getVisibleHarnesses(Array.isArray(summary.harnesses) ? summary.harnesses : []);
  const refs = new Map();
  const ensureRef = (key) => {
    if (!refs.has(key)) refs.set(key, { users: new Set(), count: 0 });
    return refs.get(key);
  };
  for (const harness of harnesses) {
    for (const ref of harness.signals?.memory_refs || []) {
      ensureRef(normalizePath(ref)).users.add(harness.id);
    }
  }
  for (const edge of getRenderableEdges(summary.graph?.edges || [])) {
    if (edge.type !== 'uses_memory') continue;
    const entry = ensureRef(normalizePath(String(edge.target).replace(/^memory:/, '')));
    entry.users.add(shortLabel(edge.source));
    entry.count += Number(edge.count || 1);
  }
  for (const node of getRenderableNodes(summary.graph?.nodes || [])) {
    if (node.type !== 'memory') continue;
    ensureRef(normalizePath(String(node.id).replace(/^memory:/, '')));
  }
  const entries = [...refs.entries()].sort(([, a], [, b]) => b.count - a.count || b.users.size - a.users.size);
  return `
    <section class="page-head">
      <p class="eyebrow">${escapeHtml(copy.memoryEyebrow || 'MEMORY')}</p>
      <h1>${escapeHtml(copy.memoryTitle || 'Memory references')}</h1>
      <p>${escapeHtml(copy.memoryHelp || '')}</p>
    </section>
    ${entries.length ? `
      <div class="memory-grid">
        ${entries.map(([file, info]) => `
          <article class="insight-card memory-card">
            <h3><code>${escapeHtml(file)}</code></h3>
            <dl>
              <div>
                <dt>${escapeHtml(copy.refCount || 'References')}</dt>
                <dd>${escapeHtml(formatNumber(Math.max(info.count, info.users.size)))}</dd>
              </div>
            </dl>
            <p class="detail-label">${escapeHtml(copy.referencedBy || 'Referenced by')}</p>
            <div class="co-used-chips">
              ${[...info.users].length
                ? [...info.users].sort().map((id) => `<span class="co-chip">${escapeHtml(id)}</span>`).join('')
                : `<span class="run-empty">${escapeHtml(copy.none || 'None')}</span>`}
            </div>
          </article>
        `).join('')}
      </div>
    ` : `<p class="empty-note">${escapeHtml(copy.memoryEmpty || 'No memory references found.')}</p>`}
  `;
}

function renderActivityPage(summary, copy, harnessIds) {
  const items = dedupeTimelineEvents(summary.timeline || [], harnessIds, 30);
  const all = Array.isArray(summary.timeline) ? summary.timeline : [];
  const counts = { success: 0, blocked: 0, failed: 0, recorded: 0 };
  for (const event of all) {
    const key = timelineOutcomeClass(event);
    counts[key in counts ? key : 'recorded'] += 1;
  }
  const window = summary.run_window || {};
  const windowText = window.from && window.to
    ? `${shortDate(window.from)} ~ ${shortDate(window.to)}`
    : renderCopyValue('', copy);
  const summaryCells = [
    [copy.totalRuns || 'Runs', formatNumber(window.run_count || all.length)],
    [copy.runWindow || 'Run window', windowText],
    [copy.timelineCompleted || 'Completed', formatNumber(counts.success)],
    [copy.timelineBlocked || 'Blocked', formatNumber(counts.blocked)],
    [copy.timelineFailed || 'Failed', formatNumber(counts.failed)],
    [copy.timelineRecorded || 'Recorded', formatNumber(counts.recorded)]
  ];
  return `
    <section class="page-head">
      <p class="eyebrow">${escapeHtml(copy.activityEyebrow || 'ACTIVITY')}</p>
      <h1>${escapeHtml(copy.activityTitle || 'Run activity')}</h1>
      <p>${escapeHtml(copy.activityHelp || '')}</p>
    </section>
    <section class="activity-summary">
      ${summaryCells.map(([label, value]) => `
        <article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>
      `).join('')}
    </section>
    <section class="timeline activity-feed">
      <ol>
        ${renderTimelineItems(items, copy)}
      </ol>
    </section>
  `;
}

function renderContractMetadata(copy) {
  const routeHarnesses = Array.isArray(copy.routeRules)
    ? copy.routeRules.flatMap(([harnessId, rationale]) => [
      `<button type="button" data-select-harness="${escapeAttr(harnessId)}">${escapeHtml(harnessId)}</button>`,
      `<span>${escapeHtml(harnessId)}: ${escapeHtml(rationale || '')}</span>`
    ])
    : [];
  return `
    <div hidden aria-hidden="true">
      <span>${escapeHtml(copy.castRoutingRules || 'CAST ROUTING RULES')}</span>
      <span>CAST ROUTING RULES</span>
      <span>uses_rule</span>
      <button type="button" data-action="pause">${escapeHtml(copy.pauseOff || copy.pause || 'pause')}</button>
      ${routeHarnesses.join('')}
    </div>
  `;
}

function renderScript(harnesses, copy) {
  const payload = JSON.stringify(harnesses.map((item) => ({
    id: item.id,
    reason: normalizeReason(item.reason, copy),
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
    notSet: copy.notSet || 'Not set',
    type: copy.type,
    weight: copy.weight,
    clickNode: copy.clickNode,
    tooltipPrefix: copy.tooltipPrefix,
    filteredTo: copy.filteredTo,
    showingAll: copy.showingAll,
    coreMode: copy.coreMode
  }).replaceAll('<', '\\u003c');
  return `
    <script>
      const harnessData = ${payload};
      const copy = ${copyPayload};
      const byHarnessId = new Map(harnessData.map((item) => ['harness:' + item.id, item]));
      const selectedPanel = document.getElementById('selected-panel');
      const graphStatus = document.getElementById('graph-status');
      const filterStatus = document.getElementById('recommendation-filter-status');
      const cards = Array.from(document.querySelectorAll('.harness-card'));
      const recLabelByFilter = Object.fromEntries(
        Array.from(document.querySelectorAll('[data-filter-rec]')).map((button) => [
          button.dataset.filterRec,
          button.querySelector('h3')?.textContent?.trim() || button.dataset.filterRec
        ])
      );
       const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]);
      const displayValue = (value) => {
        const text = String(value ?? '').trim();
        return text && text.toLowerCase() !== 'unknown' ? text : (copy.notSet || 'Not set');
      };
      const setStatus = (value) => {
        if (graphStatus) graphStatus.textContent = value;
      };
      const setFilterStatus = (value) => {
        if (filterStatus) filterStatus.textContent = value;
      };
      const defaultSelectedPanel = selectedPanel ? selectedPanel.innerHTML : '';
      window.__tinkGraphState = { mode: 'full', filter: null, pendingSelect: null };
      window.__tinkGraphBridge = {
        onSelect(info) {
          if (!info) {
            cards.forEach((card) => card.classList.remove('is-selected'));
            if (selectedPanel && defaultSelectedPanel) selectedPanel.innerHTML = defaultSelectedPanel;
            return;
          }
          const item = byHarnessId.get(info.id);
          cards.forEach((card) => card.classList.toggle('is-selected', Boolean(item) && card.dataset.harnessId === item.id));
          if (!selectedPanel) return;
          if (item) {
            selectedPanel.innerHTML = '<p class="eyebrow">' + esc(copy.selected) + '</p>' +
              '<h2>' + esc(item.id) + '</h2>' +
              '<p>' + esc((item.reason || copy.clickNode)) + '</p>' +
              '<dl>' +
              '<div><dt>' + esc(copy.recommendation) + '</dt><dd>' + esc(displayValue(item.recommendation)) + '</dd></div>' +
              '<div><dt>' + esc(copy.lifecycleState) + '</dt><dd>' + esc(displayValue(item.lifecycle_state)) + '</dd></div>' +
              '<div><dt>' + esc(copy.uses) + '</dt><dd>' + esc(item.uses) + '</dd></div>' +
              '<div><dt>' + esc(copy.score) + '</dt><dd>' + esc(item.score) + '</dd></div>' +
              '</dl>';
          } else {
            selectedPanel.innerHTML = '<p class="eyebrow">' + esc(copy.selected) + '</p><h2>' + esc(info.label) + '</h2><p>' + esc(info.id) + '</p><dl><div><dt>' + esc(copy.type) + '</dt><dd>' + esc(displayValue(info.type)) + '</dd></div><div><dt>' + esc(copy.weight) + '</dt><dd>' + esc(info.weight) + '</dd></div></dl>';
          }
        }
      };
      function selectHarness(id) {
        const nodeId = 'harness:' + id;
        if (window.__tinkGraph) window.__tinkGraph.select(nodeId);
        else window.__tinkGraphState.pendingSelect = nodeId;
      }
      document.querySelectorAll('[data-mode]').forEach((button) => {
        button.addEventListener('click', () => {
          const mode = button.dataset.mode;
          document.querySelectorAll('[data-mode]').forEach((item) => {
            const active = item.dataset.mode === mode;
            item.classList.toggle('active', active);
            item.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          window.__tinkGraphState.mode = mode;
          if (window.__tinkGraph) window.__tinkGraph.setMode(mode);
          setStatus(mode === 'core' ? copy.coreMode : copy.showingAll);
        });
      });
      function filterRecommendation(value, button) {
        const alreadyActive = button.classList.contains('active-filter');
        document.querySelectorAll('[data-filter-rec]').forEach((item) => {
          item.classList.remove('active-filter');
          item.setAttribute('aria-pressed', 'false');
        });
        if (alreadyActive) {
          cards.forEach((card) => card.classList.remove('is-filtered-out'));
          window.__tinkGraphState.filter = null;
          if (window.__tinkGraph) window.__tinkGraph.setFilter(null);
          setStatus(copy.showingAll);
          setFilterStatus(copy.showingAll);
          return;
        }
        button.classList.add('active-filter');
        button.setAttribute('aria-pressed', 'true');
        cards.forEach((card) => card.classList.toggle('is-filtered-out', card.dataset.recommendation !== value));
        window.__tinkGraphState.filter = value;
        if (window.__tinkGraph) window.__tinkGraph.setFilter(value);
        const label = recLabelByFilter[value] || value;
        setStatus(copy.filteredTo + ': ' + label);
        setFilterStatus(copy.filteredTo + ': ' + label);
      }
      document.querySelectorAll('[data-zoom]').forEach((button) => {
        button.addEventListener('click', () => {
          if (!window.__tinkGraph) return;
          if (button.dataset.zoom === 'reset') window.__tinkGraph.reset();
          else window.__tinkGraph.zoom(button.dataset.zoom === 'in' ? 0.78 : 1.28);
        });
      });
      const VALID_TABS = ['home', 'harnesses', 'memory', 'graph', 'activity'];
      const navLinks = Array.from(document.querySelectorAll('.nav a[data-tab]'));
      const pages = Array.from(document.querySelectorAll('.page'));
      const railSections = Array.from(document.querySelectorAll('[data-rail]'));
      function switchTab(name, options) {
        const tab = VALID_TABS.includes(name) ? name : 'home';
        navLinks.forEach((link) => {
          const active = link.dataset.tab === tab;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
        pages.forEach((page) => page.classList.toggle('is-active', page.dataset.page === tab));
        railSections.forEach((section) => {
          section.classList.toggle('is-rail-hidden', !section.dataset.rail.split(' ').includes(tab));
        });
        if (!options || options.updateHash !== false) {
          history.replaceState(null, '', '#' + tab);
        }
      }
      navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          switchTab(link.dataset.tab);
        });
      });
      document.querySelectorAll('[data-goto-tab]').forEach((button) => {
        button.addEventListener('click', () => switchTab(button.dataset.gotoTab));
      });
      window.addEventListener('hashchange', () => switchTab(location.hash.replace('#', ''), { updateHash: false }));
      switchTab(location.hash.replace('#', '') || 'home', { updateHash: false });
      document.querySelectorAll('[data-select-harness]').forEach((button) => {
        button.addEventListener('click', () => {
          switchTab('graph');
          selectHarness(button.dataset.selectHarness);
        });
      });
      document.querySelectorAll('.harness-summary').forEach((button) => {
        button.addEventListener('click', () => {
          const card = button.closest('.harness-card');
          const expanded = card.classList.toggle('is-expanded');
          button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
      });
      document.querySelectorAll('[data-filter-rec]').forEach((button) => {
        button.addEventListener('click', () => filterRecommendation(button.dataset.filterRec, button));
      });
    </script>
  `;
}

function renderGraph3DModule(copy) {
  const copyPayload = JSON.stringify({
    tooltipPrefix: copy.tooltipPrefix,
    type: copy.type
  }).replaceAll('<', '\\u003c');
  return `
    <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.162.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.162.0/examples/jsm/"
      }
    }
    </script>
    <script type="module">
    (async () => {
      const container = document.getElementById('graph-3d');
      const dataEl = document.getElementById('graph-data');
      if (!container || !dataEl) return;
      let THREE, OrbitControls;
      try {
        THREE = await import('three');
        ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
      } catch (error) {
        const fallback = document.getElementById('graph-3d-fallback');
        if (fallback) fallback.hidden = false;
        return;
      }
      const data = JSON.parse(dataEl.textContent);
      const copy3d = ${copyPayload};
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rootStyle = getComputedStyle(document.documentElement);
      const cssColor = (name, fallbackColor) => (rootStyle.getPropertyValue(name) || '').trim() || fallbackColor;
      const TYPE_HEX = {
        harness: cssColor('--accent', '#5B8DEF'),
        rule: '#9B8CFF',
        memory: '#4EC9B0',
        stage: '#D7A65A',
        unknown: '#7A8194'
      };

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.0019);
      const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
      const INITIAL_CAM = new THREE.Vector3(0, 24, 52);
      const INITIAL_TARGET = new THREE.Vector3(0, 0, 0);
      camera.position.copy(INITIAL_CAM);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000005, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      const labelLayer = document.createElement('div');
      labelLayer.className = 'graph3d-labels';
      container.appendChild(labelLayer);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = 0.12;
      controls.minDistance = 14;
      controls.maxDistance = 160;

      scene.add(new THREE.AmbientLight(0x8e9ab8, 0.85));
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
      keyLight.position.set(30, 45, 25);
      scene.add(keyLight);
      const coreLight = new THREE.PointLight(0xffe8ff, 0.5, 260);
      coreLight.position.set(0, -14, 0);
      scene.add(coreLight);

      function glowTexture(color) {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(canvas);
      }
      function glowSprite(color, scale) {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTexture(color),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        }));
        sprite.scale.set(scale, scale, 1);
        return sprite;
      }

      // --- galaxy backdrop (same recipe as the three.js reference) ---
      const GALAXY = { count: 70000, arms: 4, radius: 95, spin: 1.9, randomness: 0.28, power: 3, y: -16, flatten: 0.22 };
      const galaxyPositions = new Float32Array(GALAXY.count * 3);
      const galaxyColors = new Float32Array(GALAXY.count * 3);
      const insideColor = new THREE.Color(0xff66ff);
      const outsideColor = new THREE.Color(0x66ffff);
      for (let i = 0; i < GALAXY.count; i += 1) {
        const i3 = i * 3;
        const radius = Math.pow(Math.random(), GALAXY.power) * GALAXY.radius;
        const branchAngle = ((i % GALAXY.arms) / GALAXY.arms) * Math.PI * 2;
        const spinAngle = (radius / GALAXY.radius) * GALAXY.spin * Math.PI;
        const randomX = (Math.random() - 0.5) * GALAXY.randomness * radius;
        const randomY = (Math.random() - 0.5) * GALAXY.randomness * radius * GALAXY.flatten;
        const randomZ = (Math.random() - 0.5) * GALAXY.randomness * radius;
        galaxyPositions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        galaxyPositions[i3 + 1] = GALAXY.y + randomY;
        galaxyPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        const mixed = insideColor.clone().lerp(outsideColor, radius / GALAXY.radius);
        mixed.multiplyScalar(0.55 + 0.35 * Math.random());
        galaxyColors[i3] = mixed.r;
        galaxyColors[i3 + 1] = mixed.g;
        galaxyColors[i3 + 2] = mixed.b;
      }
      const galaxyGeometry = new THREE.BufferGeometry();
      galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
      galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));
      const galaxy = new THREE.Points(galaxyGeometry, new THREE.PointsMaterial({
        size: 0.16,
        vertexColors: true,
        depthWrite: false,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      }));
      scene.add(galaxy);

      const starGeometry = new THREE.BufferGeometry();
      const starCount = 4000;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i += 1) {
        starPositions[i * 3] = (Math.random() - 0.5) * 520;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 520;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 520;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85
      }));
      scene.add(stars);

      for (let i = 0; i < 10; i += 1) {
        const hue = Math.floor(Math.random() * 360);
        const nebula = glowSprite('hsla(' + hue + ', 80%, 55%, 0.4)', 50 + Math.random() * 70);
        nebula.position.set((Math.random() - 0.5) * 260, (Math.random() - 0.5) * 150 - 20, (Math.random() - 0.5) * 260);
        scene.add(nebula);
      }
      const coreGlow = glowSprite('rgba(255,240,255,0.85)', 26);
      coreGlow.position.set(0, GALAXY.y, 0);
      scene.add(coreGlow);

      // --- harness map: spheres, edges, pulses, labels ---
      function surfaceTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        context.fillStyle = '#B9BDC6';
        context.fillRect(0, 0, 256, 128);
        for (let i = 0; i < 70; i += 1) {
          const shade = 150 + Math.floor(Math.random() * 105);
          context.fillStyle = 'rgba(' + shade + ',' + shade + ',' + (shade + 8) + ',0.35)';
          context.beginPath();
          context.ellipse(Math.random() * 256, Math.random() * 128, 5 + Math.random() * 26, 3 + Math.random() * 10, Math.random() * Math.PI, 0, Math.PI * 2);
          context.fill();
        }
        for (let band = 0; band < 4; band += 1) {
          context.fillStyle = 'rgba(90,96,110,0.18)';
          context.fillRect(0, 16 + band * 30 + Math.random() * 8, 256, 5 + Math.random() * 8);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        return texture;
      }
      const sphereTexture = surfaceTexture();
      const sphereGeometry = new THREE.SphereGeometry(1, 32, 24);
      const graphGroup = new THREE.Group();
      scene.add(graphGroup);

      const nodeEntries = data.nodes.map((node) => {
        const colorHex = TYPE_HEX[node.type] || TYPE_HEX.unknown;
        const color = new THREE.Color(colorHex);
        const material = new THREE.MeshStandardMaterial({
          color,
          map: sphereTexture,
          roughness: 0.55,
          metalness: 0.1,
          emissive: color,
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 1
        });
        const mesh = new THREE.Mesh(sphereGeometry, material);
        mesh.position.set(node.x, node.y, node.z);
        mesh.scale.setScalar(node.r);
        mesh.userData = node;
        graphGroup.add(mesh);
        let ring = null;
        if (node.type === 'harness' && node.glow) {
          ring = new THREE.Mesh(
            new THREE.RingGeometry(node.r * 1.5, node.r * 2.15, 48),
            new THREE.MeshBasicMaterial({ color: 0x9aa6c0, side: THREE.DoubleSide, transparent: true, opacity: 0.3, depthWrite: false })
          );
          ring.position.copy(mesh.position);
          ring.rotation.x = Math.PI / 2.4;
          graphGroup.add(ring);
        }
        const label = document.createElement('span');
        label.className = 'graph3d-label' + (node.type === 'harness' ? '' : ' is-minor');
        label.textContent = node.label;
        labelLayer.appendChild(label);
        return { node, mesh, ring, label };
      });
      const entryById = new Map(nodeEntries.map((entry) => [entry.node.id, entry]));

      const edgeEntries = data.edges.map((edge) => {
        const source = entryById.get(edge.source);
        const target = entryById.get(edge.target);
        if (!source || !target) return null;
        const geometry = new THREE.BufferGeometry().setFromPoints([source.mesh.position, target.mesh.position]);
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(TYPE_HEX[source.node.type] || TYPE_HEX.unknown),
          transparent: true,
          opacity: 0.3,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        const line = new THREE.Line(geometry, material);
        graphGroup.add(line);
        const pulse = glowSprite('rgba(190,215,255,0.95)', 1.5);
        pulse.material.opacity = 0;
        graphGroup.add(pulse);
        return {
          edge,
          source,
          target,
          line,
          pulse,
          dur: 2.6 + Math.random() * 3.2,
          phase: Math.random()
        };
      }).filter(Boolean);

      // --- state: selection, mode, filter ---
      const state = window.__tinkGraphState || { mode: 'full', filter: null, pendingSelect: null };
      let selectedId = null;
      function relatedIds(id) {
        const related = new Set([id]);
        edgeEntries.forEach((entry) => {
          if (entry.edge.source === id) related.add(entry.edge.target);
          if (entry.edge.target === id) related.add(entry.edge.source);
        });
        return related;
      }
      function applyState() {
        const related = selectedId ? relatedIds(selectedId) : null;
        nodeEntries.forEach((entry) => {
          const visible = state.mode !== 'core' || entry.node.core;
          entry.mesh.visible = visible;
          let dim = 1;
          if (state.filter && entry.node.type === 'harness' && entry.node.recommendation !== state.filter) dim = 0.12;
          if (related && !related.has(entry.node.id)) dim = Math.min(dim, 0.1);
          const isSelected = entry.node.id === selectedId;
          entry.mesh.material.opacity = dim;
          entry.mesh.material.emissiveIntensity = isSelected ? 0.85 : (related && related.has(entry.node.id) ? 0.45 : 0.25);
          entry.mesh.scale.setScalar(entry.node.r * (isSelected ? 1.3 : 1));
          if (entry.ring) {
            entry.ring.visible = visible;
            entry.ring.material.opacity = 0.3 * dim;
          }
          entry.label.style.opacity = visible ? String(Math.max(dim, isSelected ? 1 : 0)) : '0';
          entry.label.classList.toggle('is-selected', isSelected);
        });
        edgeEntries.forEach((entry) => {
          const visible = entry.source.mesh.visible && entry.target.mesh.visible;
          entry.line.visible = visible;
          entry.pulse.visible = visible && !reducedMotion;
          const isRelated = related && (entry.edge.source === selectedId || entry.edge.target === selectedId);
          const filtered = state.filter && (entry.source.mesh.material.opacity < 0.2 || entry.target.mesh.material.opacity < 0.2);
          entry.line.material.opacity = related ? (isRelated ? 0.85 : 0.04) : (filtered ? 0.05 : 0.3);
          entry.pulseFactor = related ? (isRelated ? 1 : 0.05) : (filtered ? 0.08 : 1);
        });
      }
      function emitSelection() {
        if (!window.__tinkGraphBridge) return;
        if (!selectedId) {
          window.__tinkGraphBridge.onSelect(null);
          return;
        }
        const entry = entryById.get(selectedId);
        window.__tinkGraphBridge.onSelect(entry ? {
          id: entry.node.id,
          label: entry.node.label,
          type: entry.node.type,
          weight: entry.node.weight
        } : null);
      }
      window.__tinkGraph = {
        select(id) {
          if (!entryById.has(id)) return;
          selectedId = id;
          applyState();
          emitSelection();
        },
        clear() {
          selectedId = null;
          applyState();
          emitSelection();
        },
        setMode(mode) {
          state.mode = mode;
          applyState();
        },
        setFilter(value) {
          state.filter = value;
          applyState();
        },
        zoom(factor) {
          camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
          controls.update();
        },
        reset() {
          camera.position.copy(INITIAL_CAM);
          controls.target.copy(INITIAL_TARGET);
          controls.update();
        }
      };
      applyState();
      if (state.pendingSelect) {
        window.__tinkGraph.select(state.pendingSelect);
        state.pendingSelect = null;
      }

      // --- picking: hover tooltip + click selection ---
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const tooltip = document.getElementById('graph-tooltip');
      let downAt = null;
      function pick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const meshes = nodeEntries.filter((entry) => entry.mesh.visible && entry.mesh.material.opacity > 0.2).map((entry) => entry.mesh);
        const hits = raycaster.intersectObjects(meshes, false);
        return hits.length ? hits[0].object.userData : null;
      }
      renderer.domElement.addEventListener('pointerdown', (event) => {
        downAt = { x: event.clientX, y: event.clientY };
      });
      renderer.domElement.addEventListener('pointerup', (event) => {
        if (!downAt) return;
        const moved = Math.abs(event.clientX - downAt.x) + Math.abs(event.clientY - downAt.y);
        downAt = null;
        if (moved > 6) return;
        const hit = pick(event);
        if (hit) window.__tinkGraph.select(hit.id);
        else window.__tinkGraph.clear();
      });
      renderer.domElement.addEventListener('pointermove', (event) => {
        const hit = pick(event);
        renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
        if (!tooltip) return;
        if (hit) {
          tooltip.textContent = copy3d.tooltipPrefix + ': ' + hit.label + ' - ' + hit.type;
          tooltip.style.left = Math.min(event.clientX + 14, window.innerWidth - 240) + 'px';
          tooltip.style.top = Math.max(event.clientY - 12, 12) + 'px';
          tooltip.classList.add('is-visible');
        } else {
          tooltip.classList.remove('is-visible');
        }
      });
      renderer.domElement.addEventListener('pointerleave', () => {
        if (tooltip) tooltip.classList.remove('is-visible');
      });
      renderer.domElement.addEventListener('dblclick', () => window.__tinkGraph.reset());

      // --- sizing ---
      function resize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      new ResizeObserver(resize).observe(container);
      resize();

      // --- animate ---
      const clock = new THREE.Clock();
      const projection = new THREE.Vector3();
      function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsed = clock.elapsedTime;
        if (!container.clientWidth) return;
        controls.update();
        if (!reducedMotion) {
          galaxy.rotation.y += delta * 0.012;
          stars.rotation.y += delta * 0.004;
          nodeEntries.forEach((entry) => {
            entry.mesh.rotation.y += delta * entry.node.spin;
          });
          edgeEntries.forEach((entry) => {
            const t = ((elapsed / entry.dur) + entry.phase) % 1;
            entry.pulse.position.lerpVectors(entry.source.mesh.position, entry.target.mesh.position, t);
            entry.pulse.material.opacity = Math.sin(Math.PI * t) * 0.9 * (entry.pulseFactor ?? 1);
          });
        }
        const width = container.clientWidth;
        const height = container.clientHeight;
        nodeEntries.forEach((entry) => {
          projection.copy(entry.mesh.position);
          projection.y += entry.mesh.scale.x + 0.6;
          projection.project(camera);
          const behind = projection.z > 1;
          if (behind || !entry.mesh.visible) {
            entry.label.style.display = 'none';
            return;
          }
          entry.label.style.display = '';
          const x = (projection.x * 0.5 + 0.5) * width;
          const y = (-projection.y * 0.5 + 0.5) * height;
          entry.label.style.transform = 'translate(-50%, -100%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
        });
        renderer.render(scene, camera);
      }
      animate();
    })();
    </script>
  `;
}

function renderStyles() {
  return `<style>
    :root {
      color-scheme: dark;
      --bg-page: #0A0A0A;
      --bg-card: #111111;
      --bg-hover: #161616;
      --bg-selected: #1C1C1C;
      --border-default: #1F1F1F;
      --border-hover: #2A2A2A;
      --border-strong: #383838;
      --text-primary: #E8E8E8;
      --text-secondary: #666666;
      --text-muted: #3D3D3D;
      --accent: #2563EB;
      --accent-dim: #1E2D4A;
      --accent-text: #93C5FD;
      --success: #22C55E;
      --success-dim: #14291E;
      --warning: #F59E0B;
      --warning-dim: #2A1F0A;
      --danger: #EF4444;
      --danger-dim: #2A0F0F;
      --font-ui: 'IBM Plex Sans', -apple-system, sans-serif;
      --font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 8px;
      --border-width: 1px;
      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-6: 24px;
      --space-8: 32px;
      --chart-line: #2563EB;
      --chart-line-w: 1.5px;
      --chart-area: rgba(37, 99, 235, 0.06);
      --chart-grid: #1F1F1F;
      --chart-dot-fill: #111111;
      --chart-dot-stroke: #2563EB;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background: var(--bg-page);
      color: var(--text-primary);
      font-family: var(--font-ui);
      font-size: 13px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    a { color: inherit; text-decoration: none; }

    .app-shell {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 200px minmax(0, 1fr) 240px;
    }

    .sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      border-right: 1px solid var(--border-default);
      background: var(--bg-page);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .brand-mark {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      display: grid;
      place-items: center;
      font-size: 16px;
      background: var(--bg-hover);
      color: var(--accent-text);
      border: 1px solid var(--border-default);
    }

    .brand strong,
    .topbar strong {
      margin: 0;
      display: block;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.1;
    }

    .brand span,
    .topbar span {
      display: block;
      margin-top: 2px;
      color: var(--text-secondary);
      font-size: 11px;
    }

    .nav {
      display: grid;
      gap: var(--space-1);
      border-top: 1px solid var(--border-default);
      padding-top: var(--space-3);
      margin: 0;
      list-style: none;
    }

    .nav a {
      color: var(--text-secondary);
      font-size: 13px;
      padding: var(--space-1) var(--space-2);
      border-left: var(--border-width) solid transparent;
      border-radius: 0;
      border-radius: var(--radius-sm);
    }

    .nav a.nav-disabled {
      cursor: default;
      color: var(--text-muted);
      pointer-events: none;
      opacity: 0.65;
      text-transform: none;
    }

    .nav-note {
      margin: 0;
      color: var(--text-muted);
      font-size: 11px;
      line-height: 1.3;
    }

    .nav a.active {
      color: var(--text-primary);
      background: var(--bg-selected);
      border-left-color: var(--accent);
      font-weight: 500;
    }

    .main {
      min-width: 0;
      padding: 0 var(--space-6) var(--space-6);
      border-right: 1px solid var(--border-default);
    }

    .topbar {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-default);
      margin: 0 calc(-1 * var(--space-6));
      padding: 0 var(--space-6);
      background: var(--bg-card);
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      border: 1px solid var(--border-default);
      background: var(--bg-hover);
      color: var(--text-primary);
      font-size: 11px;
      padding: 7px 9px;
      border-radius: var(--radius-md);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 500;
    }

    .status i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--success);
      border: 1px solid var(--success);
    }

    .hero {
      padding: var(--space-6) 0;
      border-bottom: 1px solid var(--border-default);
      display: flex;
      justify-content: space-between;
      gap: var(--space-4);
      align-items: flex-start;
    }

    .hero h1 {
      margin: 0 0 var(--space-2);
      font-size: 26px;
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.2;
      color: var(--text-primary);
    }

    .hero p {
      margin: 0;
      color: var(--text-secondary);
      max-width: 760px;
      font-size: 13px;
      line-height: 1.55;
    }

    .hero-sidebar {
      width: 280px;
      display: grid;
      gap: var(--space-2);
    }

    .hero .meta-chip {
      margin: 0;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-2);
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 11px;
      background: var(--bg-hover);
    }

    .hero-metric {
      display: grid;
      gap: var(--space-1);
      grid-template-columns: 1fr 1fr;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      padding: var(--space-2);
      background: var(--bg-hover);
    }

    .hero-metric p,
    .hero-metric small {
      margin: 0;
      color: var(--text-secondary);
      font-size: 11px;
      font-family: var(--font-ui);
      line-height: 1.2;
    }

    .hero-metric strong {
      grid-column: 1 / -1;
      font-family: var(--font-mono);
      font-size: 22px;
      line-height: 1.1;
      letter-spacing: -0.04em;
      font-weight: 600;
      color: var(--text-primary);
    }

    .eyebrow {
      margin: 0 0 var(--space-1);
      color: var(--text-secondary);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 500;
    }

    .content-grid { display: grid; gap: var(--space-3); margin-top: var(--space-3); }

    .project-strip {
      display: block;
      border-bottom: 1px solid var(--border-default);
      padding-bottom: var(--space-3);
      margin-bottom: 0;
    }

    .project-strip-status {
      margin: 0 0 var(--space-2);
      color: var(--text-secondary);
      font-size: 11px;
      letter-spacing: 0.06em;
      font-weight: 500;
      text-transform: uppercase;
    }

    .project-strip-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(120px, 1fr));
      gap: var(--space-2);
    }

    .project-card {
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      text-align: left;
      cursor: pointer;
      font-family: var(--font-ui);
      color: var(--text-primary);
      position: relative;
      transition: border-color 120ms ease, background 120ms ease;
      display: block;
      outline: none;
    }

    .project-card:hover,
    .project-card:focus-visible,
    .project-card.active-filter {
      border-color: var(--accent);
      background: var(--bg-selected);
      color: var(--text-primary);
      border-left-color: var(--accent);
    }

    .project-card.active-filter {
      border-left-width: 2px;
      border-color: var(--accent);
      background: var(--accent-dim);
      color: var(--text-primary);
      outline: 1px solid var(--accent);
      outline-offset: -1px;
    }

    .project-card.active-filter::before {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 2px;
      background: var(--accent);
      border-top-left-radius: var(--radius-sm);
      border-bottom-left-radius: var(--radius-sm);
    }

    .project-card.active-filter .project-bar {
      height: 4px;
      background: var(--accent);
    }

    .project-card.active-filter::after {
      content: '';
      position: absolute;
      inset: 2px;
      border: 1px solid var(--accent);
      border-radius: calc(var(--radius-lg) - 1px);
      pointer-events: none;
    }

    .project-card:hover .project-bar {
      opacity: 0.85;
    }

    .project-card h3 {
      font-size: 13px;
      font-weight: 500;
      margin: 0 0 4px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .project-count {
      font-size: 22px;
      font-family: var(--font-mono);
      letter-spacing: -0.04em;
      font-weight: 600;
      color: var(--text-primary);
    }

    .project-card p {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.3;
      margin: 0 0 10px;
      min-height: 36px;
    }

    .project-card.active-filter p,
    .project-card.active-filter .project-count,
    .project-card.active-filter h3 {
      color: var(--text-primary);
    }

    .project-card.active-filter h3 { color: var(--accent-text); }

    .project-card.active-filter .project-count {
      color: var(--accent-text);
    }

    .project-card strong {
      position: absolute;
      right: 11px;
      bottom: 10px;
      font-size: 11px;
      font-family: var(--font-ui);
      font-weight: 400;
      color: var(--text-secondary);
    }

    .project-bar {
      position: absolute;
      inset: 0 0 auto 0;
      height: 2px;
      background: var(--accent);
    }

    .project-card.keep .project-bar { background: var(--success); }
    .project-card.weave .project-bar { background: var(--warning); }
    .project-card.frog_candidate .project-bar { background: var(--danger); }
    .project-card.merge_candidate .project-bar { background: var(--accent); }
    .project-card.observe .project-bar { background: var(--text-secondary); }

    .map-panel,
    .timeline,
    .harness-card,
    .insight-card {
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-3);
    }

    .map-head { display: flex; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-3); }

    .map-head h2,
    .panel-title h2,
    .insight-card h2,
    .harness-section h2 {
      margin: 0 0 8px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .map-head p,
    .panel-title p,
    .insight-card p,
    .timeline p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 11px;
      line-height: 1.35;
    }

    .map-controls {
      display: inline-flex;
      gap: 2px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      height: 30px;
      align-items: center;
      padding: 2px;
      background: var(--bg-hover);
    }

    .map-controls button {
      border: 0;
      background: transparent;
      color: var(--text-secondary);
      padding: 0 10px;
      border-radius: var(--radius-md);
      height: 24px;
      font-size: 11px;
      font-weight: 400;
      cursor: pointer;
      border: 1px solid transparent;
      transition: color 120ms ease, background-color 120ms ease, border-color 120ms ease;
    }

    .map-controls button.active {
      color: var(--accent-text);
      background: var(--accent-dim);
      border-color: var(--accent);
    }

    .graph-canvas {
      width: 100%;
      aspect-ratio: 1090 / 680;
      border: 1px solid var(--border-default);
      display: block;
      background: var(--bg-card);
    }

    .graph-edge,
    .graph-canvas .labels {
      pointer-events: none;
    }

    .graph-canvas text {
      pointer-events: none;
      fill: var(--text-secondary);
      font-size: 11px;
      font-family: var(--font-mono);
      animation: label-in 600ms ease 900ms backwards;
    }

    @keyframes label-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .graph-edge {
      stroke: var(--chart-line);
      stroke-width: var(--chart-line-w);
      opacity: 0.24;
      transition: opacity 220ms ease, stroke-width 220ms ease;
      animation: edge-in 700ms ease var(--edge-delay, 0ms) backwards;
    }

    @keyframes edge-in {
      from { opacity: 0; }
    }

    .graph-edge.is-related { opacity: 0.9; stroke-width: 2px; }

    .node-float {
      animation: node-float var(--float-dur, 6s) ease-in-out var(--float-delay, 0ms) infinite alternate;
    }

    @keyframes node-float {
      from { transform: translate(0, 0); }
      to { transform: translate(var(--float-x, 2px), var(--float-y, -2px)); }
    }

    .graph-node {
      cursor: default;
      outline: none;
      vector-effect: non-scaling-stroke;
      shape-rendering: geometricPrecision;
      paint-order: stroke fill;
      transform-box: fill-box;
      transform-origin: center;
      transition: opacity 220ms ease, transform 220ms cubic-bezier(0.2, 0.8, 0.3, 1.1), stroke 160ms ease, stroke-opacity 160ms ease, fill-opacity 160ms ease;
      animation: node-enter 500ms cubic-bezier(0.2, 0.8, 0.3, 1.2) var(--enter-delay, 0ms) backwards;
    }

    @keyframes node-enter {
      from { opacity: 0; transform: scale(0.2); }
      to { opacity: 1; transform: scale(1); }
    }

    .graph-node.is-interactive {
      cursor: pointer;
    }

    .graph-node:not(.is-interactive) {
      opacity: 0.8;
      pointer-events: none;
    }

    .graph-node.is-interactive:hover,
    .graph-node.is-interactive:focus-visible {
      stroke: var(--accent);
      stroke-opacity: 1;
      transform: scale(1.28);
    }

    .graph-node.is-selected {
      stroke: var(--accent);
      stroke-opacity: 1;
      animation: node-pulse 1.6s ease-in-out infinite;
    }

    @keyframes node-pulse {
      0%, 100% { stroke-width: 1.8px; transform: scale(1.12); }
      50% { stroke-width: 5px; transform: scale(1.2); }
    }

    .graph-node.is-related { opacity: 1; }
    .graph-node.is-hidden,
    .graph-edge.is-hidden,
    .graph-node.is-filtered-out,
    .graph-edge.is-filtered-out { opacity: 0.12; pointer-events: none; }

    .graph-tooltip {
      position: fixed;
      z-index: 20;
      visibility: hidden;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 160ms ease, transform 160ms ease, visibility 0s linear 160ms;
      max-width: 230px;
      padding: 8px 10px;
      border: 1px solid var(--border-hover);
      border-radius: var(--radius-md);
      background: var(--bg-selected);
      color: var(--text-primary);
      font-size: 11px;
      line-height: 1.3;
      pointer-events: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    }
    .graph-tooltip.is-visible {
      visibility: visible;
      opacity: 1;
      transform: translateY(0);
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .map-panel,
    .graph-canvas,
    .graph-canvas text {
      user-select: none;
      -webkit-user-select: none;
      -webkit-user-drag: none;
    }

    .star-twinkle {
      animation: star-twinkle 3.4s ease-in-out var(--twinkle-delay, 0ms) infinite alternate;
    }

    @keyframes star-twinkle {
      from { opacity: 0.08; }
      to { opacity: 0.6; }
    }

    .galaxy-layer { pointer-events: none; }

    .nebula { mix-blend-mode: screen; }

    .galaxy-spiral {
      transform-origin: 545px 340px;
      transform-box: view-box;
      animation: galaxy-rotate 420s linear infinite;
      mix-blend-mode: screen;
    }

    @keyframes galaxy-rotate {
      to { transform: rotate(360deg); }
    }

    .galaxy-core {
      mix-blend-mode: screen;
      animation: core-breathe 9s ease-in-out infinite alternate;
    }

    @keyframes core-breathe {
      from { opacity: 0.5; }
      to { opacity: 0.9; }
    }

    .pulse-wrap { transition: opacity 260ms ease; }
    .pulse-wrap.is-hidden { opacity: 0; }
    .pulse-wrap.is-dimmed { opacity: 0.08; }

    .edge-pulse {
      filter: drop-shadow(0 0 4px rgba(157, 196, 255, 0.9));
    }

    .orbit-ring {
      fill: none;
      stroke: var(--text-secondary);
      stroke-opacity: 0.14;
      stroke-width: 0.7;
      stroke-dasharray: 2 5;
    }

    .orbit-spin {
      animation: orbit-rotate var(--orbit-dur, 40s) linear infinite;
    }

    .orbit-spin.is-reverse { animation-direction: reverse; }

    @keyframes orbit-rotate {
      to { transform: rotate(360deg); }
    }

    .orbit-dot { opacity: 0.85; }

    .orbit-system {
      transition: opacity 260ms ease;
    }

    .orbit-system.is-hidden,
    .orbit-system.is-mode-hidden { opacity: 0; pointer-events: none; }
    .orbit-system.is-dimmed { opacity: 0.08; }

    .planet-ring {
      fill: none;
      stroke: var(--text-secondary);
      stroke-opacity: 0.4;
      stroke-width: 1.4;
      pointer-events: none;
    }

    .graph-canvas.has-selection .graph-node:not(.is-selected):not(.is-related) {
      opacity: 0.14;
      filter: blur(1.2px);
    }

    .graph-canvas.has-selection .graph-edge:not(.is-related) { opacity: 0.05; }

    .graph-canvas.has-selection .planet-ring { stroke-opacity: 0.1; }

    .graph-canvas.has-selection .labels text { opacity: 0.18; transition: opacity 220ms ease; }

    .graph-3d {
      position: relative;
      height: 620px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: #000005;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }

    .graph-3d:active { cursor: grabbing; }

    .graph-3d canvas { display: block; }

    .graph3d-labels {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .graph3d-label {
      position: absolute;
      left: 0;
      top: 0;
      font-family: var(--font-mono);
      font-size: 11px;
      color: rgba(222, 230, 248, 0.88);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.95);
      white-space: nowrap;
      transition: opacity 220ms ease;
      will-change: transform;
    }

    .graph3d-label.is-minor {
      font-size: 10px;
      color: rgba(168, 178, 200, 0.6);
    }

    .graph3d-label.is-selected {
      color: #FFFFFF;
      font-weight: 600;
    }

    .graph-3d-fallback {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      margin: 0;
      padding: var(--space-4);
      color: var(--text-secondary);
      font-size: 13px;
      text-align: center;
    }

    .map-controls-row {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      flex-wrap: wrap;
    }

    .graph-canvas {
      cursor: grab;
      touch-action: none;
    }

    .graph-canvas.is-panning { cursor: grabbing; }

    #graph-viewport {
      will-change: transform;
    }

    #graph-viewport.is-resetting {
      transition: transform 340ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .graph-node.is-interactive {
      filter: drop-shadow(0 5px 7px rgba(0, 0, 0, 0.55));
    }

    .graph-node.is-interactive:hover,
    .graph-node.is-interactive:focus-visible {
      filter: drop-shadow(0 9px 14px rgba(0, 0, 0, 0.65));
    }

    .map-guide .panel-title p:last-child {
      font-size: 12px;
      line-height: 1.5;
    }

    .guide-list {
      margin: var(--space-3) 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: var(--space-2);
    }

    .guide-list li {
      display: grid;
      grid-template-columns: 76px 1fr;
      gap: var(--space-2);
      align-items: start;
      font-size: 12px;
      line-height: 1.45;
      color: var(--text-secondary);
    }

    .guide-list strong {
      color: var(--text-primary);
      font-size: 12px;
      font-weight: 500;
    }

    .guide-list kbd {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--accent-text);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      background: var(--bg-hover);
      padding: 2px 5px;
      text-align: center;
      white-space: nowrap;
    }

    .guide-controls { border-top: 1px solid var(--border-default); padding-top: var(--space-3); }

    .guide-relations li { grid-template-columns: 96px 1fr; }
    .guide-relations code { font-size: 10px; }

    .map-legend {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-3);
      padding-top: var(--space-3);
      border-top: 1px solid var(--border-default);
      flex-wrap: wrap;
    }

    .legend-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      font-size: 11px;
      font-family: var(--font-mono);
    }

    .legend-chip i {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      display: inline-block;
    }

    @media (prefers-reduced-motion: reduce) {
      .node-float,
      .graph-node,
      .graph-edge,
      .graph-canvas text,
      .orbit-spin,
      .star-twinkle,
      .galaxy-spiral,
      .galaxy-core,
      .page.is-active { animation: none; }
      .graph-node { transition: none; }
      .pulses { display: none; }
    }

    .map-caption {
      display: flex;
      gap: var(--space-2);
      margin-top: var(--space-2);
      color: var(--text-secondary);
      font-size: 11px;
      flex-wrap: wrap;
    }

    .right-rail {
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: auto;
      border-left: 1px solid var(--border-default);
      padding: var(--space-6) var(--space-4) var(--space-4);
      background: var(--bg-page);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .stats-grid article,
    .insight-card { border: 1px solid var(--border-default); border-radius: var(--radius-lg); background: var(--bg-card); padding: var(--space-3); }

    .stats-grid span,
    .stats-grid small,
    dt {
      display: block;
      color: var(--text-secondary);
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-weight: 400;
    }

    .stats-grid strong {
      display: block;
      margin-top: 4px;
      font-size: 22px;
      font-family: var(--font-mono);
      letter-spacing: -0.04em;
      font-weight: 600;
      color: var(--text-primary);
    }

    .project-card.is-filtered-out {
      display: none;
    }

    .meter {
      height: 2px;
      margin: var(--space-2) 0;
      background: var(--border-default);
      border: 1px solid var(--border-default);
      border-radius: 1px;
      overflow: hidden;
    }

    .meter span {
      display: block;
      height: 100%;
      background: var(--accent);
      width: 0;
      transition: width 180ms ease;
    }

    .harness-section { margin-top: var(--space-3); }

    .harness-section h2 { margin: 0 0 var(--space-3); }

    .harness-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-2);
      align-items: start;
    }

    .harness-card {
      transition: opacity 160ms ease, border-color 160ms ease;
      padding: 0;
      overflow: hidden;
    }

    .harness-card:hover,
    .harness-card.is-selected,
    .harness-card.is-expanded {
      border-color: var(--border-hover);
      outline: none;
    }

    .harness-card.is-expanded { border-color: var(--border-strong); }

    .harness-card.is-filtered-out { display: none; }

    .harness-card.keep { border-top: 2px solid var(--success); }
    .harness-card.weave { border-top: 2px solid var(--warning); }
    .harness-card.frog_candidate { border-top: 2px solid var(--danger); }
    .harness-card.merge_candidate { border-top: 2px solid var(--accent); }
    .harness-card.observe { border-top: 2px solid var(--text-secondary); }

    .harness-summary {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr auto 14px;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3);
      border: 0;
      background: transparent;
      color: var(--text-primary);
      font-family: var(--font-ui);
      text-align: left;
      cursor: pointer;
    }

    .harness-summary:hover { background: var(--bg-hover); }

    .harness-summary .eyebrow { margin: 0 0 2px; font-size: 10px; }

    .harness-summary h3 {
      margin: 0;
      font-size: 14px;
      line-height: 1.25;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .harness-mini {
      display: grid;
      gap: 2px;
      justify-items: end;
    }

    .harness-mini span {
      color: var(--text-secondary);
      font-size: 11px;
      white-space: nowrap;
    }

    .harness-mini strong {
      font-size: 18px;
      line-height: 1;
      font-family: var(--font-mono);
      font-weight: 600;
    }

    .chevron {
      width: 7px;
      height: 7px;
      border-right: 1.5px solid var(--text-secondary);
      border-bottom: 1.5px solid var(--text-secondary);
      transform: rotate(45deg);
      transition: transform 240ms ease;
      justify-self: center;
    }

    .harness-card.is-expanded .chevron { transform: rotate(225deg); }

    .harness-detail {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .harness-card.is-expanded .harness-detail { grid-template-rows: 1fr; }

    .harness-detail-inner {
      overflow: hidden;
      min-height: 0;
      padding: 0 var(--space-3);
      display: grid;
      gap: var(--space-2);
      opacity: 0;
      transition: opacity 240ms ease 60ms, padding 320ms ease;
    }

    .harness-card.is-expanded .harness-detail-inner {
      opacity: 1;
      padding: var(--space-1) var(--space-3) var(--space-3);
    }

    .harness-reason {
      margin: 0;
      color: var(--text-secondary);
      font-size: 12px;
      line-height: 1.5;
    }

    .detail-label {
      margin: var(--space-1) 0 0;
      color: var(--text-secondary);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .co-used-chips { display: flex; flex-wrap: wrap; gap: 6px; }

    .co-chip {
      border: 1px solid var(--border-default);
      background: var(--bg-hover);
      border-radius: var(--radius-sm);
      padding: 2px 6px;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-secondary);
    }

    .factor-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 4px;
    }

    .factor-list li {
      display: flex;
      justify-content: space-between;
      gap: var(--space-2);
      font-size: 12px;
      color: var(--text-secondary);
    }

    .factor-list strong { font-family: var(--font-mono); color: var(--text-primary); font-weight: 500; }

    .harness-next {
      margin: 0;
      color: var(--text-primary);
      font-size: 12px;
      line-height: 1.5;
    }

    .evidence-list {
      margin: 0;
      padding-left: 16px;
      color: var(--text-secondary);
      font-size: 11px;
      display: grid;
      gap: 3px;
    }

    .harness-card .link-button { margin-top: var(--space-1); justify-self: start; }

    .history-section {
      margin-top: var(--space-6);
      border-top: 1px solid var(--border-default);
      padding-top: var(--space-4);
    }

    .history-feed {
      margin: var(--space-3) 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: var(--space-2);
    }

    .history-feed li {
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: var(--space-3);
      align-items: start;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      padding: var(--space-2) var(--space-3);
    }

    .history-type {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      padding: 3px 6px;
      margin-top: 2px;
      text-align: center;
    }

    .history-type.memory { color: var(--accent-text); border-color: var(--accent-dim); }
    .history-type.weave { color: var(--warning); border-color: var(--warning-dim); }
    .history-type.frog { color: var(--danger); border-color: var(--danger-dim); }
    .history-type.harness-create,
    .history-type.harness-edit { color: var(--success); border-color: var(--success-dim); }

    .history-feed strong { font-size: 12px; font-weight: 500; }

    .history-harnesses {
      margin: 2px 0 0;
      color: var(--text-secondary);
      font-size: 11px;
      font-family: var(--font-mono);
    }

    .history-files { margin: 4px 0 0; display: flex; flex-wrap: wrap; gap: 4px; }

    .harness-card dl,
    .selected dl,
    .graph-overview dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 9px;
      margin: 0;
    }

    dt { margin: 0; }
    dd {
      margin: 3px 0 0;
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-weight: 500;
      overflow-wrap: anywhere;
    }

    details { margin-top: 10px; color: var(--text-secondary); }
    summary { cursor: pointer; font-size: 12px; color: var(--text-primary); }
    details ul { margin: 8px 0 0; padding-left: 18px; }

    .edge-sample { display: flex; gap: var(--space-2); flex-wrap: wrap; }
    .selected { padding-bottom: 16px; }

    .ranked {
      margin: 10px 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: var(--space-3);
    }

    .ranked li {
      position: relative;
      color: var(--text-secondary);
      padding-bottom: 10px;
    }

    .ranked-button {
      width: 100%;
      border: 0;
      background: transparent;
      color: inherit;
      padding: 0;
      text-align: left;
      cursor: pointer;
      font: inherit;
    }

    .ranked span {
      display: block;
      padding-right: 38px;
      color: var(--text-primary);
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ranked strong {
      position: absolute;
      right: 0;
      top: 0;
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-weight: 500;
    }

    .ranked i {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background: var(--success-dim);
    }

    .timeline { padding: 0; }
    .timeline ol {
      margin: 12px 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 11px;
    }

    .timeline li {
      display: grid;
      grid-template-columns: 8px 1fr;
      gap: var(--space-2);
      align-items: start;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-secondary);
      margin-top: 6px;
    }

    .dot.success,
    .dot.keep { background: var(--success); }
    .dot.blocked,
    .dot.weave { background: var(--warning); }
    .dot.failed,
    .dot.frog_candidate { background: var(--danger); }
    .dot.recorded,
    .dot.successful,
    .dot.completed { background: var(--text-secondary); }

    .timeline strong { font-size: 13px; }

    code {
      display: inline-block;
      max-width: 100%;
      color: var(--text-secondary);
      background: var(--accent-dim);
      border: 1px solid var(--border-default);
      padding: 2px 4px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 11px;
      overflow-wrap: anywhere;
    }

    .harness-section h2,
    .timeline h2 {
      margin-top: 0;
      margin-bottom: 8px;
    }

    .page { display: none; padding-top: var(--space-2); }
    .page[data-page="graph"].is-active { padding-top: var(--space-4); }
    .page.is-active {
      display: block;
      animation: page-in 220ms ease;
    }

    @keyframes page-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    [data-rail].is-rail-hidden { display: none; }

    .page-head {
      padding: var(--space-6) 0 var(--space-4);
      border-bottom: 1px solid var(--border-default);
      margin-bottom: var(--space-4);
    }

    .page-head h1 {
      margin: 0 0 var(--space-2);
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.2;
    }

    .page-head p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 12px;
      max-width: 680px;
    }

    .page-head .eyebrow { margin-bottom: var(--space-2); }

    .home-stats {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: var(--space-2);
      padding: var(--space-4) 0;
      border-bottom: 1px solid var(--border-default);
    }

    .home-stats article {
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      padding: var(--space-3);
      transition: border-color 160ms ease;
    }

    .home-stats article:hover { border-color: var(--border-hover); }

    .home-stats span,
    .home-stats small {
      display: block;
      color: var(--text-secondary);
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .home-stats small {
      text-transform: none;
      letter-spacing: 0;
      color: var(--text-muted);
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .home-stats strong {
      display: block;
      margin-top: var(--space-2);
      font-size: 24px;
      font-family: var(--font-mono);
      letter-spacing: -0.04em;
      font-weight: 600;
    }

    .home-columns {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      gap: var(--space-3);
      margin-top: var(--space-4);
      align-items: start;
    }

    .home-columns .timeline,
    .routing-card { margin-bottom: 0; height: 100%; }

    .home-columns .timeline { padding: var(--space-4); }

    .link-button {
      border: 0;
      background: transparent;
      color: var(--accent-text);
      font-size: 12px;
      font-family: var(--font-ui);
      cursor: pointer;
      padding: 0;
      margin-top: var(--space-2);
    }

    .link-button:hover { text-decoration: underline; }

    .routing-list {
      margin: var(--space-3) 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: var(--space-3);
    }

    .routing-list li {
      border-left: 2px solid var(--accent-dim);
      padding-left: var(--space-3);
    }

    .routing-list li:hover { border-left-color: var(--accent); }

    .routing-harness {
      border: 0;
      background: transparent;
      color: var(--accent-text);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
    }

    .routing-harness:hover { text-decoration: underline; }

    .routing-list p {
      margin: 3px 0 0;
      color: var(--text-secondary);
      font-size: 12px;
      line-height: 1.45;
    }

    .memory-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-3);
    }

    .memory-card h3 { margin: 0 0 var(--space-2); font-size: 13px; font-weight: 500; }
    .memory-card code { font-size: 12px; }

    .empty-note {
      color: var(--text-secondary);
      font-size: 13px;
      border: 1px dashed var(--border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      text-align: center;
    }

    .activity-feed { padding: var(--space-4); }
    .activity-feed ol { gap: var(--space-3); }

    .run-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .run-row time {
      color: var(--text-secondary);
      font-size: 11px;
      font-family: var(--font-mono);
    }

    .run-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm);
      padding: 2px 6px;
      color: var(--text-secondary);
    }

    .run-badge.success { color: var(--success); border-color: var(--success-dim); background: var(--success-dim); }
    .run-badge.blocked { color: var(--warning); border-color: var(--warning-dim); background: var(--warning-dim); }
    .run-badge.failed { color: var(--danger); border-color: var(--danger-dim); background: var(--danger-dim); }
    .run-badge.recorded { background: var(--bg-hover); }

    .run-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 5px;
    }

    .run-empty {
      color: var(--text-muted);
      font-size: 11px;
    }

    .activity-summary {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .activity-summary article {
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      padding: var(--space-3);
    }

    .activity-summary span {
      display: block;
      color: var(--text-secondary);
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .activity-summary strong {
      display: block;
      margin-top: var(--space-1);
      font-size: 16px;
      font-family: var(--font-mono);
      font-weight: 600;
      letter-spacing: -0.02em;
      overflow-wrap: anywhere;
    }

    @media (max-width: 1180px) {
      .app-shell { grid-template-columns: 200px minmax(0, 1fr); }
      .right-rail {
        position: static;
        grid-column: 2;
        height: auto;
        border-left: 0;
        border-top: 1px solid var(--border-default);
      }
      .hero-sidebar { width: 100%; }
      .project-strip-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .harness-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .stats-grid { grid-template-columns: 1fr; }
      .home-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .home-columns { grid-template-columns: 1fr; }
      .activity-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }

    @media (max-width: 760px) {
      .app-shell { display: block; }
      .sidebar {
        position: static;
        height: auto;
        border-right: 0;
        border-bottom: 1px solid var(--border-default);
      }
      .nav { grid-template-columns: repeat(3, 1fr); }
      .main { padding: 0 var(--space-4) var(--space-4); }
      .topbar { margin: 0 calc(-1 * var(--space-4)); padding: 0 var(--space-4); }
      .hero { display: block; }
      .hero-sidebar { min-width: 0; width: 100%; margin-top: var(--space-3); }
      .hero-metric { grid-template-columns: 1fr; }
      .project-strip-grid,
      .harness-grid,
      .stats-grid { grid-template-columns: 1fr; }
      .home-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .memory-grid { grid-template-columns: 1fr; }
      .activity-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .harness-grid { grid-template-columns: 1fr; }
      .map-head { display: block; }
      .map-controls { margin-top: var(--space-2); width: max-content; }
      .right-rail { padding: var(--space-4); }
    }
  </style>`;
}

function renderReport(summary) {
  const copy = reportCopy();
  const harnesses = getVisibleHarnesses(Array.isArray(summary.harnesses) ? summary.harnesses : []);
  const harnessIds = new Set(harnesses.map((item) => item.id));
    const generatedAt = summary.generated_at || new Date().toISOString();
    const fontStylesheet = resolveFontStylesheet();
  return `<!doctype html>
<html lang="${escapeAttr(copy.htmlLang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${escapeAttr(fontStylesheet)}">
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
          <span>${escapeHtml(copy.operator)}</span>
        </div>
      </div>
      <nav class="nav" id="tab-nav">
        <a href="#home" data-tab="home"><span>${escapeHtml(copy.navHome || 'Home')}</span></a>
        <a href="#harnesses" data-tab="harnesses"><span>${escapeHtml(copy.navHarnesses || 'Harnesses')}</span></a>
        <a href="#memory" data-tab="memory"><span>${escapeHtml(copy.navMemory || 'Memory')}</span></a>
        <a href="#graph" data-tab="graph"><span>${escapeHtml(copy.navKnowledgeGraph || 'Knowledge Graph')}</span></a>
        <a href="#activity" data-tab="activity"><span>${escapeHtml(copy.navActivity || 'Activity')}</span></a>
      </nav>
      <p class="nav-note">${escapeHtml(copy.navNote || 'Local analytics report.')}</p>
    </aside>
    <main class="main">
      <header class="topbar">
        <div><strong>${escapeHtml(copy.operator)}</strong><span>${escapeHtml(copy.local || generatedAt)}</span></div>
        <div class="status"><i></i> ${escapeHtml(copy.online)}</div>
      </header>
      <section class="page" data-page="home">
        ${renderHomePage(summary, copy, harnesses, harnessIds)}
      </section>
      <section class="page" data-page="harnesses">
        <section class="page-head">
          <p class="eyebrow">${escapeHtml(copy.harnessesEyebrow || 'HARNESSES')}</p>
          <h1>${escapeHtml(copy.harnessCards)}</h1>
          <p>${escapeHtml(copy.harnessesHelp || '')} · ${escapeHtml(copy.sortNote || 'Sorted by usage')}</p>
        </section>
        <section class="harness-section">
          <div class="harness-grid">
            ${[...harnesses]
              .sort((a, b) =>
                Number(b.signals?.uses || 0) - Number(a.signals?.uses || 0) ||
                Number(b.candidate_score?.total || 0) - Number(a.candidate_score?.total || 0) ||
                a.id.localeCompare(b.id))
              .map((item) => renderHarness(item, copy)).join('\n')}
          </div>
        </section>
        ${renderHistorySection(summary.maintenance_events, copy)}
      </section>
      <section class="page" data-page="memory">
        ${renderMemoryPage(summary, copy)}
      </section>
      <section class="page" data-page="graph">
        ${renderGraphCanvas(summary, copy)}
      </section>
      <section class="page" data-page="activity">
        ${renderActivityPage(summary, copy, harnessIds)}
      </section>
    </main>
      <aside class="right-rail" aria-label="Insights">
      <div data-rail="home harnesses memory activity">${renderStats(summary, copy)}</div>
      <div data-rail="home harnesses">${renderConfidence(summary, copy)}</div>
      <div data-rail="graph">${renderMapGuide(copy)}</div>
      <div data-rail="graph">${renderSelectedPanel(harnesses, copy)}</div>
      <div data-rail="home harnesses">${renderImportantHarnesses(harnesses, copy)}</div>
      <div data-rail="graph">${renderGraphOverview(summary.graph || {}, copy)}</div>
    </aside>
  </div>
  ${renderContractMetadata(copy)}
  ${renderScript(harnesses, copy)}
  ${renderGraph3DModule(copy)}
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
