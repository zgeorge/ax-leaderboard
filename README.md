# AX Leaderboard

Public leaderboard for **AX** — scoring the MCP tool surface, not the implementation.

AX scores an MCP server's **manifest** (tool names, descriptions, input/output schemas) by
exposing those tools to a model, intercepting every tool call, and returning a synthetic mock
response. The score reflects manifest quality — how well a model can interpret intent, select the
right tool, fill parameters, and synthesize the result — reproducibly and without a live server.

## What's here

- `data/scores/SCHEMA.md` — the **frozen** score-file schema (`schemaVersion: 1`).
- `data/scores/*.json` — one score file per server, pushed by the engine.
- `data/models.json` — the model matrix.
- `data/manifests/` — submitted manifests (no live server required to get on the board).

## Methodology (summary)

Three questions, in order: (1) **intent interpretation** — right tool, or correctly nothing for a
distractor; (2) **tool call construction** — correct name, complete and correctly-typed params;
(3) **result synthesis** — a correct, useful answer given a plausible mock response. The first two
are scored programmatically; the third by an LLM judge. The mock executor controls the response,
so error recovery and result synthesis are tested across success / empty / partial / error
variants every run.

> Status: proof of concept. Scores currently come from a single model
> (`claude-sonnet-4-6`) used for generation and scoring; the two heaviest sub-scores are
> programmatic. Full multi-model, cross-family isolation is in progress.

## Submit your manifest

Open a PR adding your manifest JSON to `data/manifests/`, or use the issue template. No live server
required.
