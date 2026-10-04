// src/components/common/Button.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const { getAccentClasses } = useTheme();
  const accent = getAccentClasses();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5'
  }[size];

  let variantClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses = `${accent.primaryBg} ${accent.glow} active:scale-[0.98] transition-all duration-150`;
      break;
    case 'secondary':
      variantClasses = 'bg-[#151824] hover:bg-[#1d2133] text-slate-200 border border-[#23273c] hover:border-[#313752] active:scale-[0.98] transition-all duration-150';
      break;
    case 'outline':
      variantClasses = 'bg-transparent hover:bg-white/[0.04] text-slate-300 border border-[#23273c] hover:border-slate-500 active:scale-[0.98] transition-all duration-150';
      break;
    case 'danger':
      variantClasses = 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 hover:border-rose-600 active:scale-[0.98] transition-all duration-150';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent hover:bg-white/[0.06] text-slate-400 hover:text-slate-100 transition-colors duration-150';
      break;
  }

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
