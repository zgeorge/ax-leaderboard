# AX Leaderboard

<!-- LEADERBOARD:START -->

## Scores — schema v3 (current rubric)

![AX Leaderboard v3](assets/leaderboard-v3.svg)

| # | Server | AX Score | Intent | Tool Calls | Static | Synthesis | Error Rec. | Coverage | Scored |
|---|--------|:--------:|:------:|:----------:|:------:|:---------:|:----------:|:--------:|--------|
| 1 | **GitHub MCP** | **76** ±0.2 | 91% | 100% | 46% | 61% | 68% | 24/26 | 2026-06-09 |

## Scores — schema v2 (legacy, pending v3 re-score)

> ⚠️ Scored under the **v2 rubric** (35/35/20/10 weights, no static design-quality component). v2 and v3 numbers are **not comparable** — these servers will be re-scored under v3.

![AX Leaderboard v2](assets/leaderboard-v2.svg)

| # | Server | AX Score | Intent | Tool Calls | Synthesis | Error Rec. | Coverage | Scored |
|---|--------|:--------:|:------:|:----------:|:---------:|:----------:|:--------:|--------|
| 1 | **Sentry MCP** | **92** ±0.5 | 96% | 100% | 81% | 76% | 22/22 | 2026-06-09 |
| 2 | **Notion API** | **82** ±0.5 | 78% | 89% | 80% | 75% | 22/22 | 2026-06-09 |
| 3 | **Memory Server** | **74** ±1.2 | 65% | 98% | 46% | 69% | 9/9 | 2026-06-09 |
| 4 | **Seq. Thinking** | **73** ±1.2 | 79% | 100% | 43% | 13% | 1/1 | 2026-06-09 |
| 5 | **Filesystem** | **72** ±3.3 | 56% | 86% | 70% | 81% | 13/14 | 2026-06-09 |
| 6 | **Everything** | **68** ±0.8 | 75% | 67% | 66% | 53% | 13/13 | 2026-06-09 |
| 7 | **Playwright** | **67** ±1.4 | 61% | 64% | 89% | 57% | 23/23 | 2026-06-09 |

<!-- LEADERBOARD:END -->

Public leaderboard for **AX** — scoring the MCP tool surface, not the implementation.

AX scores an MCP server's **manifest** (tool names, descriptions, input/output schemas) by
exposing those tools to a model, intercepting every tool call, and returning a synthetic mock
response. The score reflects manifest quality — how well a model can interpret intent, select the
right tool, fill parameters, and synthesize the result — reproducibly and without a live server.

## What's here

- `data/scores/SCHEMA.md` — the **frozen** score-file schema (`schemaVersion: 3`).
- `data/scores/*.json` — one score file per server, pushed by the engine.
- `data/models.json` — the model matrix.
- `data/manifests/` — submitted manifests (no live server required to get on the board).

## Methodology (summary)

Five weighted sub-scores under the v3 rubric: (1) **intent interpretation** (25%) — right tool, or
correctly nothing for a distractor; (2) **tool call construction** (25%) — correct name, complete
and correctly-typed params; (3) **static design quality** (20%) — deterministic manifest analysis:
description quality, output schemas, documented params, no god-tools or duplicated descriptions;
(4) **result synthesis** (20%) — a correct, useful answer given a plausible mock response, scored
by an LLM judge; (5) **error recovery** (10%) — honest failure handling on the error-variant run.
The first three are deterministic (70% of the score); the mock executor pins each run to a
success or error response variant so synthesis and error recovery are measured separately.

> Scores use cross-family isolation: `claude-sonnet-4-6` is the scored model and `gemini-2.5-flash`
> generates intents and judges synthesis — so the 20% synthesis sub-score is not self-graded.
> Each server is scored over 3 repeats at temperature 0.7; the reported score is mean ± σ.

## Submit your manifest

Open a PR adding your manifest JSON to `data/manifests/`, or use the issue template. No live server
required.
