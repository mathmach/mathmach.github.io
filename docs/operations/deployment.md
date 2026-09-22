# Production deployment guide (v11.0)

> This document was produced by a full inventory of the repository during the v11.0 wrap-up; every fact is
> taken from the code (with the source file noted).
> **Repo layout:** the root is a Bun workspace (`apps/*`, `packages/*`) driven by Turbo, and the whole
> Next.js app lives in `apps/web` — every source path below is written relative to the repo root, and
> every `bun run …` command is run from the repo root. Runtime paths (`data/`, `process.cwd()`) are
> relative to the app directory: `apps/web` in development, `/app` inside the container.
> Two topologies: **single machine** (the default: one Postgres + local disk, nothing else) and
> **multi-replica** (the same Postgres + Redis + S3).
>
> **PostgreSQL is the only database.** There is no SQLite driver and no `DB_DRIVER` switch any more:
> `DATABASE_URL` is required everywhere, and the schema is owned by `packages/db/prisma/schema.prisma` +
> `packages/db/prisma/migrations/`, applied with `bun run db:migrate`.

---

## Two processes, not one

The application runs as **two** processes against one database:

| Process  | What it does                  | Command                                              |
| -------- | ----------------------------- | ---------------------------------------------------- |
| `web`    | Serves HTTP and enqueues jobs | `next start` (Dockerfile target `runner`)            |
| `worker` | Claims and runs the pipeline  | `tsx src/main.ts` in `apps/worker` (target `worker`) |

`docker compose up -d --build` brings up external dependencies (Postgres, MinIO, Postiz, Temporal).

**Why they are separate.** A generation is minutes of provider calls and an ffmpeg edit that
saturates the CPU. Inside the web process that showed up as slow HTTP responses, every web replica
competed for jobs whether or not it was serving traffic, and the two could not be scaled apart —
more capacity for requests was also more capacity for generations. Scale the worker on its own with
`--scale windcomic-worker=3`; pg-boss claims with `SKIP LOCKED`, so workers share the queue rather
than racing for it.

**In development there is one process.** `bun run dev` starts the worker inside the web server
(`apps/web/instrumentation.ts`, guarded on `NODE_ENV !== 'production'`), because a second terminal
to remember is the wrong trade locally. `bun run --cwd apps/worker dev` runs it standalone if you
want the production shape.

**Shutdown.** The worker drains on `SIGTERM`: it stops claiming and lets what is running finish,
up to 30s. Without that, a deploy kills a process holding a job and the job only comes back when
pg-boss's heartbeat monitor notices — up to half a minute of a generation looking stuck. The
compose file gives it a 60s `stop_grace_period` for the same reason.

## Topology 1: single machine (recommended starting point)

```bash
# The minimum runnable setup (demo mode, no keys at all):
MOCK_ENGINES=1 bun run build && bun run start

# The minimum production single-machine set:
DATABASE_URL=postgresql://user:pass@host:5432/dbname   # required — there is no other database
AUTH_SECRET=<32+ random characters>   # required in production — `openssl rand -base64 32`
GEMINI_API_KEY=<key>                  # the Google Gemini LLM API key
COMFYUI_URL=http://localhost:8188     # ComfyUI base URL
```

Apply the schema once per deploy, before starting the app (the Prisma CLI is run from the app workspace):

```bash
bun run db:migrate
```

On a single machine: one Postgres instance + one S3-compatible bucket + an in-process event bus.
`DATABASE_URL` and the four `S3_*` values have to be pointed somewhere; everything else is zero
configuration. There is no local-disk mode — `packages/env` refuses to boot without object storage,
because a write that means different things on different replicas is worse than a refusal.

### The container image

The build context is the **repo root** — the image copies the whole Bun workspace, because the install
and the Prisma generate both run through it:

```bash
docker build -t wind-comic .                                        # from the repo root
docker run -p 3100:3100 --env-file apps/web/.env.local \
           -v wind-data:/app/data wind-comic
```

Five stages and **three runnable targets** (`Dockerfile`):

| Stage     | Base                    | What it does                                                                                                                                                                                                                                                                                                                 |
| --------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deps`    | `oven/bun:1.3.5-alpine` | Copies the root manifests and **every workspace's `package.json`** — bun resolves the whole graph before installing anything — plus `packages/db/prisma`, then `bun install --frozen-lockfile`. Manifests without sources keep this layer cached across code changes                                                         |
| `builder` | `node:22-alpine`        | Brings the `bun` binary across (turbo refuses to start without the package manager declared in `package.json`), regenerates the Prisma client, then `next build`. Regenerated because the client is emitted into `packages/db/src/generated`, which the source `COPY` overwrote with a git-ignored — therefore absent — tree |
| `runner`  | `node:22-alpine`        | The web app. ffmpeg + DejaVu fonts, a non-root `nextjs` user                                                                                                                                                                                                                                                                 |
| `worker`  | `node:22-alpine`        | The pipeline worker: pg-boss consuming the three queues                                                                                                                                                                                                                                                                      |
| `ws`      | `node:22-alpine`        | The presence WebSocket server. Built from `deps`, **not** from `builder`: it is plain Node against the workspace, so hanging it off the builder would make it wait for (and fail with) a Next build it does not use                                                                                                          |

**The runtime keeps the workspace layout**, and not for tidiness: the app imports the workspace packages as
source through their links, so `/repo/packages/*` has to still resolve. The working directory is
`/repo/apps/web`, and `data/` and `scripts/` sit where they do in the repository.

**Each target starts through `scripts/<name>-entrypoint.sh`**, with `exec` on the last line. Without `exec`
the shell stays PID 1 and does not forward `SIGTERM`, which is the bug that used to cost generations in
flight. The binaries are called by absolute path — `/repo/node_modules/.bin/next` — because the `hoisted`
linker puts every dependency in the root `node_modules` and the app's own `.bin` does not exist.

The image does not create tables. Apply migrations before the container starts:

```bash
bun run db:migrate     # from a checkout, against the target DATABASE_URL
```

The web entrypoint can do it instead, but it is **opt-in** by `RUN_MIGRATIONS=1`, because N replicas
migrating on boot is a race over one schema.

## Topology 2: multi-replica (horizontal scaling)

Postgres is already there in either topology; two further components **must be configured together**
before adding replicas:

| Component                      | Environment variables                                                  | Purpose                                                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL (always)            | `DATABASE_URL=postgresql://...`                                        | Also the job queue: pg-boss claims, retries and expires jobs in its own `pgboss` schema                                       |
| Redis event bridge             | `REDIS_URL=redis://...` (rediss TLS supported)                         | Real-time SSE events reach every replica (otherwise comments and progress are only visible on the replica that produced them) |
| S3-compatible storage (always) | `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Every artifact. Deduplicated by content hash, read back by signed redirect so the bytes never pass through the app            |

### Known multi-replica limitations (the honest list)

**1. ~~recoverJobsAtBoot races across replicas~~ (✅ the queue is no longer ours)**
Orphan recovery is pg-boss's: the queue is configured with `heartbeatSeconds`, workers refresh the
heartbeat while a job runs, and pg-boss's monitor retries any job whose heartbeat went quiet. The
hand-written `heartbeat_at` column, the 90s cutoff and the every-30s sweep that read them are gone. What
remains on our side is the one rule pg-boss cannot know — a run still not terminal 24h after it was
created is declared failed, and its project with it (`apps/web/lib/pipeline-failure.ts`).

**2. ~~appendJobProgress read-modify-write is not atomic~~ (✅ fixed in v11.0.3)**
Progress events are **append-only INSERTs** (the `pipeline_run_events` table): naturally atomic, no lost
updates under multi-replica, and it removes the O(n²) write amplification where the JSON got worse the
longer it grew. Playback takes the most recent 400 rows ordered by `seq`, a database sequence — the
previous tiebreaker was a per-process counter that reset on restart, so two replicas appending in the same
millisecond had no defined order. Events are removed with their run, by the foreign key's cascade.

**3. ~~Local disk must still be writable under the S3 driver~~ (✅ resolved by `unify-object-storage`)**
There is no local copy any more, and therefore no volume to mount. ffmpeg still needs files — that has not
changed and cannot — but it gets them from `os.tmpdir()`: a producer writes its output to scratch and
uploads it, a consumer downloads what it needs and deletes it. Nothing in `os.tmpdir()` survives the
operation that created it, and nothing there is reachable over HTTP. `apps/web/data/` no longer exists.

**4. The single Redis `qfmj-bus` channel carries every event**
All logical channels (notif/comment/pipeline) are serialized onto the one Redis `qfmj-bus` channel
(`packages/events/src/redis.ts:104`). Under high concurrency that channel can become a bottleneck; and when Redis
is unavailable it degrades to in-process (no cross-replica sync) rather than erroring, so it needs
monitoring.

**5. The Docker HEALTHCHECK probes the home page rather than a dedicated /api/health**
The `wget` in `Dockerfile:75-76` hits `/` (the home page) rather than `/api/runtime/readiness` or
`/api/health/providers`. A working home page does not mean the DB or LLM is ready; probing
`/api/runtime/readiness` is recommended in production. The start-period is only 20s, which a cold start
can exceed.

**6. LLM calls execute in-process via Google Gemini REST client**
All LLM prompts and multimodal vision inspections execute in-process via `apps/web/lib/llm-client.ts`, eliminating external CLI script subprocesses.

**7. The Postgres pool is sized by the driver's defaults**
`PgDriver` builds a `pg` `Pool` from `DATABASE_URL` alone (`packages/db/src/raw.ts`), so the pool takes the
library default (10 clients per process). With N replicas × the pipeline worker's `MAX_ACTIVE=2` plus the
request paths, size `max_connections` on the server accordingly, or put a pooler (PgBouncer) in front.

---

## 1. Process model: what `next start` starts inside a single process

**Entry file:** `instrumentation.ts` (the Next.js `register()` hook, which runs only when
`NEXT_RUNTIME === 'nodejs'`, once per process start).

The startup sequence (in code order):

| Step | Operation                                                                                                          | Condition                                                                              | Source                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1    | `initSentry()` → load `@sentry/nextjs`, read `SENTRY_DSN`                                                          | Silently degrades to console when `SENTRY_DSN` is unset or the package isn't installed | `instrumentation.ts` + `apps/web/lib/telemetry.ts`       |
| 2    | `loadModelOverridesIntoEnv()` → read every model override from the `model_overrides` table back into `process.env` | Always attempted; silent when the table doesn't exist yet (first-run ordering)         | `instrumentation.ts` + `apps/web/lib/model-overrides.ts` |
| 3    | `ensurePipelineWorker()` → register pg-boss workers on every pipeline queue                                        | Outside production only; in production this is `apps/worker`                           | `instrumentation.ts` + `apps/web/lib/pipeline-worker.ts` |

**Sentry initialization details (`apps/web/lib/telemetry.ts`):**

- `tracesSampleRate` defaults to `0.1`, overridable with `SENTRY_TRACES_SAMPLE_RATE`
- `release` reads `NEXT_PUBLIC_APP_VERSION`
- when Sentry is missing or unconfigured it degrades to console without throwing

**Pipeline worker details (`apps/web/lib/pipeline-worker.ts`):**

- concurrency, polling and heartbeat are the queue's, declared per work type in `packages/queue/src/index.ts`
- globalThis key: `__windPipelineWorker`
- the expiry sweep's timer calls `.unref()` (so it never keeps the process alive)

**Note:** the enqueueing routes used to call `ensurePipelineWorker()` too, so a replica would start a
worker on first use. They no longer do — in production that would have put a competing worker on
every web replica, which is the thing splitting the processes exists to stop.

## 2. globalThis singleton assumptions and multi-replica risk

**The singletons kept on globalThis:**

| globalThis key          | Purpose                                                                       | Defined in                           |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| `__qfmjBus`             | The in-process EventEmitter (the event bus)                                   | `packages/events/src/index.ts:17-19` |
| `__qfmjBusOrigin`       | This process's unique id (`${pid}-${uuid8}`, used to prevent Redis self-echo) | `packages/events/src/index.ts:21-22` |
| `__qfmjRedisBus`        | The RedisBusClient instance                                                   | `packages/events/src/index.ts:30`    |
| `__qfmjRedisBusStarted` | Whether the Redis bridge is initialized (an idempotency flag)                 | `packages/events/src/index.ts:25-26` |
| `__windPipelineWorker`  | The pipeline worker's initialization promise (an idempotency flag)            | `packages/queue/src/index.ts:308`    |

**Problems across replicas (when `REDIS_URL` is not configured):**

1. `__qfmjBus` (`packages/events/src/index.ts`): a purely in-process EventEmitter. Across replicas, the
   `emitPipeline`/`emitComment`/`emitNotification` calls made by replica A never reach an SSE connection
   subscribed on replica B, so real-time pushes are dropped. Event interchange across instances requires `REDIS_URL`.

2. `__windPipelineWorker` (`packages/queue/src/index.ts`): pg-boss workers are registered once per process
   via `ensurePipelineWorker()`. In multi-replica production deployments, workers are dedicated to `apps/worker`
   rather than starting workers on web replicas.

3. The `DbDriver` singleton (`packages/db/src/raw.ts`): a process-level singleton (`let singleton`) not on
   globalThis; each replica process builds its own PG pool, which is safe across replicas.

## 3. The multi-replica readiness component: how to turn on event-bus-redis

**How to turn it on (`packages/events/src/index.ts` + `packages/events/src/redis.ts`):**

```
REDIS_URL=redis://[:password@]host:port    # plaintext
REDIS_URL=rediss://[:password@]host:port   # TLS
```

**How it works internally:**

- the first `busEmit` or `subscribe` triggers `ensureRedisBridge()` (idempotent, protected by the
  `__qfmjRedisBusStarted` flag)
- `startRedisBus()` synchronously creates a `RedisBusClient` (`packages/events/src/redis.ts:213-221`); the socket
  connects asynchronously, and publish requests during that window go into an internal queue (capped at
  200, dropping the oldest beyond that)
- two independent sockets are used: a pub socket (`PUBLISH`) and a sub socket (`SUBSCRIBE`), because Redis
  forbids normal commands on a connection in subscribe mode
- every event goes through the single `qfmj-bus` channel, with the envelope carrying
  `channel`+`origin`+`event`; `shouldDeliver()` uses `origin !== selfOrigin` to prevent self-echo
- reconnection uses exponential backoff: 1s initially, doubling each time, capped at 30s
  (`packages/events/src/redis.ts:197-208`)
- an invalid `REDIS_URL` or a failed connection degrades silently to in-process mode
  (`packages/events/src/index.ts:33-35`)
- zero new dependencies: a hand-written minimal RESP subset (AUTH/SUBSCRIBE/PUBLISH only)

**Why it matters:** without `REDIS_URL`, SSE pushes (comments, notifications, pipeline progress) are only
visible within the same replica process; clients on other replicas receive nothing.

## 4. The job queue (pg-boss)

**There is no queue table in this repository.** `pipeline_jobs` — a `state` column, an `attempts` counter
and an `UPDATE ... WHERE state = 'queued'` standing in for a claim — was replaced by
[pg-boss](https://pgboss.io), which creates and versions its own schema (`pgboss`) in the same database.
Nothing in `prisma/migrations` describes it, and nothing should.

**What we still own** is `pipeline_runs`: the execution history the jobs interface reads — owner, project,
step reached, last error — keyed by the pg-boss job id, so the two halves join without a second
identifier. pg-boss has no notion of a tenant, which is exactly why `user_id` lives here: every read path
filters on it (`@wind/db/repos/pipeline-run-repo`), and `tests/final-sweep.test.ts` proves a user
cannot see another's runs.

**The queue's configuration** (`packages/queue/src/index.ts`):

| Setting            | Value              | What it replaced                                       |
| ------------------ | ------------------ | ------------------------------------------------------ |
| `retryLimit`       | 2 (three attempts) | `MAX_ATTEMPTS = 3`, compared by hand in the repository |
| `retryBackoff`     | on, from 5s        | nothing — retries were immediate                       |
| `heartbeatSeconds` | 30                 | the `heartbeat_at` column and the 90s orphan sweep     |
| `expireInSeconds`  | 3600               | nothing — a job could run forever                      |

A terminally failed job stays `failed` in the history and can be re-queued by hand with
`POST /api/pipeline-jobs/:id/retry`, which resets the history and calls pg-boss's `retry`.

**Multi-instance:** claiming is pg-boss's `SKIP LOCKED` fetch, so two replicas cannot take the same job.
Concurrency per replica is `localConcurrency` (2), set where `MAX_ACTIVE` used to be.

### Recurring work

Three routines run on pg-boss's own cron, in the database, with no external trigger:

| Queue                       | Cron         | What it does                                                                                                                                                                                                               |
| --------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maintenance.expire-runs`   | every 10 min | Fails runs still non-terminal 24h after they were created, and their projects with them                                                                                                                                    |
| `maintenance.due-publishes` | every minute | Runs scheduled publishes whose time has passed                                                                                                                                                                             |
| `maintenance.cleanup-media` | 04:30 daily  | Removes orphan CAS objects that no database row references across all 3 storage tiers. Ephemeral media expiry is governed by the 24-hour Auto-TTL lifecycle rule on the `scratch/` prefix — the app does not sweep for age |

All three are `singleton`: a sweep that overruns its interval does not get a second copy on the
next tick. They were `GET`/`POST` endpoints under `app/api/cron/*` guarded by `CRON_SECRET`, which
meant they only ran if something outside the application remembered to call them, and that a
routine which **deletes files** was reachable by anyone who learned the token. Both the endpoints
and the variable are gone.

## 5. The database (PostgreSQL, the only one)

**How to configure (`packages/db/src/driver.ts`):**

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname   # required; no default, no fallback
```

`getDbDriver()` always returns the `PgDriver`. There is no `DB_DRIVER` variable, no SQLite driver and no
`data/qfmj.db` file — every DB path in the app goes through the same pool.

**Clean-Slate Greenfield Data Architecture:**

- **Normalized Narrative Relational Schema:** Structured narrative entities (`Episode`, `Scene`, `Shot`, `VoiceTrack`) are modeled as normalized relational tables with explicit foreign keys and cascading deletions (`ON DELETE CASCADE`). This eliminates legacy monolithic JSON blobs (e.g., `script_data`, `director_notes`, `storyboardScript`) and eradicates fragile "heavy column exclusion" `select` blocks on summary queries.
- **Content-Addressable Storage (CAS) Pointer Discipline:** Large binary payloads (storyboard sketches, rendered frames, latents, video chunks) and mathematical vector matrices (Character DNA embeddings, LoRA weights) are stored exclusively in S3/MinIO CAS referenced by deterministic SHA-256 content hashes (`VARCHAR(64)` / `CasHash`). Zero binary or vector bloat is stored inline in PostgreSQL rows.
- **Purge of SQLite Relics:** PostgreSQL native `BOOLEAN` (`true`/`false`) is enforced everywhere, eradicating legacy SQLite integer representations (`0`/`1`) and enabling native partial indexing (`WHERE is_rendered = true`). Entity keys use native `UUIDv4` (`gen_random_uuid()`), and temporal columns use microsecond-precision `TIMESTAMPTZ(6)`.
- **Optimistic Concurrency Control (OCC):** Collaborative editing on episodes, shots, and tracks uses explicit `version` column checks (`WHERE id = $1 AND version = $2`), preventing lost updates under multi-user or worker concurrency.

**Driver details:**

| Feature      | PostgreSQL                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Dependency   | `pg` (lazily imported the first time a query runs)                                                                        |
| Placeholders | queries are written with `?` and rewritten to `$1, $2, ...` by `toPgPlaceholders()` (`packages/db/src/dialect.ts`)        |
| int8/bigint  | OID 20 is parsed uniformly as `Number`, so `COUNT(*)` and BIGSERIAL ids come back as numbers                              |
| Transactions | one client checked out from the pool for the whole run; `BEGIN` / `COMMIT`, `ROLLBACK` on throw                           |
| Schema       | owned by Prisma: `packages/db/prisma/schema.prisma` + `packages/db/prisma/migrations/`, applied with `bun run db:migrate` |

**Using PG in local development:**

```bash
docker compose up -d
# in apps/web/.env.local, or exported when driving prisma by hand:
# Runtime pooled queries via PgBouncer:
export DATABASE_URL="postgres://wind:wind@localhost:6432/wind"
# Direct database URL for Prisma migrations and DDL:
export DIRECT_DATABASE_URL="postgres://wind:wind@localhost:5434/wind"
# In local dev without PgBouncer, DATABASE_URL may also target port 5434 directly.
bun run dev          # applies pending migrations, seeds the catalogues, then starts Next + worker + ws server
```

**PgBouncer & Connection Pooling:**
In production and multi-replica topologies, runtime queries connect to PgBouncer (`DATABASE_URL`, port `6432`) running in `transaction` pooling mode. Prisma DDL operations and schema migrations (`bun run db:migrate`) connect directly to PostgreSQL via `DIRECT_DATABASE_URL` (`port 5434` or cloud direct endpoint). Raw database drivers (`@wind/db/raw`) enforce an explicit client pool ceiling (`max: 10`) to prevent connection starvation.

**Multi-Replica Event Bus & Worker Queues:**

- **Fail-Fast Redis Bus:** In production (`NODE_ENV=production`), `REDIS_URL` is mandatory. The event bridge (`@wind/events`) fails fast on boot if Redis is unreachable, preventing split-brain in-memory fallbacks across web, worker, and websocket nodes.
- **Worker Queues:** Background workers (`apps/worker`) consume all registered pipeline queues by setting `WORKER_QUEUES=all`, or selective comma-separated queue names. All job execution logic is centralized in `@wind/engine/pipeline`.

Source: `docker-compose.yml`, the `db:*` tasks of `@wind/db` (driven by `turbo run db:migrate` / `db:seed`)

**Reference data:** the catalogues (style categories, styles, story templates, voices, prompt presets,
pricing tiers) live in the database and are seeded from the versioned files in `packages/db/src/seeds/` —
`bun run db:seed` for everything a fresh database needs, `bun run db:seed:catalogs` for the catalogues
alone, `bun run db:seed:demo` for the demo account alone, or `bun run db:seed <name>` for a single seeder
(`styles`, `voices`, …). All of it runs through one entry point, `packages/db/src/seeds/seed-run.ts`, and is
idempotent, so re-running it after a catalogue changes is the normal way to apply the change.

**Tests:** the suite runs against a real Postgres too. `apps/web/tests/global-setup.ts` drops and recreates the
test database on every run, then applies `packages/db/prisma/migrations`. It uses `DATABASE_URL_TEST` when set, and
otherwise derives it from `DATABASE_URL` by appending `_test` to the database name — so a careless run
can never touch development data.

## 6. Object storage (Standardized 3-Tier CAS Taxonomy)

Every artifact the pipeline produces — composed video, exports, TTS audio, covers, cutouts, fetched
assets — lives in an S3-compatible bucket (MinIO, AWS S3, or Cloudflare R2). There is no local-disk mode to fall back to, and no
`STORAGE_DRIVER` to choose one: `packages/env` refuses to boot without the four values.

```bash
S3_ENDPOINT=http://127.0.0.1:9000       # required
S3_BUCKET=wind-comic                    # required
S3_ACCESS_KEY_ID=wind                   # required
S3_SECRET_ACCESS_KEY=windwind           # required
S3_REGION=us-east-1                     # optional, defaults to us-east-1
```

Those defaults are the MinIO in `docker-compose.yml`, so a local checkout needs nothing else.

**Standardized 3-Tier Storage Taxonomy:**
Storage is strictly partitioned into three operational tiers that mirror domain entity lifecycles:

1. **Tier 1: Ephemeral Scratch (`scratch/` prefix):** Stores intermediate generation artifacts, individual shot renders, alpha mattes, voiceover stems, and unstitched video chunks. Subject to a strict **24-hour Auto-TTL** lifecycle rule configured on the bucket (`mc ilm rule add --expire-days 1 --prefix 'scratch/' local/wind-comic`). Intermediate scratch blobs are also purged during Saga rollbacks and final video consolidation.
2. **Tier 2: Permanent Library (`vault/` prefix):** Stores immutable reusable assets, Character Aggregate Root DNA embeddings, LoRA adapter weights, licensed audio stems, reference face vectors, and verified voice biometric profiles. Managed under indefinite permanent retention.
3. **Tier 3: Production Deliverables (`releases/` prefix):** Stores finalized client-deliverable artifacts (`final.mp4`), master timelines, high-resolution transcodes (720p, 1080p, 4K), EDL/AAF interchange archives for NLE suites, and final localized poster art. Retained under production release policies; never touched by ephemeral TTL sweeps.

**Keys.** Deterministic Content-Addressable Storage (CAS) addressing: `<tier>/<scope>/<sha256>.<ext>` or `<tier>/<sha256>.<ext>`, e.g. `scratch/<projectId>/<64 hex>.mp4`, `vault/characters/<64 hex>.safetensors`, or `releases/<projectId>/<64 hex>.mp4`. The tier carries the retention policy, the scope carries the authorization, and the SHA-256 digest makes every object immutable, deduplicated, and cryptographically verifiable. The one URL form is `/api/serve-file?key=<key>`; nothing else is produced or accepted.

**Reads.** `/api/serve-file` checks the session, then ownership, then issues a `302` to a presigned URL valid for 300s. The bytes never pass through the application, and `Range` is answered by the bucket — which is why seeking in a two-hour export costs the app nothing.

**Writes.** Streaming, multipart above 8 MiB, with per-part retry and `AbortMultipartUpload` on exhaustion. A failed upload throws: it does not return an alternative URL. There is no fallback to local disk.

**Retention & Lifecycle Automation.**

- `scratch/`: Automatic 24-hour TTL (`--expire-days 1`).
- `vault/`: Retained indefinitely.
- `releases/`: Retained indefinitely.
- The nightly maintenance job (`maintenance.cleanup-media` at 04:30 daily) removes orphan CAS objects across all 3 tiers that have no database foreign reference.

**The bucket is private.** The init container enforces private bucket policy (`mc anonymous set none`). All access is mediated through validated, short-lived presigned URLs.

**SigV4 is hand-written** (no AWS SDK) in both variants: header-signed for the API calls, query-signed for the presigned reads. Path-style, so MinIO and Cloudflare R2 work unchanged.

## 7. What ffmpeg is used for

**How ffmpeg is located:**

- `ffmpeg-static` is preferred (an npm package installed with the project, requiring nothing on the system
  PATH)
- fallback order: `FFMPEG_PATH` env → system PATH (`which ffmpeg`) → ffmpeg-static → `/opt/homebrew/bin/ffmpeg` →
  `/usr/local/bin/ffmpeg` → `/usr/bin/ffmpeg` (`apps/web/services/composer/ffmpeg-bin.ts:28-42`)
- `next.config.ts` already lists `ffmpeg-static` and `fluent-ffmpeg` as `serverExternalPackages` (not
  bundled, so the binary paths stay correct)
- the Docker image additionally runs `apk add ffmpeg` (a system binary as backup)

**What ffmpeg does:**

| Feature                     | Files involved                                                                  | Specific use                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Composing the finished film | `apps/web/services/video-composer.ts`                                           | concatenating shots (concat demuxer), xfade transitions, BGM mixing (`adelay`), subtitle burning (the `subtitles` filter), SVG composition (image2 demuxer + librsvg), fade and intro segment composition |
| Resolution transcoding      | `apps/web/lib/video-transcode.ts` + `apps/web/services/video-export-service.ts` | 720p/1080p/2160p transcoding for the export route, uploaded to `releases/<projectId>/`                                                                                                                    |
| Final-frame extraction      | `apps/web/lib/last-frame-extractor.ts`                                          | ffprobe for the duration + seek to the last frame and extract a JPEG (used for shot quality scoring)                                                                                                      |
| Frame brightness analysis   | `apps/web/lib/last-frame-extractor.ts`                                          | the `signalstats` filter reading YAVG/YDEV for image-quality QC                                                                                                                                           |
| Silence detection / rhythm  | `apps/web/lib/beat-detect.ts`                                                   | the `silencedetect` filter extracting beat points from the BGM                                                                                                                                            |
| Generating silent segments  | `apps/web/lib/audio-silence.ts`                                                 | `anullsrc` generating a zero-signal MP3 (padding before and after TTS)                                                                                                                                    |
| Mock video generation       | `apps/web/app/api/mock-assets/[...path]/route.ts`                               | a `lavfi` solid-colour clip + a sine audio track (used by the demo when MOCK_ENGINES=1)                                                                                                                   |
| Video probing               | `apps/web/services/video-composer.ts`                                           | `ffprobe` to get the video duration                                                                                                                                                                       |

## 8. Ephemeral execution scratch and data layout

The application is completely stateless: there are no persistent media directories on local disk and no Docker volumes required for media storage. All persistent media, library assets, and final deliverables live exclusively in the 3-tier Content-Addressable Object Storage (`scratch/`, `vault/`, `releases/`).

**Temporary execution directories (`os.tmpdir()` only):**

| Purpose                                   | Path                                 | Lifecycle                                            |
| ----------------------------------------- | ------------------------------------ | ---------------------------------------------------- |
| The mock clip cache                       | `os.tmpdir()/qfmj-mock-assets/`      | Ephemeral, dev/mock only                             |
| Storage atomic-write temp buffer          | `<os.tmpdir()>/storage-atomic-<pid>` | Deleted immediately after CAS upload                 |
| FFmpeg intermediate frames / concat lists | Subdirectories of `os.tmpdir()`      | Purged immediately when composer operation completes |
| Transcode scratch buffer                  | Subdirectories of `os.tmpdir()`      | Uploaded to Tier 3 `releases/` and removed           |

Nothing in `os.tmpdir()` survives process restart or is addressable over HTTP. Local disk is strictly an ephemeral scratchpad for active FFmpeg processes.

## 9. Ports

| Scenario                          | Port                                | Source                                                            |
| --------------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| Local development, `bun run dev`  | 3000 (the Next.js default)          | `apps/web/lib/mock-providers.ts:25`: `process.env.PORT \|\| 3000` |
| The Docker production container   | 3100 (`PORT=3100 HOSTNAME=0.0.0.0`) | `Dockerfile:48-51`, `EXPOSE 3100`                                 |
| Local PostgreSQL (docker-compose) | 5434 (host) → 5432 (container)      | `docker-compose.yml`                                              |

## 10. Subprocess scripts

**Subprocess scripts called at runtime (production paths):**

| Script                                          | Caller                                                                                                                                                                                                         | How it's invoked                                                | Purpose                                                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/scripts/llm-call.ts`                  | `apps/web/services/hybrid-orchestrator.ts:791-808`                                                                                                                                                             | `execFile('node', [scriptPath], ...)`, stdin JSON → stdout JSON | Works around Turbopack blocking long fetches by calling the LLM `/chat/completions` from a separate Node process; supports the primary LLM → fallback chain |
| the ffmpeg binary (not under apps/web/scripts/) | `apps/web/services/video-composer.ts`, `apps/web/lib/audio-silence.ts`, `apps/web/lib/beat-detect.ts`, `apps/web/lib/last-frame-extractor.ts`, `apps/web/lib/editor-score.ts`, `apps/web/app/api/mock-assets/` | fluent-ffmpeg / execFile                                        | See section 7                                                                                                                                               |

**Non-production scripts (CI/tooling only):** `apps/web/scripts/capture-*.mjs`, `apps/web/scripts/gen-*.ts`,
`apps/web/scripts/seed-catalogs.ts`, `apps/web/scripts/release.sh`.

**Real-time presence:** Managed by `@wind/ws` (`apps/ws`), a typed WebSocket presence server running on port 1234. It persists nothing and tracks active tab, cursors, and presence, while timeline segment locks are coordinated transactionally via PostgreSQL.

## 11. Health check endpoints and startup order

**Health check endpoints:**

| Endpoint                     | Method | Purpose                                           | Key behaviour                                                                                                                                                    |
| ---------------------------- | ------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/runtime/readiness` | GET    | Media engine readiness (how demo mode is decided) | Reads each provider's `available()` (env keys only, no network); returns `{ engines, demoMode, level, stages, mockEngines }`; no cache, computed live each time  |
| `GET /api/health/providers`  | GET    | Real connectivity probes for the LLM/TTS/gateways | Makes network calls (10s timeout), cached for 60s; probes primary-llm, creative-llm, tts and image-gateway; `?fresh=1` forces a refresh; keys are never returned |
| `GET /` (the home page)      | GET    | What the Docker HEALTHCHECK actually probes       | `HEALTHCHECK CMD wget -qO- http://localhost:3100/` (`Dockerfile:75-76`), 20s start-period, 30s interval, 5s timeout, 3 retries                                   |

**Startup-order caveats:**

1. **instrumentation completes before the first request is handled** (guaranteed by Next.js), but
   `initSentry()` and `loadModelOverridesIntoEnv()` are asynchronous, and if the DB isn't initialized yet
   (the very first run), `loadModelOverridesIntoEnv` silently ignores it (`apps/web/lib/model-overrides.ts:58`).

2. **The schema is never created by the app**: no code path issues DDL. `bun run db:migrate` must
   run before the process starts (`bun run dev` does it for you locally); a container that boots against
   an unmigrated database fails on its first query, not at startup.

3. **The PG driver is lazy**: `PgDriver.pool()` only builds the connection pool on the first query, with a
   clear error on failure (`packages/db/src/raw.ts`). At deploy time you must ensure `DATABASE_URL` is
   correct and PG is reachable, otherwise the error only surfaces at the first DB operation.

4. **The pipeline worker starts at boot, unconditionally** (via instrumentation), and again lazily on the
   first enqueueing request. There is no switch: a generation is always enqueued. After a kill -9 restart,
   pg-boss hands a dead worker's job back only to a process that is asking for work, which is why boot is
   the right moment and not the first request.

5. **The Redis bridge starts lazily**: `ensureRedisBridge()` is triggered by the first `busEmit` or
   `subscribe`, not by an active connection at boot. If you need cross-replica event interchange to be ready
   before the first request, there is currently no warm-up mechanism in the code.

---

# The environment variable matrix

> Secrets belong only in `apps/web/.env.local` or your deployment platform's secret manager — never in the database,
> never in the image, never in logs.
> Model-ID variables can be overridden at runtime by the "model radar" (the `model_overrides` table), and
> the DB override takes precedence over env.

## Module 1: LLM (script / director / polish)

| Variable          | Required/optional | Default                                            | What it does, in one line                                                                         |
| ----------------- | ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY`  | **required**      | —                                                  | The main API key for Google Gemini                                                                |
| `GEMINI_BASE_URL` | optional          | `https://generativelanguage.googleapis.com/v1beta` | Google Gemini base API URL                                                                        |
| `GEMINI_MODEL`    | optional          | `gemini-2.5-flash`                                 | The general LLM model id (planning / validation / QC); overridable by the `model_overrides` table |

**model_overrides table precedence**: at startup (`instrumentation.ts` calling
`loadModelOverridesIntoEnv()`), `apps/web/lib/model-overrides.ts` writes the database's override records back into
`process.env`. The DB override beats the `apps/web/.env.local` default; every model field in `config.ts` is a getter that
reads `process.env` live on each access, so changes take effect without a restart. Overridable keys include
`GEMINI_MODEL` and others.

## Module 2: image generation

| Variable                         | Required/optional | Default                 | What it does, in one line                                                                                      |
| -------------------------------- | ----------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `IMAGE_GATEWAY_API_KEY`          | optional          | —                       | The key for the generic image gateway (apps/web/lib/image-providers/gateway.ts)                                |
| `IMAGE_GATEWAY_BASE_URL`         | optional          | —                       | The image gateway endpoint; without it the `kontext` provider's `available() === false`                        |
| `IMAGE_MODEL`                    | optional          | `flux.1-kontext-pro`    | The image gateway's default model (apps/web/lib/image-providers/gateway.ts)                                    |
| `COMFYUI_URL`                    | optional          | `http://localhost:8188` | The ComfyUI address — a local instance or a RunPod pod proxy URL                                               |
| `COMFYUI_ENABLED`                | optional          | `false`                 | `true` registers ComfyUI as an image provider (`comfyui`)                                                      |
| `COMFYUI_API_KEY`                | optional          | —                       | Bearer token sent to ComfyUI; a RunPod endpoint needs it, a localhost instance does not                        |
| `COMFYUI_GPU_RATE_PER_HOUR`      | optional          | —                       | GPU price per hour; set it and each render reports measured spend, unset and it reports none                   |
| `COMFYUI_GPU_RATE_CURRENCY`      | optional          | `USD`                   | The currency of `COMFYUI_GPU_RATE_PER_HOUR`                                                                    |
| `COMFYUI_TIMEOUT_SEC`            | optional          | `240`                   | How long a render may take before it is abandoned                                                              |
| `COMFYUI_VIDEO_WORKFLOW`         | optional          | —                       | Path to a ComfyUI API-format workflow JSON; without it the `comfyui` video provider is unavailable             |
| `COMFYUI_FLF_WORKFLOW`           | optional          | —                       | Path to a first/last-frame ComfyUI workflow; without it the engine does not declare `supportsLastFrame`        |
| `COMFYUI_IMAGE_WORKFLOW`         | optional          | —                       | Path to the base image workflow; without it the `comfyui` image engine stays out of the roster                 |
| `COMFYUI_IMAGE_REF_WORKFLOW`     | optional          | —                       | Path to the reference-image workflow (1-5 images); declares `supportsRefs` if it uses `%ref1%` or `%char_ref%` |
| `COMFYUI_IMAGE_SKETCH_WORKFLOW`  | optional          | —                       | Path to the sketch workflow; declares `supportsControlImage` only if it uses `%control_image%`                 |
| `COMFYUI_IMAGE_INPAINT_WORKFLOW` | optional          | —                       | Path to interactive inpaint workflow; declares `supportsInpaint` if using `%mask%` and `%image%`               |
| `COMFYUI_TTS_WORKFLOW`           | optional          | —                       | Path to a ComfyUI API-format workflow JSON; without it the `comfyui` TTS provider is unavailable               |
| `IMAGE_PROVIDERS_DIR`            | optional          | —                       | The path of a custom image provider plugin directory (hot-loads .ts/.js files)                                 |

### ComfyUI workflow artifacts: the nodes each one needs

The graphs live in `deployment/comfyui/*.json` and are exported in ComfyUI API format. Swapping a
model means editing the JSON — never TypeScript. Most classes they use are ComfyUI core; the ones
below are **not**, and the artifact that uses them will be refused at queue time (naming the missing
class) on an installation without the pack.

| Node class            | Provided by                                                       | Used by                                      |
| --------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| `UnetLoaderGGUF`      | [ComfyUI-GGUF](https://github.com/city96/ComfyUI-GGUF)            | `wan22-a14b-i2v.json`, `wan22-a14b-flf.json` |
| `ImageBatchMulti`     | [ComfyUI-KJNodes](https://github.com/kijai/ComfyUI-KJNodes)       | `flux2-image-ref.json`                       |
| `MultilingualTTSNode` | [ComfyUI-MultilingualTTS](custom_nodes/ComfyUI-MultilingualTTS)   | `tts.json`                                   |
| `Wav2Lip`             | [ComfyUI_wav2lip](https://github.com/ShmuelRonen/ComfyUI_wav2lip) | `wav2lip.json`                               |

Voice and lip-sync run local models via ComfyUI workflows.

## Module 3: video generation

Video generation is executed via ComfyUI workflows (`COMFYUI_VIDEO_WORKFLOW`, `COMFYUI_FLF_WORKFLOW`).

| Variable              | Required/optional | Default | What it does, in one line                            |
| --------------------- | ----------------- | ------- | ---------------------------------------------------- |
| `VIDEO_PROVIDERS_DIR` | optional          | —       | The path of a custom video provider plugin directory |

## Module 4: TTS (text to speech)

TTS is executed via ComfyUI workflows (`COMFYUI_TTS_WORKFLOW`).

| Variable            | Required/optional | Default | What it does, in one line                          |
| ------------------- | ----------------- | ------- | -------------------------------------------------- |
| `TTS_PROVIDERS_DIR` | optional          | —       | The path of a custom TTS provider plugin directory |

## Module 5: lip sync

| Variable                | Required/optional | Default | What it does, in one line                                                                                |
| ----------------------- | ----------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `LIPSYNC_API_URL`       | optional          | —       | The address of a self-hosted lip-sync service (wav2lip/SadTalker/MuseTalk); enabled only when configured |
| `LIPSYNC_API_KEY`       | optional          | —       | The lip-sync service's bearer auth key (optional)                                                        |
| `LIPSYNC_LOCAL_DISABLE` | optional          | —       | Any non-empty value disables the local 2D lip-sync engine                                                |
| `LIPSYNC_PROVIDER`      | optional          | `auto`  | Forces a specific lip-sync provider (`wav2lip-http`/`local-2d`/`comfyui`/`auto`)                         |
| `LIPSYNC_DISABLED`      | optional          | —       | `1` disables the lip-sync service globally (apps/web/services/lipsync.service.ts)                        |

## Module 6: storage

| Variable               | Required/optional | Default     | What it does, in one line                                                                                                                               |
| ---------------------- | ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `S3_ENDPOINT`          | **required**      | —           | The S3-compatible endpoint URL (path-style; MinIO and R2 both work)                                                                                     |
| `S3_BUCKET`            | **required**      | —           | The bucket name. It must already exist — the app never creates one, because a typo in this value would silently make a second bucket instead of failing |
| `S3_ACCESS_KEY_ID`     | **required**      | —           | The Access Key ID (used for SigV4 signing)                                                                                                              |
| `S3_SECRET_ACCESS_KEY` | **required**      | —           | The Secret Access Key                                                                                                                                   |
| `S3_REGION`            | optional          | `us-east-1` | The S3 region (`us-east-1` is fine for MinIO)                                                                                                           |

## Module 7: database

| Variable            | Required/optional | Default                  | What it does, in one line                                                                                                                                              |
| ------------------- | ----------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`      | **required**      | —                        | The PostgreSQL connection string; the only database configuration there is. Missing it is a hard runtime error on the first query (and `bun run dev` refuses to start) |
| `DATABASE_URL_TEST` | internal to tests | `DATABASE_URL` + `_test` | The database the vitest suite drops and recreates on every run (`apps/web/tests/global-setup.ts`); never set in production                                             |

## Module 8: queue and event bus

| Variable                   | Required/optional | Default | What it does, in one line                                                                                                                                                                                                           |
| -------------------------- | ----------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REDIS_URL`                | optional          | —       | The Redis connection URL (`redis://` or `rediss://`); once set, the event bus bridges to Redis pub/sub for cross-instance events; without it it degrades to an in-process EventEmitter                                              |
| `PLUGIN_CHAIN_MODE`        | optional          | `off`   | The plugin chain routing mode: `off` (disabled) / `shadow` (asynchronous shadow, never affecting the main path) / `primary` (try the plugin chain first, falling back to the old path on failure); MOCK_ENGINES=1 implies `primary` |
| `PLUGIN_CHAIN_SHADOW_RATE` | optional          | `0.05`  | The shadow mode sample rate (0.0~1.0), controlling how often the API is actually called                                                                                                                                             |

## Module 9: payments (Stripe)

| Variable                         | Required/optional      | Default  | What it does, in one line                                                                                                            |
| -------------------------------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `STRIPE_SECRET_KEY`              | conditionally required | —        | The Stripe backend key (`sk_test_` or `sk_live_`); without it, calling a payment endpoint throws `StripeNotConfiguredError`          |
| `STRIPE_WEBHOOK_SECRET`          | conditionally required | —        | The Stripe webhook signing secret (`whsec_xxx`), used to verify webhook event origin                                                 |
| `STRIPE_PRICE_ID_CREATOR`        | conditionally required | —        | The Stripe Price ID for the Creator subscription (`price_xxx`)                                                                       |
| `STRIPE_PRICE_ID_PRO`            | conditionally required | —        | The Stripe Price ID for the Pro subscription                                                                                         |
| `STRIPE_PRICE_ID_ENTERPRISE`     | conditionally required | —        | The Stripe Price ID for the Enterprise subscription                                                                                  |
| `NEXT_PUBLIC_STRIPE_PORTAL_LINK` | conditionally required | —        | The Stripe Customer Portal link (opened from the frontend billing page to manage a subscription)                                     |
| `BILLING_CURRENCY`               | optional               | `USD`    | The default display currency and the one asked of Stripe; third in the precedence after the user preference and the detected country |
| `MONEY_PROVIDER`                 | optional               | `stripe` | Which implementation answers external money reads; `fake` serves fixed prices in development and refuses to start in production      |

`bun run check:stripe-prices` reads the configured `STRIPE_PRICE_ID_*` and confirms each one exists, is
recurring, and offers a price in every currency the `country_currencies` catalogue promises. It writes
nothing, so it is safe against production keys.

## Module 10: telemetry

| Variable                    | Required/optional | Default | What it does, in one line                                                          |
| --------------------------- | ----------------- | ------- | ---------------------------------------------------------------------------------- |
| `SENTRY_DSN`                | optional          | —       | The Sentry error-tracking DSN (unset degrades silently to console, never throwing) |
| `SENTRY_TRACES_SAMPLE_RATE` | optional          | `0.1`   | The Sentry performance-tracing sample rate (0.0~1.0)                               |
| `NEXT_PUBLIC_APP_VERSION`   | optional          | —       | The application version, injected as the Sentry release identifier                 |

## Module 11: security and authentication

| Variable               | Required/optional                      | Default                   | What it does, in one line                                                                                                                                                                                                                                                                      |
| ---------------------- | -------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`          | **required in production (fail-fast)** | a fixed development value | Signs the Auth.js session cookie. In production `packages/env` refuses to boot without it, refuses fewer than 32 characters, and refuses a value containing a placeholder word — a long placeholder passes a length check and is still publicly known. Generate with `openssl rand -base64 32` |
| `BETA_INVITE_REQUIRED` | optional                               | `true`                    | `false`/`0`/`off` turns off the beta invite-code gate (convenient for signing up in development)                                                                                                                                                                                               |

## Module 12: email

| Variable           | Required/optional      | Default                              | What it does, in one line                                        |
| ------------------ | ---------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| `EMAIL_PROVIDER`   | optional               | `resend`                             | The email service: `resend` or `sendgrid`                        |
| `EMAIL_FROM`       | optional               | `Wind Comic <noreply@windcomic.app>` | The sender address                                               |
| `EMAIL_DISABLED`   | optional               | —                                    | `1` disables email sending globally                              |
| `RESEND_API_KEY`   | conditionally required | —                                    | The Resend sending key (needed when `EMAIL_PROVIDER=resend`)     |
| `SENDGRID_API_KEY` | conditionally required | —                                    | The SendGrid sending key (needed when `EMAIL_PROVIDER=sendgrid`) |

## Module 13: runtime / miscellaneous

| Variable               | Required/optional         | Default                          | What it does, in one line                                                                                                    |
| ---------------------- | ------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`             | injected by the framework | `development`                    | The Next.js runtime environment; `production` triggers the JWT fail-fast, secure cookies, disabling style warnings and so on |
| `PORT`                 | optional                  | `3000`                           | The port the app listens on (referenced when the mock provider builds URLs internally)                                       |
| `APP_URL`              | optional                  | —                                | The app's external URL (the mock provider's callback address, taking precedence over concatenating PORT)                     |
| `NEXT_PUBLIC_APP_URL`  | optional                  | `http://localhost:3000`          | The domain for Stripe Checkout success/cancel callbacks; visible to the frontend                                             |
| `NEXT_PUBLIC_APP_HOST` | optional                  | `http://localhost:3000`          | The domain used in the links inside notification emails (apps/web/lib/email-sender.ts)                                       |
| `MOCK_ENGINES`         | optional                  | —                                | `1` uses mock engines globally (no real API calls; for local development and CI); implies `PLUGIN_CHAIN_MODE=primary`        |
| `DEMO_ADMIN`           | optional                  | —                                | `1` makes the seeded demo user an admin (for local debugging)                                                                |
| `SUBTITLE_FONT_FILE`   | optional                  | a list of system font candidates | The absolute path of the subtitle font file used for subtitle burning, taking precedence over the system font scan           |
| `VITEST`               | internal to tests         | —                                | A flag injected by vitest that disables production behaviours such as rate limiting                                          |

## The minimum runnable set (enough to start local dev)

With the following variables configured you can start the full dev service locally (mock engines, no
payments or email):

```bash
# the minimum apps/web/.env.local
DATABASE_URL=postgres://wind:wind@localhost:5434/wind   # docker compose up -d
OPENAI_API_KEY=your_openai_or_proxy_key   # LLM script generation

# optional: skip the invite-code gate
BETA_INVITE_REQUIRED=false

# optional: call no real APIs locally, use mocks for everything
MOCK_ENGINES=1
```

> With AUTH_SECRET unset outside production, sessions are signed with a fixed development value.
> That is deliberate: a per-process random key would sign the developer out on every restart, which
> reads as a bug in whatever they were editing. Production refuses to boot without a real one.

## Must-change in production (set these before deploying)

| Variable                                                            | Reason                                                                                                                           |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`                                                       | Signs the session cookie; production fail-fasts without it, on fewer than 32 characters, or on a placeholder value               |
| `DATABASE_URL`                                                      | The only database there is; point it at a production Postgres and run `bun run db:migrate` before starting                       |
| `OPENAI_API_KEY`                                                    | The LLM must be reachable, otherwise scripts, the director and QC all fail                                                       |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `STRIPE_PRICE_ID_*` | Required to enable subscription payments; without them the payment module is entirely unavailable (free features are unaffected) |
| `NEXT_PUBLIC_APP_URL`                                               | The Stripe Checkout callback domain; getting it wrong means users can't return after paying                                      |
| `REDIS_URL`                                                         | Required for cross-instance event interchange when scaling horizontally; a single instance can go without                        |
| `SENTRY_DSN`                                                        | Production error tracking; without it errors only go to console and there is no observability                                    |
| `RESEND_API_KEY` or `SENDGRID_API_KEY`                              | User invite and notification emails must be able to go out                                                                       |
| `S3_*` (all four)                                                   | Every artifact lives in object storage; there is no disk fallback, and the process refuses to boot without them                  |

## Notes on the matrix inventory

1. There is no JWT anywhere any more. Sessions are Auth.js records in the database, signed with
   `AUTH_SECRET` (`packages/auth/src/config.ts`). `JWT_SECRET` and its public built-in fallback are gone
   from the code, from `packages/env` and therefore from `.env.example` — if it is still set anywhere in
   your deployment, delete it: it protects nothing and reads as though it does.

2. There is no database choice to make: `getDbDriver()` in packages/db/src/raw.ts always returns the Postgres
   driver, and `DATABASE_URL` is the only knob. `DB_DRIVER` was the old dual-driver switch and no longer
   does anything — if it is still set anywhere in your deployment, delete it.

3. The `model_overrides` table (in the DB) takes precedence over the .env file:
   `loadModelOverridesIntoEnv()` writes back into process.env when instrumentation.ts starts, so even if
   `GEMINI_MODEL` is set in .env, a matching row in the DB table overrides it — worth remembering when
   debugging.

4. Since v12.325 the image gateway (the `kontext` provider) uses its own `IMAGE_GATEWAY_API_KEY` +
   `IMAGE_GATEWAY_BASE_URL` and has no default host: with no base configured, `available() === false`.

5. ComfyUI workflows define active capabilities directly in their JSON definitions.

6. A plugin switch must be set together with its corresponding keys (the code uses `&&`); setting the switch alone does nothing.

7. The worker is its own process (`apps/worker`, Dockerfile target `worker`). In development it runs
   inside the Next.js server instead, guarded on `NODE_ENV`. If you deploy the web image alone,
   **nothing consumes the queue** — jobs accumulate and no generation ever finishes.

8. With `REDIS_URL` missing, the event bus degrades silently to an in-process EventEmitter, so in a
   multi-instance deployment comment notifications and pipeline progress events do not travel between
   instances at all — and the application never errors, which makes it easy to miss.

9. `APP_URL` (without the NEXT*PUBLIC* prefix) and `NEXT_PUBLIC_APP_URL` are two different variables: the
   former is used when the mock provider builds URLs internally, the latter for the Stripe callback. In a
   production deployment both should usually be set to the same domain.
