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
