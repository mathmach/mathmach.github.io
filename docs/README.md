# 📖 Wind Comic Documentation Portal

Welcome to the documentation suite for **Wind Comic** (v1.0.0).

---

## 🏛️ System Core, Charters & Requirements

- **[Foundational Constitution & Academic Monograph (TCC)](core/foundation-constitution.md):** The master epistemological framework (DSR), General Systems Theory (TGS), microeconomics of vertical video ("Cold Water Analysis"), the Stakeholder Triptych, and the Indivisible Core Mandate.
- **[Core Premises, System Mandate & Stakeholder Triptych](core/core-mandate.md):** The indivisible core contract ("Zero-Stitch Finished Video Engine"), the 5-app nightmare diagnosis, the Stakeholder Triptych (UGC Advertisers, Agile Publishers, Narrative Studios), and industry benchmarks (TopView.ai, HeyGen, Runway).
- **[Requirements Specification & Traceability Matrix (ISO/IEC/IEEE 29148)](core/requirements-matrix.md):** Formal engineering requirements (`RF-CORE-*`, `RF-FEAT-*`, `RNF-*`), ISO 25010 quality model, and bidirectional traceability matrix.
- **[Formal System Models & Architecture Diagrams (UML)](core/system-models.md):** Formal UML class diagram (DDD & branded types), Garcia-Molina Saga sequence diagram, pipeline finite state machine, Clean Architecture stratification, and deployment topology.

---

## 🏗️ Architecture, Data Layer & Algorithms

- **[The Engineering Constitution & Architecture Rules](architecture/engineering-constitution.md):** The non-negotiable 7 architectural dimensions, GoF design patterns, zero fallback debt, zero orphan surfaces, and pre-commit quality gates.
- **[Formal System Models & Architecture Diagrams (UML)](architecture/system-models.md):** Formal UML class diagram (DDD & branded types), Garcia-Molina Saga sequence diagram, pipeline finite state machine, Clean Architecture stratification, and deployment topology.
- **[Database Architecture & Data Layer](architecture/database.md):** PostgreSQL 17 exclusively via Prisma, 52 repositories (`@wind/db/repos/*`), transaction commit/rollback, and pooling.
- **[API Architecture: Type-Safe oRPC](architecture/orpc-api.md):** Thin orchestrators ($\le 300\text{ LOC}$), RPC and OpenAPI dual protocols, client hooks, and procedure invocation.
- **[Pipeline Algorithms & Pacing Math](architecture/algorithms.md):** Deterministic heuristics, beat-aligned cutting ($\pm 150\text{ ms}$), emotion curves, emphasis weighting, and BYO upgrade paths.
- **[Design Tokens & Theme Architecture](architecture/design-tokens.md):** Tailwind 4 `@theme` integration, Cinema workbench tokens (`--cinema-*`), and UI boundary rules.

---

## 🔌 AI Engines & Media Providers Hub

- **[AI Provider Architecture Overview](providers/overview.md):** Master overview of Gemini reasoning + ComfyUI media co-synthesis and priority selection rules (`0..999`).
- **[Google Gemini Setup & Configuration](providers/gemini-llm.md):** Setup guide for `gemini-2.5-flash`, RPM limits, embeddings, and runtime model overrides.
- **[ComfyUI Workflow Catalog](providers/comfyui.md):** Authoritative workflows for all 6 modalities (Image, Video, TTS, Lipsync, Music, Cover) and placeholder templates.
- **[Bring Your Own (BYO) Provider Plugin Guide](providers/custom-plugins.md):** Extensible single-file plugin integration for custom Image, Video, and TTS endpoints.
- **[Plugin Cutover & Telemetry Runbook](providers/cutover-and-telemetry.md):** Shadow testing, telemetry inspection, agreement verification, and zero-downtime cutover.

---

## ✍️ Creative Screenwriting Subsystem

- **[Screenwriter Skills & Cinematic Reference](screenwriter/skills-reference.md):** Narrative structuring (McKee 3-Act & UGC Direct-Response), character voice profiles, 8-dimensional Character DNA locks, and composite workflows.

---

## 🚀 Operations, Deployment & DevOps

- **[Production Deployment Guide](operations/deployment.md):** Single-machine and multi-replica deployment topologies, Docker Compose, MinIO, Redis event bus, and complete environment variable matrix.
- **[Upstream Fork Synchronization Guide](operations/upstream-sync.md):** Fork maintenance workflow, upstream tracking, conflict resolution, and git remotes.
- **[Screenshot Capture Manifest & Automation](operations/screenshots.md):** Automated script capture, photography conventions, and visual verification checklist.
- **[ModelScope Platform Profile](operations/modelscope-profile.md):** Chinese and English community introduction cards.
- **[ModelScope Full Introduction](operations/modelscope-intro.md):** Technical documentation mirrored for ModelScope.

---

## 📈 Features & Marketing

- **[Marketing Copy & Pitch Deck](marketing/pitch.md):** One-liners, social copy (Twitter, Product Hunt, HN, Reddit), and repository metadata.
- **[Feature Blueprints](features/):** Architectural specifications and workflows for key platform capabilities:
  - [AI Pull-Sheet Replication Workbench](features/pull-sheet-replication.md)
  - [Intelligent Timeline Audio Editing](features/timeline-audio-editing.md)
  - [Commercial Ad Factory](features/commercial-ad-factory.md)
