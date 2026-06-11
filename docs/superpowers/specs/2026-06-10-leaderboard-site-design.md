# AX Leaderboard Site — Design Spec

**Date:** 2026-06-10  
**Status:** Approved  
**Repo:** `ax-leaderboard` (public, GitHub Pages)

---

## Goal

A public-facing HTML leaderboard at `index.html` (GitHub Pages root) that renders all scored
servers. The aggregate AX score across models is the leading metric; per-model breakdown and
sub-scores are secondary signals. Replaces the README SVG bar charts as the primary visual
leaderboard, while the README tables remain for GitHub viewers.

---

## Architecture

### Build

Extend `scripts/gen-leaderboard.mjs` with a `generateHTML()` function invoked at the end of the
existing script. No new commands, no new tooling — `node scripts/gen-leaderboard.mjs` generates:

1. `assets/leaderboard-v3.svg` + `assets/leaderboard-v2.svg` (existing)
2. README.md table splice (existing)
3. **`index.html`** at repo root (new)

### Data

All score data is serialized inline as `const DATA = {...}` in a `<script>` tag. No runtime
fetches, no CDN, no external dependencies. `DATA` is derived from the score JSON reads the script
already performs.

**`DATA` shape:**
```js
{
  generatedAt: string,          // ISO timestamp
  models: {                     // from data/models.json
    families: {
      anthropic: { cheap, mid, frontier },
      openai:    { cheap, mid, frontier },
      google:    { cheap, mid, frontier },
    }
  },
  v3: ScoreRow[],               // servers with schemaVersion === 3, sorted by aggregate desc
  v2: ScoreRow[],               // servers with schemaVersion === 2, same sort
}

ScoreRow {
  slug: string,
  name: string,                 // display name
  aggregate: number,            // mean axScore across all scored models (= single model score when only 1)
  aggregateStd: number,         // std across models (0 when only 1)
  byModel: {
    [modelId: string]: {
      axScore: number,
      axScoreStd: number,       // std across repeats
      subScores: {
        intentInterpretation: number,
        toolCallConstruction: number,
        staticQuality: number | null,   // null for v2 scores
        resultSynthesis: number,
        errorRecovery: number,
      },
      scoreWeights: { ... },
    }
  },
  coverage: { toolsTotal, toolsCovered },
  topFixes: { issue, impact, effort }[],
  scoredAt: string,
}
```

### Deployment

`index.html` is committed to the repo root. GitHub Pages serves it automatically. No Actions
workflow needed — the same commit that adds a score JSON also runs `gen-leaderboard.mjs` and
commits the updated `index.html`.

---

## Page Structure

```
<head>  — inline CSS, no external resources
<body>
  <header>         — "AX Leaderboard" + one-line tagline + methodology link
  <section.v3>     — v3 table (current rubric)
  <section.v2>     — v2 table (legacy, hidden when empty)
  <footer>         — schema link + "Submit your manifest" CTA
<script>           — inline JS for expand/collapse only; DATA const
```

---

## Table Layout (Layout A)

One `<table>` per schema version section. Sticky header row.

### Columns

| Column | Notes |
|--------|-------|
| `#` | Rank (1-based, by aggregate score desc) |
| Server | Display name |
| **AX ⌀** | Aggregate score (large, colored). `±σ` on a second line (cross-model std; within-model std when only 1 model scored) |
| *(family separator)* Haiku · Sonnet · Opus | Anthropic group — blue headers, thin left border at group start |
| *(family separator)* GPT-mini · GPT-4o · o3 | OpenAI group — green headers |
| *(family separator)* Flash-Lite · Flash · Pro | Google group — amber headers |
| Coverage | `N/M tools` |
| Scored | Date of most recent score run |

Model cells show the axScore (colored) or `—` (grey) when not yet scored.

### Score colors

| Threshold | Color | Hex |
|-----------|-------|-----|
| ≥ 90 | Green | `#56d364` on `#1a4a2e` |
| ≥ 80 | Blue | `#388bfd` on `#1a3a4a` |
| ≥ 70 | Yellow | `#d29922` on `#3d2b0a` |
| < 70 | Orange | `#f0883e` on `#3d1f0a` |

Matches existing SVG color scheme.

### Row interaction

Click a server row to toggle an inline expansion `<tr>` immediately below it. The expand hint
(`▸` / `▾`) is appended to the server name cell.

---

## Sub-score Expansion Row

Appears as a full-width `<tr>` below the server row. Shows one block per scored model (only
models with a score for that server are rendered).

**Each model block contains:**
- Model ID label + `axScore ±std`
- Proportional bar chart: five segments with widths proportional to rubric weights × sub-score
  value. Segments colored by sub-score value using the same green/blue/yellow/orange thresholds.
  - Intent: 25% weight
  - Tool calls: 25% weight
  - Static quality: 20% weight (omitted for v2 rows — 4-bar layout)
  - Synthesis: 20% weight
  - Error recovery: 10% weight
- Sub-score percentage labels below each bar segment

**Top fixes** (if `topFixes` present in score JSON): up to 3 items shown as a dot-separated
list below the bars, labeled `TOP FIXES`.

---

## v2 / v3 Separation

Two `<section>` elements. v3 section is first, no warning. v2 section renders only when
`DATA.v2.length > 0`; it has an amber banner:

> ⚠️ Scored under the **v2 rubric** (no static quality component) — not comparable to v3.
> These servers are pending re-score.

The v2 sub-score expansion omits the Static bar and shows 4 bars (Intent / Tools / Synthesis /
Error Recovery) with weights renormalized to the v2 rubric (35/35/20/10).

---

## Visual Style

- **Theme:** Dark. Background `#0d1117`, surface `#161b22`, border `#21262d`, primary text
  `#c9d1d9`, muted `#7d8590`. Matches GitHub dark and existing SVG palette.
- **Typography:** `system-ui, -apple-system, 'Segoe UI', sans-serif`. No external fonts. Score
  numbers use the same stack at `font-weight: 700`.
- **No external dependencies:** All CSS and JS inline in `index.html`. Works offline.
- **Responsive:** Table scrolls horizontally on narrow viewports (`overflow-x: auto` on a
  wrapper). No layout breakpoints needed — the table is the page.

---

## What Is Not In Scope

- Per-server detail pages (the existing `data/scores/<name>.md` serves this role)
- Search or filtering (not needed at 8–25 servers)
- Any server-side logic
- The 9-model matrix being populated (the site is built to accommodate it; filling it is an
  engine task)
- CI95 / consistency / evalSetProfile fields (not yet populated in any score file; the expansion
  row can add them later without a design change)

---

## Files Changed

| File | Change |
|------|--------|
| `scripts/gen-leaderboard.mjs` | Add `generateHTML()` function; call it at end of script |
| `index.html` | New generated file at repo root |
| `docs/superpowers/specs/2026-06-10-leaderboard-site-design.md` | This spec |

`.gitignore` needs `.superpowers/` added (not present yet — the brainstorm session created that directory).
