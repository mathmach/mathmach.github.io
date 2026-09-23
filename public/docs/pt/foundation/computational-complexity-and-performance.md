# ⚡ Complexidade Computacional & Engenharia de Performance Algorítmica

Este documento estabelece as bases matemáticas, assintóticas e de empatia com o hardware que regem a computação neste sistema. Todo algoritmo, estrutura de dados e pipeline de processamento deve ser justificado através de limites formais de complexidade e princípios de eficiência de hardware.

---

## 1. Notações Assintóticas & Formalismo de Landau

A análise assintótica avalia a taxa de crescimento algorítmico à medida que o tamanho da entrada $n \to \infty$, abstraindo constantes específicas de máquina e termos de menor ordem.

```
Classificação Matemática:
f(n) = O(g(n))    <=>  ∃ c > 0, n_0 > 0 tal que ∀ n ≥ n_0: 0 ≤ f(n) ≤ c · g(n)   (Limite Superior Assintótico)
f(n) = Ω(g(n))    <=>  ∃ c > 0, n_0 > 0 tal que ∀ n ≥ n_0: 0 ≤ c · g(n) ≤ f(n)   (Limite Inferior Assintótico)
f(n) = Θ(g(n))    <=>  f(n) = O(g(n)) ∧ f(n) = Ω(g(n))                              (Limite Justo / Exato)
f(n) = o(g(n))    <=>  lim_{n \to \infty} f(n) / g(n) = 0                           (Estritamente Dominado)
f(n) = ω(g(n))    <=>  lim_{n \to \infty} f(n) / g(n) = \infty                      (Estritamente Dominante)
```

### 1.1 Hierarquia de Complexidade & Limiares de Escala

| Ordem | Nome Comum | Contagem de Operações ($n = 10^3$) | Contagem de Operações ($n = 10^6$) | Veredito Arquitetural |
| :--- | :--- | :--- | :--- | :--- |
| $\mathcal{O}(1)$ | Constante | $1$ | $1$ | **Padrão Ouro:** Indexação direta, busca em hash table, push/pop de pilha. |
| $\mathcal{O}(\log n)$ | Logarítmica | $\approx 10$ | $\approx 20$ | **Ideal de Escalabilidade:** B-Trees, busca binária, skip lists, heaps. |
| $\mathcal{O}(n)$ | Linear | $1.000$ | $1.000.000$ | **Linha de Base Aceitável:** Streaming em passada única, iteração em lote. |
| $\mathcal{O}(n \log n)$ | Quasilinear / Linearítmica | $\approx 10.000$ | $\approx 20.000.000$ | **Ordenação por Comparação Ótima:** Merge sort, timsort, quicksort (médio). |
| $\mathcal{O}(n^2)$ | Quadrática | $1.000.000$ | $10^{12}$ (1 Trilhão) | **Perigo em Hot Path:** Proibido para $n > 1000$; indica loops aninhados. |
| $\mathcal{O}(2^n)$ / $\mathcal{O}(n!)$ | Exponencial / Fatorial | $\approx 10^{301}$ (Morte térmica) | Incalculável | **Colapso Combinatório:** Proibido; exige programação dinâmica ou heurísticas. |

---

## 2. O Paradigma Logarítmico: $\mathcal{O}(\log n)$ em Sistemas Modernos

A curva de crescimento logarítmico é a pedra angular da arquitetura computacional escalável. Um algoritmo de ordem $\mathcal{O}(\log_2 n)$ dobra suas operações necessárias apenas quando o tamanho do problema é elevado ao quadrado ($n \to n^2$).

$$\log_2(10^3) \approx 10 \quad \vert \quad \log_2(10^6) \approx 20 \quad \vert \quad \log_2(10^9) \approx 30 \quad \vert \quad \log_2(10^{12}) \approx 40$$

### 2.1 O Teorema Mestre para Divisão e Conquista
Relações de recorrência dividindo problemas em $a$ subproblemas de tamanho $n/b$ com custo $f(n) = \Theta(n^d)$ seguem:

$$T(n) = a T\left(\frac{n}{b}\right) + f(n)$$

1. **Se $d < \log_b a$:** O trabalho é dominado pelas folhas: $T(n) = \Theta(n^{\log_b a})$.
2. **Se $d = \log_b a$:** O trabalho é distribuído igualmente pelos níveis: $T(n) = \Theta(n^d \log n)$ *(Merge Sort Canônico: $a=2, b=2, d=1 \implies \Theta(n \log n)$)*.
3. **Se $d > \log_b a$:** O trabalho é dominado pela raiz: $T(n) = \Theta(n^d)$.

### 2.2 Aplicações Sistêmicas de $\mathcal{O}(\log n)$
- **B-Trees / B+ Trees:** Particionar dados em grandes blocos de disco (fan-out $B \ge 100\text{--}1000$) reduz a altura da árvore para $h \le \lceil \log_B n \rceil$. Consultar 1 bilhão de registros requer $\le 4$ leituras de bloco.
- **Anéis de Hash Consistente:** Buscas distribuídas sobre tabelas finger em estilo Chord roteiam chaves em $\mathcal{O}(\log N)$ saltos através de $N$ nós independentes.
- **Skip Lists:** Listas encadeadas em camadas probabilísticas fornecem busca, inserção e deleção em $\mathcal{O}(\log n)$ sem a necessidade de bloqueios complexos de rebalanceamento de árvore.
- **Busca Binária & Bissecção:** Localizar fronteiras em espaços monotônicos (ex.: bisseção de commits, descoberta de limiares) conclui em $\le 30$ iterações para um bilhão de elementos.

---

## 3. Leis de Concorrência & Teoria das Filas

A velocidade de execução algorítmica em um ambiente multi-core ou distribuído é limitada por leis matemáticas que regem o paralelismo e a contenção de filas.

### 3.1 Lei de Little (Equilíbrio de Filas)
Em qualquer sistema de filas estável, o número médio de requisições concorrentes $L$ em longo prazo é igual à taxa média de chegada $\lambda$ multiplicada pelo tempo médio que uma requisição permanece no sistema $W$:

$$L = \lambda \cdot W$$

- **Dimensionamento de Pools de Concorrência:** Se um endpoint de API recebe $\lambda = 1.000\text{ req/s}$ com latência média de $W = 50\text{ms}$ ($0.05\text{s}$), a capacidade concorrente necessária é:
  $$L = 1.000 \times 0.05 = 50\text{ workers / conexões concorrentes}$$
- **Prevenção de Bufferbloat:** Se a capacidade de workers for limitada em 50, taxas de chegada superiores a 1.000 req/s acumularão atrasos ilimitados na fila ($W \to \infty$). Filas saturadas devem rejeitar requisições precocemente via *load-shedding* e circuit breakers.

### 3.2 Lei de Amdahl (Teto de Paralelização)
A aceleração teórica (*speedup*) $S$ de um programa em $s$ processadores é estritamente limitada pela fração do código $p$ que pode ser paralelizada:

$$S(s) = \frac{1}{(1 - p) + \frac{p}{s}}$$

- **O Gargalo Serial:** Se $5\%$ de uma aplicação é inerentemente sequencial ($p = 0.95$), a aceleração teórica máxima com **infinitos processadores** ($s \to \infty$) é limitada por:
  $$S_{\max} = \frac{1}{1 - 0.95} = 20\times$$
  Adicionar mais núcleos de CPU ou nós de cluster produz retornos rapidamente decrescentes.

### 3.3 Lei Universal de Escalabilidade (Neil Gunther, USL)
A lei de Amdahl assume contenção de concorrência zero. A USL de Gunther modela arquiteturas distribuídas reais incorporando a **contenção** de recursos ($\sigma$) e a **coerência/conversa cruzada** entre nós ($\kappa$):

$$X(N) = \frac{\gamma N}{1 + \sigma(N - 1) + \kappa N(N - 1)}$$

```
Throughput X(N)
    ^
    |          Escalabilidade Linear Ideal (σ = 0, κ = 0)
    |         /
    |        /    Teto de Amdahl (σ > 0, κ = 0)
    |       /    /
    |      /----/---
    |     /    /     \
    |    /    /       \   Queda Retrógrada da USL (κ > 0: Penalidade de Coerência & Gossip)
    +-------------------> Concorrência / Nós (N)
```

- Quando a penalidade de coerência $\kappa > 0$ (ex.: invalidação de cache distribuído, mensagens de quorum de consenso), a vazão $X(N)$ atinge um pico e entra em **degradação retrógrada**, onde adicionar novos nós reduz a vazão total do sistema.

---

## 4. Simpatia Mecânica: Performance Consciente do Hardware

Software de alto nível executa sobre hardware físico. Algoritmos que ignoram hierarquias de memória, linhas de cache e pipelines de CPU sofrem degradação maciça de desempenho, independentemente da notação assintótica.

### 4.1 Números de Latência que Todo Arquiteto Deve Conhecer

| Operação | Latência (Aproximada) | Escala Normalizada no Mundo Real |
| :--- | :--- | :--- |
| **Referência a Cache L1 de CPU** | $0.5\text{--}1\text{ ns}$ | $1\text{ segundo}$ |
| **Erro de Predição de Desvio (Branch Mispredict)** | $3\text{--}5\text{ ns}$ | $5\text{ segundos}$ |
| **Referência a Cache L2 de CPU** | $3\text{--}4\text{ ns}$ | $7\text{ segundos}$ |
| **Referência a Cache L3 de CPU** | $10\text{--}20\text{ ns}$ | $20\text{ segundos}$ |
| **Acesso à Memória Principal (RAM)** | $50\text{--}100\text{ ns}$ | $1.5\text{ minutos}$ |
| **Leitura de Disco SSD (NVMe)** | $10\text{--}50\text{ }\mu\text{s}$ | $1.5\text{ dias}$ |
| **Roundtrip dentro do Mesmo Datacenter** | $500\text{ }\mu\text{s}$ | $1\text{ mês}$ |
| **Roundtrip WAN / Internet (Intercontinental)** | $100\text{ ms}$ | $16\text{ anos}$ |

### 4.2 Localidade de Referência
- **Localidade Temporal:** Memória acessada recentemente provavelmente será acessada novamente em breve. Manter em cache L1/L2.
- **Localidade Espacial:** Memória armazenada contiguamente à memória acessada recentemente é buscada para as linhas de cache da CPU ($64\text{ bytes}$).
- **Data-Oriented Design (DOD):**
  - Preferir **Estrutura de Arrays (SoA)** a **Array de Estruturas (AoS)** para processamento analítico em lote. Iterar sobre arrays de ponteiros provoca perseguição de ponteiros e falhas de cache ($100\text{ns}$ de espera na RAM por elemento). Arrays sequenciais em memória contígua permitem que prefetchers de hardware saturem a largura de banda da memória.

### 4.3 Predição de Desvios & Falso Compartilhamento
- **Predição de Desvios (Branch Prediction):** Evitar ramificações condicionais imprevisíveis dentro de loops computacionais críticos. Erros de predição esvaziam o pipeline de instruções da CPU ($15\text{--}20$ ciclos desperdiçados).
- **Falso Compartilhamento (False Sharing):** Em execuções multi-thread, quando duas threads em núcleos distintos escrevem em variáveis diferentes que compartilham a mesma linha de cache de $64\text{ bytes}$, a CPU invalida a linha inteira entre os núcleos, gerando contenção severa de barramento. Alinhe variáveis concorrentes para fronteiras separadas de linha de cache.
