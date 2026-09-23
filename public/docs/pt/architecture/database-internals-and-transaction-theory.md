# 💾 Internals de Bancos de Dados, Mecanismos de Armazenamento & Teoria de Transações

Este documento formaliza a arquitetura de dados de baixo nível, os trade-offs de motores de armazenamento e a teoria formal de isolamento de concorrência que rege a persistência de estado no sistema.

---

## 1. Arquiteturas de Mecanismos de Armazenamento: B+ Trees vs. LSM-Trees

Todo mecanismo de armazenamento faz escolhas arquiteturais fundamentais entre latência de leitura, vazão de escrita e amplificação de espaço/escrita.

```
       Arquitetura de B+ Tree                     Arquitetura de LSM-Tree
 (Otimizada para Leitura / In-Place)           (Otimizada para Escrita / Append-Only)

       [ Página Nó Raiz ]                           [ MemTable em Memória ]
        /              \                                 (RAM SkipList)
       v                v                                      │ (Flush)
[ Página Interna ] [ Página Interna ]                          ▼
   /        \         /        \                      [ L0 SSTables (Disco) ]
  v          v       v          v                              │ (Compactação)
[ Página Folha ] [ Página Folha ] [ Página Folha ]             ▼
(Páginas de Disco Duplamente Encadeadas)              [ L1 SSTables (Disco) ]
```

### 1.1 Comparação Estrutural

| Recurso | B+ Tree (ex.: Postgres, InnoDB, SQLite) | LSM-Tree (ex.: RocksDB, Cassandra, LevelDB) |
| :--- | :--- | :--- |
| **Carga Primária** | Leituras intensivas, buscas pontuais, varreduras por faixa. | Escritas intensivas, ingestão de alta vazão, append-only. |
| **Paradigma de Mutação** | Sobrescrita in-place de páginas de disco de tamanho fixo ($4\text{KB}\text{--}16\text{KB}$). | Log sequencial append-only; SSTables imutáveis em disco. |
| **Padrão de E/S em Disco** | E/S Aleatória (exige buscas de cabeçote em discos mecânicos). | E/S Sequencial (satura a largura de banda contínua do barramento). |
| **Amplificação de Escrita (WA)** | Alta (atualizar 1 byte grava uma página inteira de $8\text{KB}$ + WAL). | Moderada-Alta (ocorre durante mesclagens de compactação em múltiplos níveis). |
| **Amplificação de Espaço (SA)** | Moderada (fragmentação de páginas, espaço ocioso interno). | Baixa-Moderada (registros deletados ocupam espaço até a compactação). |

### 1.2 A Conjectura RUM (Athanassoulis et al., 2016)
A Conjectura RUM prova que, ao projetar métodos de acesso para sistemas de dados, otimizar dois dos três custos fundamentais compromete o terceiro:

```
                  Custo de Leitura (R)
                          /\
                         /  \
                        /    \
                       /      \
   Custo de Atualização (U) -- Custo de Espaço / Memória (M)
```
- **Otimizando Leitura & Espaço (R + M):** B+ Trees minimizam latência de leitura com empacotamento denso, mas sacrificam o custo de atualização ($U$) devido a divisões de página (*page splits*) e escritas aleatórias.
- **Otimizando Atualização & Espaço (U + M):** LSM-Trees com compactação nivelada pesada minimizam o uso de disco e aceitam escritas sequencialmente, mas elevam o custo de leitura ($R$) via buscas em múltiplas SSTables (mitigado com Filtros de Bloom).
- **Otimizando Leitura & Atualização (R + U):** Estruturas redundantes de indexação (ex.: manter índices duplos ou caches em memória) alcançam leituras e escritas rápidas, mas inflam o consumo de espaço ($M$).

---

## 2. Teoria de Transações: ACID & Recuperação de Falhas (ARIES)

Uma transação representa uma unidade lógica de trabalho que transiciona um banco de dados de um estado consistente para outro.

### 2.1 As Propriedades ACID (Jim Gray, 1981)
- **Atomicidade:** Todas as operações da transação são executadas com sucesso, ou a transação inteira é desfeita com zero efeitos colaterais.
- **Consistência:** Mutações nunca devem violar restrições declaradas do banco de dados, chaves estrangeiras ou invariantes de entidades de domínio.
- **Isolamento:** Transações concorrentes executam sem observar mutações intermediárias e não confirmadas de outras transações simultâneas.
- **Durabilidade:** Uma vez confirmadas (*commit*), as alterações sobrevivem a quedas de sistema, interrupções elétricas e encerramento de processos.

### 2.2 Write-Ahead Logging (WAL) & Recuperação ARIES
Para garantir Durabilidade sem descarregar páginas inteiras de forma síncrona no disco a cada commit, sistemas implementam **Write-Ahead Logging (WAL)**:

> **O Invariante WAL:** Nenhuma página de dados modificada (página suja) pode ser gravada no armazenamento persistente até que o registro de log correspondente detalhando a alteração tenha sido persistido em disco (`fsync`).

O algoritmo canônico **ARIES** (Mohan et al., 1992) executa a recuperação de falhas em três fases:
1. **Fase de Análise:** Varre o WAL para frente a partir do último checkpoint para identificar transações ativas (não comitadas no momento da falha) e páginas sujas na memória.
2. **Fase de Redo (Refazer):** Varre para frente a partir do registro de log não gravado mais antigo para repetir a história, reaplicando todas as operações registradas (incluindo transações não comitadas) para restaurar o estado exato anterior à falha.
3. **Fase de Undo (Desfazer):** Varre para trás para reverter as ações de todas as transações ativas que nunca foram comitadas, gravando Registros de Log de Compensação (CLRs) para garantir idempotência caso ocorra outra falha durante a recuperação.

---

## 3. Níveis de Isolamento de Concorrência & Anomalias

O padrão ANSI SQL-92 baseou-se em definições ambíguas baseadas em bloqueios (*locks*). A teoria moderna de bancos de dados classifica o isolamento estritamente pelas **anomalias de concorrência** prevenidas (Berenson et al., 1995; Adya et al., 2000).

```
Hierarquia de Níveis de Isolamento:
Read Uncommitted < Read Committed < Repeatable Read < Snapshot Isolation (SI) < Serializable (SSI / 2PL)
```

### 3.1 Taxonomia de Anomalias de Concorrência

| Código | Nome da Anomalia | Descrição | Prevenida Por |
| :--- | :--- | :--- | :--- |
| **$G0$** | **Dirty Write** | A transação $T_1$ modifica um item de dado, e $T_2$ o sobrescreve antes de $T_1$ comitar ou abortar. | Read Uncommitted e superiores |
| **$G1a$** | **Dirty Read** | $T_1$ modifica um item; $T_2$ lê o valor não comitado; $T_1$ subsequentemente aborta. | Read Committed e superiores |
| **$G1c$** | **Non-Repeatable Read** | $T_1$ lê um item; $T_2$ modifica/deleta esse item e comita; $T_1$ relê o item e observa dados alterados. | Repeatable Read e superiores |
| **$A3$** | **Phantom Read** | $T_1$ lê um conjunto sob um predicado; $T_2$ insere novos registros que satisfazem o predicado e comita; $T_1$ reconsulta e vê registros "fantasmas". | Repeatable Read (com MVCC) / Serializable |
| **$P4$** | **Lost Update** | $T_1$ e $T_2$ leem o item $X$; ambos calculam atualizações; $T_1$ escreve $X$; $T_2$ escreve $X$, destruindo silenciosamente a mutação de $T_1$. | Snapshot Isolation e superiores |
| **$A5B$** | **Write Skew** | $T_1$ lê $X$ e $Y$; $T_2$ lê $X$ e $Y$; a restrição exige $X + Y > 0$. $T_1$ decrementa $X$, $T_2$ decrementa $Y$. Ambos comitam; invariante violada! | **Apenas Serializable** |

### 3.2 Snapshot Isolation (SI) & O Risco de Write Skew
Snapshot Isolation oferece leituras livres de bloqueios usando Controle de Concorrência Multiversão (MVCC). Cada transação lê a partir de um snapshot imutável de dados comitados capturado no timestamp de início da transação $T_{\text{start}}$.

- **Primeiro que Comita Vence (First-Committer-Wins):** Se duas transações concorrentes tentam modificar a **exata mesma linha**, a segunda a comitar aborta. Isso previne Lost Update ($P4$).
- **O Ponto Cego do SI (Write Skew):** Se duas transações modificam **linhas diferentes** enquanto dependem de conjuntos de leitura sobrepostos para satisfazer uma invariante compartilhada, ambas têm sucesso sob SI, corrompendo a invariante!
  - *Exemplo (O Problema dos Médicos de Plantão):* Regra do hospital: $\ge 1$ médico de plantão. Dra. Alice e Dr. Bob estão de plantão. Alice pede dispensa ($T_1$ atualiza a linha de Alice porque Bob está de plantão). Simultaneamente, Bob pede dispensa ($T_2$ atualiza a linha de Bob porque Alice está de plantão). Ambas as transações comitam sob SI $\implies$ **Zero médicos de plantão!**
- **Solução Arquitetural:** Impor **Serializable Snapshot Isolation (SSI)** (que detecta dinamicamente ciclos de dependência no grafo de serialização - `rw-antidependencies`) ou adquirir locks explícitos em nível de linha via `SELECT ... FOR UPDATE`.

---

## 4. Teoria de Normalização Relacional (Formas Normais de Codd)

Esquemas de bancos de dados devem aderir aos fundamentos da álgebra relacional (Edgar F. Codd, 1970) para eliminar anomalias de atualização, inserção e exclusão.

- **Primeira Forma Normal (1NF):** Cada atributo contém apenas valores atômicos e indivisíveis. As tabelas possuem chave primária. Zero arrays, grupos repetitivos ou blobs JSON não estruturados como atributos primários de registros.
- **Segunda Forma Normal (2NF):** Satisfaz a 1NF, e cada atributo não-chave é totalmente dependente funcional da chave primária completa (elimina dependências parciais em chaves compostas).
- **Terceira Forma Normal (3NF):** Satisfaz a 2NF, e nenhum atributo não-chave é transitivamente dependente da chave primária ($X \to Y \to Z$, onde $Z$ depende da não-chave $Y$).
- **Forma Normal de Boyce-Codd (BCNF):** Para toda dependência funcional $X \to Y$, o determinante $X$ deve ser uma superchave.

### 4.1 Invariante de Desnormalização Governada
A desnormalização é permitida **estritamente como uma otimização consciente de leitura** para projeções de consulta pré-computadas. Réplicas de leitura desnormalizadas ou agregados em cache devem ser atualizados transacionalmente via eventos de Outbox ou workers determinísticos de materialização, jamais através de escritas ad-hoc no código da aplicação.
