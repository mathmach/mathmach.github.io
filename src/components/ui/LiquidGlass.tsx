import { forwardRef, type HTMLAttributes, type ReactNode, useImperativeHandle, useRef } from 'react';
import { type GlassPreset, type GlassStyleConfig, LIQUID_GLASS_CONFIG } from '../../lib/liquid-glass/config.ts';
import { GlassSurface } from './GlassSurface.tsx';

interface LiquidGlassProps extends Partial<GlassStyleConfig>, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  preset?: GlassPreset;
  overflow?: 'hidden' | 'visible' | 'clip' | 'auto';
}

interface LiquidGlassHandle {
  element: HTMLDivElement | null;
}

export const LiquidGlass = forwardRef<LiquidGlassHandle, LiquidGlassProps>(function LiquidGlass(props, ref) {
  const {
    children,
    preset = 'card',
    className = '',
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
});
