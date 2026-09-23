# 🌿 GitFlow & Modern Branching Strategy Handbook

## Branching Topologies, Quality Defense-in-Depth & Release Predictability

This document establishes the formal branching architecture, code convergence invariants, and multi-tier quality gates governing software delivery across projects. These principles are strictly language- and framework-agnostic.

---

## 1. Theoretical Topology of Version Control

In distributed version control systems (DVCS), repository history forms a Directed Acyclic Graph (DAG) $G = (V, E)$, where each vertex $v \in V$ represents an immutable commit snapshot, and each directed edge $e = (u, v) \in E$ denotes a parent-child derivation relationship.

```
       (feature/auth)
          C1 ─── C2 ─── C3
         /                \  [PR Gate & Squash Merge]
─── M0 ───────────────────── M1 ───────────────────────── M2 ── (main)
                              \                         /
                               H1 ───────────────────── H2
                                 (hotfix/token-rotation)
```

The fundamental tension in modern source control lies between:
1. **Trunk Velocity:** The frequency at which individual contributions merge into the primary delivery path.
2. **Branch Drift:** The divergence metric measuring the topological and semantic distance between a feature branch and the mainline.

Empirical software engineering research on distributed version control (Brun et al., 2011) demonstrates that collaboration conflicts divide into two distinct categories:
- **Textual Conflicts:** Concurrent edits to overlapping lines or AST regions, intercepted by standard diff algorithms.
- **Higher-Order Semantic Conflicts:** Build and test regressions that occur when textual merges succeed cleanly, but inter-module behavioral assumptions diverge.

Brun et al. (2011) observed that up to 33% of merge events harbor latent semantic or compilation conflicts that traditional VCS tools fail to detect proactively. Furthermore, as branch isolation time increases, unintegrated changes compound, multiplying cognitive resolution overhead.

To eliminate branch divergence while preserving verified correctness before code reaches production, this architecture adapts the canonical GitFlow model (Vincent Driessen, 2010) into **Ephemeral Feature Branching with Hard Gated Convergence**.

---

## 2. The Five GitFlow Invariants

Every engineer and autonomous agent operating within this repository must adhere strictly to these five invariants:

### Invariant 1: Immutable Mainline (Zero Direct Push to Production)
The `main` branch represents deployable, verified production software. Direct pushes (`git push origin main`) are strictly blocked via branch protection rules. All modifications must converge exclusively through reviewed, validated Pull Requests.

### Invariant 2: Ephemeral Branch Lifetimes ($\le 48\text{h}$)
Working branches must be short-lived. No feature branch may accumulate changes over multiple weeks. Long-running initiatives must be decomposed into independent architectural slices protected by Feature Flags or Hexagonal Adapters rather than deferred branches.

Branch nomenclature follows strict taxonomy:
- `feat/<scope>-<description>`: New functional capabilities or use cases.
- `fix/<scope>-<description>`: Defect remediation and bug fixes.
- `refactor/<scope>-<description>`: Internal restructuring preserving observable behavior.
- `chore/<scope>-<description>`: Tooling, dependency, or configuration updates.
- `docs/<scope>-<description>`: Architectural documentation and specifications.

### Invariant 3: Linear & Deterministic History
Commit graphs must remain comprehensible for automated bisecting (`git bisect`) and compliance auditing. Feature branches rebase onto current `main` prior to convergence, followed by squashed or semi-linear merge commits that preserve explicit PR provenance.

### Invariant 4: Hard Quality Gates Before Convergence
Code cannot merge into `main` based solely on subjective peer approval. Automated verification pipelines must execute deterministically in sterile continuous integration (CI) environments and report a 100% passing state across all quality ratchets.

### Invariant 5: Semantic Versioning & Traceable Artifacts
Releases are immutable milestones governed by **Semantic Versioning (SemVer 2.0.0, Tom Preston-Werner)**:

$$\text{Version} = \text{MAJOR}.\text{MINOR}.\text{PATCH}$$

- **MAJOR:** Incompatible API or architectural modifications.
- **MINOR:** Backward-compatible functionality additions.
- **PATCH:** Backward-compatible defect fixes.

Every release artifact maps deterministically to an immutable Git commit hash and signed tag.

---

## 3. Defense-in-Depth: The Three Concentric Quality Rings

Quality engineering requires multi-layered defense. Relying solely on CI introduces latency; relying solely on local developer discretion introduces human fallibility. We organize quality gates into three concentric verification rings:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Ring 3: Deployment Gate                         │
│   (Static Artifact Verification, CAS Integrity, Atomic Release)        │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     Ring 2: CI PR Pipeline                     │   │
│   │   (Clean VM, Gitleaks History, Typecheck, Test Suites)         │   │
│   │                                                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │               Ring 1: Local Pre-Commit Hook            │   │   │
│   │   │   (.env Guard, Staged Gitleaks, Linter, Typecheck)     │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Ring 1: Local Developer Guardrail (Pre-Commit Hook)
- **Execution Vector:** Git hooks managed via `.husky/pre-commit`.
- **Latency Budget:** $< 5$ seconds.
- **Scope:** Staged files only (`git diff --cached`).
- **Gates:**
  1. **`.env` File Block:** Immediately halts commit if any unencrypted environment file (`.env`, `.env.local`, `.env.prod`) is staged (except `.env.example`).
  2. **Staged Secret Scan:** Executes `gitleaks git --staged --no-banner --redact` against the staged patch to intercept leaked keys before they enter local history.
  3. **Staged Linter & Formatter:** Automatically formats and validates staged files (`biome check --write`), staging the fixed changes.
  4. **Compilation & Typecheck:** Verifies static types across the project (`tsc --noEmit`).

### Ring 2: Continuous Integration Gate (GitHub Actions)
- **Execution Vector:** Ephemeral, hardened Ubuntu runner triggered on `pull_request` and `push` to `main`.
- **Isolation:** Sterile environment; zero reliance on local developer cache.
- **Scope:** Full repository workspace and complete Git commit history (`fetch-depth: 0`).
- **Gates:**
  1. **Static Analysis & Type Verification:** Strict compilation without emissions.
  2. **Code Hygiene & Complexity:** Automated linter validation ensuring zero warnings or complexity threshold violations.
  3. **Comprehensive Secret Scanning:** Standalone Gitleaks binary scans the **entire commit history** (`gitleaks git --no-banner --redact`). Committing a secret and deleting it in a subsequent commit remains a critical vulnerability intercepted by this historical gate.
  4. **Automated Test Execution:** Runs Unit and Integration suites with 100% pass mandate.
  5. **Build Verification:** Compiles production bundle to verify asset resolution, bundling trees, and minification.

### Ring 3: Continuous Deployment Gate (Pages / Hosting)
- **Execution Vector:** Automated deployment workflow triggered only upon verified convergence onto `main`.
- **Isolation:** Dedicated deployment environment credentials with least-privilege token permissions (`contents: read`, `pages: write`, `id-token: write`).
- **Invariants:**
  1. Pre-deployment assertion verifying that Ring 2 CI checks passed successfully.
  2. Immutability of deployed build artifacts using content-hashed asset bundles.
  3. Atomic switchover preventing broken intermediate states from reaching end users.

---

## 4. Secret Sanitization & Credential Hygiene

Leaked credentials are irreversible security incidents. Once pushed to a remote repository, a secret must be assumed compromised regardless of whether the commit was subsequently amended or deleted:

```
Commit A: Add API key (LEAK OCCURS)
Commit B: Remove API key
Commit C: Fix styling

Result in git object storage: Commit A remains reachable via commit SHA,
reflogs, packfiles, and forks. The key is permanently exposed.
```

### Credential Discipline
1. **Never commit actual configuration secrets:** All credentials reside in local uncommitted files (`.env.local`) or secure secret managers (e.g. GitHub Secrets, AWS Secrets Manager).
2. **Mandatory Documentation:** Every environment variable consumed by the application must be declared in `.env.example` with clear dummy values and descriptions.
3. **Allowlist Rigor:** Gitleaks allowlists (`.gitleaks.toml`) must be strictly constrained to documentation examples, public fixtures, or test stubs. Blanket folder exclusions (`tests/**`) are prohibited.

---

## 5. Pull Request Standards & Quality Contract

A Pull Request is an engineering review contract between contributors. It must satisfy:

1. **Focused Scope:** PRs should not exceed 400 lines of code. According to cognitive load theory, code review efficacy degrades sharply beyond this threshold, allowing subtle logic flaws to pass unnoticed.
2. **Conventional Commits:** PR titles and commits adhere to standard format:
   ```
   type(scope): concise description in imperative mood
   ```
3. **Mandatory Pull Request Checklist:**
   Every PR must satisfy the repository's `.github/PULL_REQUEST_TEMPLATE.md` checklist verifying tests, types, linting, secrets, and zero leftover debugging code.

