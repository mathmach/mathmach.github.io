# 🏛️ Software Architecture & Systems Engineering Knowledge Base

Live Interactive Portal & Virtual Resume: **[https://mathmach.github.io](https://mathmach.github.io)**  
Maintained by: **Matheus Machado Guerzoni Duarte**

This knowledge base compiles the software architecture, distributed systems resilience, and computer science foundations that Matheus Machado Guerzoni Duarte studies, applies, and evolves throughout his engineering career. Every principle is grounded in seminal literature and validated against official academic DOIs and primary sources.

---

## 🏛️ 1. Scientific Foundations & Epistemology (`docs/foundation/`)

- **[Scientific Methodology: Design Science Research (DSR)](foundation/academic-methodology-dsr.md):**  
  The 6-stage process model by Peffers et al. (2007) and the 7 guidelines by Hevner et al. (2004) for designing, implementing, and evaluating computational artifacts in software engineering research.

- **[General Systems Theory & Engineering Pillars](foundation/systems-theory-and-pillars.md):**  
  Systemic foundations by Bertalanffy and Wiener (socio-technical systems, entropy vs. negentropy, cybernetic feedback loops) and the 6 curricular pillars of software systems (ISO 29148 Requirements, Clean Architecture, Distributed Systems, HCI, Governance, and ISO 25010 Quality Model).

- **[Computational Complexity & Algorithmic Performance](foundation/computational-complexity-and-performance.md):**  
  Landau asymptotic notations ($\mathcal{O}, \Omega, \Theta$), the logarithmic scalability paradigm ($\mathcal{O}(\log n)$), Master Theorem for divide-and-conquer, Little's Law ($L = \lambda W$), Amdahl's Law, Gunther's Universal Scalability Law (USL), and mechanical sympathy (CPU cache lines, memory hierarchy latencies, Data-Oriented Design).

- **[Systems Engineering, Dependability & Lifecycles](foundation/systems-engineering-and-dependability.md):**  
  ISO/IEC/IEEE 15288 technical life cycle processes, INCOSE systems engineering guidelines, Boehm's Verification vs. Validation (V&V), Avizienis's dependability taxonomy (Fault $\to$ Error $\to$ Failure), quantitative availability mathematics ($A = \frac{\text{MTBF}}{\text{MTBF} + \text{MTTR}}$), and Pugh multi-criteria trade-off matrices.

---

## 🏗️ 2. Software Architecture & Design Patterns (`docs/architecture/`)

- **[Clean Architecture & Domain-Driven Design (DDD)](architecture/clean-architecture-and-ddd.md):**  
  The unidirectional dependency rule, isolation of the Pure Domain Kernel without framework dependencies, Application Use Cases, and elimination of primitive obsession via nominal *Branded Types*.

- **[SOLID Design Principles Handbook](architecture/solid-design-principles.md):**  
  The 5 foundational principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) formalizing architectural cohesion, behavioral subtyping, role interfaces, and Inversion of Control (IoC).

- **[GoF Design Patterns Handbook](architecture/gof-design-patterns.md):**  
  Complete catalog of all 23 classic patterns (Gamma et al., 1994) applied to modern software architecture, detailing mandatory architectural use cases and strict prohibitions.

- **[Distributed Systems & Resilience Patterns](architecture/distributed-resilience-patterns.md):**  
  Saga Orchestration with compensating actions (Garcia-Molina), Transactional Outbox (dual-write prevention), Idempotent Consumer, Circuit Breaker (Nygard), Bulkhead, Two-Phase Resource Reservation (Hold & Settle), and Anti-Corruption Layer (ACL).

- **[Theoretical Foundations of Distributed Systems](architecture/distributed-systems-theory.md):**  
  The 8 Fallacies of Distributed Computing (Deutsch/Gosling), Brewer's CAP Theorem & Abadi's PACELC Theorem, Fischer-Lynch-Paterson (FLP) impossibility result, Lamport Logical Timestamps, Vector Clocks for true concurrency detection, and Saltzer's End-to-End Principle.

- **[Hexagonal Architecture: Ports, Adapters & Contracts](architecture/hexagonal-ports-and-adapters.md):**  
  The Ports and Adapters architectural model (Cockburn), Inbound Primary Adapters (Thin Controllers $\le 300\text{ LOC}$), Outbound Secondary Adapters (Dependency Inversion), and Contract-First multi-protocol API design.

- **[Relational Persistence, CAS Storage & Lifecycles](architecture/persistence-and-cas-storage.md):**  
  Normalized relational data modeling versus the monolithic JSON blob anti-pattern, Content-Addressable Storage (CAS) via cryptographic SHA-256 digests, 3-Tier Storage Lifecycle (`scratch/`, `vault/`, `releases/`), and Optimistic Concurrency Control (OCC).

- **[Database Internals, Storage Engines & Transaction Theory](architecture/database-internals-and-transaction-theory.md):**  
  Storage engine internals (B+ Trees vs. LSM-Trees), the RUM Conjecture (Read, Update, Memory trade-off), formal ACID properties, Write-Ahead Logging (WAL) with ARIES recovery, ANSI/Berenson transaction isolation anomaly taxonomy (Write Skew, Phantom Reads), and Codd's Relational Normal Forms (1NF through BCNF).

- **[Observability, Distributed Telemetry & Evidence-Based Decisions](architecture/observability-and-evidence-based-decisions.md):**  
  Full-stack OpenTelemetry instrumentation, W3C Trace Context propagation, Google's 4 Golden Signals, RED and USE methods, Tail-based sampling, quantitative reliability contracts (SLI, SLO & Error Budget depletion policies), automated canary divergence gates, and blameless post-mortems.

- **[Engineering Quality Invariants & Quality Ratchets](architecture/engineering-quality-and-invariants.md):**  
  Mandatory automated code quality standards: Zero Comments in Code, Zero Fallback Debt (7 golden rules), Zero Orphan Surfaces, Cognitive Complexity Ceilings ($\le 15$), and Unidirectional Coverage Floors.

---

## 🗺️ Documentation Directory Map

```
docs/
├── foundation/
│   ├── academic-methodology-dsr.md                 # DSR Methodology (Peffers et al. / Hevner et al.)
│   ├── systems-theory-and-pillars.md               # General Systems Theory & 6 Engineering Pillars
│   ├── computational-complexity-and-performance.md # Big-O, Log N, Little's Law, Amdahl, USL & Cache Locality
│   └── systems-engineering-and-dependability.md    # ISO 15288 Lifecycles, Avizienis Dependability & V&V
├── architecture/
│   ├── clean-architecture-and-ddd.md               # Concentric Layers, Dependency Rules & Branded Types
│   ├── solid-design-principles.md                  # 5 SOLID Principles (SRP, OCP, LSP, ISP, DIP)
│   ├── gof-design-patterns.md                      # 23 GoF Patterns (Creational, Structural, Behavioral)
│   ├── distributed-resilience-patterns.md          # Sagas, Outbox, Circuit Breakers, Idempotency & Hold/Settle
│   ├── distributed-systems-theory.md               # CAP, PACELC, FLP, 8 Fallacies, Vector Clocks & End-to-End
│   ├── hexagonal-ports-and-adapters.md             # Inbound/Outbound Ports, Thin Controllers & Multi-Protocol
│   ├── persistence-and-cas-storage.md              # Relational Normalization, CAS SHA-256 & Concurrency (OCC)
│   ├── database-internals-and-transaction-theory.md# B+Tree vs LSM, RUM Conjecture, Isolation Anomalies & ARIES
│   ├── observability-and-evidence-based-decisions.md # OpenTelemetry, 4 Golden Signals, RED/USE, SLOs & Canary
│   └── engineering-quality-and-invariants.md       # Quality Ratchets, Zero Fallback Debt & Complexity Ceilings
└── README.md                                       # Master Architecture & Scientific Portal
```


