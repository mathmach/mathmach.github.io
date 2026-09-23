# 🛡️ Engineering Quality Invariants & Quality Ratchets

This document codifies the mandatory quality standards, automated ratchets, and architectural invariants governing this repository. Every human contributor and AI agent must adhere strictly to these rules on every commit.

---

## 1. Fundamental Repository Principles

1. **Zero Comments in Code:**
   - Writing comments in source code is strictly prohibited (`//`, `/* */`, JSDoc block descriptions, or `// TODO`).
   - Clean, production-grade code expresses intent through expressive domain naming, pure single-purpose functions, and strong typing.
   - Conceptual rationale and engineering context belong in **commit messages** and **architectural documentation**, never inline within code.
2. **Git Staging Preservation:**
   - Destructive operations on the Git Index (`git reset`, blind `git add .`, dropping staged files) are prohibited.
3. **Unidirectional Quality Ratchets:**
   - Quality floors only increase; quality ceilings only decrease.
   - If a refactor or test run improves coverage, reduces cognitive complexity, or removes fallback debt, that new metric becomes the permanent floor for all future work.
4. **Strict Layer Boundary Isolation:**
   - Pure domain rules reside at the core with zero dependencies on frameworks, ORMs, transport layers, or external SDKs.
   - Dependencies point strictly inward: Presentation $\to$ Application $\to$ Domain $\leftarrow$ Infrastructure.

---

## 2. Zero Fallback Debt (The Seven Golden Rules)

Silent fallbacks mask latent defects, obscure edge cases, and lead to non-deterministic failure modes in production. The codebase enforces seven strict rules:

1. **No `.catch(value)` in Validation Schemas:**
   - Validation failures must reject immediately with explicit, descriptive error diagnostics. Masking parsing failures with default values is prohibited.
2. **No `safeParse(...).data ?? fallback`:**
   - Every parse failure must be handled explicitly with structured error logging, rejection, or mapped domain exceptions.
3. **No `env.VAR ?? fallback`:**
   - All runtime configuration variables must be declared in a centralized environment schema and validated at application startup.
4. **No Loose `Number(...) || fallback`:**
   - Numeric coercion must verify `Number.isFinite()` and explicitly handle non-numeric inputs.
5. **No Empty `catch` Blocks:**
   - Every exception block must include structured diagnostic logging, translate to a known domain exception, or re-throw.
6. **No `?? fallback` on Contract Fields:**
   - Shared data contracts, API payloads, and message bus schemas must be adhered to without injecting ad-hoc local defaults.
7. **No Loose `process.env` Access:**
   - Access to runtime environment variables is restricted to a centralized, validated environment gateway.

---

## 3. Zero Orphan Surfaces

Dead code and dangling declarations increase cognitive overhead, inflate bundle sizes, and mislead maintainers:

- **No Procedures Without Callers:** Every public procedure or endpoint must have active consumers or be deprecated and pruned.
- **No Test-Only Production Modules:** Modules exported in production packages must not exist solely to satisfy test cases.
- **No Dangling Export Surfaces:** Unreferenced types, unused interface declarations, and dead functions must be systematically eliminated (verified via automated dead-code scanners like Knip).

---

## 4. Structural & Complexity Ceilings

To prevent architectural entropy, the codebase enforces strict upper bounds on complexity:

- **Cognitive Complexity Ceiling ($\le 15$):**
  - No function or method may exceed 15 points of cognitive complexity.
  - Functions approaching this threshold must be decomposed into pure, focused subfunctions.
- **Thin Presentation Controllers ($\le 300\text{ LOC}$):**
  - Delivery layer controllers and route handlers must not exceed 300 lines of code.
  - Controllers act strictly as thin orchestrators: input validation $\to$ authentication/authorization $\to$ delegate to Use Case $\to$ map status response.
- **UI Component Ceiling ($\le 400\text{ LOC}$):**
  - Presentation components must not exceed 400 lines of code. State logic must be extracted into custom hooks, and layout structures decomposed into subcomponents.

---

## 5. Concurrency & Concurrency Control

- **Optimistic Concurrency Control (OCC):**
  - Collaborative, autosaved, or multi-actor aggregates must enforce version tokens (`expectedVersion` or timestamp) in mutation queries (`WHERE id = ? AND version = ?`).
  - Blind overwrites without version validation are prohibited.
- **Two-Phase Hold & Settle Pattern:**
  - Long-running asynchronous operations must not hold open database transactions or connection locks while waiting on external services.
  - Operations must execute via atomic reservations (Phase 1: Hold), run asynchronously without database locks, and conclude with atomic settlement or cancellation (Phase 2: Settle/Release).

---

## 6. Database & Storage Hygiene

- **Zero N+1 Queries:**
  - Executing database queries inside iteration loops (`.map()`, `for...of`, or nested async iterations) is prohibited.
  - Collections must be retrieved using batch loaders (e.g., DataLoader) or single relational queries.
- **Deterministic Cursor Pagination:**
  - Endpoints returning collections must enforce cursor-based pagination with a strict ceiling (`limit <= 50`). Deep offset pagination (`OFFSET > 100`) is prohibited.
- **Three-Tier Object Storage Discipline:**
  - Intermediate scratch files, diffusion frames, or temporary chunks must be quarantined to an ephemeral tier (`scratch/`) governed by automated 24-hour TTL.
  - Master deliverables and permanent assets reside in permanent storage tiers (`vault/`, `releases/`) managed via Content-Addressable Storage (CAS) naming (`<tier>/<scope>/<sha256>.<ext>`).

---

## 7. Pre-Commit Quality Verification Checklist

Before declaring any task or implementation complete, verify all quality gates:

```bash
# 1. Typecheck: Zero compilation errors across all modules
npm run typecheck

# 2. Linter & Complexity: Zero errors, all functions <= 15 cognitive complexity
npm run lint

# 3. Dead Code & Orphan Surfaces: Zero unused exports or dead surfaces
npm run check:orphan-surfaces

# 4. Fallback Debt: Zero silent fallback debt across all golden rules
npm run check:fallback-debt

# 5. Automated Tests: 100% passing test suite with ratchet coverage floor
npm test
```

---

## 8. Zero Knowledge Duplication (DRY Principle)

> *"Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."* — Andrew Hunt & David Thomas, *The Pragmatic Programmer* (1999)

Code duplication is the single most pervasive vector for **inconsistency faults** (Avizienis et al., 2004). When a domain rule, algorithm, or data transformation exists in $n$ identical copies, a corrective change applied to fewer than $n$ sites produces a **divergence fault** — a latent defect whose activation probability approaches certainty as system evolution continues. Empirical clone-detection research (Roy, Cordy & Koschke, 2009; Kamiya et al., 2002) demonstrates that duplicated fragments account for 5–20% of large codebases and are responsible for a disproportionate share of regression defects.

### 8.1 Theoretical Foundation

The DRY principle is grounded in **information-theoretic redundancy minimization** and Myers' coupling taxonomy:

- **Single Point of Truth (SPOT):** Every discrete piece of domain knowledge — a business rule, a validation constraint, a transformation formula, a configuration schema — must be defined exactly once. All consumers reference that canonical definition.
- **Coupling Amplification:** Duplicated logic creates **content coupling** (Myers, 1978) — the strongest and most harmful form of inter-module dependency. A change to the duplicated knowledge requires coordinated modifications across all copies, violating the **Open/Closed Principle** and increasing the system's **Instability metric** ($I = C_e / (C_a + C_e)$, Martin 1995).
- **Entropy Accumulation:** Each duplication site increases the system's **configuration entropy** — the number of independent locations where a single logical fact can diverge. The probability of at least one divergence after $k$ independent maintenance events across $n$ copies is:

$$P(\text{divergence}) = 1 - \left(\frac{1}{n}\right)^{k-1}$$

This converges to $1.0$ rapidly, making duplication an inevitable source of defects over time.

### 8.2 Architectural Mandate

1. **Domain Rules:** Business invariants, validation predicates, and calculation formulas must exist in exactly one domain module. Presentation layers, API schemas, and persistence mappers reference the canonical source — never redefine it.
2. **Data Transformation Pipelines:** Mapping logic between layers (DTO $\leftrightarrow$ Entity, Entity $\leftrightarrow$ ViewModel) must be centralized in dedicated mapper functions or adapter classes. Inline ad-hoc transformations duplicated across controllers or resolvers are prohibited.
3. **Configuration & Constants:** Magic numbers, string literals, regex patterns, and threshold values must reside in typed constant modules or validated environment schemas. Scattering identical literals across files is prohibited.
4. **Type Definitions & Contracts:** Shared data shapes (API contracts, event schemas, message payloads) must be defined once in a shared contract package. Consumer-side redefinitions or manual interface mirroring are prohibited.

### 8.3 Quantitative Thresholds

| Metric | Ceiling | Tool (multi-language) |
| :--- | :--- | :--- |
| **Type-1 Clones (exact textual)** | $0$ | jscpd (JS/TS/Python/C#), PMD CPD (Java/Kotlin/C#), Simian (multi-lang) |
| **Type-2 Clones (renamed identifiers)** | $0$ | jscpd (`--min-tokens 50`), PMD CPD, SonarQube |
| **Type-3 Clones (gapped / near-miss)** | $\le 2\%$ of total LOC | SonarQube, NiCad (multi-lang) |
| **Duplicated constant literals** | $0$ | Biome/ESLint (JS/TS), Roslyn Analyzers (C#), detekt (Kotlin), Ruff/Pylint (Python) |
| **Cross-package type redefinitions** | $0$ | Manual review, Knip (JS/TS), ArchUnit (Java/Kotlin), NDepend (C#) |

### 8.4 Strict Anti-Patterns

- **Copy-Paste Reuse:** Duplicating a function body across modules instead of extracting to a shared utility with explicit import. This is the primary vector for divergence faults.
- **Parallel Hierarchies:** Maintaining isomorphic class trees (e.g., `UserDTO`, `UserResponse`, `UserViewModel`) where each class redefines the same field set with trivial variations. Consolidate via mapped types, generics, or shared base contracts.
- **Shotgun Constants:** Embedding the same magic number, regex pattern, or configuration string across multiple files. A single correction site missed produces silent behavioral inconsistency.
- **Schema Echo:** Manually redefining API response shapes, database column types, or event payload structures in consumer code instead of importing from the authoritative contract definition.
- **Test Fixture Sprawl:** Duplicating complex object construction logic across test files instead of centralizing in shared fixture factories or builder utilities.

### 8.5 Canonical Remediation Strategies

| Duplication Pattern | Remediation |
| :--- | :--- |
| Identical function bodies | Extract to shared module; import at all call sites |
| Isomorphic type definitions | Single source contract + mapped/derived types |
| Repeated validation predicates | Domain predicate function; reference from all layers |
| Scattered literal constants | Typed constant module or validated env schema |
| Duplicated test object construction | Builder pattern or shared fixture factory |
| Cross-layer mapping logic | Dedicated mapper/adapter with single ownership |
