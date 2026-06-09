# AX Score — github-mcp-server

- Manifest source: `file`
- Scored at: 2026-06-09T06:38:31.772Z
- Generation model: `claude-sonnet-4-6`

## Scores by model

| Model | AX | Intent | Tool calls | Synthesis | Error recovery | Low signal |
|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **90** | 100% | 100% | 50% | 96% | no |

## Mock confidence

- `create_or_update_file`: **medium** (output schema absent; description quality: thin)
- `search_repositories`: **medium** (output schema absent; description quality: thin)
- `create_repository`: **medium** (output schema absent; description quality: thin)
- `get_file_contents`: **medium** (output schema absent; description quality: thin)
- `push_files`: **medium** (output schema absent; description quality: thin)
- `create_issue`: **medium** (output schema absent; description quality: thin)
- `create_pull_request`: **medium** (output schema absent; description quality: thin)
- `fork_repository`: **medium** (output schema absent; description quality: thin)
- `create_branch`: **medium** (output schema absent; description quality: thin)
- `list_commits`: **medium** (output schema absent; description quality: thin)
- `list_issues`: **medium** (output schema absent; description quality: thin)
- `update_issue`: **medium** (output schema absent; description quality: thin)
- `add_issue_comment`: **medium** (output schema absent; description quality: thin)
- `search_code`: **medium** (output schema absent; description quality: thin)
- `search_issues`: **medium** (output schema absent; description quality: thin)
- `search_users`: **medium** (output schema absent; description quality: thin)
- `get_issue`: **medium** (output schema absent; description quality: thin)
- `get_pull_request`: **medium** (output schema absent; description quality: thin)
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
