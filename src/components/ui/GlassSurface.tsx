import type React from 'react';
import { useRef } from 'react';

interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  backgroundOpacity?: number;
  saturation?: number;
  blur?: number;
  shadow?: boolean | string;
  overflow?: 'hidden' | 'visible' | 'clip' | 'auto';
  className?: string;
  style?: React.CSSProperties;
}

export function GlassSurface({
  children,
  width,
  height,
  borderRadius = 24,
  borderWidth = 1,
  brightness = 1.05,
  opacity = 1,
  backgroundOpacity = 0.25,
  saturation = 1.8,
  blur = 20,
  shadow = false,
  overflow = 'hidden',
  className = '',
  style = {},
}: GlassSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const darkBg = `rgba(18, 18, 26, ${backgroundOpacity})`;
  const lightBg = `rgba(255, 255, 255, ${backgroundOpacity})`;

  const extraShadowDark =
    typeof shadow === 'string' ? `, ${shadow}` : shadow ? ', 0 20px 48px -12px rgba(0, 0, 0, 0.75)' : '';

  const extraShadowLight =
    typeof shadow === 'string' ? `, ${shadow}` : shadow ? ', 0 8px 32px -4px rgba(15, 23, 42, 0.06)' : '';

  const shadowLight = `inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.02)${extraShadowLight}`;
  const shadowDark = `inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.22), inset 0 0 18px 0 rgba(255, 255, 255, 0.02)${extraShadowDark}`;

  const containerStyles: React.CSSProperties = {
    ['--glass-bg-light' as any]: lightBg,
    ['--glass-bg-dark' as any]: darkBg,
    ['--glass-border-w' as any]: `${borderWidth}px`,
    ['--glass-shadow-light' as any]: shadowLight,
    ['--glass-shadow-dark' as any]: shadowDark,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    opacity,
    backdropFilter: `blur(${blur}px) saturate(${saturation}) brightness(${brightness})`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}) brightness(${brightness})`,
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`glass-surface-base relative ${overflow === 'visible' ? 'overflow-visible' : 'overflow-hidden'} ${className}`}
      style={containerStyles}
    >
      <div className="relative z-10 w-full h-full pointer-events-auto">{children}</div>
    </div>
  );
}
