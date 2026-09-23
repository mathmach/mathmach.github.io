# Model-Based Systems Engineering (UML) and Relational Schema Engineering (DDL/DML) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Model-Based Systems Engineering (OMG UML 2.5.1 / Kruchten 4+1) and Relational Database Schema Engineering (Codd, Chen ERD, Normalization, DDL & DML) into the portfolio resume, tech stack, experience, and academic documentation treatises across all supported languages.

**Architecture:** Update domain translation models and data catalogs in TypeScript, enrich foundational systems engineering and database architecture markdown documents with formal academic literature, and synchronize all localized versions in `public/docs/`.

**Tech Stack:** TypeScript, React, Vite, KaTeX, Markdown, Mermaid.

**Spec:** `docs/superpowers/specs/2026-09-23-uml-mbse-and-relational-ddl-dml-design.md`

## Global Constraints
- Strictly English for all code, markdown in `docs/`, commit messages, and specs.
- Localized mirrors in `public/docs/pt/` must be in Portuguese, and `public/docs/es/` in Spanish. Root `public/docs/` and `public/docs/en/` must be in English.
- No comments in code (enforce repository invariant).
- Zero fallback debt and 100% full edits across all languages and files.

---

### Task 1: Update Domain Translations in `src/i18n.ts`

**Files:**
- Modify: `src/i18n.ts`

**Interfaces:**
- Consumes: `Job`, `TechCategory`, `translations`
- Produces: Updated translations for `en`, `pt`, and `es`

- [ ] **Step 1: Edit `src/i18n.ts` for English (`en`)**
  Add DDL/DML, normalization, Codd, and Chen ERD to `tech.categories['Databases & Storage']`.
  Add MBSE, OMG UML 2.5, and Kruchten 4+1 to `tech.categories['Architecture & DevSecOps']` / `['Methodologies & Rigor']`.
  Update job points for Accenture Pioneer and Audsat to include UML blueprinting and relational DDL/DML engineering.
  Update `docs.c2` items.

- [ ] **Step 2: Edit `src/i18n.ts` for Portuguese (`pt`)**
  Update Portuguese translations identically with proper terminology (Modelagem Relacional DDL & DML, MBSE, UML 2.5, Kruchten 4+1).

- [ ] **Step 3: Edit `src/i18n.ts` for Spanish (`es`)**
  Update Spanish translations identically with proper terminology.

- [ ] **Step 4: Verify typecheck passes**
  Run `npx tsc --noEmit`.

---

### Task 2: Update Knowledge Base Catalog in `src/docsData.ts`

**Files:**
- Modify: `src/docsData.ts`

**Interfaces:**
- Consumes: `DOCS_INDEX`, `DocItem`
- Produces: Updated highlights and subtitles for `systems-engineering` and `database-internals` in EN, PT, ES.

- [ ] **Step 1: Update `systems-engineering` entries in EN, PT, ES**
  Include MBSE, OMG UML 2.5, and Kruchten 4+1 in highlights and subtitle.

- [ ] **Step 2: Update `database-internals` entries in EN, PT, ES**
  Include Codd Relational Formalism, Chen ERD, Normalization (1NF–BCNF), and DDL/DML in highlights and subtitle.

- [ ] **Step 3: Verify typecheck passes**
  Run `npx tsc --noEmit`.

---

### Task 3: Expand Systems Engineering Treatise in `docs/` and `public/docs/`

**Files:**
- Modify: `docs/foundation/systems-engineering-and-dependability.md`
- Modify: `public/docs/foundation/systems-engineering-and-dependability.md`
- Modify: `public/docs/en/foundation/systems-engineering-and-dependability.md`
- Modify: `public/docs/pt/foundation/systems-engineering-and-dependability.md`
- Modify: `public/docs/es/foundation/systems-engineering-and-dependability.md`

- [ ] **Step 1: Update English documents**
  Add Section 2.2: Model-Based Systems Engineering (MBSE) & OMG UML 2.5.1 (ISO/IEC 19505), Kruchten (1995) 4+1 View Model, Parnas (1972) information hiding, and OCL contracts with Mermaid architecture diagram.

- [ ] **Step 2: Update Portuguese document**
  Translate and format the new section in Portuguese for `public/docs/pt/foundation/systems-engineering-and-dependability.md`.

- [ ] **Step 3: Update Spanish document**
  Translate and format the new section in Spanish for `public/docs/es/foundation/systems-engineering-and-dependability.md`.

---

### Task 4: Expand Database Architecture Treatise in `docs/` and `public/docs/`

**Files:**
- Modify: `docs/architecture/database-internals-and-transaction-theory.md`
- Modify: `public/docs/architecture/database-internals-and-transaction-theory.md`
- Modify: `public/docs/en/architecture/database-internals-and-transaction-theory.md`
- Modify: `public/docs/pt/architecture/database-internals-and-transaction-theory.md`
- Modify: `public/docs/es/architecture/database-internals-and-transaction-theory.md`

- [ ] **Step 1: Update English documents**
  Add Section 1: Relational Foundation, Formal Schemas, DDL & DML (Codd 1970/1972, Chen 1976 ERD, Normalization 1NF–BCNF & 4NF, Declarative DDL & DML, Selinger 1979 query optimization). Renumber subsequent sections accordingly.

- [ ] **Step 2: Update Portuguese document**
  Translate and format the new section in Portuguese for `public/docs/pt/architecture/database-internals-and-transaction-theory.md`.

- [ ] **Step 3: Update Spanish document**
  Translate and format the new section in Spanish for `public/docs/es/architecture/database-internals-and-transaction-theory.md`.

---

### Task 5: Build Verification and Reference HTML Validation

**Files:**
- All modified files

- [ ] **Step 1: Run TypeScript compiler**
  `npx tsc --noEmit`
- [ ] **Step 2: Run production build**
  `npm run build`
- [ ] **Step 3: Validate HTML rendering of references and markdown**
  Verify that the reader fetches and parses the updated markdown documents, renders math formulas and Mermaid diagrams without syntax errors, and matches all academic citations.

