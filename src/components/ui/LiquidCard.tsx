import type React from 'react';
import { LIQUID_GLASS_CONFIG } from '../../lib/liquid-glass/config.ts';
import { GlassSurface } from './GlassSurface.tsx';

export type CardVariant = 'default' | 'interactive' | 'stat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  onClick?: () => void;
}

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: '',
  sm: 'p-2.5 sm:p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const VARIANT_CONTAINER_CLASSES: Record<CardVariant, string> = {
  default: '',
  interactive: 'hover:scale-[1.015] hover:border-[var(--accent)]/40',
  stat: 'hover:scale-[1.02]',
};

export function LiquidCard({
  children,
  variant = 'default',
  padding = 'none',
  className = '',
  onClick,
  ...props
}: LiquidCardProps) {
  const cfg = LIQUID_GLASS_CONFIG.card;
  const paddingClass = PADDING_CLASSES[padding];
  const variantClass = VARIANT_CONTAINER_CLASSES[variant];

  return (
    <GlassSurface
      borderRadius={cfg.borderRadius}
      backgroundOpacity={cfg.backgroundOpacity}
      blur={cfg.blur}
      saturation={cfg.saturation}
      brightness={cfg.brightness}
      borderWidth={cfg.borderWidth}
      className={`group w-full h-full rounded-2xl transform-gpu transition-all duration-300 ${variantClass} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        onClick={onClick}
        className={`relative z-10 w-full h-full flex flex-col justify-between pointer-events-auto ${paddingClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    </GlassSurface>
  );
}
