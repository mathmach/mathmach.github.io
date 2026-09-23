# ⚡ Complejidad Computacional & Ingeniería de Rendimiento Algorítmico

Este documento establece las bases matemáticas, asintóticas y de empatía con el hardware que rigen la computación en este sistema. Todo algoritmo, estructura de datos y canalización de procesamiento debe justificarse mediante límites formales de complejidad y principios de eficiencia de hardware.

---

## 1. Notaciones Asintóticas & Formalismo de Landau

El análisis asintótico evalúa la tasa de crecimiento algorítmico a medida que el tamaño de entrada $n \to \infty$, abstrayendo constantes específicas de máquina y términos de menor orden.

```
Clasificación Matemática:
f(n) = O(g(n))    <=>  ∃ c > 0, n_0 > 0 tal que ∀ n ≥ n_0: 0 ≤ f(n) ≤ c · g(n)   (Límite Superior Asintótico)
f(n) = Ω(g(n))    <=>  ∃ c > 0, n_0 > 0 tal que ∀ n ≥ n_0: 0 ≤ c · g(n) ≤ f(n)   (Límite Inferior Asintótico)
f(n) = Θ(g(n))    <=>  f(n) = O(g(n)) ∧ f(n) = Ω(g(n))                              (Límite Ajustado / Exacto)
f(n) = o(g(n))    <=>  lim_{n \to \infty} f(n) / g(n) = 0                           (Estrictamente Dominado)
f(n) = ω(g(n))    <=>  lim_{n \to \infty} f(n) / g(n) = \infty                      (Estrictamente Dominante)
```

### 1.1 Jerarquía de Complejidad & Umbrales de Escalamiento

| Orden | Nombre Común | Conteo de Operaciones ($n = 10^3$) | Conteo de Operaciones ($n = 10^6$) | Veredicto Arquitectónico |
| :--- | :--- | :--- | :--- | :--- |
| $\mathcal{O}(1)$ | Constante | $1$ | $1$ | **Estándar de Oro:** Indexación directa, búsqueda hash, push/pop de pila. |
| $\mathcal{O}(\log n)$ | Logarítmica | $\approx 10$ | $\approx 20$ | **Ideal de Escalabilidad:** B-Trees, búsqueda binaria, skip lists, montículos. |
| $\mathcal{O}(n)$ | Lineal | $1.000$ | $1.000.000$ | **Línea Base Aceptable:** Transmisión en un solo paso, recorrido por lotes. |
| $\mathcal{O}(n \log n)$ | Cuasilineal / Linealítmica | $\approx 10.000$ | $\approx 20.000.000$ | **Ordenación por Comparación Óptima:** Merge sort, timsort, quicksort (promedio). |
| $\mathcal{O}(n^2)$ | Cuadrática | $1.000.000$ | $10^{12}$ (1 Billón) | **Peligro en Hot Path:** Prohibido para $n > 1000$; indica bucles anidados. |
| $\mathcal{O}(2^n)$ / $\mathcal{O}(n!)$ | Exponencial / Factorial | $\approx 10^{301}$ (Muerte térmica) | Incalculable | **Colapso Combinatorio:** Prohibido; requiere programación dinámica o heurísticas. |

---

## 2. El Paradigma Logarítmico: $\mathcal{O}(\log n)$ en Sistemas Modernos

La curva de crecimiento logarítmico es la piedra angular de la arquitectura computacional escalable. Un algoritmo de orden $\mathcal{O}(\log_2 n)$ duplica sus operaciones necesarias únicamente cuando el tamaño del problema se eleva al cuadrado ($n \to n^2$).

$$\log_2(10^3) \approx 10 \quad \vert \quad \log_2(10^6) \approx 20 \quad \vert \quad \log_2(10^9) \approx 30 \quad \vert \quad \log_2(10^{12}) \approx 40$$

### 2.1 El Teorema Maestro para Divide y Vencerás
Las relaciones de recurrencia que dividen problemas en $a$ subproblemas de tamaño $n/b$ con trabajo $f(n) = \Theta(n^d)$ siguen:

$$T(n) = a T\left(\frac{n}{b}\right) + f(n)$$

1. **Si $d < \log_b a$:** El trabajo está dominado por las hojas: $T(n) = \Theta(n^{\log_b a})$.
2. **Si $d = \log_b a$:** El trabajo se distribuye uniformemente por niveles: $T(n) = \Theta(n^d \log n)$ *(Merge Sort Canónico: $a=2, b=2, d=1 \implies \Theta(n \log n)$)*.
3. **Si $d > \log_b a$:** El trabajo está dominado por la raíz: $T(n) = \Theta(n^d)$.

### 2.2 Aplicaciones Sistémicas de $\mathcal{O}(\log n)$
- **B-Trees / B+ Trees:** Particionar datos en grandes bloques de disco (fan-out $B \ge 100\text{--}1000$) reduce la altura del árbol a $h \le \lceil \log_B n \rceil$. Consultar 1.000 millones de registros requiere $\le 4$ lecturas de bloque.
- **Anillos de Hash Consistente:** Búsquedas distribuidas sobre tablas finger estilo Chord enrutan solicitudes en $\mathcal{O}(\log N)$ saltos a través de $N$ nodos independientes.
- **Skip Lists:** Listas enlazadas por capas probabilísticas proporcionan búsqueda, inserción y eliminación en $\mathcal{O}(\log n)$ sin requerir bloqueos complejos de rebalanceo de árbol.
- **Búsqueda Binaria & Bisección:** Localizar límites en espacios monotónicos (ej.: bisección de commits, detección de umbrales) concluye en $\le 30$ iteraciones para 1.000 millones de elementos.

---

## 3. Leyes de Concurrencia & Teoría de Colas

La velocidad de ejecución algorítmica dentro de un entorno multinúcleo o distribuido está delimitada por leyes matemáticas que rigen el paralelismo y la contención de colas.

### 3.1 Ley de Little (Equilibrio de Colas)
En cualquier sistema de colas estable, el número promedio a largo plazo de solicitudes concurrentes $L$ es igual a la tasa media de llegada $\lambda$ multiplicada por el tiempo promedio que una solicitud pasa en el sistema $W$:

$$L = \lambda \cdot W$$

- **Dimensionamiento de Grupos de Concurrencia:** Si un endpoint de API recibe $\lambda = 1.000\text{ req/s}$ con una latencia promedio de $W = 50\text{ms}$ ($0.05\text{s}$), la capacidad concurrente requerida es:
  $$L = 1.000 \times 0.05 = 50\text{ workers / conexiones concurrentes}$$
- **Prevención de Bufferbloat:** Si la capacidad de workers se limita a 50, las tasas de llegada superiores a 1.000 req/s acumularán retrasos ilimitados en cola ($W \to \infty$). Las colas saturadas deben rechazar solicitudes anticipadamente mediante descarte de carga (*load-shedding*) y circuit breakers.

### 3.2 Ley de Amdahl (Techo de Paralelización)
La aceleración teórica (*speedup*) $S$ de un programa en $s$ procesadores está estrictamente limitada por la fracción del código $p$ que puede paralelizarse:

$$S(s) = \frac{1}{(1 - p) + \frac{p}{s}}$$

- **El Cuello de Botella Serial:** Si el $5\%$ de una aplicación es inherentemente secuencial ($p = 0.95$), la aceleración teórica máxima con **procesadores infinitos** ($s \to \infty$) está acotada por:
  $$S_{\max} = \frac{1}{1 - 0.95} = 20\times$$
  Añadir más núcleos de CPU o nodos de clúster produce rendimientos decrecientes rápidamente.

### 3.3 Ley Universal de Escalabilidad (Neil Gunther, USL)
La ley de Amdahl asume que la contención de concurrencia es cero. La USL de Gunther modela arquitecturas distribuidas reales incorporando la **contención** de recursos ($\sigma$) y la **coherencia/comunicación cruzada** entre nodos ($\kappa$):

$$X(N) = \frac{\gamma N}{1 + \sigma(N - 1) + \kappa N(N - 1)}$$

```
Throughput X(N)
    ^
    |          Escalabilidad Lineal Ideal (σ = 0, κ = 0)
    |         /
    |        /    Techo de Amdahl (σ > 0, κ = 0)
    |       /    /
    |      /----/---
    |     /    /     \
    |    /    /       \   Caída Retrógrada de la USL (κ > 0: Penalización de Coherencia y Gossip)
    +-------------------> Concurrencia / Nodos (N)
```

- Cuando la penalización de coherencia $\kappa > 0$ (ej.: invalidación de caché distribuida, mensajes de quórum de consenso), el rendimiento $X(N)$ alcanza un pico y entra en **degradación retrógrada**, donde agregar nodos disminuye el rendimiento total del sistema.

---

## 4. Empatía Mecánica: Rendimiento Consciente del Hardware

El software de alto nivel opera sobre hardware físico. Los algoritmos que desprecian jerarquías de memoria, líneas de caché y canalizaciones de CPU sufren una degradación masiva de rendimiento, independientemente de la notación asintótica.

### 4.1 Números de Latencia que Todo Arquitecto Debe Conocer

| Operación | Latencia (Aproximada) | Escala Normalizada en el Mundo Real |
| :--- | :--- | :--- |
| **Referencia a Caché L1 de CPU** | $0.5\text{--}1\text{ ns}$ | $1\text{ segundo}$ |
| **Fallo de Predicción de Salto (Branch Mispredict)** | $3\text{--}5\text{ ns}$ | $5\text{ segundos}$ |
| **Referencia a Caché L2 de CPU** | $3\text{--}4\text{ ns}$ | $7\text{ segundos}$ |
| **Referencia a Caché L3 de CPU** | $10\text{--}20\text{ ns}$ | $20\text{ segundos}$ |
| **Acceso a Memoria Principal (RAM)** | $50\text{--}100\text{ ns}$ | $1.5\text{ minutos}$ |
| **Lectura de Disco SSD (NVMe)** | $10\text{--}50\text{ }\mu\text{s}$ | $1.5\text{ días}$ |
| **Ida y Vuelta (RTT) en Mismo Datacenter** | $500\text{ }\mu\text{s}$ | $1\text{ mes}$ |
| **Ida y Vuelta (RTT) WAN / Internet (Intercontinental)** | $100\text{ ms}$ | $16\text{ años}$ |

### 4.2 Localidad de Referencia
- **Localidad Temporal:** La memoria a la que se accedió recientemente es probable que se vuelva a consultar pronto. Mantener en caché L1/L2.
- **Localidad Espacial:** La memoria almacenada de forma contigua a la memoria accedida recientemente se carga en líneas de caché de CPU ($64\text{ bytes}$).
- **Diseño Orientado a Datos (DOD):**
  - Preferir **Estructura de Arreglos (SoA)** frente a **Arreglo de Estructuras (AoS)** para procesamiento analítico por lotes. Iterar sobre un arreglo de punteros provoca salto continuo de punteros y fallos de caché ($100\text{ns}$ de bloqueo de RAM por elemento). Arreglos secuenciales en memoria contigua permiten que los prefetchers de hardware saturen el ancho de banda de memoria.

### 4.3 Predicción de Saltos & Falsa Compartición (False Sharing)
- **Predicción de Saltos (Branch Prediction):** Evitar bifurcaciones condicionales impredecibles dentro de bucles computacionales intensivos. Los fallos de predicción vacían la canalización de instrucciones de la CPU ($15\text{--}20$ ciclos desperdiciados).
- **Falsa Compartición (False Sharing):** En ejecuciones multihilo, cuando dos hilos en núcleos separados escriben en variables distintas que comparten la misma línea de caché de $64\text{ bytes}$, la CPU invalida la línea entera en todos los núcleos, provocando grave contención de bus. Rellene variables concurrentes para separarlas en diferentes límites de línea de caché.
