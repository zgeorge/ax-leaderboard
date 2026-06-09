# AX Score — Playwright

- Manifest source: `file`
- Scored at: 2026-06-09T19:21:38.909Z
- Generation model: `gemini-2.5-flash`
- Canary: ✅ pass (clean 79, broken 20)
- Tool coverage: 23/23 (100%); distractors: 4%

## Scores by model

| Model | AX | n | Intent | Tool calls | Synthesis | Error recovery | Low signal | Stable |
|---|---|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **67** ± 1.4 | 3 | 61% | 64% | 89% | 57% | no | yes |

## Per-tool results (success variant)

| Tool | Intents | Right tool | Params correct | Synthesized |
|---|---|---|---|---|
| `browser_close` | 1 | 100% | 100% | 100% |
| `browser_resize` | 1 | 100% | 100% | 100% |
| `browser_console_messages` | 1 | 100% | 100% | 100% |
| `browser_handle_dialog` | 1 | 0% | 100% | 100% |
| `browser_evaluate` | 1 | 100% | 100% | 100% |
| `browser_file_upload` | 1 | 100% | 100% | 0% |
| `browser_drop` | 1 | 0% | 0% | 0% |
| `browser_fill_form` | 1 | 0% | 0% | 100% |
| `browser_press_key` | 1 | 100% | 100% | 100% |
| `browser_type` | 1 | 0% | 0% | 100% |
| `browser_navigate` | 1 | 100% | 100% | 100% |
| `browser_navigate_back` | 1 | 100% | 100% | 100% |
| `browser_network_requests` | 1 | 100% | 100% | 0% |
| `browser_network_request` | 1 | 0% | 0% | 100% |
| `browser_run_code_unsafe` | 1 | 100% | 100% | 100% |
| `browser_take_screenshot` | 1 | 100% | 100% | 100% |
| `browser_snapshot` | 1 | 100% | 100% | 100% |
| `browser_click` | 1 | 0% | 0% | 100% |
| `browser_drag` | 1 | 0% | 0% | 100% |
| `browser_hover` | 1 | 0% | 0% | 100% |
| `browser_select_option` | 1 | 0% | 0% | 100% |
| `browser_tabs` | 1 | 100% | 100% | 100% |
| `browser_wait_for` | 1 | 100% | 100% | 100% |

## Synthesis trust

- Mock confidence: 0 high / 23 medium / 0 low
- Synthesis trust: **medium** — Many tools lack output schemas; synthesis mocks are partly invented, so read the synthesis sub-score with some caution.

## Mock confidence

- `browser_close`: **medium** (output schema absent; description quality: thin)
- `browser_resize`: **medium** (output schema absent; description quality: thin)
- `browser_console_messages`: **medium** (output schema absent; description quality: thin)
- `browser_handle_dialog`: **medium** (output schema absent; description quality: thin)
- `browser_evaluate`: **medium** (output schema absent; description quality: thin)
- `browser_file_upload`: **medium** (output schema absent; description quality: thin)
- `browser_drop`: **medium** (output schema absent; description quality: thin)
- `browser_fill_form`: **medium** (output schema absent; description quality: thin)
- `browser_press_key`: **medium** (output schema absent; description quality: thin)
- `browser_type`: **medium** (output schema absent; description quality: thin)
- `browser_navigate`: **medium** (output schema absent; description quality: thin)
- `browser_navigate_back`: **medium** (output schema absent; description quality: thin)
- `browser_network_requests`: **medium** (output schema absent; description quality: thin)
- `browser_network_request`: **medium** (output schema absent; description quality: thin)
- `browser_run_code_unsafe`: **medium** (output schema absent; description quality: thin)
- `browser_take_screenshot`: **medium** (output schema absent; description quality: thin)
- `browser_snapshot`: **medium** (output schema absent; description quality: thin)
- `browser_click`: **medium** (output schema absent; description quality: thin)
- `browser_drag`: **medium** (output schema absent; description quality: thin)
- `browser_hover`: **medium** (output schema absent; description quality: thin)
- `browser_select_option`: **medium** (output schema absent; description quality: thin)
- `browser_tabs`: **medium** (output schema absent; description quality: thin)
- `browser_wait_for`: **medium** (output schema absent; description quality: thin)

## Top fixes

- [impact: medium, effort: low] browser_close: Description is only 3 words; expand to clarify intent.
- [impact: medium, effort: low] browser_close: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] browser_resize: Description is only 4 words; expand to clarify intent.
- [impact: medium, effort: low] browser_resize: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] browser_console_messages: Description is only 4 words; expand to clarify intent.
- [impact: medium, effort: low] browser_console_messages: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] browser_handle_dialog: Description is only 3 words; expand to clarify intent.
- [impact: medium, effort: low] browser_handle_dialog: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] browser_evaluate: Description is only 7 words; expand to clarify intent.
- [impact: medium, effort: low] browser_evaluate: No output schema; mock generation and result synthesis are less reliable.

## Run config

- Scored model: `claude-sonnet-4-6` @ temperature 0.7
- Generation + judge: `gemini-2.5-flash` / `gemini-2.5-flash`
- Repeats: 3 · Intents: 24 · Max rounds: 6
- Judge rubric: v1
- Weights: intent 0.35, tool calls 0.35, synthesis 0.2, error recovery 0.1
