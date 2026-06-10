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

function displayName(serverName) {
  return DISPLAY_NAMES[serverName] ?? serverName;
}

function scoreColor(ax) {
  if (ax >= 90) return '#2ea043'; // green
  if (ax >= 80) return '#388bfd'; // blue
  if (ax >= 70) return '#e3b341'; // yellow
  return '#f0883e';               // orange
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
