// game.js – WordLink game logic

// ─────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────
const CONFIG = {
  canvasW: 1000,
  canvasH: 560,
  startX: 100, startY: 280,
  endX:   900, endY:   280,
  pathSimilarity:   0.16,  // normalized – links exist at or above this threshold
  anchorMaxSimilarity: 0.08, // keep anchor pairs from starting as a direct link
  anchorPairCandidateCount: 12,
  maxBridgeWords:   25,
  dragClickSuppressMs: 180,
  simBadgeOffsetY: 26,
  simBadgeBottomMargin: 10,
  simAlphaBase: 0.22,
  simAlphaLoading: 0.25,
  simAlphaError: 0.2,
  simAlphaScale: 0.7,
  closenessNeighborhoodSaturation: 0.35,
  closenessDirectWeight: 0.55,
  closenessNeighborhoodWeight: 0.35,
  closenessEdgeWeight: 0.10,
  closenessPerfectThreshold: 0.999,
  // Treat the lowest 2% of normalized scores as a dedicated low-end band so
  // tiny-but-nonzero values are spread instead of collapsing at 0.01%.
  closenessFloorEpsilon: 0.02,
  closenessCurveStrength: 2.2, // empirically tuned for observed Datamuse sims (~0.15-0.85) to spread the mid-range
  closenessDisplayMin: 5,      // keep non-zero scores away from hard 0%
  closenessDisplayMax: 95,     // keep non-perfect scores away from hard 100%
  closenessDisplayFloor: 0.01,
  displayDecimals: 2,
  autoPlaceRadius: 118,
  autoPlaceJitter: 32,
  bubblePaddingBase: 70,
  bubblePaddingPerChar: 4,
  bubblePaddingCap: 126,
  nodeMinMarginX: 30,
  nodeMinMarginY: 20,
  nodeEdgeBuffer: 8,
  zoomMin: 0.75,
  zoomMax: 1.75,
  zoomStep: 0.05,
  zoomDefault: 1,
  shareUrl: 'https://freakpants.github.io/wordlink/',
};

// ─────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────
let state = {
  nodes:     [],     // { id, word, x, y, type:'start'|'end'|'bridge', el }
  edges:     [],     // { from, to, similarity }
  won:       false,
  dragInfo:  null,   // { nodeId, offsetX, offsetY, startX, startY, moved }
  puzzle:    { mode: 'daily', key: todayKey(), gameId: null, loadToken: 0 },
  similarityView: { sourceId: null, scores: {}, token: 0 },
  view: { zoom: 1 },
  suppressBubbleClickUntil: 0,
};

// Similarity cache: "word1:word2" → score 0‒1
const simCache = {};
// Debug cache: "word1:word2" → { directNorm, rawJaccard }
const simDebugCache = {};
// Related-words cache: word → [{word, score}]
const relCache = {};

const puzzlePairCache = {};

// ─────────────────────────────────────────────────────────
// DOM refs
// ─────────────────────────────────────────────────────────
let svg, bubblesEl, similarityOverlayEl, wordInput, statusEl, similarityPanelEl, similarityListEl;
let canvasEl, canvasSizerEl, canvasViewportEl, zoomRangeEl;

// ─────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function simCacheKey(w1, w2) {
  return [w1.toLowerCase(), w2.toLowerCase()].sort().join('\x00');
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getProgressStorageKey() {
  return state.puzzle.key ? `wordlink-progress-${state.puzzle.key}` : null;
}

function getBestStorageKey() {
  return state.puzzle.key ? `wordlink-best-${state.puzzle.key}` : null;
}

function getPuzzleLabel(mode = state.puzzle.mode) {
  if (mode === 'daily') return `#${getPuzzleNumber()}`;
  return state.puzzle.gameId ? `#${state.puzzle.gameId}` : 'Practice';
}

function getPuzzleDateLabel(mode = state.puzzle.mode) {
  if (mode === 'daily') {
    const d = getDateFromPuzzleNumber(getPuzzleNumber());
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  if (state.puzzle.gameId) {
    const d = getDateFromPuzzleNumber(state.puzzle.gameId);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return '';
}

function updatePuzzleLabel() {
  document.getElementById('puzzle-number').textContent = getPuzzleLabel();
  const dateEl = document.getElementById('puzzle-date');
  if (dateEl) dateEl.textContent = getPuzzleDateLabel();
}

function getPracticeGameIdFromUrl() {
  // The app now emits bare-number query strings like `?42`, but we still accept
  // older `?gid=42`, `#42`, and trailing `/42` formats for shared legacy links.
  const params = new URLSearchParams(window.location.search);
  const bareQuery = window.location.search.replace(/^\?/, '').trim();
  const bareSearch = bareQuery && !bareQuery.includes('=') ? bareQuery : null;
  const bareHash = window.location.hash.match(/^#(\d+)$/)?.[1] || null;
  const barePath = window.location.pathname.match(/\/(\d+)\/?$/)?.[1] || null;
  return normalizePracticeGameId(params.get('gid') || bareSearch || bareHash || barePath);
}

function syncPuzzleUrl() {
  const url = new URL(window.location.href);
  if (state.puzzle.mode === 'practice' && state.puzzle.gameId) {
    url.search = `?${encodeURIComponent(state.puzzle.gameId)}`;
  } else {
    url.search = '';
  }
  url.hash = '';
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function getPuzzleShareUrl() {
  if (state.puzzle.mode === 'practice' && state.puzzle.gameId) {
    return `${CONFIG.shareUrl}?${encodeURIComponent(state.puzzle.gameId)}`;
  }
  return CONFIG.shareUrl;
}

function formatPercent(value) {
  return `${Number(value).toFixed(CONFIG.displayDecimals)}%`;
}

function getWinningLinkThresholdLabel() {
  return formatPercent(CONFIG.pathSimilarity * 100);
}

function updateThresholdCopy() {
  document.querySelectorAll('[data-path-threshold]').forEach(el => {
    el.textContent = getWinningLinkThresholdLabel();
  });
}

function hydrateVersionTag() {
  const versionEl = document.getElementById('version-tag');
  if (!versionEl) return;
  const rawVersion = (versionEl.dataset?.version || '').trim();
  const isInjectedSha = rawVersion && !rawVersion.includes('__COMMIT_SHA__');
  const versionText = isInjectedSha ? rawVersion : 'local';
  versionEl.textContent = versionText;
  versionEl.title = `Version: ${versionText}`;
}

function getSimilarityDisplayPercent(sourceWord, targetWord, sim) {
  if (sim === null || sim === undefined) return null;
  const dbg = simDebugCache[simCacheKey(sourceWord, targetWord)];
  let base = sim;
  if (dbg) {
    // Display score is intentionally decoupled from edge thresholds so it reads
    // as a clearer 0-100 value instead of saturating too easily.
    // ~35% neighbor-overlap maps to a full neighborhood signal.
    const neighborhood = Math.min(1, dbg.rawJaccard / CONFIG.closenessNeighborhoodSaturation);
    // We bias the display toward direct synonym strength (55%), keep
    // neighborhood overlap as a strong secondary signal (35%), and retain a
    // small contribution from the gameplay edge score (10%) for continuity.
    base = Math.min(
      1,
      dbg.directNorm * CONFIG.closenessDirectWeight +
      neighborhood * CONFIG.closenessNeighborhoodWeight +
      sim * CONFIG.closenessEdgeWeight
    );
  }
  const normalized = Math.max(0, Math.min(1, base));
  if (normalized >= CONFIG.closenessPerfectThreshold) return 100;
  if (normalized <= CONFIG.closenessFloorEpsilon) {
    const lowEndRatio = CONFIG.closenessFloorEpsilon > 0
      ? normalized / CONFIG.closenessFloorEpsilon
      : 0;
    return Number((
      CONFIG.closenessDisplayFloor +
      lowEndRatio * (CONFIG.closenessDisplayMin - CONFIG.closenessDisplayFloor)
    ).toFixed(CONFIG.displayDecimals));
  }

  // Apply tanh S-curve centered on 0.5: (normalized - 0.5) centers the curve,
  // tanh maps to [-1,1], then ( +1 ) / 2 maps back to [0,1]. Multiplying by
  // closenessCurveStrength controls steepness (higher = more mid-range spread,
  // lower = closer to linear), reducing bunching near 0/100.
  const curved = (Math.tanh((normalized - 0.5) * CONFIG.closenessCurveStrength) + 1) / 2;
  return Number((
    CONFIG.closenessDisplayMin +
    curved * (CONFIG.closenessDisplayMax - CONFIG.closenessDisplayMin)
  ).toFixed(CONFIG.displayDecimals));
}

function setStatus(msg, cls) {
  statusEl.textContent = msg;
  statusEl.className = cls || '';
}

function shakeInput() {
  wordInput.classList.remove('shake');
  void wordInput.offsetWidth; // force reflow
  wordInput.classList.add('shake');
  wordInput.addEventListener('animationend', () => wordInput.classList.remove('shake'), { once: true });
}

function getSimilarityInspectAlpha(sim) {
  if (sim === null) return CONFIG.simAlphaError;
  if (sim === undefined) return CONFIG.simAlphaLoading;
  return CONFIG.simAlphaBase + sim * CONFIG.simAlphaScale;
}

function getSimilarityBadgeTop(y) {
  return Math.min(
    CONFIG.canvasH - CONFIG.simBadgeBottomMargin,
    y + CONFIG.simBadgeOffsetY
  );
}

// ─────────────────────────────────────────────────────────
// Datamuse API
// ─────────────────────────────────────────────────────────
async function fetchRelated(word) {
  const key = word.toLowerCase();
  if (relCache[key]) return relCache[key];
  const enc = encodeURIComponent(key);

  // Query both "means like" (synonyms/paraphrases) and "triggered by"
  // (associative/thematic relations) for richer coverage.
  const [mlData, trgData] = await Promise.all([
    fetch(`https://api.datamuse.com/words?ml=${enc}&max=300`)
      .then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`https://api.datamuse.com/words?rel_trg=${enc}&max=300`)
      .then(r => r.ok ? r.json() : []).catch(() => []),
  ]);

  if (!mlData.length && !trgData.length) throw new Error('No related words returned from Datamuse');

  // Merge both lists, keeping the highest score per word; normalise to lowercase.
  const merged = new Map();
  [...mlData, ...trgData].forEach(({ word: w, score }) => {
    const wl = w.toLowerCase();
    if (!merged.has(wl) || merged.get(wl) < score) merged.set(wl, score);
  });

  const data = [...merged.entries()]
    .map(([w, score]) => ({ word: w, score }))
    .sort((a, b) => b.score - a.score);

  relCache[key] = data;
  return data;
}

async function getSimilarity(w1, w2) {
  const key = simCacheKey(w1, w2);
  if (simCache[key] !== undefined) return simCache[key];

  const [rel1, rel2] = await Promise.all([
    fetchRelated(w1),
    fetchRelated(w2),
  ]);

  const lo1 = w2.toLowerCase();
  const lo2 = w1.toLowerCase();

  // Direct-match score: does each word appear in the other's related list?
  const m1 = rel1.find(r => r.word === lo1);
  const m2 = rel2.find(r => r.word === lo2);
  const directBest = Math.max(m1 ? m1.score : 0, m2 ? m2.score : 0);
  // Datamuse scores peak around 5000 for close synonyms; normalize to [0,1].
  const directNorm = Math.min(1, directBest / 5000);

  // Shared-neighbours (Jaccard) on the top-200 results from each word.
  // Two words that share many neighbours are conceptually close even when
  // they are not synonyms (e.g. "water" and "mountain" both relate to
  // "river", "lake", "snow", etc.).
  const N = 200;
  const set1 = new Set(rel1.slice(0, N).map(r => r.word));
  const set2 = new Set(rel2.slice(0, N).map(r => r.word));
  let shared = 0;
  for (const w of set1) { if (set2.has(w)) shared++; }
  const union = set1.size + set2.size - shared;
  const jaccard = union > 0 ? shared / union : 0;
  // Multiply by 5 so a jaccard of 0.10 (10 % shared neighbours) maps to
  // a similarity of 0.50, and 0.20 saturates at 1.0.
  const sharedNorm = Math.min(1, jaccard * 5);

  const norm = Math.max(directNorm, sharedNorm);
  simCache[key] = norm;
  simDebugCache[key] = { directNorm, rawJaccard: jaccard };
  return norm;
}

// ─────────────────────────────────────────────────────────
// Node (bubble) management
// ─────────────────────────────────────────────────────────
function createNode(word, x, y, type) {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const el = document.createElement('div');
  el.className = `word-bubble ${type}`;
  el.textContent = word;
  el.dataset.id = id;
  el.addEventListener('click', e => onBubbleClick(e, id));

  if (type === 'bridge') {
    el.addEventListener('mousedown',  e => onBubbleMouseDown(e, id));
    el.addEventListener('touchstart', e => onBubbleTouchStart(e, id), { passive: false });
  }

  bubblesEl.appendChild(el);

  const node = { id, word, x, y, type, el };
  state.nodes.push(node);
  updateNodePosition(id, x, y);
  return node;
}

function removeNode(id) {
  if (state.won) return;
  const idx = state.nodes.findIndex(n => n.id === id);
  if (idx === -1) return;
  const node = state.nodes[idx];
  if (node.type !== 'bridge') return;
  node.el.remove();
  state.nodes.splice(idx, 1);
  if (state.similarityView.sourceId === id) {
    clearSimilarityView(false);
  } else {
    delete state.similarityView.scores[id];
  }
  resolveBridgeCollisions();
  updateWordCount();
  rebuildEdges();
}

function updateNodePosition(id, x, y) {
  const node = state.nodes.find(n => n.id === id);
  if (!node) return;
  const measuredW = node.el?.offsetWidth || 0;
  const measuredH = node.el?.offsetHeight || 0;
  const estimatedMargins = getEstimatedBubbleMargins(node.word, node.type);
  const marginX = measuredW > 1
    ? Math.max(CONFIG.nodeMinMarginX, measuredW / 2 + CONFIG.nodeEdgeBuffer)
    : estimatedMargins.marginX;
  const marginY = measuredH > 1
    ? Math.max(CONFIG.nodeMinMarginY, measuredH / 2 + CONFIG.nodeEdgeBuffer)
    : estimatedMargins.marginY;
  node.x = Math.max(marginX, Math.min(CONFIG.canvasW - marginX, x));
  node.y = Math.max(marginY, Math.min(CONFIG.canvasH - marginY, y));
  node.el.style.left = `${node.x}px`;
  node.el.style.top  = `${node.y}px`;
}

function getEstimatedBubbleMargins(word, type = 'bridge') {
  const estimatedWidth = Math.max(type === 'bridge' ? 96 : 108, 42 + word.length * 10);
  const estimatedHeight = type === 'bridge' ? 36 : 40;
  return {
    marginX: Math.max(CONFIG.nodeMinMarginX, estimatedWidth / 2 + CONFIG.nodeEdgeBuffer),
    marginY: Math.max(CONFIG.nodeMinMarginY, estimatedHeight / 2 + CONFIG.nodeEdgeBuffer),
  };
}

function getNodePadding(node) {
  return Math.min(
    CONFIG.bubblePaddingCap,
    CONFIG.bubblePaddingBase + node.word.length * CONFIG.bubblePaddingPerChar
  );
}

function resolveBridgeCollisions({ lockedIds = new Set(), iterations = 16 } = {}) {
  if (!state.nodes.some(n => n.type === 'bridge')) return;

  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < state.nodes.length; i++) {
      for (let j = i + 1; j < state.nodes.length; j++) {
        const a = state.nodes[i];
        const b = state.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 0.001;
        const minDistance = (getNodePadding(a) + getNodePadding(b)) / 2;
        if (distance >= minDistance) continue;

        const overlap = (minDistance - distance) / 2;
        const ux = dx / distance;
        const uy = dy / distance;
        const aLocked = a.type !== 'bridge' || lockedIds.has(a.id);
        const bLocked = b.type !== 'bridge' || lockedIds.has(b.id);

        if (!aLocked) {
          updateNodePosition(a.id, a.x - ux * overlap, a.y - uy * overlap);
          moved = true;
        }
        if (!bLocked) {
          updateNodePosition(b.id, b.x + ux * overlap, b.y + uy * overlap);
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

function getAutoPlacement(word) {
  const scored = state.nodes
    .map(node => ({
      node,
      similarity: simCache[simCacheKey(word, node.word)] ?? 0,
    }))
    .sort((a, b) => b.similarity - a.similarity || a.node.word.localeCompare(b.node.word));

  const primary = scored[0]?.node || { x: CONFIG.canvasW / 2, y: CONFIG.canvasH / 2 };
  const secondary = scored[1]?.node || { x: CONFIG.canvasW / 2, y: CONFIG.canvasH / 2 };
  let dx = primary.x - secondary.x;
  let dy = primary.y - secondary.y;
  if (Math.abs(dx) < 4 && Math.abs(dy) < 4) {
    const angleSeed = word.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), state.nodes.length);
    const angle = (angleSeed % 360) * (Math.PI / 180);
    dx = Math.cos(angle);
    dy = Math.sin(angle);
  }
  const length = Math.hypot(dx, dy) || 1;
  const jitterSeed = word.length + state.nodes.length;
  const angleOffset = ((jitterSeed % 9) - 4) * 0.12;
  const baseAngle = Math.atan2(dy, dx) + angleOffset;
  const radius = CONFIG.autoPlaceRadius + ((jitterSeed % 5) - 2) * (CONFIG.autoPlaceJitter / 2);
  const margins = getEstimatedBubbleMargins(word, 'bridge');

  return {
    x: Math.max(margins.marginX, Math.min(CONFIG.canvasW - margins.marginX, primary.x + Math.cos(baseAngle) * radius)),
    y: Math.max(margins.marginY, Math.min(CONFIG.canvasH - margins.marginY, primary.y + Math.sin(baseAngle) * radius)),
  };
}

// ─────────────────────────────────────────────────────────
// Edge / connection management
// ─────────────────────────────────────────────────────────
function rebuildEdges() {
  state.edges = [];
  svg.innerHTML = '';

  for (let i = 0; i < state.nodes.length; i++) {
    for (let j = i + 1; j < state.nodes.length; j++) {
      const a = state.nodes[i];
      const b = state.nodes[j];
      const key = simCacheKey(a.word, b.word);
      const sim = simCache[key];
      if (sim !== undefined && sim >= CONFIG.pathSimilarity) {
        state.edges.push({ from: a, to: b, similarity: sim });
      }
    }
  }

  renderAllEdges();
  updateNodeConnectedState();
  renderSimilarityView();
  checkVictory();
}

function renderAllEdges() {
  svg.innerHTML = '';
  // Render normal edges first, path edges on top (painted later)
  state.edges.forEach(e => drawEdge(e, false));
}

function drawEdge(edge, onPath) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', edge.from.x);
  line.setAttribute('y1', edge.from.y);
  line.setAttribute('x2', edge.to.x);
  line.setAttribute('y2', edge.to.y);
  line.classList.add('conn-line');
  if (onPath) {
    line.classList.add('on-path');
  } else {
    const opacity = Math.min(0.85, 0.3 + edge.similarity * 1.5);
    const width   = Math.min(4, 1 + edge.similarity * 5);
    line.setAttribute('stroke', '#94a3b8');
    line.setAttribute('stroke-opacity', opacity.toFixed(2));
    line.setAttribute('stroke-width',   width.toFixed(1));
    line.setAttribute('stroke-linecap', 'round');
  }
  svg.appendChild(line);
  edge.lineEl = line;
  return line;
}

function renderSimilarityPanel(source) {
  similarityPanelEl.classList.add('hidden');
  if (!source) {
    similarityListEl.innerHTML = '';
    return;
  }
  similarityListEl.innerHTML = '';

  document.getElementById('similarity-panel-title').textContent = `Closeness to "${source.word}"`;
  document.getElementById('similarity-panel-subtitle').textContent =
    `Sorted from closest to furthest on a two-decimal 0-100 closeness scale. Links count at ${getWinningLinkThresholdLabel()}+.`;

  const entries = state.nodes
    .filter(n => n.id !== source.id)
    .map(n => {
      const sim = state.similarityView.scores[n.id];
      return {
        node: n,
        sim,
        percent: getSimilarityDisplayPercent(source.word, n.word, sim),
      };
    })
    .sort(compareSimilarityEntries);

  const frag = document.createDocumentFragment();
  entries.forEach(({ node, sim, percent }) => {
    const row = document.createElement('div');
    row.className = 'similarity-row';

    const word = document.createElement('span');
    word.className = `similarity-word ${node.type}`;
    word.textContent = node.word;

    const score = document.createElement('span');
    score.className = 'similarity-score';
    if (percent !== null) {
      score.textContent = formatPercent(percent);
    } else if (sim === null) {
      score.textContent = 'N/A';
    } else {
      score.textContent = '…';
    }

    row.append(word, score);
    frag.appendChild(row);
  });

  similarityListEl.appendChild(frag);
  similarityPanelEl.classList.remove('hidden');
}

function compareSimilarityEntries(a, b) {
  const aHasPercent = a.percent !== null;
  const bHasPercent = b.percent !== null;
  if (aHasPercent && bHasPercent) {
    return b.percent - a.percent || a.node.word.localeCompare(b.node.word);
  }
  if (aHasPercent) return -1;
  if (bHasPercent) return 1;

  // After completed scores, keep pending loads ahead of failed lookups so the
  // list still feels like it is actively filling in.
  const aIsError = a.sim === null;
  const bIsError = b.sim === null;
  if (aIsError && !bIsError) return 1;
  if (!aIsError && bIsError) return -1;
  return a.node.word.localeCompare(b.node.word);
}

function updateNodeConnectedState() {
  // Mark nodes that have at least one path-strength edge
  const connected = new Set();
  state.edges.forEach(e => {
    if (e.similarity >= CONFIG.pathSimilarity) {
      connected.add(e.from.id);
      connected.add(e.to.id);
    }
  });
  state.nodes.forEach(n => {
    if (n.type === 'bridge') {
      n.el.classList.toggle('connected', connected.has(n.id));
    }
  });
}

// ─────────────────────────────────────────────────────────
// Path detection (BFS)
// ─────────────────────────────────────────────────────────
function findPath() {
  const startNode = state.nodes.find(n => n.type === 'start');
  const endNode   = state.nodes.find(n => n.type === 'end');
  if (!startNode || !endNode) return null;

  // Build adjacency map using only path-strength edges
  const adj = {};
  state.nodes.forEach(n => { adj[n.id] = []; });
  state.edges.forEach(e => {
    if (e.similarity >= CONFIG.pathSimilarity) {
      adj[e.from.id].push(e.to);
      adj[e.to.id].push(e.from);
    }
  });

  // BFS
  const queue   = [[startNode, [startNode]]];
  const visited = new Set([startNode.id]);

  while (queue.length) {
    const [cur, path] = queue.shift();
    if (cur.id === endNode.id) return path;
    for (const neighbour of adj[cur.id]) {
      if (!visited.has(neighbour.id)) {
        visited.add(neighbour.id);
        queue.push([neighbour, [...path, neighbour]]);
      }
    }
  }
  return null;
}

function checkVictory() {
  if (state.won) return;
  const path = findPath();
  if (!path) return;

  state.won = true;
  const bridgeCount = path.filter(n => n.type === 'bridge').length;

  // Highlight path nodes and edges
  const pathIds = new Set(path.map(n => n.id));
  path.forEach(n => n.el.classList.add('on-path'));

  // Re-render edges: path edges on top in amber, others remain gray
  svg.innerHTML = '';
  state.edges.forEach(e => {
    const onPath = pathIds.has(e.from.id) && pathIds.has(e.to.id)
                   && e.similarity >= CONFIG.pathSimilarity;
    drawEdge(e, onPath);
  });

  // Save best score
  const bestKey = getBestStorageKey();
  const saved   = bestKey ? parseInt(localStorage.getItem(bestKey), 10) : NaN;
  if (bestKey && (isNaN(saved) || bridgeCount < saved)) {
    localStorage.setItem(bestKey, bridgeCount);
  }
  updateBestScore();

  // Build path display in modal
  const pathDisplay = document.getElementById('path-display');
  pathDisplay.innerHTML = '';
  path.forEach((n, i) => {
    if (i > 0) {
      const arr = document.createElement('span');
      arr.className = 'path-arrow';
      arr.textContent = '→';
      pathDisplay.appendChild(arr);
    }
    const chip = document.createElement('div');
    chip.className = `path-word ${n.type}`;
    chip.textContent = n.word;
    pathDisplay.appendChild(chip);
  });

  document.getElementById('final-score').textContent = bridgeCount;

  // Build share text and store on button
  const shareBtn = document.getElementById('copy-result-btn');
  const puzzleNum = document.getElementById('puzzle-number').textContent;
  const chain = path.map(n => `||${n.word}||`).join(' → ');
  const shareText =
    `WordLink ${puzzleNum}\n${chain}\nCompleted in ${bridgeCount} bridge word${bridgeCount !== 1 ? 's' : ''}!\n${getPuzzleShareUrl()}`;
  shareBtn.dataset.shareText = shareText;

  saveProgress(true);
  setStatus(`Path found. Your winning chain hit ${getWinningLinkThresholdLabel()}+.`, 'success');

  // Show modal after a short pause so the path highlight is visible
  setTimeout(() => {
    document.getElementById('victory-modal').classList.remove('hidden');
  }, 800);
}

// ─────────────────────────────────────────────────────────
// Adding a word
// ─────────────────────────────────────────────────────────
async function addWord() {
  if (state.won) return;

  const raw  = wordInput.value.trim().toLowerCase();
  const word = raw.replace(/[^a-z'-]/g, '');

  if (!word) {
    setStatus('Please enter a word.', 'error');
    shakeInput();
    return;
  }
  if (!/^[a-z'-]+$/.test(word)) {
    setStatus('Only letters are allowed.', 'error');
    shakeInput();
    return;
  }
  if (state.nodes.find(n => n.word.toLowerCase() === word)) {
    setStatus(`"${word}" is already on the board.`, 'error');
    shakeInput();
    return;
  }
  if (state.nodes.filter(n => n.type === 'bridge').length >= CONFIG.maxBridgeWords) {
    setStatus(`Maximum of ${CONFIG.maxBridgeWords} bridge words reached.`, 'error');
    return;
  }

  setStatus(`Checking "${word}"…`);
  wordInput.value = '';

  try {
    await fetchRelated(word);
  } catch (_) {
    wordInput.value = raw;
    setStatus(`"${word}" was not found by Datamuse. Try a standard dictionary word.`, 'error');
    shakeInput();
    wordInput.focus();
    wordInput.select();
    return;
  }

  const others = [...state.nodes];
  let similarityFailed = false;
  await Promise.all(others.map(async other => {
    try {
      await getSimilarity(word, other.word);
    } catch (_) {
      similarityFailed = true;
    }
  }));

  const { x, y } = getAutoPlacement(word);
  const node = createNode(word, x, y, 'bridge');
  resolveBridgeCollisions();
  updateWordCount();

  if (similarityFailed) {
    setStatus(`Added "${word}", but some closeness checks are still missing.`, 'error');
  } else {
    setStatus(`Added "${word}". Links appear at ${getWinningLinkThresholdLabel()}+.`, 'success');
  }

  rebuildEdges();
  focusSimilarityOnNode(node.id);
  saveProgress(false);
  wordInput.focus();
}

// ─────────────────────────────────────────────────────────
// Drag & Drop (mouse)
// ─────────────────────────────────────────────────────────
function onBubbleMouseDown(e, id) {
  if (e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();
  startDrag(e.clientX, e.clientY, id);
}

function startDrag(clientX, clientY, nodeId) {
  const node = state.nodes.find(n => n.id === nodeId);
  if (!node || node.type !== 'bridge') return;
  const canvasRect = canvasEl.getBoundingClientRect();
  const point = clientToCanvasPoint(clientX, clientY, canvasRect);
  state.dragInfo = {
    nodeId,
    offsetX: point.x - node.x,
    offsetY: point.y - node.y,
    canvasRect,
    startX: clientX,
    startY: clientY,
    moved: false,
  };
}

function onDocMouseMove(e) {
  if (!state.dragInfo) return;
  if (!state.dragInfo.moved) {
    const movedX = Math.abs(e.clientX - state.dragInfo.startX);
    const movedY = Math.abs(e.clientY - state.dragInfo.startY);
    if (movedX > 4 || movedY > 4) state.dragInfo.moved = true;
  }
  const point = clientToCanvasPoint(e.clientX, e.clientY, state.dragInfo.canvasRect);
  const x = point.x - state.dragInfo.offsetX;
  const y = point.y - state.dragInfo.offsetY;
  updateNodePosition(state.dragInfo.nodeId, x, y);
  rebuildEdges();
}

function onDocMouseUp() {
  if (!state.dragInfo) return;
  const draggedId = state.dragInfo.nodeId;
  if (state.dragInfo.moved) {
    state.suppressBubbleClickUntil = performance.now() + CONFIG.dragClickSuppressMs;
    resolveBridgeCollisions({ lockedIds: new Set([draggedId]) });
    rebuildEdges();
  }
  state.dragInfo = null;
  saveProgress(false);
}

// ─────────────────────────────────────────────────────────
// Drag & Drop (touch)
// ─────────────────────────────────────────────────────────
function onBubbleTouchStart(e, id) {
  if (e.touches.length !== 1) return;
  e.preventDefault();
  e.stopPropagation();
  startDrag(e.touches[0].clientX, e.touches[0].clientY, id);
}

function onDocTouchMove(e) {
  if (!state.dragInfo || e.touches.length !== 1) return;
  e.preventDefault();
  if (!state.dragInfo.moved) {
    const movedX = Math.abs(e.touches[0].clientX - state.dragInfo.startX);
    const movedY = Math.abs(e.touches[0].clientY - state.dragInfo.startY);
    if (movedX > 4 || movedY > 4) state.dragInfo.moved = true;
  }
  const point = clientToCanvasPoint(e.touches[0].clientX, e.touches[0].clientY, state.dragInfo.canvasRect);
  const x = point.x - state.dragInfo.offsetX;
  const y = point.y - state.dragInfo.offsetY;
  updateNodePosition(state.dragInfo.nodeId, x, y);
  rebuildEdges();
}

function onDocTouchEnd() {
  if (!state.dragInfo) return;
  const draggedId = state.dragInfo.nodeId;
  if (state.dragInfo.moved) {
    state.suppressBubbleClickUntil = performance.now() + CONFIG.dragClickSuppressMs;
    resolveBridgeCollisions({ lockedIds: new Set([draggedId]) });
    rebuildEdges();
  }
  state.dragInfo = null;
  saveProgress(false);
}

// ─────────────────────────────────────────────────────────
// Canvas click
// ─────────────────────────────────────────────────────────
function onCanvasClick(e) {
  if (state.won) return;
  if (e.target.classList.contains('word-bubble')) return;
  clearSimilarityView(false);
  wordInput.focus();
  setStatus(`WordLink places new bridge words automatically. Links appear at ${getWinningLinkThresholdLabel()}+ to count toward your path.`);
}

function onBubbleClick(e, id) {
  e.stopPropagation();
  if (performance.now() < state.suppressBubbleClickUntil) {
    return;
  }
  toggleSimilarityViewForNode(id);
}

function clearSimilarityView(clearStatus = true) {
  state.similarityView.sourceId = null;
  state.similarityView.scores = {};
  state.similarityView.token++;
  renderSimilarityView();
  if (clearStatus) setStatus('');
}

async function toggleSimilarityViewForNode(id) {
  const node = state.nodes.find(n => n.id === id);
  if (!node) return;

  if (state.similarityView.sourceId === id) {
    clearSimilarityView(true);
    return;
  }

  state.similarityView.sourceId = id;
  state.similarityView.scores = {};
  state.similarityView.token++;
  renderSimilarityView();
  setStatus(`Loading closeness scores for "${node.word}"…`);

  await refreshSimilarityView();

  if (state.similarityView.sourceId === id) {
    setStatus(`Showing closeness scores for "${node.word}" with two-decimal precision (click it again to clear).`);
  }
}

async function refreshSimilarityView() {
  const sourceId = state.similarityView.sourceId;
  if (!sourceId) return;
  const source = state.nodes.find(n => n.id === sourceId);
  if (!source) {
    clearSimilarityView(false);
    return;
  }

  const missing = state.nodes.filter(n =>
    n.id !== sourceId && state.similarityView.scores[n.id] === undefined
  );
  if (!missing.length) {
    renderSimilarityView();
    return;
  }

  const token = ++state.similarityView.token;
  const results = await Promise.all(
    missing.map(async n => {
      try {
        const sim = await getSimilarity(source.word, n.word);
        return { id: n.id, sim };
      } catch (err) {
        console.warn(`Similarity check failed for "${source.word}" and "${n.word}".`, err);
        return { id: n.id, sim: null };
      }
    })
  );

  if (state.similarityView.sourceId !== sourceId || state.similarityView.token !== token) return;

  results.forEach(r => {
    state.similarityView.scores[r.id] = r.sim;
  });
  renderSimilarityView();
}

function focusSimilarityOnNode(id) {
  const source = state.nodes.find(n => n.id === id);
  if (!source) return;
  state.similarityView.sourceId = id;
  state.similarityView.scores = {};
  state.nodes.forEach(n => {
    if (n.id === id) return;
    const cached = simCache[simCacheKey(source.word, n.word)];
    if (cached !== undefined) {
      state.similarityView.scores[n.id] = cached;
    }
  });
  state.similarityView.token++;
  renderSimilarityView();
  const hasMissingScores = state.nodes.some(n =>
    n.id !== id && state.similarityView.scores[n.id] === undefined
  );
  if (hasMissingScores) refreshSimilarityView();
}

function renderSimilarityView() {
  state.nodes.forEach(n => {
    n.el.classList.remove('inspect-source', 'inspect-target');
    n.el.style.removeProperty('--inspect-alpha');
  });
  similarityOverlayEl.innerHTML = '';

  const sourceId = state.similarityView.sourceId;
  if (!sourceId) {
    renderSimilarityPanel(null);
    return;
  }

  const source = state.nodes.find(n => n.id === sourceId);
  if (!source) {
    renderSimilarityPanel(null);
    return;
  }
  source.el.classList.add('inspect-source');

  state.nodes.forEach(n => {
    if (n.id === sourceId) return;
    const sim = state.similarityView.scores[n.id];
    const alpha = getSimilarityInspectAlpha(sim);
    n.el.classList.add('inspect-target');
    n.el.style.setProperty('--inspect-alpha', alpha.toFixed(2));

    const badge = document.createElement('div');
    badge.className = 'sim-badge';
    if (sim === null) {
      badge.textContent = 'N/A';
    } else if (sim === undefined) {
      badge.textContent = '…';
    } else {
      badge.textContent = formatPercent(getSimilarityDisplayPercent(source.word, n.word, sim));
    }
    badge.style.left = `${n.x}px`;
    badge.style.top = `${getSimilarityBadgeTop(n.y)}px`;
    similarityOverlayEl.appendChild(badge);
  });

  renderSimilarityPanel(source);
}

function clampZoom(value) {
  return Math.max(CONFIG.zoomMin, Math.min(CONFIG.zoomMax, value));
}

function updateZoomUi() {
  if (zoomRangeEl) {
    const zoomPercent = Math.round(state.view.zoom * 100);
    zoomRangeEl.value = state.view.zoom.toFixed(2);
    zoomRangeEl.setAttribute('aria-valuetext', `${zoomPercent}%`);
    zoomRangeEl.setAttribute('aria-valuenow', String(zoomPercent));
  }
  const resetBtn = document.getElementById('zoom-reset-btn');
  if (resetBtn) resetBtn.textContent = `${Math.round(state.view.zoom * 100)}%`;
}

function applyCanvasZoom(zoom, { anchorClientX = null, anchorClientY = null } = {}) {
  const nextZoom = clampZoom(zoom);
  const prevZoom = state.view.zoom || 1;
  const viewport = canvasViewportEl;
  let anchorOffsetX = null;
  let anchorOffsetY = null;
  let worldX = null;
  let worldY = null;

  if (viewport && anchorClientX !== null && anchorClientY !== null) {
    const viewportRect = viewport.getBoundingClientRect();
    anchorOffsetX = anchorClientX - viewportRect.left;
    anchorOffsetY = anchorClientY - viewportRect.top;
    worldX = (viewport.scrollLeft + anchorOffsetX) / prevZoom;
    worldY = (viewport.scrollTop + anchorOffsetY) / prevZoom;
  }

  state.view.zoom = nextZoom;

  if (canvasEl) {
    canvasEl.style.transform = `scale(${nextZoom})`;
  }
  if (canvasSizerEl) {
    canvasSizerEl.style.width = `${CONFIG.canvasW * nextZoom}px`;
    canvasSizerEl.style.height = `${CONFIG.canvasH * nextZoom}px`;
  }
  if (viewport && worldX !== null && worldY !== null) {
    viewport.scrollLeft = worldX * nextZoom - anchorOffsetX;
    viewport.scrollTop = worldY * nextZoom - anchorOffsetY;
  }

  updateZoomUi();
}

function clientToCanvasPoint(clientX, clientY, rect = canvasEl.getBoundingClientRect()) {
  const zoom = state.view.zoom || 1;
  return {
    x: (clientX - rect.left) / zoom,
    y: (clientY - rect.top) / zoom,
  };
}

function onCanvasWheel(e) {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  const delta = e.deltaY < 0 ? CONFIG.zoomStep : -CONFIG.zoomStep;
  applyCanvasZoom(state.view.zoom + delta, { anchorClientX: e.clientX, anchorClientY: e.clientY });
}

function onCanvasViewportKeyDown(e) {
  if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    applyCanvasZoom(state.view.zoom + CONFIG.zoomStep);
    return;
  }
  if (e.key === '-') {
    e.preventDefault();
    applyCanvasZoom(state.view.zoom - CONFIG.zoomStep);
    return;
  }
  if (e.key === '0') {
    e.preventDefault();
    applyCanvasZoom(CONFIG.zoomDefault);
  }
}

// ─────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────
function updateWordCount() {
  const n = state.nodes.filter(n => n.type === 'bridge').length;
  document.getElementById('word-count').textContent = n;
}

function updateBestScore() {
  const key = getBestStorageKey();
  if (!key) {
    document.getElementById('best-score').textContent = '–';
    return;
  }
  const saved = parseInt(localStorage.getItem(key), 10);
  document.getElementById('best-score').textContent = isNaN(saved) ? '–' : saved;
}

// ─────────────────────────────────────────────────────────
// Local-storage persistence
// ─────────────────────────────────────────────────────────
function saveProgress(won) {
  const key = getProgressStorageKey();
  if (!key) return;
  const bridges = state.nodes
    .filter(n => n.type === 'bridge')
    .map(n => ({ word: n.word, x: n.x, y: n.y }));
  const data = { bridges, won };
  localStorage.setItem(key, JSON.stringify(data));
}

function loadProgress() {
  const key = getProgressStorageKey();
  if (!key) return;
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (data.bridges && Array.isArray(data.bridges)) {
      data.bridges.forEach(b => createNode(b.word, b.x, b.y, 'bridge'));
      updateWordCount();
      // Re-check similarities for restored words (fire-and-forget)
      restoreSimilarities(data.bridges.map(b => b.word));
    }
  } catch (_) { /* ignore corrupt data */ }
}

async function restoreSimilarities(words) {
  const allWords = state.nodes.map(n => n.word);
  const pairs = [];
  for (let i = 0; i < allWords.length; i++) {
    for (let j = i + 1; j < allWords.length; j++) {
      const key = simCacheKey(allWords[i], allWords[j]);
      if (simCache[key] === undefined) {
        pairs.push([allWords[i], allWords[j]]);
      }
    }
  }
  // Fetch related words for each bridge word, then rebuild edges
  try {
    await Promise.all(words.map(w => fetchRelated(w)));
    await Promise.all(pairs.map(([a, b]) => getSimilarity(a, b)));
  } catch (_) { /* best-effort */ }
  rebuildEdges();
}

// ─────────────────────────────────────────────────────────
// Reset / Undo
// ─────────────────────────────────────────────────────────
function setPuzzleModeButtons() {
  document.getElementById('daily-mode-btn').classList.toggle('is-active', state.puzzle.mode === 'daily');
  document.getElementById('practice-mode-btn').classList.toggle('is-active', state.puzzle.mode === 'practice');
  updateResetButton();
}

function updateResetButton() {
  const resetBtn = document.getElementById('reset-btn');
  if (!resetBtn) return;
  const isPractice = state.puzzle.mode === 'practice';
  resetBtn.textContent = isPractice ? 'New Practice Round' : 'Reset';
  resetBtn.classList.toggle('primary-btn', isPractice);
  resetBtn.classList.toggle('secondary-btn', !isPractice);
  resetBtn.setAttribute('aria-label', isPractice ? 'Start a new practice round' : 'Reset the current board');
}

function clearBoard() {
  state.nodes.forEach(n => n.el.remove());
  state.nodes = [];
  state.edges = [];
  state.won = false;
  state.dragInfo = null;
  wordInput.value = '';
  clearSimilarityView(false);
  svg.innerHTML = '';
  document.getElementById('victory-modal').classList.add('hidden');
  updateWordCount();
  setStatus('');
}

async function isPlayableAnchorPair(startWord, endWord) {
  try {
    await Promise.all([
      fetchRelated(startWord),
      fetchRelated(endWord),
    ]);
    const similarity = await getSimilarity(startWord, endWord);
    return similarity < CONFIG.anchorMaxSimilarity;
  } catch (err) {
    console.warn(`Could not validate anchor pair "${startWord}" → "${endWord}".`, err);
    return false;
  }
}

async function chooseAnchorPair(mode, gameId) {
  const cacheKey = mode === 'daily' ? todayKey() : `practice-${gameId}`;
  if (puzzlePairCache[cacheKey]) return puzzlePairCache[cacheKey];

  const fallback = mode === 'daily' ? getDailyPair() : getPracticePair(gameId);
  const candidates = mode === 'daily'
    ? getDailyPairCandidatesForDate(new Date(), CONFIG.anchorPairCandidateCount)
    : getPracticePairCandidates(gameId, CONFIG.anchorPairCandidateCount);

  for (const pair of candidates) {
    if (await isPlayableAnchorPair(pair[0], pair[1])) {
      puzzlePairCache[cacheKey] = pair;
      return pair;
    }
  }

  puzzlePairCache[cacheKey] = fallback;
  return fallback;
}

async function startPuzzle(mode, { force = false, gameId = null } = {}) {
  const hasBridges = state.nodes.some(n => n.type === 'bridge');
  if (!force && hasBridges) {
    const puzzleLabel = mode === 'daily' ? 'today’s daily puzzle' : 'a past daily puzzle';
    if (!confirm(`Start ${puzzleLabel}? Your current board will be cleared.`)) return;
  }

  clearBoard();
  const practiceGameId = mode === 'practice'
    ? (normalizePracticeGameId(gameId) || createPracticeGameId())
    : null;

  state.puzzle = {
    mode,
    key: mode === 'daily' ? todayKey() : `practice-day-${practiceGameId}`,
    gameId: practiceGameId,
    loadToken: state.puzzle.loadToken + 1,
  };
  const currentLoadToken = state.puzzle.loadToken;

  document.getElementById('word-start').textContent = '…';
  document.getElementById('word-end').textContent = '…';
  document.getElementById('puzzle-number').textContent = getPuzzleLabel(mode);
  const dateEl = document.getElementById('puzzle-date');
  if (dateEl) dateEl.textContent = '';
  setPuzzleModeButtons();
  syncPuzzleUrl();
  updateBestScore();
  setStatus('Finding a fair anchor pair…');

  const [startWord, endWord] = await chooseAnchorPair(mode, practiceGameId);
  // Ignore stale async results if the player switched puzzles while this pair
  // was still being validated.
  if (state.puzzle.loadToken !== currentLoadToken) return;

  document.getElementById('word-start').textContent = startWord;
  document.getElementById('word-end').textContent = endWord;
  updatePuzzleLabel();

  createNode(startWord, CONFIG.startX, CONFIG.startY, 'start');
  createNode(endWord, CONFIG.endX, CONFIG.endY, 'end');

  await Promise.all([
    fetchRelated(startWord).catch(() => []),
    fetchRelated(endWord).catch(() => []),
    getSimilarity(startWord, endWord).catch(() => null),
  ]);

  rebuildEdges();
  loadProgress();
  setStatus(`Gray bubbles are your bridge words. Links appear at ${getWinningLinkThresholdLabel()}+, and a win needs a full path.`);
  wordInput.focus();
}

function startNewPracticePuzzle() {
  const hasBridges = state.nodes.some(n => n.type === 'bridge');
  if (hasBridges && !confirm('Start another practice puzzle? Your current board will be cleared.')) return;
  startPuzzle('practice', { force: true });
}

function resetDailyBoard() {
  if (!confirm('Reset the board? Your progress will be lost.')) return;
  state.nodes
    .filter(n => n.type === 'bridge')
    .forEach(n => n.el.remove());
  state.nodes = state.nodes.filter(n => n.type !== 'bridge');
  state.edges = [];
  state.won = false;
  clearSimilarityView(false);
  svg.innerHTML = '';
  updateWordCount();
  setStatus('');
  const key = getProgressStorageKey();
  if (key) localStorage.removeItem(key);
}

function resetGame() {
  if (state.puzzle.mode === 'practice') {
    startNewPracticePuzzle();
    return;
  }
  resetDailyBoard();
}

function undoLast() {
  if (state.won) return;
  const bridges = state.nodes.filter(n => n.type === 'bridge');
  if (!bridges.length) return;
  removeNode(bridges[bridges.length - 1].id);
  saveProgress(false);
}

// ─────────────────────────────────────────────────────────
// Initialisation
// ─────────────────────────────────────────────────────────
function init() {
  canvasEl = document.getElementById('game-canvas');
  canvasSizerEl = document.getElementById('canvas-sizer');
  canvasViewportEl = document.getElementById('canvas-viewport');
  zoomRangeEl = document.getElementById('zoom-range');
  svg        = document.getElementById('connections-svg');
  bubblesEl  = document.getElementById('bubbles-container');
  similarityOverlayEl = document.getElementById('similarity-overlay');
  wordInput  = document.getElementById('word-input');
  statusEl   = document.getElementById('status-message');
  similarityPanelEl = document.getElementById('similarity-panel');
  similarityListEl = document.getElementById('similarity-list');
  updateThresholdCopy();
  hydrateVersionTag();

  // Size the SVG
  svg.setAttribute('width',  CONFIG.canvasW);
  svg.setAttribute('height', CONFIG.canvasH);

  // Canvas click
  canvasEl.addEventListener('click', onCanvasClick);
  canvasViewportEl.addEventListener('wheel', onCanvasWheel, { passive: false });
  canvasViewportEl.addEventListener('keydown', onCanvasViewportKeyDown);
  document.getElementById('zoom-in-btn').addEventListener('click', () => applyCanvasZoom(state.view.zoom + CONFIG.zoomStep));
  document.getElementById('zoom-out-btn').addEventListener('click', () => applyCanvasZoom(state.view.zoom - CONFIG.zoomStep));
  document.getElementById('zoom-reset-btn').addEventListener('click', () => applyCanvasZoom(CONFIG.zoomDefault));
  zoomRangeEl.addEventListener('input', e => applyCanvasZoom(parseFloat(e.target.value)));
  applyCanvasZoom(CONFIG.zoomDefault);

  // Input
  wordInput.addEventListener('keydown', e => { if (e.key === 'Enter') addWord(); });
  document.getElementById('add-btn').addEventListener('click', addWord);

  // Drag (mouse)
  document.addEventListener('mousemove', onDocMouseMove);
  document.addEventListener('mouseup',   onDocMouseUp);

  // Drag (touch)
  document.addEventListener('touchmove', onDocTouchMove, { passive: false });
  document.addEventListener('touchend',  onDocTouchEnd);

  // Reset
  document.getElementById('reset-btn').addEventListener('click', resetGame);
  document.getElementById('daily-mode-btn').addEventListener('click', () => startPuzzle('daily'));
  document.getElementById('practice-mode-btn').addEventListener('click', () => startPuzzle('practice'));

  // Victory modal actions
  document.getElementById('copy-result-btn').addEventListener('click', e => {
    const text = e.currentTarget.dataset.shareText || '';
    navigator.clipboard.writeText(text).then(() => {
      e.currentTarget.textContent = 'Copied!';
      setTimeout(() => { e.currentTarget.textContent = 'Copy Result'; }, 2000);
    }).catch(() => {
      prompt('Copy this result:', text);
    });
  });
  document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('victory-modal').classList.add('hidden');
  });
  document.getElementById('victory-modal').querySelector('.modal-backdrop').addEventListener('click', () => {
    document.getElementById('victory-modal').classList.add('hidden');
  });

  // How-to-play modal
  document.getElementById('how-to-btn').addEventListener('click', () => {
    document.getElementById('help-modal').classList.remove('hidden');
  });
  document.getElementById('close-help-btn').addEventListener('click', () => {
    document.getElementById('help-modal').classList.add('hidden');
  });
  document.getElementById('help-modal').querySelector('.modal-backdrop').addEventListener('click', () => {
    document.getElementById('help-modal').classList.add('hidden');
  });

  const startInitialPuzzle = () => {
    const practiceGameId = getPracticeGameIdFromUrl();
    if (practiceGameId) {
      startPuzzle('practice', { force: true, gameId: practiceGameId });
    } else {
      startPuzzle('daily', { force: true });
    }
  };

  if (typeof loadLibraryWords === 'function') {
    loadLibraryWords()
      .catch(() => {})
      .finally(startInitialPuzzle);
  } else {
    startInitialPuzzle();
  }
}

// Start once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
