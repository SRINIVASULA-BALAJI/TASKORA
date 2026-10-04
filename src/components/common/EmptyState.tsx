// src/components/common/EmptyState.tsx
import React from 'react';
import { Button } from './Button';
import { Layers } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#23273c] bg-[#0c0d16]/40 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#141726] border border-[#23273e] flex items-center justify-center text-[#e5c07b] mb-4 shadow-inner">
        {icon || <Layers className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-semibold text-slate-100 mb-1.5">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
