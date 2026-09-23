# 🧩 Guía de Patrones de Diseño GoF (Gang of Four)

Este documento cataloga los patrones de diseño clásicos (Gamma et al., 1994) aplicados a la arquitectura moderna de software, definiendo casos de uso arquitectónicos obligatorios y prohibiciones estrictas.

---

## 1. Patrones Creacionales

| Patrón | Regla de Aplicación Arquitectónica | Prohibición Estricta (Anti-Patrón) |
| :--- | :--- | :--- |
| **Factory Method** | Encapsula la instanciación de adaptadores de infraestructura intercambiables o servicios de dominio dentro de un Registro o Fábrica centralizado. | Instanciar clientes de API ad-hoc o servicios de terceros fuertemente acoplados directamente dentro de controladores o capas de entrega. |
| **Abstract Factory** | Proporciona una interfaz para crear familias de componentes relacionados o dependientes sin especificar sus implementaciones concretas. | Acoplar subsistemas o motores incompatibles en tiempo de ejecución sin verificar la compatibilidad arquitectónica entre componentes. |
| **Builder** | Construye objetos de configuración complejos, parámetros de ejecución o comandos estructurados de múltiples pasos mediante métodos fluidos e inmutables. | Ensamblar comandos de sistema, cargas útiles complejas o consultas mediante concatenación manual de cadenas (`"cmd -a " + arg`). |
| **Prototype** | Clonación profunda de estructuras de entidades de dominio garantizando la generación atómica y reasignación de identificadores únicos. | Copiar jerarquías de entidades mediante desestructuración superficial (*shallow*), duplicando accidentalmente identificadores inmutables entre registros. |
| **Singleton** | Asegura que recursos costosos de infraestructura (como grupos de conexiones de base de datos o brokers de mensajería) mantengan exactamente una instancia gestionada. | Instanciar conexiones de bases de datos no agrupadas o clientes ad-hoc dentro de bucles, manejadores efímeros o funciones utilitarias. |

---

## 2. Patrones Estructurales

| Patrón | Regla de Aplicación Arquitectónica | Prohibición Estricta (Anti-Patrón) |
| :--- | :--- | :--- |
| **Adapter** | Traduce interfaces de terceros incompatibles, esquemas propietarios o contratos de SDKs a la interfaz de puerto del dominio interno. | Filtrar particularidades de proveedores externos, formatos de datos de terceros o tipos de SDKs hacia la capa de dominio central. |
| **Facade** | Expone una interfaz cohesiva, simplificada y de alto nivel sobre subsistemas complejos de múltiples pasos y rutinas de orquestación de dominio. | Obligar a los controladores de entrega o enrutadores de interfaz a orquestar cientos de líneas de invocaciones de servicios entre subsistemas. |
| **Composite** | Trata estructuras jerárquicas y anidadas en árbol (nodos raíz y hojas) de manera uniforme a través de una interfaz base compartida. | Manipular árboles jerárquicos de entidades mediante arreglos planos y desconectados que carecen de restricciones relacionales explícitas entre padres e hijos. |
| **Decorator** | Adjunta dinámicamente responsabilidades transversales (rastreo de telemetría, limitación de tasa, autenticación, registros de auditoría) sin alterar la lógica del negocio. | Duplicar manualmente verificaciones repetitivas de autenticación, métricas de rendimiento o registro de errores en cada manejador de negocio. |
| **Proxy** | Controla y custodia el acceso a un recurso de destino (ej.: proxies de seguridad con protección contra SSRF, proxies de caché para operaciones de lectura lentas). | Consumir URIs de red externa o endpoints no verificados sin inspección previa de lista blanca y validación criptográfica. |
| **Bridge** | Desacopla una abstracción de su implementación física para que ambas puedan evolucionar y variar de manera independiente. | Acoplar directamente representaciones de datos del dominio a gráficos específicos de plataforma, diseños físicos de visualización o formatos de transporte. |
| **Flyweight** | Comparte instancias inmutables de solo lectura en memoria para permitir una ejecución eficiente sobre grandes volúmenes de objetos de valor (*value objects*). | Duplicar copias redundantes de catálogos estáticos pesados y árboles de configuración para cada entidad de tiempo de ejecución creada en memoria. |

---

## 3. Patrones Comportamentales

| Patrón | Regla de Aplicación Arquitectónica | Prohibición Estricta (Anti-Patrón) |
| :--- | :--- | :--- |
| **Strategy** | Define una familia de algoritmos, encapsula cada uno y los hace intercambiables en tiempo de ejecución mediante una interfaz compartida (`IExecutionStrategy`). | Codificar variaciones algorítmicas, reglas operativas o lógica de procesamiento dentro de ramificaciones condicionales monolíticas (`if/else` o `switch` gigantes). |
| **Observer** | Establece una dependencia de uno a muchos entre objetos para que cuando un agregado cambia de estado, los suscriptores sean notificados (Bus de Eventos). | Implementar bucles agresivos de sondeo (*polling*) en la base de datos para detectar transiciones asíncronas de estado entre subsistemas. |
| **Command** | Encapsula una solicitud como un objeto, permitiendo encolamiento de ejecución, historial de auditoría y soporte bidireccional nativo para `execute()` y `undo()`. | Aplicar mutaciones destructivas e irreversibles directamente sobre las estructuras de estado sin mantener un registro de transacciones reversible. |
| **State** | Permite que un objeto altere su comportamiento cuando cambia su estado interno, formalizando transiciones dentro de una Máquina de Estados Finitos (FSM). | Transicionar estados de ciclo de vida del sistema mediante mutaciones arbitrarias de cadenas sin validar pre y post-condiciones estructurales. |
| **Template Method** | Define el esqueleto invariante de un flujo de trabajo en una plantilla base, delegando pasos algorítmicos específicos a subclases o delegados especializados. | Permitir que diferentes canalizaciones de ejecución dupliquen rutinas estándar de ciclo de vida (validar $\to$ autorizar $\to$ ejecutar $\to$ auditar) de manera inconsistente. |
| **Chain of Responsibility** | Pasa solicitudes a lo largo de una cadena secuencial de manejadores independientes, donde cada manejador decide si procesa la solicitud o la pasa hacia adelante. | Agrupar verificaciones de validación dispares, inspecciones de seguridad y filtros de depuración en bloques monolíticos e inseparables. |
| **Mediator** | Centraliza y encapsula la comunicación y coordinación compleja entre múltiples componentes o agentes colaboradores. | Permitir que subsistemas o agentes desacoplados ejecuten llamadas cruzadas circulares y directas sin una orquestación central. |
| **Visitor** | Añade nuevas operaciones analíticas, de serialización o exportación a estructuras compuestas sin modificar las clases de entidades subyacentes. | Sobrecargar modelos de dominio con rutinas de formato y serialización adaptadas a formatos de archivo externos específicos. |
| **Memento** | Captura y externaliza el estado interno de un objeto sin violar el encapsulamiento, permitiendo puntos de control, reversión de estado y recuperación transaccional. | Exponer propiedades mutables de estado interno o estructuras privadas de datos a los consumidores para implementar funciones de autoguardado, deshacer o reversión. |
| **Iterator** | Proporciona un mecanismo estandarizado para recorrer elementos de una colección agregada secuencialmente sin exponer su representación subyacente o disposición física. | Obligar al código cliente a administrar índices de arreglos de bajo nivel, punteros de cursor o enlaces de nodos al recorrer jerarquías complejas de colecciones. |
| **Interpreter** | Evalúa oraciones o expresiones de Lenguaje Específico de Dominio (DSL) definiendo una gramática formal y un árbol de interpretación basado en AST. | Dispersar manipulaciones ad-hoc de cadenas con expresiones regulares, lógica de análisis personalizada y reglas de ejecución en manejadores de aplicación no relacionados. |
