# 🏛️ Guia de Princípios de Design SOLID

Este documento estabelece a aplicação canônica dos cinco princípios **SOLID** (Martin, 2000; Liskov, 1987; Meyer, 1988) em toda a arquitetura de software. Todo componente, módulo, agregado e serviço deve cumprir estritamente estes mandatos.

---

## 1. Princípio da Responsabilidade Única (SRP)

> *"Um módulo deve ter uma, e apenas uma, razão para mudar."* — Robert C. Martin

### 1.1 Mandato Arquitetural
- Cada módulo de software, classe ou serviço deve prestar contas a um único ator ou stakeholder.
- Separação estrita de responsabilidades arquiteturais através de fronteiras estratificadas:
  - **Entrega / Controllers:** Responsáveis exclusivamente por negociação de transporte, parsing de parâmetros, extração de autenticação e mapeamento de códigos de status de resposta ($\le 300\text{ LOC}$).
  - **Casos de Uso da Aplicação:** Responsáveis exclusivamente por coreografar agregados de domínio, gerenciar transações e delegar para portas outbound.
  - **Entidades de Domínio & Value Objects:** Responsáveis exclusivamente por invariantes de regras de negócio, validação de estado e cálculos puros.
  - **Adaptadores de Infraestrutura:** Responsáveis exclusivamente por mecânica técnica (consultas SQL, chamadas de rede para APIs externas, E/S em disco).

### 1.2 Métricas Quantitativas & Arquiteturais
- **Falta de Coesão de Métodos (LCOM):** Métodos em uma classe devem operar sobre campos de estado compartilhados; clusters desconexos de métodos indicam múltiplas responsabilidades e exigem decomposição.
- **Complexidade Cognitiva Máxima por Função:** $\le 15$ pontos.

### 1.3 Anti-Patterns Estritos
- **God Class / Monster Controller:** Mesclar validação de requisição, checagens de autorização, queries SQL, integração com APIs de terceiros e formatação dentro de um único arquivo ou handler.
- **Entidades Híbridas de Domínio e Infraestrutura:** Acoplar regras de validação de negócio com anotações de esquema de banco de dados ou hooks de ciclo de vida de ORM.

---

## 2. Princípio Aberto/Fechado (OCP)

> *"Entidades de software (classes, módulos, funções) devem ser abertas para extensão, mas fechadas para modificação."* — Bertrand Meyer

### 2.1 Mandato Arquitetural
- O sistema deve permitir que novos comportamentos sejam adicionados sem alterar o código-fonte existente e verificado.
- Novas capacidades são introduzidas implementando abstrações polimórficas, registrando novas estratégias em registries de factories ou conectando-se a pipelines de middleware combináveis.
- Fluxos de negócio centrais dependem de interfaces abstratas (`IPaymentProcessor`, `IReportGenerator`, `IStorageGateway`), permitindo que novas implementações sejam injetadas dinamicamente via configuração.

### 2.2 Métricas Quantitativas & Arquiteturais
- **Variações Protegidas (Larman):** Identificar pontos de instabilidade ou variação previsíveis; isolá-los atrás de interfaces contratuais estáveis.
- Zero git diff nos orquestradores centrais de domínio quando um novo provedor externo ou mecanismo de entrega for introduzido.

### 2.3 Anti-Patterns Estritos
- **Escadas Monolíticas de Ramificação:** Modificar casos de uso centrais com cadeias crescentes de `if/else` ou comandos `switch` sempre que uma nova variante, provedor de pagamento ou formato de exportação for adicionado.
- **Instanciação Direta de Variantes Concretas:** Instanciar classes concretas específicas diretamente dentro dos fluxos consumidores em vez de utilizar factories ou registries.

---

## 3. Princípio de Substituição de Liskov (LSP)

> *"Subtipos devem ser substituíveis por seus tipos base sem alterar a corretude do programa."* — Barbara Liskov

### 3.1 Mandato Arquitetural
- Qualquer implementação de uma interface ou derivado de uma abstração deve manter conformidade comportamental estrita com o contrato esperado pelo chamador.
- **Pré-condições não podem ser fortalecidas:** Um subtipo não deve exigir argumentos de entrada mais restritivos ou pré-requisitos adicionais em relação à abstração base.
- **Pós-condições não podem ser enfraquecidas:** Um subtipo deve satisfazer todas as garantias e contratos de saída prometidos pela abstração base.
- **Invariantes devem ser preservados:** Mutações no subtipo nunca devem violar as regras de consistência estrutural estabelecidas pelo tipo base.

### 3.2 Métricas Quantitativas & Arquiteturais
- **Zero Asserções de Tipo em Tempo de Execução:** O código que consome uma abstração jamais deve exigir checagens de `instanceof`, reflexão dinâmica de propriedades ou coerção forçada de tipos (*casting*) para operar com segurança.
- **Uniformidade de Exceções:** Subtipos só podem emitir exceções de domínio especificadas pelo contrato da interface de porta.

### 3.3 Anti-Patterns Estritos
- **Herança Recusada / `NotImplementedException`:** Implementar um método de interface lançando uma exceção de não suportado ou deixando um método vazio porque o subtipo não oferece suporte àquela operação.
- **Violação de Contrato via Retornos Nulos/Degradados:** Retornar `null` ou ignorar silenciosamente parâmetros quando o contrato da interface base garante explicitamente um resultado operacional.

---

## 4. Princípio da Segregação de Interfaces (ISP)

> *"Clientes não devem ser forçados a depender de interfaces que não utilizam."* — Robert C. Martin

### 4.1 Mandato Arquitetural
- Preferir interfaces pequenas, focadas e específicas por papel a contratos generalistas volumosos.
- As interfaces pertencem ao cliente que as consome, não ao provedor de infraestrutura que as implementa.
- Decompor capacidades amplas em facetas funcionais coesas (ex.: separar `IEntityReader` de `IEntityWriter`, ou `ITokenValidator` de `IUserSessionManager`).
- Consumidores declaram dependência explícita apenas sobre o subconjunto mínimo de métodos necessários para sua operação.

### 4.2 Métricas Quantitativas & Arquiteturais
- **Coesão de Interface:** Interfaces devem conter o conjunto ortogonal mínimo de métodos necessários para um único papel de cliente ($\le 5$ métodos por interface de papel).
- **Zero Overhead de Mock em Testes:** Test doubles (mocks/stubs) para uma interface devem exigir a configuração apenas dos métodos pertinentes ao caso de uso em teste.

### 4.3 Anti-Patterns Estritos
- **Contratos Coletor / Header Interface:** Criar uma interface que espelhe todos os métodos públicos de um grande serviço (ex.: `IUserService` com 40 métodos diversos) e forçar todos os chamadores a depender dessa superfície inteira.
- **Implementações Dummy:** Forçar mocks de teste ou adaptadores especializados a escrever implementações vazias para dezenas de métodos não utilizados de uma interface.

---

## 5. Princípio da Inversão de Dependência (DIP)

> *"Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações. Abstrações não devem depender de detalhes. Detalhes devem depender de abstrações."* — Robert C. Martin

### 5.1 Mandato Arquitetural
- A direção das dependências no código-fonte deve apontar para dentro, em direção às políticas de alto nível e regras de domínio, jamais para fora em direção a mecanismos técnicos de baixo nível.
- Inversão de Controle (IoC):
  - Casos de uso de alto nível definem as **Portas** (interfaces) de que necessitam para cumprir sua intenção (ex.: `IOrderRepository`, `INotificationGateway`).
  - Módulos de infraestrutura de baixo nível fornecem os **Adaptadores** que implementam essas interfaces (ex.: `PostgresOrderRepository`, `SesNotificationGateway`).
  - O acoplamento de adaptadores concretos a portas abstratas ocorre no ponto de entrada da aplicação (Composition Root / Container de Injeção de Dependências).

### 5.2 Métricas Quantitativas & Arquiteturais
- **Princípio das Dependências Estáveis (SDP):** As dependências devem apontar na direção da estabilidade. Políticas de alto nível são maximamente estáveis; detalhes técnicos de baixo nível são voláteis.
- **Zero Importações Concretas de Infraestrutura no Domínio:** A análise estática deve verificar zero importações de ORMs, clientes HTTP, SDKs em nuvem ou utilitários de sistema de arquivos nas camadas de domínio e aplicação.

### 5.3 Anti-Patterns Estritos
- **Acoplamento Direto de Baixo Nível:** Instanciar um cliente de banco de dados concreto, instância de SDK ou leitor de sistema de arquivos diretamente dentro de uma entidade de domínio ou caso de uso.
- **Vazamento de Modelos de Infraestrutura:** Expor tipos de linhas gerados por ORM ou estruturas de resposta de SDKs de terceiros através das fronteiras de porta para dentro do modelo de domínio.

---

## Matriz Resumo

| Princípio | Foco Primário | Indicador de Falha | Remédio Arquitetural |
| :--- | :--- | :--- | :--- |
| **S** - SRP | Coesão de módulos & ator único | Controllers gordos, LCOM alto, conflitos frequentes de merge | Decompor por camada e ciclo de vida |
| **O** - OCP | Extensibilidade sem mutação | Cadeias frágeis de `switch/case` a cada nova funcionalidade | Estratégias polimórficas & registries de factory |
| **L** - LSP | Equivalência comportamental contratual | Checagens de `instanceof`, `NotImplementedException` | Subtipagem comportamental & contratos formais |
| **I** - ISP | Interfaces enxutas sob medida para o cliente | Configuração pesada de mocks em testes, métodos dummy | Interfaces de papéis refinadas |
| **D** - DIP | Direção de dependência para dentro | Importações diretas de DB/SDK no domínio | Portas Hexagonais & Inversão de Controle |
