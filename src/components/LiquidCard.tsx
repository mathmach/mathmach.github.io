import React from 'react';
import { LiquidWave } from './LiquidWave';

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
      {interactive && <LiquidWave />}
      <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
