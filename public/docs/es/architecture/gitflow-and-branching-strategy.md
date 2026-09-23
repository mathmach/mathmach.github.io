# 🌿 Manual de GitFlow & Estrategia Moderna de Ramificación

## Topologías de Rama, Defensa en Profundidad de Calidad & Predecibilidad de Releases

Este documento establece la arquitectura formal de ramificación, los invariantes de convergencia de código y las compuertas de calidad multicapa que rigen la entrega de software. Estos principios son estrictamente agnósticos respecto al lenguaje y al framework.

---

## 1. Topología Teórica del Control de Versiones

En sistemas distribuidos de control de versiones (DVCS), el historial del repositorio conforma un Grafo Acíclico Dirigido (DAG) $G = (V, E)$, donde cada vértice $v \in V$ representa una instantánea inmutable de commit y cada arista dirigida $e = (u, v) \in E$ denota una relación padre-hijo de derivación.

```
       (feature/auth)
          C1 ─── C2 ─── C3
         /                \  [PR Gate & Squash Merge]
─── M0 ───────────────────── M1 ───────────────────────── M2 ── (main)
                              \                         /
                               H1 ───────────────────── H2
                                 (hotfix/token-rotation)
```

La tensión fundamental en el control de versiones radica entre:
1. **Velocidad del Tronco (Trunk Velocity):** La frecuencia con la que las contribuciones convergen en la vía principal.
2. **Deriva de Rama (Branch Drift):** La métrica de divergencia que mide la distancia topológica y semántica entre una rama de funcionalidad y la línea principal.

Las investigaciones empíricas en ingeniería de software sobre control de versiones distribuido (Brun et al., 2011) demuestran que los conflictos de colaboración se dividen en dos categorías:
- **Conflictos Textuales:** Ediciones concurrentes en líneas o regiones de AST superpuestas, detectadas por algoritmos tradicionales de diff.
- **Conflictos Semánticos de Orden Superior:** Errores de compilación o regresiones de pruebas que ocurren incluso tras fusiones textuales limpias, debido a divergencias en supuestos entre módulos.

Brun et al. (2011) observaron que hasta un 33% de los eventos de integración albergan conflictos semánticos o de compilación latentes que las herramientas clásicas de VCS no detectan proactivamente. A medida que el tiempo de aislamiento de la rama se extiende, los cambios no integrados se acumulan, multiplicando el esfuerzo cognitivo de resolución.

Para erradicar la divergencia manteniendo una verificación rigurosa antes de que el código alcance producción, esta arquitectura adapta el modelo canónico de GitFlow (Vincent Driessen, 2010) en **Ramificación Efímera con Compuertas Estrictas de Convergencia**.

---

## 2. Los Cinco Invariantes de GitFlow

Cada ingeniero y agente autónomo debe adherirse estrictamente a estos cinco invariantes:

### Invariante 1: Tronco Inmutable (Cero Push Directo a Producción)
La rama `main` representa software en estado de producción verificado. Los pushes directos (`git push origin main`) están bloqueados. Todas las modificaciones convergen exclusivamente mediante Pull Requests revisados y validados.

### Invariante 2: Ciclo de Vida Efímero de Ramas ($\le 48\text{h}$)
Las ramas de trabajo deben ser de corta duración. Ninguna rama puede acumular cambios a lo largo de semanas. Los proyectos complejos deben descomponerse en entregas independientes protegidas por Feature Flags o Adaptadores Hexagonales.

Taxonomía de ramas:
- `feat/<alcance>-<descripcion>`: Nuevas funcionalidades o casos de uso.
- `fix/<alcance>-<descripcion>`: Corrección de defectos o errores.
- `refactor/<alcance>-<descripcion>`: Reestructuración interna preservando el comportamiento.
- `chore/<alcance>-<descripcion>`: Herramientas, dependencias o configuración.
- `docs/<alcance>-<descripcion>`: Documentación arquitectónica y especificaciones.

### Invariante 3: Historial Lineal y Determinista
El grafo de commits debe mantenerse comprensible para la bisección automatizada (`git bisect`) y auditorías. Las ramas realizan rebase sobre `main` antes de converger mediante commits squashed o semilineales que preservan la trazabilidad.

### Invariante 4: Compuertas de Calidad Previas a la Convergencia
El código no puede integrarse basándose únicamente en la revisión humana. Los pipelines automatizados de CI deben ejecutarse de forma determinista y reportar un 100% de éxito en todos los umbrales de calidad.

### Invariante 5: Versionado Semántico & Artefactos Trazables
Los releases son hitos inmutables regidos por **Semantic Versioning (SemVer 2.0.0, Tom Preston-Werner)**:

$$\text{Versión} = \text{MAJOR}.\text{MINOR}.\text{PATCH}$$

- **MAJOR:** Cambios incompatibles de API o arquitectura.
- **MINOR:** Nuevas funcionalidades retrocompatibles.
- **PATCH:** Corrección de defectos retrocompatibles.

Cada artefacto se asocia de forma determinista con un hash inmutable de commit y una etiqueta firmada.

---

## 3. Defensa en Profundidad: Los Tres Anillos Concéntricos de Calidad

La ingeniería de calidad exige defensa multicapa. Depender exclusivamente del CI genera latencia de retroalimentación; depender solo de la disciplina local introduce falibilidad humana. Estructuramos las compuertas en tres anillos concéntricos:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Anillo 3: Gate de Despliegue                    │
│   (Verificación de Artefactos, Integridad CAS, Release Atómico)        │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     Anillo 2: Pipeline de CI de PR             │   │
│   │   (VM Limpia, Historial Gitleaks, Typecheck, Suites de Tests)  │   │
│   │                                                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │               Anillo 1: Hook Local de Pre-Commit       │   │   │
│   │   │   (Bloqueo .env, Gitleaks Staged, Linter, Typecheck)   │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Anillo 1: Salvaguarda Local del Desarrollador (Hook de Pre-Commit)
- **Vector de Ejecución:** Git hooks mediante `.husky/pre-commit`.
- **Presupuesto de Latencia:** $< 5$ segundos.
- **Alcance:** Solo archivos en el área de preparación (`git diff --cached`).
- **Compuertas:**
  1. **Bloqueo de Archivos `.env`:** Interrumpe el commit si se detecta cualquier archivo de entorno staged (`.env`, `.env.local`), excepto `.env.example`.
  2. **Escaneo de Secretos en Staged:** Ejecuta `gitleaks git --staged --no-banner --redact` para interceptar credenciales antes de registrar el commit local.
  3. **Linter & Formatter:** Formatea y valida archivos preparados (`biome check --write`), integrando las correcciones al stage.
  4. **Compilación & Typecheck:** Valida tipos estáticos en todo el proyecto (`tsc --noEmit`).

### Anillo 2: Compuerta de Integración Continua (GitHub Actions)
- **Vector de Ejecución:** Runner Ubuntu aislado activado en `pull_request` y `push` a `main`.
- **Aislamiento:** Entorno estéril sin cachés locales de desarrollador.
- **Alcance:** Espacio de trabajo y el historial completo de commits (`fetch-depth: 0`).
- **Compuertas:**
  1. **Análisis Estático & Verificación de Tipos:** Compilación rigurosa sin emitir código.
  2. **Higiene de Código & Complejidad:** Linter con cero advertencias o violaciones de umbral.
  3. **Escaneo Completo de Secretos:** Gitleaks examina **todo el historial de commits** (`gitleaks git --no-banner --redact`).
  4. **Ejecución de Pruebas Automatizadas:** 100% de éxito en suites Unitarias y de Integración.
  5. **Verificación de Compilación:** Compila el bundle de producción para asegurar la resolución de recursos.

### Anillo 3: Compuerta de Despliegue Continuo (Pages / Hosting)
- **Vector de Ejecución:** Flujo de despliegue automatizado condicionado a la aprobación de `main`.
- **Invariantes:**
  1. Afirmación previa del éxito del Anillo 2.
  2. Inmutabilidad mediante nombres con hash de contenido.
  3. Activación atómica para evitar estados intermedios inconsistentes.

---

## 4. Higiene de Credenciales y Prevención de Fugas

Una credencial filtrada en un repositorio remoto debe asumirse comprometida de forma irrevocable, incluso si el commit posterior fue enmendado o eliminado:

```
Commit A: Añade clave de API (OCURRE LA FUGA)
Commit B: Elimina clave de API
Commit C: Ajustes cosméticos

En el almacenamiento de Git: El Commit A sigue siendo accesible vía SHA,
reflogs y packfiles. La clave está permanentemente expuesta.
```

### Disciplina de Credenciales
1. **Nunca commitear secretos reales:** Almacenar credenciales en `.env.local` o gestores seguros.
2. **Documentación Obligatoria:** Documentar cada variable de entorno en `.env.example` con ejemplos ficticios.
3. **Rigor en Allowlists:** Las listas de exclusión de Gitleaks deben restringirse a ejemplos de documentación o fixtures de prueba.

---

## 5. Estándares de Pull Request & Contrato de Calidad

1. **Alcance Acotado:** Los PRs no deben superar 400 líneas de código para garantizar una revisión exhaustiva.
2. **Conventional Commits:** Títulos y mensajes siguen la norma `tipo(alcance): descripción`.
3. **Checklist Obligatorio de PR:** Todo PR debe cumplir el checklist de `.github/PULL_REQUEST_TEMPLATE.md`.

