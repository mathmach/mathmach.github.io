# Portfolio Redesign: Cinematic Scrollytelling

## Architecture
- **Framework:** React 19 (Vite)
- **3D Engine:** Three.js + @react-three/fiber + @react-three/drei
- **Motion:** Framer Motion for DOM elements
- **Styling:** Tailwind CSS v4

## Design System (High-End Vanguard)
- **Typography:** Geist Mono + Plus Jakarta Sans (or fallback to sans-serif / monospace). Huge contrast between macro-typography (H1s) and micro-typography (labels).
- **Colors:** Deep OLED black (`#050505`), pure white text, emerald/green accents (`#4ade80`).
- **Layout:** Asymmetric, massive whitespace (py-40), floating components.
- **Motion:** Cubic-bezier transitions, scroll-triggered fade-ups, 3D element reacts to scroll position via `useFrame`.
- **3D Core:** A central dodecahedron/icosahedron using `MeshTransmissionMaterial` (glass physical refraction) that rotates and translates vertically based on the scroll offset, acting as the visual anchor.

## Data Mapping
- **Hero:** Executive metrics (8+ years, Santander/Itaú/BB).
- **Experience:** Interactive timeline mapped to roles at Santander LATAM, Audsat/BB, Anbima Data.
- **Knowledge Base (Docs):** Rendered as a Bento grid or list of cards with references to SOLID, GoF, Clean Architecture, Distributed Systems.
- **References Base:** Bibliography table.

## Implementation Plan
1. Convert `Concept1.tsx` into the main `App.tsx`.
2. Inject real data from `README.md`.
3. Add Framer Motion scroll reveals (`whileInView`).
4. Polish the 3D material (chromatic aberration, transmission, thickness).
5. Clean up redundant concept files.
