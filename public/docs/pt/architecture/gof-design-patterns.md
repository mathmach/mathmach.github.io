# 🧩 Guia de Padrões de Design GoF (Gang of Four)

Este documento cataloga os padrões clássicos de design (Gamma et al., 1994) aplicados à arquitetura moderna de software, definindo casos de uso arquiteturais mandatórios e proibições estritas.

---

## 1. Padrões Criacionais

| Padrão | Regra de Aplicação Arquitetural | Proibição Estrita (Anti-Pattern) |
| :--- | :--- | :--- |
| **Factory Method** | Encapsula a instanciação de adaptadores de infraestrutura intercambiáveis ou serviços de domínio em um Registro ou Factory centralizado. | Instanciar clientes de API ad-hoc ou serviços de terceiros acoplados diretamente dentro de controllers ou camadas de entrega. |
| **Abstract Factory** | Fornece uma interface para criar famílias de componentes relacionados ou dependentes sem especificar suas implementações concretas. | Acoplar subsistemas ou motores incompatíveis em tempo de execução sem verificar a compatibilidade arquitetural entre componentes. |
| **Builder** | Constrói objetos de configuração complexos, parâmetros de execução ou comandos estruturados de múltiplos passos via métodos imutáveis e fluentes. | Montar comandos de sistema, payloads complexos ou consultas via concatenação manual de strings (`"cmd -a " + arg`). |
| **Prototype** | Clonagem profunda de estruturas de entidades de domínio garantindo a geração atômica e reatribuição de identificadores únicos. | Copiar hierarquias de entidades via desestruturação rasa (*shallow*), duplicando acidentalmente identificadores imutáveis entre registros. |
| **Singleton** | Garante que recursos caros de infraestrutura (como pools de conexões de banco de dados ou brokers de mensageria) mantenham exatamente uma instância gerenciada. | Instanciar conexões de banco não gerenciadas ou clientes ad-hoc dentro de loops, handlers efêmeros ou funções utilitárias. |

---

## 2. Padrões Estruturais

| Padrão | Regra de Aplicação Arquitetural | Proibição Estrita (Anti-Pattern) |
| :--- | :--- | :--- |
| **Adapter** | Traduz interfaces de terceiros incompatíveis, esquemas proprietários ou contratos de SDKs para a interface de porta do domínio interno. | Vazar particularidades de fornecedores externos, formatos de dados de terceiros ou tipos de SDKs para a camada de domínio central. |
| **Facade** | Expõe uma interface coesa, simplificada e de alto nível sobre subsistemas complexos de múltiplos passos e rotinas de orquestração de domínio. | Forçar controllers de entrega ou roteadores de interface a orquestrar centenas de linhas de invocações de serviços entre subsistemas. |
| **Composite** | Trata estruturas em árvore aninhadas e hierárquicas (nós pais e nós folhas) uniformemente através de uma interface base compartilhada. | Manipular árvores hierárquicas de entidades através de arrays planos desconectados sem restrições relacionais explícitas entre pais e filhos. |
| **Decorator** | Anexa dinamicamente responsabilidades transversais (rastreamento de telemetria, limitação de taxa, autenticação, logs de auditoria) sem alterar a lógica de negócio. | Duplicar manualmente verificações repetitivas de autenticação, métricas de performance ou registro de erros em cada handler de negócio. |
| **Proxy** | Controla e protege o acesso a um recurso de destino (ex.: proxies de segurança com proteção contra SSRF, proxies de cache para operações de leitura lentas). | Consumir URIs de rede externa ou endpoints não verificados sem inspeção prévia de lista permitida e validação criptográfica. |
| **Bridge** | Desacopla uma abstração de sua implementação física para que ambas possam evoluir e variar de forma independente. | Acoplar representações de dados de domínio diretamente a gráficos específicos de plataforma, layouts físicos de exibição ou formatos de transporte. |
| **Flyweight** | Compartilha instâncias imutáveis e somente leitura na memória para viabilizar execução eficiente sobre grandes volumes de objetos de valor (*value objects*). | Duplicar cópias redundantes de catálogos estáticos pesados e árvores de configuração para cada entidade de tempo de execução criada na memória. |

---

## 3. Padrões Comportamentais

| Padrão | Regra de Aplicação Arquitetural | Proibição Estrita (Anti-Pattern) |
| :--- | :--- | :--- |
| **Strategy** | Define uma família de algoritmos, encapsula cada um e os torna intercambiáveis em tempo de execução via uma interface comum (`IExecutionStrategy`). | Codificar variações algorítmicas, regras operacionais ou lógica de processamento dentro de ramificações condicionais monolíticas (`if/else` ou `switch` gigantes). |
| **Observer** | Estabelece uma dependência um-para-muitos entre objetos para que, quando um agregado altera seu estado, os assinantes sejam notificados (Barramento de Eventos). | Implementar loops agressivos de consulta periódica (*polling*) ao banco de dados para detectar transições assíncronas de estado entre subsistemas. |
| **Command** | Encapsula uma requisição como um objeto, permitindo enfileiramento de execução, histórico de auditoria e suporte bidirecional nativo para `execute()` e `undo()`. | Aplicar mutações destrutivas e irreversíveis diretamente às estruturas de estado sem manter um log de transação reversível. |
| **State** | Permite que um objeto altere seu comportamento quando seu estado interno muda, formalizando transições dentro de uma Máquina de Estados Finitos (FSM). | Transicionar estados de ciclo de vida do sistema via mutações arbitrárias de strings sem validar pré e pós-condições estruturais. |
| **Template Method** | Define o esqueleto invariante de um fluxo de trabalho em um template base, delegando passos algorítmicos específicos para subclasses ou delegados especializados. | Permitir que pipelines distintos de execução dupliquem rotinas padrão de ciclo de vida (validar $\to$ autorizar $\to$ executar $\to$ auditar) de forma inconsistente. |
| **Chain of Responsibility** | Passa requisições ao longo de uma cadeia sequencial de handlers independentes, onde cada um decide se processa a requisição ou a repassa adiante. | Agrupar checagens de validação distintas, inspeções de segurança e filtros de sanitização em blocos monolíticos e inseparáveis. |
| **Mediator** | Centraliza e encapsula a comunicação e coordenação complexa entre múltiplos componentes ou agentes colaboradores. | Permitir que subsistemas ou agentes desacoplados executem chamadas cruzadas diretas e circulares sem uma orquestração centralizada. |
| **Visitor** | Adiciona novas operações analíticas, de serialização ou exportação a estruturas compostas sem modificar as classes fundamentais de entidades. | Inflar modelos de domínio com rotinas de formatação e serialização sob medida para formatos específicos de arquivos externos. |
| **Memento** | Captura e externaliza o estado interno de um objeto sem violar o encapsulamento, viabilizando checkpoints, rollback de estado e recuperação transacional. | Expor propriedades mutáveis internas de estado ou estruturas privadas de dados a consumidores para implementar recursos de salvamento automático, desfazer ou rollback. |
| **Iterator** | Fornece um mecanismo padronizado para percorrer elementos de uma coleção agregada sequencialmente sem expor sua representação subjacente ou disposição física. | Forçar código cliente a manipular índices de array de baixo nível, ponteiros de cursor ou links de nós ao percorrer hierarquias complexas de coleções. |
| **Interpreter** | Avalia sentenças ou expressões de uma Linguagem Específica de Domínio (DSL) definindo uma gramática formal e uma árvore de interpretação baseada em AST. | Espalhar manipulações ad-hoc de strings com regex, lógica de parsing personalizada e regras de execução por handlers de aplicação não relacionados. |
