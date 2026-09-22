# 🏛️ SOLID Design Principles Handbook

This document establishes the canonical application of the five **SOLID** principles (Martin, 2000; Liskov, 1987; Meyer, 1988) across the software architecture. Every component, module, aggregate, and service must strictly comply with these mandates.

---

## 1. Single Responsibility Principle (SRP)

> *"A module should have one, and only one, reason to change."* — Robert C. Martin

### 1.1 Architectural Mandate
- Each software module, class, or service must be accountable to a single actor or stakeholder.
- Strict separation of architectural concerns across stratified boundaries:
  - **Delivery / Controllers:** Responsible exclusively for transport negotiation, parameter parsing, authentication extraction, and response status mapping ($\le 300\text{ LOC}$).
  - **Application Use Cases:** Responsible exclusively for choreographing domain aggregates, managing transactions, and delegating to outbound ports.
  - **Domain Entities & Value Objects:** Responsible exclusively for enterprise business invariants, state validation, and pure calculations.
  - **Infrastructure Adapters:** Responsible exclusively for technical mechanics (SQL queries, external API network calls, disk I/O).

### 1.2 Quantitative & Architectural Metrics
- **Lack of Cohesion of Methods (LCOM):** Methods within a class must operate on shared state fields; disjoint method clusters indicate multiple responsibilities and mandate decomposition.
- **Maximum Function Cognitive Complexity:** $\le 15$ points.

### 1.3 Strict Anti-Patterns
- **God Class / Monster Controller:** Merging request validation, authorization checks, SQL queries, third-party API integration, and formatting inside a single file or handler.
- **Hybrid Domain-Infrastructure Entities:** Coupling business validation rules with database schema annotations or ORM lifecycle hooks.

---

## 2. Open/Closed Principle (OCP)

> *"Software entities (classes, modules, functions) should be open for extension, but closed for modification."* — Bertrand Meyer

### 2.1 Architectural Mandate
- The system must allow new behavior to be added without altering existing, verified source code.
- New capabilities are introduced by implementing polymorphic abstractions, registering new strategies in factory registries, or hooking into composable middleware pipelines.
- Core business workflows rely on abstract interfaces (`IPaymentProcessor`, `IReportGenerator`, `IStorageGateway`), allowing new implementations to be injected dynamically via configuration.

### 2.2 Quantitative & Architectural Metrics
- **Protected Variations (Larman):** Identify points of predicted instability or variation; isolate them behind stable contractual interfaces.
- Zero git diff in core domain orchestrators when a new external provider or delivery mechanism is introduced.

### 2.3 Strict Anti-Patterns
- **Monolithic Branching Ladders:** Modifying core use cases with growing `if/else` or `switch` statements whenever a new variant, payment provider, or export format is introduced.
- **Direct Instantiation of Concrete Variants:** Instantiating specific concrete classes directly within consumer workflows instead of leveraging registries or factories.

---

## 3. Liskov Substitution Principle (LSP)

> *"Subtypes must be substitutable for their base types without altering the correctness of the program."* — Barbara Liskov

### 3.1 Architectural Mandate
- Any implementation of an interface or derivative of an abstraction must conform behavioral adherence to the contract expected by the caller.
- **Preconditions cannot be strengthened:** A subtype must not demand stricter input arguments or additional prerequisites than the base abstraction.
- **Postconditions cannot be weakened:** A subtype must satisfy all guarantees and output contracts promised by the base abstraction.
- **Invariants must be preserved:** Subtype mutations must never violate the structural consistency rules established by the base type.

### 3.2 Quantitative & Architectural Metrics
- **Zero Runtime Type Assertions:** Code consuming an abstraction must never require `instanceof` checks, dynamic property reflection, or type casting to function safely.
- **Exception Uniformity:** Subtypes may only emit domain-specific exceptions specified by the port interface contract.

### 3.3 Strict Anti-Patterns
- **Refused Bequest / `NotImplementedException`:** Implementing an interface method by throwing an unsupported exception or leaving an empty no-op because the subtype does not support that operation.
- **Contract Violation via Null/Degraded Returns:** Returning `null` or silently ignoring parameters when the base interface contract explicitly guarantees an operational result.

---

## 4. Interface Segregation Principle (ISP)

> *"Clients should not be forced to depend upon interfaces that they do not use."* — Robert C. Martin

### 4.1 Architectural Mandate
- Prefer small, role-specific, focused interfaces over bulky general-purpose contracts.
- Interfaces belong to the client that consumes them, not to the infrastructure provider that implements them.
- Decompose broad capabilities into cohesive functional facets (e.g., separating `IEntityReader` from `IEntityWriter`, or `ITokenValidator` from `IUserSessionManager`).
- Consumers declare explicit dependency only upon the minimal subset of methods required for their operation.

### 4.2 Quantitative & Architectural Metrics
- **Interface Cohesion:** Interfaces should contain the minimal orthogonal set of methods needed for a single client role ($\le 5$ methods per role interface).
- **Zero Stubbing Overhead in Tests:** Test doubles (mocks/stubs) for an interface should require configuring only the methods relevant to the use case under test.

### 4.3 Strict Anti-Patterns
- **Header Interface / Kitchen-Sink Contracts:** Creating an interface that mirrors every public method of a large service (e.g., `IUserService` with 40 diverse methods) and forcing all callers to depend on the entire surface.
- **Dummy Implementations:** Forcing test mocks or specialized adapters to write blank stub implementations for dozens of unused interface methods.

---

## 5. Dependency Inversion Principle (DIP)

> *"High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions."* — Robert C. Martin

### 5.1 Architectural Mandate
- The direction of source code dependencies must point inward toward high-level policy and domain rules, never outward toward low-level technical mechanisms.
- Inversion of Control (IoC):
  - High-level use cases define the **Ports** (interfaces) they need to execute their intent (e.g., `IOrderRepository`, `INotificationGateway`).
  - Low-level infrastructure modules supply the **Adapters** implementing those interfaces (e.g., `PostgresOrderRepository`, `SesNotificationGateway`).
  - Wire concrete adapters to abstract ports at the application entrypoint (Composition Root / Dependency Injection container).

### 5.2 Quantitative & Architectural Metrics
- **Stable Dependencies Principle (SDP):** Dependencies must point in the direction of stability. High-level policies are maximally stable; low-level technical details are volatile.
- **Zero Concrete Infrastructure Imports in Domain:** Static analysis must verify zero imports of ORMs, HTTP clients, cloud SDKs, or filesystem utilities inside the domain and application layers.

### 5.3 Strict Anti-Patterns
- **Direct Low-Level Couplings:** Instantiating a concrete database client, SDK instance, or filesystem reader directly inside a domain entity or use case.
- **Leaking Infrastructure Models:** Exposing ORM-generated database row types or third-party SDK response structures across port boundaries into the domain model.

---

## Summary Matrix

| Principle | Primary Focus | Failure Indicator | Architecture Remedy |
| :--- | :--- | :--- | :--- |
| **S** - SRP | Module cohesion & single actor | Fat controllers, high LCOM, frequent merge conflicts | Decompose by layer and lifecycle |
| **O** - OCP | Extensibility without mutation | Fragile `switch/case` chains on new features | Polymorphic strategies & factory registries |
| **L** - LSP | Contractual behavioral equivalence | `instanceof` checks, `NotImplementedException` | Behavioral subtyping & formal contracts |
| **I** - ISP | Client-tailored lean interfaces | Heavy test mock setup, dummy methods | Fine-grained role interfaces |
| **D** - DIP | Inward dependency direction | Direct DB/SDK imports in domain | Hexagonal Ports & Inversion of Control |
