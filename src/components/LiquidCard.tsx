import React from "react";
import { LiquidGlass } from "../lib/liquid-glass/index.ts";

interface LiquidCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function LiquidCard({
  children,
  className = "",
  onClick,
}: LiquidCardProps) {
  return (
    <div
      onClick={onClick}
      className={`liquid-card relative overflow-hidden group ${className}`}
    >
      <LiquidGlass preset="card" className="w-full h-full rounded-[inherit]">
        <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-auto">
          {children}
        </div>
      </LiquidGlass>
    </div>
  );
}
