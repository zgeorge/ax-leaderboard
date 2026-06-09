# AX Score File Schema — `schemaVersion: 3`

One file per scored server: `data/scores/{server-name}.json`. Any breaking change bumps
`schemaVersion`; additive optional fields stay within the current version. Everything in the engine
and the leaderboard site couples to this contract.

## What changed in v3 (vs v2)

v3 makes the score a **universal rubric** — comparable across manifests of any size or polish:

- **`staticQuality` sub-score (20%).** Deterministic, model-free design quality computed from the
  static analyzer: per-tool deductions (description missing/thin/sparse, missing output schema,
  undocumented params, god-tool, inconsistent param casing) plus manifest-level deductions (naming
  inconsistency, name collisions, token bloat, **duplicated descriptions**). This closes the
  "drivability ceiling": under v2 any sloppy-but-functional manifest floored at ~70 because the
  programmatic block can't see design quality. New default weights:
  **intent .25 / construction .25 / static .20 / synthesis .20 / errorRecovery .10** (deterministic
  block stays 70%; judged block stays 30%). v2 scores remain interpretable via their recorded
  `scoreWeights`.
- **Zero-sample exclusion.** A sub-score with no valid samples (e.g. every error-variant judge call
  unparseable, or an all-distractor eval set) is **excluded** — reported 0 with weight 0 and the
  remaining weights renormalized, listed in `excludedComponents` — instead of silently defaulting to
  full credit (v2 errorRecovery/construction) or zero (v2 synthesis).
- **Variant trim.** Only the `success` and `error` mock variants run per intent (the only two that
  feed a sub-score); `runConfig.variants` records the sweep. Scores are unchanged by the trim.
- **Coverage-scaled eval sets.** The default intent count scales with tool count so every tool is
  coverable; `coverage.warning` is present whenever coverage < 100%.
- **Value-match annotation.** `paramsValueMatch` (per task) and `paramsValueMatchRate` (per model)
  record how often the call's param VALUES matched the generated expectation — **unweighted**.
- **Interpretation alignment.** Intent interpretation credits the expected tool called at any point
  in the trajectory (legitimate chains), matching construction; distractors still require zero calls.
- **Single rounding.** `axScore` is rounded exactly once, at report time.

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
  "schemaVersion": 3,
  "server": { ... },
  "tools": { "{tool-name}": { ... } },
  "models": { "{model-id}": { ... } },
  "topFixes": [ ... ],
  "staticQuality": { ... },   // v3: the breakdown behind the staticQuality sub-score
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
| `lowProgrammaticSignal` | boolean | True if the included behavioral-programmatic sub-scores averaged < 0.40; synthesis is down-weighted and weights renormalized (staticQuality is never down-weighted). |
| `judgeFailures` | integer (opt) | Trajectories excluded because the judge output was unparseable after a retry. |
| `excludedComponents` | string[] (opt, v3) | Components with ZERO valid samples this run — reported 0 with weight 0 (renormalized), never silently defaulted. One of `toolCallConstruction` \| `resultSynthesis` \| `errorRecovery`. |
| `paramsValueMatchRate` | number \| null (opt, v3) | Mean per-task `paramsValueMatch` over tasks that had one. **Unweighted annotation.** |
| `repeats` | integer (opt) | Number of repeated scoring passes. |
| `axScoreStd` | number (opt) | Standard deviation of AX across the repeats. |
| `unstable` | boolean (opt) | True when `axScoreStd` exceeds 8 (run-to-run instability). |
| `subScoreStds` | object (opt) | Std of each of the five weighted sub-scores across repeats (staticQuality is always 0). |
| `tasks` | object[] | Per-task results (representative first-pass sample). |

### `subScores` (object)
| field | type | weight (default) | source |
|-------|------|------------------|--------|
| `intentInterpretation` | number 0–1 | 0.25 | programmatic — expected tool called at any point, or correctly withheld on a distractor |
| `toolCallConstruction` | number 0–1 | 0.25 | programmatic — required params present, correctly typed, names correct |
| `staticQuality` | number 0–1 | 0.20 | static analyzer — deterministic manifest design quality (see top-level `staticQuality` for the breakdown) |
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
| `paramsValueMatch` | number \| null (v3) | Fraction of expected primitive param VALUES the call matched (loose string match); null when nothing to compare. **Unweighted.** |
| `mockVariant` | enum | `success` \| `empty` \| `partial` \| `error` (v3 default sweep runs only `success` + `error`). |
| `completed` | boolean | Judge verdict ≥ threshold; false if the judge failed on this task. |
| `tokensUsed` | integer | Total tokens for this task. |
| `latencyMs` | integer | Wall-clock latency for this task. |

## `topFixes` (array, required)
Ranked manifest fixes. `issue` (string), `impact` / `effort` (`high`\|`medium`\|`low`).

## `staticQuality` (object, required — v3)
The deterministic breakdown behind the `staticQuality` sub-score.
| field | type | notes |
|-------|------|-------|
| `score` | number 0–1 | Mean per-tool score minus manifest-level deductions, clamped. |
| `perTool` | object | Tool name → 0–1 score. Per-tool deductions: description missing −0.35 / thin −0.25 / sparse −0.10; no output schema −0.25; undocumented params −0.20 × ratio; god-tool −0.15; mixed param casing −0.05. |
| `manifestDeductions` | object[] | `{ code, amount }` applied at manifest level: inconsistent tool naming −0.05; each name collision −0.15 (cap −0.30); token bloat −0.10; each duplicated description −0.10 (cap −0.20). |

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
| `warning` | string (opt, v3) | Present whenever ratio < 1 — a plain-English caveat that uncovered tools were not evaluated. |

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
| `intentCount` | integer | Intents in the eval set (v3: defaults scale with tool count). |
| `maxRounds` | integer | Max agent-loop rounds per task. |
| `variants` | string[] (opt, v3) | Mock variants swept per intent (absent = the old full four-variant sweep). |
| `judgeRubricVersion` | integer | Version of the synthesis judge rubric. |
| `weights` | object | Default weights in force for the run. |

---

## Methodology

### What AX measures (and what the canary proves)
AX v3 measures BOTH whether a capable model can **drive** a manifest from natural-language intent —
interpret the request, pick the right tool, construct a valid call, and synthesize the result — AND
the manifest's **design quality** (the deterministic `staticQuality` sub-score). The behavioral
block alone has a high floor (~0.7–1.0) for any functional manifest, because a capable model reads
the exposed input schema, picks the obvious tool, and fills the required params even when
descriptions are thin and output schemas are missing — under v2 that ceiling meant a hand-built
"bad design" fixture scored **~73** and a deliberately worse one scored **86**. v3's static
component breaks that ceiling: the same sloppy fixture scores **63** and the undrivable fixture
(ambiguous/duplicate tools + required params whose types can't hold the request) scores **~19**.
The live canary's separation (clean ≥ 75 vs. broken ≤ 45) is recorded with every published score;
the low fixture must be genuinely **undrivable**, since a sloppy-but-drivable manifest (~63) sits
well above the ≤45 bar.

### Why these weights (25 / 25 / 20 / 20 / 10)
The **deterministic block is 70%**: the two behavioral-programmatic sub-scores (intent
interpretation + tool-call construction = 50%) are computed by pure logic against ground truth, and
**staticQuality (20%)** is computed from the manifest alone — no LLM judges any of it, so none of it
can be gamed or inflated by model self-affinity, and the static component is identically comparable
across all manifests (zero variance). **Synthesis (20%)** needs an LLM judge and synthetic mocks, so
it is the noisiest signal and is capped at a minority weight; it is judged cross-family to remove
self-grading. **Error recovery (10%)** is a secondary safety signal. `scoreWeights` is recorded in
every model block so a re-weighting never silently rewrites history. When the behavioral signal is
very low (< 0.40), synthesis is down-weighted and the weights renormalized
(`lowProgrammaticSignal`); a sub-score with zero valid samples is excluded entirely
(`excludedComponents`) rather than defaulted. staticQuality is never down-weighted or excluded.

### Synthesis judge rubric (v1)
The judge sees the user request, the exact tool output(s) the assistant received, and the
assistant's final answer, and scores 0–10 how correct, complete, useful, and **grounded** the answer
is. Anchors: 9–10 = states exactly what the tool returned, nothing invented; 4–6 = on-topic but omits
key returned data or hedges where data was clear; 0–2 = fabricates facts not in the output, or
ignores an error/empty result. For empty/error outputs a high score requires honestly reporting the
failure. Unparseable judge output is retried once, then the task is excluded and counted in
`judgeFailures` — never scored 0.
