import React from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant =
  | 'prominentGlass'
  | 'glass'
  | 'clearGlass'
  | 'icon'
  | 'primary'
  | 'secondary'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface LiquidButtonBaseProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export interface LiquidButtonAsButtonProps
  extends LiquidButtonBaseProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
}

export interface LiquidButtonAsLinkProps
  extends LiquidButtonBaseProps,
    React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export type LiquidButtonProps = LiquidButtonAsButtonProps | LiquidButtonAsLinkProps;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  prominentGlass: 'liquid-btn-prominent-glass',
  glass: 'liquid-btn-glass',
  clearGlass: 'liquid-btn-clear-glass',
  icon: 'liquid-btn-glass liquid-btn-icon',
  primary: 'liquid-btn-prominent-glass',
  secondary: 'liquid-btn-glass',
  ghost: 'liquid-btn-clear-glass',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm gap-2.5',
  lg: 'px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base gap-3',
};

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'w-8 h-8 leading-none',
  md: 'w-10 sm:w-11 h-10 sm:h-11 leading-none',
  lg: 'w-12 h-12 leading-none',
};

export function LiquidButton({
  children,
  variant = 'glass',
  size = 'md',
  className = '',
  href,
  ...props
}: LiquidButtonProps) {
  const isIcon = variant === 'icon';
  const sizeClass = isIcon ? ICON_SIZE_CLASSES[size] : SIZE_CLASSES[size];
  const variantClass = VARIANT_CLASSES[variant];
  const combinedClass = twMerge(
    'liquid-btn group inline-flex items-center justify-center',
    variantClass,
    sizeClass,
    className
  );

  if (href) {
    const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={combinedClass} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonProps.type ?? 'button'} className={combinedClass} {...buttonProps}>
      {children}
    </button>
  );
}
