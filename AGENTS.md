# Repository Rules & Operational Invariants

## Comments in code: none

Do not write any comments in code. No decision explanations, no block comments,
no JSDoc, no "why" above functions, no `// TODO`.

The reasoning that would go into a comment belongs in the **commit message**, which in this project is
detailed and explanatory, or in the chat response. Never in the code file.

When a snippet seems to require a comment to be understood, the solution is better naming and
smaller functions — not a comment.

This applies to new code and code you edit. Do not remove pre-existing comments without being asked: the rule applies to what you add.

## Language

Strictly English for all documentation, tests, commit messages, specifications, and code.
User communication in chat may occur in Portuguese, but all committed artifacts must be 100% English.

## Architecture Rules, SOLID, GoF, and Quality Standards

Every agent and developer working on this codebase must strictly adhere to the architecture foundations defined in `docs/`:

1. **SOLID Principles (`docs/architecture/solid-design-principles.md`):**
   - Single Responsibility (SRP): Modules accountable to one actor; controllers $\le 300\text{ LOC}$; pure domain separation.
   - Open/Closed (OCP): Extension via polymorphic strategies and registries without modifying core workflows.
   - Liskov Substitution (LSP): Strict behavioral subtyping; zero `instanceof` guards or `NotImplementedException`.
   - Interface Segregation (ISP): Fine-grained, role-tailored port interfaces ($\le 5$ methods).
   - Dependency Inversion (DIP): Hexagonal ports at domain boundaries; zero infrastructure imports in domain core.

2. **GoF Design Patterns (`docs/architecture/gof-design-patterns.md`):**
   - Mandatory canonical adoption across Creational, Structural, and Behavioral patterns.
   - Strict prohibitions on ad-hoc instantiation, monolithic switch branching, manual string concatenation for commands, and state leakage.

3. **Strict Quality Ratchets (`docs/architecture/engineering-quality-and-invariants.md`):**
   - **Zero Fallback Debt:** Enforce all 7 golden rules (no `.catch(value)` masking, no `safeParse().data ?? fallback`, no `env.VAR ?? fallback`, no unvalidated `process.env`).
   - **Zero Orphan Surfaces:** No uncalled procedures, dangling exports, or dead code.
   - **Cognitive Complexity Ceiling:** Functions must not exceed 15 points of cognitive complexity.
   - **Coverage Floor Ratchet:** Automated test coverage can only ratchet upward.

4. **Clean Architecture, Distributed Resilience & Storage Hygiene:**
   - Follow `docs/architecture/clean-architecture-and-ddd.md`, `docs/architecture/distributed-resilience-patterns.md`, and `docs/architecture/persistence-and-cas-storage.md`.

---

## Agent Operational Invariants

Every agent must strictly adhere to these 5 operational invariants on every request without exception:

1. **Holistic Architectural Chain Analysis (Context Before Code):**
   - Map the entire chain before writing code: callers, callees, dependency injection points, registries, consumers, types, and tests.
   - Understand how changes integrate into the overall system architecture before touching files.

2. **Exhaustive Refactoring (Zero Partial Edits, Zero Leftovers):**
   - Refactorings, renames, and removals apply to 100% of all occurrences across all modules.
   - Search the entire repository (`ck-find-files`, `ck-find-symbol`, `ck-refs`), build a complete file list, and update all occurrences in a single pass.

3. **Anti-Wave Protocol & Exhaustive Requirement Fulfillment:**
   - Extract every explicit and implicit requirement into a checklist and deliver completely in the current turn.
   - Zero placeholders (`// ...`, `TODO`, `// rest of implementation`). Full, production-ready code only.

4. **Strict Grounding & Zero Speculation (Zero Hallucination):**
   - Never assume an API, signature, export, or file path exists.
   - Always verify exact signatures and implementations on disk (`ck-signatures`, `ck-find-symbol`, `view_file`) before writing code referencing them.

5. **Pre-Completion Cross-Check:**
   - Before declaring completion, verify:
     1. Did I address every single item requested?
     2. Did I touch every affected file without leftovers?
     3. Are all imports, methods, and types verified against disk?
     4. Do linters, typechecks, and tests pass?

---

## Mandatory Tooling & Skill Execution Protocol

1. **Context King (`ck-*`) for AST & Symbol Grounding:**
   - Use `ck-find-files`, `ck-find-symbol`, and `ck-signatures` for AST inspection.
   - Use `ck-get-method-source` and `ck-refs` to verify exact parameter types and call sites before modifying code.

2. **Superpowers Framework (`obra/superpowers`) for Disciplined Engineering:**
   - **`systematic-debugging`:** Gather empirical proof and isolate root causes before proposing fixes. Zero guesswork.
   - **`test-driven-development`:** Write failing assertions/tests before implementing functional changes.
   - **`verification-before-completion`:** Run verification commands and confirm output before concluding.
   - **`subagent-driven-development` / `executing-plans`:** Decompose multi-step tasks into discrete subtasks with verification gates.

3. **Caveman Communication Efficiency:**
   - Maintain terse, high-density communication: eliminate filler and pleasantries; keep 100% of technical density and precision.

---

<!-- caveman-begin -->

Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

<!-- caveman-end -->
