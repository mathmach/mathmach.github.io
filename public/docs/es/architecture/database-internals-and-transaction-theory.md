# 💾 Internals de Bases de Datos, Motores de Almacenamiento & Teoría de Transacciones

Este documento formaliza la arquitectura de datos de bajo nivel, los compromisos de motores de almacenamiento y la teoría formal de aislamiento de concurrencia que rige la persistencia de estado en el sistema.

---

## 1. Arquitecturas de Motores de Almacenamiento: B+ Trees vs. LSM-Trees

Cada motor de almacenamiento adopta decisiones arquitectónicas fundamentales entre latencia de lectura, rendimiento de escritura y amplificación de espacio/escritura.

```
       Arquitectura de B+ Tree                     Arquitectura de LSM-Tree
 (Optimizada para Lectura / In-Place)         (Optimizada para Escritura / Append-Only)

       [ Página Nodo Raíz ]                        [ MemTable en Memoria ]
        /              \                                 (RAM SkipList)
       v                v                                      │ (Flush)
[ Página Interna ] [ Página Interna ]                          ▼
   /        \         /        \                      [ L0 SSTables (Disco) ]
  v          v       v          v                              │ (Compactación)
[ Página Hoja ]  [ Página Hoja ]  [ Página Hoja ]              ▼
(Páginas de Disco Doblemente Enlazadas)               [ L1 SSTables (Disco) ]
```

### 1.1 Comparación Estructural

| Característica | B+ Tree (ej.: Postgres, InnoDB, SQLite) | LSM-Tree (ej.: RocksDB, Cassandra, LevelDB) |
| :--- | :--- | :--- |
| **Carga Principal** | Lectura intensiva, búsquedas puntuales, escaneos por rango. | Escritura intensiva, ingesta de alto volumen, append-only. |
| **Paradigma de Mutación** | Sobrescritura in-place de páginas de disco de tamaño fijo ($4\text{KB}\text{--}16\text{KB}$). | Registro secuencial append-only; SSTables inmutables en disco. |
| **Patrón de E/S en Disco** | E/S Aleatoria (requiere movimientos de cabezal en discos mecánicos). | E/S Secuencial (satura el ancho de banda sostenido del bus). |
| **Amplificación de Escritura (WA)** | Alta (actualizar 1 byte escribe una página completa de $8\text{KB}$ + WAL). | Moderada-Alta (incurrida durante fusiones de compactación en múltiples niveles). |
| **Amplificación de Espacio (SA)** | Moderada (fragmentación de páginas, espacio holgado interno). | Baja-Moderada (registros eliminados ocupan espacio hasta compactarse). |

### 1.2 La Conjetura RUM (Athanassoulis et al., 2016)
La Conjetura RUM demuestra que, al diseñar métodos de acceso para sistemas de datos, optimizar dos de los tres costos primarios compromete inevitablemente el tercero:

```
                  Costo de Lectura (R)
                          /\
                         /  \
                        /    \
                       /      \
  Costo de Actualización (U) - Costo de Espacio / Memoria (M)
```
- **Optimizando Lectura & Espacio (R + M):** Los B+ Trees minimizan la latencia de lectura con un empaquetado denso, pero sacrifican el costo de actualización ($U$) debido a divisiones de página (*page splits*) y escritas aleatorias.
- **Optimizando Actualización & Espacio (U + M):** Los LSM-Trees con compactación nivelada pesada minimizan el uso de disco y aceptan escrituras secuenciales, pero elevan el costo de lectura ($R$) mediante búsquedas en múltiples SSTables (mitigado con Filtros de Bloom).
- **Optimizando Lectura & Actualización (R + U):** Estructuras redundantes de indexación (ej.: mantener índices duales o cachés en memoria) logran lecturas y escrituras veloces, pero inflan el consumo de espacio ($M$).

---

## 2. Teoría de Transacciones: ACID & Recuperación ante Fallos (ARIES)

Una transacción representa una unidad lógica de trabajo que transiciona una base de datos de un estado consistente a otro.

### 2.1 Las Propiedades ACID (Jim Gray, 1981)
- **Atomicidad:** Todas las operaciones de la transacción se ejecutan con éxito, o la transacción completa se revierte con cero efectos secundarios.
- **Consistencia:** Las mutaciones jamás deben violar restricciones declaradas de base de datos, claves foráneas o invariantes de entidades de dominio.
- **Aislamiento:** Las transacciones concurrentes se ejecutan sin observar mutaciones intermedias y no confirmadas de otras transacciones simultáneas.
- **Durabilidad:** Una vez confirmados (*commit*), los cambios de estado sobreviven a caídas del sistema, cortes de energía y terminación de procesos.

### 2.2 Write-Ahead Logging (WAL) & Recuperación ARIES
Para garantizar Durabilidad sin escribir sincrónicamente páginas completas de base de datos en disco en cada commit, los sistemas implementan **Write-Ahead Logging (WAL)**:

> **El Invariante WAL:** Ninguna página de datos modificada (página sucia) puede escribirse en almacenamiento no volátil hasta que el registro de log correspondiente que detalla el cambio haya sido persistido en disco (`fsync`).

El algoritmo canónico **ARIES** (Mohan et al., 1992) ejecuta la recuperación ante caídas en tres fases:
1. **Fase de Análisis:** Escanea el WAL hacia adelante desde el último punto de control (*checkpoint*) para identificar transacciones activas (no confirmadas al momento de la caída) y páginas sucias en memoria.
2. **Fase de Redo (Rehacer):** Escanea hacia adelante desde el registro de log más antiguo sin escribir para repetir la historia, reaplicando todas las operaciones registradas (incluidas las de transacciones no confirmadas) para restaurar el estado exacto anterior a la caída.
3. **Fase de Undo (Deshacer):** Escanea hacia atrás para revertir las acciones de todas las transacciones activas que nunca confirmaron, escribiendo Registros de Log de Compensación (CLRs) para garantizar idempotencia si ocurre otra caída durante la recuperación.

---

## 3. Niveles de Aislamiento de Concurrencia & Anomalías

El estándar ANSI SQL-92 se basó en definiciones ambiguas fundamentadas en bloqueos (*locks*). La teoría moderna de bases de datos clasifica el aislamiento estrictamente según las **anomalías de concurrencia** prevenidas (Berenson et al., 1995; Adya et al., 2000).

```
Jerarquía de Niveles de Aislamiento:
Read Uncommitted < Read Committed < Repeatable Read < Snapshot Isolation (SI) < Serializable (SSI / 2PL)
```

### 3.1 Taxonomía de Anomalías de Concurrencia

| Código | Nombre de la Anomalía | Descripción | Prevenida Por |
| :--- | :--- | :--- | :--- |
| **$G0$** | **Dirty Write** | La transacción $T_1$ modifica un dato, y $T_2$ lo sobrescribe antes de que $T_1$ confirme o aborte. | Read Uncommitted y superiores |
| **$G1a$** | **Dirty Read** | $T_1$ modifica un dato; $T_2$ lee el valor no confirmado; $T_1$ posteriormente aborta. | Read Committed y superiores |
| **$G1c$** | **Non-Repeatable Read** | $T_1$ lee un dato; $T_2$ modifica/elimina ese dato y confirma; $T_1$ vuelve a leer el dato y observa datos alterados. | Repeatable Read y superiores |
| **$A3$** | **Phantom Read** | $T_1$ lee un conjunto bajo un predicado; $T_2$ crea nuevos registros que satisfacen el predicado y confirma; $T_1$ vuelve a consultar y observa registros "fantasma". | Repeatable Read (con MVCC) / Serializable |
| **$P4$** | **Lost Update** | $T_1$ y $T_2$ leen el dato $X$; ambos calculan actualizaciones; $T_1$ escribe $X$; $T_2$ escribe $X$, destruyendo silenciosamente la mutación de $T_1$. | Snapshot Isolation y superiores |
| **$A5B$** | **Write Skew** | $T_1$ lee $X$ e $Y$; $T_2$ lee $X$ e $Y$; la restricción exige $X + Y > 0$. $T_1$ decrementa $X$, $T_2$ decrementa $Y$. Ambos confirman; ¡invariante violada! | **Solo Serializable** |

### 3.2 Snapshot Isolation (SI) & El Peligro de Write Skew
Snapshot Isolation proporciona lecturas libres de bloqueos mediante Control de Concurrencia Multiversión (MVCC). Cada transacción lee a partir de una instantánea (*snapshot*) inmutable de datos confirmados tomada en la marca de tiempo de inicio de la transacción $T_{\text{start}}$.

- **El Primero que Confirma Gana (First-Committer-Wins):** Si dos transacciones concurrentes intentan modificar la **misma fila exacta**, la segunda en confirmar aborta. Esto evita la pérdida de actualización ($P4$).
- **El Punto Ciego de SI (Write Skew):** Si dos transacciones modifican **filas diferentes** mientras dependen de conjuntos de lectura superpuestos para satisfacer una invariante compartida, ambas tienen éxito bajo SI, ¡corrompiendo la invariante!
  - *Ejemplo (El Problema de los Médicos de Guardia):* Regla hospitalaria: $\ge 1$ médico de guardia. La Dra. Alice y el Dr. Bob están de guardia. Alice pide baja ($T_1$ actualiza la fila de Alice porque Bob está de guardia). Simultáneamente, Bob pide baja ($T_2$ actualiza la fila de Bob porque Alice está de guardia). Ambas transacciones confirman bajo SI $\implies$ **¡Cero médicos de guardia!**
- **Solución Arquitectónica:** Imponer **Serializable Snapshot Isolation (SSI)** (que detecta dinámicamente ciclos de dependencia en el grafo de serialización - `rw-antidependencies`) o adquirir bloqueos explícitos a nivel de fila mediante `SELECT ... FOR UPDATE`.

---

## 4. Teoría de Normalización Relacional (Formas Normales de Codd)

Los esquemas de bases de datos deben adherirse a los fundamentos del álgebra relacional (Edgar F. Codd, 1970) para eliminar anomalías de actualización, inserción y eliminación.

- **Primera Forma Normal (1NF):** Cada atributo contiene únicamente valores atómicos e indivisibles. Las tablas poseen una clave primaria. Cero arreglos, grupos repetitivos o blobs JSON no estructurados como atributos primarios de registros.
- **Segunda Forma Normal (2NF):** Satisface 1NF, y cada atributo que no es clave depende funcionalmente por completo de la clave primaria total (elimina dependencias parciales en claves compuestas).
- **Tercera Forma Normal (3NF):** Satisface 2NF, y ningún atributo no clave depende transitivamente de la clave primaria ($X \to Y \to Z$, donde $Z$ depende del no clave $Y$).
- **Forma Normal de Boyce-Codd (BCNF):** Para cada dependencia funcional $X \to Y$, el determinante $X$ debe ser una superclave.

### 4.1 Invariante de Desnormalización Gobernada
La desnormalización se permite **estrictamente como una optimización consciente de lectura** para proyecciones de consulta precalculadas. Las réplicas de lectura desnormalizadas o agregados en caché deben actualizarse transaccionalmente mediante eventos de Outbox o workers deterministas de materialización, jamás mediante escrituras ad-hoc en el código de la aplicación.
