#!/usr/bin/env node
/**
 * Generates assets/leaderboard-v3.svg + assets/leaderboard-v2.svg and splices the leaderboard
 * tables into README.md — one chart + table PER SCHEMA VERSION, because v2 and v3 scores use
 * different rubrics (v3 adds the 20% staticQuality sub-score and re-weights the rest) and must
 * never be ranked against each other.
 * Run: node scripts/gen-leaderboard.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const DISPLAY_NAMES = {
  'Sentry MCP': 'Sentry MCP',
  'github-mcp-server': 'GitHub MCP',
  'Notion API': 'Notion API',
  'memory-server': 'Memory Server',
  'sequential-thinking-server': 'Seq. Thinking',
  'secure-filesystem-server': 'Filesystem',
  'mcp-servers/everything': 'Everything',
  'Playwright': 'Playwright',
};

const RUBRICS = {
  3: {
    label: 'v3',
    footer:
      'AX v3 = 25% intent + 25% tool calls + 20% static design quality + 20% synthesis (cross-family judged) + 10% error recovery',
  },
  2: {
    label: 'v2',
    footer:
      'AX v2 (legacy) = 35% intent + 35% tool calls + 20% synthesis (cross-family judged) + 10% error recovery',
  },
};

function stdDev(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function displayName(serverName) {
  return DISPLAY_NAMES[serverName] ?? serverName;
}

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

function scoreColor(ax) {
  if (ax >= 90) return '#2ea043'; // green
  if (ax >= 80) return '#388bfd'; // blue
  if (ax >= 70) return '#e3b341'; // yellow
  return '#f0883e';               // orange
}

function scoreClass(ax) {
  if (ax >= 90) return 'score-green';
  if (ax >= 80) return 'score-blue';
  if (ax >= 70) return 'score-yellow';
  return 'score-orange';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
      const weight = (m.scoreWeights && m.scoreWeights[def.key] != null)
        ? m.scoreWeights[def.key]
        : def.weight;
      const flexVal = Math.round(weight * val * 10000);
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

    const labelSpacer = spacerFlex > 0
      ? `<span style="flex:${spacerFlex}" aria-hidden="true"></span>`
      : '';
    const barLabels = segments
      .map(seg => `<span style="flex:${seg.flexVal}" class="${seg.colorCls}-text">${seg.pct}% ${seg.label}</span>`)
      .join('') + labelSpacer;

    return `
      <div>
        <div class="model-block-label">${escapeHtml(modelId)} &nbsp;<span style="color:#7d8590">${m.axScore} &plusmn;${m.axScoreStd ?? 0}</span></div>
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
        <td class="date-cell">${escapeHtml(row.scoredAt)}</td>
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

function safeJsonEmbed(obj) {
  return JSON.stringify(obj)
    .replace(/<\/script>/gi, '<\\/script>')
    .replace(/<!--/g, '<\\!--');
}

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
  const DATA = ${safeJsonEmbed(data)};

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

// ── Load & group scores by schema version ────────────────────────────────────

const scoresDir = join(root, 'data', 'scores');
const allScores = readdirSync(scoresDir)
  .filter(f => f.endsWith('.json') && f !== 'SCHEMA.json')
  .map(f => {
    const data = JSON.parse(readFileSync(join(scoresDir, f), 'utf8'));
    const model = Object.values(data.models)[0];
    const s = model.subScores;
    return {
      slug: basename(f, '.json'),
      schemaVersion: data.schemaVersion ?? 2,
      name: displayName(data.server.name),
      ax: model.axScore,
      std: Math.round(model.axScoreStd * 10) / 10,
      intent: Math.round(s.intentInterpretation * 100),
      tool: Math.round(s.toolCallConstruction * 100),
      // v3 only — undefined on v2 score files.
      static: s.staticQuality !== undefined ? Math.round(s.staticQuality * 100) : null,
      synthesis: Math.round(s.resultSynthesis * 100),
      error: Math.round(s.errorRecovery * 100),
      coverage: data.coverage ?? null,
      scoredAt: (data.server.scoredAt ?? '').slice(0, 10),
    };
  })
  .sort((a, b) => b.ax - a.ax);

const byVersion = new Map();
for (const s of allScores) {
  const list = byVersion.get(s.schemaVersion) ?? [];
  list.push(s);
  byVersion.set(s.schemaVersion, list);
}

// ── SVG chart (height scales with row count) ─────────────────────────────────

function genSVG(rows, version) {
  const rubric = RUBRICS[version];
  const W = 800;
  const xLeft = 185, xRight = 728;
  const chartW = xRight - xLeft;
  const yTop = 62;
  const rowH = 30;
  const yBottom = yTop + rows.length * rowH;
  const H = yBottom + 58; // axis labels + footer

  const font = `font-family="system-ui,-apple-system,'Segoe UI',sans-serif"`;

  const gridXs = [0, 25, 50, 75, 100].map(v => xLeft + (v / 100) * chartW);

  const gridLines = gridXs.map(x =>
    `  <line x1="${x.toFixed(1)}" y1="${yTop}" x2="${x.toFixed(1)}" y2="${yBottom}" stroke="#21262d" stroke-width="1"/>`
  ).join('\n');

  const axisLabels = [0, 25, 50, 75, 100].map((v, i) =>
    `  <text x="${gridXs[i].toFixed(1)}" y="${yBottom + 20}" text-anchor="middle" ${font} font-size="11" fill="#7d8590">${v}</text>`
  ).join('\n');

  const barRows = rows.map((s, i) => {
    const y = yTop + i * rowH;
    const barW = Math.round((s.ax / 100) * chartW * 10) / 10;
    const color = scoreColor(s.ax);
    const barRight = xLeft + barW;
    return [
      `  <text x="${xLeft - 8}" y="${y + 18}" text-anchor="end" ${font} font-size="12" fill="#c9d1d9">${s.name}</text>`,
      `  <rect x="${xLeft}" y="${y + 4}" width="${barW}" height="22" fill="${color}" rx="3" opacity="0.9"/>`,
      `  <text x="${(barRight + 8).toFixed(1)}" y="${y + 18}" text-anchor="start" ${font} font-size="12" font-weight="600" fill="${color}">${s.ax} ±${s.std}</text>`,
    ].join('\n');
  }).join('\n');

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AX Leaderboard (schema ${rubric.label})">
  <title>AX Leaderboard (schema ${rubric.label}) — MCP Manifest Quality Scores</title>
  <rect width="${W}" height="${H}" fill="#0d1117" rx="12"/>
  <text x="400" y="32" text-anchor="middle" ${font} font-size="15" font-weight="600" fill="#e6edf3">AX Leaderboard — MCP Manifest Quality (schema ${rubric.label})</text>
  <text x="400" y="50" text-anchor="middle" ${font} font-size="11" fill="#7d8590">claude-sonnet-4-6 scored · gemini-2.5-flash judged · 3 repeats, temperature 0.7</text>
${gridLines}
${barRows}
${axisLabels}
  <text x="400" y="${H - 12}" text-anchor="middle" ${font} font-size="10" fill="#656d76">${rubric.footer}</text>
</svg>
`;
}

// ── Markdown tables ──────────────────────────────────────────────────────────

function genTable(rows, version) {
  const withStatic = version >= 3;
  const header = withStatic
    ? [
        '| # | Server | AX Score | Intent | Tool Calls | Static | Synthesis | Error Rec. | Coverage | Scored |',
        '|---|--------|:--------:|:------:|:----------:|:------:|:---------:|:----------:|:--------:|--------|',
      ]
    : [
        '| # | Server | AX Score | Intent | Tool Calls | Synthesis | Error Rec. | Coverage | Scored |',
        '|---|--------|:--------:|:------:|:----------:|:---------:|:----------:|:--------:|--------|',
      ];
  const dataRows = rows.map((s, i) => {
    const cov = s.coverage ? `${s.coverage.toolsCovered}/${s.coverage.toolsTotal}` : '—';
    const cells = [
      `${i + 1}`,
      `**${s.name}**`,
      `**${s.ax}** ±${s.std}`,
      `${s.intent}%`,
      `${s.tool}%`,
      ...(withStatic ? [s.static !== null ? `${s.static}%` : '—'] : []),
      `${s.synthesis}%`,
      `${s.error}%`,
      cov,
      s.scoredAt,
    ];
    return `| ${cells.join(' | ')} |`;
  });
  return [...header, ...dataRows].join('\n');
}

// ── Assemble per-version sections ────────────────────────────────────────────

if (!existsSync(join(root, 'assets'))) mkdirSync(join(root, 'assets'));

const sections = [];
for (const version of [...byVersion.keys()].sort((a, b) => b - a)) {
  const rows = byVersion.get(version);
  const label = RUBRICS[version]?.label ?? `v${version}`;
  const svgName = `leaderboard-${label}.svg`;
  writeFileSync(join(root, 'assets', svgName), genSVG(rows, version), 'utf8');
  console.log(`✔  assets/${svgName} (${rows.length} servers)`);

  const heading =
    version >= 3
      ? '## Scores — schema v3 (current rubric)'
      : `## Scores — schema v${version} (legacy, pending v3 re-score)`;
  const caveat =
    version >= 3
      ? ''
      : '\n> ⚠️ Scored under the **v2 rubric** (35/35/20/10 weights, no static design-quality component). ' +
        'v2 and v3 numbers are **not comparable** — these servers will be re-scored under v3.\n';
  sections.push(
    [heading, caveat, `![AX Leaderboard ${label}](assets/${svgName})`, '', genTable(rows, version)].join('\n'),
  );
}

// ── README splice ────────────────────────────────────────────────────────────

const readmePath = join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
const block = [
  '<!-- LEADERBOARD:START -->',
  '',
  sections.join('\n\n'),
  '',
  '<!-- LEADERBOARD:END -->',
].join('\n');

let updated;
if (readme.includes('<!-- LEADERBOARD:START -->')) {
  updated = readme.replace(
    /<!-- LEADERBOARD:START -->[\s\S]*?<!-- LEADERBOARD:END -->/,
    block,
  );
} else {
  updated = readme.replace(/^(# [^\n]+\n)/, `$1\n${block}\n`);
}

writeFileSync(readmePath, updated, 'utf8');
console.log('✔  README.md');

const htmlData = buildLeaderboardData();
writeFileSync(join(root, 'index.html'), generateHTML(htmlData), 'utf8');
console.log('✔  index.html');
