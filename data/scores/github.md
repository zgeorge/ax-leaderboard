# AX Score — github-mcp-server

- Manifest source: `file`
- Scored at: 2026-06-09T23:06:07.833Z
- Generation model: `gemini-2.5-flash`
- Canary: ✅ pass (clean 86, broken 20)
- Tool coverage: 24/26 (92%); distractors: 20%
- Not evaluated (no intent): `get_pull_request_comments`, `get_pull_request_reviews`

## Scores by model

| Model | AX | n | Intent | Tool calls | Static | Synthesis | Error recovery | Low signal | Stable |
|---|---|---|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **76** ± 0.2 | 3 | 91% | 100% | 46% | 61% | 68% | no | yes |

## Static design quality

- Score: **46%** (deterministic; 20% of AX under the default v3 weights)
- `list_issues`: 15%
- `update_issue`: 15%
- `create_issue`: 30%
- `add_issue_comment`: 30%
- `search_code`: 30%

## Per-tool results (success variant)

| Tool | Intents | Right tool | Params correct | Synthesized |
|---|---|---|---|---|
| `create_or_update_file` | 1 | 100% | 100% | 0% |
| `search_repositories` | 1 | 100% | 100% | 0% |
| `create_repository` | 1 | 100% | 100% | 0% |
| `get_file_contents` | 1 | 100% | 100% | 100% |
| `push_files` | 1 | 100% | 100% | 0% |
| `create_issue` | 1 | 100% | 100% | 100% |
| `create_pull_request` | 1 | 100% | 100% | 100% |
| `fork_repository` | 1 | 100% | 100% | 0% |
| `create_branch` | 1 | 100% | 100% | 100% |
| `list_commits` | 1 | 100% | 100% | 0% |
| `list_issues` | 1 | 100% | 100% | 0% |
| `update_issue` | 1 | 100% | 100% | 100% |
| `add_issue_comment` | 1 | 100% | 100% | 100% |
| `search_code` | 1 | 100% | 100% | 0% |
| `search_issues` | 1 | 100% | 100% | 0% |
| `search_users` | 1 | 100% | 100% | 100% |
| `get_issue` | 1 | 100% | 100% | 0% |
| `get_pull_request` | 1 | 100% | 100% | 100% |
| `list_pull_requests` | 1 | 100% | 100% | 100% |
| `create_pull_request_review` | 1 | 100% | 100% | 100% |
| `merge_pull_request` | 1 | 100% | 100% | 0% |
| `get_pull_request_files` | 1 | 100% | 100% | 100% |
| `get_pull_request_status` | 1 | 100% | 100% | 100% |
| `update_pull_request_branch` | 1 | 100% | 100% | 0% |

## Synthesis trust

- Mock confidence: 0 high / 19 medium / 7 low
- Synthesis trust: **medium** — Many tools lack output schemas; synthesis mocks are partly invented, so read the synthesis sub-score with some caution.

## Mock confidence

- `create_or_update_file`: **medium** (output schema absent; description quality: thin)
- `search_repositories`: **low** (output schema absent; description quality: thin; mock generation failed; using synthetic fallback)
- `create_repository`: **medium** (output schema absent; description quality: thin)
- `get_file_contents`: **medium** (output schema absent; description quality: thin)
- `push_files`: **medium** (output schema absent; description quality: thin)
- `create_issue`: **medium** (output schema absent; description quality: thin)
- `create_pull_request`: **low** (output schema absent; description quality: thin; mock generation failed; using synthetic fallback)
- `fork_repository`: **medium** (output schema absent; description quality: thin)
- `create_branch`: **medium** (output schema absent; description quality: thin)
- `list_commits`: **low** (output schema absent; description quality: thin; mock generation failed; using synthetic fallback)
- `list_issues`: **low** (output schema absent; description quality: thin; mock generation failed; using synthetic fallback)
- `update_issue`: **medium** (output schema absent; description quality: thin)
- `add_issue_comment`: **medium** (output schema absent; description quality: thin)
- `search_code`: **low** (output schema absent; description quality: thin; mock generation failed; using synthetic fallback)
- `search_issues`: **low** (output schema absent; description quality: thin; mock generation failed; using synthetic fallback)
- `search_users`: **medium** (output schema absent; description quality: thin)
- `get_issue`: **medium** (output schema absent; description quality: thin)
- `get_pull_request`: **low** (output schema absent; description quality: thin; mock generation failed; using synthetic fallback)
- `list_pull_requests`: **medium** (output schema absent; description quality: thin)
- `create_pull_request_review`: **medium** (output schema absent; description quality: thin)
- `merge_pull_request`: **medium** (output schema absent; description quality: thin)
- `get_pull_request_files`: **medium** (output schema absent; description quality: thin)
- `get_pull_request_status`: **medium** (output schema absent; description quality: thin)
- `update_pull_request_branch`: **medium** (output schema absent; description quality: thin)
- `get_pull_request_comments`: **medium** (output schema absent; description quality: thin)
- `get_pull_request_reviews`: **medium** (output schema absent; description quality: thin)

## Top fixes

- [impact: high, effort: medium] list_issues: Tool exposes 9 params; likely overloaded — split into focused tools.
- [impact: high, effort: medium] update_issue: Tool exposes 9 params; likely overloaded — split into focused tools.
- [impact: high, effort: medium] list_pull_requests: Tool exposes 9 params; likely overloaded — split into focused tools.
- [impact: medium, effort: low] create_or_update_file: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] search_repositories: Description is only 4 words; expand to clarify intent.
- [impact: medium, effort: low] search_repositories: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] create_repository: Description is only 8 words; expand to clarify intent.
- [impact: medium, effort: low] create_repository: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] get_file_contents: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] push_files: No output schema; mock generation and result synthesis are less reliable.

## Run config

- Scored model: `claude-sonnet-4-6` @ temperature 0.7
- Generation + judge: `gemini-2.5-flash` / `gemini-2.5-flash`
- Repeats: 3 · Intents: 30 · Max rounds: 6
- Judge rubric: v1
- Weights: intent 0.25, tool calls 0.25, static 0.2, synthesis 0.2, error recovery 0.1
