# AX Score — sequential-thinking-server

- Manifest source: `file`
- Scored at: 2026-06-09T19:41:34.965Z
- Generation model: `gemini-2.5-flash`
- Canary: ✅ pass (clean 91, broken 15)
- Tool coverage: 1/1 (100%); distractors: 29%

## Scores by model

| Model | AX | n | Intent | Tool calls | Synthesis | Error recovery | Low signal | Stable |
|---|---|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **73** ± 1.2 | 3 | 79% | 100% | 43% | 13% | no | yes |

## Per-tool results (success variant)

| Tool | Intents | Right tool | Params correct | Synthesized |
|---|---|---|---|---|
| `sequentialthinking` | 17 | 100% | 100% | 29% |

## Synthesis trust

- Mock confidence: 1 high / 0 medium / 0 low
- Synthesis trust: **high** — Most tools have output schemas + rich descriptions; synthesis mocks are well-grounded.

## Mock confidence

- `sequentialthinking`: **high** (output schema present; description quality: rich)

## Top fixes

- [impact: high, effort: medium] sequentialthinking: Tool exposes 9 params; likely overloaded — split into focused tools.
- [impact: low, effort: low] sequentialthinking: Param names mix casing conventions (e.g. snake_case and camelCase).

## Run config

- Scored model: `claude-sonnet-4-6` @ temperature 0.7
- Generation + judge: `gemini-2.5-flash` / `gemini-2.5-flash`
- Repeats: 3 · Intents: 24 · Max rounds: 6
- Judge rubric: v1
- Weights: intent 0.35, tool calls 0.35, synthesis 0.2, error recovery 0.1
