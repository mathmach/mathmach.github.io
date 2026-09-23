# 🛡️ Invariantes de Calidad de Ingeniería & Trinquetes de Calidad

Este documento codifica los estándares obligatorios de calidad, trinquetes automatizados e invariantes arquitectónicos que rigen este repositorio. Todo colaborador humano y agente de IA debe cumplir estrictamente estas reglas en cada commit.

---

## 1. Principios Fundamentales del Repositorio

1. **Cero Comentarios en el Código:**
   - Queda estrictamente prohibido escribir comentarios en el código fuente (`//`, `/* */`, descripciones JSDoc o `// TODO`).
   - El código limpio de nivel de producción expresa su intención a través de nomenclatura de dominio expresiva, funciones puras de propósito único y tipado estricto.
   - Las justificaciones conceptuales y el contexto de ingeniería pertenecen a los **mensajes de commit** y a la **documentación arquitectónica**, jamás inline dentro del código.
2. **Preservación del Git Staging:**
   - Se prohíben las operaciones destructivas en el Git Index (`git reset`, `git add .` indiscriminado, pérdida de archivos en staging).
3. **Trinquetes de Calidad Unidireccionales (Quality Ratchets):**
   - Los suelos de calidad solo suben; los techos de complejidad solo bajan.
   - Si una refactorización o ejecución de pruebas mejora la cobertura, reduce la complejidad cognitiva o elimina deuda de fallback, esa nueva métrica se convierte en el suelo permanente para todo trabajo futuro.
4. **Aislamiento Estricto de Fronteras de Capas:**
   - Las reglas puras de dominio residen en el núcleo con cero dependencias de frameworks, ORMs, capas de transporte o SDKs externos.
   - Las dependencias apuntan estrictamente hacia adentro: Presentación $\to$ Aplicación $\to$ Dominio $\leftarrow$ Infraestructura.

---

## 2. Cero Deuda de Fallback (Las Siete Reglas de Oro)

Los fallbacks silenciosos enmascaran defectos latentes, oscurecen casos límite y provocan modos de fallo no deterministas en producción. La base de código aplica siete reglas estrictas:

1. **Sin `.catch(value)` en Esquemas de Validación:**
   - Los fallos de validación deben rechazar de inmediato con diagnósticos descriptivos de error. Queda prohibido enmascarar errores de análisis con valores predeterminados.
2. **Sin `safeParse(...).data ?? fallback`:**
   - Todo fallo de análisis debe gestionarse explícitamente con registro estructurado de errores, rechazo o excepciones mapeadas de dominio.
3. **Sin `env.VAR ?? fallback`:**
   - Todas las variables de configuración en tiempo de ejecución deben declararse en un esquema centralizado y validarse al inicio de la aplicación.
4. **Sin Coerción Numérica Laxa `Number(...) || fallback`:**
   - Las coerciones numéricas deben verificar `Number.isFinite()` y gestionar explícitamente entradas no numéricas.
5. **Sin Bloques `catch` Vacíos:**
   - Todo bloque de excepción debe incluir registro estructurado de diagnóstico, traducirse a una excepción conocida de dominio o relanzar el error.
6. **Sin `?? fallback` en Campos de Contrato:**
   - Los contratos de datos compartidos, payloads de API y esquemas de mensajería deben respetarse sin inyectar valores predeterminados locales ad-hoc.
7. **Sin Acceso Laxo a `process.env`:**
   - El acceso a variables de entorno en tiempo de ejecución está restringido a una pasarela centralizada y validada.

---

## 3. Cero Superficies Huérfanas

El código muerto y las declaraciones sueltas aumentan la carga cognitiva, inflan los bundles y confunden a los mantenedores:

- **Ningún Procedimiento Sin Llamadores:** Todo procedimiento o endpoint público debe tener consumidores activos o ser depreciado y eliminado.
- **Ningún Módulo de Producción Exclusivo para Pruebas:** Los módulos exportados en paquetes de producción no deben existir únicamente para satisfacer pruebas unitarias.
- **Ninguna Superficie de Exportación Suelta:** Tipos no referenciados, declaraciones de interfaz no utilizadas y funciones muertas deben eliminarse sistemáticamente (verificado con herramientas como Knip).

---

## 4. Techos Estructurales & de Complejidad

Para prevenir la entropía arquitectónica, la base de código impone límites superiores estrictos:

- **Techo de Complejidad Cognitiva ($\le 15$):**
   - Ninguna función o método puede exceder los 15 puntos de complejidad cognitiva.
   - Las funciones que se aproximen a este umbral deben descomponerse en subfunciones puras y enfocadas.
- **Controladores de Presentación Finos ($\le 300\text{ LOC}$):**
   - Los controladores y manejadores de ruta no deben superar las 300 líneas de código.
   - Los controladores actúan estrictamente como orquestadores finos: validación de entrada $\to$ autenticación/autorización $\to$ delegación al Caso de Uso $\to$ mapeo de respuesta.
- **Techo de Componentes de UI ($\le 400\text{ LOC}$):**
   - Los componentes de interfaz no deben exceder las 400 líneas de código. La lógica de estado debe extraerse en hooks personalizados y la interfaz descomponerse en subcomponentes.

---

## 5. Concurrencia & Control de Acceso Concurrente

- **Control de Concurrencia Optimista (OCC):**
   - Los agregados colaborativos o con autoguardado deben imponer tokens de versión (`expectedVersion` o marca temporal) en mutaciones (`WHERE id = ? AND version = ?`).
   - Se prohíben las sobrescrituras a ciegas sin validación de versión.
- **Patrón Hold & Settle en Dos Fases:**
   - Las operaciones asíncronas de larga duración no deben retener transacciones de base de datos o bloqueos de conexión mientras esperan servicios externos.
   - Las operaciones deben ejecutarse mediante reservas atómicas (Fase 1: Hold), operar de forma asíncrona sin bloqueos en base de datos y concluir con liquidación atómica o cancelación (Fase 2: Settle/Release).

---

## 6. Higiene de Bases de Datos & Almacenamiento

- **Cero Consultas N+1:**
   - Se prohíbe ejecutar consultas a bases de datos dentro de bucles de iteración (`.map()`, `for...of` o iteraciones asíncronas anidadas).
   - Las colecciones deben obtenerse mediante cargadores por lotes (ej.: DataLoader) o consultas relacionales únicas.
- **Paginación Determinista por Cursor:**
   - Los endpoints que devuelven colecciones deben aplicar paginación basada en cursor con un límite estricto (`limit <= 50`). Se prohíbe la paginación por offset profundo (`OFFSET > 100`).
- **Disciplina de Almacenamiento de Objetos en Tres Niveles:**
   - Los archivos temporales de scratch o chunks intermedios deben aislarse en un nivel efímero (`scratch/`) con TTL automático de 24 horas.
   - Los activos maestros y entregables permanentes residen en niveles permanentes (`vault/`, `releases/`) administrados mediante Content-Addressable Storage (CAS) (`<tier>/<scope>/<sha256>.<ext>`).

---

## 7. Lista de Verificación de Calidad Pre-Commit

Antes de declarar completada cualquier tarea o implementación, verifique todos los quality gates:

```bash
# 1. Typecheck: Cero errores de compilación en todos los módulos
npm run typecheck

# 2. Linter & Complejidad: Cero errores, todas las funciones con complejidad cognitiva <= 15
npm run lint

# 3. Código Muerto & Superficies Huérfanas: Cero exports no utilizados o superficies muertas
npm run check:orphan-surfaces

# 4. Deuda de Fallback: Cero deuda de fallback en todas las reglas de oro
npm run check:fallback-debt

# 5. Pruebas Automatizadas: 100% de éxito en la suite de pruebas respetando el suelo de cobertura
npm test
```

---

## 8. Cero Duplicación de Conocimiento (Principio DRY)

> *"Todo conocimiento debe poseer una única representación, no ambigua y autoritativa dentro de un sistema."* — Andrew Hunt & David Thomas, *The Pragmatic Programmer* (1999)

La duplicación de código es el vector más difundido de **fallas de inconsistencia** (Avizienis et al., 2004). Cuando una regla de dominio, algoritmo o transformación de datos existe en $n$ copias idénticas, una corrección aplicada en menos de $n$ sitios produce una **falla de divergencia** — un defecto latente cuya probabilidad de activación converge hacia la certeza a medida que el sistema evoluciona. Investigaciones empíricas de detección de clones (Roy, Cordy & Koschke, 2009; Kamiya et al., 2002) demuestran que los fragmentos duplicados representan entre el 5–20% de las grandes bases de código y son responsables de una proporción desproporcionada de defectos de regresión.

### 8.1 Fundamento Teórico

El principio DRY se fundamenta en la **minimización de redundancia informacional** y la taxonomía de acoplamiento de Myers:

- **Punto Único de Verdad (SPOT):** Cada pieza discreta de conocimiento de dominio — una regla de negocio, una restricción de validación, una fórmula de transformación, un esquema de configuración — debe definirse exactamente una vez. Todos los consumidores referencian esa definición canónica.
- **Amplificación de Acoplamiento:** La lógica duplicada crea **acoplamiento de contenido** (Myers, 1978) — la forma más fuerte y perjudicial de dependencia entre módulos. Un cambio en el conocimiento duplicado requiere modificaciones coordinadas en todas las copias, violando el **Principio Abierto/Cerrado** y aumentando la **métrica de Inestabilidad** del sistema ($I = C_e / (C_a + C_e)$, Martin 1995).
- **Acumulación de Entropía:** Cada sitio de duplicación incrementa la **entropía de configuración** del sistema — el número de ubicaciones independientes donde un mismo hecho lógico puede divergir. La probabilidad de al menos una divergencia después de $k$ eventos de mantenimiento independientes en $n$ copias es:

$$P(\text{divergencia}) = 1 - \left(\frac{1}{n}\right)^{k-1}$$

Esto converge a $1.0$ rápidamente, haciendo de la duplicación una fuente inevitable de defectos a lo largo del tiempo.

### 8.2 Mandato Arquitectónico

1. **Reglas de Dominio:** Invariantes de negocio, predicados de validación y fórmulas de cálculo deben existir en exactamente un módulo de dominio. Capas de presentación, esquemas de API y mapeadores de persistencia referencian la fuente canónica — jamás la redefinen.
2. **Pipelines de Transformación de Datos:** La lógica de mapeo entre capas (DTO $\leftrightarrow$ Entidad, Entidad $\leftrightarrow$ ViewModel) debe centralizarse en funciones de mapeo dedicadas o clases adaptadoras. Transformaciones inline ad-hoc duplicadas entre controladores o resolvers están prohibidas.
3. **Configuración y Constantes:** Números mágicos, literales de cadena, patrones regex y valores umbral deben residir en módulos de constantes tipadas o esquemas de ambiente validados. Dispersar literales idénticos entre archivos está prohibido.
4. **Definiciones de Tipo y Contratos:** Shapes de datos compartidos (contratos de API, esquemas de eventos, payloads de mensajería) deben definirse una vez en un paquete de contrato compartido. Redefiniciones del lado consumidor o espejado manual de interfaces están prohibidos.

### 8.3 Umbrales Cuantitativos

| Métrica | Techo | Herramienta (multi-lenguaje) |
| :--- | :--- | :--- |
| **Clones Tipo-1 (textuales exactos)** | $0$ | jscpd (JS/TS/Python/C#), PMD CPD (Java/Kotlin/C#), Simian (multi-lang) |
| **Clones Tipo-2 (identificadores renombrados)** | $0$ | jscpd (`--min-tokens 50`), PMD CPD, SonarQube |
| **Clones Tipo-3 (con lagunas / casi-iguales)** | $\le 2\%$ del LOC total | SonarQube, NiCad (multi-lang) |
| **Literales de constantes duplicados** | $0$ | Biome/ESLint (JS/TS), Roslyn Analyzers (C#), detekt (Kotlin), Ruff/Pylint (Python) |
| **Redefiniciones de tipo entre paquetes** | $0$ | Revisión manual, Knip (JS/TS), ArchUnit (Java/Kotlin), NDepend (C#) |

### 8.4 Anti-Patrones Estrictos

- **Reutilización por Copiar y Pegar:** Duplicar el cuerpo de una función entre módulos en vez de extraer a un utilitario compartido con importación explícita. Este es el vector principal de fallas de divergencia.
- **Jerarquías Paralelas:** Mantener árboles de clases isomórficos (ej.: `UserDTO`, `UserResponse`, `UserViewModel`) donde cada clase redefine el mismo conjunto de campos con variaciones triviales. Consolidar vía tipos mapeados, genéricos o contratos base compartidos.
- **Constantes Dispersas (Shotgun Constants):** Incrustar el mismo número mágico, patrón regex o cadena de configuración en múltiples archivos. Un único sitio de corrección omitido produce inconsistencia comportamental silenciosa.
- **Eco de Schema:** Redefinir manualmente shapes de respuesta de API, tipos de columnas de base de datos o estructuras de payload de eventos en código consumidor en vez de importar desde la definición autoritativa de contrato.
- **Proliferación de Fixtures de Test:** Duplicar lógica de construcción de objetos complejos entre archivos de prueba en vez de centralizar en fábricas de fixture compartidas o utilitarios builder.

### 8.5 Estrategias Canónicas de Remediación

| Patrón de Duplicación | Remediación |
| :--- | :--- |
| Cuerpos de función idénticos | Extraer a módulo compartido; importar en todos los call sites |
| Definiciones de tipo isomórficas | Contrato-fuente único + tipos mapeados/derivados |
| Predicados de validación repetidos | Función de predicado de dominio; referenciar desde todas las capas |
| Literales de constantes dispersos | Módulo de constantes tipadas o esquema de ambiente validado |
| Construcción de objetos de prueba duplicada | Patrón Builder o fábrica de fixture compartida |
| Lógica de mapeo entre capas | Mapper/adapter dedicado con ownership único |
