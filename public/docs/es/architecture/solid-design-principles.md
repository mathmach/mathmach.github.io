# 🏛️ Guía de Principios de Diseño SOLID

Este documento establece la aplicación canónica de los cinco principios **SOLID** (Martin, 2000; Liskov, 1987; Meyer, 1988) en toda la arquitectura de software. Todo componente, módulo, agregado y servicio debe cumplir estrictamente estos mandatos.

---

## 1. Principio de Responsabilidad Única (SRP)

> *"Un módulo debe tener una, y solo una, razón para cambiar."* — Robert C. Martin

### 1.1 Mandato Arquitectónico
- Cada módulo de software, clase o servicio debe rendir cuentas a un único actor o parte interesada (*stakeholder*).
- Separación estricta de responsabilidades arquitectónicas a través de límites estratificados:
  - **Entrega / Controladores:** Responsables exclusivamente de la negociación de transporte, análisis de parámetros, extracción de autenticación y mapeo de códigos de estado de respuesta ($\le 300\text{ LOC}$).
  - **Casos de Uso de la Aplicación:** Responsables exclusivamente de coordinar agregados de dominio, gestionar transacciones y delegar en puertos outbound.
  - **Entidades de Dominio & Value Objects:** Responsables exclusivamente de las invariantes de reglas de negocio, validación de estado y cálculos puros.
  - **Adaptadores de Infraestructura:** Responsables exclusivamente de la mecánica técnica (consultas SQL, llamadas de red a APIs externas, E/S de disco).

### 1.2 Métricas Cuantitativas & Arquitectónicas
- **Falta de Cohesión de Métodos (LCOM):** Los métodos de una clase deben operar sobre campos de estado compartidos; grupos de métodos disjuntos indican múltiples responsabilidades y exigen descomposición.
- **Complejidad Cognitiva Máxima por Función:** $\le 15$ puntos.

### 1.3 Anti-Patrones Estrictos
- **God Class / Monster Controller:** Fusionar validación de solicitudes, comprobaciones de autorización, consultas SQL, integración con APIs externas y formateo en un único archivo o manejador.
- **Entidades Híbridas de Dominio e Infraestructura:** Acoplar reglas de validación del negocio con anotaciones de esquema de base de datos o ganchos (*hooks*) de ciclo de vida de ORM.

---

## 2. Principio de Abierto/Cerrado (OCP)

> *"Las entidades de software (clases, módulos, funciones) deben estar abiertas para su extensión, pero cerradas para su modificación."* — Bertrand Meyer

### 2.1 Mandato Arquitectónico
- El sistema debe permitir agregar nuevos comportamientos sin alterar el código fuente existente y verificado.
- Las nuevas capacidades se introducen implementando abstracciones polimórficas, registrando nuevas estrategias en fábricas o conectándose a cadenas de middleware componibles.
- Los flujos de negocio principales dependen de interfaces abstractas (`IPaymentProcessor`, `IReportGenerator`, `IStorageGateway`), permitiendo inyectar dinámicamente nuevas implementaciones mediante configuración.

### 2.2 Métricas Cuantitativas & Arquitectónicas
- **Variaciones Protegidas (Larman):** Identificar puntos de inestabilidad o variación previstos; aislarlos detrás de interfaces contractuales estables.
- Cero diferencias en git en los orquestadores centrales de dominio cuando se introduce un nuevo proveedor externo o mecanismo de entrega.

### 2.3 Anti-Patrones Estrictos
- **Escaleras Monolíticas de Ramificación:** Modificar casos de uso centrales con cadenas crecientes de `if/else` o sentencias `switch` cada vez que se agrega una nueva variante, proveedor de pago o formato de exportación.
- **Instanciación Directa de Variantes Concretas:** Instanciar clases concretas específicas directamente dentro de los flujos consumidores en lugar de utilizar fábricas o registros.

---

## 3. Principio de Sustitución de Liskov (LSP)

> *"Los subtipos deben ser sustituibles por sus tipos base sin alterar la corrección del programa."* — Barbara Liskov

### 3.1 Mandato Arquitectónico
- Cualquier implementación de una interfaz o derivado de una abstracción debe cumplir con el comportamiento esperado por quien lo invoca.
- **Las precondiciones no pueden fortalecerse:** Un subtipo no debe exigir argumentos de entrada más estrictos ni requisitos previos adicionales respecto a la abstracción base.
- **Las postcondiciones no pueden debilitarse:** Un subtipo debe satisfacer todas las garantías y contratos de salida prometidos por la abstracción base.
- **Las invariantes deben preservarse:** Las mutaciones en el subtipo jamás deben violar las reglas de consistencia estructural establecidas por el tipo base.

### 3.2 Métricas Cuantitativas & Arquitectónicas
- **Cero Aserciones de Tipo en Tiempo de Ejecución:** El código que consume una abstracción jamás debe requerir comprobaciones de `instanceof`, reflexión dinámica de propiedades o conversión de tipos (*casting*) para operar de forma segura.
- **Uniformidad de Excepciones:** Los subtipos solo pueden emitir excepciones de dominio especificadas por el contrato de la interfaz de puerto.

### 3.3 Anti-Patrones Estrictos
- **Herencia Rechazada / `NotImplementedException`:** Implementar un método de interfaz lanzando una excepción de no admitido o dejando un método vacío porque el subtipo no admite esa operación.
- **Violación de Contrato mediante Retornos Nulos/Degradados:** Devolver `null` o ignorar silenciosamente parámetros cuando el contrato de la interfaz base garantiza explícitamente un resultado operativo.

---

## 4. Principio de Segregación de Interfaces (ISP)

> *"Los clientes no deben ser obligados a depender de interfaces que no utilizan."* — Robert C. Martin

### 4.1 Mandato Arquitectónico
- Preferir interfaces pequeñas, específicas por rol y enfocadas sobre contratos monolíticos de propósito general.
- Las interfaces pertenecen al cliente que las consume, no al proveedor de infraestructura que las implementa.
- Descomponer capacidades amplias en facetas funcionales cohesivas (ej.: separar `IEntityReader` de `IEntityWriter`, o `ITokenValidator` de `IUserSessionManager`).
- Los consumidores declaran dependencia explícita solo del subconjunto mínimo de métodos necesarios para su operación.

### 4.2 Métricas Cuantitativas & Arquitectónicas
- **Cohesión de Interfaz:** Las interfaces deben contener el conjunto ortogonal mínimo de métodos necesarios para un solo rol de cliente ($\le 5$ métodos por interfaz de rol).
- **Cero Sobrecarga de Mocks en Pruebas:** Los dobles de prueba (mocks/stubs) para una interfaz deben requerir la configuración únicamente de los métodos pertinentes al caso de prueba.

### 4.3 Anti-Patrones Estrictos
- **Contratos Colector / Header Interface:** Crear una interfaz que refleje todos los métodos públicos de un servicio grande (ej.: `IUserService` con 40 métodos diversos) y obligar a todos los invocadores a depender de toda la superficie.
- **Implementaciones Dummy:** Obligar a mocks de prueba o adaptadores especializados a escribir implementaciones vacías para decenas de métodos no utilizados de una interfaz.

---

## 5. Principio de Inversión de Dependencias (DIP)

> *"Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones. Las abstracciones no deben depender de detalles. Los detalles deben depender de abstracciones."* — Robert C. Martin

### 5.1 Mandato Arquitectónico
- La dirección de las dependencias en el código fuente debe apuntar hacia adentro, hacia las políticas de alto nivel y reglas de dominio, jamás hacia afuera hacia mecanismos técnicos de bajo nivel.
- Inversión de Control (IoC):
  - Los casos de uso de alto nivel definen los **Puertos** (interfaces) que necesitan para cumplir su propósito (ej.: `IOrderRepository`, `INotificationGateway`).
  - Los módulos de infraestructura de bajo nivel proporcionan los **Adaptadores** que implementan esas interfaces (ej.: `PostgresOrderRepository`, `SesNotificationGateway`).
  - El enlace de adaptadores concretos a puertos abstractos ocurre en el punto de entrada de la aplicación (Composition Root / Contenedor de Inyección de Dependencias).

### 5.2 Métricas Cuantitativas & Arquitectónicas
- **Principio de Dependencias Estables (SDP):** Las dependencias deben apuntar en la dirección de la estabilidad. Las políticas de alto nivel son máximamente estables; los detalles técnicos de bajo nivel son volátiles.
- **Cero Importaciones Concretas de Infraestructura en Dominio:** El análisis estático debe verificar cero importaciones de ORMs, clientes HTTP, SDKs en la nube o utilidades de sistema de archivos dentro de las capas de dominio y aplicación.

### 5.3 Anti-Patrones Estrictos
- **Acoplamiento Directo de Bajo Nivel:** Instanciar un cliente concreto de base de datos, instancia de SDK o lector de sistema de archivos directamente dentro de una entidad de dominio o caso de uso.
- **Fuga de Modelos de Infraestructura:** Exponer tipos de filas generados por ORM o estructuras de respuesta de SDKs de terceros a través de las fronteras de puerto hacia el modelo de dominio.

---

## Matriz Resumen

| Principio | Enfoque Principal | Indicador de Fallo | Remedio Arquitectónico |
| :--- | :--- | :--- | :--- |
| **S** - SRP | Cohesión de módulos & actor único | Controladores sobrecargados, LCOM alto, conflictos frecuentes de merge | Descomponer por capa y ciclo de vida |
| **O** - OCP | Extensibilidad sin mutación | Cadenas frágiles de `switch/case` ante nuevas funciones | Estrategias polimórficas & fábricas registradas |
| **L** - LSP | Equivalencia conductual contractual | Comprobaciones de `instanceof`, `NotImplementedException` | Subtipado conductual & contratos formales |
| **I** - ISP | Interfaces ajustadas a las necesidades del cliente | Configuración pesada de mocks en pruebas, métodos vacíos | Interfaces de roles refinadas |
| **D** - DIP | Dirección de dependencias hacia adentro | Importaciones directas de BD/SDK en dominio | Puertos Hexagonales & Inversión de Control |
