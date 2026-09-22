import {
  forwardRef,
  useRef,
  useLayoutEffect,
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
      const initialW = rect.width > 0 ? rect.width : 200;
      const initialH = rect.height > 0 ? rect.height : 100;

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
