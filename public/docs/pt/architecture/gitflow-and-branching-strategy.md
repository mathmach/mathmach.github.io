# 🌿 Manual de GitFlow & Estratégia Moderna de Ramificação

## Topologias de Branch, Defesa em Profundidade na Qualidade & Previsibilidade de Release

Este documento estabelece a arquitetura formal de ramificação (branching), os invariantes de convergência de código e os quality gates multicamadas que governam a entrega de software. Esses princípios são estritamente agnósticos de linguagem e framework.

---

## 1. Topologia Teórica do Controle de Versão

Em sistemas distribuídos de controle de versão (DVCS), o histórico do repositório forma um Grafo Acíclico Dirigido (DAG) $G = (V, E)$, onde cada vértice $v \in V$ representa um snapshot imutável de commit, e cada aresta direcionada $e = (u, v) \in E$ denota uma relação pai-filho de derivação.

```
       (feature/auth)
          C1 ─── C2 ─── C3
         /                \  [PR Gate & Squash Merge]
─── M0 ───────────────────── M1 ───────────────────────── M2 ── (main)
                              \                         /
                               H1 ───────────────────── H2
                                 (hotfix/token-rotation)
```

A tensão fundamental no controle de versão moderno reside entre:
1. **Velocidade do Tronco (Trunk Velocity):** A frequência com que contribuições individuais convergem no caminho principal de entrega.
2. **Deriva de Ramificação (Branch Drift):** A métrica de divergência que mede a distância topológica e semântica entre uma branch de feature e a mainline.

Pesquisas empíricas de engenharia de software sobre controle de versão distribuído (Brun et al., 2011) demonstram que conflitos de colaboração dividem-se em duas categorias distintas:
- **Conflitos Textuais:** Edições concorrentes em linhas ou nós de AST sobrepostos, interceptados por algoritmos tradicionais de diff.
- **Conflitos Semânticos de Ordem Superior:** Quebras de compilação ou regressões de teste que ocorrem mesmo após mesclagens textuais limpas, devido a suposições divergentes entre módulos.

Brun et al. (2011) observaram que até 33% dos eventos de mesclagem contêm conflitos semânticos ou de compilação latentes que ferramentas convencionais de VCS não detectam de forma proativa. Conforme o tempo de isolamento da branch aumenta, mudanças não integradas acumulam-se, multiplicando o esforço cognitivo de resolução.

Para eliminar a divergência preservando a verificação rigorosa antes do código entrar em produção, esta arquitetura adapta o modelo canônico de GitFlow (Vincent Driessen, 2010) em **Ramificação Efêmera de Features com Convergência por Quality Gates Rígidos**.

---

## 2. Os Cinco Invariantes do GitFlow

Todo engenheiro e agente autônomo operando neste repositório deve seguir estritamente estes cinco invariantes:

### Invariante 1: Mainline Imutável (Zero Push Direto para Produção)
A branch `main` representa software de produção verificado e pronto para deploy. Pushes diretos (`git push origin main`) são bloqueados por regras de proteção de branch. Todas as modificações convergem exclusivamente através de Pull Requests revisados e validados.

### Invariante 2: Ciclo de Vida Efêmero de Branches ($\le 48\text{h}$)
Branches de trabalho devem ter vida curta. Nenhuma branch de feature pode acumular mudanças ao longo de semanas. Iniciativas longas devem ser decompostas em fatias arquiteturais independentes protegidas por Feature Flags ou Adaptadores Hexagonais.

A nomenclatura das branches segue taxonomia rígida:
- `feat/<escopo>-<descricao>`: Novas capacidades funcionais ou casos de uso.
- `fix/<escopo>-<descricao>`: Correção de defeitos e bugs.
- `refactor/<escopo>-<descricao>`: Reestruturação interna preservando comportamento observável.
- `chore/<escopo>-<descricao>`: Ferramentas, dependências ou configurações.
- `docs/<escopo>-<descricao>`: Documentação arquitetural e especificações.

### Invariante 3: Histórico Linear e Determinístico
Os grafos de commit devem permanecer compreensíveis para bissecção automatizada (`git bisect`) e auditorias de conformidade. Branches de feature realizam rebase na `main` atual antes da convergência, seguido de commits de merge squashed ou semi-lineares que preservam a rastreabilidade do PR.

### Invariante 4: Quality Gates Rígidos Pré-Convergência
O código não pode ser integrado à `main` baseado apenas em aprovação subjetiva de pares. Pipelines de verificação automatizados devem ser executados de forma determinística em ambientes isolados de integração contínua (CI) e reportar 100% de sucesso em todos os ratchets de qualidade.

### Invariante 5: Versionamento Semântico & Artefatos Rastreáveis
Releases são marcos imutáveis governados pelo **Semantic Versioning (SemVer 2.0.0, Tom Preston-Werner)**:

$$\text{Versão} = \text{MAJOR}.\text{MINOR}.\text{PATCH}$$

- **MAJOR:** Modificações incompatíveis de API ou arquitetura.
- **MINOR:** Adição de funcionalidades retrocompatíveis.
- **PATCH:** Correção de defeitos retrocompatíveis.

Todo artefato de release mapeia determinísticamente para um hash imutável de commit do Git e tag assinada.

---

## 3. Defesa em Profundidade: Os Três Anéis Concêntricos de Qualidade

A engenharia de qualidade exige defesa em múltiplas camadas. Confiar apenas no CI introduz latência de feedback; confiar apenas na discrição do desenvolvedor introduz falibilidade humana. Organizamos os quality gates em três anéis concêntricos de verificação:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Anel 3: Gate de Deploy                          │
│   (Verificação de Artefatos Estáticos, Integridade CAS, Release Atômico)│
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     Anel 2: Pipeline de CI do PR               │   │
│   │   (VM Limpa, Histórico Gitleaks, Typecheck, Suítes de Testes)  │   │
│   │                                                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │               Anel 1: Pre-Commit Hook Local            │   │   │
│   │   │   (Bloqueio .env, Gitleaks Staged, Linter, Typecheck)  │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Anel 1: Guardrail Local do Desenvolvedor (Pre-Commit Hook)
- **Vetor de Execução:** Git hooks gerenciados via `.husky/pre-commit`.
- **Orçamento de Latência:** $< 5$ segundos.
- **Escopo:** Apenas arquivos staged (`git diff --cached`).
- **Gates:**
  1. **Bloqueio de Arquivo `.env`:** Interrompe imediatamente o commit se qualquer arquivo de ambiente (`.env`, `.env.local`, `.env.prod`) estiver staged (exceto `.env.example`).
  2. **Scan de Segredos Staged:** Executa `gitleaks git --staged --no-banner --redact` para interceptar credenciais antes que entrem no histórico local.
  3. **Linter & Formatter Staged:** Formata e valida automaticamente arquivos staged (`biome check --write`), adicionando as correções ao stage.
  4. **Compilação & Typecheck:** Verifica tipos estáticos em todo o projeto (`tsc --noEmit`).

### Anel 2: Gate de Integração Contínua (GitHub Actions)
- **Vetor de Execução:** Runner Ubuntu estéril acionado em `pull_request` e `push` na `main`.
- **Isolamento:** Ambiente limpo; zero dependência de cache local do desenvolvedor.
- **Escopo:** Workspace completo e histórico total de commits do Git (`fetch-depth: 0`).
- **Gates:**
  1. **Análise Estática & Verificação de Tipos:** Compilação rigorosa sem emissão de arquivos.
  2. **Higiene e Complexidade de Código:** Validação por linter garantindo zero avisos ou violações de complexidade.
  3. **Scan Abrangente de Segredos:** Binário dedicado do Gitleaks inspeciona **todo o histórico de commits** (`gitleaks git --no-banner --redact`). Commitar um segredo e deletá-lo num commit seguinte continua sendo uma vulnerabilidade crítica barrada por este gate.
  4. **Execução de Testes Automatizados:** Executa suítes Unitárias e de Integração com exigência de 100% de aprovação.
  5. **Verificação de Build:** Compila o bundle de produção para verificar resolução de assets e minificação.

### Anel 3: Gate de Implantação Contínua (Pages / Hosting)
- **Vetor de Execução:** Workflow de deploy automatizado acionado apenas após convergência validada na `main`.
- **Isolamento:** Credenciais com permissões mínimas (`contents: read`, `pages: write`, `id-token: write`).
- **Invariantes:**
  1. Asserção prévia verificando sucesso do Anel 2 (CI).
  2. Imutabilidade dos artefatos utilizando hash de conteúdo nos bundles.
  3. Chaveamento atômico prevenindo estados intermediários corrompidos para os usuários.

---

## 4. Sanitização de Segredos & Higiene de Credenciais

Credenciais expostas representam incidentes irreversíveis de segurança. Uma vez enviadas para um repositório remoto, um segredo deve ser considerado comprometido, mesmo que o commit tenha sido revertido:

```
Commit A: Adiciona chave de API (VAZAMENTO OCORRE)
Commit B: Remove chave de API
Commit C: Ajusta estilos

Resultado no armazenamento de objetos Git: O Commit A permanece acessível
via SHA, reflogs, packfiles e forks. A chave está permanentemente exposta.
```

### Disciplina de Credenciais
1. **Nunca commitar segredos reais:** Todas as credenciais residem em arquivos locais não commitados (`.env.local`) ou gerenciadores de segredos seguros (ex.: GitHub Secrets, AWS Secrets Manager).
2. **Documentação Mandatória:** Toda variável de ambiente consumida pela aplicação deve ser documentada em `.env.example` com valores ilustrativos e descrições claras.
3. **Rigor nas Allowlists:** As allowlists do Gitleaks (`.gitleaks.toml`) devem ser estritamente restritas a exemplos de documentação ou fixtures de teste. Exclusões genéricas de diretórios (`tests/**`) são proibidas.

---

## 5. Padrões de Pull Request & Contrato de Qualidade

Um Pull Request é um contrato de revisão de engenharia entre contribuidores. Deve satisfazer:

1. **Escopo Focado:** PRs não devem exceder 400 linhas de código. De acordo com a teoria da carga cognitiva, a eficácia da revisão degrada acentuadamente além desse limiar.
2. **Conventional Commits:** Títulos e commits seguem formato padronizado:
   ```
   tipo(escopo): descrição concisa no modo imperativo
   ```
3. **Checklist Mandatório de PR:**
   Todo PR deve cumprir o checklist de `.github/PULL_REQUEST_TEMPLATE.md` atestando testes, tipos, formatação, segredos e ausência de código de depuração residual.

