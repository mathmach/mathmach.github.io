# 💾 Database Internals, Relational Theory & Concurrency

This document formalizes relational database theory, formal schema engineering (DDL/DML), physical storage engine trade-offs, and formal concurrency isolation theory governing state persistence across the system.

---

## 1. Relational Theory, Formal Schemas, DDL & DML

Enterprise data architecture must rest on formal mathematical foundations rather than ad-hoc schema design.

### 1.1 Edgar F. Codd's Relational Formalism (1970, 1972)
Edgar F. Codd introduced the relational model to emancipate application developers from graph/pointer navigational models (Codasyl DBTG).

Mathematically, given domains $D_1, D_2, \dots, D_n$, a **relation** $R$ is a subset of their Cartesian product:

$$R \subseteq D_1 \times D_2 \times \dots \times D_n$$

A **tuple** $t \in R$ is a mapping associating each attribute name with an atomic value in its domain.

#### Relational Completeness: Algebra vs. Calculus
Codd (1972) defined a database sublanguage as **relationally complete** if its expressive power equals First-Order Predicate Calculus. He proved the semantic equivalence between:
- **Relational Algebra (Operational / Procedural):** Six fundamental primitives: Selection ($\sigma$), Projection ($\pi$), Cartesian Product ($\times$), Set Union ($\cup$), Set Difference ($-$), and Attribute Rename ($\rho$). Derived operators include Natural Join ($\bowtie$) and Theta Join ($\bowtie_\theta$).
- **Tuple Relational Calculus (TRC - Declarative):** Expressions of the form $\{ t \mid \phi(t) \}$, where $\phi(t)$ is a first-order formula.

Modern SQL engines compile declarative calculus-like expressions (DML) into procedural relational algebra operator trees.

### 1.2 Conceptual-to-Physical Modeling: Peter Chen's ERD (1976)
Schema engineering progresses through three canonical levels of abstraction:

```
[ Conceptual Level ]      Peter Chen Entity-Relationship Diagram (ERD)
        │                 Entities, Relationships (1:1, 1:N, N:M), Weak Entities
        ▼
[ Logical Level ]         Relational Mapping & Normalization (1NF through BCNF)
        │                 Primary Keys, Foreign Keys, Referential Constraints
        ▼
[ Physical Level ]        Declarative DDL Specification & Storage Layout
                          Data Types, B+ Tree Indexes, Page Packing, Partitioning
```

1. **Conceptual Schema:** Entity-Relationship Modeling (Peter Pin-Shan Chen, 1976) identifies business entities and semantic relationships independent of storage engines.
2. **Logical Schema:** Mathematical transformation of ERD cardinality into relational tables, foreign key constraints, and relational normalization.
3. **Physical Schema:** Concrete DDL declarations specifying physical column types, nullability, unique indexes, clustering keys, and storage parameters.

### 1.3 Normalization Theory & Functional Dependencies
Database schemas must adhere to relational normalization to eliminate insertion, update, and deletion anomalies.

Given a relation $R$, a **functional dependency** $X \to Y$ holds if whenever two tuples agree on attributes $X$, they must agree on attributes $Y$.

- **First Normal Form (1NF):** Each attribute contains only atomic, indivisible values from its domain. Zero repeating groups, arrays, or untyped JSON blobs in normalized entities.
- **Second Normal Form (2NF):** Satisfies 1NF, and every non-prime attribute is fully functionally dependent on the entire candidate key (eliminates partial key dependencies in composite primary keys).
- **Third Normal Form (3NF):** Satisfies 2NF, and no non-prime attribute is transitively dependent on any candidate key ($X \to Y \to Z$ where $Z$ depends on non-key $Y$).
- **Boyce-Codd Normal Form (BCNF):** For every non-trivial functional dependency $X \to Y$, the determinant $X$ must be a superkey.
- **Fourth Normal Form (4NF - Ronald Fagin, 1977):** For every non-trivial multivalued dependency $X \twoheadrightarrow Y$, $X$ must be a superkey, eliminating independent multi-attribute dependencies.

#### Mathematical Guarantee
Decomposing relations into BCNF satisfies the **Lossless-Join Decomposition** property:

$$\Pi_{R_1}(R) \bowtie \Pi_{R_2}(R) = R \quad \iff \quad (R_1 \cap R_2 \to R_1) \lor (R_1 \cap R_2 \to R_2)$$

This guarantees zero synthetic ghost records are created upon rejoin.

### 1.4 Declarative DDL (Data Definition Language) & Schema Invariants
Under **ISO/IEC 9075 (SQL Standard)**, DDL provides declarative metadata definitions for relations, attributes, domains, and assertions:

- **Primary & Foreign Key Invariants:** Enforcing entity identity and strict referential integrity (`REFERENCES parent(id) ON DELETE RESTRICT / CASCADE`).
- **Domain Assertions (`CHECK`):** Mathematical invariants evaluated at transaction commit or write boundaries (e.g., `CHECK (balance >= 0 AND credit_limit >= 0)`).
- **Unique & Nullability Constraints:** Eliminating degenerate states and preventing silent null-pointer propagation into application domains.

### 1.5 Declarative DML & Cost-Based Query Optimization
**Data Manipulation Language (DML)** operates on sets of tuples declaratively (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE`):

1. **Declarative Intent:** The caller declares *what* data is required, not *how* to traverse disk blocks.
2. **Relational Query Tree Compilation:** The engine parses SQL into an AST and translates it into a relational algebra expression ($\sigma, \pi, \bowtie$).
3. **Selinger Cost-Based Optimization (Patricia Selinger et al., 1979 - IBM System R):**
   - Estimates candidate execution plans by calculating cardinality, table statistics, and selectivity factors.
   - Computes expected disk I/O and CPU costs for access paths (Sequential Scan vs. Index B+ Tree Scan vs. Hash Join vs. Merge Join).
   - Produces the mathematically optimal physical execution plan.

### 1.6 Governed Denormalization Invariant
Denormalization is permitted **strictly as a conscious read optimization** for pre-computed query projections. Denormalized read replicas or cached aggregates must be updated transactionally via Transactional Outbox events or deterministic materialization workers, never through ad-hoc manual writes in application code.

---

## 2. Storage Engine Architectures: B+ Trees vs. LSM-Trees

Every storage engine makes fundamental architectural trade-offs between read latency, write throughput, and storage amplification.

```
       B+ Tree Storage Architecture                 LSM-Tree Storage Architecture
     (Read-Optimized / In-Place Update)          (Write-Optimized / Append-Only)

            [ Root Node Page ]                          [ In-Memory MemTable ]
             /              \                                (RAM SkipList)
            v                v                                     │ (Flush)
    [ Internal Page ]  [ Internal Page ]                           ▼
       /         \        /        \                    [ L0 SSTables (Disk) ]
      v           v      v          v                              │ (Compaction)
    [ Leaf Page ] [ Leaf Page ] [ Leaf Page ]                      ▼
    (Doubly Linked Disk Pages with Keys & Ptrs)         [ L1 SSTables (Disk) ]
```

### 2.1 Structural Comparison

| Feature | B+ Tree (e.g., Postgres, InnoDB, SQLite) | LSM-Tree (e.g., RocksDB, Cassandra, LevelDB) |
| :--- | :--- | :--- |
| **Primary Workload** | Read-heavy, point lookups, range scans. | Write-heavy, high-throughput ingest, append-only. |
| **Mutation Paradigm** | In-place overwrite of fixed-size disk pages ($4\text{KB}\text{--}16\text{KB}$). | Append-only sequential log; immutable SSTables on disk. |
| **Disk I/O Pattern** | Random I/O (requires disk head seeks on spinning disks). | Sequential I/O (saturates sustained bus bandwidth). |
| **Write Amplification (WA)** | High (updating 1 byte writes an entire $8\text{KB}$ page + WAL). | Moderate-High (incurred during multi-level compaction merges). |
| **Space Amplification (SA)** | Moderate (page fragmentation, internal slack space). | Low-Moderate (deleted records occupy space until compaction). |

### 2.2 The RUM Conjecture (Athanassoulis et al., 2016)
The RUM Conjecture proves that when designing access methods for data systems, optimizing two of the three primary overheads compromises the third:

```
                  Read Overhead (R)
                         /\
                        /  \
                       /    \
                      /      \
  Update Overhead (U) -------- Memory / Space Overhead (M)
```
- **Optimizing Read & Space (R + M):** B+ Trees minimize read latency with dense packing, but sacrifice update cost ($U$) due to page splits and random writes.
- **Optimizing Update & Space (U + M):** LSM-Trees with heavy leveled compaction minimize disk usage and accept writes sequentially, but increase read overhead ($R$) via multi-SSTable searches (mitigated with Bloom Filters).
- **Optimizing Read & Update (R + U):** Redundant indexing structures (e.g., maintaining dual indices or memory caches) achieve fast reads and updates, but inflate space consumption ($M$).

---

## 3. Transaction Theory: ACID & Crash Recovery (ARIES)

A transaction represents a logical unit of work that transitions a database from one consistent state to another.

### 3.1 The ACID Properties (Jim Gray, 1981)
- **Atomicity:** All operations within the transaction execute successfully, or the entire transaction is rolled back with zero side effects.
- **Consistency:** Mutations must never violate declared database constraints, foreign keys, or domain entity invariants.
- **Isolation:** Concurrent transactions execute without observing intermediate, uncommitted mutations of other concurrent transactions.
- **Durability:** Once committed, state changes survive system crashes, power outages, and process termination.

### 3.2 Write-Ahead Logging (WAL) & ARIES Recovery
To guarantee Durability without synchronously flushing entire database pages to disk on every commit, systems implement **Write-Ahead Logging (WAL)**:

> **The WAL Invariant:** No modified data page (dirty page) may be written to non-volatile storage until the corresponding log record detailing the change has been flushed to disk (`fsync`).

The canonical **ARIES** algorithm (Mohan et al., 1992) executes crash recovery in three phases:
1. **Analysis Phase:** Scans the WAL forward from the last checkpoint to identify active transactions (uncommitted at the time of crash) and dirty pages in memory.
2. **Redo Phase:** Scans forward from the earliest unwritten log record to repeat history, reapplying all logged operations (including those of uncommitted transactions) to restore the exact state prior to crash.
3. **Undo Phase:** Scans backward to reverse the actions of all active transactions that never committed, writing Compensation Log Records (CLRs) to ensure idempotency if another crash occurs during recovery.

---

## 4. Concurrency Isolation Levels & Anomalies

The ANSI SQL-92 isolation standard relied on ambiguous, lock-based definitions. Modern database theory classifies isolation strictly by the **concurrency anomalies** prevented (Berenson et al., 1995; Adya et al., 2000).

```
Isolation Level Hierarchy:
Read Uncommitted < Read Committed < Repeatable Read < Snapshot Isolation (SI) < Serializable (SSI / 2PL)
```

### 4.1 Taxonomy of Concurrency Anomalies

| Anomaly Code | Anomaly Name | Description | Prevented By |
| :--- | :--- | :--- | :--- |
| **$G0$** | **Dirty Write** | Transaction $T_1$ modifies a data item, and $T_2$ overwrites it before $T_1$ commits or aborts. | Read Uncommitted & above |
| **$G1a$** | **Dirty Read** | $T_1$ modifies a data item; $T_2$ reads the uncommitted value; $T_1$ subsequently aborts. | Read Committed & above |
| **$G1c$** | **Non-Repeatable Read** | $T_1$ reads an item; $T_2$ modifies/deletes that item and commits; $T_1$ re-reads the item and observes altered data. | Repeatable Read & above |
| **$A3$** | **Phantom Read** | $T_1$ reads a predicate set; $T_2$ creates new records satisfying the predicate and commits; $T_1$ re-queries and sees "ghost" records. | Repeatable Read (with MVCC) / Serializable |
| **$P4$** | **Lost Update** | $T_1$ and $T_2$ read item $X$; both compute updates; $T_1$ writes $X$; $T_2$ writes $X$, silently destroying $T_1$'s mutation. | Snapshot Isolation & above |
| **$A5B$** | **Write Skew** | $T_1$ reads $X$ and $Y$; $T_2$ reads $X$ and $Y$; constraint mandates $X + Y > 0$. $T_1$ decrements $X$, $T_2$ decrements $Y$. Both commit; invariant violated! | **Serializable ONLY** |

### 4.2 Snapshot Isolation (SI) & The Write Skew Hazard
Snapshot Isolation provides lock-free reads using Multi-Version Concurrency Control (MVCC). Each transaction reads from an immutable snapshot of committed data taken at the transaction's start timestamp $T_{\text{start}}$.

- **First-Committer-Wins:** If two concurrent transactions attempt to modify the **exact same row**, the second committer aborts. This prevents Lost Update ($P4$).
- **The Blind Spot of SI (Write Skew):** If two transactions modify **different rows** while relying on overlapping read sets to satisfy a shared invariant, both succeed under SI, corrupting the invariant!
  - *Example (The On-Call Doctors Problem):* Hospital rule: $\ge 1$ doctor on call. Dr. Alice and Dr. Bob are on call. Alice goes off call ($T_1$ updates Alice's row because Bob is on call). Concurrently, Bob goes off call ($T_2$ updates Bob's row because Alice is on call). Both transactions commit under SI $\implies$ **Zero doctors on call!**
- **Architectural Solution:** Enforce **Serializable Snapshot Isolation (SSI)** (which dynamically detects dependency cycles in the serialization graph - `rw-antidependencies`) or acquire explicit row-level locks via `SELECT ... FOR UPDATE`.
