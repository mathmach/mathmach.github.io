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
