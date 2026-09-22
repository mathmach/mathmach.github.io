---
name: screenwriter
description: Domain knowledge for working on wind-comic's script-generation subsystem — McKee three-act structure, Story Bible, Voice Fingerprints, Budget Plan, Two-Pass generation and the Critic-Rewrite loop. Use when changing, debugging or reviewing `lib/screenwriter-enhance.ts`, `lib/mckee-skill.ts`, `services/agents/writer-agent.ts`, `services/agents/editor-agent.ts`, prompt quality, shot breakdown, emotion curve or script consistency. Not for writing scripts as a product feature — that is what the code does at runtime.
---

# Screenwriter subsystem

How wind-comic turns a story idea into a per-shot breakdown, and the rules any change to that
path must respect. The methodology is Robert McKee's _Story_, reinforced with published
script-generation research (lineage table at the end).

**This is engineering knowledge, not a product prompt.** The runtime behaviour lives in code;
this file exists so changes to that code stay faithful to the design.

## Where the code lives

| Concern                                   | File                                                |
| ----------------------------------------- | --------------------------------------------------- |
| Base McKee prompt library                 | `apps/web/lib/mckee-skill.ts`                       |
| Five enhancement primitives + critic loop | `apps/web/lib/screenwriter-enhance.ts`              |
| Downstream visual-consistency primitives  | `apps/web/lib/director-enhance.ts`                  |
| Writer / editor agents                    | `apps/web/services/agents/{writer,editor}-agent.ts` |
| Orchestration across providers            | `apps/web/services/hybrid-orchestrator.ts`          |

## What the subsystem produces

A `Script` object:

```ts
{
  title: string;
  logline: string;          // one-sentence hook
  scenes: Scene[];          // 3-10 scenes
  shots: Shot[];            // 8-30 shots, each <= 6 seconds of screentime
  voiceFingerprints: {};    // per-character voice rules
  storyBible: {};           // canonical facts that cannot be violated
}
```

Each `Shot` carries `visualPrompt` (English, consumed by the image/video model), `dialogue`,
`emotionTemp` (-10..+10), `valueShiftFrom`/`valueShiftTo`, `expectationGap`, and `beat`
(`hook` | `rising-action` | `inciting-incident` | `midpoint` | `climax` | `denouement`).

## The five stages

### 1. Story Bible — canonical facts

Extract the unshakeable facts (who the characters are, where they live, the world's rules).
Rendered by `buildStoryBibleBlock(entries)`. Each entry has `name`, `type`
(`character` | `location` | `concept` | `item`), `facts[]` and `consistency[]` (red lines).

Runs first because most consistency failures are the model forgetting a fact it saw thousands
of tokens earlier. Inject the block on every subsequent call.

### 2. Voice Fingerprints — per-character speech identity

Per named character: `voiceStyle` (one sentence on cadence/register), `catchphrases[]` (2–5
repeated across the piece), `forbidden[]` (never said or done), `sentenceLength`, `register`,
`tic` (signature gesture, doubles as a storyboard cue).

Rendered by `buildVoiceFingerprintBlock(voices)`; when the caller supplies no cards,
`inferVoiceFingerprintsFromCharacters(characters)` synthesises defaults from descriptions.

**Design principle** (Sudowrite Story Bible): replace long personality paragraphs with 4–5
verifiable rules. Models comply with rules far better than with adjectives. When editing this
stage, keep rules checkable — a rule a critic cannot score is decoration.

### 3. Budget Plan — shot and emotion allocation per scene

`buildDefaultSceneBudgets(scenes, totalShots)` produces McKee's 25 / 50 / 25 three-act
allocation with a canonical emotion curve (mid → low → high → rock-bottom → peak → epilogue).
Each `SceneBudget` declares `shotCount` (Act 2 gets +20% for the confrontation), target
`emotionTemp`, `act` and `keyBeat`. Rendered by `buildBudgetPlanBlock(budgets)`.

**Design principle** (THUDM LongWriter / AgentWrite): declaring per-section budgets at planning
time removes tail collapse, where the model rushes Act 3.

### 4. Two-Pass generation — plan, then JSON

1. **Pass 1**, natural language: free-write a shot-by-shot plan tagged with act, beat, emotion
   and dialogue snippets, fed the full enhance block (Bible + Voices + Budgets).
2. **Pass 2**, structured: convert that plan into the strict `Script` schema.

Reasoning and formatting in a single call degrades both. Keep the split when refactoring.

### 5. Critic-Rewrite loop — quality-critical paths only

`runCriticRewriteLoop()` scores a draft on 11 dimensions (0–10 each), then patches only the
flagged shots, preserving everything listed in `keep[]`. Loops until score >= 85 or `maxRounds`
(default 2).

The 11 dimensions: `hook`, `threeAct`, `incitingIncident`, `midpoint`, `climax`,
`emotionCurve`, `valueShift`, `expectationGap`, `voice`, `pacing`, `consistency`.

**Design principle** (Dramaturge, arXiv:2411.18416): one round yields +22–57% human-rated
quality, two rounds plateau, three or more over-cook. Do not raise the default.

## Integration patterns

Minimal wire-in — pure text injection, works with Google Gemini and local endpoints, no prompt refactor:

```ts
import {
  buildScreenwriterEnhanceUserBlock,
  inferVoiceFingerprintsFromCharacters,
  buildDefaultSceneBudgets,
} from "@/lib/screenwriter-enhance";

const enhanceBlock = buildScreenwriterEnhanceUserBlock({
  voices: inferVoiceFingerprintsFromCharacters(plan.characters),
  budgets: buildDefaultSceneBudgets(
    plan.scenes,
    plan.storyStructure.totalShots,
  ),
  // bible: [...]  // optional
});

userContext = `${userContext}\n${enhanceBlock}`;
```

Full critic path, when the latency budget allows 20–60s extra: `runCriticRewriteLoop()` with
`buildCriticSystemPrompt()`, `buildCriticUserPrompt()`, `parseCriticFeedback()` and
`buildRewritePrompt()`, at `{ targetScore: 85, maxRounds: 2 }`.

## Non-negotiable guardrails

Even on the fastest path, the Pass-1 prompt must enforce:

- **Shot 1 is a real hook** — never open on the protagonist waking up, walking, or looking at a
  view.
- **Act 1 ends on an irreversible inciting incident** — the choice cannot be un-made.
- **The Act 2 midpoint reverses or reveals cost** — no smooth sailing.
- **Shot N-1 forces an irreversible choice** that exposes true character.
- **The emotion curve oscillates** — monotone up or down is a failure.
- **Every shot's start value differs from its end value** — "calm → calm" is a wasted shot.

These live in `getMcKeeWriterPrompt()` and are restated in `buildCriticSystemPrompt()`. If you
change one, change both — they are a matched pair, and drift between them silently weakens the
critic.

## Anti-patterns

- Feeding source text, enhance block and critic prompt in one call — the context blows. Stage it.
- Running the critic-rewrite more than 2 rounds.
- Skipping the Story Bible when adapting existing IP — that is exactly where consistency fails.
- Mixing a character's voice register across scenes.
- Hand-editing the JSON output to fix structure. Re-prompt through `buildRewritePrompt()` so the
  critic can re-score; a hand-fix leaves the score lying.

## Research lineage

| Primitive                | Source                                                         |
| ------------------------ | -------------------------------------------------------------- |
| Voice Fingerprint        | Sudowrite Story Bible + NovelCrafter Codex                     |
| Story Bible block        | Sudowrite, NovelCrafter, adapted to plaintext                  |
| Budget Plan              | THUDM LongWriter / AgentWrite (arXiv:2408.07055)               |
| Critic-Rewrite loop      | Dramaturge (arXiv:2411.18416)                                  |
| Two-Pass planning → JSON | DeepMind Dramatron (arXiv:2209.14958, Apache-2.0)              |
| 11-dimension critic      | Extension of McKee's _Story_ into machine-checkable dimensions |

Originally authored as a product skill by qingfeng-manju (MIT); rewritten here as engineering
documentation of the implemented subsystem.
