# 🧩 Padrões de Projeto GoF (Gang of Four)

Este documento cataloga os padrões de projeto clássicos (Gamma et al., 1994) aplicados à arquitetura de software, estabelecendo os cenários de uso recomendados e os anti-padrões estritamente proibidos.

---

## 1. Padrões Criacionais (Creational Patterns)

| Padrão | Cenário Arquitetural de Aplicação | Anti-Padrão / Proibição Estrita |
| :--- | :--- | :--- |
| **Factory Method** | Encapsula a instanciação de componentes de infraestrutura ou serviços intercambiáveis em um único ponto de criação (Registry / Factory). | Instanciar clientes externos ou serviços acoplados diretamente dentro de controladores ou funções de apresentação. |
| **Abstract Factory** | Fornece uma interface para criar famílias de objetos relacionados ou dependentes sem especificar suas classes concretas (ex: famílias de renderização ou suítes de validação). | Misturar instâncias de subsistemas incompatíveis em tempo de execução sem validação prévia de conformidade. |
| **Builder** | Permite a construção passo a passo de objetos de configuração complexos ou comandos estruturados através de métodos fluentes e imutáveis. | Montar comandos, payloads complexos ou consultas estruturadas via concatenação manual e solta de strings (`"cmd -a " + arg`). |
| **Prototype** | Duplicação e clonagem profunda de árvores de entidades de domínio garantindo a geração atômica de novos identificadores únicos. | Copiar entidades complexas via desestruturação rasa (*shallow copy*), propagando identificadores duplicados acidentalmente. |
| **Singleton** | Garante que recursos caros de infraestrutura (como conexões de pool de banco ou clientes de mensageria) tenham apenas uma instância gerenciada. | Instanciar novos pools de conexão ou conexões ad-hoc dentro de loops ou funções utilitárias pontuais. |

---

## 2. Padrões Estruturais (Structural Patterns)

| Padrão | Cenário Arquitetural de Aplicação | Anti-Padrão / Proibição Estrita |
| :--- | :--- | :--- |
| **Adapter** | Traduz a interface de uma biblioteca ou serviço externo incompatível para a interface de porta requerida pelo domínio interno. | Permitir que peculiaridades de SDKs, formatos de terceiros ou assinaturas de rede vazem para o núcleo do domínio. |
| **Facade** | Fornece uma interface unificada e simplificada para um subsistema complexo ou conjunto de orquestrações de regras de negócio. | Forçar a camada de apresentação a orquestrar centenas de linhas de chamadas cruzadas e cálculos de regras de negócio. |
| **Composite** | Trata estruturas hierárquicas em árvore (nós pais e nós folhas) de forma uniforme e homogênea através de uma interface comum. | Manipular estruturas em árvore através de coleções planas soltas e desvinculadas de sua relação de contenção canônica. |
| **Decorator** | Adiciona dinamicamente responsabilidades transversais (ex: telemetria, autenticação, limitação de taxa, auditoria) a uma operação sem alterar seu código. | Repetir verificações manuais de autorização, métricas de latência ou logs de forma redundante dentro de cada função de negócio. |
| **Proxy** | Controla o acesso a um recurso (ex: proxy de segurança com validação contra SSRF, proxy de cache para dados de leitura lenta). | Consumir recursos ou URIs externas sem verificação de integridade, controle de cache ou sanitização prévia. |
| **Bridge** | Desacopla uma abstração de sua implementação física para que ambas possam variar independentemente. | Acoplar modelos de dados lógicos a representações gráficas ou físicas específicas de uma plataforma. |
| **Flyweight** | Compartilha instâncias imutáveis e pesadas na memória para suportar eficientemente grandes quantidades de objetos de valor. | Instanciar cópias repetidas de catálogos e dados estáticos para cada entidade criada em memória. |

---

## 3. Padrões Comportamentais (Behavioral Patterns)

| Padrão | Cenário Arquitetural de Aplicação | Anti-Padrão / Proibição Estrita |
| :--- | :--- | :--- |
| **Strategy** | Define uma família de algoritmos, encapsula cada um e os torna intercambiáveis em tempo de execução via interface comum (`IExecutionStrategy`). | Hardcodificar variações de regras de negócio em estruturas condicionais gigantescas (`if/else` aninhados ou `switch` monolíticos). |
| **Observer** | Define uma dependência um-para-muitos entre objetos, de modo que quando um muda de estado, seus dependentes são notificados (Barramento de Eventos). | Utilizar polling agressivo no banco de dados para detectar alterações assíncronas de estado. |
| **Command** | Encapsula uma requisição como um objeto, permitindo parametrizar clientes com filas de operações, registrar logs e prover suporte a `execute()` e `undo()`. | Executar mutações destrutivas e irreversíveis diretamente sobre o estado sem histórico de transição. |
| **State** | Permite que um objeto altere seu comportamento quando seu estado interno muda, encapsulando transições válidas em uma máquina de estados finita (FSM). | Transicionar estados através de atribuições livres de strings sem validação de pré-condições e invariantes. |
| **Template Method** | Define o esqueleto de um algoritmo em uma operação mãe, postergando etapas específicas para subclasses ou especializações. | Permitir que diferentes pipelines executem fluxos padrão (validação $\to$ autorização $\to$ execução $\to$ auditoria) de forma descoordenada. |
| **Chain of Responsibility** | Passa a requisição por uma cadeia de manipuladores independentes e ordenados, onde cada um pode processar ou abortar a execução. | Acoplar rotinas de inspeção, filtros de segurança e sanitização em blocos maciços e inseparáveis. |
| **Mediator** | Centraliza a comunicação complexa entre múltiplos subsistemas ou agentes para diminuir o acoplamento direto entre eles. | Módulos distintos realizarem chamadas circulares ou cruzadas diretamente sem um orquestrador central. |
| **Visitor** | Permite adicionar novas operações a estruturas de objetos sem alterar as classes sobre as quais opera (ideal para exportadores e geradores de relatórios). | Poluir entidades do modelo de domínio com métodos de serialização específicos de cada formato externo desejado. |
