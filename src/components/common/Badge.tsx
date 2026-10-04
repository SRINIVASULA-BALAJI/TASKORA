// src/components/common/Badge.tsx
import React from 'react';
import { Priority, TaskStatus } from '../../types';
import { AlertCircle, Clock, CheckCircle2, CircleDashed } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const getStyles = () => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/30';
      case 'High':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/30';
      case 'Medium':
        return 'bg-sky-950/60 text-sky-300 border-sky-500/30';
      case 'Low':
      default:
        return 'bg-slate-800/60 text-slate-300 border-slate-700/40';
    }
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border tracking-wider uppercase font-mono ${pad} ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {priority}
    </span>
  );
};

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
      case 'Review':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/30';
      case 'In Progress':
        return 'bg-sky-950/60 text-sky-300 border-sky-500/30';
      case 'To Do':
      default:
        return 'bg-slate-800/60 text-slate-300 border-slate-700/50';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'Review':
        return <AlertCircle className="w-3 h-3" />;
      case 'In Progress':
        return <CircleDashed className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />;
      case 'To Do':
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border backdrop-blur-sm ${pad} ${getStyles()}`}
    >
      {getIcon()}
      {status}
    </span>
  );
};

interface DeadlineBadgeProps {
  statusText?: string;
  isOverdue?: boolean;
  isDueToday?: boolean;
  isDueSoon?: boolean;
  dueDate?: string | null;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  statusText,
  isOverdue,
  isDueToday,
  isDueSoon,
  dueDate
}) => {
  if (!dueDate && !statusText) return null;

  const display = statusText || (dueDate ? new Date(dueDate).toLocaleDateString() : '');

  let styles = 'bg-slate-900/80 text-slate-300 border-slate-800';

  if (isOverdue) {
    styles = 'bg-rose-950/80 text-rose-300 border-rose-500/40 animate-pulse';
  } else if (isDueToday) {
    styles = 'bg-amber-950/70 text-amber-300 border-amber-500/40';
  } else if (isDueSoon) {
    styles = 'bg-sky-950/60 text-sky-300 border-sky-500/30';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles}`}
    >
      <Clock className="w-3.5 h-3.5 opacity-80" />
      {display}
    </span>
  );
};
