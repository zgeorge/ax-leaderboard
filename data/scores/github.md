# AX Score — github-mcp-server

- Manifest source: `file`
- Scored at: 2026-06-09T15:56:19.670Z
- Generation model: `gemini-2.5-flash`
- Canary: ✅ pass (clean 79, broken 20)
- Tool coverage: 20/26 (77%); distractors: 17%
- Not evaluated (no intent): `push_files`, `search_users`, `get_pull_request_status`, `update_pull_request_branch`, `get_pull_request_comments`, `get_pull_request_reviews`

## Scores by model

| Model | AX | n | Intent | Tool calls | Synthesis | Error recovery | Low signal | Stable |
|---|---|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **88** ± 0.5 | 3 | 88% | 100% | 76% | 71% | no | yes |

## Per-tool results (success variant)

| Tool | Intents | Right tool | Params correct | Synthesized |
|---|---|---|---|---|
| `create_repository` | 1 | 100% | 100% | 100% |
| `search_repositories` | 1 | 100% | 100% | 0% |
| `get_file_contents` | 1 | 100% | 100% | 100% |
| `create_or_update_file` | 1 | 100% | 100% | 0% |
| `create_issue` | 1 | 100% | 100% | 100% |
| `create_pull_request` | 1 | 100% | 100% | 100% |
| `fork_repository` | 1 | 100% | 100% | 0% |
| `create_branch` | 1 | 100% | 100% | 100% |
| `list_commits` | 1 | 100% | 100% | 0% |
| `list_issues` | 1 | 100% | 100% | 100% |
| `update_issue` | 1 | 100% | 100% | 100% |
| `add_issue_comment` | 1 | 100% | 100% | 100% |
| `search_code` | 1 | 100% | 100% | 0% |
| `search_issues` | 1 | 100% | 100% | 100% |
| `get_issue` | 1 | 100% | 100% | 100% |
| `get_pull_request` | 1 | 100% | 100% | 100% |
| `list_pull_requests` | 1 | 100% | 100% | 100% |
| `create_pull_request_review` | 1 | 100% | 100% | 100% |
| `merge_pull_request` | 1 | 100% | 100% | 0% |
| `get_pull_request_files` | 1 | 100% | 100% | 100% |

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
- `list_issues`: **medium** (output schema absent; description quality: thin)
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
- `get_pull_request_comments`: **low** (output schema absent; description quality: thin; mock generation failed; using synthetic fallback)
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
- Repeats: 3 · Intents: 24 · Max rounds: 6
- Judge rubric: v1
- Weights: intent 0.35, tool calls 0.35, synthesis 0.2, error recovery 0.1
