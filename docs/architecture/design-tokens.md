# Design token boundary list: the cinema / default dual system (wrapped up in v11.0)

## Where the tokens live now

> **Read this first if you are writing a component.** The audit below is from v11.0 and is a ledger of what
> was fixed then; this section is the current state.

The scale tokens are declared with Tailwind 4's `@theme` in [`packages/ui/src/theme.css`](../packages/ui/src/theme.css),
in the namespaces Tailwind reads: `--radius-*`, `--shadow-*`, `--font-*` and `--ease-*`. Because they are in
`@theme` rather than beside it, `rounded-lg`, `shadow-card`, `font-display` and `ease-out-quart` resolve to
_this_ design system instead of to Tailwind's defaults — a component gets the token by using the ordinary
utility class, with nothing to remember.

`@theme static` emits every token into `:root` whether or not a class references it, which is what lets the
cinema layer and the runtime theme switch read them.

The two design languages are unchanged: the **Cinema workbench** (`.cinema-page` plus the `--cinema-*`
variables, a warm-gold look for the authoring and project pages) and **Default** (`--surface` / `--border` /
`--primary`, for the dashboard data pages and the marketing pages). The `--cinema-*` variables stay a scoped
layer on `.cinema-page` rather than moving into `@theme`, because they are an optional skin, not the scale.

A raw hex value or a bare `rgba()` in a component fails the token gate. Use the utility class, or a token.

**Paths in the ledger below predate task 12.12**, which moved the 45 pages into route groups —
`app/dashboard/usage/page.tsx` is now `app/(app)/dashboard/usage/page.tsx`, and the seven public pages are
under `app/(public)/`. The URLs did not change, and neither did any of the dispositions; the file names in a
record of past work are left as they were written.

---

## The v11.0 audit

> Produced by a full-repo scan in v11.0. Two design languages: the **Cinema workbench** (the `.cinema-page`
> container + `--cinema-*` tokens, a warm-gold cinema look used on the authoring and project pages) and
> **Default** (`--surface/--border/--primary`, used for the dashboard data pages and the marketing pages).
> This document holds the boundary rules plus a ledger of every violation and its disposition.

**Fixed in v11.0 (P0/P1)**:

- ✅ P0 `apps/web/components/locale-switcher.tsx` — the shared component moved to the Default system (the previous
  cinema-card-hi had undefined variables in the marketing/dashboard context → a transparent dropdown
  background, genuinely broken rendering)
- ✅ P1 `apps/web/app/dashboard/usage/page.tsx` — added `cinema-page` to the root container (the page uses cinema-\*
  classes throughout)
- ✅ P1 `apps/web/app/cameo-market/page.tsx` — added `cinema-page` to the root container

**Fixed in v11.0.2 (P2 bulk replacement)**:

- ✅ P2 #1 `apps/web/app/projects/[id]/page.tsx` — 9 Default tokens → their cinema equivalents
- ✅ P2 #2 `apps/web/components/project/distribution-panel.tsx` — 7 sites
- ✅ P2 #4 `apps/web/app/dashboard/projects/page.tsx` — `project-card` ×2 → `cinema-card`
- ✅ P2 #6 `apps/web/app/dashboard/short-video/page.tsx` — 47 sites (--primary/--border/--muted/--surface/--accent-green
  all cleared)

**Fixed / re-checked in v11.0.3 (P3)**:

- ✅ P3 #5 `apps/web/app/dashboard/master-prompt/page.tsx` — 10 Default tokens → their cinema equivalents
- ✅ P3 #3 re-check: after the v10.5.x refactors, `apps/web/app/dashboard/create/page.tsx` and its three
  sub-components (camera-language-picker / character-lock-section / style-lora-library) have zero Default
  tokens left, so no change was needed

Exemptions carry their reasons in the disposition table below.

---

## 1. Token and utility class inventory

### 1.1 The Default system (`/app/globals.css`)

#### CSS custom properties

| Category             | Variables                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Background           | `--background` `--background-elevated` `--foreground`                                                              |
| Surface              | `--surface` `--surface-strong` `--surface-hover`                                                                   |
| Primary              | `--primary` `--primary-hover` `--primary-muted` `--primary-glow`                                                   |
| Secondary            | `--secondary` `--accent` `--accent-green`                                                                          |
| Text                 | `--text` `--muted` `--soft`                                                                                        |
| Border               | `--border` `--border-hover`                                                                                        |
| Technical monitoring | `--monitor-blue` `--monitor-blue-muted` `--scope-green` `--scope-green-muted`                                      |
| Fonts                | `--font-sans` `--font-mono-stack`                                                                                  |
| Radii                | `--radius-xs` `--radius-sm` `--radius-md` `--radius-lg` `--radius-xl` `--radius-2xl` `--radius` (alias)            |
| Shadows              | `--shadow-sm` `--shadow-md` `--shadow-card` `--shadow-card-hi` `--shadow-glow` `--shadow-inset` `--shadow` (alias) |
| Easing               | `--ease-spring` `--ease-out-quart`                                                                                 |

#### Utility classes (defined in globals.css)

`film-grain` · `glass-card` + hover/before · `bezel-shell` + `bezel-core` · `btn-primary` · `cta` /
`cta--gold` / `cta--ghost` / `cta__island` · `btn-ghost` · `btn-icon` · `brand-gradient` ·
`gradient-text-pink` · `stat-pill` · `chip` · `badge-completed` / `badge-active` / `badge-draft` ·
`sidebar-nav-item` · `project-card` · `animate-fade-up` / `animate-fade-in` / `animate-zoom-in` /
`animate-float` / `animate-shimmer` / `animate-pulse-glow` / `animate-gradient` · `stagger` · `page-glow` ·
`cosmic-bg` · `art-shelf` · `story-timeline-shot` · `node-shell` · `skeleton` · `focus-ring` ·
`scroll-area` · `text-gradient-gold` · `ambient-glow` · `custom-scrollbar`

---

### 1.2 The Cinema system (`/app/cinema-theme.css`)

#### CSS custom properties (scoped to `.cinema-page { ... }`)

| Category           | Variables                                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| Background         | `--cinema-bg` `--cinema-surface` `--cinema-surface-2` `--cinema-surface-hi` |
| Text               | `--cinema-text` `--cinema-text-2` `--cinema-text-3`                         |
| Primary palette    | `--cinema-amber` `--cinema-amber-deep` `--cinema-amber-glow`                |
| Functional colours | `--cinema-red` `--cinema-green` `--cinema-blue`                             |
| Border             | `--cinema-border` `--cinema-border-hi`                                      |
| Shadow             | `--cinema-shadow`                                                           |

#### Utility classes (defined in cinema-theme.css)

`cinema-headline` · `cinema-subhead` · `cinema-mono` · `cinema-eyebrow` · `cinema-card` · `cinema-card-hi` ·
`cinema-divider` · `cinema-filmstrip` · `cinema-btn` · `cinema-btn-primary` · `cinema-btn-ghost` ·
`cinema-cta-island` · `cinema-chip` / `cinema-chip-amber` / `cinema-chip-red` / `cinema-chip-green` ·
`cinema-input` · `cinema-textarea` · `cinema-statusbar` / `cinema-statusbar-item` /
`cinema-statusbar-dot` · `cinema-meter` / `cinema-meter-fill` / `cinema-meter-fill-red` ·
`cinema-inline-code` · `cinema-spotlight` · `cinema-fade-up`

> **The container entry point**: `.cinema-page` — every `--cinema-*` variable is defined on this class and
> inherited by its children. Utility classes such as `cinema-btn` gained literal fallback values in the
> `v10.3.3` rework (`var(--cinema-surface-2, #1A1715)`), so they can be used safely outside a
> `.cinema-page` context, though the visual language still differs from the Default system.

---

### 1.3 Component directory

`apps/web/components/cinema/primitives.tsx` — `TimecodeChip` / `AspectChip` / `FilmStripDivider` / `TechReadout` /
`Eyebrow` / `SlateCard` (all using cinema-\* classes)

`apps/web/components/cinema/effects.tsx` — Cinema-system effect components

`apps/web/components/cinema/dataviz.tsx` — Cinema-system data visualization components

`apps/web/components/ui/glass-card.tsx` — the Default-system `GlassCard` component (Default tokens only, no cinema
contamination)

`apps/web/components/ui/bezel-card.tsx` — the Default-system `BezelCard` component (Default tokens only, no cinema
contamination)

## 2. Route-group usage scan

### 2.1 The Cinema system (`apps/web/app/projects/[id]`)

`/app/projects/[id]/page.tsx` — root container `className="cinema-page min-h-screen"` ✓
The whole page uses cinema-_ utility classes and `--cinema-_` tokens. It does, however, **mix in a few
Default-system tokens** (see violation #1 in section 3).

`/app/project-invite/[token]/page.tsx` — root container `className="cinema-page min-h-screen"` ✓
The whole page uses cinema-\* classes, with no violations.

`/app/template/[token]/template-client.tsx` — root container `className="cinema-page min-h-screen"` ✓
The whole page uses cinema-\* classes, with no violations.

`apps/web/components/project/*` — every sub-component (`cinema-timeline`, `distribution-panel`, `monitor-tab`,
`storyboard-regen-modal` and so on) uses cinema-\* classes, but `distribution-panel.tsx` and
`monitor-tab.tsx` **mix in Default-system tokens** (see violation #2).

---

### 2.2 The Default system (`apps/web/app/dashboard`)

**Pure Default-system pages** (no cinema-page container, no cinema-\* classes):

- `/app/dashboard/page.tsx` — uses `GlassCard` / `BezelCard` / `var(--surface)` / `var(--muted)` /
  `var(--primary)` ✓
- `/app/dashboard/billing/page.tsx` — Default token system ✓
- `/app/dashboard/characters/page.tsx` — Default token system ✓
- `/app/dashboard/assets/page.tsx` — Default token system ✓
- `/app/dashboard/profile/page.tsx` — uses `GlassCard` ✓
- `/app/dashboard/jobs/page.tsx` — Default token system ✓
- `/app/dashboard/team/page.tsx` — Default token system ✓
- `/app/dashboard/styles/page.tsx` — Default token system ✓
- `/app/dashboard/polish/page.tsx` — Default token system ✓
- `/app/dashboard/u2v/page.tsx` — Default token system ✓
- `/app/dashboard/story-intake/page.tsx` — Default token system ✓

**Pages that mix across the boundary** (either a cinema-page container inside the dashboard, or heavy use of
cinema-\* classes without a container):

- `/app/dashboard/create/page.tsx` — cinema-page container ✓, but embeds Default-system components (see
  violation #3)
- `/app/dashboard/projects/page.tsx` — cinema-page container ✓, but uses `project-card` (Default system)
  (see violation #4)
- `/app/dashboard/master-prompt/page.tsx` — cinema-page container ✓, mixes in `var(--primary)` for icon
  colours (see violation #5)
- `/app/dashboard/short-video/page.tsx` — cinema-page container ✓, mixes in `var(--primary)` /
  `var(--border)` tokens (see violation #6)
- `/app/dashboard/usage/page.tsx` — **no cinema-page container**, but heavy use of cinema-headline /
  cinema-eyebrow / cinema-mono / cinema-card / cinema-chip (see violation #7)
- `/app/dashboard/templates/page.tsx` — **no cinema-page container**, but uses cinema-btn (see violation #8)
- `/app/dashboard/health/page.tsx` — **no cinema-page container**, uses cinema-mono (see violation #9)

---

### 2.3 Marketing pages (`apps/web/app/page.tsx`, `apps/web/app/pricing`, `apps/web/app/cases`, `apps/web/app/help`, `apps/web/app/examples`)

All use Default-system tokens and utility classes (`btn-primary` / `GlassCard` / `var(--surface)` /
`var(--border)` / `var(--primary)`), with no cinema-\* contamination ✓.

---

### 2.4 Shared / cross-route components

`apps/web/components/collab/*` — `comment-thread.tsx` / `notification-bell.tsx` / `mention-textarea.tsx` /
`presence-avatars.tsx` all use cinema-\* classes; those components are mounted on `/projects/[id]` (a cinema
context ✓) and might be reused in the dashboard sidebar (see violation #10).

`apps/web/components/locale-switcher.tsx` — uses `cinema-btn` and `cinema-card-hi`, and is referenced from
`site-header` (marketing pages), `dashboard/page.tsx` (a Default context) and `create/page.tsx` (the old
create page, with no cinema-page container) (see violation #11).

`apps/web/components/CameoPanel.tsx` — already dual-mode (using the `[.cinema-page_&]:` conditional class), exempt.

`apps/web/components/cameo/CameoStoryboardWidgets.tsx` — as above, exempt.

## 3. The violations, one by one

### Violation #1 — `apps/web/app/projects/[id]/page.tsx` (Default tokens mixed into a cinema page)

**File**: `apps/web/app/projects/[id]/page.tsx`

**Symptom**: the following Default-system tokens appear inside the `.cinema-page` container:

- line 197: `text-[var(--muted)]` (loading placeholder text)
- line 203: `text-[var(--muted)]` (project-not-found message)
- line 317: `text-[var(--muted)]` (synopsis text)
- line 320: `text-[var(--primary)]` (theme tag)
- line 323: `border-[var(--border)]` (sidebar divider)
- line 646: `border-[var(--border)]` / `hover:border-[var(--primary)]` (camera-language button borders)

**Recommended disposition**: change to the corresponding cinema tokens (`--cinema-text-3` for `--muted`,
`--cinema-amber` for `--primary`, `--cinema-border` for `--border`). These are legacy defaults and should be
changed.

---

### Violation #2 — `apps/web/components/project/distribution-panel.tsx` (Default tokens in a cinema component)

**File**: `apps/web/components/project/distribution-panel.tsx`

**Symptom**:

- line 74: `text-[var(--primary)]` for the icon colour
- line 80: `border-[var(--primary)]` / `bg-[var(--primary-muted)]` / `text-[var(--primary)]` on the platform
  switcher buttons
- line 117: `border-[var(--border)]` for the list divider

**Recommended disposition**: this component belongs exclusively to `/projects/[id]` (the Cinema system), so
change `--primary` to `--cinema-amber`, `--primary-muted` to `--cinema-amber-glow` and `--border` to
`--cinema-border`.

---

### Violation #3 — `apps/web/app/dashboard/create/page.tsx` (Default components inside a cinema container)

**File**: `apps/web/app/dashboard/create/page.tsx`

**Symptom**: the page's root container is `cinema-page` (line 617), but it references the Default-system
components `CameraLanguagePicker` / `CharacterLockSection` / `StyleLoraLibrary` (which may contain Default
tokens internally); and the duration switcher on line 175 uses `border-[var(--border)]` /
`text-[var(--muted)]` / `hover:border-[var(--border-hover)]` (Default-system tokens).

**Recommended disposition**: move the duration switcher to the `cinema-btn` system; for the sub-components,
if they really are used only in a Cinema context, replace their Default tokens with the cinema equivalents
inside the component, or add `[.cinema-page_&]:` dual-mode fallbacks (following the `CameoPanel` pattern).

---

### Violation #4 — `apps/web/app/dashboard/projects/page.tsx` (the Default utility class `project-card` inside a cinema container)

**File**: `apps/web/app/dashboard/projects/page.tsx`

**Symptom**: the page's root container is `cinema-page` (line 64), but it also uses Default-system utility
classes:

- line 109: `project-card animate-shimmer` (skeleton placeholder)
- line 150: `project-card animate-fade-up group` (the actual project card)

`project-card` is defined in globals.css and uses `var(--surface)` / `var(--border)`; inside cinema-page
those two variables still have values (cinema-page only overrides `--cinema-*`, not `--surface`), so it may
look fine, but semantically it is a cross-system reference.

**Recommended disposition**: replace `project-card` with `cinema-card` (4px radius / cinema look) and tint
the hover shadow with cinema-amber. A real violation; it should be changed.

---

### Violation #5 — `apps/web/app/dashboard/master-prompt/page.tsx` (Default tokens inside a cinema container)

**File**: `apps/web/app/dashboard/master-prompt/page.tsx`

**Symptom**:

- line 116: `text-[var(--primary)]` for the icon colour (the Clapperboard icon)
- line 119: `text-[var(--accent-green)]` for code highlighting
- line 135: `text-[var(--primary)]` for term highlighting

**Recommended disposition**: `--primary` → `--cinema-amber`; `--accent-green` can stay (visually close to
cinema-green) or become `--cinema-green`. A minor violation; changing it is recommended.

---

### Violation #6 — `apps/web/app/dashboard/short-video/page.tsx` (Default tokens inside a cinema container)

**File**: `apps/web/app/dashboard/short-video/page.tsx`

**Symptom**: Default-system tokens are mixed with cinema utility classes throughout:

- line 175: `border-[var(--border)]` / `text-[var(--muted)]` / `hover:border-[var(--border-hover)]` (duration
  selection)
- line 292: `border-[var(--primary)]` / `bg-[var(--primary-muted)]` / `text-[var(--primary)]` (shot size
  selection)
- line 309: `text-[var(--accent-green)]` / `bg-[var(--surface)]` (the AI prompt display area)
- lines 359 / 368 / 381 / 384: multiple uses of `var(--primary)` / `var(--border)` / `var(--muted)` /
  `var(--accent-green)` and others

**Recommended disposition**: a systemic legacy problem; bulk-replace uniformly: `--primary` →
`--cinema-amber`; `--border` → `--cinema-border`; `--muted` → `--cinema-text-3`; `--surface` →
`--cinema-surface`; `--accent-green` → `--cinema-green`.

---

### Violation #7 — `apps/web/app/dashboard/usage/page.tsx` (heavy cinema-\* usage with no cinema-page container)

**File**: `apps/web/app/dashboard/usage/page.tsx`

**Symptom**: the page's root container is `<div className="max-w-5xl mx-auto flex flex-col gap-5">` (line
101), with no `cinema-page` class, yet it makes heavy use of:

- `cinema-eyebrow` (lines 105, 130, 168, 172, 183 and others)
- `cinema-headline` (lines 106, 155)
- `cinema-mono` (lines 109, 134, 163, 169, 170 and many more)
- `cinema-card` (lines 122, 123, 129, 146, 155, 174, 182, 200)
- `cinema-chip` / `cinema-chip-amber` (lines 135, 165)
- the `cinema-btn` family (lines 116, 118, 149)

Because `cinema-btn` and friends have literal fallbacks (v10.3.3), rendering doesn't collapse entirely, but
`cinema-headline` / `cinema-eyebrow` (which set `font-family: Source Han Serif`) and `cinema-card` (which
sets `border-radius: 4px` and depends on `var(--cinema-surface)` / `var(--cinema-border)`) fall back to
`initial` outside a `.cinema-page` context, giving a broken appearance.

**Recommended disposition**: add the `cinema-page` class to the page's root container (semantically this is
a creator-economy data panel and belongs to the Cinema workbench), or replace every cinema-\* class with its
Default equivalent (`glass-card` / standard Tailwind font utilities). The former is recommended.

---

### Violation #8 — `apps/web/app/dashboard/templates/page.tsx` (cinema-btn with no cinema-page container)

**File**: `apps/web/app/dashboard/templates/page.tsx`

**Symptom**:

- line 89: `cinema-btn !px-3 !py-2 !text-xs` (search button)
- line 92: `cinema-btn !px-3 !py-2 !text-xs` (favourites filter button)
- line 160: `cinema-btn cinema-btn-primary !px-3 !py-1.5 !text-[11px]` (use-template button)

Rendering is fine because `cinema-btn` has literal fallbacks, but semantically it crosses the boundary — the
template marketplace belongs to the dashboard's default system.

**Recommended disposition**: exempt, because `cinema-btn` gained fallbacks in `v10.3.3` and nothing is
visually broken, so the change costs more than it returns; and the template marketplace is tightly coupled
to the authoring flow, making this a "transition zone" component. If the systems are ever unified, change it
to the Default classes `btn-ghost` / `btn-primary`.

---

### Violation #9 — `apps/web/app/dashboard/health/page.tsx` (cinema-mono with no cinema-page container)

**File**: `apps/web/app/dashboard/health/page.tsx`

**Symptom**:

- line 199: `cinema-mono text-white/60` (the current value in the model scan)
- line 218: `cinema-mono` (environment variable display)

**Recommended disposition**: exempt, because `cinema-mono` only sets a font family (JetBrains Mono, already
loaded system-wide) with no CSS variable dependency, so it behaves identically in any context; and using it
for technical-monitoring code display is semantically reasonable. It could be swapped for Tailwind's
`font-mono`, but the benefit is negligible.

---

### Violation #10 — `apps/web/components/collab/*` (cinema-\* classes in shared collaboration components)

**Files**:
`apps/web/components/collab/comment-thread.tsx`
`apps/web/components/collab/notification-bell.tsx`
`apps/web/components/collab/mention-textarea.tsx`
`apps/web/components/collab/presence-avatars.tsx`

**Symptom**: all of them use `cinema-card-hi` / `cinema-mono` / `cinema-eyebrow` / `cinema-btn` /
`var(--cinema-amber)` / `var(--cinema-border)` and similar, and today they are only mounted on the
`projects/[id]` page (a cinema context). If the collaboration panel is ever brought into a Default context
(the dashboard sidebar, say), the `--cinema-*` variables will be undefined.

**Recommended disposition**: exempt (given the current usage), but add a comment at the top of each
component noting that it is exclusive to the cinema-page context, and that moving it to a Default context
requires dual-mode adaptation following the `CameoPanel` pattern.

---

### Violation #11 — `apps/web/components/locale-switcher.tsx` (cinema-btn / cinema-card-hi in marketing/dashboard contexts)

**File**: `apps/web/components/locale-switcher.tsx`

**Symptom**:

- line 22: `cinema-btn !px-2.5 !py-1.5 !text-[11px]` (the language switcher trigger button)
- line 32: `cinema-card-hi p-1 shadow-xl` (the dropdown container)

Called from:

- `apps/web/components/site-header.tsx` (the marketing header, no cinema-page)
- `apps/web/app/dashboard/page.tsx` (the dashboard home, no cinema-page)
- `apps/web/app/create/page.tsx` (the old create page, no cinema-page)

`cinema-card-hi` uses `var(--cinema-surface-2)` / `var(--cinema-border-hi)`, which are `initial` outside a
cinema-page context, leaving the dropdown background transparent and the border gone.

**Recommended disposition**: must be changed. `cinema-btn` → `btn-ghost` (Default system); `cinema-card-hi`
→ `glass-card` or an explicit Tailwind background (e.g.
`bg-[var(--background-elevated)] border border-[var(--border)] rounded-md`). This is a rendering-breaking
violation and takes priority.

---

### Violation #12 — `apps/web/app/error.tsx` / `apps/web/app/loading.tsx` (root-level pages hardcoding --cinema-amber)

**Files**:

- `apps/web/app/error.tsx` (line 17)
- `apps/web/app/loading.tsx` (line 8)

**Symptom**: they use `var(--cinema-amber, #E8C547)` directly as the icon/spinner colour, and the literal
fallback `#E8C547` keeps rendering correct.

**Recommended disposition**: exempt, because the literal fallback `#E8C547` is exactly the Default system's
`--primary: #E8C547`, so there is no visual difference and nothing is broken. If the cinema primary colour
ever changes, re-check these two sites.

---

### Violation #13 — `apps/web/app/cameo-market/page.tsx` (cinema-btn with no cinema-page container)

**File**: `apps/web/app/cameo-market/page.tsx`

**Symptom**:

- line 123: `cinema-btn cinema-btn-primary`
- line 132: `cinema-btn`

The root container is `<div className="min-h-screen bg-[var(--cinema-bg,#0a0a0f)] ...">`, using
`--cinema-bg` as the background but without the `.cinema-page` class, so the `--cinema-*` variables are
undefined.

**Recommended disposition**: add the `cinema-page` class to the root container (that is the only thing
missing); the Cameo market belongs to the cinema system's product surface.

## 4. Suggested boundary rules and a summary of dispositions

### 4.1 Boundary rules (one line per group)

| Route group                                                                                                                                     | Boundary rule                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cinema workbench** (`/projects/*` / `/project-invite/*` / `/template/*` / `/cameo-market`)                                                    | Every UI class and token must come from the `.cinema-page` context; the root container must carry the `cinema-page` class; Default utilities such as `glass-card` / `btn-primary` / `stat-pill` / `project-card` are forbidden; `--primary` / `--surface` / `--border` / `--muted` are banned (use the corresponding `--cinema-*`). |
| **Default dashboard** (`/dashboard/*`, sub-pages with no cinema-page container)                                                                 | Use only Default tokens and utilities (`glass-card` / `btn-primary` / `var(--surface)` etc.); `cinema-card` / `cinema-headline` / `cinema-eyebrow` must not be introduced (different fonts); for single-line monospaced numbers use Tailwind's `font-mono` instead of `cinema-mono`.                                                |
| **Cinema sub-pages inside the dashboard** (`/dashboard/create` / `/dashboard/projects` / `/dashboard/master-prompt` / `/dashboard/short-video`) | Add `cinema-page` to the root container and use only cinema-_ classes and `--cinema-_`tokens inside it; mixing the Default`--primary`/`--border`/`--surface` inside a cinema container is forbidden (all must be replaced by their cinema equivalents).                                                                             |
| **Marketing pages** (`/` / `/pricing` / `/cases` / `/help` / `/examples`)                                                                       | Use only Default tokens and utilities; no cinema-\* classes at all.                                                                                                                                                                                                                                                                 |
| **Shared components** (`apps/web/components/collab/*` / `apps/web/components/locale-switcher` / `CameoPanel` etc.)                              | If used only in a cinema context, cinema-\* classes are fine but the component's JSDoc must say "exclusive to the cinema-page context"; if also used in a Default context, it must be dual-mode following the `CameoPanel` pattern (the `[.cinema-page_&]:` conditional class) or switch to Default classes.                        |

---

### 4.2 Disposition priority

| Priority                                        | Item                                                                                                  | Disposition                                                                                                                           | Reason                                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| P0 (breaks rendering)                           | #11 `locale-switcher` (cinema-card-hi in marketing/dashboard contexts)                                | **Change**: `cinema-btn` → `btn-ghost`; `cinema-card-hi` → `bg-[var(--background-elevated)] border border-[var(--border)] rounded-md` | `--cinema-surface-2` is undefined, so the dropdown background is transparent |
| P1 (semantic error + potential rendering issue) | #7 `dashboard/usage/page.tsx` (no cinema-page container)                                              | **Change**: add `cinema-page` to the root container                                                                                   | `cinema-headline`'s font depends on the variables                            |
| P1                                              | #13 `cameo-market/page.tsx` (no cinema-page container)                                                | **Change**: add `cinema-page` to the root container                                                                                   | A one-line change, the cheapest possible                                     |
| P2 (semantic violation)                         | #4 `dashboard/projects/page.tsx` (`project-card` in a cinema container)                               | **Change**: `project-card` → `cinema-card`, adjusting the hover shadow                                                                | Conflicting radius/shadow styles                                             |
| P2                                              | #1 `projects/[id]/page.tsx` (scattered Default tokens on a cinema page)                               | **Change**: bulk-replace `--muted`/`--primary`/`--border` with the cinema equivalents                                                 | Scattered but systemic                                                       |
| P2                                              | #2 `distribution-panel.tsx` (Default tokens in a cinema component)                                    | **Change**: as above                                                                                                                  | A Cinema-exclusive component                                                 |
| P2                                              | #6 `dashboard/short-video/page.tsx` (many Default tokens in a cinema container)                       | **Change**: bulk replacement                                                                                                          | Same as #1                                                                   |
| P3 (minor)                                      | #3 `dashboard/create/page.tsx` (scattered Default tokens in sub-components inside a cinema container) | **Change** (low priority): replace inside the sub-components or add dual-mode fallbacks                                               | A wide change surface; do it in batches                                      |
| P3                                              | #5 `dashboard/master-prompt/page.tsx` (a few `--primary` icon colours)                                | **Change** (low priority): `--primary` → `--cinema-amber`                                                                             | Low impact                                                                   |
| Exempt                                          | #8 `dashboard/templates/page.tsx` (cinema-btn has fallbacks)                                          | Exempt                                                                                                                                | The fallbacks work; a transition-zone page                                   |
| Exempt                                          | #9 `dashboard/health/page.tsx` (cinema-mono has no variable dependency)                               | Exempt                                                                                                                                | Font stack only, no variable dependency, fully functional                    |
| Exempt                                          | #10 `apps/web/components/collab/*` (cinema-exclusive context)                                         | Exempt (add a comment)                                                                                                                | Currently used only in a cinema context                                      |
| Exempt                                          | #12 `error.tsx` / `loading.tsx` (identical literal fallback)                                          | Exempt                                                                                                                                | The fallback equals `--primary`                                              |

## Inventory notes

1. The `cinema-btn` family has had literal fallbacks since v10.3.3 (e.g. `var(--cinema-surface-2, #1A1715)`),
   so it doesn't fail completely outside a `.cinema-page` context; but `cinema-card` / `cinema-card-hi` /
   `cinema-headline` / `cinema-eyebrow` / `cinema-input` / `cinema-textarea` still depend on undefined
   `--cinema-*` variables and show transparent backgrounds, font fallbacks and similar rendering problems
   without a `.cinema-page` container.

2. The `.cinema-page` class only overrides the `--cinema-*` variables, not Default variables like
   `--surface` / `--border` / `--primary`. So using Default tokens inside cinema-page is technically
   possible (the variables have values), but semantically it crosses the boundary — the two colour sets come
   from different sources (warm gold #E8C547 vs amber #C9A35E; --border #242220 vs --cinema-border
   rgba(245,241,234,0.08)), and mixing them produces subtle but visible colour inconsistency.

3. `CameoPanel.tsx` and `CameoStoryboardWidgets.tsx` use the `[.cinema-page_&]:` conditional class for
   dual-mode adaptation, which is the correct cross-system pattern for a shared component; anything else
   that must span both systems should follow it.

4. `--monitor-blue` and `--scope-green` are Default-system functional colours introduced specifically for
   "technical monitoring" (v9.2.3 P4.1). Mixing these two Default tokens with cinema-\* classes in
   monitor-tab.tsx is deliberate (the technical-monitoring colours are system-agnostic); this is legitimate
   use and does not count as a violation.

5. `project-card`'s hover shadow colour (in globals.css) is `rgba(232, 197, 71, 0.1)`, a different hue from
   `cinema-amber #C9A35E` (bright gold vs deep amber), so using project-card inside cinema-page produces a
   visible hover-tint conflict.
