import { Lang } from './i18n';

interface DocItem {
  id: string;
  category: 'Architecture' | 'Foundation';
  title: string;
  subtitle: string;
  file: string;
  readTime: string;
  highlights: string[];
}

const DOCS_INDEX: Record<Lang, DocItem[]> = {
  en: [
    {
      id: "solid",
      category: "Architecture",
      title: "SOLID Design Principles Handbook",
      subtitle: "Formal Mathematical Definitions & Architectural Constraints",
      file: "architecture/solid-design-principles.md",
      readTime: "8 min",
      highlights: ["SRP Actor Mapping", "OCP Polymorphic Extension", "LSP Subtyping Formalism", "ISP Role Tailoring", "DIP Hexagonal Boundaries"]
    },
    {
      id: "gof",
      category: "Architecture",
      title: "Gang of Four (GoF) Patterns",
      subtitle: "Canonical Adoption across Creational, Structural & Behavioral",
      file: "architecture/gof-design-patterns.md",
      readTime: "12 min",
      highlights: ["23 GoF Design Patterns", "Anti-Pattern Invariants", "Factory / Strategy / Decorator", "Zero Ad-Hoc Instantiation"]
    },
    {
      id: "clean-arch",
      category: "Architecture",
      title: "Clean Architecture & DDD",
      subtitle: "Separation of Concerns and Pure Domain Model",
      file: "architecture/clean-architecture-and-ddd.md",
      readTime: "10 min",
      highlights: ["Dependency Rule", "Entities & Value Objects", "Domain Services", "Zero Leaky Abstractions"]
    },
    {
      id: "hexagonal",
      category: "Architecture",
      title: "Hexagonal Ports & Adapters",
      subtitle: "Driver & Driven Isolation for Production Resilience",
      file: "architecture/hexagonal-ports-and-adapters.md",
      readTime: "8 min",
      highlights: ["Inbound & Outbound Ports", "Infrastructure Swappability", "Isolated Testability", "Zero Framework Coupling"]
    },
    {
      id: "distributed-theory",
      category: "Architecture",
      title: "Distributed Systems Theory",
      subtitle: "Consensus Impossibility, Ordering & Network Realities",
      file: "architecture/distributed-systems-theory.md",
      readTime: "11 min",
      highlights: ["8 Fallacies of Distributed Computing", "FLP Impossibility (1985)", "Lamport Logical Clocks", "End-to-End Principle (1984)"]
    },
    {
      id: "resilience",
      category: "Architecture",
      title: "Distributed Resilience Patterns",
      subtitle: "Fault-Tolerant Distributed Coordination & Recovery",
      file: "architecture/distributed-resilience-patterns.md",
      readTime: "9 min",
      highlights: ["Transactional Outbox Pattern", "Distributed Sagas (Orchestrated)", "Circuit Breakers & Exponential Backoff", "Idempotency Ledgers"]
    },
    {
      id: "database-internals",
      category: "Architecture",
      title: "Database Internals & Transactions",
      subtitle: "Storage Engines, ARIES WAL & Isolation Anomalies",
      file: "architecture/database-internals-and-transaction-theory.md",
      readTime: "10 min",
      highlights: ["B+ Tree vs. LSM-Tree Asymptotics", "ARIES Recovery Protocol", "ANSI SQL Anomaly Critique (Berenson 1995)", "PACELC Theorem (Abadi 2012)"]
    },
    {
      id: "observability",
      category: "Architecture",
      title: "Observability & Evidence-Based Decisions",
      subtitle: "Distributed Telemetry, 4 Golden Signals & Quantitative Reliability",
      file: "architecture/observability-and-evidence-based-decisions.md",
      readTime: "9 min",
      highlights: ["OpenTelemetry OTLP", "W3C Trace Context", "4 Golden Signals & RED/USE", "Tail-Based Sampling", "SLI/SLO Error Budgets", "Automated Canary", "Blameless Post-Mortems"]
    },
    {
      id: "engineering-quality",
      category: "Architecture",
      title: "Engineering Quality & Invariants",
      subtitle: "Quality Ratchets, Cognitive Ceilings & Fallback Debt",
      file: "architecture/engineering-quality-and-invariants.md",
      readTime: "7 min",
      highlights: ["Zero Fallback Debt (7 Golden Rules)", "Zero Orphan Surfaces", "Cognitive Complexity Ceiling <= 15", "Coverage Floor Ratchets"]
    },
    {
      id: "persistence-cas",
      category: "Architecture",
      title: "Persistence & CAS Storage",
      subtitle: "Content-Addressable Storage, Merkle DAGs & Immutability",
      file: "architecture/persistence-and-cas-storage.md",
      readTime: "8 min",
      highlights: ["Content Addressing (SHA-256)", "Merkle Directed Acyclic Graph", "Immutability Invariants", "Garbage Collection & Compaction"]
    },
    {
      id: "systems-engineering",
      category: "Foundation",
      title: "Systems Engineering & Dependability",
      subtitle: "Lifecycle Standards, V&V Formalism & Pugh Selection",
      file: "foundation/systems-engineering-and-dependability.md",
      readTime: "12 min",
      highlights: ["ISO/IEC/IEEE 15288:2023", "Boehm Verification vs. Validation (1981)", "Pugh Controlled Convergence", "Avizienis Fault/Error/Failure Taxonomy"]
    },
    {
      id: "complexity",
      category: "Foundation",
      title: "Computational Complexity & Performance",
      subtitle: "Landau Notation, Queuing Theory & Hardware Realities",
      file: "foundation/computational-complexity-and-performance.md",
      readTime: "11 min",
      highlights: ["Landau Big-O Formalism (Knuth 1976)", "Little's Law L = lambda * W", "Universal Scalability Law (Gunther USL)", "Memory Hierarchy & L1/L2/L3 Cache Locality"]
    },
    {
      id: "academic-dsr",
      category: "Foundation",
      title: "Design Science Research (DSR)",
      subtitle: "Academic Rigor and Artifact Construction Methodology",
      file: "foundation/academic-methodology-dsr.md",
      readTime: "8 min",
      highlights: ["Hevner 7 Guidelines (2004)", "Peffers 6-Stage Process (2007)", "Iterative Artifact Evaluation", "Zero Speculative Claims"]
    },
    {
      id: "systems-theory",
      category: "Foundation",
      title: "Systems Theory & Core Pillars",
      subtitle: "Cybernetics, System Dynamics & Structural Emergence",
      file: "foundation/systems-theory-and-pillars.md",
      readTime: "8 min",
      highlights: ["Bertalanffy General System Theory", "Wiener Cybernetics & Feedback", "Ashby Law of Requisite Variety", "Emergence & Subsystem Hierarchy"]
    }
  ],
  pt: [
    {
      id: "solid",
      category: "Architecture",
      title: "Princípios de Design SOLID",
      subtitle: "Definições Matemáticas Formais & Restrições Arquiteturais",
      file: "architecture/solid-design-principles.md",
      readTime: "8 min",
      highlights: ["Mapeamento de Atores SRP", "Extensão Polimórfica OCP", "Formalismo de Subtipagem LSP", "Especialização de Papéis ISP", "Fronteiras Hexagonais DIP"]
    },
    {
      id: "gof",
      category: "Architecture",
      title: "Padrões Gang of Four (GoF)",
      subtitle: "Adoção Canônica em Criacionais, Estruturais & Comportamentais",
      file: "architecture/gof-design-patterns.md",
      readTime: "12 min",
      highlights: ["23 Padrões GoF", "Invariantes Anti-Pattern", "Factory / Strategy / Decorator", "Zero Instanciação Ad-Hoc"]
    },
    {
      id: "clean-arch",
      category: "Architecture",
      title: "Clean Architecture & DDD",
      subtitle: "Separação de Responsabilidades e Modelo de Domínio Puro",
      file: "architecture/clean-architecture-and-ddd.md",
      readTime: "10 min",
      highlights: ["Regra de Dependência", "Entidades & Value Objects", "Serviços de Domínio", "Zero Abstrações Vazadas"]
    },
    {
      id: "hexagonal",
      category: "Architecture",
      title: "Portas & Adaptadores Hexagonais",
      subtitle: "Isolamento Driver & Driven para Resiliência em Produção",
      file: "architecture/hexagonal-ports-and-adapters.md",
      readTime: "8 min",
      highlights: ["Portas Inbound & Outbound", "Intercambialidade de Infra", "Testabilidade Isolada", "Zero Acoplamento a Frameworks"]
    },
    {
      id: "distributed-theory",
      category: "Architecture",
      title: "Teoria de Sistemas Distribuídos",
      subtitle: "Impossibilidade de Consenso, Ordenação & Realidades de Rede",
      file: "architecture/distributed-systems-theory.md",
      readTime: "11 min",
      highlights: ["8 Falácias da Computação Distribuída", "Impossibilidade FLP (1985)", "Relógios Lógicos de Lamport", "Princípio Ponta-a-Ponta (1984)"]
    },
    {
      id: "resilience",
      category: "Architecture",
      title: "Padrões de Resiliência Distribuída",
      subtitle: "Coordenação & Recuperação Distribuída Tolerante a Falhas",
      file: "architecture/distributed-resilience-patterns.md",
      readTime: "9 min",
      highlights: ["Padrão Transactional Outbox", "Sagas Distribuídas (Orquestradas)", "Circuit Breakers & Exponential Backoff", "Ledgers de Idempotência"]
    },
    {
      id: "database-internals",
      category: "Architecture",
      title: "Internals de Bancos de Dados & Transações",
      subtitle: "Mecanismos de Armazenamento, ARIES WAL & Anomalias de Isolamento",
      file: "architecture/database-internals-and-transaction-theory.md",
      readTime: "10 min",
      highlights: ["Assintótica B+ Tree vs. LSM-Tree", "Protocolo de Recuperação ARIES", "Crítica a Anomalias ANSI SQL (Berenson 1995)", "Teorema PACELC (Abadi 2012)"]
    },
    {
      id: "observability",
      category: "Architecture",
      title: "Observabilidade & Decisões Baseadas em Evidência",
      subtitle: "Telemetria Distribuída, 4 Sinais Dourados & Confiabilidade Quantitativa",
      file: "architecture/observability-and-evidence-based-decisions.md",
      readTime: "9 min",
      highlights: ["OpenTelemetry OTLP", "W3C Trace Context", "4 Sinais Dourados & RED/USE", "Tail-Based Sampling", "Orçamentos de Erro SLI/SLO", "Canary Automatizado", "Post-Mortems Sem Culpa"]
    },
    {
      id: "engineering-quality",
      category: "Architecture",
      title: "Qualidade de Engenharia & Invariantes",
      subtitle: "Catracas de Qualidade, Tetos Cognitivos & Dívida de Fallback",
      file: "architecture/engineering-quality-and-invariants.md",
      readTime: "7 min",
      highlights: ["Zero Fallback Debt (7 Regras de Ouro)", "Zero Superfícies Órfãs", "Teto de Complexidade Cognitiva <= 15", "Catraca de Cobertura de Testes"]
    },
    {
      id: "persistence-cas",
      category: "Architecture",
      title: "Persistência & Armazenamento CAS",
      subtitle: "Content-Addressable Storage, Merkle DAGs & Imutabilidade",
      file: "architecture/persistence-and-cas-storage.md",
      readTime: "8 min",
      highlights: ["Endereçamento por Conteúdo (SHA-256)", "Grafo Acíclico Dirigido Merkle", "Invariantes de Imutabilidade", "Garbage Collection & Compactação"]
    },
    {
      id: "systems-engineering",
      category: "Foundation",
      title: "Engenharia de Sistemas & Confiabilidade",
      subtitle: "Padrões de Ciclo de Vida, Formalismo V&V & Seleção de Pugh",
      file: "foundation/systems-engineering-and-dependability.md",
      readTime: "12 min",
      highlights: ["ISO/IEC/IEEE 15288:2023", "Verificação vs. Validação de Boehm (1981)", "Convergência Controlada de Pugh", "Taxonomia de Falha/Erro/Defeito de Avizienis"]
    },
    {
      id: "complexity",
      category: "Foundation",
      title: "Complexidade Computacional & Performance",
      subtitle: "Notação de Landau, Teoria das Filas & Realidades do Hardware",
      file: "foundation/computational-complexity-and-performance.md",
      readTime: "11 min",
      highlights: ["Formalismo Big-O de Landau (Knuth 1976)", "Lei de Little L = lambda * W", "Lei Universal de Escalabilidade (Gunther USL)", "Hierarquia de Memória & Localidade L1/L2/L3"]
    },
    {
      id: "academic-dsr",
      category: "Foundation",
      title: "Design Science Research (DSR)",
      subtitle: "Rigor Acadêmico e Metodologia de Construção de Artefatos",
      file: "foundation/academic-methodology-dsr.md",
      readTime: "8 min",
      highlights: ["7 Diretrizes de Hevner (2004)", "Processo em 6 Estágios de Peffers (2007)", "Avaliação Iterativa de Artefatos", "Zero Afirmações Especulativas"]
    },
    {
      id: "systems-theory",
      category: "Foundation",
      title: "Teoria Geral dos Sistemas & Pilares Centrais",
      subtitle: "Cibernética, Dinâmica de Sistemas & Emergência Estrutural",
      file: "foundation/systems-theory-and-pillars.md",
      readTime: "8 min",
      highlights: ["Teoria Geral dos Sistemas de Bertalanffy", "Cibernética & Feedback de Wiener", "Lei da Variedade Requisita de Ashby", "Emergência & Hierarquia de Subsistemas"]
    }
  ],
  es: [
    {
      id: "solid",
      category: "Architecture",
      title: "Principios de Diseño SOLID",
      subtitle: "Definiciones Matemáticas Formales & Restricciones Arquitectónicas",
      file: "architecture/solid-design-principles.md",
      readTime: "8 min",
      highlights: ["Mapeo de Actores SRP", "Extensión Polimórfica OCP", "Formalismo de Subtipado LSP", "Especialización de Roles ISP", "Fronteras Hexagonales DIP"]
    },
    {
      id: "gof",
      category: "Architecture",
      title: "Patrones Gang of Four (GoF)",
      subtitle: "Adopción Canónica en Creacionales, Estructurales & Comportamentales",
      file: "architecture/gof-design-patterns.md",
      readTime: "12 min",
      highlights: ["23 Patrones GoF", "Invariantes Anti-Patrón", "Factory / Strategy / Decorator", "Cero Instanciación Ad-Hoc"]
    },
    {
      id: "clean-arch",
      category: "Architecture",
      title: "Clean Architecture & DDD",
      subtitle: "Separación de Responsabilidades y Modelo de Dominio Puro",
      file: "architecture/clean-architecture-and-ddd.md",
      readTime: "10 min",
      highlights: ["Regla de Dependencia", "Entidades & Value Objects", "Servicios de Dominio", "Cero Abstracciones con Fugas"]
    },
    {
      id: "hexagonal",
      category: "Architecture",
      title: "Puertos & Adaptadores Hexagonales",
      subtitle: "Aislamiento Driver & Driven para Resiliencia en Producción",
      file: "architecture/hexagonal-ports-and-adapters.md",
      readTime: "8 min",
      highlights: ["Puertos Inbound & Outbound", "Intercambiabilidad de Infra", "Testabilidad Aislada", "Cero Acoplamiento a Frameworks"]
    },
    {
      id: "distributed-theory",
      category: "Architecture",
      title: "Teoría de Sistemas Distribuidos",
      subtitle: "Imposibilidad de Consenso, Ordenación & Realidades de Red",
      file: "architecture/distributed-systems-theory.md",
      readTime: "11 min",
      highlights: ["8 Falacias de la Computación Distribuida", "Imposibilidad FLP (1985)", "Relojes Lógicos de Lamport", "Principio Fin-a-Fin (1984)"]
    },
    {
      id: "resilience",
      category: "Architecture",
      title: "Patrones de Resiliencia Distribuida",
      subtitle: "Coordinación & Recuperación Distribuida Tolerante a Fallos",
      file: "architecture/distributed-resilience-patterns.md",
      readTime: "9 min",
      highlights: ["Patrón Transactional Outbox", "Sagas Distribuidas (Orquestadas)", "Circuit Breakers & Exponential Backoff", "Ledgers de Idempotencia"]
    },
    {
      id: "database-internals",
      category: "Architecture",
      title: "Internals de Bases de Datos & Transacciones",
      subtitle: "Motores de Almacenamiento, ARIES WAL & Anomalías de Aislamiento",
      file: "architecture/database-internals-and-transaction-theory.md",
      readTime: "10 min",
      highlights: ["Asintótica B+ Tree vs. LSM-Tree", "Protocolo de Recuperación ARIES", "Crítica a Anomalías ANSI SQL (Berenson 1995)", "Teorema PACELC (Abadi 2012)"]
    },
    {
      id: "observability",
      category: "Architecture",
      title: "Observabilidad & Decisiones Basadas en Evidencia",
      subtitle: "Telemetría Distribuida, 4 Señales Doradas & Confiabilidad Cuantitativa",
      file: "architecture/observability-and-evidence-based-decisions.md",
      readTime: "9 min",
      highlights: ["OpenTelemetry OTLP", "W3C Trace Context", "4 Señales Doradas & RED/USE", "Tail-Based Sampling", "Presupuestos de Error SLI/SLO", "Canary Automatizado", "Post-Mortems Sin Culpa"]
    },
    {
      id: "engineering-quality",
      category: "Architecture",
      title: "Calidad de Ingeniería & Invariantes",
      subtitle: "Trinquetes de Calidad, Techos Cognitivos & Deuda de Fallback",
      file: "architecture/engineering-quality-and-invariants.md",
      readTime: "7 min",
      highlights: ["Cero Fallback Debt (7 Regras de Oro)", "Cero Superficies Huérfanas", "Techo de Complejidad Cognitiva <= 15", "Trinquete de Cobertura de Pruebas"]
    },
    {
      id: "persistence-cas",
      category: "Architecture",
      title: "Persistencia & Almacenamiento CAS",
      subtitle: "Content-Addressable Storage, Merkle DAGs & Inmutabilidad",
      file: "architecture/persistence-and-cas-storage.md",
      readTime: "8 min",
      highlights: ["Direccionamiento por Contenido (SHA-256)", "Grafo Acíclico Dirigido Merkle", "Invariantes de Inmutabilidad", "Recolección de Basura & Compactación"]
    },
    {
      id: "systems-engineering",
      category: "Foundation",
      title: "Ingeniería de Sistemas & Confiabilidad",
      subtitle: "Estándares de Ciclo de Vida, Formalismo V&V & Selección de Pugh",
      file: "foundation/systems-engineering-and-dependability.md",
      readTime: "12 min",
      highlights: ["ISO/IEC/IEEE 15288:2023", "Verificación vs. Validación de Boehm (1981)", "Convergencia Controlada de Pugh", "Taxonomía de Fallo/Error/Avería de Avizienis"]
    },
    {
      id: "complexity",
      category: "Foundation",
      title: "Complejidad Computacional & Rendimiento",
      subtitle: "Notación de Landau, Teoría de Colas & Realidades de Hardware",
      file: "foundation/computational-complexity-and-performance.md",
      readTime: "11 min",
      highlights: ["Formalismo Big-O de Landau (Knuth 1976)", "Ley de Little L = lambda * W", "Ley Universal de Escalabilidad (Gunther USL)", "Jerarquía de Memoria & Localidad L1/L2/L3"]
    },
    {
      id: "academic-dsr",
      category: "Foundation",
      title: "Design Science Research (DSR)",
      subtitle: "Rigor Académico y Metodología de Construcción de Artefactos",
      file: "foundation/academic-methodology-dsr.md",
      readTime: "8 min",
      highlights: ["7 Directrices de Hevner (2004)", "Proceso en 6 Etapas de Peffers (2007)", "Evaluación Iterativa de Artefactos", "Cero Afirmaciones Especulativas"]
    },
    {
      id: "systems-theory",
      category: "Foundation",
      title: "Teoría General de Sistemas & Pilares Centrales",
      subtitle: "Cibernética, Dinámica de Sistemas & Emergencia Estructural",
      file: "foundation/systems-theory-and-pillars.md",
      readTime: "8 min",
      highlights: ["Teoría General de Sistemas de Bertalanffy", "Cibernética & Retroalimentación de Wiener", "Ley de Variedad Requerida de Ashby", "Emergencia & Jerarquía de Subsistemas"]
    }
  ]
};

export function getDocsIndex(lang: Lang): DocItem[] {
  return DOCS_INDEX[lang];
}
