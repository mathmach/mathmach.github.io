import React from 'react';
import { LiquidWaterCanvas } from './LiquidWaterCanvas';

interface LiquidCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function LiquidCard({
  children,
  className = '',
  onClick,
  interactive = true,
}: LiquidCardProps) {
  return (
    <div
      onClick={onClick}
      className={`liquid-card relative overflow-hidden group ${className}`}
    >
      {interactive && <LiquidWaterCanvas />}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

