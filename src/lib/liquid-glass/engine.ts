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
