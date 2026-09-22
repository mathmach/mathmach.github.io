# 🗄️ Database Architecture & Data Layer (PostgreSQL & Prisma)

Wind Comic runs exclusively on **PostgreSQL 17** managed through **Prisma ORM** and typed asynchronous repositories. The persistence model follows a clean-slate greenfield architecture designed to eradicate legacy database workarounds, monolithic JSON blobs, SQLite relics, and unstructured bucket namespaces.

---

## 1. Architectural Components

| Component                  | Location                           | Responsibility                                                                                                                                                                                    |
| :------------------------- | :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Prisma Schema**          | `packages/db/prisma/schema.prisma` | Single source of truth containing domain models. Application code issues zero raw DDL.                                                                                                            |
| **Generated Client**       | `packages/db/src/generated`        | Type-safe query engine generated via `turbo run db:generate`.                                                                                                                                     |
| **Migrations**             | `packages/db/prisma/migrations/`   | Version-controlled SQL migrations applied via `bun run db:migrate`.                                                                                                                               |
| **Connection Pool Driver** | `packages/db/src/driver.ts`        | `getDbDriver()` manages a connection pool (`pg.Pool`) configured with `setTypeParser(20, Number)` to guarantee bigints deserialize as native JavaScript numbers.                                  |
| **Repository Layer**       | `packages/db/src/repos/*`          | 52 isolated asynchronous repositories mediating all database interactions for domain services. Direct raw SQL or Prisma calls from route handlers are prohibited by the Engineering Constitution. |
| **Catalog Seeds**          | `packages/db/src/seeds/*.ts`     | Deterministic seeds for style presets, camera languages, story templates, voices, and billing tiers. Seeded via `bun run db:seed`.                                                                |

`DATABASE_URL` is mandatory across all environments. There are no fallback drivers or SQLite fallbacks.

---

## 2. Greenfield Clean-Slate Relational Architecture

Wind Comic rejects legacy database compromises and embraces a normalized relational design engineered for high-throughput AI media synthesis, collaborative video editing, and deterministic content-addressable storage.

### 2.1 Eradication of Monolithic JSON Blobs & Select Exclusions

In legacy web architectures, hierarchical narrative structures and editing timelines were serialized into giant JSON columns (such as `script_data`, `director_notes`, `storyboardScript`, `keyframeData`, or `renderedVectors`). This anti-pattern caused severe performance and operational bottlenecks:
- **Write Amplification:** Mutating a single line of dialogue, camera direction, or timing cue required serializing, transferring, and rewriting a multi-megabyte JSON document.
- **Lost Updates & Merge Hazards:** Concurrent edits to different parts of the same script or timeline frequently caused race conditions and silent overwrite collisions.
- **Query Inefficiency & Fallback Debt:** Listing and summary endpoints were forced to maintain fragile Prisma `select` exclusion blocks to prevent transferring megabytes of unneeded JSON payloads over the network.

In our clean-slate architecture, narrative and cinematic structures are modeled as **fully normalized relational tables**:

```
Project (1) ───< (N) Episode (1) ───< (N) Scene (1) ───< (N) Shot (1) ───< (N) VoiceTrack
```

1. **`Episode`**: Relational aggregate belonging to `Project` (or `Series`), capturing `episode_number`, `title`, `synopsis`, `status`, `runtime_ms`, and `version` (Optimistic Concurrency Control).
2. **`Scene`**: Relational unit belonging to `Episode`, capturing `sequence_index`, `slugline` (scene heading), `setting`, `dramatic_goal`, and `lighting_mood`.
3. **`Shot`**: Relational unit belonging to `Scene`, capturing `sequence_order`, `shot_size` (e.g., `EXTREME_CLOSE_UP`, `MEDIUM_SHOT`, `WIDE`), `camera_movement` (e.g., `PAN_LEFT`, `DOLLY_IN`, `CRANE_UP`), `visual_prompt`, `duration_ms`, `render_status`, `version` (OCC), and CAS foreign keys (`keyframe_cas_hash`, `video_cas_hash`).
4. **`VoiceTrack`**: Relational unit belonging to `Shot`, capturing `character_id`, `dialogue_text`, `voice_provider`, `prosody_pitch`, `prosody_rate`, `offset_ms`, `duration_ms`, and audio CAS reference (`audio_cas_hash`).

#### Direct Benefits:
- **Zero Heavy Column Exclusions:** Listing endpoints (`listProjects`, `listEpisodes`) naturally query lightweight scalar columns with zero risk of pulling multi-megabyte narrative trees.
- **Discrete ACID Mutations:** Edits to a single shot prompt, dialogue segment, or camera move execute as discrete single-row `UPDATE` operations guarded by Optimistic Concurrency Control (`WHERE id = $1 AND version = $2`).
- **Declarative Cascading Integrity:** Deleting a project, episode, or scene natively cascades through PostgreSQL foreign keys (`ON DELETE CASCADE`), preventing orphan records.
- **Relational Aggregations:** Timeline runtime calculation and progress aggregation use native SQL aggregates (`SUM(duration_ms)`, `COUNT(*) FILTER (WHERE status = 'rendered')`) rather than in-memory JSON parsing.

---

### 2.2 Content-Addressable Storage (CAS) Reference Model (Zero Inline Blobs)

The PostgreSQL database stores **zero binary payloads and zero mathematical vector arrays inline**:
- Raw media bytes (storyboard sketches, keyframe renders, latent noise arrays, diffusion passes, audio waveforms, video chunks) are never stored in database rows or JSON columns.
- High-dimensional vector embeddings (512-d or 1024-d Character DNA facial embeddings, voice acoustic latents) are persisted in Content-Addressable Storage (CAS) in S3/MinIO.
- Relational tables store only deterministic **SHA-256 CAS references**:
  - `keyframe_cas_hash`, `video_cas_hash`, `audio_cas_hash`: Deterministic SHA-256 hexadecimal digests (`VARCHAR(64)`).

#### Deduplication and Cryptographic Integrity:
All asset writes compute `sha256(content)`. Identical assets generated across different episodes or projects yield identical CAS hashes and share the same physical storage object. Hash collisions are cryptographically negligible (\(2^{-256}\)), and asset integrity is strictly verifiable by client and backend workers.

---

### 2.3 Purge of SQLite Relics & Strict PostgreSQL Native Types

All legacy SQLite compatibility relics are strictly purged in favor of native PostgreSQL 17 features:
- **Native `BOOLEAN`:** Flags are stored strictly as PostgreSQL native `BOOLEAN` (`true` / `false`). Legacy SQLite integer representations (`0` / `1`) are prohibited. Native booleans enable expressive partial indexing (`CREATE INDEX idx_shots_pending ON shots (scene_id) WHERE is_rendered = false`) and eliminate type coercion layers.
- **Native `UUIDv4`:** All primary and foreign keys utilize PostgreSQL native `UUID` types with server-side default generation via `gen_random_uuid()`.
- **Microsecond-Precision `TIMESTAMPTZ(6)`:** Temporal timestamps (`created_at`, `updated_at`, `expires_at`) use native `TIMESTAMPTZ(6)` (UTC with microsecond resolution), eliminating timezone drift and string serialization ambiguities.
- **Relational Foreign Key Constraints:** Strict referential integrity (`REFERENCES ... ON DELETE CASCADE` / `ON DELETE RESTRICT`) is enforced at the database engine level.

---

## 3. Standardized 3-Tier Object Storage Mapping

Storage namespaces are organized into 3 clean, unambiguous tiers that map directly to domain entity lifecycles:

| Storage Tier | Bucket Prefix | Retention Policy | Domain Entities & Content |
| :--- | :--- | :--- | :--- |
| **Tier 1: Ephemeral Scratch** | `scratch/` | **24-hour Auto-TTL** (MinIO/S3 ILM lifecycle rule: `expire-days: 1`). Also purged by Saga compensations on job abort. | Intermediate diffusion frames, unstitched video chunks, raw TTS voice stems, segmentation alpha mattes, temporary concat lists. |
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

## 4. Local Development Lifecycle

```bash
# 1. Start PostgreSQL 17 and MinIO object storage
docker compose up -d

# 2. Configure environment
export DATABASE_URL="postgres://wind:wind@localhost:5434/wind"

# 3. Apply migrations and seed catalogs
bun run db:migrate && bun run db:seed

# 4. Start Next.js, worker daemons, and WebSocket presence server
bun run dev

# 5. Stop infrastructure containers
docker compose down
```

All four database lifecycle scripts are defined in `@wind/db`: `db:generate`, `db:migrate`, `db:seed`, and `db:seed:demo`. Seeding operations are strictly idempotent.

---

## 5. Test Database Isolation

Vitest test suites run against a live PostgreSQL test database to ensure dialect and index parity with production:

- `apps/web/tests/global-setup.ts` resets and migrates the test database on every test execution.
- The test target is `DATABASE_URL_TEST` (defaulting to the development database URL with `_test` appended).
- Test files execute serially (`fileParallelism: false`, `maxWorkers: 1`) to prevent state corruption across parallel database mutations.

---

## 6. Key Engineering Conventions

- **Optimistic Concurrency Control (OCC):** Collaborative mutations on scripts, scenes, shots, and tracks enforce `version` checks (`WHERE id = $1 AND version = $2`). Failed version checks abort immediately to prevent overwriting concurrent updates.
- **Native Boolean Predicates:** All filter conditions and partial indexes leverage PostgreSQL native booleans (`WHERE is_rendered = true`).
- **Real-time Presence & Collaborative Locks:** Segment mutations enforce transactional row locks (`timeline_segment_locks`), while live presence cursors broadcast via WebSocket (`@wind/ws`).
- **Transactional Scope Executor:** Atomic mutations spanning multiple entities use `getDbDriver().transaction(async (tx) => { ... })`. Queries must execute against `tx` to participate in the checked-out pool client. Unhandled exceptions trigger an immediate rollback.
- **Unique Violations:** Evaluated using `isUniqueViolation(e)` (`packages/db/src/driver.ts`), inspecting SQLSTATE `23505`.
- **Subquery Avoidance:** Listing operations (e.g. `apps/web/server/routers/projects.ts`) batch load relational child entities in memory to prevent expensive correlated subqueries.
- **Automated Index Regression Guard:** `apps/web/tests/core-table-indexes.test.ts` executes `EXPLAIN` queries against the test database, failing the build if an index is bypassed in core queries.
