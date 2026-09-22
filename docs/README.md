# 🎓 Portal de Fundamentos & Arquitetura de Software (TCC / PoC)

Bem-vindo ao repositório de fundamentação acadêmica e arquitetura de software para o **Trabalho de Conclusão de Curso (TCC)** e desenvolvimento da **Prova de Conceito (PoC)**.

> **Status do Projeto:**  
> A documentação foi integralmente saneada para remover falsos positivos de produto ou acoplamentos a ferramentas e bibliotecas específicas.  
> **O escopo, o problema real e a ideia do produto estão sendo definidos a partir do zero.**  
> Este portal preserva exclusivamente os **padrões de projeto**, as **metodologias científicas** e os **fundamentos arquiteturais agnósticos**.

---

## 🏛️ 1. Fundamentação Científica & Epistemologia (`docs/foundation/`)

- **[Metodologia Científica: Design Science Research (DSR)](foundation/academic-methodology-dsr.md):**  
  O processo metodológico em 6 estágios de Peffers et al. (2007) e as 7 diretrizes de Hevner et al. (2004) para a concepção, construção e avaliação de artefatos computacionais no TCC.

- **[Teoria Geral dos Sistemas & Pilares de Engenharia](foundation/systems-theory-and-pillars.md):**  
  A base sistêmica de Bertalanffy e Wiener (sistemas sócio-técnicos, entropia vs. negentropia, loops de retroalimentação) e os 6 pilares curriculares (Requisitos ISO 29148, Clean Architecture, Sistemas Distribuídos, IHC, Governança e Qualidade ISO 25010).

---

## 🏗️ 2. Arquitetura de Software & Padrões de Projeto (`docs/architecture/`)

- **[Clean Architecture & Domain-Driven Design (DDD)](architecture/clean-architecture-and-ddd.md):**  
  A regra de dependência unidirecional, isolamento do Núcleo de Domínio Puro sem dependência de frameworks, Casos de Uso na camada de aplicação e eliminação da obsessão por primitivos através de *Branded Types*.

- **[Padrões de Projeto GoF (Gang of Four)](architecture/gof-design-patterns.md):**  
  Catálogo formal dos padrões Criacionais, Estruturais e Comportamentais de Gamma et al. (1994) aplicados à arquitetura de software, com regras de uso e proibições de anti-padrões.

- **[Padrões de Resiliência & Sistemas Distribuídos](architecture/distributed-resilience-patterns.md):**  
  Orquestração de Sagas com transações compensatórias (Garcia-Molina), Transactional Outbox (eliminação do dual-write), Consumidor Idempotente, Circuit Breakers (Nygard), Bulkhead, Reserva em Dois Passos (Hold & Settle) e Anti-Corruption Layer (ACL).

- **[Arquitetura Hexagonal: Portas, Adaptadores & Contratos](architecture/hexagonal-ports-and-adapters.md):**  
  O modelo de Portas e Adaptadores (Cockburn), adaptadores primários (Inbound/Thin Controllers $\le 300\text{ LOC}$), adaptadores secundários (Outbound/Inversão de Dependência) e abordagem Contract-First com suporte a múltiplos protocolos.

- **[Persistência Relacional, Armazenamento CAS & Ciclo de Vida](architecture/persistence-and-cas-storage.md):**  
  Modelagem relacional normalizada contra o anti-padrão de blobs JSON monolíticos, armazenamento endereçado por conteúdo (CAS) via hashes SHA-256, ciclo de vida de armazenamento em 3 camadas (`scratch`, `vault`, `releases`) e Controle de Concorrência Otimista (OCC).

---

## 🗺️ Mapa da Documentação

```
docs/
├── foundation/
│   ├── academic-methodology-dsr.md       # Metodologia DSR (Peffers / Hevner)
│   └── systems-theory-and-pillars.md     # Teoria Geral dos Sistemas e 6 Pilares
├── architecture/
│   ├── clean-architecture-and-ddd.md     # Camadas Concêntricas, Regras de Dependência e Branded Types
│   ├── gof-design-patterns.md            # Catálogo Completo GoF (Criacionais, Estruturais, Comportamentais)
│   ├── distributed-resilience-patterns.md# Sagas, Outbox, Circuit Breaker, Idempotência e Hold/Settle
│   ├── hexagonal-ports-and-adapters.md   # Portas Inbound/Outbound, Thin Controllers e Multi-Protocolo
│   └── persistence-and-cas-storage.md    # Normalização Relacional, CAS SHA-256 e Concorrência Otimista (OCC)
└── README.md                             # Portal Mestre de Arquitetura e Fundamentos
```
