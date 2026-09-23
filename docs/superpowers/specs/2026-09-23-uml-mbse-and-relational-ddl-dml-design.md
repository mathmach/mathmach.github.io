# Model-Based Systems Engineering (UML) and Relational Schema Engineering (DDL/DML) Specification

## 1. Problem Statement & Scope

The portfolio, resume, and technical documentation currently highlight microservices architecture, Clean Architecture, GoF patterns, distributed systems theory, ARIES recovery, and storage engines (B+ Trees vs. LSM-Trees). However, they omit two foundational pillars of rigorous engineering:
1. **Systemic Planning via Diagrammatic Modeling**: Model-Based Systems Engineering (MBSE) principles using OMG UML 2.5.1 (ISO/IEC 19505) and Philippe Kruchten's 4+1 View Model of Software Architecture (IEEE Software 1995), anchored in ISO/IEC/IEEE 15288:2023 lifecycle processes and David Parnas's information hiding (1972).
2. **Relational Database Schema Engineering (DDL & DML)**: Formal relational modeling founded on Edgar F. Codd's relational algebra and tuple calculus (CACM 1970, 1972), Peter Pin-Shan Chen's Entity-Relationship Model (ACM TODS 1976), normalization theory through Boyce-Codd Normal Form (BCNF) and 4NF (Fagin 1977), and declarative SQL schema definition (DDL) and query optimization (DML) via Selinger cost-based evaluation (1979).

This specification details how these two domains are integrated into:
- Resume, technical skills, and experience items across English, Portuguese, and Spanish in `src/i18n.ts`.
- Knowledge base catalog metadata in `src/docsData.ts`.
- Foundational systems engineering treatise in `docs/foundation/systems-engineering-and-dependability.md` and its mirrors in `public/docs/`.
- Database architecture treatise in `docs/architecture/database-internals-and-transaction-theory.md` and its mirrors in `public/docs/`.

---

## 2. Scientific & Theoretical Grounding

### 2.1 Model-Based Systems Engineering (MBSE) & OMG UML 2.5.1
- **ISO/IEC 19505:2012 / OMG UML 2.5.1**:
  - Structural modeling: Class diagrams, Component diagrams, Package diagrams, Deployment diagrams.
  - Behavioral modeling: Sequence diagrams, State Machine diagrams, Activity diagrams.
- **ISO/IEC/IEEE 15288:2023 & ISO/IEC/IEEE 42010**:
  - The System Architecture Definition and Design Definition technical processes. Architecture views and viewpoints formalize stakeholder concerns before code generation.
- **Philippe Kruchten (1995) 4+1 View Model**:
  - Logical View: Object/Domain abstractions and functional contracts.
  - Process View: Non-functional constraints, concurrency, fault isolation, and throughput.
  - Development/Implementation View: Package partitioning, build boundaries, and module cohesion.
  - Physical/Deployment View: Hardware nodes, network topology, and execution environments.
  - Scenarios / Use Cases (+1): Systemic integration and end-to-end operational validation.
- **Formal Invariants & Contracts**:
  - Bertrand Meyer (1988) Design by Contract (DbC) and OMG Object Constraint Language (OCL / ISO/IEC 19507) defining strict pre-conditions, post-conditions, and class invariants.
  - David Parnas (1972) modular decomposition and information hiding across package interfaces.

### 2.2 Relational Model, Formal Schemas, DDL & DML
- **Edgar F. Codd (1970, 1972)**:
  - Mathematical relations defined over domains: $R \subseteq D_1 \times D_2 \times \dots \times D_n$.
  - Relational completeness proving equivalence between procedural Relational Algebra ($\sigma, \pi, \bowtie, \cup, -$) and declarative First-Order Tuple Relational Calculus (TRC).
- **Peter Pin-Shan Chen (1976)**:
  - The Entity-Relationship Model bridging cognitive domains to logical relations: Conceptual ERD $\to$ Logical Schema $\to$ Physical Storage.
- **Normalization Theory & Functional Dependencies**:
  - 1NF (atomic domains), 2NF/3NF (functional dependency preservation $X \to Y$, elimination of transitive dependencies), BCNF (every determinant is a candidate key), 4NF (multivalued dependencies $X \twoheadrightarrow Y$, Fagin 1977).
  - Guarantees lossless-join decomposition ($\Pi_{R_1}(R) \bowtie \Pi_{R_2}(R) = R$) and zero data anomalies during mutation.
- **ISO/IEC 9075 (SQL DDL & DML)**:
  - Data Definition Language (DDL): Declarative schema definitions, constraints, domains, referential integrity (`FOREIGN KEY ... REFERENCES`), and assertion predicates.
  - Data Manipulation Language (DML): Declarative set transformations evaluated through relational query trees and cost-based query optimization (Selinger et al., 1979).

---

## 3. Structural Integration Plan

### 3.1 `src/i18n.ts` Updates
- **`tech.categories`**:
  - "Databases & Storage": Add Relational DDL/DML Schema Engineering, Normalization (1NF–BCNF), Codd Relational Formalism & Chen ERD.
  - "Architecture & DevSecOps" / "Methodologies & Rigor": Add Model-Based Systems Engineering (MBSE), OMG UML 2.5 (Structural & Behavioral), Kruchten 4+1 View Architecture.
- **`exp.jobs`**:
  - Accenture Pioneer: Add architectural blueprinting via UML diagrams and relational data governance.
  - Audsat: Highlight formal schema modeling, referential integrity constraints, and high-throughput DML pipelines.
  - Ilia / Orla: Highlight technical blueprints and relational database architecture.
- **`docs.c2`**:
  - Add MBSE & UML 2.5 Blueprinting and Relational Schema Engineering (DDL/DML & Codd Theory).

### 3.2 `src/docsData.ts` Updates
- Expand highlights and subtitles for `systems-engineering` and `database-internals` in EN, PT, and ES to include MBSE, UML 2.5, Kruchten 4+1, Codd Relational Algebra, Chen ERD, Normalization (1NF–BCNF), and DDL/DML.

### 3.3 Documentation Expansion
1. **`docs/foundation/systems-engineering-and-dependability.md`** (and `public/docs/{en,pt,es}/...`):
   - Insert Section 2.2 on MBSE & OMG UML 2.5.1 with Kruchten 4+1 View Model, Parnas Information Hiding, and OCL contracts.
   - Include a Mermaid diagram illustrating the 4+1 View Model mapped to UML diagram types.
2. **`docs/architecture/database-internals-and-transaction-theory.md`** (and `public/docs/{en,pt,es}/...`):
   - Insert Section 1 on Codd's Relational Foundation, Chen ERD, Normalization Theory (1NF–BCNF), and Declarative DDL vs. DML Semantics.
   - Connect logical schema and DML operators to the physical storage layer (B+ Tree / LSM) and ACID recovery (ARIES WAL).

