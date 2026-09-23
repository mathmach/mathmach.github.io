# 🗄️ Persistencia Relacional, Almacenamiento CAS & Ciclos de Vida

Este documento especifica la arquitectura de persistencia y el modelo de Content-Addressable Storage (CAS).

---

## 1. Modelado Relacional Normalizado vs. Blobs Monolíticos

### 1.1 El Anti-Patrón de Blobs JSON Monolíticos
En arquitecturas legacy, colecciones dinámicas y árboles jerárquicos a menudo se serializan en columnas monolíticas de JSON/Texto en bases de datos relacionales. Este anti-patrón introduce cuellos de botella arquitectónicos críticos:
- **Amplificación de Escritura (Write Amplification):** Modificar un único atributo anidado requiere serializar, transferir y reescribir un documento completo de múltiples megabytes.
- **Colisiones de Concurrencia & Sobrescrituras Silenciosas:** Actualizaciones concurrentes dirigidas a secciones distintas de la misma fila se sobrescriben inadvertidamente entre sí.
- **Ineficiencia de Consulta:** Los listados de resumen y lecturas simples se ven obligados a transferir cargas útiles pesadas o mantener exclusiones frágiles de columnas para evitar saturación de memoria y red.

### 1.2 La Solución Relacional Normalizada
- Las estructuras de dominio se modelan en tablas relacionales discretas y normalizadas, vinculadas mediante claves foráneas explícitas (`FOREIGN KEY`) con integridad referencial declarativa (`ON DELETE CASCADE` / `ON DELETE RESTRICT`).
- Cada entidad mutable representa una fila independiente, lo que permite operaciones atómicas granulares con bloqueos a nivel de fila (*row-level locks*).
- Las métricas de resumen y agregaciones aprovechan funciones nativas de base de datos (`SUM`, `COUNT`, `AVG`) en lugar de cargar árboles en bruto en la memoria de la aplicación.

---

## 2. Modelo de Referencia de Content-Addressable Storage (CAS)

La base de datos relacional almacena **cero cargas útiles binarias pesadas y cero vectores matemáticos de alta dimensión en línea**:

1. **Separación Estricta de Responsabilidades:**
   - La base de datos almacena metadatos estructurados, relaciones y claves de referencia criptográficas.
   - El Object Storage / Sistema de Archivos almacena archivos binarios y cargas útiles pesadas.
2. **Direccionamiento por Hash Criptográfico (SHA-256):**
   - Cada archivo comprometido en el almacenamiento se direcciona por su resumen hexadecimal SHA-256:
     $$\text{key} = \text{sha256}(\text{payload})$$
   - La base de datos relacional registra únicamente la cadena hash de 64 caracteres (`VARCHAR(64)`).
3. **Ventajas Arquitectónicas:**
   - **Desduplicación Nativa:** Archivos idénticos guardados en diferentes proyectos comparten automáticamente el mismo objeto físico en almacenamiento.
   - **Capacidad de Caché Inmutable:** Debido a que las claves están vinculadas criptográficamente al contenido de la carga útil, los objetos almacenados son inmutables. Las memorias caché pueden conservar los activos indefinidamente sin riesgo de invalidación.
   - **Auditabilidad Criptográfica:** Cualquier worker o cliente puede verificar la integridad de la carga útil bajo demanda recalculando el hash y comparándolo con el registro en la base de datos.

---

## 3. Ciclo de Vida Estandarizado de Almacenamiento en 3 Niveles

Para evitar el crecimiento descontrolado del almacenamiento y sobrecostos innecesarios de infraestructura, los objetos se particionan en tres niveles con políticas de retención diferenciadas:

| Nivel | Prefijo de Almacenamiento | Política de Retención | Categoría de Datos Almacenados |
| :--- | :--- | :--- | :--- |
| **Nivel 1: Scratch (Efímero)** | `scratch/` | **Auto-TTL Corto (ej.: 24 horas)** y purga automática en reversiones de compensación de Sagas. | Chunks intermedios de procesamiento, archivos de conversión temporal, áreas de trabajo volátiles. |
| **Nivel 2: Vault (Biblioteca / Activos)** | `vault/` | **Retención Permanente / Indefinida.** Nunca purgado por barridos automáticos de ciclo de vida. | Activos de referencia a largo plazo, plantillas base, embeddings fundamentales, perfiles maestros. |
| **Nivel 3: Releases (Entregables)** | `releases/` | **Retención Gobernada por Versión.** Regulada por los ciclos de auditoría y lanzamiento del producto. | Entregables finales consolidados, informes generados, paquetes de exportación. |

---

## 4. Control de Concurrencia & Fronteras Transaccionales

### 4.1 Control de Concurrencia Optimista (OCC)
- Las entidades que admiten ediciones concurrentes mantienen un atributo de versión entero (`version: integer`) o marca temporal de actualización.
- Las actualizaciones de estado atómicas imponen verificación optimista:
  ```sql
  UPDATE entities SET field = $1, version = version + 1 
  WHERE id = $2 AND version = $3;
  ```
- Si la actualización devuelve 0 filas afectadas, la capa de persistencia aborta la operación con una `ConcurrencyCollisionException`, evitando sobrescrituras silenciosas.

### 4.2 Ámbitos Transaccionales Explícitos
- Las operaciones que abarcan múltiples agregados de dominio deben ejecutarse dentro de una transacción ACID explícita.
- Cualquier excepción no controlada activa una reversión inmediata de la transacción antes de que los efectos secundarios sean visibles para consumidores concurrentes.
