import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { GlassSurface } from "./GlassSurface.tsx";
import { LIQUID_GLASS_CONFIG, type GlassPreset, type GlassStyleConfig } from "../../lib/liquid-glass/config.ts";

interface LiquidGlassProps
  extends Partial<GlassStyleConfig>,
    Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children?: ReactNode;
  preset?: GlassPreset;
  overflow?: 'hidden' | 'visible' | 'clip' | 'auto';
}

interface LiquidGlassHandle {
  element: HTMLDivElement | null;
}

export const LiquidGlass = forwardRef<LiquidGlassHandle, LiquidGlassProps>(
  function LiquidGlass(props, ref) {
    const {
      children,
      preset = "card",
      className = "",
      style,
      backgroundOpacity,
      blur,
      saturation,
      brightness,
      borderRadius,
      borderWidth,
      overflow,
      ...rest
    } = props;

    const presetConfig = LIQUID_GLASS_CONFIG[preset];
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      get element() {
        return containerRef.current;
      },
    }));

    return (
      <div ref={containerRef} className={className} style={style} {...rest}>
        <GlassSurface
          borderRadius={borderRadius ?? presetConfig.borderRadius}
          borderWidth={borderWidth ?? presetConfig.borderWidth}
          backgroundOpacity={backgroundOpacity ?? presetConfig.backgroundOpacity}
          blur={blur ?? presetConfig.blur}
          saturation={saturation ?? presetConfig.saturation}
          brightness={brightness ?? presetConfig.brightness}
          overflow={overflow ?? (preset === 'header' ? 'visible' : 'hidden')}
          className="w-full h-full rounded-[inherit]"
        >
          {children}
        </GlassSurface>
      </div>
    );
  },
);
