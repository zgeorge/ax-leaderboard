# AX Score — mcp-servers/everything

- Manifest source: `file`
- Scored at: 2026-06-09T19:20:36.714Z
- Generation model: `gemini-2.5-flash`
- Canary: ✅ pass (clean 92, broken 25)
- Tool coverage: 13/13 (100%); distractors: 25%

## Scores by model

| Model | AX | n | Intent | Tool calls | Synthesis | Error recovery | Low signal | Stable |
|---|---|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **68** ± 0.8 | 3 | 75% | 67% | 66% | 53% | no | yes |

## Per-tool results (success variant)

| Tool | Intents | Right tool | Params correct | Synthesized |
|---|---|---|---|---|
| `simulate-research-query` | 3 | 0% | 0% | 67% |
| `get-tiny-image` | 1 | 100% | 100% | 100% |
| `get-sum` | 2 | 100% | 100% | 50% |
| `get-resource-links` | 2 | 100% | 100% | 100% |
| `get-structured-content` | 1 | 0% | 0% | 0% |
| `echo` | 2 | 100% | 100% | 50% |
| `get-resource-reference` | 1 | 0% | 0% | 0% |
| `get-annotated-message` | 1 | 0% | 0% | 0% |
| `gzip-file-as-resource` | 1 | 100% | 100% | 100% |
| `trigger-long-running-operation` | 1 | 100% | 100% | 100% |
| `toggle-simulated-logging` | 1 | 100% | 100% | 100% |
| `toggle-subscriber-updates` | 1 | 100% | 100% | 100% |
| `get-env` | 1 | 100% | 100% | 100% |

## Synthesis trust

- Mock confidence: 0 high / 13 medium / 0 low
- Synthesis trust: **medium** — Many tools lack output schemas; synthesis mocks are partly invented, so read the synthesis sub-score with some caution.

## Mock confidence

- `echo`: **medium** (output schema absent; description quality: thin)
- `get-annotated-message`: **medium** (output schema absent; description quality: thin)
- `get-env`: **medium** (output schema absent; description quality: thin)
- `get-resource-links`: **medium** (output schema absent; description quality: thin)
- `get-resource-reference`: **medium** (output schema absent; description quality: thin)
- `get-structured-content`: **medium** (output schema present; description quality: thin)
- `get-sum`: **medium** (output schema absent; description quality: thin)
- `get-tiny-image`: **medium** (output schema absent; description quality: thin)
- `gzip-file-as-resource`: **medium** (output schema absent; description quality: rich)
- `toggle-simulated-logging`: **medium** (output schema absent; description quality: thin)
- `toggle-subscriber-updates`: **medium** (output schema absent; description quality: thin)
- `trigger-long-running-operation`: **medium** (output schema absent; description quality: thin)
- `simulate-research-query`: **medium** (output schema absent; description quality: rich)

## Top fixes

- [impact: medium, effort: low] echo: Description is only 5 words; expand to clarify intent.
- [impact: medium, effort: low] echo: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] get-annotated-message: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] get-env: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] get-resource-links: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] get-resource-reference: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] get-resource-reference: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] get-sum: Description is only 6 words; expand to clarify intent.
- [impact: medium, effort: low] get-sum: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] get-tiny-image: Description is only 6 words; expand to clarify intent.

## Run config

- Scored model: `claude-sonnet-4-6` @ temperature 0.7
- Generation + judge: `gemini-2.5-flash` / `gemini-2.5-flash`
- Repeats: 3 · Intents: 24 · Max rounds: 6
- Judge rubric: v1
- Weights: intent 0.35, tool calls 0.35, synthesis 0.2, error recovery 0.1
