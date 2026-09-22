# Native Liquid Glass Architecture Specification

**Date:** 2026-09-22  
**Status:** Approved  
**Topic:** Replicating `liquid-glass-web-react` natively across Header, Cards, and Buttons with code-level parameter customization.

---

## 1. Overview and Goals

This design replicates the optical liquid glass refraction and specular lighting system inspired by `liquid-glass-web-react` without adding third-party dependencies or external packages. The system will be natively embedded into the project under `src/lib/liquid-glass/` and integrated across:
1. Floating Navigation Header (`<header>` / `<nav>`)
2. Cards (`<LiquidCard>` used in Methodology, Experience, Tech Stack, Recruiter Stats)
3. Buttons and interactive pills (`<LiquidButton>`, `.liquid-pill`, Theme Toggle, Language Switcher, Social links, CTA buttons)

All optical parameters (transparency/opacity, refraction strength, chromatic aberration, curvature profile, edge highlight, specular glow, and light angle) are centralized in `src/lib/liquid-glass/config.ts` to allow fixed, explicit code customization.

---

## 2. Mathematical Core & Displacement Mapping

### 2.1 Optical Normalization and Falloff (`math.ts`)
- **Edge falloff:** Error function approximation `erf(x) = tanh(1.7724538509 * x)` ensures continuous C1-differentiable transition from the flat inner core to the refracting border band.
- **Spherical dome curvature:** Normalized spherical cap gradient calculation:
  $$\text{depth}_{\text{effective}} = \max(0.01, \min(\text{depth}, \min(w/2, h/2) - 1))$$
  $$R_x = \frac{(w/2)^2 + d^2}{2d}, \quad R_y = \frac{(h/2)^2 + d^2}{2d}$$
  $$\text{gradient}(x, R, \text{scale}) = \frac{\min(x, 0.999R)}{\sqrt{R^2 - \min(x, 0.999R)^2}} \cdot \text{scale}$$
  Normalization preserves average gradient magnitude so increasing `curvature` does not unpredictably alter the perceived refraction displacement scale.

### 2.2 Quadrant Displacement and Specular Map (`displacementMap.ts`)
- **Bitmap memory layout:** Single `Uint8ClampedArray` with 4-byte RGBA per pixel over size $S \times S$ (default $256 \times 256$ or $512 \times 512$).
- **Encoding:**
  - Red Channel ($R$): Horizontal displacement coordinate offset, normalized with neutral value at 128.
  - Green Channel ($G$): Vertical displacement coordinate offset, normalized with neutral value at 128.
  - Blue Channel ($B$): Packed specular mask combining inner glow falloff and outer rim highlight.
  - Alpha Channel ($A$): Signed Distance Field (SDF) clip boundary for rounded rectangles, clipping out-of-lens pixels with 0 alpha to guarantee clean edges without bounding box artifacts.
- **Symmetry optimization:** Evaluates the top-left quadrant and computes all four quadrants symmetrically, negating $X$ horizontally and $Y$ vertically.

---

## 3. SVG Filter Pipeline & Native Engine

### 3.1 DOM & SVG Filter Construction (`engine.ts`)
The `LiquidGlassEngine` constructs an isolated SVG `<filter>` element housed inside a zero-dimension SVG container:
1. `<feFlood flood-color="rgb(128,128,128)" flood-opacity="1" result="mapBg" />`: Neutral base plane.
2. `<feImage preserveAspectRatio="none" href="data:image/png;base64,..." result="rawMap" />`: Dynamic displacement map rendered from canvas.
3. `<feComposite in="rawMap" in2="mapBg" operator="over" result="map" />`: Map composite.
4. `<feGaussianBlur in="SourceGraphic" stdDeviation="..." result="blurred" />`: Selective optical pre-blur.
5. Triplicate `<feDisplacementMap>` + `<feColorMatrix>` pipeline:
   - Evaluates Red, Green, and Blue channels independently with differential displacement scaling:
     $$\text{scale}_R = s \cdot (1 + 0.2c), \quad \text{scale}_G = s \cdot (1 + 0.1c), \quad \text{scale}_B = s$$
   - Chromatic aberration $c \in [0, 1]$ introduces realistic RGB dispersion along refracting edges.
6. `<feComposite operator="arithmetic">`: Additive recombination of refracted spectral components.
7. Specular lighting synthesis: Blue channel mask modulated by specular intensity parameter `specular` composited over the refracted output.
8. Outer masking: `<feComposite operator="in">` and `<feComposite operator="out">` guarantees content outside the lens boundary remains unrefracted raw DOM.

### 3.2 Platform-Specific Invariants
- **Safari / WebKit ID Versioning:** Safari caches filter results keyed by element ID. Whenever parameters or dimensions change, the engine bumps a version counter `liquid-glass-filter-${id}-v${version}` and updates `style.filter = "url(#...)"`.
- **iOS Coordinate Spaces:** Uses `userSpaceOnUse` on iOS with normalized Euclidean scale $(W^2 + H^2)^{0.5}/\sqrt{2}$ to prevent subregion displacement bugs present in iOS WebKit.
- **Lifecycle & Memory Management:** Native `ResizeObserver` monitors host dimensions. Canvas is cached per engine instance. Clean disposal in `destroy()` tears down SVG nodes and disconnects observers.

---

## 4. Centralized Configuration Architecture (`config.ts`)

Parameters are organized in `src/lib/liquid-glass/config.ts`:

```ts
export interface LiquidGlassPresetConfig {
  darkBgOpacity: number;
  lightBgOpacity: number;
  darkBorderOpacity: number;
  lightBorderOpacity: number;
  strength: number;
  chromaticAberration: number;
  curvature: number;
  depth: number;
  blur: number;
  glow: number;
  edgeHighlight: number;
  specular: number;
  specularAngle: number;
  quality: number;
}

export const LIQUID_GLASS_CONFIG: Record<'header' | 'card' | 'button', LiquidGlassPresetConfig> = {
  header: {
    darkBgOpacity: 0.20,
    lightBgOpacity: 0.40,
    darkBorderOpacity: 0.12,
    lightBorderOpacity: 0.10,
    strength: 0.07,
    chromaticAberration: 0.35,
    curvature: 0.75,
    depth: 14,
    blur: 0,
    glow: 0.25,
    edgeHighlight: 0.45,
    specular: 1.0,
    specularAngle: 120,
    quality: 256,
  },
  card: {
    darkBgOpacity: 0.30,
    lightBgOpacity: 0.50,
    darkBorderOpacity: 0.10,
    lightBorderOpacity: 0.08,
    strength: 0.055,
    chromaticAberration: 0.25,
    curvature: 0.60,
    depth: 18,
    blur: 0,
    glow: 0.15,
    edgeHighlight: 0.35,
    specular: 0.85,
    specularAngle: 135,
    quality: 256,
  },
  button: {
    darkBgOpacity: 0.25,
    lightBgOpacity: 0.45,
    darkBorderOpacity: 0.15,
    lightBorderOpacity: 0.12,
    strength: 0.10,
    chromaticAberration: 0.45,
    curvature: 0.85,
    depth: 8,
    blur: 0,
    glow: 0.30,
    edgeHighlight: 0.55,
    specular: 1.1,
    specularAngle: 45,
    quality: 256,
  },
};
```

---

## 5. UI Component Integration

### 5.1 `<LiquidGlass>` Core Component
- Accepts `preset: 'header' | 'card' | 'button'`, custom overrides, `className`, and `children`.
- Hosts container, filtered DOM child, SVG defs holder, and background tint layer bound to active theme.

### 5.2 `<LiquidCard>` (`src/components/LiquidCard.tsx`)
- Wraps card children with `<LiquidGlass preset="card">`.
- Retains interactive hover effects, click handlers, accessibility semantics, and layouts across Methodology, Experience, Tech, and Recruiter Stats sections.

### 5.3 `<LiquidButton>` (`src/components/LiquidButton.tsx`)
- Provides unified glass button wrapper supporting `<button>` and `<a>` elements.
- Applied to CTA buttons, header links, language selector trigger, theme toggle, and social icons.

### 5.4 Header Integration (`src/App.tsx`)
- The fixed `<header>` navbar container wraps the inner content with `<LiquidGlass preset="header">`.
- As the user scrolls through hero text and background Three.js water effects, underlying elements are refracted through the navbar with chromatic dispersion and specular highlights.

---

## 6. Verification and Acceptance Criteria

1. **Build Quality:** `npm run build` succeeds without type errors or lint warnings.
2. **Visual Refraction:** Content scrolling under the header and background water canvas visible through cards and buttons exhibits authentic optical displacement and chromatic fringes.
3. **Transparency & Theme Fidelity:** Dark and light modes render cleanly with configured alpha thresholds.
4. **Interactive Responsiveness:** Text remains selectable; buttons, links, and dropdowns retain pointer events and tab navigation.
