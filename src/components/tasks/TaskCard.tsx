// src/components/tasks/TaskCard.tsx
import React, { useState } from 'react';
import { Task, Project, User } from '../../types';
import { PriorityBadge, DeadlineBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Check, CheckSquare, Square, Clock, ListChecks, MessageSquare, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  project?: Project;
  assignee?: User;
  onToggleComplete: (task: Task) => void;
  onClick: (task: Task) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  assignee,
  onToggleComplete,
  onClick,
  isDraggable = true,
  onDragStart,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const isCompleted = task.status === 'Completed';

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      setJustCompleted(true);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#e5c07b', '#9d7cd8', '#ffffff']
      });
      setTimeout(() => setJustCompleted(false), 800);
    }
    onToggleComplete(task);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  const totalSubtasks = (task.subtasks || []).length;
  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;
  const commentCount = (task.comments || []).length;

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={() => onClick(task)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-[#0f111a] hover:bg-[#141724] border ${
        task.isOverdue && !isCompleted
          ? 'border-rose-500/30 shadow-[0_0_15px_-4px_rgba(244,63,94,0.15)]'
          : 'border-[#1f2336] hover:border-[#323955]'
      } rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-lg shadow-black/40 ${
        isCompleted ? 'opacity-70 bg-[#0c0e16]/60' : ''
      } ${justCompleted ? 'scale-[1.02] border-[#e5c07b]' : ''} ${className}`}
    >
      {/* Top row: Priority & Project badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} size="sm" />
          {project && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border"
              style={{
                backgroundColor: `${project.color}15`,
                color: project.color,
                borderColor: `${project.color}35`
              }}
            >
              {project.name}
            </span>
          )}
        </div>

        {/* Due status */}
        <DeadlineBadge
          statusText={task.deadlineStatus}
          isOverdue={task.isOverdue && !isCompleted}
          isDueToday={task.isDueToday && !isCompleted}
          isDueSoon={task.isDueSoon && !isCompleted}
          dueDate={task.dueDate}
        />
      </div>

      {/* Task Title & Interactive Checkbox */}
      <div className="flex items-start gap-3 my-2">
        <button
          onClick={handleCheckboxClick}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150 shrink-0 border ${
            isCompleted
              ? 'bg-[#e5c07b] border-[#e5c07b] text-black shadow-[0_0_10px_rgba(229,192,123,0.4)]'
              : 'border-[#333a54] hover:border-[#e5c07b] bg-[#141726]/80 text-transparent hover:text-slate-500'
          }`}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          <Check className={`w-3.5 h-3.5 stroke-[3] ${isCompleted ? 'opacity-100' : 'opacity-0 hover:opacity-50'}`} />
        </button>

        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-semibold tracking-tight transition-colors leading-snug line-clamp-2 ${
              isCompleted ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-white'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap my-2.5">
          {task.tags.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#181c2b] text-slate-400 border border-white/5"
            >
              {t.startsWith('#') ? t : `#${t}`}
            </span>
          ))}
        </div>
      )}

      {/* Bottom metadata footer */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/[0.04] text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {/* Subtasks progress */}
          {totalSubtasks > 0 && (
            <div
              className={`flex items-center gap-1 text-[11px] font-medium ${
                completedSubtasks === totalSubtasks ? 'text-emerald-400' : 'text-slate-400'
              }`}
              title={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* Comments count */}
          {commentCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400" title={`${commentCount} comments`}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{commentCount}</span>
            </div>
          )}

          {/* Estimated time */}
          {task.estimatedTime && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400" title="Estimated time">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{task.estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center">
          {assignee ? (
            <Avatar user={assignee} size="sm" showStatus={true} />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#1b1f30] border border-white/5 flex items-center justify-center text-[10px] text-slate-500">
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
