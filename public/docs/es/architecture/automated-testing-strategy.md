# 🧪 Estrategia de Pruebas Automatizadas & Arquitectura de Verificación

## Pirámides de Pruebas, Límites de Contrato, Test Doubles & Ratchets de Cobertura

Este documento codifica la arquitectura de verificación, la taxonomía de pruebas y los ratchets de calidad automatizados de este repositorio. Estos principios proporcionan una base de ingeniería formal aplicable a cualquier lenguaje, framework o entorno de ejecución.

---

## 1. Fundamentos Teóricos de la Verificación de Software

En la ingeniería de sistemas (ISO/IEC/IEEE 15288), el aseguramiento de la calidad de software equilibra dos disciplinas complementarias definidas por Barry Boehm (1981):

- **Verificación:** *"¿Estamos construyendo el producto de la manera correcta?"* Garantiza que el software cumple rigurosamente con sus especificaciones arquitectónicas, contratos de tipos e invariantes de dominio.
- **Validación:** *"¿Estamos construyendo el producto correcto?"* Garantiza que el software satisface las necesidades operativas y de los usuarios en su entorno real.

```
       Escalación del Coste de Defectos (Curva Económica de Boehm)
Coste
  ▲
100x│                                          ● Incidente en Producción
    │
 10x│                           ● Defecto en Integración
    │
  1x│            ● Captura en Prueba Unitaria
    └────────────┴──────────────┴──────────────┴─────────────►
               Diseño         Build         Deploy     Ciclo de Vida
```

La ingeniería empírica demuestra que el coste de resolución de defectos aumenta exponencialmente a lo largo del ciclo de vida. Un defecto detectado en pruebas unitarias supone un coste de $1\times$. El mismo defecto hallado en integración cuesta $10\times$, y en producción escala a $100\times$ o más debido a incidencias, recuperación de datos y despliegues de emergencia.

Por tanto, una estrategia rigurosa de pruebas automatizadas es una **necesidad económica esencial para una velocidad sostenible**.

---

## 2. El Trofeo de Verificación & Taxonomía Multicapa

Las arquitecturas modernas de verificación estructuran las pruebas mediante el modelo de la **Pirámide de Pruebas** (Mike Cohn, 2009; Martin Fowler, 2012) y el **Trofeo de Pruebas**, estableciendo niveles diferenciados:

```
                  ┌───────────────────────┐
                  │      Tier 3: E2E      │  ◄── Flujos Sistémicos de Caja Negra
                  │   (Navegador/Sistema) │      Ejecución: Segundos
                  ├───────────────────────┤
                  │  Tier 2: Integración  │  ◄── Límites de Contrato & Adaptadores
                  │ (Componente/Adaptador)│      Ejecución: Milisegundos
                  ├───────────────────────┤
                  │     Tier 1: Unitario  │  ◄── Lógica Pura & Matemáticas
                  │  (Cálculos / Dominio) │      Ejecución: Microsegundos
                  └───────────────────────┘
```

### Tier 1: Pruebas Unitarias (Dominio Puro & Invariantes Matemáticos)
- **Alcance:** Funciones aisladas, entidades de dominio, value objects y algoritmos matemáticos.
- **Invariantes de Ejecución:**
  - Presupuesto de latencia en microsegundos ($< 5\text{ms}$ por prueba).
  - Estrictamente **cero operaciones de E/S** (sin llamadas de red, lecturas de disco ni accesos a base de datos).
  - Determinismo puro: ante entradas idénticas, las salidas son idénticas independientemente del reloj del sistema o del orden de ejecución.
- **Propósito:** Validar exhaustivamente ramas combinatorias, casos límite y reglas de negocio.

### Tier 2: Pruebas de Integración (Límites de Contrato & Ensamblaje)
- **Alcance:** Interacción entre múltiples módulos colaboradores, adaptadores de puertos hexagonales, diccionarios de traducción y mappers.
- **Invariantes de Ejecución:**
  - Presupuesto de latencia en milisegundos ($< 100\text{ms}$ por prueba).
  - Valida esquemas de contratos, paridad de traducciones e interfaces entre capas.
  - Interactúa con test doubles controlados en memoria.
- **Propósito:** Asegurar que los componentes verificados individualmente funcionan de forma armónica al integrarse.

### Tier 3: Pruebas de Extremo a Extremo / E2E (Flujos Sistémicos de Caja Negra)
- **Alcance:** Sistema completo en funcionamiento en un entorno real (ej. navegador headless).
- **Invariantes de Ejecución:**
  - Interacción de caja negra a través de puntos de entrada públicos (eventos de usuario, DOM, endpoints).
  - Valida propiedades emergentes: estabilidad de renderizado WebGL, transiciones de navegación y presupuestos de rendimiento.
  - Cero tolerancia a pausas arbitrarias (sin sleeps): utiliza sincronización basada en eventos.
- **Propósito:** Demostrar que los flujos críticos de usuario operan fiablemente bajo condiciones del mundo real.

---

## 3. Taxonomía de Test Doubles (Gerard Meszaros & Martin Fowler)

Al probar límites entre módulos, desacoplar dependencias requiere un uso disciplinado de **Test Doubles**. Siguiendo a Gerard Meszaros (*xUnit Test Patterns: Refactoring Test Code*, 2007) y Martin Fowler (*Mocks Aren't Stubs*, 2007), distinguimos cinco tipos:

| Tipo de Double | Definición | Caso de Uso Principal |
|---|---|---|
| **Dummy** | Objetos pasados como parámetro pero nunca invocados ni inspeccionados. | Completar listas de parámetros requeridas por constructores. |
| **Stub** | Objetos que devuelven respuestas preconfiguradas durante la prueba. | Simular consultas externas, lectores de configuración o servicios de solo lectura. |
| **Spy** | Stubs que también capturan metadatos de invocación (argumentos, conteo de llamadas). | Verificar que se emitió un evento o notificación con los parámetros esperados. |
| **Mock** | Objetos preprogramados con expectativas explícitas de llamadas; fallan si la secuencia no coincide. | Validar protocolos estrictos de interacción y máquinas de estado. |
| **Fake** | Implementaciones funcionales pero simplificadas e inadecuadas para producción (ej. repositorio en memoria). | Pruebas de integración de alta velocidad sin infraestructura pesada. |

### Las Dos Reglas de Oro de los Test Doubles

1. **Nunca simules lo que no posees:**
   Simular SDKs de terceros vincula las pruebas a detalles que pueden divergir de la realidad. En su lugar, aísla las dependencias externas mediante **Puertos Hexagonales** y simula únicamente tu contrato de puerto interno.
2. **Prioriza Fakes y Stubs frente a Mocks:**
   El exceso de mocks verifica *cómo* funciona el código internamente en lugar de *qué* resultado produce, generando pruebas frágiles que fallan ante refactorizaciones internas válidas.

---

## 4. Ratchets de Calidad en Ingeniería

Para evitar que la disciplina de pruebas se degrade con el tiempo, el repositorio impone tres ratchets de calidad:

### 4.1 Ratchet de Umbral de Cobertura Unidireccional
La cobertura de pruebas solo puede incrementarse. Si una mejora arquitectónica eleva la cobertura del $80\%$ al $85\%$, ese $85\%$ se convierte en el nuevo umbral mínimo innegociable. Cualquier commit que reduzca la cobertura bloquea el pipeline de CI.

### 4.2 TDD como Vector de Diseño
Escribir la prueba fallida antes de la implementación obliga a diseñar interfaces desacopladas y limpias. El código difícil de probar refleja un alto acoplamiento o una violación del Principio de Responsabilidad Única (SRP).

### 4.3 Cero Tolerancia a Pruebas Inestables (Flaky Tests)
Una prueba intermitente destruye la confianza en el CI. Las pruebas inestables deben aislarse de inmediato, analizarse hasta la causa raíz y subsanarse.

---

## 5. Integración en Pipelines Automatizados

La ejecución de pruebas se organiza en fases progresivas:

```bash
# 1. Verificación Unitaria en Microsegundos (Desarrollo local continuo)
npm run test:unit

# 2. Verificación de Integración de Subsistemas (Previa a registrar commits)
npm run test:integration

# 3. Suite Completa de Pruebas (Mandatoria en Pre-Commit y CI de PR)
npm test
```

