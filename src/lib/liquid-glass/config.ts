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
