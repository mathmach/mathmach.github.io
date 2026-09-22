export const DOCS_INDEX = [
  {
    id: "solid",
    category: "Architecture",
    title: "SOLID Design Principles Handbook",
    subtitle: "Formal Mathematical Definitions & Architectural Constraints",
    file: "docs/architecture/solid-design-principles.md",
    readTime: "8 min",
    highlights: ["SRP Actor Mapping", "OCP Polymorphic Extension", "LSP Subtyping Formalism", "ISP Role Tailoring", "DIP Hexagonal Boundaries"]
  },
  {
    id: "gof",
    category: "Architecture",
    title: "Gang of Four (GoF) Patterns",
    subtitle: "Canonical Adoption across Creational, Structural & Behavioral",
    file: "docs/architecture/gof-design-patterns.md",
    readTime: "12 min",
    highlights: ["23 GoF Design Patterns", "Anti-Pattern Invariants", "Factory / Strategy / Decorator", "Zero Ad-Hoc Instantiation"]
  },
  {
    id: "clean-arch",
    category: "Architecture",
    title: "Clean Architecture & DDD",
    subtitle: "Separation of Concerns and Pure Domain Model",
    file: "docs/architecture/clean-architecture-and-ddd.md",
    readTime: "10 min",
    highlights: ["Dependency Rule", "Entities & Value Objects", "Domain Services", "Zero Leaky Abstractions"]
  },
  {
    id: "hexagonal",
    category: "Architecture",
    title: "Hexagonal Ports & Adapters",
    subtitle: "Driver & Driven Isolation for Production Resilience",
    file: "docs/architecture/hexagonal-ports-and-adapters.md",
    readTime: "8 min",
    highlights: ["Inbound & Outbound Ports", "Infrastructure Swappability", "Isolated Testability", "Zero Framework Coupling"]
  },
  {
    id: "distributed-theory",
    category: "Architecture",
    title: "Distributed Systems Theory",
    subtitle: "Consensus Impossibility, Ordering & Network Realities",
    file: "docs/architecture/distributed-systems-theory.md",
    readTime: "11 min",
    highlights: ["8 Fallacies of Distributed Computing", "FLP Impossibility (1985)", "Lamport Logical Clocks", "End-to-End Principle (1984)"]
  },
  {
    id: "resilience",
    category: "Architecture",
    title: "Distributed Resilience Patterns",
    subtitle: "Fault-Tolerant Distributed Coordination & Recovery",
    file: "docs/architecture/distributed-resilience-patterns.md",
    readTime: "9 min",
    highlights: ["Transactional Outbox Pattern", "Distributed Sagas (Orchestrated)", "Circuit Breakers & Exponential Backoff", "Idempotency Ledgers"]
  },
  {
    id: "database-internals",
    category: "Architecture",
    title: "Database Internals & Transactions",
    subtitle: "Storage Engines, ARIES WAL & Isolation Anomalies",
    file: "docs/architecture/database-internals-and-transaction-theory.md",
    readTime: "10 min",
    highlights: ["B+ Tree vs. LSM-Tree Asymptotics", "ARIES Recovery Protocol", "ANSI SQL Anomaly Critique (Berenson 1995)", "PACELC Theorem (Abadi 2012)"]
  },
  {
    id: "engineering-quality",
    category: "Architecture",
    title: "Engineering Quality & Invariants",
    subtitle: "Quality Ratchets, Cognitive Ceilings & Fallback Debt",
    file: "docs/architecture/engineering-quality-and-invariants.md",
    readTime: "7 min",
    highlights: ["Zero Fallback Debt (7 Golden Rules)", "Zero Orphan Surfaces", "Cognitive Complexity Ceiling <= 15", "Coverage Floor Ratchets"]
  },
  {
    id: "systems-engineering",
    category: "Foundation",
    title: "Systems Engineering & Dependability",
    subtitle: "Lifecycle Standards, V&V Formalism & Pugh Selection",
    file: "docs/foundation/systems-engineering-and-dependability.md",
    readTime: "12 min",
    highlights: ["ISO/IEC/IEEE 15288:2023", "Boehm Verification vs. Validation (1981)", "Pugh Controlled Convergence", "Avizienis Fault/Error/Failure Taxonomy"]
  },
  {
    id: "complexity",
    category: "Foundation",
    title: "Computational Complexity & Performance",
    subtitle: "Landau Notation, Queuing Theory & Hardware Realities",
    file: "docs/foundation/computational-complexity-and-performance.md",
    readTime: "11 min",
    highlights: ["Landau Big-O Formalism (Knuth 1976)", "Little's Law L = lambda * W", "Universal Scalability Law (Gunther USL)", "Memory Hierarchy & L1/L2/L3 Cache Locality"]
  },
  {
    id: "academic-dsr",
    category: "Foundation",
    title: "Design Science Research (DSR)",
    subtitle: "Academic Rigor and Artifact Construction Methodology",
    file: "docs/foundation/academic-methodology-dsr.md",
    readTime: "8 min",
    highlights: ["Hevner 7 Guidelines (2004)", "Peffers 6-Stage Process (2007)", "Iterative Artifact Evaluation", "Zero Speculative Claims"]
  }
];

