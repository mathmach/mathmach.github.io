# 🗄️ Persistência Relacional, Armazenamento CAS & Ciclo de Vida

Este documento define a arquitetura de persistência de dados e o modelo de armazenamento endereçado por conteúdo (Content-Addressable Storage - CAS).

---

## 1. Modelagem Relacional Normalizada vs. Blobs Monolíticos

### 1.1 O Anti-Padrão do JSON Monolítico
Em arquiteturas legadas, árvores complexas ou coleções dinâmicas são frequentemente serializadas em colunas únicas do tipo JSON/Text no banco de dados. Este anti-padrão acarreta severos problemas arquiteturais:
- **Amplificação de Escrita (Write Amplification):** A alteração de um único atributo exige serializar, transferir e regravar documentos inteiros de múltiplos megabytes.
- **Conflitos de Concorrência e Sobrescrita Silenciosa:** Duas mutações concorrentes em seções diferentes do mesmo registro anulam mutuamente as alterações uma da outra.
- **Ineficiência de Consulta:** Consultas de listagem e sumários são forçadas a carregar cargas pesadas ou criar exclusões frágeis de colunas para evitar saturação de rede e memória.

### 1.2 A Solução Relacional Normalizada
- Estruturas de dados são modeladas em tabelas relacionais discretas e normalizadas, ligadas por chaves estrangeiras (`FOREIGN KEY`) com integridade referencial expressa (`ON DELETE CASCADE` / `ON DELETE RESTRICT`).
- Cada item mutável representa uma linha individual, permitindo operações atômicas pontuais com bloqueios em nível de linha (*row-level locks*).
- Consultas agregadas utilizam funções nativas do banco de dados (`SUM`, `COUNT`, `AVG`) em vez de carregar dados para cálculo em memória na aplicação.

---

## 2. Modelo de Armazenamento Endereçado por Conteúdo (CAS)

O banco de dados relacional armazena **zero arquivos binários pesados e zero matrizes matemáticas densas inline**:

1. **Separação Estrita de Responsabilidades:**
   - O banco de dados armazena metadados estruturados, relações e chaves criptográficas de referência.
   - O sistema de arquivos / Object Storage armazena os arquivos binários e payloads pesados.
2. **Endereçamento por Hash Criptográfico (SHA-256):**
   - Todo arquivo gravado no storage recebe como chave o seu digest hexadecimal SHA-256:
     $$\text{key} = \text{sha256}(\text{payload})$$
   - O banco de dados guarda apenas o hash de 64 caracteres (`VARCHAR(64)`).
3. **Vantagens Arquiteturais:**
   - **Deduplicação Nativa:** Arquivos idênticos gerados ou enviados compartilham automaticamente o mesmo objeto físico de armazenamento.
   - **Imutabilidade e Cache:** Como o identificador é derivado do próprio conteúdo, o objeto é imutável. Qualquer cache intermediário pode reter o arquivo por tempo indefinido sem risco de obsolescência (*cache invalidation*).
   - **Auditoria Criptográfica:** Qualquer cliente ou worker pode verificar a integridade física do arquivo recalculando o hash e comparando com o registro do banco.

---

## 3. Ciclo de Vida de Armazenamento em Três Camadas (3-Tier Lifecycle)

Para evitar acúmulo descontrolado de dados temporários e custos desnecessários de infraestrutura, os objetos são particionados em três níveis com políticas de retenção distintas:

| Camada | Escopo | Política de Retenção | Tipo de Dado Armazenado |
| :--- | :--- | :--- | :--- |
| **Tier 1: Scratch (Temporário)** | `scratch/` | **Auto-TTL curto (ex: 24 horas)** e purga automática por compensações de falha. | Arquivos intermediários de processamento, chunks parciais, rascunhos voláteis. |
| **Tier 2: Vault (Biblioteca / Ativos)** | `vault/` | **Retenção Permanente / Indefinida.** Nunca excluído por rotinas automáticas de idade. | Ativos de referência de longo prazo, modelos, parâmetros canônicos, perfis mestres. |
| **Tier 3: Releases (Entregáveis)** | `releases/` | **Retenção Controlada por Versão.** Governado pelo ciclo de vida do produto. | Artefatos consolidados finais, relatórios gerados, pacotes finais de exportação. |

---

## 4. Concorrência e Integridade Transacional

### 4.1 Controle de Concorrência Otimista (Optimistic Concurrency Control - OCC)
- Entidades que suportam edições concorrentes possuem um campo de controle de versão (`version: integer` ou timestamp de atualização).
- Atualizações atômicas executam com a cláusula de verificação:
  ```sql
  UPDATE entities SET field = $1, version = version + 1 
  WHERE id = $2 AND version = $3;
  ```
- Se a consulta retornar 0 linhas afetadas, a camada de persistência aborta a operação emitindo uma exceção de colisão de concorrência (*ConcurrencyCollisionException*), impedindo a sobreposição cega de edições alheias.

### 4.2 Escopo Transacional Delimitado
- Operações que alteram múltiplos agregados de domínio devem ser envolvidas em um escopo transacional explícito com garantia ACID.
- Falhas em qualquer etapa do Caso de Uso disparam rollback automático antes que qualquer efeito colateral se torne visível para outros consumidores.
