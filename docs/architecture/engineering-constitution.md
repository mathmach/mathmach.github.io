# Essential Architecture Rules, GoF Patterns, and Code Quality

> **Status:** Canonical and Mandatory  
> **Scope:** Entire repository (`apps/*`, `packages/*`, `scripts/*`)  
> **Adherence:** All human contributors and AI agents must strictly comply with these guidelines.

---

## 1. Fundamental Repository Principles

1. **Zero Comments in Code:** Forbidden to add comments (`//`, `/* */`, JSDoc, ignore annotations, or TODOs) to code files. Explanations belong in the commit message and architectural documentation. Readable code expresses intent through descriptive naming and atomic functions.
2. **Git Staging Preservation:** Never run destructive operations on the Git Index (`git reset`, arbitrary `git add` without preparation, discarding staged files).
3. **Unidirectional Ratchets:** Quality rules never relax; ceilings only go down and coverage floors only go up. If a test or refactoring improves a metric, the new level becomes the official floor in the same commit.
4. **Clean Architecture & Framework Decoupling:** Absolute respect for monorepo stratification and framework decoupling. User applications (`apps/*`, including `apps/web`) are external delivery mechanisms and presentation layers (BFF + UI); they are never the center of the domain. Pure business rules reside in `@wind/domain` (Entities, Aggregates, Value Objects, Domain Events, Domain Exceptions, Port Interfaces) with ZERO dependencies on Next.js, React, or Prisma. Application workflows reside in `@wind/engine` (Use Cases, Sagas, Domain Services). Packages (`packages/*`) never depend on applications (`apps/*`), and applications never depend on sibling applications.

---

## 2. Mandatory GoF Design Patterns

Every new feature or refactoring in Wind Comic must adopt the GoF design patterns corresponding to its domain:

### 2.1 Creational Patterns

| Pattern              | Application Rule in Wind Comic                                                                                                                  | Strict Prohibition                                                                                                                             |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **Factory Method**   | Instantiation of AI engines (`image-providers`, `video-providers`, `tts-providers`) must occur via a centralized Factory/Registry.              | Direct calls to third-party SDKs or unapproved API clients within oRPC routes or React pages are strictly prohibited.                          |
| **Abstract Factory** | Creation of engine families by tier/style level (Draft Family vs. Cinematic 4K Family) ensuring visual and technical coherence across models.   | Coupling incompatible engines at runtime without prior pipeline compatibility verification is strictly prohibited.                             |
| **Builder**          | Complex FFmpeg processing commands, media concatenation, and series shot plans must be assembled via fluent and immutable Builder objects.      | Building shell/terminal commands via manual string concatenation (`"ffmpeg -i " + file`) is strictly prohibited.                               |
| **Prototype**        | Project cloning, script template branching, and scene duplication must use deep cloning with atomic ID reassignment.                            | Copying relational database entities via destructuring reads and unconstrained inserts without transactional integrity is strictly prohibited. |
| **Singleton**        | Heavy infrastructure connections (Prisma Client, Redis/BullMQ, WebSocket Server) must be single instances managed safely against hot-reloading. | Instantiating ad-hoc database pools or queue clients inside utility functions or handlers is strictly prohibited.                              |

### 2.2 Structural Patterns

| Pattern       | Application Rule in Wind Comic                                                                                                                                                                                                                                  | Strict Prohibition                                                                                                                               |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Adapter**   | Integrations with external publishing platforms (TikTok, YouTube Shorts, Instagram Reels, CapCut) must implement the `PublishAdapter` interface.                                                                                                                | Leaking authentication quirks, specific endpoints, or proprietary social network formats into the service layer is strictly prohibited.          |
| **Facade**    | Specialist AI Agents (`DirectorAgent`, `VideoProducerAgent`, `StoryboardRendererAgent`) and orchestrators (`HybridOrchestrator`) must expose cohesive, high-level interfaces to Application Use Cases (`@wind/engine`) and background workers (`@wind/worker`). | Having oRPC routes directly orchestrate hundreds of lines of LLM calls, mathematical computations, and consistency rules is strictly prohibited. |
| **Composite** | Scripts (_Season → Episode → Scene → Shot_) and Timelines (_Timeline → Track → Clip → Keyframe_) must be treated as homogeneous hierarchical trees.                                                                                                             | Manipulating script and media trees via flat arrays detached from their canonical node hierarchy is strictly prohibited.                         |
| **Decorator** | oRPC procedure middlewares must be declaratively composed for authentication, telemetry (`runWithSpan`), quota enforcement, and rate limiting.                                                                                                                  | Repeating manual authentication checks, credit balance verification, or latency tracking in the primary route body is strictly prohibited.       |
| **Proxy**     | Access to file storage and external media must pass through Proxies with SSRF validation, presigned URL cache control, and MIME type verification.                                                                                                              | Arbitrarily consuming external URLs without security whitelist validation and host integrity verification is strictly prohibited.                |
| **Bridge**    | The editing timeline abstraction must be decoupled strictly from its physical rendering implementation (Canvas/Web Audio in UI vs. FFmpeg in backend).                                                                                                          | Coupling timeline data structures to specific DOM drawing methods or FFmpeg arguments is strictly prohibited.                                    |
| **Flyweight** | Style presets, immutable voice catalogs, and shared audio sources must be shared as single instances in memory.                                                                                                                                                 | Duplicating heavy static catalog objects for every rendered shot or scene element is strictly prohibited.                                        |

### 2.3 Behavioral Patterns

| Pattern                     | Application Rule in Wind Comic                                                                                                                                                                                                                                                            | Strict Prohibition                                                                                                                                             |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Strategy**                | Screenplay narrative structuring (`IScriptingStrategy`: `DirectResponseUgcStrategy`, `McKeeThreeActStrategy`, `JournalisticExplainerStrategy`), cutting rhythm algorithms (`editRhythm`), lip-sync, and dynamic credit cost estimation must be implemented as interchangeable strategies. | Hardcoding cut rules, scripting prompts, or costs inside gigantic conditional structures (`if/else` or monolithic `switch` statements) is strictly prohibited. |
| **Observer**                | The asynchronous lifecycle of AI jobs and media generation must be published to the event bus (`@wind/events`) and propagated via WebSocket.                                                                                                                                              | Implementing aggressive polling on the database to synchronize real-time updates is strictly prohibited.                                                       |
| **Chain of Responsibility** | Media compliance checks (Quality Gates) and plugin extension pipelines must execute in ordered, abortable chains.                                                                                                                                                                         | Bundling video compliance inspections (black frames, audio clipping, watermarks) into monolithic, inseparable functions is strictly prohibited.                |
| **Command**                 | Manipulation operations on the Editing Timeline must be encapsulated as Commands with native, bidirectional support for `execute()` and `undo()`.                                                                                                                                         | Direct state mutations on the video timeline that preclude safe user action reversal are strictly prohibited.                                                  |
| **State**                   | The lifecycle of projects, episodes, and renders must be modeled as a formal state machine (`Draft`, `Rendering`, `Review`, `Published`).                                                                                                                                                 | Transitioning states via arbitrary string assignments without pre- and post-condition validation is strictly prohibited.                                       |
| **Memento**                 | Version history and creative snapshot restoration for scripts and timelines must be serialized and versioned via history entities.                                                                                                                                                        | Exposing the internal representation of editing entities to implement autosave and restore features is strictly prohibited.                                    |
| **Template Method**         | The standard AI request dispatch flow (_validation → credit charge → engine call → persistence → audit_) follows an immutable template.                                                                                                                                                   | Having new AI adapters recreate credit accounting and asset persistence flows in their own ad-hoc way is strictly prohibited.                                  |
| **Mediator**                | Coordination among multiple specialist AI agents in the ensemble must be driven by the central pipeline Mediator.                                                                                                                                                                         | Specialist agents making direct, tightly coupled cross-calls to one another without orchestration is strictly prohibited.                                      |
| **Visitor**                 | Exporting scripts and projects to different third-party formats (Jianying/CapCut, SRT, PDF, Final Cut XML) must use the Visitor pattern.                                                                                                                                                  | Bloating script domain models with serialization methods specific to individual external software packages is strictly prohibited.                             |

---

## 3. Distributed Systems, Enterprise Integration & Resilience Patterns

Asynchronous video generation, multi-model AI inference, and financial credit pipelines must adhere to proven enterprise integration and distributed fault-tolerance patterns:

| Pattern                                                      | Application Rule in Wind Comic                                                                                                                                                                                                                                                                                                                                   | Strict Prohibition                                                                                                                                                                                     |
| :----------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transactional Outbox** _(Richardson)_                      | Domain state changes that produce events (`@wind/events`) or dispatch queue jobs (`@wind/queue`) must persist the outbox record inside the same ACID database transaction as the primary entity mutation.                                                                                                                                                        | Emitting WebSocket notifications, publishing to event buses, or enqueuing worker jobs inside an uncommitted database transaction or as an unmonitored post-commit side-effect (the dual-write hazard). |
| **Idempotent Consumer** _(Hohpe & Woolf)_                    | Every background queue worker (`pg-boss`), webhook endpoint (Stripe, external AI providers), and financial mutation must require and verify a deterministic `idempotencyKey` before execution. Shot-level rendering must compute deterministic keys (`hash(prompt, characterDnaId, seed, cameraMove)`) enabling instant cache hits and reentrant crash recovery. | Executing non-idempotent operations (such as credit balance deductions, media asset rendering, or webhook side-effects) without deduplication verification against replayed or retried deliveries.     |
| **Circuit Breaker** _(Nygard)_                               | Outbound integrations with third-party AI model providers (OpenAI, Anthropic, Gemini, Replicate, Fal, ElevenLabs) must be wrapped in Circuit Breakers tracking failure rates with standard states (`Closed`, `Open`, `Half-Open`) and automatic cool-down.                                                                                                       | Repeatedly hammering degraded or unavailable external AI APIs during active outages, causing thread pool exhaustion and cascading system failure.                                                      |
| **Bulkhead** _(Nygard)_                                      | Concurrency pools and execution resources must be strictly partitioned across critical subsystems (e.g., dedicated concurrency limits for fast LLM script generation vs. heavy FFmpeg video rendering vs. user-facing interactive oRPC requests).                                                                                                                | Allowing heavy, slow video transcode jobs or runaway AI generation tasks to starve thread pools, database connections, or queue slots needed by interactive user requests.                             |
| **Saga Orchestrator** _(Garcia-Molina & Salem / Richardson)_ | Multi-stage pipeline execution (_Script → Voiceover → Storyboard → Video Stitching → Quality Gate → Publishing_) must be coordinated as an explicit Saga with registered compensating actions (e.g., credit hold release, unlocking project status, purging ephemeral `scratch/` scratch blobs).                                                                 | Leaving partial pipeline failures in an inconsistent state with deducted credits, orphan scratch files in cloud buckets, or locked project entities when downstream rendering fails.                   |
| **Anti-Corruption Layer (ACL)** _(Evans)_                    | Payloads and proprietary schemas from external AI engines (ComfyUI prompt graphs, Replicate webhook payloads, Fal raw JSON) must be translated into validated internal domain entities at the boundary before reaching core services.                                                                                                                            | Leaking provider-specific JSON response structures, raw SDK types, or third-party naming conventions into core domain services, entities, or database tables.                                          |

---

## 4. Domain-Driven Design & Concurrency Control

### 4.1 Pure Domain Kernel & Architectural Stratification (@wind/domain & @wind/engine)

- **Pure Domain Kernel (`@wind/domain`):** Contains pure domain entities (`Project`, `Episode`, `Shot`, `Character`, `Timeline`), aggregate roots (`CharacterVault`), value objects (`CharacterDna`, `LipSyncData`), domain events, domain exceptions, and port interfaces.
  - **Constitutional Invariant:** Absolutely ZERO dependency on Next.js, React, Prisma, React hooks, HTTP, SQL, or Node/browser-specific runtime frameworks. Standard TypeScript only.
- **Application Business Rules (`@wind/engine`):** Encapsulates Application Use Cases (`CreateProjectUseCase`, `SaveEditingTimelineUseCase`), Sagas (`CreationPipelineSaga`), Domain Services (`PacingAuditService`, `CameoEvaluatorService`), and Pipeline Orchestrator Facades (`HybridOrchestrator`).
  - `@wind/engine` depends exclusively on `@wind/domain` and declared port interfaces. All technical infrastructure (persistence, AI models, storage) is injected via Dependency Inversion. Zero framework code.

### 4.2 Primitive Obsession Elimination (Branded Types)

- Core domain identifiers and metrics (`ProjectId`, `EpisodeId`, `ShotId`, `UserId`, `CreditAmount`, `DurationMs`, `FrameIndex`) must use TypeScript branded types.
- Passing plain primitive `string` or `number` values across service boundaries where distinct domain concepts can be conflated is strictly prohibited.

### 4.3 Pragmatic Repository Pattern for Persistence

- Domain services, orchestrators, and AI agents must interact with storage through the `@wind/db/repos/*` layer.
- Instead of strict interface-driven Dependency Injection via ports, Wind Comic employs a pragmatic functional pattern where repository functions are imported directly into `@wind/engine` Use Cases.
- Direct invocation of raw Prisma queries (`prisma.user.findFirst`, `prisma.$queryRaw`) within `@wind/engine` Use Cases, UI route handlers, presenter functions, or AI Agent decision logic is strictly prohibited. The repository layer (`@wind/db/repos/*`) must always mediate persistence.

### 4.4 Optimistic Concurrency Control (OCC) for Creative Artifacts _(Fowler)_

- Mutation operations on collaborative or autosaved entities (Scripts, Storyboards, Editing Timelines) must enforce version checks (`version` or `updatedAt`) in update queries.
- Blind overwriting of database entities (`prisma.script.update`) without matching the entity's expected version token is strictly prohibited.

### 4.5 Financial Concurrency: Two-Phase Hold & Settle Pattern _(Fowler)_

- For multi-minute asynchronous pipelines, long-lived database locks (`SELECT ... FOR UPDATE`) held across external AI generation calls are strictly prohibited, as they exhaust database connection pools.
- Asynchronous generation must enforce the **Two-Phase Financial Hold & Settle** pattern:
  1. **Phase 1 (Hold Reservation):** Acquire an immediate, atomic hold (`credit_holds` table with status `HELD`) within a < 5ms transaction and release the database connection.
  2. **Asynchronous Execution:** Worker and GPU rendering execute non-blocking without holding database connections or row locks.
  3. **Phase 2 (Settle / Release):** Upon pipeline completion (`COMPLETED`), atomically settle and deduct the hold; upon terminal failure (`FAILED`), cancel the hold with 0 net balance deduction.
- Short-lived synchronous financial balance mutations (e.g., instant wallet top-ups) must acquire row-level locks (`SELECT ... FOR UPDATE`) or atomic database decrements (`WHERE balance >= cost RETURNING balance`). Performing raw read-modify-write without concurrency control is strictly prohibited.

---

## 5. Code Quality & Clean Architecture Guidelines

### 5.1 Routers as Thin BFF Controllers (SRP)

- **Line Count Ceiling per Route:** No oRPC router file may exceed **300 lines of code**.
- **Thin Presentation Controllers:** In Clean Architecture, oRPC routes in `apps/web/server/routers/*` are thin BFF controllers, never domain containers. An oRPC route is exclusively responsible for:
  1. Validating input and output schemas via Zod (`@wind/zod`).
  2. Authenticating the user and authorizing resource ownership (`@wind/auth`).
  3. Delegating business execution directly to an Application Use Case in `@wind/engine`.
  4. Mapping domain exceptions to standardized HTTP/RPC status codes.
- **Strict Route Prohibitions:** Calling Prisma or database repositories directly from route handlers is prohibited. Executing media manipulation (FFmpeg), AI inference, or narrative algorithms directly in route handlers is strictly prohibited.

### 5.2 Frontend & Accessibility (React & Next.js)

- **Mandatory Image Optimization:** Using native `<img />` tags is prohibited. All visual assets must use Next.js `Image` with informative `alt` attributes and intrinsic dimensions to prevent CLS.
- **Semantic Accessibility (WCAG 2.1 AA):**
  - Every interactive clickable element other than `<button>` or `<a>` must declare `role="button"`, `tabIndex={0}`, and a corresponding keyboard handler (`onKeyDown`).
  - 100% of `<label>` elements must be explicitly associated with their respective form control via `htmlFor` or nesting.
  - Video and audio media must declare support for subtitle/caption tracks (`<track>`).
- **Safe React Reconciliation:** Prohibited to use `key={index}` on lists subject to reordering, insertion, or deletion. Use unique immutable identifiers (`id`, `uuid`, `nanoid`).
- **React Component Size Ceiling:** UI components must not exceed **400 lines**. Complex views must extract state logic into custom hooks and decompose JSX trees into pure subcomponents.
- **Mandatory UI Internationalization (i18n):** 100% of user-facing UI text, labels, hints, and error notices must be localized through `@wind/i18n` (`useTranslate()`, `t('key')`). Hardcoding visible literal strings in JSX or maintaining dual static/i18n fields (`label` alongside `labelKey`) in presets is prohibited. Supported locales (`en-US.json`, `pt-BR.json`) must remain fully synchronized.

### 5.3 Cognitive Complexity & Code Cleanliness

- **Cognitive Complexity Ceiling (15):** No function may exceed 15 points of cognitive complexity in Biome. Functions reaching this limit must be refactored into pure subfunctions.
- **Elimination of Unnecessary Conditions:** Adding defensive assertions when TypeScript already strictly guarantees type presence is prohibited.
- **Conscious Array Sorting:** Calling `.sort()` without an explicit comparison function (e.g., `(a, b) => a.order - b.order` or `(a, b) => a.localeCompare(b)`) is prohibited.
- **Pure Iterable Callbacks:** Using `.map()` for side effects is prohibited. If a return value is not produced on all branches, use `.forEach()` or a `for...of` loop instead.

### 5.4 Database & Query Performance Guardrails

- **Zero N+1 Queries & Mandatory Batch Loading:** Executing database queries inside loops (`.map()`, `for...of`, or nested async iterations) is strictly prohibited. Collections must be loaded using batch loaders (`DataLoader`) or single relational join queries.
- **Deterministic Cursor-Based Pagination:** All listing endpoints returning variable-length collections must enforce cursor-based pagination with a hard limit ceiling (`limit <= 50`). Unbounded `findMany()` queries without `take` or deep offset pagination (`skip > 100`) are strictly prohibited.
- **Heavy Column Exclusion in Summaries:** Summary and listing queries (project lists, episode overviews) must explicitly use Prisma `select` to omit heavy JSON/BLOB fields (`storyboardScript`, `keyframeData`, `renderedVectors`).

### 5.5 Background Worker Lifecycle & Telemetry Hygiene

- **Graceful Shutdown & Heartbeat Leasing:** Background workers (`@wind/worker`) must handle `SIGTERM` and `SIGINT` signals, emit periodic heartbeat pings during long-running FFmpeg or AI polling jobs, and persist resumption checkpoints. Abandoning active jobs into zombie states upon container restart is strictly prohibited.
- **Poison Message Isolation & Full-Jitter Backoff:** Retried queue jobs must implement exponential backoff with full randomized jitter. Once retry limits are exhausted, failed jobs must immediately transition to the `DEAD_LETTER_QUEUE` with structured error diagnostics.
- **End-to-End Distributed Tracing:** Every HTTP request, WebSocket transmission, and queue job must propagate an OpenTelemetry `traceId` / `correlationId` (`runWithSpan`) across the entire execution graph (HTTP → DB → Queue → Worker → AI Engine).
- **Zero Secrets & PII in Telemetry:** Emitting API keys, authentication tokens, user email addresses, or unredacted raw prompt payloads containing PII into log sinks, telemetry spans, or error trackers is strictly prohibited.

### 5.6 Three-Tier Object Storage Taxonomy & CAS Reference Model

- Storage must enforce a strict three-tier lifecycle with Content-Addressable Storage (CAS) key discipline (`<tier>/<scope>/<sha256>.<ext>`):
  1. **Tier 1 (Ephemeral / Scratch):** Bucket prefix `scratch/` holds intermediate diffusion frames, alpha mattes, raw audio stems, and concatenation chunks. Enforces a strict 24-hour Auto-TTL lifecycle rule managed by S3/MinIO and is explicitly cleaned by Saga compensations.
  2. **Tier 2 (Permanent Library / Vault):** Bucket prefix `vault/` stores Character Aggregate Root DNA embeddings, LoRA weights, licensed audio, and biometric profiles retained indefinitely.
  3. **Tier 3 (Production Deliverables / Releases):** Bucket prefix `releases/` stores master video outputs (`final.mp4`), multi-resolution transcodes, and NLE interchange archives (AAF/EDL).
- Permitting unmanaged intermediate scratch files to accumulate in permanent storage tiers without automated TTL is strictly prohibited. Zero binary media or vector payloads may be stored inline in database rows.

---

## 6. Fallback Debt and Strict Governance

The seven golden rules monitored by the `check:fallback-debt` script are non-negotiable:

1. **No `.catch(value)` in Zod Schemas:** Validation errors must halt the execution flow with an accurate error message, never be silenced with invisible fallbacks.
2. **No `safeParse(...).data ?? fallback`:** Every parse failure must be explicitly handled with logging or rejection.
3. **No `env.VAR ?? fallback`:** Required configuration values must be declared in `@wind/env` and validated during initialization.
4. **No loose `Number(...) || fallback`:** Numeric coercion must verify `Number.isFinite()` and handle `NaN`.
5. **No Empty `catch` Blocks:** Every exception block must include error handling, contextual logging with correlation ID, or re-throw.
6. **No `?? fallback` on Contract Fields:** Shared contracts and schemas must be adhered to without arbitrary defaults.
7. **No Loose `process.env`:** Environment access is exclusively mediated through the `@wind/env` package.

---

## 7. Verification Checklist for New PRs / Commits

Before completing any task, all quality gates must be validated in sequence:

```bash
bun run typecheck            # 19/19 packages pass
bun run format-and-lint      # 0 Biome errors
bun run lint-repo            # 0 Sherif issues
bun run boundaries           # 0 boundary violations
bun run check:orphan-surface # Within all surface ceilings
bun run check:fallback-debt  # 0 debt across all 7 ceilings
bun run check:catalog-locales# 100% of locale texts synchronized
bun run check:coverage       # Aggregate coverage at or above ratchet floor
turbo run test               # 100% tests passing in monorepo
```
