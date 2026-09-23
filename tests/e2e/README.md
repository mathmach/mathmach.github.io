# End-to-End (E2E) Testing Strategy & Specifications

## Overview

End-to-End (E2E) tests occupy Tier 3 of the verification trophy. Unlike Unit tests (Tier 1: pure deterministic calculations) and Integration tests (Tier 2: layer boundary and schema integrity contracts), E2E tests validate systemic behaviors through a production-identical browser runtime.

## Core Invariants

1. **Black-Box Verification:** Tests interact strictly with rendered DOM elements, user events, and navigation states without reaching into internal application stores or framework internals.
2. **Deterministic Test Isolation:** Tests must not depend on mutable external network endpoints. Third-party integrations must be validated at bounded network interfaces.
3. **Flakiness Zero-Tolerance:** Any non-deterministic test run must be quarantined immediately and resolved via explicit synchronization primitives (e.g. web-first assertions, locator auto-waiting) rather than arbitrary sleep timers.

## Critical User Journeys (Specifications)

### 1. Portfolio Landing & Hero Refraction
- User navigates to `/`.
- WebGL 3D canvas mounts and initializes without runtime WebGL context lost errors.
- Hero typography, experience counter, and liquid refraction buttons render within target LCP budget ($\le 1.5\text{s}$).

### 2. Interactive Documentation Reader
- User selects any architecture or foundation paper from the Docs index.
- Markdown content is fetched from `public/docs/{lang}/{file}`, parsed, and rendered with KaTeX math and syntax-highlighted code blocks.
- Reader maintains responsive table wrapper scrollability on viewport widths down to $320\text{px}$.

### 3. Internationalization (i18n) Switching
- User switches locale between English (`en`), Portuguese (`pt`), and Spanish (`es`).
- All navigation links, hero statistics, methodology workflows, and active documentation update synchronously without page reload.
- Document reader fetches and displays the localized variant of the currently active document.

### 4. Theme State & Accessibility
- User toggles between dark mode and light mode.
- Root class updates dynamically, triggering CSS token cascades.
- Theme preference persists across page reloads via `localStorage` adapter.

