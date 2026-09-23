import type React from 'react';
import { twMerge } from 'tailwind-merge';
import { LiquidGlass } from './LiquidGlass.tsx';

export type ButtonVariant = 'prominentGlass' | 'glass' | 'clearGlass' | 'icon' | 'primary' | 'secondary' | 'ghost';
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

export interface LiquidButtonAsLinkProps extends LiquidButtonBaseProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export type LiquidButtonProps = LiquidButtonAsButtonProps | LiquidButtonAsLinkProps;

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm gap-2.5',
  lg: 'px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base gap-3',
};

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'w-8 h-8 p-0',
  md: 'w-10 sm:w-11 h-10 sm:h-11 p-0',
  lg: 'w-12 h-12 p-0',
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
  const isClear = variant === 'clearGlass' || variant === 'ghost';
  const isProminent = variant === 'prominentGlass' || variant === 'primary';
  const isGlass = !isClear;

  const sizeClass = isIcon ? ICON_SIZE_CLASSES[size] : SIZE_CLASSES[size];

  const baseClasses =
    'relative group inline-flex items-center justify-center rounded-full select-none outline-none no-underline transition-all duration-200 active:scale-95 cursor-pointer';

  const glassClasses = isGlass
    ? isProminent
      ? 'border border-[var(--accent)]/40 hover:border-[var(--accent)]/70 text-[var(--accent)] shadow-lg shadow-black/5 dark:shadow-black/30'
      : 'border border-[var(--card-border)] shadow-lg shadow-black/5 dark:shadow-black/30 text-[var(--text-color)] hover:border-[var(--accent)]/40'
    : 'border border-transparent text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--glass-tint-hover)]';

  const combinedClass = twMerge(baseClasses, glassClasses, sizeClass, className);

  const content = (
    <>
      {isGlass && (
        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
          <LiquidGlass preset="header" borderWidth={0} className="w-full h-full rounded-[inherit]" />
          {isProminent && (
            <div className="absolute inset-0 bg-[var(--accent)]/12 dark:bg-[var(--accent)]/15 pointer-events-none transition-colors" />
          )}
          <div className="absolute inset-0 bg-transparent group-hover:bg-[var(--glass-tint-hover)] pointer-events-none transition-colors" />
        </div>
      )}
      <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none">{children}</span>
    </>
  );

  if (href) {
    const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={combinedClass} {...anchorProps}>
        {content}
      </a>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonProps.type ?? 'button'} className={combinedClass} {...buttonProps}>
      {content}
    </button>
  );
}
