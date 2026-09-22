# 🔌 AI & Media Providers Architecture: Hexagonal Ports, Adapters & Anti-Corruption Layer

This document defines the formal architectural boundaries for cognitive reasoning and multimodal media synthesis engines.

---

## 1. Hexagonal Architecture (Ports & Adapters) & Anti-Corruption Layer (ACL)

The system strictly adheres to **Hexagonal Architecture (Ports & Adapters)** and **Domain-Driven Design (DDD)**. The core domain layer contains zero vendor lock-in, proprietary tool trademarks, or third-party SDK dependencies.

External AI engines (e.g., local LLMs, cloud APIs, self-hosted diffusion graphs, neural lip-sync models) exist **SOLELY as pluggable infrastructure adapters** implementing domain ports behind an **Anti-Corruption Layer (ACL)**:

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
═════════════════════════╪═════════════════════════════════════════╪══════════════════════
                         │                                         │
┌────────────────────────┴────────────────────┐  ┌─────────────────┴──────────────────┐
│        COGNITIVE ADAPTERS (INFRA)           │  │      MEDIA CO-SYNTHESIS ADAPTERS   │
│                                             │  │                                    │
│ • Self-Hosted / Local LLMs (Ollama / vLLM)  │  │ • Local Diffusion Graph Runners   │
│ • Proprietary Cloud APIs (Gemini / Anthropic│  │ • Neural Lip-Sync Model Runners    │
│   / OpenAI) via standard HTTP adapters      │  │ • Serverless Inference APIs        │
└─────────────────────────────────────────────┘  └────────────────────────────────────┘
```

---

## 2. Core Architectural Principles

1. **Domain Port Independence:** All domain use cases and background sagas interact exclusively with abstract port interfaces (`CognitiveReasoningPort`, `ImageProviderPort`, `VideoProviderPort`, `TTSProviderPort`, `VisemeAlignmentPort`).
2. **Anti-Corruption Layer (ACL) Schema Translation:** Proprietary payloads, external webhook structures, and execution graphs (such as prompt graphs, prediction schemas, or JSON envelopes) are translated into validated internal domain entities (`GenerativeWorkflowManifest`, `InferencePipelineDescriptor`, `ScriptShot`, `CharacterIdentityLedger`) at the perimeter. Leaking vendor-specific JSON shapes or SDK types into core services or repositories is strictly prohibited.
3. **Pluggable Infrastructure Adapters:** Concrete engines are swappable infrastructure details. The platform can switch between local self-hosted workers and cloud APIs without altering a single line of core business logic.
4. **Declarative Workflow Manifests:** Media synthesis pipelines are specified as vendor-agnostic `GenerativeWorkflowManifest` structures. Infrastructure adapters translate these manifests into concrete engine execution graphs.
5. **Circuit Breakers & Fault Isolation:** External adapter calls are encapsulated in Nygard 3-state Circuit Breakers (`Closed`, `Open`, `Half-Open`) with sliding-window error monitoring, preventing external latency spikes or outages from exhausting server threads or database connections.

---

## 3. Priority Chaining & Deterministic Provider Selection

All generative media dispatch requests pass through a deterministic selection algorithm:

1. **Availability Gate:** Evaluates `available()` synchronously; excludes unconfigured or offline adapters.
2. **Capability Matching:** Verifies modality constraints (e.g., `supportsRefs`, `supportsImage2Video`, `maxDurationSec`).
3. **Capacity Constraints:** Drops requests exceeding provider physical limits (e.g., `refCount > maxRefImages` or `textLen > maxTextLen`).
4. **Exclude List:** Filters out adapters marked as failing during preceding retry loops within the active Saga.
5. **Priority Sorting:** Sorts candidate adapters by ascending priority (integer `0..999`, lower executes first).
6. **Caller Preference:** If the request specifies an explicit preferred provider identifier, matching candidates are moved to the head of the dispatch queue.

---

## 4. Ubiquitous Language & ACL Mapping Reference

| Domain Concept (Ubiquitous Language) | Architectural Role | Abstract Contract & Responsibility | ACL Translation Boundary |
| :--- | :--- | :--- | :--- |
| **`FaceConsistencyEvaluator`** / `CharacterIdentityLedger` | Biometric facial similarity evaluation and identity continuity audit | Evaluates cosine similarity of facial landmark embeddings ($r \ge 0.75$) across rendered shots against character vault reference frames. | Translates raw vector arrays into normalized domain metrics and immutable ledger audit entries. |
| **`NeuralLipSyncEngine`** / `VisemeAlignmentPort` | Phoneme-to-viseme temporal alignment and mouth motion synthesis | Maps audio waveforms and speech phonemes into time-aligned viseme keyframes conforming to shot duration. | Intercepts vendor-specific facial deformation coordinates and emits standardized video streams. |
| **`GenerativeWorkflowManifest`** / `InferencePipelineDescriptor` | Declarative, vendor-neutral media generation graph descriptor | Encapsulates prompt, seed, conditioning frames, and aesthetic weights into an immutable specification. | Translates abstract manifest fields into concrete model execution calls. |
