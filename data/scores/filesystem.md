# AX Score — secure-filesystem-server

- Manifest source: `file`
- Scored at: 2026-06-09T16:57:00.585Z
- Generation model: `gemini-2.5-flash`
- Canary: ✅ pass (clean 76, broken 20)
- Tool coverage: 13/14 (93%); distractors: 21%
- Not evaluated (no intent): `read_file`

## Scores by model

| Model | AX | n | Intent | Tool calls | Synthesis | Error recovery | Low signal | Stable |
|---|---|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **72** ± 3.3 | 3 | 56% | 86% | 70% | 81% | no | yes |

## Per-tool results (success variant)

| Tool | Intents | Right tool | Params correct | Synthesized |
|---|---|---|---|---|
| `list_directory` | 2 | 50% | 100% | 100% |
| `read_text_file` | 3 | 100% | 100% | 100% |
| `create_directory` | 1 | 100% | 100% | 0% |
| `write_file` | 2 | 50% | 100% | 0% |
| `list_allowed_directories` | 1 | 100% | 100% | 100% |
| `search_files` | 2 | 50% | 100% | 100% |
| `move_file` | 2 | 50% | 100% | 0% |
| `get_file_info` | 1 | 100% | 100% | 0% |
| `directory_tree` | 1 | 100% | 100% | 0% |
| `read_multiple_files` | 1 | 100% | 100% | 0% |
| `edit_file` | 1 | 0% | 0% | 100% |
| `list_directory_with_sizes` | 1 | 100% | 100% | 0% |
| `read_media_file` | 1 | 0% | 0% | 100% |

## Synthesis trust

- Mock confidence: 11 high / 3 medium / 0 low
- Synthesis trust: **high** — Most tools have output schemas + rich descriptions; synthesis mocks are well-grounded.

## Mock confidence

- `read_file`: **medium** (output schema present; description quality: thin)
- `read_text_file`: **high** (output schema present; description quality: rich)
- `read_media_file`: **medium** (output schema present; description quality: thin)
- `read_multiple_files`: **high** (output schema present; description quality: rich)
- `write_file`: **high** (output schema present; description quality: rich)
- `edit_file`: **medium** (output schema present; description quality: thin)
- `create_directory`: **high** (output schema present; description quality: rich)
- `list_directory`: **high** (output schema present; description quality: rich)
- `list_directory_with_sizes`: **high** (output schema present; description quality: rich)
- `directory_tree`: **high** (output schema present; description quality: rich)
- `move_file`: **high** (output schema present; description quality: rich)
- `search_files`: **high** (output schema present; description quality: rich)
- `get_file_info`: **high** (output schema present; description quality: rich)
- `list_allowed_directories`: **high** (output schema present; description quality: rich)

## Top fixes

- [impact: medium, effort: low] read_file: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] read_text_file: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] read_media_file: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] write_file: 2 param(s) lack a description or schema.
- [impact: medium, effort: low] edit_file: 2 param(s) lack a description or schema.
- [impact: medium, effort: low] create_directory: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] list_directory: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] list_directory_with_sizes: 1 param(s) lack a description or schema.
- [impact: medium, effort: low] directory_tree: 2 param(s) lack a description or schema.
- [impact: medium, effort: low] move_file: 2 param(s) lack a description or schema.

## Run config

- Scored model: `claude-sonnet-4-6` @ temperature 0.7
- Generation + judge: `gemini-2.5-flash` / `gemini-2.5-flash`
- Repeats: 3 · Intents: 24 · Max rounds: 6
- Judge rubric: v1
- Weights: intent 0.35, tool calls 0.35, synthesis 0.2, error recovery 0.1
