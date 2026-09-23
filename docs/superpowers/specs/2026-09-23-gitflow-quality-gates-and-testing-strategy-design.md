# GitFlow, Quality Gates & Automated Testing Strategy Specification

## Executive Summary

This specification establishes a production-grade defense-in-depth quality system for this repository. It integrates pre-commit guardrails, secrets detection, GitFlow branching invariants, automated continuous integration pipelines, an organized multi-tier testing structure, and architectural documentation.

## 1. Architectural Invariants & Requirements

1. **Zero Secret Leakage:**
   - Commit operations must be blocked if unencrypted environment files (`.env`, `.env.local`, etc., excluding `.env.example`) or known secret patterns are staged.
   - All commits in repository history and pull requests must be validated against secrets via Gitleaks with a project-specific `.gitleaks.toml`.

2. **Branching & GitFlow Discipline:**
   - The `main` branch represents deployable production artifacts; direct commits to `main` are restricted in standard workflows.
   - Work proceeds via descriptive branches (`feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`).
   - Every merge request must satisfy automated quality gates through a mandatory Pull Request checklist.

3. **Multi-Tier Testing Trophy & Pyramid:**
   - **Unit Tests (`tests/unit/`):** Pure deterministic domain computations, zero I/O, microsecond execution times.
   - **Integration Tests (`tests/integration/`):** Contract boundaries, i18n key integrity, route/navigation verification, and documentation metadata parity.
   - **End-to-End Strategy (`tests/e2e/`):** Black-box user journeys, browser rendering contracts, and non-functional latency/layout invariants.

4. **Automated Quality Gates:**
   - Local: Husky pre-commit hooks executing `.env` rejection, Gitleaks staged scan, Biome format/lint, and TypeScript typechecking.
   - CI: GitHub Actions workflow (`.github/workflows/ci.yml`) enforcing typechecking, formatting/linting, Gitleaks historical scan, and automated test suite execution on pull requests and pushes to `main`.
   - Continuous Deployment (`.github/workflows/deploy.yml`): Conditioned on green CI status.

5. **Language-Agnostic Architectural Documentation:**
   - `docs/architecture/gitflow-and-branching-strategy.md`: Core principles of branching topologies, PR gates, defense-in-depth quality, and release predictability.
   - `docs/architecture/automated-testing-strategy.md`: Theoretical foundations of testing pyramids, contract boundaries, Meszaros test double taxonomy, and unidirectional coverage ratchets.
   - Multilingual mirroring (`public/docs/{en,pt,es}/...`) and catalog registration in `src/docsData.ts` for the web reader.

## 2. Component Design & Changes

### 2.1 Quality Gates & Tooling Layer

- **`.gitleaks.toml`**: Custom ruleset extending default Gitleaks definitions with project credential patterns and strict allowlists for fixture files, test mock data, and `.env.example`.
- **`biome.json`**: Linter and formatter configuration for TypeScript, TSX, JSON, and CSS.
- **`.husky/pre-commit`**: Shell script orchestrating staged checks:
  1. Staged `.env` file guard.
  2. Gitleaks staged scan (`gitleaks git --staged --no-banner --redact`).
  3. Biome formatting check and auto-formatting (`npx biome check --write`).
  4. Typecheck execution (`npm run typecheck`).
- **`package.json`**:
  - Add `@biomejs/biome` and `husky` to `devDependencies`.
  - Add scripts: `typecheck`, `format-and-lint`, `format-and-lint:fix`, `gitleaks:staged`, `test:unit`, `test:integration`, `prepare`.

### 2.2 Continuous Integration & Collaboration Layer

- **`.github/workflows/ci.yml`**:
  - Triggers on `pull_request` targeting `main`, `push` to `main`, and `workflow_dispatch`.
  - Job `quality-gates`:
    - Checks out full git history (`fetch-depth: 0`).
    - Sets up Node.js runtime and installs dependencies with `npm ci`.
    - Runs `npm run typecheck`.
    - Runs `npm run format-and-lint`.
    - Installs standalone Gitleaks binary and executes repository scan (`gitleaks git --no-banner --redact`).
    - Runs automated test suite (`npm test`).
- **`.github/workflows/deploy.yml`**:
  - Enforces dependency on CI success or consolidates build verification prior to GitHub Pages deployment.
- **`.github/PULL_REQUEST_TEMPLATE.md`**:
  - Structured PR review checklist covering branching format, test passes, type safety, linting, secrets verification, and self-contained commits.

### 2.3 Automated Testing Suites

- Reorganize `tests/`:
  - `tests/unit/experience.test.ts`: Migrated from `tests/domain/experience.test.ts`. Tests career calculations, dynamic year deltas, and basic domain constants.
  - `tests/integration/docsData.test.ts`: Validates completeness and consistency of documentation registries across all supported locales (`en`, `pt`, `es`), ensuring every referenced file exists on disk.
  - `tests/integration/i18n.test.ts`: Validates structural symmetry and translation key parity across English, Portuguese, and Spanish translation dictionaries.
  - `tests/e2e/README.md`: Specifications, guidelines, and contract expectations for end-to-end browser tests.

### 2.4 Architectural Documentation

- **`docs/architecture/gitflow-and-branching-strategy.md`**:
  - Topology: Mainline, Feature Branches, Release Branches, Hotfixes.
  - Invariants: Ephemeral branch lifespans, immutable production branch, linear commit history, mandatory PR reviews.
  - Defense-in-depth: Local pre-commit $\to$ Pull Request CI $\to$ Continuous Delivery gating.
- **`docs/architecture/automated-testing-strategy.md`**:
  - Testing Pyramid vs. Testing Trophy: Unit vs. Integration vs. E2E trade-offs.
  - Test Doubles Taxonomy (Gerard Meszaros): Dummy, Stub, Spy, Mock, Fake. Golden rule: Never mock what you do not own; mock at architectural boundaries.
  - Quality Ratchets: Unidirectional coverage ratchets, TDD regression avoidance, zero tolerance for flaky tests.
- **Multilingual Mirroring & Web Reader Catalog**:
  - Generate copies for `docs/architecture/`, `public/docs/architecture/`, `public/docs/en/`, `public/docs/pt/`, and `public/docs/es/`.
  - Add both documents to `src/docsData.ts` for `en`, `pt`, and `es`.
  - Update `docs/README.md` and root `README.md`.

## 3. Verification Plan

1. Verify Gitleaks configuration with `gitleaks detect --no-banner`.
2. Verify Biome formatting and linting with `npx biome check .`.
3. Verify TypeScript typechecking with `npm run typecheck`.
4. Verify complete automated test suite execution with `npm test`.
5. Verify pre-commit hook execution on staged files.
6. Verify documentation reader rendering and translation consistency in web application build (`npm run build`).

