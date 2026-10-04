// src/components/common/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  height = 'md',
  showLabel = false,
  className = ''
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }[height];

  const defaultGradient = 'bg-gradient-to-r from-[#d4af37] to-[#e5c07b]';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400">Progress</span>
          <span className="font-semibold text-slate-200">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-[#1b1f30] rounded-full overflow-hidden ${heightClasses} border border-white/5`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${!color ? defaultGradient : ''}`}
          style={{
            width: `${clamped}%`,
            backgroundColor: color || undefined
          }}
        />
      </div>
    </div>
  );
};
