# 🌐 Fundamentos Teóricos de Sistemas Distribuidos

Este documento establece los principios científicos, teoremas de imposibilidad y modelos formales de consistencia que rigen la computación distribuida, la comunicación en red y la coordinación multinodo.

---

## 1. Las Ocho Falacias de la Computación Distribuida

Identificadas por L. Peter Deutsch, James Gosling y colegas en Sun Microsystems, estas ocho suposiciones falsas nunca deben ser asumidas por arquitectos de software:

1. **La red es confiable:** Los paquetes se pierden, las conexiones se reinician, las líneas de fibra se cortan.
2. **La latencia es cero:** Cada salto de red incurre en retrasos físicos limitados por la velocidad de la luz.
3. **El ancho de banda es infinito:** Las interfaces de red y los backplanes de conmutadores se saturan bajo ráfagas intensas de tráfico.
4. **La red es segura:** El tráfico atraviesa hardware intermediario no verificado; el cifrado en tránsito y la autenticación mutua (mTLS) son obligatorios.
5. **La topología no cambia:** Los nodos, enrutadores y contenedores aparecen, migran y fallan dinámicamente.
6. **Hay un solo administrador:** Los componentes distribuidos cruzan límites organizacionales, de nube y de seguridad heterogéneos.
7. **El costo de transporte es cero:** Serializar, comprimir, transmitir y deserializar datos consume CPU y energía cuantificables.
8. **La red es homogénea:** Los sistemas interconectados ejecutan hardware, sistemas operativos, tamaños de paquetes MTU y versiones de protocolo dispares.

---

## 2. Teoremas CAP y PACELC

La gestión de estado distribuido opera bajo compromisos matemáticos fundamentales al interactuar a través de nodos independientes.

### 2.1 El Teorema CAP (Brewer, 2000; Gilbert & Lynch, 2002)
En una red asíncrona sujeta a particiones ($P$), un almacén de datos distribuido puede garantizar simultáneamente como máximo dos de las siguientes tres propiedades:

- **Consistencia ($C$):** Cada lectura recibe la escritura más reciente o un error explícito (Linearizabilidad / Consistencia de copia única).
- **Disponibilidad ($A$):** Cada nodo que no falla devuelve una respuesta sin error para cada solicitud recibida (sin garantía de contener la última escritura).
- **Tolerancia a Particiones ($P$):** El sistema continúa operando a pesar de que la red descarte o retrase un número arbitrario de mensajes.

$$\text{Una partición de red ($P$) es una realidad física ineludible; por lo tanto, los sistemas deben elegir entre } \mathbf{CP} \text{ o } \mathbf{AP}.$$

```
          Consistencia (C)
              /   \
             /     \
            /  CA   \  (CA es físicamente imposible en redes distribuidas)
           /         \
Disponibilidad (A) --- Tolerancia a Particiones (P)
        \                 /
      Sistema AP        Sistema CP
  (Dynamo, Cassandra) (Raft, Paxos, Spanner)
```

### 2.2 El Teorema PACELC (Daniel Abadi, 2012)
El Teorema CAP solo describe el comportamiento del sistema **durante una partición de red activa**. PACELC amplía CAP modelando el comportamiento durante la ejecución normal:

$$\text{Si } \mathbf{P} \text{ (Partición) } \implies \text{elija entre } \mathbf{A} \text{ y } \mathbf{C}; \quad \mathbf{E} \text{lse (Normal)} \implies \text{elija entre } \mathbf{L} \text{ (Latencia) y } \mathbf{C} \text{ (Consistencia)}.$$

| Clasificación del Sistema | Durante Partición ($P$) | Durante Operación Normal ($E$) | Ejemplos en el Mundo Real |
| :--- | :--- | :--- | :--- |
| **PC / EC** | Consistencia ($C$) | Consistencia ($C$) | Google Spanner, CockroachDB, Raft/Consul |
| **PA / EL** | Disponibilidad ($A$) | Latencia ($L$) | AWS DynamoDB (eventual), Apache Cassandra |
| **PC / EL** | Consistencia ($C$) | Latencia ($L$) | MongoDB (lectura en primario con escritas asíncronas) |
| **PA / EC** | Disponibilidad ($A$) | Consistencia ($C$) | Configuración inusual / meramente teórica |

---

## 3. El Resultado de Imposibilidad FLP (Fischer, Lynch, Paterson, 1985)

El teorema FLP es un hito fundamental en la ciencia computacional teórica:

> *"En una red asíncrona, ningún protocolo de consenso determinista puede garantizar simultáneamente seguridad (nada malo ocurre) y viveza (algo deseable ocurre eventualmente) en presencia de incluso un solo fallo por detención (fail-stop crash) no anunciado."*

### 3.1 Soluciones Arquitectónicas Prácticas para FLP
Debido a que el consenso total es matemáticamente imposible en un modelo puramente asíncrono con fallos, los motores de consenso modernos (Paxos, Raft) eluden FLP introduciendo **suposiciones parcialmente síncronas**:
1. **Randomized Backoff:** Raft utiliza tiempos de espera de elección aleatorizados para romper empates simétricos de votación.
2. **Detectores de Fallo:** Los protocolos asumen intervalos de latido (*heartbeat timeouts*, $\Delta t$) que indican posibles caídas de nodos (sacrificando temporalmente la viveza para preservar la seguridad absoluta).

---

## 4. Tiempo, Relojes Lógicos & Causalidad

Los relojes físicos en diferentes máquinas sufren desincronizaciones continuas (*clock drift*) debido a variaciones térmicas en cristales de cuarzo y oscilaciones de red NTP (ventanas de error de $1\text{ a }50\text{ ms}$). Los sistemas distribuidos jamás deben depender de marcas temporales físicas para ordenar eventos.

### 4.1 Marcas Temporales de Lamport & Orden Parcial (Leslie Lamport, 1978)
Define la **relación ocurrió-antes** (*happens-before*, $\to$):
1. Si los eventos $a$ y $b$ ocurren dentro del mismo proceso y $a$ ocurre antes que $b$, entonces $a \to b$.
2. Si $a$ es el envío de un mensaje y $b$ es la recepción de ese mensaje, entonces $a \to b$.
3. Si $a \to b$ y $b \to c$, entonces $a \to c$ (transitividad).

Cada proceso mantiene un contador entero lógico $L$:
- Evento local: $L = L + 1$.
- Envío de mensaje: Adjunta $L_{\text{msg}} = L$.
- Recepción de mensaje: $L = \max(L_{\text{local}}, L_{\text{msg}}) + 1$.

*Limitación:* Si $L(a) < L(b)$, esto **no** garantiza que $a \to b$. Los eventos pueden ser concurrentes.

### 4.2 Relojes Vectoriales (Mattern / Fidge, 1988)
Para detectar concurrencia real ($a \parallel b$), cada nodo $i$ de $N$ nodos mantiene un vector de enteros $V[1 \dots N]$:
- Antes de que el nodo $i$ genere un evento: $V_i[i] = V_i[i] + 1$.
- Al enviar un mensaje: Transmite el vector completo $V_i$.
- Al recibir el vector $V_{\text{msg}}$: Para cada $k$, actualiza $V_i[k] = \max(V_i[k], V_{\text{msg}}[k])$, e incrementa $V_i[i] = V_i[i] + 1$.

```
Comparación Causal:
V(a) < V(b)  <=>  (∀ k: V(a)[k] ≤ V(b)[k]) ∧ (∃ k: V(a)[k] < V(b)[k])   (El evento a precedió causalmente a b)
De lo contrario, si ni V(a) ≤ V(b) ni V(b) ≤ V(a), entonces a ∥ b       (¡Los eventos a y b son CONCURRENTES!)
```
Los eventos concurrentes indican escrituras en conflicto simultáneo que exigen reconciliación mediante lógica de dominio o estructuras CRDT (Conflict-free Replicated Data Types).

---

## 5. El Principio Fin-a-Fin (Saltzer, Reed, Clark, 1984)

El Principio Fin-a-Fin (*End-to-End Principle*) establece:

> *"Una función o característica solo puede implementarse completa y correctamente con el conocimiento y la ayuda de la aplicación situada en los puntos finales del sistema de comunicación. Por lo tanto, proporcionar dicha función como una característica del sistema de comunicación en sí no es viable."*

### 5.1 Invariantes Arquitectónicos Derivados del Principio Fin-a-Fin
1. **Reintentos de Red $\ne$ Idempotencia de Negocio:** TCP garantiza la entrega de paquetes a nivel físico, pero si el receptor falla mientras procesa la transacción en la base de datos, el estado de la aplicación se pierde. Únicamente las **Claves de Idempotencia** y registros de desduplicación a nivel de aplicación aseguran la corrección fin-a-fin.
2. **Cifrado Salto-a-Salto $\ne$ Protección de Datos:** TLS protege los datos en tránsito entre proxies intermediarios, pero los expone sin cifrar en la memoria de las puertas de enlace (gateways). Cargas útiles de alta confidencialidad exigen **Envelope Encryption** originada en el cliente.
3. **Sumas de Comprobación de Transporte $\ne$ Integridad de Datos:** Las tarjetas de red pueden corromper paquetes durante transferencias DMA de memoria incluso después de validar la suma de verificación de red. Únicamente los resúmenes criptográficos fin-a-fin (almacenamiento direccionable por contenido SHA-256) garantizan la integridad real de la carga útil.
