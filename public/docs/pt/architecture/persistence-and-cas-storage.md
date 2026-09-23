# 🗄️ Persistência Relacional, Armazenamento CAS & Ciclos de Vida

Este documento especifica a arquitetura de persistência e o modelo de Content-Addressable Storage (CAS).

---

## 1. Modelagem Relacional Normalizada vs. Blobs Monolíticos

### 1.1 O Anti-Pattern de Blobs JSON Monolíticos
Em arquiteturas legadas, coleções dinâmicas e árvores hierárquicas são frequentemente serializadas em colunas monolíticas de JSON/Texto em bancos relacionais. Esse anti-pattern introduz gargalos arquiteturais graves:
- **Amplificação de Escrita (Write Amplification):** Modificar um único atributo aninhado exige serializar, transferir e reescrever um documento inteiro de múltiplos megabytes.
- **Colisões de Concorrência & Sobrescritas Silenciosas:** Atualizações concorrentes direcionadas a seções distintas da mesma linha inadvertidamente sobrescrevem as alterações umas das outras.
- **Ineficiência de Consulta:** Listagens de resumo e leituras simples são forçadas a trafegar payloads pesados ou manter exclusões frágeis de colunas para evitar saturação de memória e rede.

### 1.2 A Solução Relacional Normalizada
- Estruturas de domínio são modeladas em tabelas relacionais discretas e normalizadas, vinculadas por chaves estrangeiras explícitas (`FOREIGN KEY`) com integridade referencial declarativa (`ON DELETE CASCADE` / `ON DELETE RESTRICT`).
- Cada entidade mutável representa uma linha independente, viabilizando operações atômicas granulares com bloqueios a nível de linha (*row-level locks*).
- Métricas agregadas e resumos utilizam funções nativas do banco de dados (`SUM`, `COUNT`, `AVG`) em vez de carregar árvores brutas na memória da aplicação.

---

## 2. Modelo de Referência de Content-Addressable Storage (CAS)

O banco de dados relacional armazena **zero payloads binários pesados e zero vetores matemáticos de alta dimensão inline**:

1. **Separação Estrita de Responsabilidades:**
   - O banco de dados armazena metadados estruturados, relacionamentos e chaves de referência criptográficas.
   - O Object Storage / Sistema de Arquivos armazena arquivos binários e payloads volumosos.
2. **Endereçamento por Hash Criptográfico (SHA-256):**
   - Cada arquivo gravado no armazenamento é endereçado pelo seu hash hexadecimal SHA-256:
     $$\text{key} = \text{sha256}(\text{payload})$$
   - O banco relacional registra apenas a string de hash de 64 caracteres (`VARCHAR(64)`).
3. **Vantagens Arquiteturais:**
   - **Desduplicação Nativa:** Arquivos idênticos gravados em projetos distintos compartilham automaticamente o mesmo objeto físico no storage.
   - **Cacheabilidade Imutável:** Como as chaves são criptograficamente atreladas ao conteúdo do payload, os objetos armazenados são imutáveis. Caches podem reter os dados indefinidamente com risco zero de invalidação.
   - **Auditabilidade Criptográfica:** Qualquer worker ou cliente pode verificar a integridade do payload sob demanda recalculando o hash e comparando-o com o registro no banco de dados.

---

## 3. Ciclo de Vida Padronizado de Armazenamento em 3 Camadas

Para evitar inchaço de armazenamento e custos desnecessários de infraestrutura, os objetos armazenados são particionados em três camadas com políticas de retenção distintas:

| Camada | Prefixo de Armazenamento | Política de Retenção | Categoria de Dados Armazenados |
| :--- | :--- | :--- | :--- |
| **Camada 1: Scratch (Efêmero)** | `scratch/` | **Auto-TTL Curto (ex.: 24 horas)** e expurgo automático em rollbacks de compensação de Sagas. | Chunks intermediários de processamento, arquivos temporários de conversão, áreas de rascunho voláteis. |
| **Camada 2: Vault (Biblioteca / Ativos)** | `vault/` | **Retenção Permanente / Indefinida.** Nunca expurgado por rotinas automáticas de ciclo de vida. | Ativos de referência de longo prazo, templates base, embeddings fundamentais, perfis mestres. |
| **Camada 3: Releases (Entregáveis)** | `releases/` | **Retenção Governada por Versão.** Controlada pelos ciclos de auditoria e liberação do produto. | Entregáveis finais consolidados, relatórios gerados, pacotes de exportação. |

---

## 4. Controle de Concorrência & Fronteiras Transacionais

### 4.1 Controle Otimista de Concorrência (OCC)
- Entidades que suportam edições concorrentes mantêm um atributo inteiro de versão (`version: integer`) ou timestamp de atualização.
- Atualizações atômicas de estado impõem verificação otimista:
  ```sql
  UPDATE entities SET field = $1, version = version + 1 
  WHERE id = $2 AND version = $3;
  ```
- Se a atualização retornar 0 linhas afetadas, a camada de persistência aborta a operação com uma `ConcurrencyCollisionException`, prevenindo sobrescritas silenciosas.

### 4.2 Escopos Transacionais Explícitos
- Operações que abrangem múltiplos agregados de domínio devem ser executadas dentro de uma transação ACID explícita.
- Qualquer exceção não tratada dispara um rollback imediato da transação antes que efeitos colaterais fiquem visíveis para consumidores concorrentes.
