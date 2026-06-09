# AX Score — memory-server

- Manifest source: `file`
- Scored at: 2026-06-09T18:45:46.698Z
- Generation model: `gemini-2.5-flash`
- Canary: ✅ pass (clean 78, broken 17)
- Tool coverage: 9/9 (100%); distractors: 21%

## Scores by model

| Model | AX | n | Intent | Tool calls | Synthesis | Error recovery | Low signal | Stable |
|---|---|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **74** ± 1.2 | 3 | 65% | 98% | 46% | 69% | no | yes |

## Per-tool results (success variant)

| Tool | Intents | Right tool | Params correct | Synthesized |
|---|---|---|---|---|
| `create_entities` | 3 | 100% | 100% | 0% |
| `read_graph` | 1 | 100% | 100% | 100% |
| `create_relations` | 3 | 0% | 100% | 0% |
| `add_observations` | 2 | 50% | 100% | 0% |
| `search_nodes` | 2 | 100% | 100% | 100% |
| `delete_entities` | 2 | 50% | 50% | 50% |
| `delete_observations` | 2 | 100% | 100% | 50% |
| `delete_relations` | 2 | 100% | 100% | 100% |
| `open_nodes` | 2 | 100% | 100% | 100% |

## Synthesis trust

- Mock confidence: 0 high / 9 medium / 0 low
- Synthesis trust: **medium** — Many tools lack output schemas; synthesis mocks are partly invented, so read the synthesis sub-score with some caution.

## Mock confidence

- `create_entities`: **medium** (output schema present; description quality: thin)
- `create_relations`: **medium** (output schema present; description quality: thin)
- `add_observations`: **medium** (output schema present; description quality: thin)
- `delete_entities`: **medium** (output schema present; description quality: thin)
- `delete_observations`: **medium** (output schema present; description quality: thin)
- `delete_relations`: **medium** (output schema present; description quality: thin)
- `read_graph`: **medium** (output schema present; description quality: thin)
- `search_nodes`: **medium** (output schema present; description quality: thin)
- `open_nodes`: **medium** (output schema present; description quality: thin)

## Top fixes

- [impact: medium, effort: low] create_entities: Description is only 8 words; expand to clarify intent.
- [impact: medium, effort: low] create_entities: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] create_relations: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] add_observations: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] delete_observations: Description is only 9 words; expand to clarify intent.
- [impact: medium, effort: low] delete_observations: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] delete_relations: Description is only 7 words; expand to clarify intent.
- [impact: medium, effort: low] read_graph: Description is only 5 words; expand to clarify intent.

## Run config

- Scored model: `claude-sonnet-4-6` @ temperature 0.7
- Generation + judge: `gemini-2.5-flash` / `gemini-2.5-flash`
- Repeats: 3 · Intents: 24 · Max rounds: 6
- Judge rubric: v1
- Weights: intent 0.35, tool calls 0.35, synthesis 0.2, error recovery 0.1
