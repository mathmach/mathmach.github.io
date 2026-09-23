# 🧪 Estratégia de Testes Automatizados & Arquitetura de Verificação

## Pirâmides de Testes, Limites de Contrato, Test Doubles & Ratchets de Cobertura

Este documento codifica a arquitetura de verificação, a taxonomia de testes e os ratchets de qualidade automatizados deste repositório. Esses princípios fornecem uma base formal de engenharia aplicável a qualquer linguagem de programação, framework ou ambiente de execução.

---

## 1. Fundamentos Teóricos da Verificação de Software

Na engenharia de sistemas (ISO/IEC/IEEE 15288), a garantia de qualidade de software equilibra duas disciplinas complementares definidas por Barry Boehm (1981):

- **Verificação:** *"Estamos construindo o produto da forma correta?"* Assegura que o software está rigorosamente de acordo com suas especificações arquiteturais, contratos de tipos e invariantes de domínio.
- **Validação:** *"Estamos construindo o produto certo?"* Garante que o software atende às necessidades operacionais e de negócio em seu ambiente de destino.

```
       Escalação de Custo de Defeitos (Curva Econômica de Boehm)
Custo
  ▲
100x│                                          ● Incidente em Produção
    │
 10x│                           ● Defeito em Integração
    │
  1x│            ● Captura em Teste Unitário
    └────────────┴──────────────┴──────────────┴─────────────►
               Design         Build          Deploy     Ciclo de Vida
```

A engenharia empírica de software demonstra que o custo de mitigação de defeitos aumenta exponencialmente ao longo das fases do ciclo de vida. Um defeito interceptado durante testes unitários incorre em um custo de $1\times$. O mesmo defeito descoberto na integração custa $10\times$, e em produção escala para $100\times$ ou mais devido a incidentes, recuperação de dados e ciclos emergenciais de deploy.

Uma estratégia rigorosa de testes automatizados é, portanto, uma **necessidade econômica indispensável para a velocidade sustentável de entrega**.

---

## 2. O Troféu de Verificação & Taxonomia Multicamadas

As arquiteturas modernas de verificação estruturam os testes com base no modelo da **Pirâmide de Testes** (Mike Cohn, 2009; Martin Fowler, 2012) e no **Troféu de Testes**, estabelecendo camadas com características e invariantes bem definidos:

```
                  ┌───────────────────────┐
                  │      Tier 3: E2E      │  ◄── Fluxos Sistêmicos Caixa-Preta
                  │   (Browser / Sistema) │      Execução: Segundos
                  ├───────────────────────┤
                  │  Tier 2: Integração   │  ◄── Limites de Contrato & Adaptadores
                  │ (Componente/Adaptador)│      Execução: Milissegundos
                  ├───────────────────────┤
                  │     Tier 1: Unitário  │  ◄── Lógica Pura & Matemática
                  │ (Cálculos / Domínio)  │      Execução: Microssegundos
                  └───────────────────────┘
```

### Tier 1: Testes Unitários (Domínio Puro & Invariantes Matemáticos)
- **Escopo:** Funções isoladas, entidades de domínio, value objects e algoritmos matemáticos.
- **Invariantes de Execução:**
  - Orçamento de latência em microssegundos ($< 5\text{ms}$ por teste).
  - Estritamente **zero operações de I/O** (sem requisições de rede, leitura em disco ou conexões com banco).
  - Determinismo absoluto: para entradas idênticas, as saídas são idênticas independente do relógio do sistema, SO ou ordem de execução.
- **Propósito:** Validar exaustivamente ramos combinatórios, casos de borda e regras de negócio.

### Tier 2: Testes de Integração (Limites de Contrato & Costuras do Sistema)
- **Escopo:** Interação entre múltiplos módulos colaboradores, adaptadores de portas hexagonais, dicionários de tradução, índices de catálogo e mappers.
- **Invariantes de Execução:**
  - Orçamento de latência em milissegundos ($< 100\text{ms}$ por teste).
  - Valida contratos de esquemas, paridade de traduções e interfaces entre camadas.
  - Interage com test doubles controlados em memória.
- **Propósito:** Garantir que componentes verificados isoladamente funcionem perfeitamente quando integrados nas costuras arquiteturais.

### Tier 3: Testes Ponta a Ponta / E2E (Fluxos Sistêmicos Caixa-Preta)
- **Escopo:** Sistema completo montado e em execução em um ambiente realista (ex.: navegador headless).
- **Invariantes de Execução:**
  - Interação caixa-preta: opera exclusivamente via interfaces públicas (eventos de usuário, DOM renderizado, APIs públicas).
  - Valida propriedades emergentes: estabilidade da renderização WebGL, transições de rotas, propagação assíncrona e orçamentos de renderização.
  - Tolerância zero a esperas arbitrárias (sem sleeps): utiliza sincronização baseada em eventos e seletores com espera automática.
- **Propósito:** Comprovar que os fluxos críticos do usuário operam com confiabilidade sob condições reais.

---

## 3. Taxonomia de Test Doubles (Gerard Meszaros & Martin Fowler)

Ao testar entre fronteiras de módulos, o desacoplamento de dependências requer o uso disciplinado de **Test Doubles**. Seguindo Gerard Meszaros (*xUnit Test Patterns: Refactoring Test Code*, 2007) e Martin Fowler (*Mocks Aren't Stubs*, 2007), distinguimos cinco tipos:

| Tipo de Double | Definição | Caso de Uso Principal |
|---|---|---|
| **Dummy** | Objetos repassados como argumento mas nunca realmente chamados ou lidos. | Preencher listas de parâmetros exigidas por construtores ou métodos. |
| **Stub** | Objetos que fornecem respostas pré-configuradas a chamadas realizadas durante o teste. | Simular consultas externas, leitores de configuração ou serviços somente-leitura. |
| **Spy** | Stubs que também registram metadados das chamadas (argumentos, contagem de invocações, ordem). | Afirmar que uma notificação ou evento externo foi disparado com os parâmetros corretos. |
| **Mock** | Objetos pré-programados com expectativas explícitas; qualquer desvio na sequência ou argumentos falha o teste. | Verificar protocolos estritos de interação e transições de máquinas de estado. |
| **Fake** | Implementações funcionais com atalhos inadequados para produção (ex.: repositório em array na memória em vez de SQL). | Testes de integração rápidos de fluxos de negócio sem infraestrutura pesada. |

### As Duas Regras de Ouro dos Test Doubles

1. **Nunca mocke o que você não possui:**
   Mockar SDKs de terceiros ou drivers externos acopla os testes a detalhes de implementação que podem divergir da realidade. Em vez disso, encapsule dependências externas em **Portas Hexagonais** e mocke apenas o seu contrato de porta interno.
2. **Prefira Fakes e Stubs em vez de Mocks:**
   O excesso de mocks verifica *como* o código opera internamente em vez de *o que* ele produz, gerando testes frágeis que quebram diante de refatorações internas legítimas.

---

## 4. Ratchets de Qualidade na Engenharia

Para evitar que a disciplina de testes sofra degradação ao longo do tempo, o repositório impõe três ratchets de qualidade:

### 4.1 Ratchet de Piso de Cobertura Unidirecional
A cobertura de testes só pode se mover para cima. Se uma melhoria arquitetural elevar a cobertura de $80\%$ para $85\%$, esse índice passa a ser o novo piso permanente. Qualquer commit subsequente que rebaixe a cobertura reprova o pipeline de CI.

### 4.2 TDD como Vetor de Design
Escrever o teste com falha antes da implementação força o design de interfaces limpas e modulares. Um código difícil de testar isoladamente indica acoplamento excessivo ou violação do Princípio da Responsabilidade Única (SRP).

### 4.3 Tolerância Zero a Testes Instáveis (Flaky Tests)
Um teste intermitente é pior do que a ausência de testes. A instabilidade mina a confiança da equipe no CI. Testes instáveis devem ser imediatamente postos em quarentena, diagnosticados pela raiz e corrigidos.

---

## 5. Integração com Pipelines Automatizados

A execução dos testes ocorre em etapas progressivas para otimizar a velocidade de feedback:

```bash
# 1. Verificação Unitária em Microssegundos (Frequente no desenvolvimento local)
npm run test:unit

# 2. Verificação de Integração de Subsistemas (Antes de commitar)
npm run test:integration

# 3. Suíte de Testes Completa (Mandatória no Pre-Commit e no CI do PR)
npm test
```

