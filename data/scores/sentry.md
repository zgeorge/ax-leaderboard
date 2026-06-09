# AX Score — Sentry MCP

- Manifest source: `file`
- Scored at: 2026-06-09T21:00:46.452Z
- Generation model: `gemini-2.5-flash`
- Canary: ✅ pass (clean 81, broken 19)
- Tool coverage: 22/22 (100%); distractors: 8%

## Scores by model

| Model | AX | n | Intent | Tool calls | Synthesis | Error recovery | Low signal | Stable |
|---|---|---|---|---|---|---|---|---|
| `claude-sonnet-4-6` | **92** ± 0.5 | 3 | 96% | 100% | 81% | 76% | no | yes |

## Per-tool results (success variant)

| Tool | Intents | Right tool | Params correct | Synthesized |
|---|---|---|---|---|
| `whoami` | 1 | 100% | 100% | 100% |
| `find_organizations` | 1 | 100% | 100% | 100% |
| `find_teams` | 1 | 100% | 100% | 100% |
| `find_projects` | 1 | 100% | 100% | 100% |
| `find_releases` | 1 | 100% | 100% | 0% |
| `get_issue_tag_values` | 1 | 100% | 100% | 100% |
| `get_replay_details` | 1 | 100% | 100% | 100% |
| `get_event_attachment` | 1 | 100% | 100% | 100% |
| `update_issue` | 1 | 100% | 100% | 100% |
| `search_events` | 1 | 100% | 100% | 0% |
| `create_team` | 1 | 100% | 100% | 0% |
| `create_project` | 1 | 100% | 100% | 0% |
| `update_project` | 1 | 100% | 100% | 0% |
| `create_dsn` | 1 | 100% | 100% | 100% |
| `find_dsns` | 1 | 100% | 100% | 100% |
| `analyze_issue_with_seer` | 1 | 100% | 100% | 100% |
| `search_docs` | 1 | 100% | 100% | 0% |
| `get_doc` | 1 | 100% | 100% | 0% |
| `search_issues` | 1 | 100% | 100% | 100% |
| `search_issue_events` | 1 | 100% | 100% | 100% |
| `get_profile_details` | 1 | 100% | 100% | 100% |
| `get_sentry_resource` | 1 | 100% | 100% | 100% |

## Synthesis trust

- Mock confidence: 0 high / 21 medium / 1 low
- Synthesis trust: **medium** — Many tools lack output schemas; synthesis mocks are partly invented, so read the synthesis sub-score with some caution.

## Mock confidence

- `whoami`: **medium** (output schema absent; description quality: thin)
- `find_organizations`: **medium** (output schema absent; description quality: rich)
- `find_teams`: **medium** (output schema absent; description quality: rich)
- `find_projects`: **medium** (output schema absent; description quality: rich)
- `find_releases`: **medium** (output schema absent; description quality: rich)
- `get_issue_tag_values`: **medium** (output schema absent; description quality: rich)
- `get_replay_details`: **medium** (output schema absent; description quality: rich)
- `get_event_attachment`: **medium** (output schema absent; description quality: rich)
- `update_issue`: **medium** (output schema absent; description quality: rich)
- `search_events`: **medium** (output schema absent; description quality: rich)
- `create_team`: **medium** (output schema absent; description quality: rich)
- `create_project`: **medium** (output schema absent; description quality: rich)
- `update_project`: **medium** (output schema absent; description quality: rich)
- `create_dsn`: **medium** (output schema absent; description quality: rich)
- `find_dsns`: **medium** (output schema absent; description quality: rich)
- `analyze_issue_with_seer`: **medium** (output schema absent; description quality: rich)
- `search_docs`: **medium** (output schema absent; description quality: rich)
- `get_doc`: **low** (output schema absent; description quality: rich; mock generation failed; using synthetic fallback)
- `search_issues`: **medium** (output schema absent; description quality: rich)
- `search_issue_events`: **medium** (output schema absent; description quality: rich)
- `get_profile_details`: **medium** (output schema absent; description quality: rich)
- `get_sentry_resource`: **medium** (output schema absent; description quality: rich)

## Top fixes

- [impact: high, effort: medium] update_issue: Tool exposes 13 params; likely overloaded — split into focused tools.
- [impact: high, effort: medium] search_events: Tool exposes 11 params; likely overloaded — split into focused tools.
- [impact: high, effort: medium] search_issue_events: Tool exposes 10 params; likely overloaded — split into focused tools.
- [impact: high, effort: medium] get_profile_details: Tool exposes 9 params; likely overloaded — split into focused tools.
- [impact: medium, effort: low] whoami: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] find_organizations: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] find_teams: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] find_projects: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] find_releases: No output schema; mock generation and result synthesis are less reliable.
- [impact: medium, effort: low] get_issue_tag_values: No output schema; mock generation and result synthesis are less reliable.

## Run config

- Scored model: `claude-sonnet-4-6` @ temperature 0.7
- Generation + judge: `gemini-2.5-flash` / `gemini-2.5-flash`
- Repeats: 3 · Intents: 24 · Max rounds: 6
- Judge rubric: v1
- Weights: intent 0.35, tool calls 0.35, synthesis 0.2, error recovery 0.1
