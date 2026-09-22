# 🗄️ Relational Persistence Architecture & CAS Storage Lifecycle

This document defines the formal data layer and storage architecture. The persistence model follows a clean-slate greenfield relational architecture designed to eliminate monolithic JSON blobs, unstructured storage namespaces, and database connection pool starvation during long-running generative media pipelines.

---

## 1. Architectural Foundations

| Principle | Architectural Responsibility |
| :--- | :--- |
| **Schema as Single Source of Truth** | Data models, constraints, and relational mappings are strictly declared in schema definitions. Application code executes zero raw DDL. |
| **Typed Repository Abstraction** | Domain services and orchestrators interact with persistence exclusively through typed repository interfaces (`IRepository<T>`). Direct database driver access from API controllers or route handlers is strictly prohibited. |
| **Managed Connection Pooling** | Database drivers manage a dedicated connection pool with integer-safe bigint serialization and strict pool size boundaries to prevent thread exhaustion. |
| **Deterministic Seed Catalogs** | Static catalogs (camera language taxonomies, story templates, dramatic archetypes) are initialized via idempotent seed definitions. |
| **Relational Integrity by Default** | Foreign key constraints (`REFERENCES ... ON DELETE CASCADE` / `ON DELETE RESTRICT`) are enforced at the database engine level, guaranteeing zero orphan child entities. |

---

## 2. Greenfield Clean-Slate Relational Architecture

The architecture rejects legacy document-store anti-patterns inside relational engines and embraces a fully normalized relational structure engineered for high-throughput AI media synthesis and deterministic storage references.

### 2.1 Eradication of Monolithic JSON Blobs

In legacy generative AI tools, hierarchical narrative structures and editing timelines are serialized into giant JSON columns (e.g., `script_data`, `director_notes`, `storyboard_tree`, `rendered_vectors`). This anti-pattern introduces critical flaws:
- **Write Amplification:** Mutating a single line of dialogue, camera direction, or timing cue requires serializing, transferring, and rewriting a multi-megabyte document.
- **Lost Updates & Merge Hazards:** Concurrent edits to different segments of the same script or timeline trigger silent overwrite collisions.
- **Query Inefficiency:** Summary listings are forced to maintain complex column exclusions to avoid loading unneeded megabyte payloads over the network.

In our normalized relational architecture, narrative and cinematic structures are modeled as discrete relational entities:

```
Project (1) ───< (N) Episode (1) ───< (N) Scene (1) ───< (N) Shot (1) ───< (N) VoiceTrack
```

1. **`Episode`**: Relational aggregate belonging to `Project`, capturing `episode_number`, `title`, `synopsis`, `status`, `runtime_ms`, and `version` (Optimistic Concurrency Control).
2. **`Scene`**: Relational unit belonging to `Episode`, capturing `sequence_index`, `slugline` (scene heading), `setting`, `dramatic_goal`, and `lighting_mood`.
3. **`Shot`**: Relational unit belonging to `Scene`, capturing `sequence_order`, `shot_size` (e.g., `EXTREME_CLOSE_UP`, `MEDIUM_SHOT`, `WIDE`), `camera_movement` (e.g., `PAN_LEFT`, `DOLLY_IN`, `CRANE_UP`), `visual_prompt`, `duration_ms`, `render_status`, `version` (OCC), and CAS foreign keys (`keyframe_cas_hash`, `video_cas_hash`).
4. **`VoiceTrack`**: Relational unit belonging to `Shot`, capturing `character_id`, `dialogue_text`, `voice_provider`, `prosody_pitch`, `prosody_rate`, `offset_ms`, `duration_ms`, and audio CAS reference (`audio_cas_hash`).

#### Direct Benefits:
- **Zero Column Exclusions:** Listing operations query lightweight scalar columns with zero risk of pulling multi-megabyte trees.
- **Discrete ACID Mutations:** Edits to a single shot prompt, dialogue segment, or camera direction execute as discrete single-row `UPDATE` operations guarded by Optimistic Concurrency Control (`WHERE id = $1 AND version = $2`).
- **Native Relational Aggregations:** Timeline runtime calculation and progress aggregation use native SQL aggregates (`SUM(duration_ms)`, `COUNT(*) FILTER (WHERE status = 'rendered')`).

---

### 2.2 Content-Addressable Storage (CAS) Reference Model (Zero Inline Blobs)

The relational database stores **zero binary payloads and zero mathematical vector arrays inline**:
- Raw media bytes (storyboard sketches, keyframe renders, latent noise arrays, diffusion passes, audio waveforms, video chunks) are never stored in database rows or JSON columns.
- High-dimensional vector embeddings (512-d or 1024-d Character DNA facial embeddings, voice acoustic latents) are persisted in Content-Addressable Storage (CAS) in standard object storage.
- Relational tables store only deterministic **SHA-256 CAS references**:
  - `keyframe_cas_hash`, `video_cas_hash`, `audio_cas_hash`: Deterministic SHA-256 hexadecimal digests (`VARCHAR(64)`).

#### Deduplication and Cryptographic Integrity:
All asset writes compute `sha256(content)`. Identical assets generated across different episodes or projects yield identical CAS hashes and share the same physical storage object. Hash collisions are cryptographically negligible ($2^{-256}$), and asset integrity is strictly verifiable by any consumer or worker.

---

### 2.3 Strict Native Relational Typing

- **Native Boolean Predicates:** Flags are stored strictly as native booleans (`true` / `false`), enabling expressive partial indexing (`CREATE INDEX idx_shots_pending ON shots (scene_id) WHERE is_rendered = false`).
- **Cryptographic Identifiers:** Primary and foreign keys utilize native UUIDv4 types with server-side default generation (`gen_random_uuid()`).
- **Microsecond-Precision Timestamps:** Temporal timestamps (`created_at`, `updated_at`, `expires_at`) use UTC with microsecond resolution (`TIMESTAMPTZ(6)`), eliminating timezone drift and string serialization ambiguities.

---

## 3. Standardized 3-Tier Object Storage Lifecycle

Storage namespaces are organized into 3 tiers that map directly to domain entity lifecycles:

| Storage Tier | Bucket Prefix | Retention Policy | Domain Entities & Content |
| :--- | :--- | :--- | :--- |
| **Tier 1: Ephemeral Scratch** | `scratch/` | **24-hour Auto-TTL** (Automated lifecycle rule: `expire-days: 1`). Also purged by Saga compensations on job abort. | Intermediate diffusion frames, unstitched video chunks, raw TTS voice stems, segmentation alpha mattes, temporary concat lists. |
| **Tier 2: Permanent Library** | `vault/` | **Permanent / Indefinite Retention**. Never deleted by automated age sweeps. | Character Aggregate Root DNA embeddings, LoRA adapter weights, licensed audio tracks, reference face vectors, biometric voice profiles. |
| **Tier 3: Production Deliverables** | `releases/` | **Production Release Retention**. Retained indefinitely or governed by project publishing lifecycle. | Final film renders (`final.mp4`), multi-resolution transcodes (720p, 1080p, 4K), EDL/AAF interchange archives for NLE suites, final poster art. |

### 3.1 Object Key Schema

Every CAS asset key adheres to a deterministic, content-addressed path:

```
<tier>/<scope>/<sha256>.<ext>
```

- `<tier>`: The storage tier (`scratch`, `vault`, or `releases`). Defines lifecycle and automated TTL rules.
- `<scope>`: The domain owner or project scope (e.g. `projects/<projectId>`, `characters/<characterId>`, `global`). Enforces access authorization.
- `<sha256>.<ext>`: The 64-character lowercase hexadecimal SHA-256 digest of the file payload, followed by the canonical file extension. Guarantees deduplication, cryptographic tamper-evidence, and cache immutability.

---

## 4. Concurrency Control, Two-Phase Holds & Transactions

### 4.1 Optimistic Concurrency Control (OCC)
Collaborative mutations on scripts, scenes, shots, and audio tracks enforce `version` checks (`WHERE id = $1 AND version = $2`). If an update matches 0 rows, the operation aborts with a concurrency collision exception, preventing silent data overwrites.

### 4.2 Financial Concurrency: Two-Phase Hold & Settle Pattern
To prevent holding open database transactions and starving the connection pool during long GPU inference tasks (2–5 minutes), credit accounting follows a non-blocking two-phase protocol:
1. **Phase 1 (Hold, 5ms):** Within a fast ACID transaction, verify balance and insert a `CreditHold` record with status `HELD`. Commit immediately.
2. **Asynchronous Execution (2–5 min):** The GPU worker runs outside any database transaction.
3. **Phase 2a (Settle, 5ms):** On successful render, execute an atomic transaction that marks the hold as `SETTLED` and deducts the balance.
4. **Phase 2b (Compensating Release, 5ms):** On failure or timeout, mark the hold as `RELEASED` with 100% refund, releasing reserved capacity.

### 4.3 Transactional Scope & Outbox Integrity
Atomic mutations spanning multiple domain aggregates must execute within an explicit transactional scope. Unhandled exceptions trigger an immediate rollback. Events destined for external message buses are written to a Transactional Outbox table within the same transaction to prevent dual-write anomalies.
