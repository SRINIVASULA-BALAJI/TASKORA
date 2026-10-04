// src/components/common/CircularScore.tsx
import React from 'react';

interface CircularScoreProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  title?: string;
  subtitle?: string;
}

export const CircularScore: React.FC<CircularScoreProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  title = "Productivity Score",
  subtitle
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference - (clamped / 100) * circumference;

  let strokeColor = '#e5c07b';
  let glowColor = 'rgba(229, 192, 123, 0.3)';

  if (clamped >= 80) {
    strokeColor = '#e5c07b'; // gold
    glowColor = 'rgba(229, 192, 123, 0.4)';
  } else if (clamped >= 60) {
    strokeColor = '#9d7cd8'; // purple
    glowColor = 'rgba(157, 124, 216, 0.4)';
  } else {
    strokeColor = '#38bdf8'; // cyan
    glowColor = 'rgba(56, 189, 248, 0.4)';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* SVG Circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1b1e2c"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {clamped}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {title && <h5 className="text-sm font-semibold text-slate-200 mt-3">{title}</h5>}
      {subtitle && <p className="text-xs text-slate-400 text-center max-w-xs mt-1 leading-relaxed">{subtitle}</p>}
    </div>
  );
};
