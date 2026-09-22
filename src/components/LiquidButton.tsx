import React from "react";
import { LiquidGlass } from "../lib/liquid-glass/index.ts";

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
}

export function LiquidButton({
  children,
  className = "",
  href,
  target,
  rel,
  title,
  onClick,
  type = "button",
  ...props
}: LiquidButtonProps) {
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        title={title}
        className={`liquid-pill group relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 rounded-full cursor-pointer ${className}`}
      >
        <LiquidGlass preset="button" className="w-full h-full rounded-full">
          <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-auto">
            {children}
          </div>
        </LiquidGlass>
      </a>
    );
  }

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      {...props}
      className={`liquid-pill group relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 rounded-full cursor-pointer ${className}`}
    >
      <LiquidGlass preset="button" className="w-full h-full rounded-full">
        <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-auto">
          {children}
        </div>
      </LiquidGlass>
    </button>
  );
}
