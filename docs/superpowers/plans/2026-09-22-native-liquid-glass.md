# Native Liquid Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replicate the optical liquid glass refraction effect from `liquid-glass-web-react` natively in the codebase and apply it across Header, Cards, and Buttons with fixed parameter customization in code.

**Architecture:** A native module in `src/lib/liquid-glass/` implements optical calculations, displacement maps, an SVG filter engine, a centralized configuration file, and React components (`<LiquidGlass>`, `<LiquidCard>`, `<LiquidButton>`) that refract live DOM and background graphics with chromatic dispersion and specular highlights.

**Tech Stack:** React 19, TypeScript, SVG Filters (`feDisplacementMap`, `feGaussianBlur`, `feColorMatrix`, `feComposite`), HTML5 Canvas, Tailwind CSS.

**Spec:** [`docs/superpowers/specs/2026-09-22-native-liquid-glass-design.md`](file:///home/matheus/project-ai/docs/superpowers/specs/2026-09-22-native-liquid-glass-design.md)

## Global Constraints

- Strictly zero comments in code (no explanatory comments, no JSDoc, no TODOs, no block comments).
- Strictly English for all specifications, tests, code, and commit messages.
- Zero external package installation; 100% native replication.
- Zero placeholders (`// ...`, `TODO`, `// rest of implementation`); complete, production-ready code only.
- Strict type-safety across all files (`npm run build` must pass cleanly).

---

### Task 1: Mathematical Core & Types

**Files:**
- Create: `src/lib/liquid-glass/types.ts`
- Create: `src/lib/liquid-glass/math.ts`
- Test: `tests/liquid-glass/math.test.ts`

**Interfaces:**
- Produces:
  - `LiquidGlassOptions`, `DisplacementMapParams`, `LiquidGlassHost` in `types.ts`
  - `erf(x: number): number`, `computeDomeConstants(depth, halfWidth, halfHeight)`, `domeGradient(x, R, scale)` in `math.ts`

- [ ] **Step 1: Write the failing unit test for math functions**

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { erf, computeDomeConstants, domeGradient } from "../../src/lib/liquid-glass/math.ts";

test("erf approximation boundaries", () => {
  assert.equal(erf(0), 0);
  assert.ok(Math.abs(erf(2) - 1) < 0.01);
  assert.ok(Math.abs(erf(-2) - (-1)) < 0.01);
});

test("computeDomeConstants generates valid radii and scales", () => {
  const c = computeDomeConstants(10, 100, 50);
  assert.ok(c.Rx > 100);
  assert.ok(c.Ry > 50);
  assert.ok(c.scaleX > 0);
  assert.ok(c.scaleY > 0);
});

test("domeGradient calculates gradient within cap", () => {
  const c = computeDomeConstants(10, 100, 50);
  const grad = domeGradient(20, c.Rx, c.scaleX);
  assert.ok(grad >= 0);
  assert.ok(Number.isFinite(grad));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/liquid-glass/math.test.ts`  
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `types.ts` and `math.ts`**

`src/lib/liquid-glass/types.ts`:
```typescript
export interface LiquidGlassOptions {
  width: number;
  height: number;
  radius: number | "auto";
  strength: number;
  chromaticAberration: number;
  blur: number;
  depth: number;
  curvature: number;
  splay: number;
  glow: number;
  glowSpread: number;
  glowExponent: number;
  edgeHighlight: number;
  edgeWidth: number;
  edgeExponent: number;
  specular: number;
  specularAngle: number;
  quality: number;
}

export const DEFAULT_OPTIONS: LiquidGlassOptions = {
  width: 160,
  height: 120,
  radius: "auto",
  strength: 0.1,
  chromaticAberration: 0.2,
  blur: 0,
  depth: 10,
  curvature: 0.65,
  splay: 1,
  glow: 0.1,
  glowSpread: 1,
  glowExponent: 1.5,
  edgeHighlight: 0.25,
  edgeWidth: 3,
  edgeExponent: 1.5,
  specular: 1,
  specularAngle: 45,
  quality: 256,
};

export interface DisplacementMapParams {
  size: number;
  halfWidth: number;
  halfHeight: number;
  radius: number;
  depth: number;
  domeDepth: number;
  splay: number;
  glow: number;
  glowSpread: number;
  glowExponent: number;
  edgeHighlight: number;
  edgeWidth: number;
  edgeExponent: number;
  specularAngle: number;
}

export interface LiquidGlassHost {
  container: HTMLElement;
  filtered: HTMLElement;
  defsHost: HTMLElement;
  shadow?: HTMLElement | null;
}
```

`src/lib/liquid-glass/math.ts`:
```typescript
export function erf(x: number): number {
  return Math.tanh(1.7724538509 * x);
}

export interface DomeConstants {
  Rx: number;
  Ry: number;
  scaleX: number;
  scaleY: number;
}

function averageDomeGradient(R: number, half: number): number {
  let sum = 0;
  for (let i = 0; i <= 200; i++) {
    const s = (i / 200) * half;
    const v = s / Math.sqrt(R * R - s * s);
    sum += i === 0 || i === 200 ? 0.5 * v : v;
  }
  return sum / 200;
}

export function computeDomeConstants(
  depth: number,
  halfWidth: number,
  halfHeight: number,
): DomeConstants {
  const d = Math.max(0.01, Math.min(depth, Math.min(halfWidth, halfHeight) - 1));
  const Rx = (halfWidth * halfWidth + d * d) / (2 * d);
  const Ry = (halfHeight * halfHeight + d * d) / (2 * d);
  const gx = averageDomeGradient(Rx, halfWidth);
  const gy = averageDomeGradient(Ry, halfHeight);
  return {
    Rx,
    Ry,
    scaleX: gx > 0 ? 0.5 / gx : 1,
    scaleY: gy > 0 ? 0.5 / gy : 1,
  };
}

export function domeGradient(x: number, R: number, scale: number): number {
  const s = Math.min(x, 0.999 * R);
  return (s / Math.sqrt(R * R - s * s)) * scale;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/liquid-glass/math.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/liquid-glass/types.ts src/lib/liquid-glass/math.ts tests/liquid-glass/math.test.ts
git commit -m "feat(liquid-glass): implement core mathematical functions and type definitions"
```

---

### Task 2: Displacement Map Generator

**Files:**
- Create: `src/lib/liquid-glass/displacementMap.ts`
- Test: `tests/liquid-glass/displacementMap.test.ts`

**Interfaces:**
- Consumes: `computeDomeConstants`, `domeGradient`, `erf` from `./math.ts` and `DisplacementMapParams` from `./types.ts`
- Produces: `computeDisplacementMap(p: DisplacementMapParams): Uint8ClampedArray`, `renderDisplacementMap(p: DisplacementMapParams, canvas?: HTMLCanvasElement): string`

- [ ] **Step 1: Write unit test for displacement map buffer generation**

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { computeDisplacementMap } from "../../src/lib/liquid-glass/displacementMap.ts";

test("computeDisplacementMap generates RGBA buffer with neutral boundary", () => {
  const size = 64;
  const buffer = computeDisplacementMap({
    size,
    halfWidth: 32,
    halfHeight: 20,
    radius: 8,
    depth: 4,
    domeDepth: 4,
    splay: 1,
    glow: 0.2,
    glowSpread: 1,
    glowExponent: 1.5,
    edgeHighlight: 0.3,
    edgeWidth: 2,
    edgeExponent: 1.5,
    specularAngle: 45,
  });

  assert.equal(buffer.length, size * size * 4);
  assert.equal(buffer[0], 128);
  assert.equal(buffer[1], 128);
  assert.equal(buffer[2], 128);
  assert.equal(buffer[3], 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/liquid-glass/displacementMap.test.ts`  
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `displacementMap.ts`**

`src/lib/liquid-glass/displacementMap.ts`:
```typescript
import { computeDomeConstants, domeGradient, erf } from "./math.ts";
import type { DisplacementMapParams } from "./types.ts";

export function computeDisplacementMap(p: DisplacementMapParams): Uint8ClampedArray {
  const size = p.size;
  const half = size >> 1;
  const data = new Uint8ClampedArray(size * size * 4);

  const hw = p.halfWidth;
  const hh = p.halfHeight;

  const cornerR = Math.min(p.radius, Math.min(hw, hh));
  const innerW = Math.max(0, hw - p.depth);
  const innerH = Math.max(0, hh - p.depth);
  const innerR = Math.max(0, Math.min(p.radius, Math.min(innerW, innerH)));
  const falloffK = p.depth > 0 ? 1 / (p.depth * Math.SQRT2) : 1e6;

  const hasSpecular = p.glow > 0 || p.edgeHighlight > 0;
  const theta = (p.specularAngle * Math.PI) / 180;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const glowLo = (1 - p.glowSpread) * Math.SQRT2;
  const glowRange = p.glowSpread * Math.SQRT2;
  const glowInv = glowRange > 0.001 ? 1 / glowRange : 0;
  const edgeInv = p.edgeWidth > 0 ? 1 / p.edgeWidth : 0;

  const stepX = (2 * hw) / size;
  const stepY = (2 * hh) / size;
  const invW = 1 / hw;
  const invH = 1 / hh;

  const dome = p.domeDepth > 0 ? computeDomeConstants(p.domeDepth, hw, hh) : null;
  let domeColumns: Float32Array | null = null;
  if (dome) {
    domeColumns = new Float32Array(half);
    const rr = dome.Rx * dome.Rx;
    const cap = 0.999 * dome.Rx;
    for (let c = 0; c < half; c++) {
      const ax = -((c + 0.5) * stepX - hw);
      const s = ax < cap ? ax : cap;
      domeColumns[c] = (s / Math.sqrt(rr - s * s)) * dome.scaleX;
    }
  }

  const doSplay = p.splay < 1;
  const splayMix = 1 - p.splay;
  const splayHalf = 0.5 * Math.min(hw, hh);
  const splayInv = splayHalf > 0 ? 1 / splayHalf : 0;

  for (let row = 0; row < half; row++) {
    const mirrorRow = size - 1 - row;
    const ay = -((row + 0.5) * stepY - hh);
    const sdfY = ay - hh + cornerR;
    const fallY = ay - innerH + innerR;
    const gradY = dome
      ? domeGradient(ay, dome.Ry, dome.scaleY)
      : ay * invH > 1
        ? 1
        : ay * invH;
    const clampY = ay * invH > 1 ? 1 : ay * invH;
    const splayY = doSplay ? Math.max(0, 1 - (hh - ay) * splayInv) : 0;

    for (let col = 0; col < half; col++) {
      const mirrorCol = size - 1 - col;
      const ax = -((col + 0.5) * stepX - hw);
      const sdfX = ax - hw + cornerR;

      const ox = sdfX > 0 ? sdfX : 0;
      const oy = sdfY > 0 ? sdfY : 0;
      const oo = ox * ox + oy * oy;
      const sdf =
        (oo > 0 ? Math.sqrt(oo) : 0) +
        (sdfX > sdfY ? (sdfX > 0 ? 0 : sdfX) : sdfY > 0 ? 0 : sdfY) -
        cornerR;

      const iTL = (row * size + col) * 4;
      const iTR = (row * size + mirrorCol) * 4;
      const iBL = (mirrorRow * size + col) * 4;
      const iBR = (mirrorRow * size + mirrorCol) * 4;

      if (sdf >= 0) {
        data[iTL] = data[iTL + 1] = data[iTL + 2] = 128;
        data[iTR] = data[iTR + 1] = data[iTR + 2] = 128;
        data[iBL] = data[iBL + 1] = data[iBL + 2] = 128;
        data[iBR] = data[iBR + 1] = data[iBR + 2] = 128;
        data[iTL + 3] = data[iTR + 3] = data[iBL + 3] = data[iBR + 3] = 0;
        continue;
      }

      let dispX = dome && domeColumns ? domeColumns[col] : ax * invW > 1 ? 1 : ax * invW;
      let dispY = gradY;

      if (doSplay) {
        const attX = splayY * splayMix;
        const attY = Math.max(0, 1 - (hw - ax) * splayInv) * splayMix;
        if (attX > 0.001 || attY > 0.001) {
          const x0 = dispX;
          const y0 = dispY;
          dispX = x0 * (1 - attX);
          dispY = y0 * (1 - attY);
          const m0 = Math.sqrt(x0 * x0 + y0 * y0);
          const m1 = Math.sqrt(dispX * dispX + dispY * dispY);
          if (m1 > 0.001) {
            const k = m0 / m1;
            dispX *= k;
            dispY *= k;
          }
        }
      }

      const ex = ax - innerW + innerR;
      const rx = ex > 0 ? ex : 0;
      const ry = fallY > 0 ? fallY : 0;
      const innerSdf =
        Math.sqrt(rx * rx + ry * ry) +
        (ex > fallY ? (ex > 0 ? 0 : ex) : fallY > 0 ? 0 : fallY) -
        innerR;
      const fall = 0.5 * (1 + erf(innerSdf * falloffK));

      const hx = 0.5 * dispX * fall;
      const hy = 0.5 * dispY * fall;
      const rPlus = ((0.5 + hx) * 255 + 0.5) | 0;
      const rMinus = ((0.5 - hx) * 255 + 0.5) | 0;
      const gPlus = ((0.5 + hy) * 255 + 0.5) | 0;
      const gMinus = ((0.5 - hy) * 255 + 0.5) | 0;

      let bSum = 128;
      let bDiff = 128;
      if (hasSpecular) {
        const px = (ax * invW > 1 ? 1 : ax * invW) * cosT;
        const py = clampY * sinT;
        const projSum = Math.abs(px + py);
        const projDiff = Math.abs(px - py);

        let band = 0;
        if (p.edgeHighlight > 0) {
          band = 1 + sdf * edgeInv;
          if (band < 0) band = 0;
        }

        let vSum = 0;
        let vDiff = 0;
        if (p.glow > 0) {
          const tS = (projSum - glowLo) * glowInv;
          vSum += p.glow * Math.pow(tS < 0 ? 0 : tS > 1 ? 1 : tS, p.glowExponent) * fall;
          const tD = (projDiff - glowLo) * glowInv;
          vDiff += p.glow * Math.pow(tD < 0 ? 0 : tD > 1 ? 1 : tD, p.glowExponent) * fall;
        }
        if (p.edgeHighlight > 0) {
          vSum += p.edgeHighlight * band * Math.pow(projSum, p.edgeExponent);
          vDiff += p.edgeHighlight * band * Math.pow(projDiff, p.edgeExponent);
        }
        if (vSum > 1) vSum = 1;
        if (vDiff > 1) vDiff = 1;
        bSum = (127 * vSum + 128 + 0.5) | 0;
        bDiff = (127 * vDiff + 128 + 0.5) | 0;
      }

      data[iTL] = rPlus;
      data[iTL + 1] = gPlus;
      data[iTL + 2] = bSum;
      data[iTL + 3] = 255;
      data[iTR] = rMinus;
      data[iTR + 1] = gPlus;
      data[iTR + 2] = bDiff;
      data[iTR + 3] = 255;
      data[iBL] = rPlus;
      data[iBL + 1] = gMinus;
      data[iBL + 2] = bDiff;
      data[iBL + 3] = 255;
      data[iBR] = rMinus;
      data[iBR + 1] = gMinus;
      data[iBR + 2] = bSum;
      data[iBR + 3] = 255;
    }
  }

  return data;
}

export function renderDisplacementMap(
  p: DisplacementMapParams,
  canvas: HTMLCanvasElement = document.createElement("canvas"),
): string {
  canvas.width = p.size;
  canvas.height = p.size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(p.size, p.size);
  image.data.set(computeDisplacementMap(p));
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test tests/liquid-glass/displacementMap.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/liquid-glass/displacementMap.ts tests/liquid-glass/displacementMap.test.ts
git commit -m "feat(liquid-glass): implement displacement map calculation and canvas rendering"
```

---

### Task 3: SVG Filter Engine

**Files:**
- Create: `src/lib/liquid-glass/engine.ts`

**Interfaces:**
- Consumes: `renderDisplacementMap`, `DEFAULT_OPTIONS`, `LiquidGlassOptions`, `LiquidGlassHost`
- Produces: `LiquidGlassEngine` class managing SVG filters and DOM binding

- [ ] **Step 1: Implement `engine.ts`**

`src/lib/liquid-glass/engine.ts`:
```typescript
import { renderDisplacementMap } from "./displacementMap.ts";
import { DEFAULT_OPTIONS, type LiquidGlassOptions, type LiquidGlassHost } from "./types.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

let instanceCounter = 0;

const UA = typeof navigator !== "undefined" ? navigator.userAgent : "";
const IS_IOS =
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(UA) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
const IS_SAFARI = IS_IOS || /^((?!chrome|chromium|android).)*safari/i.test(UA);

function fe(name: string, attrs: Record<string, string | number>): SVGElement {
  const el = document.createElementNS(SVG_NS, name);
  for (const key of Object.keys(attrs)) el.setAttribute(key, String(attrs[key]));
  return el;
}

export class LiquidGlassEngine {
  private host: LiquidGlassHost;
  private options: LiquidGlassOptions;

  private filterEl: SVGElement | null = null;
  private feImageEl: SVGElement | null = null;
  private lensRegionEls: SVGElement[] = [];
  private dispEls: SVGElement[] = [];
  private blurEl: SVGElement | null = null;
  private specularEl: SVGElement | null = null;

  private x = 0.5;
  private y = 0.5;
  private mapUrl = "";
  private mapCanvas: HTMLCanvasElement | null = null;

  private readonly id: string;
  private version = 0;
  private regenQueued = false;
  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;

  onMap: ((url: string) => void) | null = null;

  constructor(host: LiquidGlassHost, options?: Partial<LiquidGlassOptions>) {
    this.host = host;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.id = `liquid-glass-lens-${++instanceCounter}`;

    this.buildFilter();
    this.regenerate();

    this.resizeObserver = new ResizeObserver(() => this.update());
    this.resizeObserver.observe(host.container);
    if (host.filtered !== host.container) this.resizeObserver.observe(host.filtered);
  }

  setPosition(x: number, y: number): void {
    this.x = Math.min(1, Math.max(0, x));
    this.y = Math.min(1, Math.max(0, y));
    this.update();
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getMapUrl(): string {
    return this.mapUrl;
  }

  setOptions(partial: Partial<LiquidGlassOptions>): void {
    const prev = this.options;
    const next = { ...prev, ...partial };
    this.options = next;

    const needsRegen = (
      [
        "width",
        "height",
        "radius",
        "depth",
        "curvature",
        "splay",
        "glow",
        "glowSpread",
        "glowExponent",
        "edgeHighlight",
        "edgeWidth",
        "edgeExponent",
        "specularAngle",
        "quality",
      ] as const
    ).some((key) => prev[key] !== next[key]);

    if (needsRegen) this.scheduleRegenerate();
    else this.update();
  }

  getOptions(): LiquidGlassOptions {
    return { ...this.options };
  }

  refresh(): void {
    this.update();
  }

  destroy(): void {
    this.destroyed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.host.filtered.style.filter = "";
    this.host.defsHost.replaceChildren();
    if (this.mapCanvas) {
      this.mapCanvas.width = 0;
      this.mapCanvas.height = 0;
      this.mapCanvas = null;
    }
  }

  private get halfWidth(): number {
    return this.options.width / 2;
  }

  private get halfHeight(): number {
    return this.options.height / 2;
  }

  private get cornerRadius(): number {
    const { radius } = this.options;
    const max = Math.min(this.halfWidth, this.halfHeight);
    return radius === "auto" ? max : Math.min(radius, max);
  }

  private buildFilter(): void {
    const units = IS_IOS ? "userSpaceOnUse" : "objectBoundingBox";
    const filter = fe("filter", {
      filterUnits: units,
      primitiveUnits: units,
      "color-interpolation-filters": "sRGB",
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });

    filter.appendChild(
      fe("feFlood", { "flood-color": "rgb(128,128,128)", "flood-opacity": 1, result: "mapBg" }),
    );
    this.feImageEl = fe("feImage", {
      "data-lens": "",
      preserveAspectRatio: "none",
      result: "rawMap",
    });
    filter.appendChild(this.feImageEl);
    filter.appendChild(fe("feComposite", { in: "rawMap", in2: "mapBg", operator: "over", result: "map" }));

    this.blurEl = fe("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "0 0", result: "blurred" });
    filter.appendChild(this.blurEl);

    const channelMatrices = [
      "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
      "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
      "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
    ];
    const results = ["dispR", "dispG", "dispB"];
    for (let i = 0; i < 3; i++) {
      filter.appendChild(
        fe("feDisplacementMap", {
          "data-lens": "",
          in: "SourceGraphic",
          in2: "map",
          scale: 0,
          xChannelSelector: "R",
          yChannelSelector: "G",
        }),
      );
      filter.appendChild(fe("feColorMatrix", { type: "matrix", values: channelMatrices[i], result: results[i] }));
    }
    filter.appendChild(
      fe("feComposite", { in: "dispR", in2: "dispG", operator: "arithmetic", k1: 0, k2: 1, k3: 1, k4: 0 }),
    );
    filter.appendChild(
      fe("feComposite", { in2: "dispB", operator: "arithmetic", k1: 0, k2: 1, k3: 1, k4: 0, result: "lensResult" }),
    );

    filter.appendChild(
      fe("feColorMatrix", {
        in: IS_SAFARI ? "rawMap" : "map",
        type: "matrix",
        values: `0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 ${-128 / 255}`,
        result: "specMask",
      }),
    );
    this.specularEl = fe("feComposite", {
      in: "specMask",
      in2: "lensResult",
      operator: "arithmetic",
      k1: 0,
      k2: this.options.specular,
      k3: 1,
      k4: 0,
      result: "lensResult",
    });
    filter.appendChild(this.specularEl);

    filter.appendChild(
      fe("feColorMatrix", {
        in: "rawMap",
        type: "matrix",
        values: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
        result: "lensShape",
      }),
    );
    filter.appendChild(
      fe("feComposite", { in: "lensResult", in2: "lensShape", operator: "in", result: "lensResult" }),
    );
    filter.appendChild(fe("feComposite", { in: "SourceGraphic", in2: "lensShape", operator: "out", result: "holedSG" }));
    filter.appendChild(fe("feComposite", { in: "lensResult", in2: "holedSG", operator: "over" }));

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    const defs = document.createElementNS(SVG_NS, "defs");
    defs.appendChild(filter);
    svg.appendChild(defs);
    this.host.defsHost.replaceChildren(svg);

    this.filterEl = filter;
    this.lensRegionEls = Array.from(filter.querySelectorAll("[data-lens]"));
    this.dispEls = Array.from(filter.querySelectorAll("feDisplacementMap"));
  }

  private scheduleRegenerate(): void {
    if (this.regenQueued) return;
    this.regenQueued = true;
    this.rafId = requestAnimationFrame(() => {
      this.regenQueued = false;
      this.rafId = null;
      if (!this.destroyed) this.regenerate();
    });
  }

  private regenerate(): void {
    const o = this.options;
    const hw = this.halfWidth;
    const hh = this.halfHeight;
    if (!this.mapCanvas) this.mapCanvas = document.createElement("canvas");

    this.mapUrl = renderDisplacementMap(
      {
        size: o.quality,
        halfWidth: hw,
        halfHeight: hh,
        radius: this.cornerRadius,
        depth: o.depth,
        domeDepth: Math.max(0, Math.min(1, o.curvature)) * Math.min(hw, hh),
        splay: o.splay,
        glow: o.glow,
        glowSpread: o.glowSpread,
        glowExponent: o.glowExponent,
        edgeHighlight: o.edgeHighlight,
        edgeWidth: o.edgeWidth,
        edgeExponent: o.edgeExponent,
        specularAngle: o.specularAngle,
      },
      this.mapCanvas,
    );
    this.feImageEl?.setAttribute("href", this.mapUrl);
    this.onMap?.(this.mapUrl);
    this.update();
  }

  private update(): void {
    if (!this.filterEl || this.destroyed) return;
    const rect = this.host.filtered.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    if (W <= 0 || H <= 0) return;

    const o = this.options;
    const hw = this.halfWidth;
    const hh = this.halfHeight;
    const left = this.x * W - hw;
    const top = this.y * H - hh;
    const bias = 0.5;

    const sx = IS_IOS ? 1 : 1 / W;
    const sy = IS_IOS ? 1 : 1 / H;
    if (IS_IOS) {
      this.filterEl.setAttribute("width", String(W));
      this.filterEl.setAttribute("height", String(H));
    }

    const fx = String((left + bias) * sx);
    const fy = String((top + bias) * sy);
    const fw = String(Math.max(0, 2 * hw - 2 * bias) * sx);
    const fh = String(Math.max(0, 2 * hh - 2 * bias) * sy);
    for (const el of this.lensRegionEls) {
      el.setAttribute("x", fx);
      el.setAttribute("y", fy);
      el.setAttribute("width", fw);
      el.setAttribute("height", fh);
    }

    const s = IS_IOS
      ? (o.strength * Math.sqrt(W * W + H * H)) / Math.SQRT2
      : o.strength;
    const c = o.chromaticAberration;
    const scales = [s * (1 + 0.2 * c), s * (1 + 0.1 * c), s];
    const blurInput = o.blur > 0 ? "blurred" : "SourceGraphic";
    for (let i = 0; i < this.dispEls.length; i++) {
      this.dispEls[i].setAttribute("scale", String(scales[i]));
      this.dispEls[i].setAttribute("in", blurInput);
    }
    this.blurEl?.setAttribute(
      "stdDeviation",
      IS_IOS ? `${o.blur} ${o.blur}` : `${o.blur / W} ${o.blur / H}`,
    );
    this.specularEl?.setAttribute("k2", String(o.specular));

    if (IS_SAFARI) {
      this.filterEl.id = `${this.id}-v${++this.version}`;
      this.host.filtered.style.filter = `url(#${this.filterEl.id})`;
    } else if (!this.filterEl.id) {
      this.filterEl.id = this.id;
      this.host.filtered.style.filter = `url(#${this.id})`;
    }

    const shadow = this.host.shadow;
    if (shadow) {
      let ox = 0;
      let oy = 0;
      if (this.host.filtered !== this.host.container) {
        const crect = this.host.container.getBoundingClientRect();
        ox = rect.left - crect.left;
        oy = rect.top - crect.top;
      }
      shadow.style.transform = `translate(${ox + left}px, ${oy + top}px)`;
      shadow.style.width = `${2 * hw}px`;
      shadow.style.height = `${2 * hh}px`;
      shadow.style.borderRadius = `${this.cornerRadius}px`;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/liquid-glass/engine.ts
git commit -m "feat(liquid-glass): implement native SVG filter engine with chromatic aberration and specular reflection"
```

---

### Task 4: Configuration Module & Core React Component

**Files:**
- Create: `src/lib/liquid-glass/config.ts`
- Create: `src/lib/liquid-glass/LiquidGlass.tsx`
- Create: `src/lib/liquid-glass/index.ts`

**Interfaces:**
- Produces: `LIQUID_GLASS_CONFIG`, `<LiquidGlass>` component, exported from `src/lib/liquid-glass`

- [ ] **Step 1: Implement `config.ts`**

`src/lib/liquid-glass/config.ts`:
```typescript
import { type LiquidGlassOptions } from "./types.ts";

export interface LiquidGlassPresetConfig extends Partial<LiquidGlassOptions> {
  darkBgOpacity: number;
  lightBgOpacity: number;
  darkBorderOpacity: number;
  lightBorderOpacity: number;
}

export type GlassPreset = "header" | "card" | "button";

export const LIQUID_GLASS_CONFIG: Record<GlassPreset, LiquidGlassPresetConfig> = {
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

- [ ] **Step 2: Implement `LiquidGlass.tsx` and `index.ts`**

`src/lib/liquid-glass/LiquidGlass.tsx`:
```typescript
import React, {
  forwardRef,
  useRef,
  useLayoutEffect,
  useEffect,
  useImperativeHandle,
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
} from "react";
import { LiquidGlassEngine } from "./engine.ts";
import { LIQUID_GLASS_CONFIG, type GlassPreset } from "./config.ts";
import { type LiquidGlassOptions } from "./types.ts";

export interface LiquidGlassProps
  extends Partial<LiquidGlassOptions>,
    Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  preset?: GlassPreset;
  tintClassName?: string;
  shadow?: boolean | string;
}

export interface LiquidGlassHandle {
  element: HTMLDivElement | null;
  engine: LiquidGlassEngine | null;
}

export const LiquidGlass = forwardRef<LiquidGlassHandle, LiquidGlassProps>(
  function LiquidGlass(props, ref) {
    const {
      children,
      preset = "card",
      tintClassName = "",
      shadow = true,
      style,
      className = "",
      ...overrideOptions
    } = props;

    const presetConfig = LIQUID_GLASS_CONFIG[preset];

    const containerRef = useRef<HTMLDivElement>(null);
    const filteredRef = useRef<HTMLDivElement>(null);
    const defsRef = useRef<HTMLDivElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<LiquidGlassEngine | null>(null);

    useLayoutEffect(() => {
      const container = containerRef.current;
      const filtered = filteredRef.current;
      const defsHost = defsRef.current;
      if (!container || !filtered || !defsHost) return;

      const rect = container.getBoundingClientRect();
      const initialW = rect.width || 200;
      const initialH = rect.height || 100;

      const combinedOptions: Partial<LiquidGlassOptions> = {
        width: initialW,
        height: initialH,
        radius: presetConfig.radius ?? "auto",
        strength: presetConfig.strength,
        chromaticAberration: presetConfig.chromaticAberration,
        curvature: presetConfig.curvature,
        depth: presetConfig.depth,
        blur: presetConfig.blur,
        glow: presetConfig.glow,
        edgeHighlight: presetConfig.edgeHighlight,
        specular: presetConfig.specular,
        specularAngle: presetConfig.specularAngle,
        quality: presetConfig.quality,
        ...overrideOptions,
      };

      const engine = new LiquidGlassEngine(
        { container, filtered, defsHost, shadow: shadowRef.current },
        combinedOptions,
      );
      engine.setPosition(0.5, 0.5);
      engineRef.current = engine;

      const ro = new ResizeObserver(() => {
        const r = container.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          engine.setOptions({ width: r.width, height: r.height });
          engine.setPosition(0.5, 0.5);
        }
      });
      ro.observe(container);

      return () => {
        ro.disconnect();
        engine.destroy();
        engineRef.current = null;
      };
    }, [preset]);

    useImperativeHandle(ref, () => ({
      get element() {
        return containerRef.current;
      },
      get engine() {
        return engineRef.current;
      },
    }));

    const containerStyle: CSSProperties = {
      position: "relative",
      ...style,
    };

    return (
      <div
        ref={containerRef}
        data-liquid-glass=""
        style={containerStyle}
        className={`liquid-glass-wrapper relative ${className}`}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-[inherit] pointer-events-none transition-colors ${tintClassName}`}
          style={{
            backgroundColor: `var(--liquid-tint-${preset})`,
            borderColor: `var(--liquid-border-${preset})`,
          }}
        />
        <div ref={filteredRef} className="relative z-10 w-full h-full" style={{ willChange: "filter" }}>
          {children}
        </div>
        <div ref={defsRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true" />
      </div>
    );
  },
);
```

`src/lib/liquid-glass/index.ts`:
```typescript
export * from "./types.ts";
export * from "./math.ts";
export * from "./displacementMap.ts";
export * from "./engine.ts";
export * from "./config.ts";
export * from "./LiquidGlass.tsx";
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/liquid-glass/config.ts src/lib/liquid-glass/LiquidGlass.tsx src/lib/liquid-glass/index.ts
git commit -m "feat(liquid-glass): add configuration module and React wrapper component"
```

---

### Task 5: Integrate Liquid Glass into Cards

**Files:**
- Modify: `src/components/LiquidCard.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `<LiquidGlass>` from `@/lib/liquid-glass`
- Produces: Enhanced `<LiquidCard>` with real optical refraction

- [ ] **Step 1: Refactor `src/components/LiquidCard.tsx`**

Replace `src/components/LiquidCard.tsx` with:
```typescript
import React from "react";
import { LiquidGlass } from "../lib/liquid-glass/index.ts";

interface LiquidCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function LiquidCard({
  children,
  className = "",
  onClick,
}: LiquidCardProps) {
  return (
    <div onClick={onClick} className={`relative overflow-hidden group ${className}`}>
      <LiquidGlass preset="card" className="w-full h-full rounded-[inherit]">
        <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-auto">
          {children}
        </div>
      </LiquidGlass>
    </div>
  );
}
```

- [ ] **Step 2: Add CSS variables for glass presets in `src/index.css`**

Add in `src/index.css`:
```css
:root {
  --liquid-tint-header: rgba(255, 255, 255, 0.40);
  --liquid-border-header: rgba(0, 0, 0, 0.10);
  --liquid-tint-card: rgba(255, 255, 255, 0.50);
  --liquid-border-card: rgba(0, 0, 0, 0.08);
  --liquid-tint-button: rgba(255, 255, 255, 0.45);
  --liquid-border-button: rgba(0, 0, 0, 0.12);
}

.dark {
  --liquid-tint-header: rgba(18, 18, 22, 0.20);
  --liquid-border-header: rgba(255, 255, 255, 0.12);
  --liquid-tint-card: rgba(18, 18, 22, 0.30);
  --liquid-border-card: rgba(255, 255, 255, 0.10);
  --liquid-tint-button: rgba(18, 18, 22, 0.25);
  --liquid-border-button: rgba(255, 255, 255, 0.15);
}
```

- [ ] **Step 3: Test build**

Run: `npm run build`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/LiquidCard.tsx src/index.css
git commit -m "feat(cards): integrate native liquid glass refraction into LiquidCard"
```

---

### Task 6: Create LiquidButton & Integrate Liquid Glass on Header & Buttons

**Files:**
- Create: `src/components/LiquidButton.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `<LiquidGlass>` from `@/lib/liquid-glass`
- Produces: `<LiquidButton>` component and full `<header>` and action button liquid glass integration

- [ ] **Step 1: Implement `src/components/LiquidButton.tsx`**

`src/components/LiquidButton.tsx`:
```typescript
import React from "react";
import { LiquidGlass } from "../lib/liquid-glass/index.ts";

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function LiquidButton({
  children,
  className = "",
  ...props
}: LiquidButtonProps) {
  return (
    <button
      {...props}
      className={`liquid-pill group relative overflow-hidden transition-all duration-300 rounded-full cursor-pointer ${className}`}
    >
      <LiquidGlass preset="button" className="w-full h-full rounded-full">
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {children}
        </div>
      </LiquidGlass>
    </button>
  );
}
```

- [ ] **Step 2: Update `src/App.tsx` to use `<LiquidGlass preset="header">` on the navigation bar and wrap buttons**

In `src/App.tsx`:
- Import `LiquidGlass` from `./lib/liquid-glass/index.ts`.
- Wrap the floating navigation bar with `<LiquidGlass preset="header" className="rounded-full shadow-lg shadow-black/5 dark:shadow-black/30 border border-[var(--card-border)]">`.
- Apply `<LiquidGlass preset="button">` to CTA buttons, language switch, theme toggle, and social buttons.

- [ ] **Step 3: Test build**

Run: `npm run build`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/LiquidButton.tsx src/App.tsx
git commit -m "feat(ui): integrate native liquid glass refraction into header and interactive buttons"
```

---

### Task 7: Full Verification and Quality Gate

**Files:**
- Entire codebase

- [ ] **Step 1: Run unit tests**

Run: `node --experimental-strip-types --test tests/liquid-glass/*.test.ts`  
Expected: All tests PASS.

- [ ] **Step 2: Run TypeScript and Vite production build**

Run: `npm run build`  
Expected: Zero type errors, clean build in `dist/`.

- [ ] **Step 3: Commit and verify git clean state**

```bash
git status
```
Expected: Clean working tree.
