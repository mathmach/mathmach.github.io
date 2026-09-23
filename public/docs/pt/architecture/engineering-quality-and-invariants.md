# 🛡️ Invariantes de Qualidade de Engenharia & Catracas de Qualidade

Este documento codifica os padrões obrigatórios de qualidade, catracas automatizadas e invariantes arquiteturais que regem este repositório. Todo contribuidor humano e agente de IA deve aderir estritamente a estas regras em cada commit.

---

## 1. Princípios Fundamentais do Repositório

1. **Zero Comentários no Código:**
   - É estritamente proibido escrever comentários no código-fonte (`//`, `/* */`, descrições JSDoc ou `// TODO`).
   - Código limpo de nível de produção expressa sua intenção através de nomenclatura de domínio expressiva, funções puras de propósito único e tipagem forte.
   - Justificativas conceituais e contexto de engenharia pertencem às **mensagens de commit** e à **documentação arquitetural**, jamais inline no código.
2. **Preservação do Git Staging:**
   - Operações destrutivas no Git Index (`git reset`, `git add .` indiscriminado, perda de arquivos em staging) são proibidas.
3. **Catracas de Qualidade Unidirecionais (Quality Ratchets):**
   - Pisos de qualidade apenas sobem; tetos de complexidade apenas descem.
   - Se uma refatoração ou bateria de testes melhora a cobertura, reduz complexidade cognitiva ou elimina dívida de fallback, essa nova métrica se torna o piso permanente para todo trabalho futuro.
4. **Isolamento Estrito de Fronteiras de Camadas:**
   - Regras puras de domínio residem no núcleo com zero dependência de frameworks, ORMs, camadas de transporte ou SDKs externos.
   - Dependências apontam estritamente para dentro: Apresentação $\to$ Aplicação $\to$ Domínio $\leftarrow$ Infraestrutura.

---

## 2. Zero Fallback Debt (As Sete Regras de Ouro)

Fallbacks silenciosos mascaram defeitos latentes, obscurecem casos de borda e levam a modos de falha não determinísticos em produção. O código impõe sete regras rigorosas:

1. **Sem `.catch(value)` em Esquemas de Validação:**
   - Falhas de validação devem rejeitar imediatamente com diagnósticos de erro explícitos e descritivos. Mascarar erros de parsing com valores default é proibido.
2. **Sem `safeParse(...).data ?? fallback`:**
   - Toda falha de parsing deve ser tratada explicitamente com logging estruturado de erro, rejeição ou exceções mapeadas de domínio.
3. **Sem `env.VAR ?? fallback`:**
   - Todas as variáveis de configuração em tempo de execução devem ser declaradas em um esquema de ambiente centralizado e validadas na inicialização da aplicação.
4. **Sem Coerção Numérica Frouxa `Number(...) || fallback`:**
   - Coerções numéricas devem verificar `Number.isFinite()` e tratar explicitamente entradas não numéricas.
5. **Sem Blocos `catch` Vazios:**
   - Todo bloco de exceção deve incluir logging estruturado de diagnóstico, traduzir para uma exceção conhecida de domínio ou relançar o erro.
6. **Sem `?? fallback` em Campos de Contrato:**
   - Contratos de dados compartilhados, payloads de API e esquemas de mensageria devem ser respeitados sem injeção de valores padrão locais ad-hoc.
7. **Sem Acesso Frouxo a `process.env`:**
   - O acesso a variáveis de ambiente em tempo de execução é restrito a um gateway de ambiente centralizado e validado.

---

## 3. Zero Superfícies Órfãs

Código morto e declarações soltas aumentam a carga cognitiva, inflam os bundles e induzem mantenedores a erro:

- **Nenhum Procedimento Sem Chamadores:** Todo procedimento ou endpoint público deve ter consumidores ativos ou ser depreciado e removido.
- **Nenhum Módulo de Produção Apenas para Testes:** Módulos exportados em pacotes de produção não podem existir unicamente para satisfazer casos de teste.
- **Nenhuma Superfície de Exportação Solta:** Tipos não referenciados, declarações de interface não utilizadas e funções mortas devem ser sistematicamente eliminados (verificados via scanners automatizados de código morto como Knip).

---

## 4. Tetos Estruturais & de Complexidade

Para evitar a entropia arquitetural, a base de código impõe limites superiores estritos de complexidade:

- **Teto de Complexidade Cognitiva ($\le 15$):**
   - Nenhuma função ou método pode exceder 15 pontos de complexidade cognitiva.
   - Funções que se aproximem deste limite devem ser decompostas em subfunções puras e focadas.
- **Controladores de Apresentação Finos ($\le 300\text{ LOC}$):**
   - Controladores da camada de entrega e manipuladores de rota não podem exceder 300 linhas de código.
   - Controladores atuam estritamente como orquestradores finos: validação de entrada $\to$ autenticação/autorização $\to$ delegação ao Caso de Uso $\to$ mapeamento da resposta.
- **Teto de Componentes de UI ($\le 400\text{ LOC}$):**
   - Componentes visuais não podem exceder 400 linhas de código. Lógica de estado deve ser extraída para custom hooks, e estruturas visuais decompostas em subcomponentes.

---

## 5. Concorrência & Controle de Acesso Concorrente

- **Controle Otimista de Concorrência (OCC):**
   - Agregados colaborativos, com salvamento automático ou multi-ator devem impor tokens de versão (`expectedVersion` ou timestamp) em mutações (`WHERE id = ? AND version = ?`).
   - Sobrescritas cegas sem validação de versão são proibidas.
- **Padrão Hold & Settle em Duas Fases:**
   - Operações assíncronas de longa duração não devem manter transações de banco de dados ou travas de conexão abertas enquanto aguardam serviços externos.
   - Operações devem executar via reservas atômicas (Fase 1: Hold), rodar de forma assíncrona sem travas no banco e concluir com liquidação atômica ou cancelamento (Fase 2: Settle/Release).

---

## 6. Higiene de Bancos de Dados & Armazenamento

- **Zero Consultas N+1:**
   - É proibido executar consultas a bancos de dados dentro de laços de iteração (`.map()`, `for...of` ou iterações assíncronas aninhadas).
   - Coleções devem ser recuperadas utilizando carregadores em lote (ex.: DataLoader) ou consultas relacionais únicas.
- **Paginação Determinística por Cursor:**
   - Endpoints que retornam coleções devem impor paginação baseada em cursor com um teto estrito (`limit <= 50`). Paginação por offset profundo (`OFFSET > 100`) é proibida.
- **Disciplina de Armazenamento de Objetos em Três Camadas:**
   - Arquivos intermediários de scratch, frames ou chunks temporários devem ser isolados em uma camada efêmera (`scratch/`) com TTL automático de 24 horas.
   - Entregáveis mestres e ativos permanentes residem em camadas permanentes (`vault/`, `releases/`) gerenciadas via Content-Addressable Storage (CAS) (`<tier>/<scope>/<sha256>.<ext>`).

---

## 7. Checklist de Verificação de Qualidade Pré-Commit

Antes de declarar qualquer tarefa ou implementação como concluída, valide todos os quality gates:

```bash
# 1. Typecheck: Zero erros de compilação em todos os módulos
npm run typecheck

# 2. Linter & Complexidade: Zero erros, todas as funções com complexidade cognitiva <= 15
npm run lint

# 3. Código Morto & Superfícies Órfãs: Zero exports não utilizados ou superfícies mortas
npm run check:orphan-surfaces

# 4. Fallback Debt: Zero dívida de fallback em todas as regras de ouro
npm run check:fallback-debt

# 5. Testes Automatizados: 100% de sucesso na suíte de testes com piso de cobertura respeitado
npm test
```

---

## 8. Zero Duplicação de Conhecimento (Princípio DRY)

> *"Todo conhecimento deve possuir uma única representação, não ambígua e autoritativa dentro de um sistema."* — Andrew Hunt & David Thomas, *The Pragmatic Programmer* (1999)

A duplicação de código é o vetor mais difundido de **falhas de inconsistência** (Avizienis et al., 2004). Quando uma regra de domínio, algoritmo ou transformação de dados existe em $n$ cópias idênticas, uma correção aplicada em menos de $n$ locais produz uma **falha de divergência** — um defeito latente cuja probabilidade de ativação converge para a certeza conforme o sistema evolui. Pesquisas empíricas de detecção de clones (Roy, Cordy & Koschke, 2009; Kamiya et al., 2002) demonstram que fragmentos duplicados representam 5–20% de grandes bases de código e são responsáveis por uma parcela desproporcional de defeitos de regressão.

### 8.1 Fundamento Teórico

O princípio DRY é fundamentado na **minimização de redundância informacional** e na taxonomia de acoplamento de Myers:

- **Ponto Único de Verdade (SPOT):** Cada conhecimento discreto de domínio — uma regra de negócio, uma restrição de validação, uma fórmula de transformação, um esquema de configuração — deve ser definido exatamente uma vez. Todos os consumidores referenciam essa definição canônica.
- **Amplificação de Acoplamento:** Lógica duplicada cria **acoplamento de conteúdo** (Myers, 1978) — a forma mais forte e prejudicial de dependência entre módulos. Uma alteração no conhecimento duplicado exige modificações coordenadas em todas as cópias, violando o **Princípio Aberto/Fechado** e aumentando a **métrica de Instabilidade** do sistema ($I = C_e / (C_a + C_e)$, Martin 1995).
- **Acúmulo de Entropia:** Cada local de duplicação aumenta a **entropia de configuração** do sistema — o número de locais independentes onde um único fato lógico pode divergir. A probabilidade de pelo menos uma divergência após $k$ eventos de manutenção independentes em $n$ cópias é:

$$P(\text{divergência}) = 1 - \left(\frac{1}{n}\right)^{k-1}$$

Isso converge para $1.0$ rapidamente, tornando a duplicação uma fonte inevitável de defeitos ao longo do tempo.

### 8.2 Mandato Arquitetural

1. **Regras de Domínio:** Invariantes de negócio, predicados de validação e fórmulas de cálculo devem existir em exatamente um módulo de domínio. Camadas de apresentação, esquemas de API e mapeadores de persistência referenciam a fonte canônica — jamais a redefinem.
2. **Pipelines de Transformação de Dados:** Lógica de mapeamento entre camadas (DTO $\leftrightarrow$ Entidade, Entidade $\leftrightarrow$ ViewModel) deve ser centralizada em funções de mapeamento dedicadas ou classes adaptadoras. Transformações inline ad-hoc duplicadas entre controllers ou resolvers são proibidas.
3. **Configuração e Constantes:** Números mágicos, literais de string, padrões regex e valores-limite devem residir em módulos de constantes tipadas ou esquemas de ambiente validados. Espalhar literais idênticos entre arquivos é proibido.
4. **Definições de Tipo e Contratos:** Shapes de dados compartilhados (contratos de API, esquemas de eventos, payloads de mensageria) devem ser definidos uma vez em um pacote de contrato compartilhado. Redefinições no lado consumidor ou espelhamento manual de interfaces são proibidos.

### 8.3 Limiares Quantitativos

| Métrica | Teto | Ferramenta (multi-linguagem) |
| :--- | :--- | :--- |
| **Clones Tipo-1 (textuais exatos)** | $0$ | jscpd (JS/TS/Python/C#), PMD CPD (Java/Kotlin/C#), Simian (multi-lang) |
| **Clones Tipo-2 (identificadores renomeados)** | $0$ | jscpd (`--min-tokens 50`), PMD CPD, SonarQube |
| **Clones Tipo-3 (lacunados / quase-iguais)** | $\le 2\%$ do LOC total | SonarQube, NiCad (multi-lang) |
| **Literais de constantes duplicados** | $0$ | Biome/ESLint (JS/TS), Roslyn Analyzers (C#), detekt (Kotlin), Ruff/Pylint (Python) |
| **Redefinições de tipo entre pacotes** | $0$ | Revisão manual, Knip (JS/TS), ArchUnit (Java/Kotlin), NDepend (C#) |

### 8.4 Anti-Padrões Estritos

- **Reuso por Cópia e Cola:** Duplicar o corpo de uma função entre módulos ao invés de extrair para um utilitário compartilhado com importação explícita. Este é o vetor principal de falhas de divergência.
- **Hierarquias Paralelas:** Manter árvores de classes isomórficas (ex.: `UserDTO`, `UserResponse`, `UserViewModel`) onde cada classe redefine o mesmo conjunto de campos com variações triviais. Consolidar via tipos mapeados, genéricos ou contratos base compartilhados.
- **Constantes Dispersas (Shotgun Constants):** Incorporar o mesmo número mágico, padrão regex ou string de configuração em múltiplos arquivos. Um único local de correção perdido produz inconsistência comportamental silenciosa.
- **Eco de Schema:** Redefinir manualmente shapes de resposta de API, tipos de colunas de banco de dados ou estruturas de payload de eventos no código consumidor ao invés de importar da definição autoritativa de contrato.
- **Proliferação de Fixtures de Teste:** Duplicar lógica de construção de objetos complexos entre arquivos de teste ao invés de centralizar em fábricas de fixture compartilhadas ou utilitários builder.

### 8.5 Estratégias Canônicas de Remediação

| Padrão de Duplicação | Remediação |
| :--- | :--- |
| Corpos de função idênticos | Extrair para módulo compartilhado; importar em todos os call sites |
| Definições de tipo isomórficas | Contrato-fonte único + tipos mapeados/derivados |
| Predicados de validação repetidos | Função de predicado de domínio; referenciar de todas as camadas |
| Literais de constantes dispersos | Módulo de constantes tipadas ou esquema de ambiente validado |
| Construção de objetos de teste duplicada | Padrão Builder ou fábrica de fixture compartilhada |
| Lógica de mapeamento entre camadas | Mapper/adapter dedicado com ownership único |
