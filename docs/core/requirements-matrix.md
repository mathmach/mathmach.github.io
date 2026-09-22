# 📐 Requirements Specification & Traceability Matrix (ISO/IEC/IEEE 29148:2018)

**System:** Wind Comic (v12.320.0)  
**Standard:** ISO/IEC/IEEE 29148:2018 (Systems and software engineering — Requirements engineering)  
**Quality Framework:** ISO/IEC 25010:2023 (Software Product Quality Model — SQuaRE)  
**Architectural Charter:** [Core Premises & Mandate](./core-mandate.md)  
**Foundational Constitution:** [Foundation Constitution & Academic Monograph](./foundation-constitution.md)  
**Formal System Models:** [UML & Architecture Diagrams](./system-models.md)

---

## 1. System Vision & Scope Boundaries

### 1.1 The System Core Mandate (The Indivisible Contract)

Wind Comic is an autonomous vertical video generation platform designed to eradicate workflow hyper-fragmentation ("The 5-App Nightmare"). The core system accepts a minimal input (idea, prompt, product URL, or script outline) and deterministically renders a **complete, fully-assembled vertical video (`final.mp4`)**.

_For complete narrative context, stakeholder profiles, and boundary matrices, see [core-mandate.md](./core-mandate.md)._

### 1.2 Boundary Classification

- **Indivisible Core (`RF-CORE-*`):** Automated pipeline from prompt ingestion to delivery of the finalized, composited video file (`final.mp4`). The user downloads the finished video to utilize freely.
- **Modular Downstream Features (`RF-FEAT-*`):** Optional convenience capabilities (social media direct publishing, collaborative timeline editing, professional studio NLE export).
- **Explicit Non-Goals (`OUT-OF-SCOPE-*`):**
  - Foundational diffusion model training from scratch.
  - Programmatic ad bidding network / demand-side platform (DSP).
  - Consumer viral meme toy / public social feed.
  - Cloud GPU hardware hosting or leasing.

### 1.3 Ubiquitous Language & Anti-Corruption Layer (ACL) Principles

To ensure vendor neutrality, zero lock-in, and architectural longevity, the core domain model adheres strictly to Domain-Driven Design (DDD) Ubiquitous Language:

- **Ports & Adapters Boundary:** The domain layer contains zero vendor-specific terminology or proprietary SDK contracts. Third-party technologies (e.g., ComfyUI, Google Gemini, Postiz, Replicate, Fal, Wav2Lip, MuseTalk, SadTalker) exist **SOLELY as pluggable infrastructure adapters** implementing core domain ports.
- **Anti-Corruption Layer (ACL):** External vendor payloads, proprietary JSON graph schemas, and third-party webhook envelopes are intercepted and translated into strongly-typed internal domain entities at the system boundary before reaching use cases, domain services, or database repositories.
- **Domain Canon Mappings:**
  - `CharacterIdentityLedger` & `FaceConsistencyEvaluator`: Core domain aggregate and evaluation service for cross-shot visual identity and biometric consistency (replaces vendor-locked terms like "Cameo").
  - `NeuralLipSyncEngine` & `VisemeAlignmentPort`: Domain port and engine abstraction for phoneme/viseme timing alignment and facial animation (replaces model-specific jargon like Wav2Lip / MuseTalk / SadTalker).
  - `GenerativeWorkflowManifest` & `InferencePipelineDescriptor`: Standardized domain specifications for multi-stage media co-synthesis graphs (replaces engine-specific terms like "ComfyUI prompt graph").
  - `SocialDistributionGateway` & `SocialPublishingPort`: Domain boundary port for multi-channel video dispatch and syndication (abstracts third-party scheduling brokers like Postiz).
  - `NLEInterchangeFormat` & `NLEExportVisitor`: Formal domain interchange representation and GoF Visitor abstraction for exporting timeline edits to professional non-linear editors (abstracts vendor-specific XML formats such as Jianying / CapCut XML, FCPXML, AAF, or EDL).

---

## 2. Business Requirements (BR) & Stakeholder Triptych

| ID        | Stakeholder Group                            | Business Need / JTBD                                                                                                                                                            | Business Metric / Target                                                                                         |
| :-------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| **BR-01** | **Performance Advertiser & DTC Operator**    | Rapid generation of 20–50 UGC-style video ad variants per day with consistent virtual creators to beat ad fatigue on TikTok, Meta Reels, and YouTube Shorts.                    | Reduce cost per creative from \$500–\$2,000 to < \$5; compress creative turnaround from 14 days to < 10 minutes. |
| **BR-02** | **Agile Content Creator & Social Publisher** | Direct conversion of daily trending topics, news, or scripts into fully assembled, captioned vertical videos without manual multi-app stitching in external NLE suites.         | Eliminate the 5-app switching loop; produce complete 45-second vertical video in under 5 minutes.                |
| **BR-03** | **Narrative Studio & Webtoonist**            | Adaptation of serialized fiction and comic IPs into vertical short-dramas while maintaining strict character face, wardrobe, and art style consistency across dozens of scenes. | Eradicate stochastic diffusion drift; maintain character visual consistency across cuts ($r \ge 0.85$).          |

---

## 3. Functional Requirements: The Indivisible Core (`RF-CORE`)

| Requirement ID | Requirement Name                          | Description                                                                                                                                                                                                                                                                                                         | Acceptance Criteria & Verification                                                                                                                                                                  |
| :------------- | :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-CORE-01** | **Multimodal Briefing Ingestion**         | The system shall ingest text ideas, product URLs, raw scripts, or creative briefs via a unified schema.                                                                                                                                                                                                             | Validates via `CreativeIdeaSchema`; rejects malformed input with structured Zod errors.                                                                                                             |
| **RF-CORE-02** | **Intention-Aware Script Structuring**    | The system shall generate structured screenplay scenes using pluggable `IScriptingStrategy` implementations: `DirectResponseUgcStrategy` (Hook-Problem-Solution-CTA), `McKeeThreeActStrategy` (Dramatic Arc), and `JournalisticExplainerStrategy` (Inverted Pyramid).                                               | Outputs valid `ScriptShot[]` containing dialogue, pacing markers, camera direction, and emotion scores.                                                                                             |
| **RF-CORE-03** | **Character Vault & Visual Continuity**   | The system shall manage global `Character` Aggregate Roots in a reusable Character Vault, locking identity across an 8-dimensional Character DNA specification and binding scene aesthetics to a Style Bible Key-Art frame.                                                                                         | Generates consistent reference embeddings (`cref`, `sref`); verifies identity similarity score $\ge 0.75$ via `FaceConsistencyEvaluator` and records observations in the `CharacterIdentityLedger`. |
| **RF-CORE-04** | **Multi-Shot Visual Co-Synthesis**        | The system shall orchestrate multi-shot visual co-synthesis pipelines executing formal `GenerativeWorkflowManifest` and `InferencePipelineDescriptor` specifications with structural conditioning locks (identity reference embeddings and spatial control adapters) to render shots conforming to the scriptboard. | Produces sequence of video shot assets matching aspect ratio (9:16 vertical standard) and target duration via pluggable media generation adapters.                                                  |
| **RF-CORE-05** | **Character-Bound Voice Synthesis**       | The system shall synthesize narration or dialogue using per-character voice profiles, synchronizing speech timing to shot duration.                                                                                                                                                                                 | Produces audio assets with word-level timecodes; supports viseme alignment and facial motion synthesis via `NeuralLipSyncEngine` implementing the `VisemeAlignmentPort`.                            |
| **RF-CORE-06** | **Automated BGM Ducking & Beat Snapping** | The system shall mix background music (BGM) with automated sidechain ducking under dialogue and snap cut transitions to musical transients ($\pm 150\text{ ms}$).                                                                                                                                                   | Resulting audio track has zero dialogue masking; ducking attenuates BGM by $-12\text{ dB}$ to $-18\text{ dB}$ during speech.                                                                        |
| **RF-CORE-07** | **Dynamic Subtitle Burning**              | The system shall generate and hard-burn beat-aligned dynamic subtitles using `libass` formatting, eliminating garbled glyphs and text overflow.                                                                                                                                                                     | Subtitle cues align with speech phonemes ($\le 100\text{ ms}$ error); zero text collision with platform safe areas.                                                                                 |
| **RF-CORE-08** | **Zero-Stitch Video Assembly**            | The system shall automatically concatenate visual shots, voiceover, ducked BGM, and subtitles into an immutable, standalone `final.mp4` via `FFmpegCommandBuilder`.                                                                                                                                                 | Emits a valid, fully playable H.264/AAC MP4 container playable in standard media players without human editing.                                                                                     |

---

## 4. Functional Requirements: Downstream Modular Features (`RF-FEAT`)

| Requirement ID | Requirement Name                               | Description                                                                                                                                                                                                                                                                                                                                                                               | Acceptance Criteria & Verification                                                                                                                     |
| :------------- | :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF-FEAT-01** | **Social Media Multi-Platform Publishing**     | The system shall provide a fully decoupled 1-click dispatch interface routing the finished video to external platforms via the `SocialDistributionGateway` implementing the `SocialPublishingPort` (decoupled behind an Anti-Corruption Layer with pluggable infrastructure brokers). Social API errors or token expirations shall never impede video completion or cause Saga rollbacks. | Generates ready-to-post bundle; executes authenticated dispatch via configured publishing adapter; degrades to manual bundle download if disconnected. |
| **RF-FEAT-02** | **Collaborative Multi-Track Timeline**         | The system shall provide a browser-based multi-track timeline editor allowing manual clip retiming, J-cuts/L-cuts, and text re-editing.                                                                                                                                                                                                                                                   | Real-time presence via `@wind/ws`; segment-level locking via PostgreSQL preventing concurrent edit collisions.                                         |
| **RF-FEAT-03** | **Studio NLE Lossless Interchange**            | The system shall export the assembled timeline into standardized `NLEInterchangeFormat` structures (native binary AAF, EDL, FCPXML, and timeline exchange descriptors) via extensible `NLEExportVisitor` implementations.                                                                                                                                                                 | Emits valid MS-CFB binary AAF or `NLEInterchangeFormat` containers with linked audio/video track references verified by NLE parsers.                   |
| **RF-FEAT-04** | **Bulk A/B Hook Variant Generation**           | The system shall generate multiple distinct opening hook variations (visual + copy) for a single ad script to enable paid traffic creative testing.                                                                                                                                                                                                                                       | Produces 3–5 alternative Shot 1 variations with identical body assets and unique asset tags.                                                           |
| **RF-FEAT-05** | **Platform Safe-Area Masking & Normalization** | The system shall provide visual safe-area guides (TikTok/Reels UI overlay boundaries) and loudness normalization to $-14\text{ LUFS}$.                                                                                                                                                                                                                                                    | Enforces audio normalization adhering to ITU-R BS.1770-4 standard.                                                                                     |

---

## 5. Non-Functional Requirements (ISO/IEC 25010:2023)

Detailed implementation rules and quality floors are defined in the [Engineering Constitution](../architecture/engineering-constitution.md).

### 5.1 Reliability & Fault Tolerance (RNF-REL)

- **RNF-REL-01 (Zero Fallback Debt):** 0 fallback debt violations across all 7 architectural ceilings. Enforced via `bun run check:fallback-debt`.
- **RNF-REL-02 (Circuit Breaker Protection):** External AI engine invocations execute inside Nygard 3-state Circuit Breakers (`Closed`, `Open`, `Half-Open`).
- **RNF-REL-03 (Transactional Outbox):** State mutations and queue/event dispatches (`@wind/events`, `@wind/queue`) committed in a single ACID transaction.
- **RNF-REL-04 (Saga Orchestration & Compensation):** Multi-stage production pipelines execute as explicit Sagas with 100% full credit refund and orphan storage cleanup on terminal failure.
- **RNF-REL-05 (Two-Phase Financial Hold & Settle):** Non-blocking financial holds (`credit_holds` status: `HELD`, 5ms) eliminate database connection pool starvation during long GPU inference runs (2–5 min), with atomic completion settlement (`SETTLED`) or compensating release (`RELEASED`).
- **RNF-REL-06 (Shot Idempotency & Reentrancy):** Every shot computes a deterministic hash `hash(prompt, dnaId, seed, cameraMove)` allowing instant object store cache hits upon worker restart without redundant GPU computation.
- **RNF-REL-07 (Anti-Corruption Layer Schema Isolation):** External AI engines, rendering graphs, and social distribution brokers are isolated behind domain ports. Third-party schemas are strictly translated into internal domain entities at the architectural boundary.

### 5.2 Performance Efficiency & Scalability (RNF-PERF)

- **RNF-PERF-01 (Zero N+1 Queries):** Database queries within loops prohibited; mandatory batch loading or relational joins.
- **RNF-PERF-02 (Deterministic Cursor Pagination):** Listing endpoints enforce cursor-based pagination with $\text{limit} \le 50$.
- **RNF-PERF-03 (Bulkhead Process Isolation):** Heavy FFmpeg transcoding and AI inference isolated in dedicated background worker daemons (`@wind/worker`).
- **RNF-PERF-04 (Three-Tier CAS Storage Lifecycle):** Automated lifecycle rules enforce a 24-hour TTL on ephemeral render scraps (`scratch/`), reserving permanent bucket storage for Character Vault assets (`vault/`) and production deliverables (`releases/`). Zero media or vector payloads stored inline in database rows.

### 5.3 Maintainability & Code Quality (RNF-MAINT)

- **RNF-MAINT-01 (Cognitive Complexity Ceiling):** No function exceeds 15 points of cognitive complexity in Biome.
- **RNF-MAINT-02 (Router Line Ceiling):** No oRPC router or sub-router exceeds 300 lines of code.
- **RNF-MAINT-03 (Zero Comments Rule):** Code files contain zero comments (`bun scripts/strip-comments.ts`).
- **RNF-MAINT-04 (Monorepo Architectural Boundaries):** Dependency hierarchy strictly unidirectional (`bun run boundaries`).

### 5.4 Usability & Accessibility (RNF-USAB)

- **RNF-USAB-01 (WCAG 2.1 AA Compliance):** All interactive non-button elements declare `role="button"`, `tabIndex={0}`, and accessible keyboard handlers.
- **RNF-USAB-02 (Zero Native `<img>` Tags):** Exclusive use of Next.js `Image` with descriptive `alt` text to eliminate Cumulative Layout Shift (CLS).
- **RNF-USAB-03 (Safe Reconciliation):** Proscription of `key={index}` on mutable or sortable lists.

### 5.5 Security & Data Governance (RNF-SEC)

- **RNF-SEC-01 (Telemetry PII & Credential Scrubbing):** OpenTelemetry spans and log sinks scrub API keys (`sk-`, `Bearer `, `key-`), passwords, and emails.
- **RNF-SEC-02 (C2PA AI Provenance):** Rendered video containers (`final.mp4`) support cryptographic C2PA manifest injection (JUMBF box).
- **RNF-SEC-03 (Secure Object Access):** Media assets stored in private S3/MinIO buckets with short-lived presigned URLs and SSRF validation.

---

## 6. Bidirectional Traceability Matrix

| Stakeholder / Business Need          | Requirement ID                                                  | Architecture Layer & Service Implementation                                                                                                                                                              | Quality Gate & Verification Suite                                                                          |
| :----------------------------------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **BR-01** (Performance UGC Ads)      | `RF-CORE-01`<br/>`RF-CORE-02`                                   | `apps/web/server/routers/creative.ts`<br/>`packages/ai/src/director/prompt-planner.ts`                                                                                                                   | Vitest: `apps/web/tests/create-presets-front2.test.ts`<br/>Gate: `bun run check:fallback-debt`             |
| **BR-01** (Performance UGC Ads)      | `RF-FEAT-04`<br/>`RF-FEAT-05`                                   | `apps/web/services/video-export-service.ts`<br/>`lib/hook-audit.ts`                                                                                                                                      | Vitest: `apps/web/tests/features-editing-timeline-100.test.tsx`                                            |
| **BR-02** (Agile Daily Publishing)   | `RF-CORE-06`<br/>`RF-CORE-07`<br/>`RF-CORE-08`                  | `services/video-composer.ts`<br/>`@wind/lib/ffmpeg-builder`<br/>`lib/subtitle-burn.ts`                                                                                                                   | Vitest: `packages/lib/src/tests/ffmpeg-builder.test.ts`<br/>Integration: `services/video-composer.test.ts` |
| **BR-02** (Agile Daily Publishing)   | `RF-FEAT-01`                                                    | `SocialDistributionGateway` / `SocialPublishingPort`<br/>`services/distribution/postiz-publish-broker.ts` adapter<br/>`packages/db/src/repos/publish-record-repo.ts`                                     | Vitest: `apps/web/tests/publish-package.test.ts`<br/>Gate: `bun run boundaries`                            |
| **BR-03** (Narrative Studio & Comic) | `RF-CORE-03`<br/>`RF-CORE-04`                                   | `FaceConsistencyEvaluator` (`services/cameo-evaluator.ts` adapter)<br/>`GenerativeWorkflowManifest` executor (`packages/ai/src/comfyui/client.ts` adapter)<br/>`packages/db/src/repos/character-repo.ts` | Vitest: `apps/web/tests/dashboard-modals-actions.test.tsx`<br/>Vitest: `cameo-evaluator.test.ts`           |
| **BR-03** (Narrative Studio & Comic) | `RF-FEAT-02`<br/>`RF-FEAT-03`                                   | `apps/ws/src/index.ts` (`@wind/ws`)<br/>`NLEExportVisitor` / `NLEInterchangeFormat` (`packages/lib/src/aaf/builder.ts`)                                                                                  | Vitest: `packages/lib/src/tests/aaf-builder.test.ts`<br/>Gate: `bun run typecheck`                         |
| **All Stakeholders**                 | `RNF-REL-01`<br/>`RNF-REL-02`<br/>`RNF-REL-04`<br/>`RNF-REL-07` | `@wind/lib/circuit-breaker`<br/>`services/saga/creation-saga-orchestrator.ts`<br/>Anti-Corruption Layer (ACL) Boundary Adapters                                                                          | Automated: `bun run check:fallback-debt`<br/>Vitest: `saga-orchestrator.test.ts`                           |
| **All Stakeholders**                 | `RNF-PERF-01`<br/>`RNF-PERF-02`                                 | `packages/db/src/repos/*` (52 repositories)<br/>`@wind/worker/src/runner.ts`                                                                                                                             | Automated: `bun run check:orphan-surface`<br/>Inspection: Prisma query plan audit                          |
| **All Stakeholders**                 | `RNF-MAINT-01`<br/>`RNF-MAINT-03`<br/>`RNF-MAINT-04`            | Monorepo architecture rules<br/>`apps/web/server/router.ts`                                                                                                                                              | Automated: `bun run format-and-lint`<br/>Automated: `bun scripts/strip-comments.ts`                        |
| **All Stakeholders**                 | `RNF-SEC-01`<br/>`RNF-SEC-02`                                   | `@wind/telemetry/src/scrubber.ts`<br/>`@wind/lib/c2pa-manifest.ts`                                                                                                                                       | Vitest: `packages/telemetry/tests/scrubber.test.ts`<br/>Security gate: audit pass                          |
