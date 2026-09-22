# 🔌 AI & Media Providers Architecture: Ports, Adapters & Anti-Corruption Layer

This directory provides the authoritative reference for configuring, running, and extending the generative media and cognitive reasoning engines that power Wind Comic (v12.320).

---

## 1. Hexagonal Architecture & Anti-Corruption Layer (ACL)

Wind Comic strictly adheres to **Hexagonal Architecture (Ports & Adapters)** and **Domain-Driven Design (DDD)**. The core domain layer contains zero vendor lock-in, proprietary tool trademarks, or third-party SDK dependencies.

External AI engines (e.g., Google Gemini, ComfyUI, Postiz, Replicate, Fal, Wav2Lip, MuseTalk, SadTalker) exist **SOLELY as pluggable infrastructure adapters** implementing domain ports behind an **Anti-Corruption Layer (ACL)**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CORE DOMAIN APPLICATION                                 │
│                                                                                        │
│   ┌─────────────────────────────────────────┐  ┌────────────────────────────────────┐  │
│   │        COGNITIVE REASONING PORT         │  │     MEDIA CO-SYNTHESIS PORTS       │  │
│   │                                         │  │                                    │  │
│   │ • Writer Agent (IScriptingStrategy)     │  │ • ImageProviderPort                │  │
│   │ • Director Agent (Shot Breakdown)       │  │ • VideoProviderPort                │  │
│   │ • FaceConsistencyEvaluator              │  │ • TTSProviderPort                  │  │
│   │ • CharacterIdentityLedger               │  │ • NeuralLipSyncEngine              │  │
│   │ • Creative Preset Intelligence          │  │   (VisemeAlignmentPort)            │  │
│   └────────────────────┬────────────────────┘  └─────────────────┬──────────────────┘  │
└────────────────────────┼─────────────────────────────────────────┼─────────────────────┘
                         │                                         │
═════════════════════════╪═════════════════════════════════════════╪══════════════════════
                         ▼                                         ▼
                 ANTI-CORRUPTION LAYER (ACL) BOUNDARY TRANSLATION
    Translates external vendor schemas, graphs & responses into internal domain entities:
    - GenerativeWorkflowManifest / InferencePipelineDescriptor
    - CharacterIdentityLedger & VoiceProfile
    - SocialDistributionGateway (SocialPublishingPort) & NLEExportVisitor
═════════════════════════╪═════════════════════════════════════════╪══════════════════════
                         │                                         │
┌────────────────────────┴────────────────────┐  ┌─────────────────┴──────────────────┐
│        COGNITIVE ADAPTERS (INFRA)           │  │      MEDIA CO-SYNTHESIS ADAPTERS   │
│                                             │  │                                    │
│ • Google Gemini (GeminiAdapter via REST)    │  │ • ComfyUI Adapter (Graph Runner)   │
│ • Local / Self-Hosted LLMs (Ollama/vLLM)    │  │ • NeuralLipSync Adapters           │
│ • Alternative Cognitive APIs (Claude/OpenAI)│  │   (Wav2Lip / MuseTalk / SadTalker) │
│                                             │  │ • Cloud Diffusion (Fal / Replicate)│
└─────────────────────────────────────────────┘  └────────────────────────────────────┘
                                              │
                                              ▼
                        Extensible via @wind/ai/provider-registry
                        (Custom Image, Video, and TTS Plugins)
```

### 1.1 Core Architectural Principles

1. **Domain Port Independence:** All domain use cases and background sagas interact exclusively with abstract contracts (`CognitiveReasoningPort`, `ImageProviderPort`, `VideoProviderPort`, `TTSProviderPort`, `VisemeAlignmentPort`, `SocialPublishingPort`).
2. **Anti-Corruption Layer (ACL) Schema Translation:** Proprietary payloads, external webhook structures, and execution graphs (such as ComfyUI prompt graphs, Replicate prediction schemas, or Gemini JSON envelopes) are translated into validated internal domain entities (`GenerativeWorkflowManifest`, `InferencePipelineDescriptor`, `ScriptShot`, `CharacterIdentityLedger`) at the perimeter. Leaking vendor-specific JSON shapes or SDK types into core services or repositories is strictly prohibited.
3. **Pluggable Infrastructure Adapters:** Concrete engines like Google Gemini, ComfyUI, and Postiz are swappable infrastructure details. The platform can switch to alternative providers (e.g., local Ollama for cognition, Fal/Replicate for diffusion, direct platform APIs for publishing) without modifying core domain logic.
4. **Declarative Workflow Manifests:** Rendering pipelines are defined in vendor-agnostic `GenerativeWorkflowManifest` specifications. Infrastructure adapters translate these manifests into concrete engine execution graphs.
5. **Circuit Breakers & Fault Isolation:** External adapter calls are encapsulated in Nygard 3-state Circuit Breakers (`Closed`, `Open`, `Half-Open`) with sliding-window error monitoring, preventing external latency or outages from starving core application resources.

---

## 2. Documentation Directory Map

| Document                                                     | Architectural Scope                        | Purpose & Key Topics                                                                                                      |
| :----------------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **[`gemini-llm.md`](./gemini-llm.md)**                       | Cognitive Reasoning Adapter                | Reference implementation of `CognitiveReasoningPort`: REST client, model tiers, RPM limits, embeddings, runtime overrides. |
| **[`comfyui.md`](./comfyui.md)**                             | Media Generation Infrastructure Adapter    | Translates `GenerativeWorkflowManifest` into node execution graphs across all 6 modalities, worker setup, and templates.  |
| **[`custom-plugins.md`](./custom-plugins.md)**               | Bring Your Own (BYO) Provider Plugin Guide | Guide for implementing domain ports behind the ACL for custom Image, Video, TTS, and NeuralLipSync engines.               |
| **[`cutover-and-telemetry.md`](./cutover-and-telemetry.md)** | Adapter Cutover & Telemetry Runbook        | Shadow execution, agreement rate validation, circuit breaker health checks, and operational metrics.                      |

---

## 3. Priority Chaining & Deterministic Selection

All generative media requests pass through the provider registry's deterministic selection algorithm (`createProviderRegistry` from `@wind/ai/provider-registry`):

1. **Availability Gate:** Evaluates `available()` synchronously; excludes unconfigured adapters.
2. **Capability Matching:** Verifies modality requirements (e.g., `supportsRefs`, `supportsImage2Video`, `maxDurationSec`).
3. **Capacity Constraints:** Drops requests exceeding provider limits (e.g., `refCount > maxRefImages` or `textLen > maxTextLen`).
4. **Exclude List:** Filters out adapters marked as failing during previous retry loops.
5. **Priority Sorting:** Sorts available candidates by ascending `priority` (integer `0..999`, lower number executes first).
6. **Prefer Override:** If the caller specifies a preferred provider ID, matching candidates are moved to the front.

If all primary adapters fail, the dispatcher logs detailed OpenTelemetry diagnostic traces and falls back according to the configured adapter chain.

---

## 4. Ubiquitous Language & ACL Mapping Reference

The following table defines the canonical domain concepts alongside the infrastructure adapters that implement them:

| Domain Concept (Ubiquitous Language)                         | Architectural Role                                                  | Example Infrastructure Adapters                                   | ACL Translation Function                                                                                              |
| :----------------------------------------------------------- | :------------------------------------------------------------------ | :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **`FaceConsistencyEvaluator`** / `CharacterIdentityLedger`   | Biometric facial similarity evaluation and identity continuity audit | Cameo, InsightFace, Gemini Multimodal Vision                      | Translates facial landmark vectors into normalized similarity scores ($r \ge 0.75$) and audit records                 |
| **`NeuralLipSyncEngine`** / `VisemeAlignmentPort`            | Phoneme-to-viseme alignment and mouth motion synthesis              | SadTalker, MuseTalk, Wav2Lip, procedural 2D engine               | Maps audio waveforms and viseme keyframes into synchronized video streams conforming to shot duration                 |
| **`GenerativeWorkflowManifest`** / `InferencePipelineDescriptor` | Declarative, vendor-neutral media generation graph descriptor       | ComfyUI API graphs, Fal pipelines, Replicate schemas              | Translates abstract prompt, seed, and conditioning locks into engine-specific execution graphs                        |
| **`SocialDistributionGateway`** / `SocialPublishingPort`     | Decoupled multi-channel distribution boundary                        | Postiz broker adapter, direct platform OAuth adapters             | Maps `PublicationBundle` into vendor-specific multipart uploads and normalizes asynchronous publishing webhook events |
| **`NLEInterchangeFormat`** / `NLEExportVisitor`              | Lossless non-linear editing interchange serializer                  | Apple FCPXML, Avid AAF (MS-CFB), DaVinci EDL, CapCut/Jianying XML | Traverses timeline domain entities and serializes conforming exchange files without polluting domain models          |
