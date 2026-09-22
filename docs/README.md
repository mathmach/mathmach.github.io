# 🎓 Software Architecture & Academic Foundations Portal (Thesis / PoC)

Welcome to the formal academic foundation and software architecture repository for the **Undergraduate Capstone Project / Thesis** and its computational **Proof of Concept (PoC)**.

> **Project Status:**  
> All documentation has been sanitized to eliminate product false positives or couplings to premature feature sets.  
> **The problem statement, stakeholder needs, and product vision are being formulated from scratch.**  
> This portal preserves exclusively **tool-agnostic software architecture principles**, **formal design patterns**, and the **academic scientific methodology**.

---

## 🏛️ 1. Scientific Foundations & Epistemology (`docs/foundation/`)

- **[Scientific Methodology: Design Science Research (DSR)](foundation/academic-methodology-dsr.md):**  
  The 6-stage process model by Peffers et al. (2007) and the 7 guidelines by Hevner et al. (2004) for designing, implementing, and evaluating computational artifacts in software engineering research.

- **[General Systems Theory & Engineering Pillars](foundation/systems-theory-and-pillars.md):**  
  Systemic foundations by Bertalanffy and Wiener (socio-technical systems, entropy vs. negentropy, cybernetic feedback loops) and the 6 curricular pillars of software systems (ISO 29148 Requirements, Clean Architecture, Distributed Systems, HCI, Governance, and ISO 25010 Quality Model).

---

## 🏗️ 2. Software Architecture & Design Patterns (`docs/architecture/`)

- **[Clean Architecture & Domain-Driven Design (DDD)](architecture/clean-architecture-and-ddd.md):**  
  The unidirectional dependency rule, isolation of the Pure Domain Kernel without framework dependencies, Application Use Cases, and elimination of primitive obsession via nominal *Branded Types*.

- **[GoF Design Patterns Handbook](architecture/gof-design-patterns.md):**  
  Formal catalog of Creational, Structural, and Behavioral patterns (Gamma et al., 1994) applied to modern software architecture, detailing architectural use cases and strict prohibitions.

- **[Distributed Systems & Resilience Patterns](architecture/distributed-resilience-patterns.md):**  
  Saga Orchestration with compensating actions (Garcia-Molina), Transactional Outbox (dual-write prevention), Idempotent Consumer, Circuit Breaker (Nygard), Bulkhead, Two-Phase Resource Reservation (Hold & Settle), and Anti-Corruption Layer (ACL).

- **[Hexagonal Architecture: Ports, Adapters & Contracts](architecture/hexagonal-ports-and-adapters.md):**  
  The Ports and Adapters architectural model (Cockburn), Inbound Primary Adapters (Thin Controllers $\le 300\text{ LOC}$), Outbound Secondary Adapters (Dependency Inversion), and Contract-First multi-protocol API design.

- **[Relational Persistence, CAS Storage & Lifecycles](architecture/persistence-and-cas-storage.md):**  
  Normalized relational data modeling versus the monolithic JSON blob anti-pattern, Content-Addressable Storage (CAS) via cryptographic SHA-256 digests, 3-Tier Storage Lifecycle (`scratch/`, `vault/`, `releases/`), and Optimistic Concurrency Control (OCC).

---

## 🗺️ Documentation Directory Map

```
docs/
├── foundation/
│   ├── academic-methodology-dsr.md       # DSR Methodology (Peffers et al. / Hevner et al.)
│   └── systems-theory-and-pillars.md     # General Systems Theory & 6 Engineering Pillars
├── architecture/
│   ├── clean-architecture-and-ddd.md     # Concentric Layers, Dependency Rules & Branded Types
│   ├── gof-design-patterns.md            # Complete GoF Catalog (Creational, Structural, Behavioral)
│   ├── distributed-resilience-patterns.md# Sagas, Outbox, Circuit Breakers, Idempotency & Hold/Settle
│   ├── hexagonal-ports-and-adapters.md   # Inbound/Outbound Ports, Thin Controllers & Multi-Protocol
│   └── persistence-and-cas-storage.md    # Relational Normalization, CAS SHA-256 & Concurrency (OCC)
└── README.md                             # Master Architecture Portal
```
