# 🗄️ Relational Persistence, CAS Storage & Lifecycles

This document specifies the persistence architecture and Content-Addressable Storage (CAS) model.

---

## 1. Normalized Relational Modeling vs. Monolithic Blobs

### 1.1 The Monolithic JSON Blob Anti-Pattern
In legacy architectures, dynamic collections and hierarchical trees are often serialized into monolithic JSON/Text columns in relational databases. This anti-pattern introduces severe architectural bottlenecks:
- **Write Amplification:** Mutating a single nested attribute requires serializing, transferring, and rewriting an entire multi-megabyte document.
- **Concurrency Collisions & Silent Overwrites:** Concurrent updates targeting different sections of the same row inadvertently overwrite each other.
- **Query Inefficiency:** Summary listings and simple reads are forced to transfer heavy payloads or maintain fragile column exclusions to prevent network and memory saturation.

### 1.2 The Normalized Relational Solution
- Domain structures are modeled into normalized, discrete relational tables linked by explicit foreign keys (`FOREIGN KEY`) with declarative referential integrity (`ON DELETE CASCADE` / `ON DELETE RESTRICT`).
- Each mutable entity represents an independent row, enabling granular atomic operations with row-level locks.
- Summary metrics and aggregations leverage native database functions (`SUM`, `COUNT`, `AVG`) rather than loading raw trees into application memory.

---

## 2. Content-Addressable Storage (CAS) Reference Model

The relational database stores **zero heavy binary payloads and zero high-dimensional mathematical vectors inline**:

1. **Strict Separation of Concerns:**
   - The database stores structured metadata, relationships, and cryptographic reference keys.
   - The Object Storage / File System stores binary files and heavy payloads.
2. **Cryptographic Hash Addressing (SHA-256):**
   - Every file committed to storage is addressed by its SHA-256 hexadecimal digest:
     $$\text{key} = \text{sha256}(\text{payload})$$
   - The relational database records only the 64-character hash string (`VARCHAR(64)`).
3. **Architectural Advantages:**
   - **Native Deduplication:** Identical files committed across different projects automatically share the exact same physical storage object.
   - **Immutable Cacheability:** Because keys are cryptographically bound to payload content, stored objects are immutable. Caches can retain assets indefinitely with zero cache-invalidation risks.
   - **Cryptographic Auditability:** Any worker or client can verify payload integrity on demand by recomputing the hash and comparing it against the database ledger.

---

## 3. Standardized 3-Tier Storage Lifecycle

To prevent storage bloat and unnecessary infrastructure overhead, stored objects are partitioned into three lifecycle tiers with distinct retention policies:

| Tier | Storage Prefix | Retention Policy | Stored Data Category |
| :--- | :--- | :--- | :--- |
| **Tier 1: Scratch (Ephemeral)** | `scratch/` | **Short Auto-TTL (e.g., 24 hours)** and automatic purge on Saga compensation rollbacks. | Intermediate processing chunks, raw conversion files, volatile working scratchpads. |
| **Tier 2: Vault (Library / Assets)** | `vault/` | **Permanent / Indefinite Retention.** Never purged by automated lifecycle sweeps. | Long-term reference assets, base templates, foundational embeddings, master profiles. |
| **Tier 3: Releases (Deliverables)** | `releases/` | **Version-Governed Retention.** Governed by product release and audit lifecycles. | Final consolidated deliverables, generated reports, export bundles. |

---

## 4. Concurrency Control & Transactional Boundaries

### 4.1 Optimistic Concurrency Control (OCC)
- Entities supporting concurrent edits maintain an integer version attribute (`version: integer`) or update timestamp.
- Atomic state updates enforce optimistic verification:
  ```sql
  UPDATE entities SET field = $1, version = version + 1 
  WHERE id = $2 AND version = $3;
  ```
- If the update returns 0 affected rows, the persistence layer aborts the operation with a `ConcurrencyCollisionException`, preventing silent state overwrites.

### 4.2 Explicit Transactional Scopes
- Operations spanning multiple domain aggregates must execute within an explicit ACID transaction.
- Any unhandled exception triggers an immediate transaction rollback before side effects become visible to concurrent consumers.
