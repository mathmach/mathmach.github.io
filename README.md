# 🏛️ Matheus Machado Guerzoni Duarte — Systems Architecture & Virtual Resume

> **Live Website & Interactive Portal:** [https://mathmach.github.io](https://mathmach.github.io)  
> **Contact:** [matheusmgduarte@outlook.com](mailto:matheusmgduarte@outlook.com) | [GitHub](https://github.com/mathmach)

---

## 🚀 Overview

This repository hosts the personal portfolio, virtual executive resume, and architectural knowledge base of **Matheus Machado Guerzoni Duarte** (Principal Systems Architect & AI Engineering Specialist).

The platform serves two primary functions:
1. **Virtual Executive Resume & Portfolio:** Showcasing an engineering model grounded in classical computer science, distributed systems resilience, and deterministic AI orchestration.
2. **Interactive Architectural Handbook & Verification Engine:** An exhaustive reference manual for Clean Architecture, SOLID principles, GoF patterns, distributed transactions, systems engineering lifecycles (ISO/IEC/IEEE 15288), and computational complexity limits.

---

## 🎯 The Core Philosophy: Determinism & Anti-Hallucination

Modern AI code generation models frequently introduce **hallucination debt**: synthetic URLs, phantom API methods, unverified package versions, and silent error masks (`.catch(() => fallback)`).

This repository demonstrates how to enforce **100% Grounded AI Engineering**:
- **AST & Symbol Grounding:** Inspecting live code syntax trees (`ck-signatures`) before writing code.
- **Automated Empirical Verification:** Deterministic verification scripts (e.g., [`scripts/verify-references.py`](scripts/verify-references.py)) querying live Crossref REST APIs and HTTP DOMs.
- **Zero Fallback Debt Invariant:** Elimination of silent fallback masks; strict boundary validation (Zod, Pydantic, schema contracts).
- **Anti-Wave Protocol:** Delivering complete, exhaustive refactorings in a single turn without partial leftovers.

---

## 📚 Architectural Knowledge Base (`docs/`)

Explore the peer-reviewed engineering specifications directly in the [interactive viewer](https://mathmach.github.io/#docs) or via markdown:

### 🏛️ Software Architecture (`docs/architecture/`)
- **[SOLID Design Principles](docs/architecture/solid-design-principles.md):** Formal mathematical definitions of SRP, OCP, LSP, ISP, and DIP.
- **[GoF Design Patterns](docs/architecture/gof-design-patterns.md):** Complete catalog of 23 classic GoF patterns with canonical architectures and anti-patterns.
- **[Clean Architecture & DDD](docs/architecture/clean-architecture-and-ddd.md):** Concentric layer boundaries, Pure Domain isolation, and Branded Types.
- **[Hexagonal Ports & Adapters](docs/architecture/hexagonal-ports-and-adapters.md):** Inbound/Outbound driver-driven ports, Thin Controllers ($\le 300$ LOC), and isolated testability.
- **[Distributed Systems Theory](docs/architecture/distributed-systems-theory.md):** CAP, PACELC, FLP Impossibility (1985), Lamport Clocks (1978), and the End-to-End Principle (1984).
- **[Distributed Resilience Patterns](docs/architecture/distributed-resilience-patterns.md):** Compensating Sagas, Transactional Outbox, Circuit Breakers, and Idempotency Ledgers.
- **[Database Internals & Transactions](docs/architecture/database-internals-and-transaction-theory.md):** B+ Tree vs. LSM storage engines, ARIES WAL recovery, and ANSI SQL isolation anomalies.
- **[Engineering Quality Invariants](docs/architecture/engineering-quality-and-invariants.md):** Zero Fallback Debt (7 golden rules), Zero Orphan Surfaces, Cognitive Complexity Ceilings ($\le 15$), and Coverage Floor Ratchets.

### 🔬 Scientific & Systems Foundations (`docs/foundation/`)
- **[Systems Engineering & Dependability](docs/foundation/systems-engineering-and-dependability.md):** ISO/IEC/IEEE 15288:2023, Boehm V&V formalism (1981), Pugh Selection Matrix, and Avizienis taxonomy.
- **[Computational Complexity & Performance](docs/foundation/computational-complexity-and-performance.md):** Landau Big-O notation (Knuth 1976), Little's Law ($L = \lambda W$), Universal Scalability Law (Gunther USL), and CPU Cache locality.
- **[Design Science Research (DSR)](docs/foundation/academic-methodology-dsr.md):** Peffers 6-stage model (2007) and Hevner 7 guidelines (2004) for software engineering research artifacts.

---

## 🛠️ Verification Engine: Automated Citation Audit

All 30 academic references and standards in this repository are verified against official catalog registries via Python:

```bash
# Run the automated verification script
python3 scripts/verify-references.py
```

The script performs:
1. **Live Crossref API Validation:** Queries `api.crossref.org/works/{doi}` for official DOIs (ACM, IEEE, Informs, Springer, arXiv), validating metadata, title, and author matches.
2. **HTTP DOM Inspection:** Verifies live HTML title and body content for open-access standards and seminal books (Archive.org, Wikipedia, ISO standards).
3. **Audit Results:** Returns 100% PASS with zero speculation and zero broken links.

---

## 💻 Local Development & Preview

To preview the website locally:

```bash
# Start a local static HTTP server
python3 -m http.server 8080

# Open in browser:
# http://localhost:8080
```

---

## 📄 License & Attribution

© 2026 Matheus Machado Guerzoni Duarte. Released under the MIT License.
