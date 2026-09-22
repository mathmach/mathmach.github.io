# 🎓 Academic Monograph & Architecture Portal (TCC / PoC)

Welcome to the formal architectural and scientific documentation suite for the **Zero-Stitch Finished Video Co-Synthesis Engine** — developed under the **Design Science Research (DSR)** paradigm as a Graduation Thesis (_Trabalho de Conclusão de Curso - TCC_) and computational Proof of Concept (PoC).

---

## 🏛️ 1. Epistemological Foundation, Core Mandate & Requirements (`docs/core/`)

- **[Foundational Constitution & Academic Monograph](core/foundation-constitution.md):**  
  The formal epistemological framework: Design Science Research (DSR; Hevner et al., 2004; Peffers et al., 2007), General Systems Theory (TGS) & cybernetic feedback loops, microeconomic analysis of vertical video ("Cold Water Analysis"), the Stakeholder Triptych, and the 6 Curricular Pillars of Information Systems & Software Engineering.

- **[Core Premises, System Mandate & Agency Formalism](core/core-mandate.md):**  
  The indivisible core contract ("Zero-Stitch Finished Video Engine"), Core vs. Feature Boundary Matrix, formal distinction between **Cognitive Autonomous AI Agents** and **Deterministic Processing Services**, and the 7 Invariable Architectural Principles.

- **[Requirements Specification & Traceability Matrix (ISO/IEC/IEEE 29148)](core/requirements-matrix.md):**  
  Formal engineering requirements specification (`RF-CORE-01` through `RF-CORE-08`), Non-Functional Quality Attributes adhering to ISO/IEC 25010 (`RNF-REL`, `RNF-PERF`, `RNF-MAINT`, `RNF-SEC`), and the bidirectional traceability matrix.

- **[Formal System Models & Architecture Diagrams (UML / DDD)](core/system-models.md):**  
  Formal UML class diagrams (Domain-Driven Design Aggregate Roots & Branded Types), Garcia-Molina Saga distributed transaction sequence diagrams, pipeline Finite State Machine (FSM), and Clean Architecture stratification.

---

## 🏗️ 2. System Architecture & Algorithms (`docs/architecture/`)

- **[The Engineering Constitution & Architecture Rules](architecture/engineering-constitution.md):**  
  The 7 non-negotiable architectural dimensions, mandatory GoF design patterns (Creational, Structural, Behavioral), distributed systems fault-tolerance (Transactional Outbox, Idempotent Consumers, Circuit Breakers, Bulkheads), and zero fallback debt principles.

- **[Pipeline Algorithms & Audio-Visual Pacing Math](architecture/algorithms.md):**  
  Deterministic mathematical heuristics: beat-aligned cutting ($\pm 150\text{ ms}$), oscillatory dramatic emotion curves, dialogue-to-action density thresholds, and automated sidechain audio ducking formulas.

- **[Relational Persistence & CAS Storage Lifecycle](architecture/persistence-and-storage.md):**  
  Eradication of monolithic JSON blobs via normalized relational entities, Content-Addressable Storage (CAS) SHA-256 reference model, 3-Tier Storage Lifecycle (`scratch/`, `vault/`, `releases/`), Optimistic Concurrency Control (OCC), and the Two-Phase Financial Hold pattern.

- **[Contract-First Type-Safe API & Inbound Adapters](architecture/api-contracts.md):**  
  Clean BFF Inbound Primary Adapters, Thin Orchestrators ($\le 300\text{ LOC}$), unified dual-protocol architecture (Type-Safe RPC + OpenAPI 3.1 REST), and declarative cross-cutting middleware pipelines.

- **[Hexagonal Ports, Adapters & Anti-Corruption Layer (ACL)](architecture/ports-and-adapters.md):**  
  Hexagonal Architecture boundary rules, decoupling core domain logic from external multimodal AI engines, declarative `GenerativeWorkflowManifest` specifications, and deterministic provider selection with Nygard Circuit Breakers.

---

## ✍️ 3. Cognitive Narrative Subsystem (`docs/narrative/`)

- **[Cognitive Narrative Engine & Actor-Critic Architecture](narrative/narrative-engine.md):**  
  Dramaturgical architecture: Robert McKee Three-Act progression, Sudowrite Story Bible canonical constraints, per-character Voice Fingerprints, Scene Budgets, and the closed dialectic **Actor-Critic Convergence Loop** (`ScreenwriterAgent` $\leftrightarrow$ `NarrativeCriticAgent`).

---

## 🗺️ Architectural Map

```
docs/
├── core/
│   ├── foundation-constitution.md   # DSR Methodology, Epistemology & Academic Monograph (TCC)
│   ├── core-mandate.md             # Core Mandate, Cognitive vs Deterministic Boundaries
│   ├── requirements-matrix.md      # ISO 29148 Requirements & ISO 25010 Quality Model
│   └── system-models.md            # UML Class Diagrams, Saga Sequence, Pipeline FSM
├── architecture/
│   ├── engineering-constitution.md # 7 Dimensions, GoF Patterns & Distributed Resilience
│   ├── algorithms.md               # Pacing Math, Beat Alignment (+-150ms) & Audio Ducking
│   ├── persistence-and-storage.md  # Normalized Relational Data, CAS & 3-Tier Storage
│   ├── api-contracts.md            # Contract-First Type-Safe API & Thin BFF Orchestrators
│   └── ports-and-adapters.md       # Hexagonal Architecture & Anti-Corruption Layer (ACL)
├── narrative/
│   └── narrative-engine.md         # McKee Structure, Story Bible & Actor-Critic Dialectic
└── README.md                       # Master Architecture Portal
```
