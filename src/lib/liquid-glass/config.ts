export interface GlassStyleConfig {
  backgroundOpacity: number;
  blur: number;
  saturation: number;
  brightness: number;
  borderRadius: number;
  borderWidth: number;
}

export type GlassPreset = 'header' | 'card' | 'button';

export const LIQUID_GLASS_CONFIG: Record<GlassPreset, GlassStyleConfig> = {
  header: {
    backgroundOpacity: 0.35,
    blur: 24,
    saturation: 1.8,
    brightness: 1.04,
    borderRadius: 9999,
    borderWidth: 1,
  },
  card: {
    backgroundOpacity: 0.45,
    blur: 24,
    saturation: 1.8,
    brightness: 1.04,
    borderRadius: 24,
    borderWidth: 1,
  },
  button: {
    backgroundOpacity: 0.35,
    blur: 24,
    saturation: 1.8,
    brightness: 1.04,
    borderRadius: 9999,
    borderWidth: 1,
  },
};

interface LiquidEffectConfig {
  imageUrl?: string;
  displacementScale?: number;
  viscosity?: number;
  rain?: boolean;
}

export const LIQUID_EFFECT_CONFIG: LiquidEffectConfig = {
  imageUrl: '/images/liquid-effect.jpg',
  displacementScale: 4.0,
  viscosity: 0.98,
  rain: false,
};
