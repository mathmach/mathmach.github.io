# 🧩 GoF Design Patterns Handbook (Gang of Four)

This document catalogs the classic design patterns (Gamma et al., 1994) applied to modern software architecture, defining mandatory architectural use cases and strict prohibitions.

---

## 1. Creational Patterns

| Pattern | Architectural Application Rule | Strict Prohibition (Anti-Pattern) |
| :--- | :--- | :--- |
| **Factory Method** | Encapsulates the instantiation of swappable infrastructure adapters or domain services within a centralized Registry or Factory. | Instantiating ad-hoc API clients or tightly coupled third-party services directly inside controllers or delivery layers. |
| **Abstract Factory** | Provides an interface for creating families of related or dependent components without specifying their concrete implementations. | Coupling incompatible sub-systems or engines at runtime without verifying cross-component architectural compatibility. |
| **Builder** | Assembles complex configuration objects, execution parameters, or structured multi-step commands through immutable, fluent methods. | Assembling system commands, complex payloads, or queries via unconstrained manual string concatenation (`"cmd -a " + arg`). |
| **Prototype** | Deep cloning of domain entity structures ensuring atomic generation and reassignment of unique identifiers. | Copying entity hierarchies via shallow destructuring, accidentally duplicating immutable identity keys across records. |
| **Singleton** | Ensures expensive infrastructure resources (such as database connection pools or message brokers) maintain exactly one managed lifecycle instance. | Instantiating unpooled database connections or ad-hoc clients inside loops, transient handlers, or utility functions. |

---

## 2. Structural Patterns

| Pattern | Architectural Application Rule | Strict Prohibition (Anti-Pattern) |
| :--- | :--- | :--- |
| **Adapter** | Translates incompatible third-party interfaces, proprietary schemas, or SDK contracts into the internal domain port interface. | Leaking third-party vendor peculiarities, external payload shapes, or vendor SDK types into the core domain layer. |
| **Facade** | Exposes a cohesive, simplified, high-level interface over complex multi-step subsystems and domain orchestration routines. | Forcing delivery controllers or UI routers to orchestrate hundreds of lines of cross-subsystem service invocations. |
| **Composite** | Treats hierarchical, nested tree structures (parent containers and child leaf nodes) uniformly through a shared base interface. | Manipulating hierarchical entity trees through detached, flat arrays lacking explicit parent-child relational constraints. |
| **Decorator** | Dynamically attaches cross-cutting concerns (telemetry tracing, rate limiting, authentication, audit logging) without altering business logic. | Manually duplicating repetitive authentication checks, performance metrics, or error logging across every business handler. |
| **Proxy** | Controls and guards access to a target resource (e.g., security proxies with SSRF protection, caching proxies for slow read operations). | Consuming external network URIs or unverified endpoints without prior whitelist inspection and cryptographic validation. |
| **Bridge** | Decouples an abstraction from its physical implementation so that both can evolve and vary independently. | Hardcoding domain data representations directly to platform-specific graphics, physical display layouts, or transport formats. |
| **Flyweight** | Shares immutable, read-only instances in memory to support efficient execution across high volumes of fine-grained value objects. | Duplicating redundant copies of heavy static catalogs and configuration trees for every runtime entity created in memory. |

---

## 3. Behavioral Patterns

| Pattern | Architectural Application Rule | Strict Prohibition (Anti-Pattern) |
| :--- | :--- | :--- |
| **Strategy** | Defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime via a shared interface (`IExecutionStrategy`). | Hardcoding algorithmic variations, operational rules, or processing logic inside monolithic conditional branches (`if/else` or gigantic `switch`). |
| **Observer** | Establishes a one-to-many dependency between objects so that when an aggregate changes state, subscribers are notified (Event Bus). | Implementing aggressive database polling loops to detect asynchronous state transitions across subsystems. |
| **Command** | Encapsulates a request as an object, allowing execution queuing, audit history logging, and native bidirectional support for `execute()` and `undo()`. | Applying destructive, irreversible mutations directly to state structures without maintaining a reversible transaction log. |
| **State** | Allows an object to alter its behavior when its internal state changes, formalizing transitions within a Finite State Machine (FSM). | Transitioning system lifecycle states via arbitrary string mutations without validating structural pre- and post-conditions. |
| **Template Method** | Outlines the invariant skeleton of a workflow in a base template, deferring specific algorithmic steps to specialized subclasses or delegates. | Allowing disparate execution pipelines to duplicate standard lifecycle routines (validate $\to$ authorize $\to$ execute $\to$ audit) in an inconsistent manner. |
| **Chain of Responsibility** | Passes requests along a sequential chain of independent handlers, where each handler decides either to process the request or pass it downstream. | Bundling distinct validation checks, security inspections, and sanitization filters into monolithic, inseparable blocks. |
| **Mediator** | Centralizes and encapsulates complex communication and coordination among multiple collaborating components or agents. | Allowing decoupled subsystems or agents to execute circular, direct cross-calls without central orchestration. |
| **Visitor** | Adds new analytical, serialization, or export operations to composite structures without modifying the underlying entity classes. | Bloating domain models with formatting and serialization routines tailored to specific external file formats. |
| **Memento** | Captures and externalizes an object's internal state without violating encapsulation, enabling checkpointing, state rollback, and transactional recovery. | Exposing internal mutable state properties or private data structures to consumers to implement autosave, undo, or rollback features. |
| **Iterator** | Provides a standardized mechanism to traverse elements of an aggregate collection sequentially without exposing its underlying representation or physical layout. | Forcing client code to manage low-level array indices, cursor pointers, or node links when traversing complex collection hierarchies. |
| **Interpreter** | Evaluates sentences or domain-specific language (DSL) expressions by defining a formal grammar and an AST-based interpretation tree. | Scattering ad-hoc regex string manipulations, custom parsing logic, and execution rules across unrelated application handlers. |

