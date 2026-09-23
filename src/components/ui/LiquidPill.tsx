import type React from 'react';

export type PillVariant = 'accent' | 'neutral' | 'outline';
export type PillSize = 'sm' | 'md';

export interface LiquidPillProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: PillVariant;
  size?: PillSize;
  interactive?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<PillVariant, string> = {
  accent: 'liquid-pill-accent',
  neutral: 'liquid-pill-neutral',
  outline: 'liquid-pill-outline',
};

const SIZE_CLASSES: Record<PillSize, string> = {
  sm: 'text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg font-mono',
  md: 'text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-medium',
};

export function LiquidPill({
  children,
  variant = 'neutral',
  size = 'md',
  interactive = false,
  className = '',
  ...props
}: LiquidPillProps) {
  const variantClass = VARIANT_CLASSES[variant];
  const sizeClass = SIZE_CLASSES[size];
  const interactiveClass = interactive
    ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200'
    : 'cursor-default';

  return (
    <div
      {...props}
      className={`liquid-pill gap-1.5 select-none ${variantClass} ${sizeClass} ${interactiveClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
