# 💾 Internals de Bases de Datos, Teoría Relacional & Concurrencia

Este documento formaliza la teoría de bases de datos relacionales, ingeniería formal de esquemas (DDL/DML), trade-offs de motores de almacenamiento físico y la teoría formal de aislamiento de concurrencia que rigen la persistencia de estado en el sistema.

---

## 1. Teoría Relacional, Esquemas Formales, DDL & DML

La arquitectura de datos empresarial debe basarse en fundamentos matemáticos formales en lugar de diseños de esquemas ad-hoc.

### 1.1 Formalismo Relacional de Edgar F. Codd (1970, 1972)
Edgar F. Codd introdujo el modelo relacional para liberar el desarrollo de software de los modelos navegacionales basados en punteros y grafos (Codasyl DBTG).

Matemáticamente, dados los dominios $D_1, D_2, \dots, D_n$, una **relación** $R$ es un subconjunto de su producto cartesiano:

$$R \subseteq D_1 \times D_2 \times \dots \times D_n$$

Una **tupla** $t \in R$ es un mapeo que asocia el nombre de cada atributo con un valor atómico en su dominio.

#### Completitud Relacional: Álgebra vs. Cálculo
Codd (1972) definió un sublenguaje de base de datos como **relacionalmente completo** si su poder expresivo equivale al Cálculo de Predicados de Primer Orden. Demostró la equivalencia semántica entre:
- **Álgebra Relacional (Operacional / Procedimental):** Seis primitivas fundamentales: Selección ($\sigma$), Proyección ($\pi$), Producto Cartesiano ($\times$), Unión de Conjuntos ($\cup$), Diferencia de Conjuntos ($-$) y Renombrado de Atributos ($\rho$). Los operadores derivados incluyen la Combinación Natural (*Natural Join*, $\bowtie$) y la Combinación Theta ($\bowtie_\theta$).
- **Cálculo Relacional de Tuplas (TRC - Declarativo):** Expresiones de la forma $\{ t \mid \phi(t) \}$, donde $\phi(t)$ es una fórmula de primer orden.

Los motores SQL modernos compilan expresiones declarativas de tipo cálculo (DML) en árboles de operadores procedimentales de álgebra relacional.

### 1.2 Modelado Conceptual a Físico: Peter Chen ERD (1976)
La ingeniería de esquemas progresa a través de tres niveles canónicos de abstracción:

```
[ Nivel Conceptual ]      Diagrama Entidad-Relación de Peter Chen (ERD)
        │                 Entidades, Relaciones (1:1, 1:N, N:M), Entidades Débiles
        ▼
[ Nivel Lógico ]          Mapeo Relacional & Normalización (1NF hasta BCNF)
        │                 Claves Primarias, Claves Foráneas, Restricciones Referenciales
        ▼
[ Nivel Físico ]          Especificación DDL Declarativa & Disposición de Almacenamiento
                          Tipos de Datos, Índices B+ Tree, Empaquetado de Páginas, Particionamiento
```

1. **Esquema Conceptual:** El Modelado Entidad-Relación (Peter Pin-Shan Chen, 1976) identifica entidades de negocio y relaciones semánticas con independencia de los motores de almacenamiento.
2. **Esquema Lógico:** Transformación matemática de la cardinalidad del ERD en tablas relacionales, restricciones de clave foránea y normalización relacional.
3. **Esquema Físico:** Declaraciones DDL concretas que especifican tipos físicos de columnas, nulabilidad, índices únicos, claves de agrupamiento y parámetros de almacenamiento.

### 1.3 Teoría de Normalización & Dependencias Funcionales
Los esquemas de bases de datos deben adherirse a la normalización relacional para eliminar anomalías de inserción, actualización y eliminación.

Dada una relación $R$, se satisface una **dependencia funcional** $X \to Y$ si, siempre que dos tuplas coinciden en los atributos $X$, obligatoriamente coinciden en los atributos $Y$.

- **Primera Forma Normal (1NF):** Cada atributo contiene únicamente valores atómicos e indivisibles de su dominio. Cero grupos repetitivos, matrices o blobs JSON no estructurados en entidades normalizadas.
- **Segunda Forma Normal (2NF):** Satisface 1NF, y cada atributo no clave depende funcionalmente de manera completa de toda la clave candidata (elimina dependencias parciales en claves compuestas).
- **Tercera Forma Normal (3NF):** Satisface 2NF, y ningún atributo no clave depende transitivamente de ninguna clave candidata ($X \to Y \to Z$, donde $Z$ depende del no clave $Y$).
- **Forma Normal de Boyce-Codd (BCNF):** Para cada dependencia funcional no trivial $X \to Y$, el determinante $X$ debe ser una superclave.
- **Cuarta Forma Normal (4NF - Ronald Fagin, 1977):** Para cada dependencia multivaluada no trivial $X \twoheadrightarrow Y$, $X$ debe ser una superclave, eliminando dependencias multiatributo independientes.

#### Garantía Matemática
La descomposición de relaciones en BCNF cumple la propiedad de **Descomposición sin Pérdida de Unión (Lossless-Join)**:

$$\Pi_{R_1}(R) \bowtie \Pi_{R_2}(R) = R \quad \iff \quad (R_1 \cap R_2 \to R_1) \lor (R_1 \cap R_2 \to R_2)$$

Esto garantiza matemáticamente que no se generen registros sintéticos fantasmas al recombinar las relaciones.

### 1.4 DDL Declarativo (Data Definition Language) & Invariantes de Esquema
Bajo el estándar **ISO/IEC 9075 (Estándar SQL)**, DDL proporciona definiciones declarativas de metadatos para relaciones, atributos, dominios y aserciones:

- **Invariantes de Claves Primarias y Foráneas:** Imposición estricta de identidad de entidad e integridad referencial (`REFERENCES padre(id) ON DELETE RESTRICT / CASCADE`).
- **Aserciones de Dominio (`CHECK`):** Invariantes matemáticos evaluados en la confirmación de transacciones o límites de escritura (ej.: `CHECK (saldo >= 0 AND limite_credito >= 0)`).
- **Restricciones de Unicidad y Nulabilidad:** Eliminación de estados degenerados y prevención de propagación silenciosa de nulos hacia el dominio de la aplicación.

### 1.5 DML Declarativo & Optimización de Consultas Basada en Costes
El **Data Manipulation Language (DML)** opera declarativamente sobre conjuntos de tuplas (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE`):

1. **Intención Declarativa:** Quien consulta declara *qué* datos requiere, no *cómo* recorrer los bloques en disco.
2. **Compilación del Árbol de Consulta:** El motor analiza sintácticamente el SQL en un AST y lo traduce a una expresión de álgebra relacional ($\sigma, \pi, \bowtie$).
3. **Optimización Basada en Costes de Selinger (Patricia Selinger et al., 1979 - IBM System R):**
   - Estima planes de ejecución candidatos calculando cardinalidad, estadísticas de tabla y factores de selectividad.
   - Computa los costes previstos de E/S de disco y CPU para cada ruta de acceso (Escaneo Secuencial vs. Escaneo por Índice B+ Tree vs. Hash Join vs. Merge Join).
   - Produce el plan físico de ejecución matemáticamente óptimo.

### 1.6 Invariante de Desnormalización Gobernada
La desnormalización se permite **estrictamente como una optimización consciente de lectura** para proyecciones de consulta precomputadas. Las réplicas de lectura desnormalizadas o los agregados en caché deben actualizarse transaccionalmente mediante eventos de Transactional Outbox o procesos de materialización deterministas, nunca mediante escrituras ad-hoc en el código de la aplicación.

---

## 2. Arquitecturas de Motores de Almacenamiento: B+ Trees vs. LSM-Trees

Cada motor de almacenamiento toma decisiones arquitectónicas fundamentales entre latencia de lectura, rendimiento de escritura y amplificación de espacio/escritura.

```
       Arquitectura de B+ Tree                     Arquitectura de LSM-Tree
 (Optimizada para Lectura / In-Place)         (Optimizada para Escritura / Append-Only)

        [ Página Nodo Raíz ]                        [ MemTable en Memoria ]
         /              \                               (RAM SkipList)
        v                v                                    │ (Flush)
 [ Página Interna ] [ Página Interna ]                        ▼
    /        \         /        \                    [ L0 SSTables (Disco) ]
   v          v       v          v                            │ (Compactación)
 [ Página Hoja ] [ Página Hoja ] [ Página Hoja ]              ▼
 (Páginas de Disco Doblemente Enlazadas)             [ L1 SSTables (Disco) ]
```

### 2.1 Comparación Estructural

| Característica | B+ Tree (ej.: Postgres, InnoDB, SQLite) | LSM-Tree (ej.: RocksDB, Cassandra, LevelDB) |
| :--- | :--- | :--- |
| **Carga Primaria** | Lecturas intensivas, búsquedas puntuales, escaneos por rango. | Escrituras intensivas, ingesta de alto rendimiento, append-only. |
| **Paradigma de Mutación** | Sobrescritura in-place de páginas de disco de tamaño fijo ($4\text{KB}\text{--}16\text{KB}$). | Registro secuencial append-only; SSTables inmutables en disco. |
| **Patrón de E/S en Disco** | E/S Aleatoria (requiere desplazamientos de cabezal en discos mecánicos). | E/S Secuencial (satura el ancho de banda sostenido del bus). |
| **Amplificación de Escritura (WA)** | Alta (actualizar 1 byte escribe una página completa de $8\text{KB}$ + WAL). | Moderada-Alta (incurrida durante fusiones de compactación en múltiples niveles). |
| **Amplificación de Espacio (SA)** | Moderada (fragmentación de páginas, espacio ocioso interno). | Baja-Moderada (los registros eliminados ocupan espacio hasta la compactación). |

### 2.2 La Conjetura RUM (Athanassoulis et al., 2016)
La Conjetura RUM demuestra que, al diseñar métodos de acceso para sistemas de datos, optimizar dos de los tres costes fundamentales compromete el tercero:

```
                  Coste de Lectura (R)
                          /\
                         /  \
                        /    \
                       /      \
  Coste de Actualización (U) - Coste de Espacio / Memoria (M)
```
- **Optimizando Lectura & Espacio (R + M):** B+ Trees minimizan la latencia de lectura con empaquetado denso, pero sacrifican el coste de actualización ($U$) debido a divisiones de página (*page splits*) y escritas aleatorias.
- **Optimizando Actualización & Espacio (U + M):** LSM-Trees con compactación nivelada pesada minimizan el uso de disco y aceptan escrituras secuencialmente, pero elevan el coste de lectura ($R$) mediante búsquedas en múltiples SSTables (mitigado con Filtros de Bloom).
- **Optimizando Lectura & Actualización (R + U):** Estructuras redundantes de indexación (ej.: mantener índices dobles o cachés en memoria) logran lecturas y escritas rápidas, pero inflan el consumo de espacio ($M$).

---

## 3. Teoría de Transacciones: ACID & Recuperación ante Fallos (ARIES)

Una transacción representa una unidad lógica de trabajo que transiciona una base de datos de un estado consistente a otro.

### 3.1 Las Propiedades ACID (Jim Gray, 1981)
- **Atomicidad:** Todas las operaciones de la transacción se ejecutan con éxito, o la transacción completa se revierte sin efectos secundarios.
- **Consistencia:** Las mutaciones nunca deben violar las restricciones declaradas de la base de datos, claves foráneas o invariantes de entidades de dominio.
- **Aislamiento:** Las transacciones concurrentes se ejecutan sin observar mutaciones intermedias y no confirmadas de otras transacciones simultáneas.
- **Durabilidad:** Una vez confirmados (*commit*), los cambios sobreviven a caídas del sistema, cortes eléctricos y terminación de procesos.

### 3.2 Write-Ahead Logging (WAL) & Recuperación ARIES
Para garantizar Durabilidad sin vaciar páginas completas de forma síncrona a disco en cada confirmación, los sistemas implementan **Write-Ahead Logging (WAL)**:

> **El Invariante WAL:** Ninguna página de datos modificada (página sucia) puede escribirse en almacenamiento no volátil hasta que el registro de log correspondiente que detalla el cambio haya sido persistido en disco (`fsync`).

El algoritmo canónico **ARIES** (Mohan et al., 1992) ejecuta la recuperación ante fallos en tres fases:
1. **Fase de Análisis:** Escanea el WAL hacia adelante desde el último punto de control (*checkpoint*) para identificar transacciones activas (no confirmadas al momento del fallo) y páginas sucias en memoria.
2. **Fase de Redo (Rehacer):** Escanea hacia adelante desde el registro de log no escrito más antiguo para repetir la historia, reaplicando todas las operaciones registradas (incluidas las transacciones no confirmadas) para restaurar el estado exacto anterior al fallo.
3. **Fase de Undo (Deshacer):** Escanea hacia atrás para revertir las acciones de todas las transacciones activas que nunca se confirmaron, escribiendo Registros de Log de Compensación (CLRs) para garantizar idempotencia si ocurre otro fallo durante la recuperación.

---

## 4. Niveles de Aislamiento de Concurrencia & Anomalías

El estándar ANSI SQL-92 se basó en definiciones ambiguas basadas en bloqueos (*locks*). La teoría moderna de bases de datos clasifica el aislamiento estrictamente según las **anomalías de concurrencia** prevenidas (Berenson et al., 1995; Adya et al., 2000).

```
Jerarquía de Niveles de Aislamiento:
Read Uncommitted < Read Committed < Repeatable Read < Snapshot Isolation (SI) < Serializable (SSI / 2PL)
```

### 4.1 Taxonomía de Anomalías de Concurrencia

| Código | Nombre de la Anomalía | Descripción | Prevenida Por |
| :--- | :--- | :--- | :--- |
| **$G0$** | **Dirty Write** | La transacción $T_1$ modifica un elemento de datos, y $T_2$ lo sobrescribe antes de que $T_1$ confirme o aborte. | Read Uncommitted y superiores |
| **$G1a$** | **Dirty Read** | $T_1$ modifica un elemento; $T_2$ lee el valor no confirmado; $T_1$ posteriormente aborta. | Read Committed y superiores |
| **$G1c$** | **Non-Repeatable Read** | $T_1$ lee un elemento; $T_2$ modifica/elimina ese elemento y confirma; $T_1$ vuelve a leer el elemento y observa datos modificados. | Repeatable Read y superiores |
| **$A3$** | **Phantom Read** | $T_1$ lee un conjunto bajo un predicado; $T_2$ inserta nuevos registros que cumplen el predicado y confirma; $T_1$ vuelve a consultar y ve registros "fantasmas". | Repeatable Read (con MVCC) / Serializable |
| **$P4$** | **Lost Update** | $T_1$ y $T_2$ leen el elemento $X$; ambos calculan actualizaciones; $T_1$ escribe $X$; $T_2$ escribe $X$, destruyendo silenciosamente la mutación de $T_1$. | Snapshot Isolation y superiores |
| **$A5B$** | **Write Skew** | $T_1$ lee $X$ e $Y$; $T_2$ lee $X$ e $Y$; la restricción exige $X + Y > 0$. $T_1$ decrementa $X$, $T_2$ decrementa $Y$. Ambos confirman; ¡invariante violada! | **Solo Serializable** |

### 4.2 Snapshot Isolation (SI) & El Riesgo de Write Skew
Snapshot Isolation proporciona lecturas libres de bloqueos utilizando Control de Concurrencia Multiversión (MVCC). Cada transacción lee desde una instantánea (*snapshot*) inmutable de datos confirmados tomada en la marca de tiempo de inicio de la transacción $T_{\text{start}}$.

- **El Primero que Confirma Gana (First-Committer-Wins):** Si dos transacciones concurrentes intentan modificar la **misma fila exacta**, la segunda en confirmar aborta. Esto previene Lost Update ($P4$).
- **El Punto Ciego de SI (Write Skew):** Si dos transacciones modifican **filas diferentes** mientras dependen de conjuntos de lectura superpuestos para satisfacer una invariante compartida, ambas tienen éxito bajo SI, ¡corrompiendo la invariante!
  - *Ejemplo (El Problema de los Médicos de Guardia):* Regla hospitalaria: $\ge 1$ médico de guardia. La Dra. Alice y el Dr. Bob están de guardia. Alice pide salir ($T_1$ actualiza la fila de Alice porque Bob está de guardia). Concurrente, Bob pide salir ($T_2$ actualiza la fila de Bob porque Alice está de guardia). Ambas transacciones confirman bajo SI $\implies$ **¡Cero médicos de guardia!**
- **Solución Arquitectónica:** Imponer **Serializable Snapshot Isolation (SSI)** (que detecta dinámicamente ciclos de dependencia en el grafo de serialización - `rw-antidependencies`) o adquirir bloqueos explícitos a nivel de fila mediante `SELECT ... FOR UPDATE`.
