import { YEARS_OF_EXPERIENCE } from './domain/constants.ts';

export type Lang = 'en' | 'pt' | 'es';

export interface Job {
  role: string;
  corp: string;
  year: string;
  points: string[];
}

export interface MethodologyPillar {
  tag: string;
  title: string;
  desc: string;
  ref: string;
}

export interface WorkflowStage {
  step: string;
  title: string;
  desc: string;
  standard: string;
}

export interface TechCategory {
  name: string;
  items: string[];
}

export interface HeroStat {
  value: string;
  label: string;
}

export const translations = {
  en: {
    languages: {
      pt: 'Portuguese',
      en: 'English',
      es: 'Spanish',
    },
    nav: {
      exp: 'Experience',
      methodology: 'Methodology',
      tech: 'Tech Stack',
      docs: 'Education & Knowledge',
      talk: "Let's Talk",
    },
    hero: {
      badge: 'Senior Software Engineer & Consultant',
      title: 'Building Resilient Systems.',
      subtitle: `Hello, I'm Matheus Machado, a Senior Software Engineer with over ${YEARS_OF_EXPERIENCE} years of experience in distributed and mission-critical systems across finance, agriculture, and telecommunications. Expertise in Node.js, Java (Spring), SQL/NoSQL, and GenAI integration.`,
      cta: 'View Career Journey',
      stats: [
        { value: `${YEARS_OF_EXPERIENCE}+ Years`, label: 'Production Engineering' },
        { value: '3 Tier-1 Banks', label: 'Santander, BB & Itaú' },
        { value: 'GenAI + AST', label: 'Syntax Tree (AST) & Code AI' },
        { value: 'CS50x', label: 'HarvardX Certified' },
      ],
    },
    methodology: {
      title: 'Applied Engineering Methodology',
      subtitle:
        'Grounded in academic standards, formal engineering models, and production practices designed for high system resilience.',
      workflow: {
        badge: 'Engineering Lifecycle',
        title: 'End-to-End Systems Engineering Workflow',
        subtitle:
          'From academic research and formal market discovery through rigorous verification and continuous telemetry feedback.',
        stages: [
          {
            step: '01',
            title: 'Research & Discovery',
            desc: 'State-of-the-art academic review, market feasibility study, and formal stakeholder requirements gathering.',
            standard: 'ISO 29148 • DSR Hevner',
          },
          {
            step: '02',
            title: 'Systemic Analysis & Modeling',
            desc: 'OMG UML 2.5 blueprinting, Kruchten 4+1 View architecture, formal Codd/Chen relational schemas, and OCL contracts.',
            standard: 'UML 2.5 • Kruchten 4+1',
          },
          {
            step: '03',
            title: 'Proof of Concept (PoC)',
            desc: 'Technical feasibility spikes, Landau asymptotic complexity benchmarks, and Pugh decision matrix convergence.',
            standard: 'Pugh Matrix • Landau O(n)',
          },
          {
            step: '04',
            title: 'Engineering & Construction',
            desc: 'Concentric Clean Architecture, Hexagonal Architecture (Ports & Adapters), GoF design patterns, TDD (Test-Driven Development), and strict DDL/DML migrations.',
            standard: 'Clean Arch • TDD • GoF',
          },
          {
            step: '05',
            title: 'Verification & Quality Gates',
            desc: 'Boehm Verification & Validation (V&V), zero fallback debt enforcement, cognitive complexity ceiling (≤ 15), and test coverage ratchets.',
            standard: 'Boehm V&V • ISO 15288',
          },
          {
            step: '06',
            title: 'Telemetry & Evolution',
            desc: 'Full-stack OpenTelemetry instrumentation, RED/USE metrics, error budgets via Service Level Indicators & Objectives (SLIs/SLOs), and continuous cybernetic feedback loops.',
            standard: 'Google SRE • OpenTelemetry',
          },
        ],
      },
      pillars: [
        {
          tag: 'Architecture & Clean Code',
          title: 'Hexagonal Architecture & GoF Patterns',
          desc: 'Concentric layer isolation, Pure Domain boundaries, and strict Thin Controllers (≤ 300 LOC - Lines of Code). Extension via polymorphic strategies and registries without ad-hoc instantiation or tight coupling.',
          ref: 'Cockburn (2005) • Gamma et al. (GoF 1994)',
        },
        {
          tag: 'Quality Invariants',
          title: 'Zero Fallback Debt & Cognitive Ceilings',
          desc: 'Enforcing the 7 golden rules: zero silent error masking, zero unvalidated process.env, and hard cognitive complexity limits (≤ 15 per function). Automated coverage floor ratchets to prevent regression.',
          ref: 'Boehm V&V (1981) • ISO/IEC/IEEE 15288:2023',
        },
        {
          tag: 'Mathematical Performance',
          title: 'Asymptotic Proofs & Queuing Theory',
          desc: 'Hot paths mathematically bounded to O(1) or O(log n). System sizing and queue throughput governed by Little’s Law (L = λW) and Neil Gunther’s USL to prevent bufferbloat and retrograde contention.',
          ref: 'Donald Knuth (1976) • Little (1961) • Gunther (2008)',
        },
        {
          tag: 'Distributed Resilience',
          title: 'Fault Isolation & Transactional Consistency',
          desc: 'Formal consensus and transaction recovery using Compensating Sagas, Transactional Outbox, Circuit Breakers, and ARIES WAL write-ahead logging under PACELC/CAP constraints.',
          ref: 'Lamport (1978) • Mohan et al. (ARIES 1992) • Abadi (2012)',
        },
        {
          tag: 'AI Engineering',
          title: 'Pragmatic GenAI & Syntax Tree (AST)',
          desc: 'Generative AI integration with live Abstract Syntax Tree (AST) symbol inspection, strongly-typed schema validation, and strict verification guardrails.',
          ref: 'Avizienis Dependability Taxonomy (2004)',
        },
        {
          tag: 'Observability & Telemetry',
          title: 'Evidence-Based Decisions & Service Objectives (SLOs)',
          desc: 'Full-stack OpenTelemetry instrumentation, RED/USE golden metrics, and distributed tracing tied to structured logging. Engineering decisions guided by empirical production telemetry, strict Service Level Objectives (SLOs), and blameless post-mortems.',
          ref: 'Google SRE (Beyer et al. 2016) • OpenTelemetry Standard',
        },
      ],
    },
    exp: {
      title: 'Professional Experience',
      jobs: [
        {
          role: 'Senior Software Developer / Consultant',
          corp: 'Accenture',
          year: '08/2025 – Present',
          points: [
            'Architectural blueprinting and systemic planning using OMG UML 2.5 (Class, Sequence, Component) within the credit ecosystem for Auto financing (Santander LATAM) and the Illumia initiative.',
            'Integration of GenAI workflows and relational data governance using declarative DDL and optimized DML operations.',
          ],
        },
        {
          role: 'Software Engineer',
          corp: 'Audsat',
          year: '11/2020 – 08/2026',
          points: [
            'Development and architecture of geographic monitoring solutions for national territory, enabling agricultural credit expansion and risk mitigation for enterprise clients (Banco do Brasil, Itaú, Santander).',
            'Implementation of scalable routes, formal relational database modeling (1NF–BCNF), and high-throughput DML processing to support real-time enterprise decision-making.',
          ],
        },
        {
          role: 'Software Developer',
          corp: 'Orla',
          year: '10/2023 – 04/2024',
          points: [
            'Maintenance and development of new functionalities for the Anbima Data ecosystem, providing financial market intelligence.',
            'Implementation of security layers and protection mechanisms against web scraping in critical APIs.',
          ],
        },
        {
          role: 'Software Consultant',
          corp: 'Ilia',
          year: '01/2023 – 03/2023',
          points: [
            'Technical leadership and mentoring in complex architectural challenges, creating UML structural and behavioral blueprints within the Talent Canada project.',
            'Delivery of the campaign engine for the Asics Cashback platform with normalized schema design and high-efficiency DML transactions.',
          ],
        },
        {
          role: 'Java Developer',
          corp: 'Nexti',
          year: '08/2022 – 01/2023',
          points: [
            'Evolution and technical support of the SaaS system for time and attendance control and work schedule management in Java architecture.',
          ],
        },
        {
          role: 'Software Developer',
          corp: 'Accenture',
          year: '05/2021 – 03/2022',
          points: [
            'Working in the Vivere division for Santander LATAM credit and financing solutions (Peru, Colombia, and Argentina).',
          ],
        },
        {
          role: 'Previous Engineering Roles',
          corp: 'E-Deploy • Leucotron • VIP Softwares',
          year: '2017 – 2020',
          points: [
            'E-Deploy (09/2020 – 11/2020): Development of API order integrations for Burger King with delivery apps.',
            'Leucotron (01/2018 – 09/2020): Development of telecommunications products and support for legacy systems.',
            'VIP Softwares / Quantu (2017): Web development and agricultural management and analytics systems.',
          ],
        },
      ],
    },
    tech: {
      title: 'Technical Skills & Domains',
      subtitle:
        'Production competencies grounded in enterprise delivery, scalable microservices, and modern AI engineering.',
      categories: [
        {
          name: 'Languages & Frameworks',
          items: ['Node.js', 'Java (Spring Boot)', 'React', 'JavaScript / TypeScript', 'Python'],
        },
        {
          name: 'Databases & Storage',
          items: [
            'MongoDB',
            'PostgreSQL',
            'Relational DDL & DML Engineering',
            'Formal Normalization (1NF–BCNF)',
            'Codd Relational Algebra & Chen ERD',
          ],
        },
        {
          name: 'Architecture & DevSecOps',
          items: [
            'Microservices',
            'RESTful APIs',
            'CI/CD Pipelines',
            'Model-Based Systems Engineering (MBSE)',
            'OMG UML 2.5 (Structural & Behavioral)',
            'Event-Driven Architecture',
          ],
        },
        {
          name: 'Methodologies & Rigor',
          items: [
            'GenAI / LLM Integration',
            'Clean Code',
            '23 GoF Design Patterns',
            'Domain-Driven Design (DDD)',
            'Kruchten 4+1 View Architecture',
            'Agile (Scrum / Kanban)',
          ],
        },
      ],
    },
    docs: {
      title: 'Academic & Knowledge Base',
      subtitle:
        'Formal catalog of software architecture, distributed systems, and theoretical foundations with specifications and estimated reading times.',
      c1: {
        title: 'Academic Background & Certifications',
        items: [
          "Bachelor's degree in Information Systems | FAI (Completed 12/2018 - 3,480 hrs)",
          'Programming Technician | On Byte Professional Training (Completed 12/2014)',
          'CS50x: Introduction to Computer Science | HarvardX (Verified 2020)',
          'English: Intermediate/Advanced Level (B2 - UPTIME)',
        ],
      },
      c2: {
        title: 'Core Architectural Catalog',
        items: [
          'SOLID Design Principles (SRP, OCP, LSP, ISP, DIP)',
          'GoF Design Patterns (Creational, Structural, Behavioral)',
          'Systems Engineering & MBSE (OMG UML 2.5, Kruchten 4+1, ISO 15288)',
          'Relational Schema Engineering (Codd Algebra, Chen ERD, DDL/DML, BCNF)',
          'Clean Architecture, Concentric Isolation & Pure Domain',
          'Distributed Systems Theory (CAP, PACELC, FLP, Lamport Clocks)',
          'Database Internals & Recovery (B+ Tree, LSM, ARIES WAL)',
        ],
      },
    },
    docsReader: {
      searchPlaceholder: 'Search architecture topics...',
      archTitle: 'ARCHITECTURE',
      foundationTitle: 'FOUNDATION',
      standard: 'STANDARD',
      loading: 'Loading document...',
      topicsBtn: 'Browse Topics',
    },
    contact: {
      title: "Let's discuss your next project",
      desc: 'Always open to discussing system architecture, distributed networks, or GenAI integrations.',
      btn: 'Send Email',
      rights: 'All rights reserved.',
    },
  },
  pt: {
    languages: {
      pt: 'Português',
      en: 'Inglês',
      es: 'Espanhol',
    },
    nav: {
      exp: 'Experiência',
      methodology: 'Metodologia',
      tech: 'Tecnologias',
      docs: 'Formação e Conhecimento',
      talk: 'Contato',
    },
    hero: {
      badge: 'Engenheiro de Software Sênior & Consultor',
      title: 'Construindo Sistemas Resilientes.',
      subtitle: `Olá, eu sou Matheus Machado, Engenheiro de Software Sênior com mais de ${YEARS_OF_EXPERIENCE} anos de experiência no desenvolvimento, evolução e sustentação de sistemas distribuídos e de missão crítica nos setores financeiro, agrícola e de telecomunicações. Especialista em Node.js, Java (Spring), SQL/NoSQL e integração GenAI.`,
      cta: 'Ver Trajetória Profissional',
      stats: [
        { value: `${YEARS_OF_EXPERIENCE}+ Anos`, label: 'Engenharia em Produção' },
        { value: '3 Grandes Bancos', label: 'Santander, BB & Itaú' },
        { value: 'GenAI + AST', label: 'Árvore de Sintaxe (AST) & Código' },
        { value: 'CS50x', label: 'Certificação HarvardX' },
      ],
    },
    methodology: {
      title: 'Metodologia de Engenharia Aplicada',
      subtitle:
        'Embasada em padrões acadêmicos, modelos formais de engenharia e práticas de produção voltadas para alta confiabilidade.',
      workflow: {
        badge: 'Ciclo de Vida',
        title: 'Fluxo de Engenharia de Sistemas',
        subtitle:
          'Da pesquisa acadêmica e descoberta de mercado até a verificação rigorosa e evolução por telemetria contínua.',
        stages: [
          {
            step: '01',
            title: 'Pesquisa & Descoberta',
            desc: 'Revisão do estado da arte acadêmico, viabilidade mercadológica e levantamento estruturado de necessidades dos stakeholders.',
            standard: 'ISO 29148 • DSR Hevner',
          },
          {
            step: '02',
            title: 'Análise & Modelagem',
            desc: 'Blueprints em OMG UML 2.5, arquitetura de visões 4+1 de Kruchten, modelagem relacional formal Codd/Chen e contratos OCL.',
            standard: 'UML 2.5 • Kruchten 4+1',
          },
          {
            step: '03',
            title: 'Prova de Conceito (PoC)',
            desc: 'Spikes de viabilidade técnica, benchmarks de complexidade assintótica de Landau e convergência por matriz de Pugh.',
            standard: 'Pugh Matrix • Landau O(n)',
          },
          {
            step: '04',
            title: 'Engenharia & Construção',
            desc: 'Clean Architecture concêntrica, Arquitetura Hexagonal (Portas & Adaptadores), 23 padrões GoF, TDD (Desenvolvimento Orientado a Testes) e migrações DDL/DML estritas.',
            standard: 'Clean Arch • TDD • GoF',
          },
          {
            step: '05',
            title: 'Verificação & Qualidade',
            desc: 'Formalismo de Verificação e Validação (V&V) de Boehm, eliminação de fallbacks ocultos (erros mascarados), teto de complexidade cognitiva (≤ 15) e catracas de teste sem regressão.',
            standard: 'Boehm V&V • ISO 15288',
          },
          {
            step: '06',
            title: 'Telemetria & Evolução',
            desc: 'Instrumentação full-stack com OpenTelemetry, métricas RED/USE, orçamentos de erro com Indicadores e Metas de Nível de Serviço (SLIs/SLOs) e feedback contínuo.',
            standard: 'Google SRE • OpenTelemetry',
          },
        ],
      },
      pillars: [
        {
          tag: 'Arquitetura & Clean Code',
          title: 'Arquitetura Hexagonal & Padrões GoF',
          desc: 'Isolamento concêntrico de camadas, Pure Domain livre de dependências de infraestrutura e Thin Controllers (≤ 300 LOC - Linhas de Código). Extensão polimórfica via estratégias e registries sem acoplamento direto.',
          ref: 'Cockburn (2005) • Gamma et al. (GoF 1994)',
        },
        {
          tag: 'Invariantes de Qualidade',
          title: 'Eliminação de Fallbacks Ocultos & Teto de Complexidade',
          desc: 'Execução estrita das 7 regras de ouro: zero mascaramento de exceções (sem fallback silencioso), zero process.env sem validação e teto de complexidade cognitiva (≤ 15 por função). Catraca de testes sem regressão.',
          ref: 'Boehm V&V (1981) • ISO/IEC/IEEE 15288:2023',
        },
        {
          tag: 'Performance Matemática',
          title: 'Provas Assintóticas & Teoria das Filas',
          desc: 'Caminhos críticos com garantias assintóticas O(1) ou O(log n). Dimensionamento de filas e vazão calibrados pela Lei de Little (L = λW) e USL de Neil Gunther para evitar bufferbloat e contenção.',
          ref: 'Donald Knuth (1976) • Little (1961) • Gunther (2008)',
        },
        {
          tag: 'Resiliência Distribuída',
          title: 'Isolamento de Falhas & Consistência Transacional',
          desc: 'Recuperação transacional e coordenação distribuída via Compensating Sagas, Transactional Outbox, Circuit Breakers e ARIES WAL respeitando as fronteiras de PACELC e CAP.',
          ref: 'Lamport (1978) • Mohan et al. (ARIES 1992) • Abadi (2012)',
        },
        {
          tag: 'Engenharia de IA',
          title: 'GenAI Confiável & Árvore de Sintaxe (AST)',
          desc: 'Integração de IA Generativa com inspeção direta de símbolos na Árvore de Sintaxe Abstrata (AST), validação estrita de esquemas tipados e barreiras de verificação.',
          ref: 'Avizienis Dependability Taxonomy (2004)',
        },
        {
          tag: 'Observabilidade & Decisão',
          title: 'Decisões por Evidência & Metas de Serviço (SLOs)',
          desc: 'Instrumentação com OpenTelemetry, métricas RED/USE e rastreamento distribuído correlacionado a logs estruturados. Tomada de decisão orientada a dados reais de produção, Objetivos de Nível de Serviço (SLOs - Service Level Objectives) estritos e pós-mortems sem culpa.',
          ref: 'Google SRE (Beyer et al. 2016) • Padrão OpenTelemetry',
        },
      ],
    },
    exp: {
      title: 'Experiência Profissional',
      jobs: [
        {
          role: 'Desenvolvedor de Software Sênior / Consultor',
          corp: 'Accenture',
          year: '08/2025 – Presente',
          points: [
            'Planejamento sistêmico e especificação de blueprints arquiteturais com OMG UML 2.5 (Classes, Sequência, Componentes) no ecossistema de crédito para veículos (Santander LATAM) e iniciativa Illumia.',
            'Integração de workflows GenAI e governança de dados relacionais via modelagem declarativa DDL e operações otimizadas em DML.',
          ],
        },
        {
          role: 'Engenheiro de Software',
          corp: 'Audsat',
          year: '11/2020 – 08/2026',
          points: [
            'Desenvolvimento e arquitetura de soluções de monitoramento geográfico para o território nacional, viabilizando a expansão do crédito agrícola e mitigação de risco para clientes enterprise (Banco do Brasil, Itaú, Santander).',
            'Implementação de rotas escaláveis, modelagem relacional formal (1NF–BCNF) e processamento DML de alta vazão para suporte a decisões enterprise em tempo real.',
          ],
        },
        {
          role: 'Desenvolvedor de Software',
          corp: 'Orla',
          year: '10/2023 – 04/2024',
          points: [
            'Manutenção e desenvolvimento de novas funcionalidades para o ecossistema Anbima Data, provendo inteligência de mercado financeiro.',
            'Implementação de camadas de segurança e mecanismos de proteção contra web scraping em APIs críticas.',
          ],
        },
        {
          role: 'Consultor de Software',
          corp: 'Ilia',
          year: '01/2023 – 03/2023',
          points: [
            'Liderança técnica e mentoria de desenvolvedores em desafios arquiteturais complexos, elaborando blueprints estruturais e comportamentais em UML no projeto Talent Canada.',
            'Desenvolvimento e entrega do motor de campanhas para a plataforma Asics Cashback com esquemas normalizados e transações DML de alta eficiência.',
          ],
        },
        {
          role: 'Desenvolvedor Java',
          corp: 'Nexti',
          year: '08/2022 – 01/2023',
          points: [
            'Evolução e suporte técnico do sistema SaaS para controle de ponto e gestão de escalas de trabalho em arquitetura Java.',
          ],
        },
        {
          role: 'Desenvolvedor de Software',
          corp: 'Accenture',
          year: '05/2021 – 03/2022',
          points: [
            'Atuação na divisão Vivere para soluções de crédito e financiamento Santander LATAM (Peru, Colômbia e Argentina).',
          ],
        },
        {
          role: 'Experiências Anteriores',
          corp: 'E-Deploy • Leucotron • VIP Softwares',
          year: '2017 – 2020',
          points: [
            'E-Deploy (09/2020 – 11/2020): Desenvolvimento de integrações de API de pedidos para o Burger King com aplicativos de entrega.',
            'Leucotron (01/2018 – 09/2020): Desenvolvimento de produtos de telecomunicações e suporte a sistemas legados.',
            'VIP Softwares / Quantu (2017): Desenvolvimento web e sistemas analíticos de gestão agrícola.',
          ],
        },
      ],
    },
    tech: {
      title: 'Habilidades Técnicas & Domínios',
      subtitle:
        'Competências de produção consolidadas em grandes corporações, microsserviços escaláveis e IA aplicada.',
      categories: [
        {
          name: 'Linguagens & Frameworks',
          items: ['Node.js', 'Java (Spring Boot)', 'React', 'JavaScript / TypeScript', 'Python'],
        },
        {
          name: 'Bancos de Dados & Storage',
          items: [
            'MongoDB',
            'PostgreSQL',
            'Engenharia de Schemas DDL & DML',
            'Normalização Formal (1NF–BCNF)',
            'Álgebra de Codd & Chen ERD',
          ],
        },
        {
          name: 'Arquitetura & DevSecOps',
          items: [
            'Microsserviços',
            'APIs RESTful',
            'Pipelines CI/CD',
            'Model-Based Systems Engineering (MBSE)',
            'OMG UML 2.5 (Estrutural & Comportamental)',
            'Arquitetura Orientada a Eventos',
          ],
        },
        {
          name: 'Metodologias & Rigor',
          items: [
            'Integração GenAI / LLMs',
            'Clean Code',
            '23 Padrões GoF',
            'Domain-Driven Design (DDD)',
            'Kruchten 4+1 View Architecture',
            'Metodologias Ágeis (Scrum / Kanban)',
          ],
        },
      ],
    },
    docs: {
      title: 'Formação Acadêmica & Conhecimento',
      subtitle:
        'Catálogo formal de arquitetura, sistemas distribuídos e fundamentos teóricos com especificações e tempos de leitura estimados.',
      c1: {
        title: 'Formação & Certificações',
        items: [
          'Bacharelado em Sistemas de Informação | FAI (Concluído em 12/2018 - 3.480 horas)',
          'Técnico em Programação | On Byte Formação Profissional (Concluído em 12/2014)',
          'CS50x: Introduction to Computer Science | HarvardX (Verificado em 2020)',
          'Inglês: Nível Intermediário/Avançado (B2 - UPTIME)',
        ],
      },
      c2: {
        title: 'Fundamentos de Arquitetura de Software',
        items: [
          'Princípios de Design SOLID (SRP, OCP, LSP, ISP, DIP)',
          'Padrões de Projeto GoF (Criacionais, Estruturais, Comportamentais)',
          'Engenharia de Sistemas & MBSE (OMG UML 2.5, Kruchten 4+1, ISO 15288)',
          'Engenharia de Esquemas Relacionais (Álgebra de Codd, Chen ERD, DDL/DML, BCNF)',
          'Clean Architecture, Isolamento Concêntrico & Pure Domain',
          'Teoria de Sistemas Distribuídos (CAP, PACELC, FLP, Lamport Clocks)',
          'Recuperação de Bancos e WAL (B+ Tree, LSM, ARIES WAL)',
        ],
      },
    },
    docsReader: {
      searchPlaceholder: 'Buscar tópicos de arquitetura...',
      archTitle: 'ARQUITETURA',
      foundationTitle: 'FUNDAMENTOS',
      standard: 'PADRÃO',
      loading: 'Carregando documento...',
      topicsBtn: 'Navegar por Tópicos',
    },
    contact: {
      title: 'Vamos conversar sobre o seu próximo projeto?',
      desc: 'Sempre aberto para discutir arquitetura de sistemas, redes distribuídas ou contratação para projetos de alta criticidade.',
      btn: 'Enviar E-mail',
      rights: 'Todos os direitos reservados.',
    },
  },
  es: {
    languages: {
      pt: 'Portugués',
      en: 'Inglés',
      es: 'Español',
    },
    nav: {
      exp: 'Experiencia',
      methodology: 'Metodología',
      tech: 'Tecnologías',
      docs: 'Formación y Conocimiento',
      talk: 'Contacto',
    },
    hero: {
      badge: 'Ingeniero de Software Senior & Consultor',
      title: 'Construyendo Sistemas Resilientes.',
      subtitle: `Hola, soy Matheus Machado, Ingeniero de Software Senior con más de ${YEARS_OF_EXPERIENCE} años de experiencia en desarrollo, evolución y soporte de sistemas distribuidos y críticos en finanzas, agricultura y telecomunicaciones. Especialista en Node.js, Java (Spring), SQL/NoSQL y GenAI.`,
      cta: 'Ver Trayectoria Profesional',
      stats: [
        { value: `${YEARS_OF_EXPERIENCE}+ Años`, label: 'Ingeniería en Producción' },
        { value: '3 Grandes Bancos', label: 'Santander, BB & Itaú' },
        { value: 'GenAI + AST', label: 'Árbol de Sintaxis (AST) & Código' },
        { value: 'CS50x', label: 'Certificación HarvardX' },
      ],
    },
    methodology: {
      title: 'Metodología de Ingeniería Aplicada',
      subtitle:
        'Basada en estándares académicos, modelos formales de ingeniería y prácticas de producción diseñadas para alta confiabilidad.',
      workflow: {
        badge: 'Ciclo de Vida',
        title: 'Flujo de Ingeniería de Sistemas',
        subtitle:
          'Desde la investigación académica y análisis de mercado hasta la verificación rigurosa y telemetría continua.',
        stages: [
          {
            step: '01',
            title: 'Investigación & Descubrimiento',
            desc: 'Revisión del estado del arte académico, viabilidad de mercado y levantamiento estructurado de requisitos de stakeholders.',
            standard: 'ISO 29148 • DSR Hevner',
          },
          {
            step: '02',
            title: 'Análisis & Modelado',
            desc: 'Blueprints en OMG UML 2.5, arquitectura de vistas 4+1 de Kruchten, modelado relacional formal Codd/Chen y contratos OCL.',
            standard: 'UML 2.5 • Kruchten 4+1',
          },
          {
            step: '03',
            title: 'Prueba de Concepto (PoC)',
            desc: 'Spikes de viabilidad técnica, pruebas de complejidad asintótica de Landau y convergencia con matriz de decisión de Pugh.',
            standard: 'Pugh Matrix • Landau O(n)',
          },
          {
            step: '04',
            title: 'Ingeniería & Construcción',
            desc: 'Clean Architecture concéntrica, Arquitectura Hexagonal (Puertos & Adaptadores), 23 patrones GoF, TDD (Desarrollo Guiado por Pruebas) y migraciones DDL/DML estrictas.',
            standard: 'Clean Arch • TDD • GoF',
          },
          {
            step: '05',
            title: 'Verificación & Calidad',
            desc: 'Formalismo de Verificación y Validación (V&V) de Boehm, eliminación de fallbacks ocultos (errores enmascarados), límite de complejidad cognitiva (≤ 15) y trinquetes de prueba sin regresión.',
            standard: 'Boehm V&V • ISO 15288',
          },
          {
            step: '06',
            title: 'Telemetría & Evolución',
            desc: 'Instrumentación con OpenTelemetry, métricas RED/USE, presupuestos de error con Indicadores y Metas de Nivel de Servicio (SLIs/SLOs) y ciclo de retroalimentación continuo.',
            standard: 'Google SRE • OpenTelemetry',
          },
        ],
      },
      pillars: [
        {
          tag: 'Arquitectura & Clean Code',
          title: 'Arquitectura Hexagonal & Patrones GoF',
          desc: 'Aislamiento concéntrico de capas, Pure Domain libre de dependencias y Thin Controllers (≤ 300 LOC - Líneas de Código). Extensión polimórfica mediante estrategias y registries sin acoplamiento rígido.',
          ref: 'Cockburn (2005) • Gamma et al. (GoF 1994)',
        },
        {
          tag: 'Invariantes de Calidad',
          title: 'Eliminación de Fallbacks Ocultos & Techo de Complejidad',
          desc: 'Cumplimiento de las 7 reglas de oro: cero enmascaramiento silencioso de errores (cero deuda de fallback), cero variables de entorno sin validar y límite de complejidad cognitiva (≤ 15 por función).',
          ref: 'Boehm V&V (1981) • ISO/IEC/IEEE 15288:2023',
        },
        {
          tag: 'Rendimiento Matemático',
          title: 'Pruebas Asintóticas & Teoría de Colas',
          desc: 'Rutas críticas con garantías asintóticas O(1) u O(log n). Dimensionamiento y flujo de colas calibrados mediante la Ley de Little (L = λW) y USL de Gunther para evitar bufferbloat.',
          ref: 'Donald Knuth (1976) • Little (1961) • Gunther (2008)',
        },
        {
          tag: 'Resiliencia Distribuida',
          title: 'Aislamiento de Fallos & Consistencia Transaccional',
          desc: 'Recuperación transaccional y coordinación distribuida con Compensating Sagas, Transactional Outbox, Circuit Breakers y ARIES WAL bajo límites PACELC/CAP.',
          ref: 'Lamport (1978) • Mohan et al. (ARIES 1992) • Abadi (2012)',
        },
        {
          tag: 'Ingeniería de IA',
          title: 'GenAI Confiable & Árbol de Sintaxis (AST)',
          desc: 'Integración de IA Generativa con inspección directa de símbolos en el Árbol de Sintaxis Abstracta (AST), validación estricta de esquemas tipados y barreras de verificación.',
          ref: 'Avizienis Dependability Taxonomy (2004)',
        },
        {
          tag: 'Observabilidad & Decisión',
          title: 'Decisiones por Evidencia & Metas de Servicio (SLOs)',
          desc: 'Instrumentación con OpenTelemetry, métricas RED/USE y rastreo distribuido ligado a logs estructurados. Toma de decisiones guiada por telemetría real de producción, Objetivos de Nivel de Servicio (SLOs - Service Level Objectives) estrictos y post-mortems sin culpa.',
          ref: 'Google SRE (Beyer et al. 2016) • Estándar OpenTelemetry',
        },
      ],
    },
    exp: {
      title: 'Experiencia Profesional',
      jobs: [
        {
          role: 'Desarrollador de Software Senior / Consultor',
          corp: 'Accenture',
          year: '08/2025 – Presente',
          points: [
            'Planificación sistémica y especificación de blueprints arquitectónicos con OMG UML 2.5 (Clases, Secuencia, Componentes) en crédito automotriz (Santander LATAM) e iniciativa Illumia.',
            'Integración de flujos GenAI y gobernanza de datos relacionales mediante DDL declarativo y operaciones DML optimizadas.',
          ],
        },
        {
          role: 'Ingeniero de Software',
          corp: 'Audsat',
          year: '11/2020 – 08/2026',
          points: [
            'Desarrollo y arquitectura de soluciones de monitoreo geográfico nacional para mitigación de riesgo agrícola (BB, Itaú, Santander).',
            'Implementación de rutas escalables, modelado relacional formal (1NF–BCNF) y procesamiento DML de alto rendimiento.',
          ],
        },
        {
          role: 'Desarrollador de Software',
          corp: 'Orla',
          year: '10/2023 – 04/2024',
          points: [
            'Mantenimiento y desarrollo de nuevas funcionalidades para el ecosistema Anbima Data.',
            'Implementación de capas de seguridad contra web scraping en APIs críticas.',
          ],
        },
        {
          role: 'Consultor de Software',
          corp: 'Ilia',
          year: '01/2023 – 03/2023',
          points: [
            'Liderazgo técnico y mentoría en desafíos arquitectónicos complejos, creando diagramas estructurales y de comportamiento en UML en Talent Canada.',
            'Desarrollo y entrega del motor de campañas para la plataforma Asics Cashback con diseño de esquemas normalizados y transacciones DML eficientes.',
          ],
        },
        {
          role: 'Desarrollador Java',
          corp: 'Nexti',
          year: '08/2022 – 01/2023',
          points: ['Evolución y soporte técnico de sistema SaaS para control de asistencia y horarios en Java.'],
        },
        {
          role: 'Desarrollador de Software',
          corp: 'Accenture',
          year: '05/2021 – 03/2022',
          points: ['División Vivere para soluciones de crédito Santander LATAM (Perú, Colombia y Argentina).'],
        },
        {
          role: 'Experiencias Anteriores',
          corp: 'E-Deploy • Leucotron • VIP Softwares',
          year: '2017 – 2020',
          points: [
            'E-Deploy (09/2020 – 11/2020): Desarrollo de integraciones API para Burger King con apps de delivery.',
            'Leucotron (01/2018 – 09/2020): Desarrollo de productos de telecomunicaciones y soporte a sistemas legacy.',
            'VIP Softwares / Quantu (2017): Desarrollo web y sistemas analíticos de gestión agrícola.',
          ],
        },
      ],
    },
    tech: {
      title: 'Habilidades Técnicas & Dominios',
      subtitle: 'Competencias de producción consolidadas en banca enterprise, microservicios e ingeniería de IA.',
      categories: [
        {
          name: 'Lenguajes y Frameworks',
          items: ['Node.js', 'Java (Spring Boot)', 'React', 'JavaScript / TypeScript', 'Python'],
        },
        {
          name: 'Bases de Datos & Storage',
          items: [
            'MongoDB',
            'PostgreSQL',
            'Ingeniería de Esquemas DDL & DML',
            'Normalización Formal (1NF–BCNF)',
            'Álgebra de Codd & Chen ERD',
          ],
        },
        {
          name: 'Arquitectura & DevSecOps',
          items: [
            'Microservicios',
            'APIs RESTful',
            'Pipelines CI/CD',
            'Model-Based Systems Engineering (MBSE)',
            'OMG UML 2.5 (Estructural y Comportamental)',
            'Arquitectura Orientada a Eventos',
          ],
        },
        {
          name: 'Metodologías & Rigor',
          items: [
            'Integración GenAI / LLMs',
            'Clean Code',
            '23 Patrones GoF',
            'Domain-Driven Design (DDD)',
            'Kruchten 4+1 View Architecture',
            'Metodologías Ágiles (Scrum / Kanban)',
          ],
        },
      ],
    },
    docs: {
      title: 'Formación Académica & Conocimiento',
      subtitle:
        'Catálogo formal de arquitectura, sistemas distribuidos y fundamentos teóricos con especificaciones y tiempos de lectura estimados.',
      c1: {
        title: 'Formación & Certificaciones',
        items: [
          'Licenciatura en Sistemas de Información | FAI (Concluida en 12/2018 - 3.480 horas)',
          'Técnico en Programación | On Byte Formación Profesional (Concluida en 12/2014)',
          'CS50x: Introduction to Computer Science | HarvardX (Verificado en 2020)',
          'Inglés: Nivel Intermedio/Avanzado (B2 - UPTIME)',
        ],
      },
      c2: {
        title: 'Fundamentos de Arquitectura de Software',
        items: [
          'Principios de Diseño SOLID (SRP, OCP, LSP, ISP, DIP)',
          'Patrones de Diseño GoF (Creacionales, Estructurales, Comportamentales)',
          'Ingeniería de Sistemas & MBSE (OMG UML 2.5, Kruchten 4+1, ISO 15288)',
          'Ingeniería de Esquemas Relacionales (Álgebra de Codd, Chen ERD, DDL/DML, BCNF)',
          'Clean Architecture, Aislamiento Concéntrico & Pure Domain',
          'Teoría de Sistemas Distribuidos (CAP, PACELC, FLP, Lamport Clocks)',
          'Recuperación de Bases de Datos y WAL (B+ Tree, LSM, ARIES WAL)',
        ],
      },
    },
    docsReader: {
      searchPlaceholder: 'Buscar temas de arquitectura...',
      archTitle: 'ARQUITECTURA',
      foundationTitle: 'FUNDAMENTOS',
      standard: 'ESTÁNDAR',
      loading: 'Cargando documento...',
      topicsBtn: 'Explorar Temas',
    },
    contact: {
      title: '¿Conversamos sobre su próximo proyecto?',
      desc: 'Siempre abierto a discutir arquitectura de sistemas, redes distribuidas o contratación para proyectos críticos.',
      btn: 'Enviar Correo',
      rights: 'Todos los derechos reservados.',
    },
  },
};
