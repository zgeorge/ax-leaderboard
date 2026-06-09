# AX Score File Schema — `schemaVersion: 1` (FROZEN)

One file per scored server: `data/scores/{server-name}.json`. **Frozen after Phase A.** Any
breaking change bumps `schemaVersion`. Everything in the engine and the leaderboard site couples
to this contract, so additive changes (new optional fields) are preferred over breaking ones.

> POC note: in the single-model proof of concept, `generationModel` equals the one scoring model
> (`claude-sonnet-4-6`). This violates the generation≠scoring isolation principle and is recorded
> honestly here rather than hidden. The two heaviest sub-scores are programmatic, so the score
> remains meaningful; treat `resultSynthesis` cautiously until isolation is restored.

## Top-level shape

```json
{
  "schemaVersion": 1,
  "server": { ... },
  "tools": { "{tool-name}": { ... } },
  "models": { "{model-id}": { ... } },
  "topFixes": [ ... ],
  "staticReport": { ... },
  "featureSignals": { ... }
}
```

## `schemaVersion` (integer, required)
Schema version of this file. Currently `1`.

## `server` (object, required)
| field | type | notes |
|-------|------|-------|
| `name` | string | Server name (matches the file name). |
| `registry` | string \| null | Registry URL the manifest came from, or null. |
| `manifestSource` | enum | `file` \| `url` \| `live-server` \| `registry` — how the manifest was obtained. |
| `executionMode` | enum | Always `mock` in AX. |
| `scoredAt` | string | ISO 8601 timestamp of the scoring run. |
| `generationModel` | string | Exact model ID that generated intents + mocks. POC: same as the scoring model. |

## `tools` (object, required)
Keyed by tool name. Each value describes the **mock fidelity** of that tool — a trust signal on
the score, surfaced on the leaderboard drilldown.

| field | type | notes |
|-------|------|-------|
| `mockConfidence` | enum | `high` \| `medium` \| `low`. high = output schema present AND substantive description (>30 words, domain-specific). medium = thin description, or no schema but a semantically clear name. low = name only, or generic/missing description. |
| `mockConfidenceReasons` | string[] | Human-readable reasons, e.g. `["output schema present", "description quality: thin"]`. |

If >50% of a server's tools are `low`, the leaderboard shows a warning badge and result-synthesis
scores should be read cautiously.

## `models` (object, required)
Keyed by **exact model ID** (no aliases). One block per model in the scoring run. POC: a single
key, `claude-sonnet-4-6`.

| field | type | notes |
|-------|------|-------|
| `axScore` | integer | Final weighted AX score, 0–100. |
| `subScores` | object | See below. |
| `scoreWeights` | object | The weights actually used for this block (must sum to 1.0). Present in **every** block so historical scores stay interpretable if weights are tuned. |
| `lowProgrammaticSignal` | boolean | True if the two programmatic sub-scores averaged < 0.40; synthesis is down-weighted and weights renormalized. |
| `tasks` | object[] | Per-task results (see below). |

### `subScores` (object)
| field | type | weight (default) | source |
|-------|------|------------------|--------|
| `intentInterpretation` | number 0–1 | 0.35 | programmatic — right tool selected, or correctly withheld on a distractor |
| `toolCallConstruction` | number 0–1 | 0.35 | programmatic — required params present, correctly typed, names correct |
| `resultSynthesis` | number 0–1 | 0.20 | LLM-judge — did the model surface a correct, useful answer from the mock response |
| `errorRecovery` | number 0–1 | 0.10 | secondary — synthesis gap between error-variant and success-variant runs |
| `tokensPerTask` | number | — | informational, unweighted |
| `latencyMs` | number | — | informational, unweighted |

### `scoreWeights` (object)
Keys: `intentInterpretation`, `toolCallConstruction`, `resultSynthesis`, `errorRecovery`. Values
sum to 1.0. Tokens and latency are never weighted into `axScore`.

### `tasks[]` (per-task record)
| field | type | notes |
|-------|------|-------|
| `intent` | string | The user intent presented to the model. |
| `expectedTool` | string \| null | Ground-truth tool; null for a distractor (no tool should be called). |
| `calledTool` | string \| null | Tool the model actually called first; null if none. |
| `paramsCorrect` | boolean | Required params present + correctly typed. |
| `mockVariant` | enum | `success` \| `empty` \| `partial` \| `error` — variant returned by the mock executor. |
| `completed` | boolean | Judge verdict: task satisfied. |
| `tokensUsed` | integer | Total tokens for this task. |
| `latencyMs` | integer | Wall-clock latency for this task. |

## `topFixes` (array, required)
Ranked manifest fixes — the teardown fuel.

| field | type | notes |
|-------|------|-------|
| `issue` | string | What's wrong, e.g. "god-tool `process_data` has 9 params". |
| `impact` | enum | `high` \| `medium` \| `low`. |
| `effort` | enum | `high` \| `medium` \| `low`. |

## `staticReport` (object, required)
Output of the static analyzer (B2): per-tool flags + severities and manifest-level metrics
(tools/list token cost, tool-count-vs-complexity). Shape owned by the engine; opaque to the
schema beyond "present".

## `featureSignals` (object, required)
Raw per-tool features (description word count, param count, schema depth, output schema present,
verb-first naming, etc.). The corpus for future design-law mining. Painful to retrofit, so it is
emitted from day one even though nothing consumes it yet.
