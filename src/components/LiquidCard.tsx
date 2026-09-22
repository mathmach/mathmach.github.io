import React from 'react';

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
}: LiquidCardProps) {
  return (
    <div
      onClick={onClick}
      className={`liquid-card relative overflow-hidden group ${className}`}
    >
      <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
