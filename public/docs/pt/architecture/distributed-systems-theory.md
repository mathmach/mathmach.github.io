# 🌐 Fundamentos Teóricos de Sistemas Distribuídos

Este documento estabelece os princípios científicos, teoremas de impossibilidade e modelos formais de consistência que regem a computação distribuída, a comunicação em rede e a coordenação multinó.

---

## 1. As Oito Falácias da Computação Distribuída

Identificadas por L. Peter Deutsch, James Gosling e colegas na Sun Microsystems, estas oito suposições falsas nunca devem ser feitas por arquitetos de software:

1. **A rede é confiável:** Pacotes são descartados, conexões sofrem reset, cabos de fibra são rompidos.
2. **A latência é zero:** Cada salto de rede incorre em atrasos físicos limitados pela velocidade da luz.
3. **A largura de banda é infinita:** Interfaces de rede e backplanes de switches saturam sob tráfego intenso em rajada.
4. **A rede é segura:** O tráfego atravessa hardware intermediário não verificado; criptografia de transporte e autenticação mútua (mTLS) são obrigatórias.
5. **A topologia não muda:** Nós, roteadores e contêineres aparecem, migram e falham dinamicamente.
6. **Existe apenas um administrador:** Componentes distribuídos cruzam fronteiras organizacionais, de nuvem e de segurança distintas.
7. **O custo de transporte é zero:** Serializar, compactar, transmitir e deserializar dados consome CPU e energia mensuráveis.
8. **A rede é homogênea:** Sistemas interconectados executam hardwares, sistemas operacionais, tamanhos de pacote MTU e versões de protocolo díspares.

---

## 2. Teoremas CAP e PACELC

O gerenciamento de estado distribuído opera sob compromissos matemáticos fundamentais ao lidar com múltiplos nós independentes.

### 2.1 O Teorema CAP (Brewer, 2000; Gilbert & Lynch, 2002)
Em uma rede assíncrona sujeita a partições ($P$), um data store distribuído pode garantir simultaneamente no máximo duas das três propriedades a seguir:

- **Consistência ($C$):** Toda leitura recebe a escrita mais recente ou um erro explícito (Linearizabilidade / Consistência de cópia única).
- **Disponibilidade ($A$):** Todo nó não falho retorna uma resposta sem erro para qualquer requisição recebida (sem garantia de conter a escrita mais recente).
- **Tolerância a Partições ($P$):** O sistema continua operando apesar de um número arbitrário de mensagens ser descartado ou atrasado pela rede.

$$\text{Uma partição de rede ($P$) é uma realidade física inevitável; portanto, sistemas devem escolher entre } \mathbf{CP} \text{ ou } \mathbf{AP}.$$

```
          Consistência (C)
              /   \
             /     \
            /  CA   \  (CA é fisicamente impossível em redes distribuídas)
           /         \
Disponibilidade (A) --- Tolerância a Partições (P)
        \                 /
      Sistema AP        Sistema CP
  (Dynamo, Cassandra) (Raft, Paxos, Spanner)
```

### 2.2 O Teorema PACELC (Daniel Abadi, 2012)
O Teorema CAP apenas descreve o comportamento do sistema **durante uma partição ativa de rede**. O PACELC estende o CAP modelando o comportamento durante a execução normal:

$$\text{Se } \mathbf{P} \text{ (Partição) } \implies \text{escolha entre } \mathbf{A} \text{ e } \mathbf{C}; \quad \mathbf{E} \text{lse (Normal)} \implies \text{escolha entre } \mathbf{L} \text{ (Latência) e } \mathbf{C} \text{ (Consistência)}.$$

| Classificação do Sistema | Durante Partição ($P$) | Durante Operação Normal ($E$) | Exemplos do Mundo Real |
| :--- | :--- | :--- | :--- |
| **PC / EC** | Consistência ($C$) | Consistência ($C$) | Google Spanner, CockroachDB, Raft/Consul |
| **PA / EL** | Disponibilidade ($A$) | Latência ($L$) | AWS DynamoDB (eventual), Apache Cassandra |
| **PC / EL** | Consistência ($C$) | Latência ($L$) | MongoDB (leitura no primário com escritas assíncronas) |
| **PA / EC** | Disponibilidade ($A$) | Consistência ($C$) | Configuração rara / puramente teórica |

---

## 3. O Resultado da Impossibilidade FLP (Fischer, Lynch, Paterson, 1985)

O teorema FLP é um marco na ciência da computação teórica:

> *"Em uma rede assíncrona, nenhum protocolo de consenso determinístico pode garantir simultaneamente segurança (nada de errado acontece) e vivacidade (algo desejável eventualmente acontece) na presença de mesmo uma única falha por parada (fail-stop crash) não anunciada."*

### 3.1 Soluções Arquiteturais Práticas para o FLP
Como o consenso total é matematicamente impossível em um modelo puramente assíncrono sujeito a falhas, motores de consenso modernos (Paxos, Raft) contornam o FLP introduzindo **premissas de sincronia parcial**:
1. **Randomized Backoff:** O Raft utiliza timeouts de eleição randomizados para quebrar empates simétricos de votação.
2. **Detectores de Falha:** Protocolos assumem intervalos de heartbeat $(\Delta t)$ para indicar potenciais quedas de nós (sacrificando a vivacidade temporariamente para preservar a segurança absoluta).

---

## 4. Tempo, Relógios Lógicos & Causalidade

Relógios físicos em máquinas distintas sofrem desvios contínuos (*clock drift*) devido a variações térmicas no cristal de quartzo e oscilações na sincronização NTP da rede (janelas de erro de $1\text{ a }50\text{ ms}$). Sistemas distribuídos nunca devem depender de timestamps físicos para ordenação de eventos.

### 4.1 Timestamps de Lamport & Ordem Parcial (Leslie Lamport, 1978)
Define a **relação aconteceu-antes** (*happens-before*, $\to$):
1. Se os eventos $a$ e $b$ ocorrem dentro do mesmo processo e $a$ ocorre antes de $b$, então $a \to b$.
2. Se $a$ é o envio de uma mensagem e $b$ é o recebimento dessa mensagem, então $a \to b$.
3. Se $a \to b$ e $b \to c$, então $a \to c$ (transitividade).

Cada processo mantém um contador inteiro lógico $L$:
- Evento local: $L = L + 1$.
- Envio de mensagem: Anexa $L_{\text{msg}} = L$.
- Recebimento de mensagem: $L = \max(L_{\text{local}}, L_{\text{msg}}) + 1$.

*Limitação:* Se $L(a) < L(b)$, isso **não** garante que $a \to b$. Os eventos podem ser concorrentes.

### 4.2 Relógios Vetoriais (Mattern / Fidge, 1988)
Para detectar concorrência verdadeira ($a \parallel b$), cada nó $i$ de $N$ nós mantém um vetor de inteiros $V[1 \dots N]$:
- Antes do nó $i$ gerar um evento: $V_i[i] = V_i[i] + 1$.
- Ao enviar uma mensagem: Transmite o vetor completo $V_i$.
- Ao receber o vetor $V_{\text{msg}}$: Para todo $k$, atualiza $V_i[k] = \max(V_i[k], V_{\text{msg}}[k])$, e incrementa $V_i[i] = V_i[i] + 1$.

```
Comparação Causal:
V(a) < V(b)  <=>  (∀ k: V(a)[k] ≤ V(b)[k]) ∧ (∃ k: V(a)[k] < V(b)[k])   (O evento a precedeu causalmente b)
Caso contrário, se nem V(a) ≤ V(b) nem V(b) ≤ V(a), então a ∥ b         (Os eventos a e b são CONCORRENTES!)
```
Eventos concorrentes indicam conflito de escritas simultâneas que exigem reconciliação via lógica de domínio ou CRDTs (Conflict-free Replicated Data Types).

---

## 5. O Princípio Ponta-a-Ponta (Saltzer, Reed, Clark, 1984)

O Princípio Ponta-a-Ponta estabelece:

> *"Uma função ou recurso só pode ser completamente e corretamente implementado com o conhecimento e a colaboração da aplicação situada nos pontos finais do sistema de comunicação. Portanto, prover tal função como uma característica do próprio sistema de comunicação não é viável."*

### 5.1 Invariantes Arquiteturais Derivados do Princípio Ponta-a-Ponta
1. **Retentativas de Rede $\ne$ Idempotência de Negócio:** O TCP garante entrega de pacotes na camada física, mas se o receptor cair enquanto processa a transação no banco de dados, o estado da aplicação é perdido. Apenas **Chaves de Idempotência** na camada de aplicação garantem a correção ponta-a-ponta.
2. **Criptografia Salto-a-Salto $\ne$ Proteção de Dados:** O TLS protege dados em trânsito entre proxies intermediários, mas os expõe descriptografados na memória de gateways. Cargas úteis de alta criticidade exigem **Envelope Encryption** originada no cliente.
3. **Checksums de Transporte $\ne$ Integridade de Dados:** Placas de rede podem corromper pacotes em transferências DMA de memória mesmo após validar o checksum de transporte. Apenas digests criptográficos de aplicação ponta-a-ponta (armazenamento endereçável por conteúdo SHA-256) garantem integridade total.
