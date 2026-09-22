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
      es: 'Spanish'
    },
    nav: { exp: 'Experience', methodology: 'Methodology', tech: 'Tech Stack', docs: 'Education & Knowledge', talk: "Let's Talk" },
    hero: {
      badge: 'Senior Software Engineer & Consultant',
      title: 'Building Resilient Systems.',
      subtitle: 'Senior Software Engineer with over 8 years of experience in distributed and mission-critical systems across finance, agriculture, and telecommunications. Expertise in Node.js, Java (Spring), SQL/NoSQL, and GenAI integration.',
      cta: 'View Career Journey',
      dragHint: 'Drag to rotate 3D studio',
      stats: [
        { value: '8+ Years', label: 'Production Engineering' },
        { value: '3 Tier-1 Banks', label: 'Santander, BB & Itaú' },
        { value: 'GenAI + AST', label: 'Deterministic Workflows' },
        { value: 'CS50x', label: 'HarvardX Certified' }
      ]
    },
    methodology: {
      title: 'Applied Engineering Methodology',
      subtitle: 'Grounded in academic standards, formal mathematical models, and battle-tested production invariants to guarantee maximum software resilience.',
      pillars: [
        {
          tag: 'Architecture & Clean Code',
          title: 'Hexagonal Ports & Canonical GoF',
          desc: 'Concentric layer isolation, Pure Domain boundaries, and strict Thin Controllers (≤ 300 LOC). Extension via polymorphic strategies and registries without ad-hoc instantiation or tight coupling.',
          ref: 'Cockburn (2005) • Gamma et al. (GoF 1994)'
        },
        {
          tag: 'Quality Invariants',
          title: 'Zero Fallback Debt & Cognitive Ceilings',
          desc: 'Enforcing the 7 golden rules: zero silent error masking, zero unvalidated process.env, and hard cognitive complexity limits (≤ 15 per function). Automated coverage floor ratchets to prevent regression.',
          ref: 'Boehm V&V (1981) • ISO/IEC/IEEE 15288:2023'
        },
        {
          tag: 'Mathematical Performance',
          title: 'Asymptotic Proofs & Queuing Theory',
          desc: 'Hot paths mathematically bounded to O(1) or O(log n). System sizing and queue throughput governed by Little’s Law (L = λW) and Neil Gunther’s USL to prevent bufferbloat and retrograde contention.',
          ref: 'Donald Knuth (1976) • Little (1961) • Gunther (2008)'
        },
        {
          tag: 'Distributed Resilience',
          title: 'Fault Isolation & Transactional Consistency',
          desc: 'Formal consensus and transaction recovery using Compensating Sagas, Transactional Outbox, Circuit Breakers, and ARIES WAL write-ahead logging under PACELC/CAP constraints.',
          ref: 'Lamport (1978) • Mohan et al. (ARIES 1992) • Abadi (2012)'
        },
        {
          tag: 'AI Engineering',
          title: 'Deterministic & Grounded GenAI',
          desc: 'Disciplined Generative AI orchestration governed by empirical skepticism, live AST symbol inspection, strongly-typed schema validation, and zero-hallucination guardrails.',
          ref: 'Avizienis Dependability Taxonomy (2004)'
        },
        {
          tag: 'Observability & Telemetry',
          title: 'Evidence-Based Decisions & SLOs',
          desc: 'Full-stack OpenTelemetry instrumentation, RED/USE golden metrics, and distributed tracing tied to structured logging. Engineering decisions guided by empirical production telemetry, strict SLIs/SLOs, and blameless post-mortems.',
          ref: 'Google SRE (Beyer et al. 2016) • OpenTelemetry Standard'
        }
      ]
    },
    exp: {
      title: 'Professional Experience',
      jobs: [
        {
          role: 'Senior Software Developer / Consultant',
          corp: 'Accenture',
          year: '08/2025 – Present',
          points: [
            'Experience in the Pioneer division working on projects within the credit ecosystem for Auto financing (Santander LATAM) and the Illumia initiative.',
            'Integration and application of GenAI-based solutions for optimizing internal processes and evolving products.'
          ]
        },
        {
          role: 'Software Engineer',
          corp: 'Audsat',
          year: '11/2020 – 08/2026',
          points: [
            'Development and architecture of geographic monitoring solutions for national territory, enabling agricultural credit expansion and risk mitigation for enterprise clients (Banco do Brasil, Itaú, Santander).',
            'Implementation of scalable routes and data processing to support high-volume decision-making.'
          ]
        },
        {
          role: 'Software Developer',
          corp: 'Orla',
          year: '10/2023 – 04/2024',
          points: [
            'Maintenance and development of new functionalities for the Anbima Data ecosystem, providing financial market intelligence.',
            'Implementation of security layers and protection mechanisms against web scraping in critical APIs.'
          ]
        },
        {
          role: 'Software Consultant',
          corp: 'Ilia',
          year: '01/2023 – 03/2023',
          points: [
            'Technical leadership and mentoring of developers in complex architectural challenges within the Talent Canada project.',
            'Development and delivery of the campaign engine for the Asics Cashback platform.'
          ]
        },
        {
          role: 'Java Developer',
          corp: 'Nexti',
          year: '08/2022 – 01/2023',
          points: [
            'Evolution and technical support of the SaaS system for time and attendance control and work schedule management in Java architecture.'
          ]
        },
        {
          role: 'Software Developer',
          corp: 'Accenture',
          year: '05/2021 – 03/2022',
          points: [
            'Working in the Vivere division for Santander LATAM credit and financing solutions (Peru, Colombia, and Argentina).'
          ]
        },
        {
          role: 'Previous Engineering Roles',
          corp: 'E-Deploy • Leucotron • VIP Softwares',
          year: '2017 – 2020',
          points: [
            'E-Deploy (09/2020 – 11/2020): Development of API order integrations for Burger King with delivery apps.',
            'Leucotron (01/2018 – 09/2020): Development of telecommunications products and support for legacy systems.',
            'VIP Softwares / How much (2017): Web development and agricultural management and analytics systems.'
          ]
        }
      ]
    },
    tech: {
      title: 'Technical Skills & Domains',
      subtitle: 'Production competencies grounded in enterprise delivery, scalable microservices, and modern AI engineering.',
      categories: [
        {
          name: 'Languages & Frameworks',
          items: ['Node.js', 'Java (Spring Boot)', 'React', 'JavaScript / TypeScript', 'Python']
        },
        {
          name: 'Databases & Storage',
          items: ['MongoDB', 'PostgreSQL', 'SQL Relational Engines', 'Storage Optimization']
        },
        {
          name: 'Architecture & DevSecOps',
          items: ['Microservices', 'RESTful APIs', 'CI/CD Pipelines', 'Security Hardening', 'Event-Driven Architecture']
        },
        {
          name: 'Methodologies & Rigor',
          items: ['GenAI / LLM Integration', 'Clean Code', '23 GoF Design Patterns', 'Domain-Driven Design (DDD)', 'Agile (Scrum / Kanban)']
        }
      ]
    },
    docs: {
      title: 'Academic & Knowledge Base',
      c1: {
        title: 'Academic Background & Certifications',
        items: [
          "Bachelor's degree in Information Systems | FAI (Completed 12/2018 - 3,480 hrs)",
          'Programming Technician | On Byte Professional Training (Completed 12/2014)',
          'CS50x: Introduction to Computer Science | HarvardX (Verified 2020)',
          'English: Intermediate/Advanced Level (B2 - UPTIME)'
        ]
      },
      c2: {
        title: 'Seminal Architectural Catalog',
        items: [
          'SOLID Design Principles (SRP, OCP, LSP, ISP, DIP)',
          'GoF Design Patterns (Creational, Structural, Behavioral)',
          'Clean Architecture, Concentric Isolation & Pure Domain',
          'Distributed Systems Theory (CAP, PACELC, FLP, Lamport Clocks)',
          'Database Internals & Recovery (B+ Tree, LSM, ARIES WAL)'
        ]
      }
    },
    contact: {
      title: 'Ready to build something extraordinary?',
      desc: "Always open to discussing system architecture, distributed networks, or GenAI integrations.",
      btn: 'Send Email',
      rights: 'All rights reserved.'
    }
  },
  pt: {
    languages: {
      pt: 'Português',
      en: 'Inglês',
      es: 'Espanhol'
    },
    nav: { exp: 'Experiência', methodology: 'Metodologia', tech: 'Tecnologias', docs: 'Formação e Conhecimento', talk: "Contato" },
    hero: {
      badge: 'Engenheiro de Software Sênior & Consultor',
      title: 'Construindo Sistemas Resilientes.',
      subtitle: 'Engenheiro de Software Sênior com mais de 8 anos de experiência no desenvolvimento, evolução e sustentação de sistemas distribuídos e de missão crítica nos setores financeiro, agrícola e de telecomunicações. Especialista em Node.js, Java (Spring), SQL/NoSQL e integração GenAI.',
      cta: 'Ver Trajetória Profissional',
      dragHint: 'Arraste para girar o estúdio 3D',
      stats: [
        { value: '8+ Anos', label: 'Engenharia em Produção' },
        { value: '3 Grandes Bancos', label: 'Santander, BB & Itaú' },
        { value: 'GenAI + AST', label: 'Workflows Determinísticos' },
        { value: 'CS50x', label: 'Certificação HarvardX' }
      ]
    },
    methodology: {
      title: 'Metodologia de Engenharia Aplicada',
      subtitle: 'Embasada em padrões acadêmicos, modelos matemáticos formais e invariantes de produção comprovados para assegurar o nível máximo de confiabilidade em cada entrega.',
      pillars: [
        {
          tag: 'Arquitetura & Clean Code',
          title: 'Hexagonal Ports & Padrões GoF Canônicos',
          desc: 'Isolamento concêntrico de camadas, Pure Domain livre de dependências de infraestrutura e Thin Controllers (≤ 300 LOC). Extensão polimórfica via estratégias e registries sem acoplamento direto.',
          ref: 'Cockburn (2005) • Gamma et al. (GoF 1994)'
        },
        {
          tag: 'Invariantes de Qualidade',
          title: 'Zero Fallback Debt & Teto de Complexidade',
          desc: 'Execução estrita das 7 regras de ouro: zero mascaramento de exceções, zero process.env sem validação e teto de complexidade cognitiva (≤ 15 por função). Catraca de testes sem regressão.',
          ref: 'Boehm V&V (1981) • ISO/IEC/IEEE 15288:2023'
        },
        {
          tag: 'Performance Matemática',
          title: 'Provas Assintóticas & Teoria das Filas',
          desc: 'Caminhos críticos com garantias assintóticas O(1) ou O(log n). Dimensionamento de filas e vazão calibrados pela Lei de Little (L = λW) e USL de Neil Gunther para evitar bufferbloat e contenção.',
          ref: 'Donald Knuth (1976) • Little (1961) • Gunther (2008)'
        },
        {
          tag: 'Resiliência Distribuída',
          title: 'Isolamento de Falhas & Consistência Transacional',
          desc: 'Recuperação transacional e coordenação distribuída via Compensating Sagas, Transactional Outbox, Circuit Breakers e ARIES WAL respeitando as fronteiras de PACELC e CAP.',
          ref: 'Lamport (1978) • Mohan et al. (ARIES 1992) • Abadi (2012)'
        },
        {
          tag: 'Engenharia de IA',
          title: 'GenAI Determinística & Grounding em AST',
          desc: 'Orquestração disciplinada de IA Generativa guiada por ceticismo empírico, inspeção de símbolos na AST viva, validação estrita de esquemas tipados e guardrails anti-alucinação.',
          ref: 'Avizienis Dependability Taxonomy (2004)'
        },
        {
          tag: 'Observabilidade & Decisão',
          title: 'Decisões Baseadas em Evidência & SLOs',
          desc: 'Instrumentação com OpenTelemetry, métricas RED/USE e rastreamento distribuído correlacionado a logs estruturados. Tomada de decisão orientada a dados reais de produção, SLIs/SLOs estritos e pós-mortems sem culpa.',
          ref: 'Google SRE (Beyer et al. 2016) • Padrão OpenTelemetry'
        }
      ]
    },
    exp: {
      title: 'Experiência Profissional',
      jobs: [
        {
          role: 'Desenvolvedor de Software Sênior / Consultor',
          corp: 'Accenture',
          year: '08/2025 – Presente',
          points: [
            'Atuação na divisão Pioneer trabalhando em projetos no ecossistema de crédito para financiamento de veículos (Santander LATAM) e iniciativa Illumia.',
            'Integração e aplicação de soluções baseadas em GenAI para otimização de processos internos e evolução de produtos.'
          ]
        },
        {
          role: 'Engenheiro de Software',
          corp: 'Audsat',
          year: '11/2020 – 08/2026',
          points: [
            'Desenvolvimento e arquitetura de soluções de monitoramento geográfico para o território nacional, viabilizando a expansão do crédito agrícola e mitigação de risco para clientes enterprise (Banco do Brasil, Itaú, Santander).',
            'Implementação de rotas escaláveis e processamento de dados para suportar tomada de decisão em alto volume.'
          ]
        },
        {
          role: 'Desenvolvedor de Software',
          corp: 'Orla',
          year: '10/2023 – 04/2024',
          points: [
            'Manutenção e desenvolvimento de novas funcionalidades para o ecossistema Anbima Data, provendo inteligência de mercado financeiro.',
            'Implementação de camadas de segurança e mecanismos de proteção contra web scraping em APIs críticas.'
          ]
        },
        {
          role: 'Consultor de Software',
          corp: 'Ilia',
          year: '01/2023 – 03/2023',
          points: [
            'Liderança técnica e mentoria de desenvolvedores em desafios arquiteturais complexos no projeto Talent Canada.',
            'Desenvolvimento e entrega do motor de campanhas para a plataforma Asics Cashback.'
          ]
        },
        {
          role: 'Desenvolvedor Java',
          corp: 'Nexti',
          year: '08/2022 – 01/2023',
          points: [
            'Evolução e suporte técnico do sistema SaaS para controle de ponto e gestão de escalas de trabalho em arquitetura Java.'
          ]
        },
        {
          role: 'Desenvolvedor de Software',
          corp: 'Accenture',
          year: '05/2021 – 03/2022',
          points: [
            'Atuação na divisão Vivere para soluções de crédito e financiamento Santander LATAM (Peru, Colômbia e Argentina).'
          ]
        },
        {
          role: 'Experiências Anteriores',
          corp: 'E-Deploy • Leucotron • VIP Softwares',
          year: '2017 – 2020',
          points: [
            'E-Deploy (09/2020 – 11/2020): Desenvolvimento de integrações de API de pedidos para o Burger King com aplicativos de entrega.',
            'Leucotron (01/2018 – 09/2020): Desenvolvimento de produtos de telecomunicações e suporte a sistemas legados.',
            'VIP Softwares / How much (2017): Desenvolvimento web e sistemas analíticos de gestão agrícola.'
          ]
        }
      ]
    },
    tech: {
      title: 'Habilidades Técnicas & Domínios',
      subtitle: 'Competências de produção consolidadas em grandes corporações, microsserviços escaláveis e IA aplicada.',
      categories: [
        {
          name: 'Linguagens & Frameworks',
          items: ['Node.js', 'Java (Spring Boot)', 'React', 'JavaScript / TypeScript', 'Python']
        },
        {
          name: 'Bancos de Dados & Storage',
          items: ['MongoDB', 'PostgreSQL', 'Bancos Relacionais SQL', 'Otimização de Índices e Cache']
        },
        {
          name: 'Arquitetura & DevSecOps',
          items: ['Microsserviços', 'APIs RESTful', 'Pipelines CI/CD', 'Hardening & Segurança', 'Arquitetura Orientada a Eventos']
        },
        {
          name: 'Metodologias & Rigor',
          items: ['Integração GenAI / LLMs', 'Clean Code', '23 Padrões GoF', 'Domain-Driven Design (DDD)', 'Metodologias Ágeis (Scrum / Kanban)']
        }
      ]
    },
    docs: {
      title: 'Formação Acadêmica & Conhecimento',
      c1: {
        title: 'Formação & Certificações',
        items: [
          'Bacharelado em Sistemas de Informação | FAI (Concluído em 12/2018 - 3.480 horas)',
          'Técnico em Programação | On Byte Formação Profissional (Concluído em 12/2014)',
          'CS50x: Introduction to Computer Science | HarvardX (Verificado em 2020)',
          'Inglês: Nível Intermediário/Avançado (B2 - UPTIME)'
        ]
      },
      c2: {
        title: 'Catálogo de Arquitetura Canônica',
        items: [
          'Princípios de Design SOLID (SRP, OCP, LSP, ISP, DIP)',
          'Padrões GoF Canônicos (Criacionais, Estruturais, Comportamentais)',
          'Clean Architecture, Isolamento Concêntrico & Pure Domain',
          'Teoria de Sistemas Distribuídos (CAP, PACELC, FLP, Lamport Clocks)',
          'Recuperação de Bancos e WAL (B+ Tree, LSM, ARIES WAL)'
        ]
      }
    },
    contact: {
      title: 'Pronto para criar algo extraordinário?',
      desc: "Sempre aberto para discutir arquitetura de sistemas, redes distribuídas ou contratação para projetos de alta criticidade.",
      btn: 'Enviar E-mail',
      rights: 'Todos os direitos reservados.'
    }
  },
  es: {
    languages: {
      pt: 'Portugués',
      en: 'Inglés',
      es: 'Español'
    },
    nav: { exp: 'Experiencia', methodology: 'Metodología', tech: 'Tecnologías', docs: 'Formación y Conocimiento', talk: "Contacto" },
    hero: {
      badge: 'Ingeniero de Software Senior & Consultor',
      title: 'Construyendo Sistemas Resilientes.',
      subtitle: 'Ingeniero de Software Senior con más de 8 años de experiencia en desarrollo, evolución y soporte de sistemas distribuidos y críticos en finanzas, agricultura y telecomunicaciones. Especialista en Node.js, Java (Spring), SQL/NoSQL y GenAI.',
      cta: 'Ver Trayectoria Profesional',
      dragHint: 'Arrastra para rotar el estudio 3D',
      stats: [
        { value: '8+ Años', label: 'Ingeniería en Producción' },
        { value: '3 Grandes Bancos', label: 'Santander, BB & Itaú' },
        { value: 'GenAI + AST', label: 'Workflows Deterministas' },
        { value: 'CS50x', label: 'Certificación HarvardX' }
      ]
    },
    methodology: {
      title: 'Metodología de Ingeniería Aplicada',
      subtitle: 'Basada en estándares académicos, modelos matemáticos formales e invariantes de producción comprobados para asegurar la máxima confiabilidad.',
      pillars: [
        {
          tag: 'Arquitectura & Clean Code',
          title: 'Hexagonal Ports & Patrones GoF Canónicos',
          desc: 'Aislamiento concéntrico de capas, Pure Domain libre de dependencias y Thin Controllers (≤ 300 LOC). Extensión polimórfica mediante estrategias y registries sin acoplamiento rígido.',
          ref: 'Cockburn (2005) • Gamma et al. (GoF 1994)'
        },
        {
          tag: 'Invariantes de Calidad',
          title: 'Zero Fallback Debt & Techo de Complejidad',
          desc: 'Cumplimiento de las 7 reglas de oro: cero enmascaramiento silencioso de errores, cero variables de entorno sin validar y límite de complejidad cognitiva (≤ 15 por función).',
          ref: 'Boehm V&V (1981) • ISO/IEC/IEEE 15288:2023'
        },
        {
          tag: 'Rendimiento Matemático',
          title: 'Pruebas Asintóticas & Teoría de Colas',
          desc: 'Rutas críticas con garantías asintóticas O(1) u O(log n). Dimensionamiento y flujo de colas calibrados mediante la Ley de Little (L = λW) y USL de Gunther para evitar bufferbloat.',
          ref: 'Donald Knuth (1976) • Little (1961) • Gunther (2008)'
        },
        {
          tag: 'Resiliencia Distribuida',
          title: 'Aislamiento de Fallos & Consistencia Transaccional',
          desc: 'Recuperación transaccional y coordinación distribuida con Compensating Sagas, Transactional Outbox, Circuit Breakers y ARIES WAL bajo límites PACELC/CAP.',
          ref: 'Lamport (1978) • Mohan et al. (ARIES 1992) • Abadi (2012)'
        },
        {
          tag: 'Ingeniería de IA',
          title: 'GenAI Determinista & Grounding en AST',
          desc: 'Orquestación disciplinada de IA Generativa con escepticismo empírico, inspección de símbolos AST en vivo, validación de esquemas tipados y guardrails anti-alucinación.',
          ref: 'Avizienis Dependability Taxonomy (2004)'
        },
        {
          tag: 'Observabilidad & Decisión',
          title: 'Decisiones Basadas en Evidencia & SLOs',
          desc: 'Instrumentación con OpenTelemetry, métricas RED/USE y rastreo distribuido ligado a logs estructurados. Toma de decisiones guiada por telemetría real de producción, SLIs/SLOs estrictos y post-mortems sin culpa.',
          ref: 'Google SRE (Beyer et al. 2016) • Estándar OpenTelemetry'
        }
      ]
    },
    exp: {
      title: 'Experiencia Profesional',
      jobs: [
        {
          role: 'Desarrollador de Software Senior / Consultor',
          corp: 'Accenture',
          year: '08/2025 – Presente',
          points: [
            'División Pioneer en proyectos del ecosistema de crédito automotriz (Santander LATAM) e iniciativa Illumia.',
            'Integración y aplicación de soluciones GenAI para optimización de procesos internos y evolución de productos.'
          ]
        },
        {
          role: 'Ingeniero de Software',
          corp: 'Audsat',
          year: '11/2020 – 08/2026',
          points: [
            'Desarrollo y arquitectura de soluciones de monitoreo geográfico nacional para mitigación de riesgo agrícola (BB, Itaú, Santander).',
            'Implementación de rutas escalables y procesamiento de datos en alto volumen.'
          ]
        },
        {
          role: 'Desarrollador de Software',
          corp: 'Orla',
          year: '10/2023 – 04/2024',
          points: [
            'Mantenimiento y desarrollo de nuevas funcionalidades para el ecosistema Anbima Data.',
            'Implementación de capas de seguridad contra web scraping en APIs críticas.'
          ]
        },
        {
          role: 'Consultor de Software',
          corp: 'Ilia',
          year: '01/2023 – 03/2023',
          points: [
            'Liderazgo técnico y mentoría en el proyecto Talent Canada.',
            'Desarrollo y entrega del motor de campañas para la plataforma Asics Cashback.'
          ]
        },
        {
          role: 'Desarrollador Java',
          corp: 'Nexti',
          year: '08/2022 – 01/2023',
          points: [
            'Evolución y soporte técnico de sistema SaaS para control de asistencia y horarios en Java.'
          ]
        },
        {
          role: 'Desarrollador de Software',
          corp: 'Accenture',
          year: '05/2021 – 03/2022',
          points: [
            'División Vivere para soluciones de crédito Santander LATAM (Perú, Colombia y Argentina).'
          ]
        },
        {
          role: 'Experiencias Anteriores',
          corp: 'E-Deploy • Leucotron • VIP Softwares',
          year: '2017 – 2020',
          points: [
            'E-Deploy (09/2020 – 11/2020): Desarrollo de integraciones API para Burger King con apps de delivery.',
            'Leucotron (01/2018 – 09/2020): Desarrollo de productos de telecomunicaciones y soporte a sistemas legacy.',
            'VIP Softwares / How much (2017): Desarrollo web y sistemas analíticos de gestión agrícola.'
          ]
        }
      ]
    },
    tech: {
      title: 'Habilidades Técnicas & Dominios',
      subtitle: 'Competencias de producción consolidadas en banca enterprise, microservicios e ingeniería de IA.',
      categories: [
        {
          name: 'Lenguajes y Frameworks',
          items: ['Node.js', 'Java (Spring Boot)', 'React', 'JavaScript / TypeScript', 'Python']
        },
        {
          name: 'Bases de Datos & Storage',
          items: ['MongoDB', 'PostgreSQL', 'Motores Relacionales SQL', 'Optimización de Almacenamiento']
        },
        {
          name: 'Arquitectura & DevSecOps',
          items: ['Microservicios', 'APIs RESTful', 'Pipelines CI/CD', 'Hardening y Seguridad', 'Arquitectura Orientada a Eventos']
        },
        {
          name: 'Metodologías & Rigor',
          items: ['Integración GenAI / LLMs', 'Clean Code', '23 Patrones GoF', 'Domain-Driven Design (DDD)', 'Metodologías Ágiles (Scrum / Kanban)']
        }
      ]
    },
    docs: {
      title: 'Formación Académica & Conocimiento',
      c1: {
        title: 'Formación & Certificaciones',
        items: [
          'Licenciatura en Sistemas de Información | FAI (Concluida en 12/2018 - 3.480 horas)',
          'Técnico en Programación | On Byte Formación Profesional (Concluida en 12/2014)',
          'CS50x: Introduction to Computer Science | HarvardX (Verificado en 2020)',
          'Inglés: Nivel Intermedio/Avanzado (B2 - UPTIME)'
        ]
      },
      c2: {
        title: 'Catálogo de Arquitectura Canónica',
        items: [
          'Principios de Diseño SOLID (SRP, OCP, LSP, ISP, DIP)',
          'Patrones GoF Canónicos (Creacionales, Estructurales, Comportamentales)',
          'Clean Architecture, Aislamiento Concéntrico & Pure Domain',
          'Teoría de Sistemas Distribuidos (CAP, PACELC, FLP, Lamport Clocks)',
          'Recuperación de Bases de Datos y WAL (B+ Tree, LSM, ARIES WAL)'
        ]
      }
    },
    contact: {
      title: '¿Listo para construir algo extraordinario?',
      desc: "Siempre abierto a discutir arquitectura de sistemas, redes distribuidas o contratación para proyectos críticos.",
      btn: 'Enviar Correo',
      rights: 'Todos los derechos reservados.'
    }
  }
};
