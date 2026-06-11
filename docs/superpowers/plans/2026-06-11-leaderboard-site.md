# AX Leaderboard Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `scripts/gen-leaderboard.mjs` to write `index.html` at the repo root — a static leaderboard with aggregate AX scores, a 9-model heatmap grid, and expandable inline sub-score bars.

**Architecture:** `buildLeaderboardData()` reads all score JSONs + `data/models.json` and returns a typed DATA object. `generateHTML(data)` renders the full HTML string with DATA inlined as a `<script>` constant. Both are called at the end of the script after the existing README/SVG outputs; `index.html` is committed as a generated artifact.

**Tech Stack:** Node.js 20+ ESM (`.mjs`), plain HTML/CSS/JS, no external dependencies. All CSS and JS are inlined in `index.html`.

---

### Task 1: Add `buildLeaderboardData()` to gen-leaderboard.mjs

**Files:**
- Modify: `scripts/gen-leaderboard.mjs`

**Context:** `gen-leaderboard.mjs` currently loads scores at the top level into `allScores`, capturing only the first model per server (`Object.values(data.models)[0]`). The new function reads all models per server, computes an aggregate AX score (mean across scored models), and structures the DATA object the HTML generator needs. Do NOT touch the existing `allScores` code — it still drives the SVG/README outputs.

- [ ] **Step 1: Insert `stdDev()` helper**

Open `scripts/gen-leaderboard.mjs`. Find the line:
```js
function displayName(serverName) {
```
Insert this block immediately before it:
```js
function stdDev(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
```

- [ ] **Step 2: Insert `buildLeaderboardData()` immediately after `stdDev()`**

```js
function buildLeaderboardData() {
  const modelsJson = JSON.parse(
    readFileSync(join(root, 'data', 'models.json'), 'utf8'),
  );

  const rows = readdirSync(scoresDir)
    .filter(f => f.endsWith('.json') && f !== 'SCHEMA.json')
    .map(f => {
      const data = JSON.parse(readFileSync(join(scoresDir, f), 'utf8'));
      const modelEntries = Object.entries(data.models);
      const axScores = modelEntries.map(([, m]) => m.axScore);
      const aggregate =
        Math.round((axScores.reduce((a, b) => a + b, 0) / axScores.length) * 10) / 10;
      const aggregateStd =
        Math.round(
          (axScores.length === 1 ? modelEntries[0][1].axScoreStd : stdDev(axScores)) * 10,
        ) / 10;

      const byModel = {};
      for (const [modelId, m] of modelEntries) {
        byModel[modelId] = {
          axScore: m.axScore,
          axScoreStd: Math.round(m.axScoreStd * 10) / 10,
          subScores: {
            intentInterpretation: m.subScores.intentInterpretation,
            toolCallConstruction: m.subScores.toolCallConstruction,
            staticQuality: m.subScores.staticQuality ?? null,
            resultSynthesis: m.subScores.resultSynthesis,
            errorRecovery: m.subScores.errorRecovery,
          },
          scoreWeights: m.scoreWeights,
        };
      }

      return {
        slug: basename(f, '.json'),
        schemaVersion: data.schemaVersion ?? 2,
        name: displayName(data.server.name),
        aggregate,
        aggregateStd,
        byModel,
        coverage: data.coverage ?? null,
        topFixes: (data.topFixes ?? []).slice(0, 3),
        scoredAt: (data.server.scoredAt ?? '').slice(0, 10),
      };
    })
    .sort((a, b) => b.aggregate - a.aggregate);

  return {
    generatedAt: new Date().toISOString(),
    models: modelsJson,
    v3: rows.filter(r => r.schemaVersion >= 3),
    v2: rows.filter(r => r.schemaVersion < 3),
  };
}
```

- [ ] **Step 3: Smoke-test — temporarily print the data shape**

At the very end of the file (after `console.log('✔  README.md')`), add:
```js
const _htmlData = buildLeaderboardData();
console.log('DATA.v3:', _htmlData.v3.map(r => `${r.name} agg=${r.aggregate}`));
console.log('DATA.v2:', _htmlData.v2.map(r => `${r.name} agg=${r.aggregate}`));
```

Run:
```bash
cd /Users/zach/Documents/Projects/ax-leaderboard && node scripts/gen-leaderboard.mjs
```

Expected:
```
✔  assets/leaderboard-v3.svg (1 servers)
✔  assets/leaderboard-v2.svg (7 servers)
✔  README.md
DATA.v3: [ 'GitHub MCP agg=76' ]
DATA.v2: [ 'Sentry MCP agg=92', 'Notion API agg=82', ... ]
```

Remove the two temporary `console.log` lines after verifying.

- [ ] **Step 4: Commit**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard
git add scripts/gen-leaderboard.mjs
git commit -m "feat: add buildLeaderboardData() to gen-leaderboard"
```

---

### Task 2: Add `generateHTML()` skeleton — CSS, page shell, wire-up

**Files:**
- Modify: `scripts/gen-leaderboard.mjs`

After this task, `node scripts/gen-leaderboard.mjs` writes `index.html` with the full dark-theme shell (header, footer, inline CSS, inline DATA). Table sections are stubs.

- [ ] **Step 1: Add `scoreClass()` helper immediately before `generateHTML()`**

Insert after `buildLeaderboardData()`:
```js
function scoreClass(ax) {
  if (ax >= 90) return 'score-green';
  if (ax >= 80) return 'score-blue';
  if (ax >= 70) return 'score-yellow';
  return 'score-orange';
}
```

- [ ] **Step 2: Add `renderSection()` stub — needed to run `generateHTML()` without error**

Insert after `scoreClass()`:
```js
function renderSection(rows, modelCols, version) {
  return `<section class="ax-section"><p style="color:#7d8590"><!-- table v${version}: ${rows.length} rows --></p></section>`;
}
```

- [ ] **Step 3: Add `generateHTML(data)` function**

Insert after `renderSection()`:

```js
function generateHTML(data) {
  const { families } = data.models;
  const MODEL_COLS = [
    { id: families.anthropic.cheap.id,    label: 'Haiku',      family: 'anthropic' },
    { id: families.anthropic.mid.id,      label: 'Sonnet',     family: 'anthropic' },
    { id: families.anthropic.frontier.id, label: 'Opus',       family: 'anthropic' },
    { id: families.openai.cheap.id,       label: 'GPT-mini',   family: 'openai'    },
    { id: families.openai.mid.id,         label: 'GPT-4o',     family: 'openai'    },
    { id: families.openai.frontier.id,    label: 'o3',         family: 'openai'    },
    { id: families.google.cheap.id,       label: 'Flash-Lite', family: 'google'    },
    { id: families.google.mid.id,         label: 'Flash',      family: 'google'    },
    { id: families.google.frontier.id,    label: 'Pro',        family: 'google'    },
  ];

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0d1117; color: #c9d1d9; font-family: system-ui,-apple-system,'Segoe UI',sans-serif; font-size: 14px; line-height: 1.5; }
    a { color: #388bfd; text-decoration: none; }
    a:hover { text-decoration: underline; }

    .site-header { padding: 32px 24px 24px; border-bottom: 1px solid #21262d; }
    .site-header h1 { font-size: 24px; font-weight: 700; color: #e6edf3; margin-bottom: 6px; }
    .site-header p { color: #7d8590; font-size: 13px; }

    .ax-section { padding: 24px; }
    .ax-section h2 { font-size: 16px; font-weight: 600; color: #e6edf3; margin-bottom: 16px; }
    .v2-banner { background: #3d2b0a; border: 1px solid #d29922; border-radius: 6px; padding: 10px 14px; color: #d29922; font-size: 13px; margin-bottom: 16px; }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead th { padding: 8px 10px; color: #7d8590; font-weight: 500; font-size: 10px; letter-spacing: .05em; text-transform: uppercase; border-bottom: 1px solid #21262d; white-space: nowrap; background: #161b22; position: sticky; top: 0; z-index: 1; }
    th.family-anthropic { color: #58a6ff; border-bottom: 2px solid #1a3a6a; }
    th.family-openai    { color: #3fb950; border-bottom: 2px solid #1a4a2e; }
    th.family-google    { color: #d29922; border-bottom: 2px solid #3d2b0a; }
    th.col-sep, td.col-sep { border-left: 1px solid #21262d; }
    tbody tr.server-row { cursor: pointer; transition: background .1s; }
    tbody tr.server-row:hover { background: #161b22; }
    tbody tr.server-row.open { background: #161b22; }
    tbody tr.expansion-row td { background: #0d1117; padding: 14px 16px 14px 48px; border-bottom: 1px solid #21262d; }
    td { padding: 7px 10px; border-bottom: 1px solid #161b22; vertical-align: middle; }

    .rank { color: #7d8590; font-size: 11px; }
    .server-name { font-weight: 600; color: #c9d1d9; white-space: nowrap; }
    .expand-hint { font-size: 10px; color: #7d8590; margin-left: 4px; }
    .score-badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-weight: 600; font-size: 12px; min-width: 34px; text-align: center; }
    .agg-score { font-size: 17px; display: block; }
    .agg-std { font-size: 10px; color: #7d8590; display: block; }
    .score-green  { background: #1a4a2e; color: #56d364; }
    .score-blue   { background: #1a3a4a; color: #388bfd; }
    .score-yellow { background: #3d2b0a; color: #d29922; }
    .score-orange { background: #3d1f0a; color: #f0883e; }
    .score-empty  { color: #3d444d; }
    .score-green-text  { color: #56d364; }
    .score-blue-text   { color: #388bfd; }
    .score-yellow-text { color: #d29922; }
    .score-orange-text { color: #f0883e; }
    .model-cell   { text-align: center; }
    .cov-cell     { text-align: center; color: #c9d1d9; white-space: nowrap; }
    .date-cell    { text-align: right; color: #7d8590; white-space: nowrap; }

    .subscore-blocks { display: flex; flex-direction: column; gap: 14px; }
    .model-block-label { font-size: 11px; color: #c9d1d9; margin-bottom: 6px; }
    .bar-container { display: flex; gap: 1px; background: #21262d; border-radius: 3px; height: 8px; overflow: hidden; margin-bottom: 4px; }
    .bar-segment   { height: 8px; min-width: 1px; }
    .bar-intent    { background: #1a4a2e; }
    .bar-tools     { background: #1a3a4a; }
    .bar-static    { background: #3d1a1a; }
    .bar-synth     { background: #3d2b0a; }
    .bar-error     { background: #3d1f0a; }
    .bar-labels    { display: flex; gap: 1px; font-size: 9px; }
    .bar-labels span { overflow: hidden; white-space: nowrap; }
    .top-fixes { margin-top: 10px; font-size: 11px; }
    .top-fixes-label { letter-spacing: .05em; text-transform: uppercase; font-size: 9px; color: #7d8590; margin-right: 4px; }
    .fix-item { color: #c9d1d9; }

    .site-footer { padding: 20px 24px; border-top: 1px solid #21262d; font-size: 12px; color: #7d8590; display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
    .site-footer a { color: #7d8590; }
    .site-footer a:hover { color: #c9d1d9; }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AX Leaderboard &mdash; MCP Manifest Quality</title>
  <style>${css}</style>
</head>
<body>
  <header class="site-header">
    <h1>AX Leaderboard</h1>
    <p>MCP manifest quality scores &mdash; model drivability + static design quality, no live server required. &nbsp;<a href="data/scores/SCHEMA.md">Methodology &rarr;</a></p>
  </header>

  ${renderSection(data.v3, MODEL_COLS, 3)}
  ${data.v2.length > 0 ? renderSection(data.v2, MODEL_COLS, 2) : ''}

  <footer class="site-footer">
    <a href="data/scores/SCHEMA.md">Score schema</a>
    <a href="https://github.com/zgeorge/ax-leaderboard">GitHub</a>
    <span>Submit: PR your manifest to <code>data/manifests/</code> &mdash; no live server required</span>
    <span style="margin-left:auto">Generated ${data.generatedAt.slice(0, 10)}</span>
  </footer>

  <script>
  const DATA = ${JSON.stringify(data)};

  function toggleRow(serverRow) {
    const next = serverRow.nextElementSibling;
    if (!next || !next.classList.contains('expansion-row')) return;
    const isOpen = next.style.display !== 'none';
    next.style.display = isOpen ? 'none' : '';
    serverRow.classList.toggle('open', !isOpen);
    const hint = serverRow.querySelector('.expand-hint');
    if (hint) hint.textContent = isOpen ? '▸' : '▾';
  }
  </script>
</body>
</html>`;
}
```

- [ ] **Step 4: Wire into the script**

At the end of the file (after `console.log('✔  README.md')`), append:
```js
const htmlData = buildLeaderboardData();
writeFileSync(join(root, 'index.html'), generateHTML(htmlData), 'utf8');
console.log('✔  index.html');
```

- [ ] **Step 5: Run and verify skeleton**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard && node scripts/gen-leaderboard.mjs
```

Expected:
```
✔  assets/leaderboard-v3.svg (1 servers)
✔  assets/leaderboard-v2.svg (7 servers)
✔  README.md
✔  index.html
```

```bash
open /Users/zach/Documents/Projects/ax-leaderboard/index.html
```

Verify: dark background, "AX Leaderboard" heading, tagline with methodology link, footer with schema/GitHub/submit links, and stub section placeholders in between.

- [ ] **Step 6: Commit**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard
git add scripts/gen-leaderboard.mjs
git commit -m "feat: add generateHTML skeleton with CSS and page shell"
```

---

### Task 3: Implement `renderSection()` — full table with model columns and server rows

**Files:**
- Modify: `scripts/gen-leaderboard.mjs` (replace the `renderSection()` stub from Task 2)

After this task the page shows the complete table — ranked servers, grouped model columns, colored score cells, v2 amber banner. Expansion rows are empty shells (added here, filled in Task 4).

- [ ] **Step 1: Add `escapeHtml()` helper immediately before `renderSection()`**

Find and insert before the stub:
```js
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

- [ ] **Step 2: Replace the `renderSection()` stub with the full implementation**

Replace:
```js
function renderSection(rows, modelCols, version) {
  return `<section class="ax-section"><p style="color:#7d8590"><!-- table v${version}: ${rows.length} rows --></p></section>`;
}
```

With:

```js
function renderSection(rows, modelCols, version) {
  const isV3 = version >= 3;
  const heading = isV3
    ? 'Scores &mdash; schema v3 (current rubric)'
    : 'Scores &mdash; schema v2 (legacy, pending re-score)';
  const banner = isV3 ? '' : `
    <div class="v2-banner">
      &#9888; Scored under the <strong>v2 rubric</strong> (no static quality component) &mdash;
      not comparable to v3. These servers are pending re-score.
    </div>`;

  // Which model columns start a new family group (get a left-border separator)
  const isFamilyStart = modelCols.map(
    (col, i) => i === 0 || modelCols[i - 1].family !== col.family,
  );

  const theadCols = modelCols.map((col, i) => {
    const cls = [`family-${col.family}`, isFamilyStart[i] ? 'col-sep' : ''].filter(Boolean).join(' ');
    return `<th class="${cls}">${col.label}</th>`;
  }).join('');

  const colCount = 3 + modelCols.length + 2; // rank + server + agg + models + cov + date

  const tbodyRows = rows.map((row, idx) => {
    const modelCells = modelCols.map((col, i) => {
      const m = row.byModel[col.id];
      const tdCls = `model-cell${isFamilyStart[i] ? ' col-sep' : ''}`;
      if (!m) return `<td class="${tdCls}"><span class="score-empty">&mdash;</span></td>`;
      return `<td class="${tdCls}"><span class="score-badge ${scoreClass(m.axScore)}">${m.axScore}</span></td>`;
    }).join('');

    const cov = row.coverage
      ? `${row.coverage.toolsCovered}/${row.coverage.toolsTotal}`
      : '&mdash;';

    return `
      <tr class="server-row" onclick="toggleRow(this)">
        <td class="rank">${idx + 1}</td>
        <td class="server-name">${escapeHtml(row.name)} <span class="expand-hint">&#9658;</span></td>
        <td style="text-align:center">
          <span class="score-badge agg-score ${scoreClass(row.aggregate)}">${row.aggregate}</span>
          <span class="agg-std">&plusmn;${row.aggregateStd}</span>
        </td>
        ${modelCells}
        <td class="cov-cell col-sep">${cov}</td>
        <td class="date-cell">${row.scoredAt}</td>
      </tr>
      <tr class="expansion-row" style="display:none">
        <td colspan="${colCount}">
          ${renderExpansion(row, version)}
        </td>
      </tr>`;
  }).join('');

  return `
    <section class="ax-section">
      <h2>${heading}</h2>
      ${banner}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Server</th>
              <th style="text-align:center">AX &#x2300;</th>
              ${theadCols}
              <th class="col-sep" style="text-align:center">Coverage</th>
              <th style="text-align:right">Scored</th>
            </tr>
          </thead>
          <tbody>${tbodyRows}</tbody>
        </table>
      </div>
    </section>`;
}
```

- [ ] **Step 3: Add `renderExpansion()` stub (needed by `renderSection()` above)**

Insert immediately before `renderSection()` (after `escapeHtml()`):
```js
function renderExpansion(row, version) {
  return `<div style="color:#7d8590;font-size:11px;"><!-- sub-scores: ${escapeHtml(row.name)} --></div>`;
}
```

- [ ] **Step 4: Run and verify table renders correctly**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard && node scripts/gen-leaderboard.mjs && open index.html
```

Verify in browser:
- v3 section: GitHub MCP rank 1, aggregate 76 in a yellow badge, Sonnet column shows `76`, all other 8 model columns show `—`
- v2 section: amber banner, 7 servers ranked Sentry 92 (green), Notion 82 (blue), Memory 74 (yellow), Seq. Thinking 73 (yellow), Filesystem 72 (yellow), Everything 68 (orange), Playwright 67 (orange)
- Anthropic column headers in blue, OpenAI in green, Google in amber
- Thin left-border separators at first column of each family group
- Clicking rows toggles ▸/▾ but expansion is empty (stub content)

- [ ] **Step 5: Commit**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard
git add scripts/gen-leaderboard.mjs
git commit -m "feat: add table rendering with grouped model columns and server rows"
```

---

### Task 4: Implement `renderExpansion()` — sub-score bars and top fixes

**Files:**
- Modify: `scripts/gen-leaderboard.mjs` (replace the `renderExpansion()` stub from Task 3)

After this task, clicking any server row shows proportional sub-score bars and top fixes.

**Sub-score bar math:** Each bar segment has `flex = Math.round(weight × subScore × 10000)`. For GitHub MCP (Sonnet 4.6): intent=0.9111→flex 2278, tools=1.0→2500, static=0.4596→919, synth=0.6144→1229, error=0.6764→676; sum=7602. Spacer flex = 10000 − 7602 = 2398. This makes the bar fill ≈76% of the container (matching the AX score), with each segment's share proportional to its weighted contribution.

- [ ] **Step 1: Replace the `renderExpansion()` stub with the full implementation**

Replace:
```js
function renderExpansion(row, version) {
  return `<div style="color:#7d8590;font-size:11px;"><!-- sub-scores: ${escapeHtml(row.name)} --></div>`;
}
```

With:

```js
function renderExpansion(row, version) {
  const isV3 = version >= 3;
  const subScoreDefs = isV3
    ? [
        { key: 'intentInterpretation', label: 'Intent', cls: 'bar-intent', weight: 0.25 },
        { key: 'toolCallConstruction', label: 'Tools',  cls: 'bar-tools',  weight: 0.25 },
        { key: 'staticQuality',        label: 'Static', cls: 'bar-static', weight: 0.20 },
        { key: 'resultSynthesis',      label: 'Synth',  cls: 'bar-synth',  weight: 0.20 },
        { key: 'errorRecovery',        label: 'Error',  cls: 'bar-error',  weight: 0.10 },
      ]
    : [
        { key: 'intentInterpretation', label: 'Intent', cls: 'bar-intent', weight: 0.35 },
        { key: 'toolCallConstruction', label: 'Tools',  cls: 'bar-tools',  weight: 0.35 },
        { key: 'resultSynthesis',      label: 'Synth',  cls: 'bar-synth',  weight: 0.20 },
        { key: 'errorRecovery',        label: 'Error',  cls: 'bar-error',  weight: 0.10 },
      ];

  const scoredModels = Object.entries(row.byModel);
  if (scoredModels.length === 0) {
    return '<div style="color:#7d8590;font-size:11px;">No scored models.</div>';
  }

  const modelBlocks = scoredModels.map(([modelId, m]) => {
    const segments = subScoreDefs.map(def => {
      const val = m.subScores[def.key] ?? 0;
      const flexVal = Math.round(def.weight * val * 10000);
      const pct = Math.round(val * 100);
      return { cls: def.cls, label: def.label, flexVal, pct, colorCls: scoreClass(pct) };
    });
    const usedFlex = segments.reduce((s, seg) => s + seg.flexVal, 0);
    const spacerFlex = Math.max(0, 10000 - usedFlex);

    const barSegments = segments
      .map(seg => `<div class="bar-segment ${seg.cls}" style="flex:${seg.flexVal}"></div>`)
      .join('');
    const spacer = spacerFlex > 0
      ? `<div style="flex:${spacerFlex}"></div>`
      : '';

    const barLabels = segments
      .map(seg => `<span style="flex:${seg.flexVal}" class="${seg.colorCls}-text">${seg.pct}% ${seg.label}</span>`)
      .join('');

    return `
      <div>
        <div class="model-block-label">${escapeHtml(modelId)} &nbsp;<span style="color:#7d8590">${m.axScore} &plusmn;${m.axScoreStd}</span></div>
        <div class="bar-container">${barSegments}${spacer}</div>
        <div class="bar-labels">${barLabels}</div>
      </div>`;
  }).join('');

  const topFixesHtml = row.topFixes && row.topFixes.length > 0
    ? `<div class="top-fixes">
        <span class="top-fixes-label">Top fixes</span>
        ${row.topFixes.map(f => `<span class="fix-item">${escapeHtml(f.issue)}</span>`).join(' &middot; ')}
       </div>`
    : '';

  return `<div class="subscore-blocks">${modelBlocks}</div>${topFixesHtml}`;
}
```

- [ ] **Step 2: Run and verify expansion rows work**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard && node scripts/gen-leaderboard.mjs && open index.html
```

Click GitHub MCP (v3 section). Verify:
- Sub-score bar appears with 5 colored segments + dark spacer
- Bar fills ~76% of its container
- Labels show: `91% Intent` (green), `100% Tools` (green), `46% Static` (orange), `61% Synth` (yellow), `68% Error` (yellow)
- Top fixes appear as dot-separated items below the bar

Click any v2 row (e.g. Sentry MCP). Verify:
- 4-bar layout (no Static bar)
- Bar fills ~92% of its container
- Labels reflect Sentry's sub-scores

Click same row again — expansion collapses, hint reverts to ▸.

- [ ] **Step 3: Commit**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard
git add scripts/gen-leaderboard.mjs
git commit -m "feat: add sub-score expansion rows with proportional bars and top fixes"
```

---

### Task 5: Add `.nojekyll`, commit `index.html`, push

**Files:**
- New: `.nojekyll` (repo root)
- New: `index.html` (generated artifact, repo root)

- [ ] **Step 1: Add `.nojekyll` to prevent GitHub Pages Jekyll processing**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard
touch .nojekyll
git add .nojekyll
git commit -m "chore: add .nojekyll for GitHub Pages"
```

- [ ] **Step 2: Final end-to-end run**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard && node scripts/gen-leaderboard.mjs
```

Expected:
```
✔  assets/leaderboard-v3.svg (1 servers)
✔  assets/leaderboard-v2.svg (7 servers)
✔  README.md
✔  index.html
```

- [ ] **Step 3: Full browser smoke check**

```bash
open /Users/zach/Documents/Projects/ax-leaderboard/index.html
```

Verify the complete checklist:
- Dark background, "AX Leaderboard" header with tagline and methodology link
- v3 section: GitHub MCP at rank 1, score 76 (yellow badge), only Sonnet column populated
- v2 section: amber warning banner, 7 servers in correct score order (Sentry 92 first)
- Model column headers: Anthropic blue, OpenAI green, Google amber; thin left-border separators at family boundaries
- Clicking any row expands/collapses sub-score bars
- v3 row: 5 bars, labels match score JSON values
- v2 row: 4 bars (no Static), top fixes where present
- Footer: schema link, GitHub link, submit note, generated date
- Existing README.md and SVG assets unchanged (run `git diff HEAD -- README.md assets/` — should show no changes)

- [ ] **Step 4: Commit index.html**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard
git add index.html
git commit -m "feat: generate index.html static leaderboard page"
```

- [ ] **Step 5: Push**

```bash
cd /Users/zach/Documents/Projects/ax-leaderboard && git push
```

- [ ] **Step 6: Verify GitHub Pages (allow 1–2 min for deployment)**

GitHub Pages serves from the `main` branch root by default, but it must be enabled in the repo settings if it hasn't been already. Check Settings → Pages → Source → "Deploy from a branch" → `main` / `/ (root)`. Once enabled, the site will be live at `https://zgeorge.github.io/ax-leaderboard/`.
