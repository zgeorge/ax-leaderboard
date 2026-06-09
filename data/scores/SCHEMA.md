# AX Score File Schema — `schemaVersion: 2`

One file per scored server: `data/scores/{server-name}.json`. Any breaking change bumps
`schemaVersion`; additive optional fields stay within the current version. Everything in the engine
and the leaderboard site couples to this contract.

## What changed in v2 (vs v1)

v2 makes a score **defensible** rather than provisional:

- **Cross-family isolation.** Intents/mocks are generated and synthesis is judged by a model in a
  **different family** from the scored model (e.g. `gemini-2.5-pro` generates/judges, `claude-sonnet-4-6`
  is scored). The 20% synthesis sub-score is no longer self-graded. `generationModel` now differs from
  the scored model id.
- **Error bars.** The scored model runs at temperature > 0 over repeated passes; the score is reported
  as a mean with a standard deviation (`axScoreStd`) and an `unstable` flag.
- **Live canary.** Every published score records that the engine separated the clean fixture (≥75)
  from a broken fixture (≤45) **with the same providers, that day** (`canary`). The low fixture is a
  genuinely **undrivable** manifest (ambiguous tools + required params whose types can't hold the
  request), not a merely sloppy one — see *Methodology → What AX measures* for why.
- **Coverage.** The score states which tools the eval set actually exercised (`coverage`); uncovered
  tools are "not evaluated", not "evaluated and fine".
- **Synthesis trust + judge failures.** `synthesisTrust` annotates how grounded the synthesis mocks
  were (from the mock-confidence mix); `judgeFailures` counts trajectories excluded because the judge
  output was unparseable (never silently scored 0).
- **Reproducibility.** `runConfig` records exactly how the score was produced.

## Top-level shape

```json
{
  "schemaVersion": 2,
  "server": { ... },
  "tools": { "{tool-name}": { ... } },
  "models": { "{model-id}": { ... } },
  "topFixes": [ ... ],
  "staticReport": { ... },
  "featureSignals": { ... },
  "canary": { ... },          // optional (present when gated)
  "coverage": { ... },        // optional
  "synthesisTrust": { ... },  // optional
  "runConfig": { ... }        // optional
}
```

## `server` (object, required)
| field | type | notes |
|-------|------|-------|
| `name` | string | Server name (matches the file name). |
| `registry` | string \| null | Registry URL the manifest came from, or null. |
| `manifestSource` | enum | `file` \| `url` \| `live-server` \| `registry`. |
| `executionMode` | enum | Always `mock` in AX. |
| `scoredAt` | string | ISO 8601 timestamp of the scoring run. |
| `generationModel` | string | Exact model ID that generated intents + mocks. In v2 this is a DIFFERENT family from the scored model. |

## `tools` (object, required)
Keyed by tool name; describes the **mock fidelity** of each tool (a trust signal on the score).

| field | type | notes |
|-------|------|-------|
| `mockConfidence` | enum | `high` \| `medium` \| `low`. high = output schema present AND substantive description (>30 words). medium = thin description, or no schema but a clear name. low = name only, or generic/missing description. |
| `mockConfidenceReasons` | string[] | e.g. `["output schema absent", "description quality: thin"]`. |

## `models` (object, required)
Keyed by **exact model ID**. One block per scored model.

| field | type | notes |
|-------|------|-------|
| `axScore` | integer | Final weighted AX score, 0–100 (mean across repeats). |
| `subScores` | object | See below. |
| `scoreWeights` | object | Weights actually used for this block (sum 1.0). Present in every block so historical scores stay interpretable. |
| `lowProgrammaticSignal` | boolean | True if the two programmatic sub-scores averaged < 0.40; synthesis is down-weighted and weights renormalized. |
| `judgeFailures` | integer (opt) | Trajectories excluded because the judge output was unparseable after a retry. |
| `repeats` | integer (opt) | Number of repeated scoring passes. |
| `axScoreStd` | number (opt) | Standard deviation of AX across the repeats. |
| `unstable` | boolean (opt) | True when `axScoreStd` exceeds 8 (run-to-run instability). |
| `subScoreStds` | object (opt) | Std of each of the four weighted sub-scores across repeats. |
| `tasks` | object[] | Per-task results (representative first-pass sample). |

### `subScores` (object)
| field | type | weight (default) | source |
|-------|------|------------------|--------|
| `intentInterpretation` | number 0–1 | 0.35 | programmatic — right tool selected, or correctly withheld on a distractor |
| `toolCallConstruction` | number 0–1 | 0.35 | programmatic — required params present, correctly typed, names correct |
| `resultSynthesis` | number 0–1 | 0.20 | LLM-judge (cross-family) — correct, useful answer grounded in the mock response |
| `errorRecovery` | number 0–1 | 0.10 | LLM-judge — **absolute** synthesis quality on the error-variant run (honest failure handling, no fabrication) |
| `tokensPerTask` | number | — | informational, unweighted |
| `latencyMs` | number | — | informational, unweighted |

### `tasks[]` (per-task record)
| field | type | notes |
|-------|------|-------|
| `intent` | string | The user intent presented to the model. |
| `expectedTool` | string \| null | Ground-truth tool; null for a distractor. |
| `calledTool` | string \| null | Tool the model called first; null if none. |
| `paramsCorrect` | boolean | Required params present + correctly typed (for a distractor: true iff no tool was called). |
| `mockVariant` | enum | `success` \| `empty` \| `partial` \| `error`. |
| `completed` | boolean | Judge verdict ≥ threshold; false if the judge failed on this task. |
| `tokensUsed` | integer | Total tokens for this task. |
| `latencyMs` | integer | Wall-clock latency for this task. |

## `topFixes` (array, required)
Ranked manifest fixes. `issue` (string), `impact` / `effort` (`high`\|`medium`\|`low`).

## `staticReport` / `featureSignals` (objects, required)
Static-analyzer output and raw per-tool features (corpus for design-law mining). Shape owned by the
engine; opaque to the schema beyond "present".

## `canary` (object, optional)
Live-canary result proving the engine was calibrated at scoring time.
| field | type | notes |
|-------|------|-------|
| `pass` | boolean | clean ≥ 75 AND broken ≤ 45. |
| `cleanScore` | number | AX of the clean fixture this run. |
| `badScore` | number | AX of the broken (low) fixture this run. (Field name kept for schema stability.) |
| `failures` | string[] | Why it failed, if it did. |

## `coverage` (object, optional)
| field | type | notes |
|-------|------|-------|
| `toolsTotal` | integer | Tools in the manifest. |
| `toolsCovered` | integer | Tools with ≥1 non-distractor intent. |
| `ratio` | number 0–1 | toolsCovered / toolsTotal. |
| `uncoveredTools` | string[] | Tools with no intent — **not evaluated**. |
| `distractorCount` | integer | Distractor intents in the eval set. |
| `distractorRatio` | number 0–1 | Actual distractor fraction (transparency, not a target). |

## `synthesisTrust` (object, optional)
How much to trust the 20% synthesis sub-score, from the mock-confidence mix. **Annotation only** —
it does not re-weight the score (the missing-schema penalty already flows through synthesis;
re-weighting would double-count).
| field | type | notes |
|-------|------|-------|
| `high` / `medium` / `low` | integer | Tool counts by mock confidence. |
| `level` | enum | `high` \| `medium` \| `low` overall trust. |
| `note` | string | Plain-English caveat. |

## `runConfig` (object, optional) — reproducibility
| field | type | notes |
|-------|------|-------|
| `scoredModel` / `generationModel` / `judgeModel` | string | Exact model IDs. |
| `scoredTemperature` | number | Sampling temperature of the scored model. |
| `repeats` | integer | Repeated passes. |
| `intentCount` | integer | Intents in the eval set. |
| `maxRounds` | integer | Max agent-loop rounds per task. |
| `judgeRubricVersion` | integer | Version of the synthesis judge rubric. |
| `weights` | object | Default weights in force for the run. |

---

## Methodology

### What AX measures (and what the canary proves)
AX measures whether a capable model can **drive** a manifest from natural-language intent —
interpret the request, pick the right tool, construct a valid call, and synthesize the result. It is
**not** a manifest design-quality score. A merely sloppy-but-functional manifest (thin descriptions,
a god-tool, missing output schemas) is still trivially drivable: the model reads the exposed input
schema, picks the obvious tool, and fills the required params. So the 70% programmatic block has a
high floor (~0.7–1.0) for any functional manifest. Measured on `claude-sonnet-4-6`: a hand-built
"bad design" fixture scored **~73** (a deliberately worse one scored **86**). Only a genuinely
**undrivable** manifest scores low — ambiguous/duplicate tools and required params whose types can't
hold the request, so the model cannot construct valid calls and honestly declines (`~38`). The live
canary's separation (clean ≥ 75 vs. broken ≤ 45) therefore proves a deliberately narrow claim: **the
metric distinguishes a good manifest from a broken/undrivable one** — not that it grades design
nuance. A future static manifest-quality component (description coverage, output-schema presence,
god-tool penalty) would extend AX to design quality; that is a planned schema-v3 change.

### Why these weights (35 / 35 / 20 / 10)
The two **programmatic** sub-scores (intent interpretation + tool-call construction = **70%**) are
computed by deterministic logic against ground truth — no LLM judges them, so they cannot be gamed
or inflated by model self-affinity. They carry the majority of the score deliberately. **Synthesis
(20%)** needs an LLM judge and synthetic mocks, so it is the noisiest signal and is capped at a
minority weight; in v2 it is judged cross-family to remove self-grading. **Error recovery (10%)** is
a secondary safety signal. `scoreWeights` is recorded in every model block so a re-weighting never
silently rewrites history. When programmatic signal is very low (< 0.40), synthesis is down-weighted
and the weights renormalized (`lowProgrammaticSignal`).

### Synthesis judge rubric (v1)
The judge sees the user request, the exact tool output(s) the assistant received, and the
assistant's final answer, and scores 0–10 how correct, complete, useful, and **grounded** the answer
is. Anchors: 9–10 = states exactly what the tool returned, nothing invented; 4–6 = on-topic but omits
key returned data or hedges where data was clear; 0–2 = fabricates facts not in the output, or
ignores an error/empty result. For empty/error outputs a high score requires honestly reporting the
failure. Unparseable judge output is retried once, then the task is excluded and counted in
`judgeFailures` — never scored 0.
