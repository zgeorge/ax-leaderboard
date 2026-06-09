# AX Score — Notion API

- Manifest source: `file`
- Scored at: 2026-06-09T20:59:41.467Z
- Generation model: `gemini-2.5-flash`
- Canary: ✅ pass (clean 90, broken 20)
- Tool coverage: 22/22 (100%); distractors: 8%

## Scores by model

| Model | AX | n | Intent | Tool calls | Synthesis | Error recovery | Low signal | Stable |
|---|---|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **82** ± 0.5 | 3 | 78% | 89% | 80% | 75% | no | yes |

## Per-tool results (success variant)

| Tool | Intents | Right tool | Params correct | Synthesized |
|---|---|---|---|---|
| `API-get-user` | 1 | 100% | 100% | 100% |
| `API-get-users` | 1 | 100% | 100% | 100% |
| `API-get-self` | 1 | 100% | 100% | 100% |
| `API-post-search` | 1 | 100% | 100% | 0% |
| `API-get-block-children` | 1 | 100% | 100% | 100% |
| `API-patch-block-children` | 1 | 100% | 100% | 100% |
| `API-retrieve-a-block` | 1 | 100% | 100% | 100% |
| `API-update-a-block` | 1 | 100% | 100% | 0% |
| `API-delete-a-block` | 1 | 100% | 100% | 0% |
| `API-retrieve-a-page` | 1 | 100% | 100% | 100% |
| `API-patch-page` | 1 | 0% | 100% | 0% |
| `API-post-page` | 1 | 100% | 100% | 0% |
| `API-retrieve-a-page-property` | 1 | 0% | 0% | 100% |
| `API-retrieve-a-comment` | 1 | 100% | 100% | 100% |
| `API-create-a-comment` | 1 | 0% | 100% | 100% |
| `API-query-data-source` | 1 | 100% | 100% | 100% |
| `API-retrieve-a-data-source` | 1 | 100% | 100% | 100% |
| `API-update-a-data-source` | 1 | 100% | 100% | 0% |
| `API-create-a-data-source` | 1 | 0% | 0% | 0% |
| `API-list-data-source-templates` | 1 | 100% | 100% | 100% |
| `API-retrieve-a-database` | 1 | 100% | 100% | 100% |
| `API-move-page` | 1 | 0% | 0% | 100% |

## Synthesis trust

- Mock confidence: 0 high / 22 medium / 0 low
- Synthesis trust: **medium** — Many tools lack output schemas; synthesis mocks are partly invented, so read the synthesis sub-score with some caution.

## Mock confidence

- `API-get-user`: **medium** (output schema absent; description quality: thin)
- `API-get-users`: **medium** (output schema absent; description quality: thin)
- `API-get-self`: **medium** (output schema absent; description quality: thin)
- `API-post-search`: **medium** (output schema absent; description quality: thin)
- `API-get-block-children`: **medium** (output schema absent; description quality: thin)
- `API-patch-block-children`: **medium** (output schema absent; description quality: thin)
- `API-retrieve-a-block`: **medium** (output schema absent; description quality: thin)
- `API-update-a-block`: **medium** (output schema absent; description quality: thin)
- `API-delete-a-block`: **medium** (output schema absent; description quality: thin)
- `API-retrieve-a-page`: **medium** (output schema absent; description quality: thin)
- `API-patch-page`: **medium** (output schema absent; description quality: thin)
- `API-post-page`: **medium** (output schema absent; description quality: thin)
- `API-retrieve-a-page-property`: **medium** (output schema absent; description quality: thin)
- `API-retrieve-a-comment`: **medium** (output schema absent; description quality: thin)
- `API-create-a-comment`: **medium** (output schema absent; description quality: thin)
- `API-query-data-source`: **medium** (output schema absent; description quality: thin)
- `API-retrieve-a-data-source`: **medium** (output schema absent; description quality: thin)
- `API-update-a-data-source`: **medium** (output schema absent; description quality: thin)
- `API-create-a-data-source`: **medium** (output schema absent; description quality: thin)
- `API-list-data-source-templates`: **medium** (output schema absent; description quality: thin)
- `API-retrieve-a-database`: **medium** (output schema absent; description quality: thin)
- `API-move-page`: **medium** (output schema absent; description quality: thin)

## Top fixes

- [impact: high, effort: medium] API-query-data-source: Tool exposes 9 params; likely overloaded — split into focused tools.
- [impact: medium, effort: low] API-get-user: Description is only 9 words; expand to clarify intent.
- [impact: medium, effort: low] API-get-user: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] API-get-user: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] API-get-users: Description is only 9 words; expand to clarify intent.
- [impact: medium, effort: low] API-get-users: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] API-get-self: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] API-post-search: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] API-get-block-children: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] API-patch-block-children: No output schema; mock generation and result synthesis are less reliable.

## Run config

- Scored model: `claude-sonnet-4-6` @ temperature 0.7
- Generation + judge: `gemini-2.5-flash` / `gemini-2.5-flash`
- Repeats: 3 · Intents: 24 · Max rounds: 6
- Judge rubric: v1
- Weights: intent 0.35, tool calls 0.35, synthesis 0.2, error recovery 0.1
