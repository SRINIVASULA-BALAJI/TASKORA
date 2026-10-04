// src/components/tasks/TaskDetailsPanel.tsx
import React, { useState, useEffect } from 'react';
import { Task, Project, User, Priority, TaskStatus } from '../../types';
import { PriorityBadge, StatusBadge, DeadlineBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  X,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Plus,
  Send,
  MessageSquare,
  History,
  CheckSquare,
  Square,
  Edit2,
  Tag,
  Folder,
  User as UserIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskDetailsPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onAddSubtask: (taskId: string, title: string) => Promise<void>;
  onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => Promise<void>;
  onDeleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  onAddComment: (taskId: string, text: string) => Promise<void>;
  onDeleteComment: (taskId: string, commentId: string) => Promise<void>;
  projects: Project[];
  team: User[];
  currentUser: User | null;
}

export const TaskDetailsPanel: React.FC<TaskDetailsPanelProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onAddComment,
  onDeleteComment,
  projects,
  team,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setProjectId(task.projectId);
      setAssigneeId(task.assigneeId);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentProject = projects.find(p => p.id === task.projectId);
  const currentAssignee = team.find(u => u.id === task.assigneeId);
  const isCompleted = task.status === 'Completed';

  // Subtasks calculations
  const totalSubtasks = (task.subtasks || []).length;
  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;
  const subtaskPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleToggleCompleted = async () => {
    const nextStatus = isCompleted ? 'To Do' : 'Completed';
    if (!isCompleted) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    await onUpdate(task.id, { status: nextStatus });
  };

  const handleSaveQuickEdit = async () => {
    await onUpdate(task.id, {
      title,
      description,
      priority,
      status,
      projectId,
      assigneeId,
      dueDate: dueDate ? `${dueDate}T18:00:00.000Z` : null
    });
    setIsEditing(false);
  };

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    await onAddSubtask(task.id, newSubtaskText.trim());
    setNewSubtaskText('');
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    await onAddComment(task.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    await onDelete(task.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#040508]/80 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={onClose}
        />

        {/* Slide-out Drawer Panel */}
        <div className="relative w-full max-w-2xl bg-[#0c0e17] border-l border-[#22273e] h-full flex flex-col shadow-2xl z-10 animate-fade-in overflow-hidden">
          {/* Top glowing line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e5c07b]/50 to-transparent" />

          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2034] bg-[#0f111d]/70">
            <div className="flex items-center gap-3">
              <Button
                variant={isCompleted ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleToggleCompleted}
                icon={isCompleted ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              >
                {isCompleted ? 'Reopen Task' : 'Mark Complete'}
              </Button>
              {task.deadlineStatus && (
                <DeadlineBadge
                  statusText={task.deadlineStatus}
                  isOverdue={task.isOverdue && !isCompleted}
                  isDueToday={task.isDueToday && !isCompleted}
                  isDueSoon={task.isDueSoon && !isCompleted}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Delete Task"
                aria-label="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Panel"
                aria-label="Close Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs Navigator */}
          <div className="flex items-center border-b border-[#1b2034] px-6 bg-[#0c0e18]">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all ${
                activeTab === 'details'
                  ? 'border-[#e5c07b] text-[#e5c07b]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Task Overview
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'comments'
                  ? 'border-[#e5c07b] text-[#e5c07b]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Comments ({(task.comments || []).length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-3 px-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'border-[#e5c07b] text-[#e5c07b]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Activity Log
            </button>
          </div>

          {/* Content Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'details' && (
              <>
                {/* Title & Edit toggle */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-[#141726] border border-[#e5c07b] rounded-xl px-3.5 py-2 text-lg font-semibold text-white focus:outline-none"
                      />
                    ) : (
                      <h2
                        className={`text-xl font-bold tracking-tight leading-snug ${
                          isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h2>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (isEditing ? handleSaveQuickEdit() : setIsEditing(true))}
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </div>

                  {/* Description */}
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full bg-[#141726] border border-[#23273e] focus:border-[#e5c07b] rounded-xl p-3 text-sm text-slate-200 focus:outline-none resize-none"
                      placeholder="Add description..."
                    />
                  ) : (
                    <p className="text-sm text-slate-300 leading-relaxed bg-[#111320] p-4 rounded-xl border border-white/5">
                      {task.description || 'No detailed description provided.'}
                    </p>
                  )}
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-[#0f121e] p-4 rounded-xl border border-[#1e2338]">
                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Status
                    </span>
                    <select
                      value={status}
                      onChange={async e => {
                        const val = e.target.value as TaskStatus;
                        setStatus(val);
                        await onUpdate(task.id, { status: val });
                      }}
                      className="w-full bg-[#151929] border border-[#252b42] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Priority
                    </span>
                    <select
                      value={priority}
                      onChange={async e => {
                        const val = e.target.value as Priority;
                        setPriority(val);
                        await onUpdate(task.id, { priority: val });
                      }}
                      className="w-full bg-[#151929] border border-[#252b42] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Project
                    </span>
                    <select
                      value={projectId || ''}
                      onChange={async e => {
                        const val = e.target.value || null;
                        setProjectId(val);
                        await onUpdate(task.id, { projectId: val });
                      }}
                      className="w-full bg-[#151929] border border-[#252b42] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="">No Project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Assignee
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={assigneeId}
                        onChange={async e => {
                          const val = e.target.value;
                          setAssigneeId(val);
                          await onUpdate(task.id, { assigneeId: val });
                        }}
                        className="w-full bg-[#151929] border border-[#252b42] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                      >
                        {team.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Due Date
                    </span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={async e => {
                        const val = e.target.value;
                        setDueDate(val);
                        await onUpdate(task.id, { dueDate: val ? `${val}T18:00:00.000Z` : null });
                      }}
                      className="w-full bg-[#151929] border border-[#252b42] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Estimated Time
                    </span>
                    <div className="text-xs font-mono text-slate-300 py-1.5">
                      {task.estimatedTime || 'Not set'}
                    </div>
                  </div>
                </div>

                {/* Subtasks Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-100 tracking-tight">Subtasks</h4>
                      <span className="text-xs text-slate-400 font-mono">
                        ({completedSubtasks} / {totalSubtasks} completed &middot; {subtaskPercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {totalSubtasks > 0 && <ProgressBar progress={subtaskPercentage} height="sm" />}

                  {/* Subtask items list */}
                  <div className="space-y-2">
                    {(task.subtasks || []).map(st => (
                      <div
                        key={st.id}
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-[#121422] border border-[#1e2336] hover:border-[#2e3552] transition-colors"
                      >
                        <button
                          onClick={() => onToggleSubtask(task.id, st.id, !st.completed)}
                          className="flex items-center gap-2.5 flex-1 text-left"
                        >
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              st.completed
                                ? 'bg-[#e5c07b] border-[#e5c07b] text-black shadow-[0_0_8px_rgba(229,192,123,0.3)]'
                                : 'border-[#333a52] bg-[#161a29]'
                            }`}
                          >
                            {st.completed && <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </span>
                          <span
                            className={`text-xs ${
                              st.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
                            }`}
                          >
                            {st.title}
                          </span>
                        </button>
                        <button
                          onClick={() => onDeleteSubtask(task.id, st.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add subtask input */}
                  <form onSubmit={handleCreateSubtask} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add a new subtask (e.g. Test validation loss)..."
                      value={newSubtaskText}
                      onChange={e => setNewSubtaskText(e.target.value)}
                      className="flex-1 bg-[#121422] border border-[#21263c] focus:border-[#e5c07b] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <Button type="submit" variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                      Add
                    </Button>
                  </form>
                </div>
              </>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <form onSubmit={handleCreateComment} className="flex items-center gap-3">
                  <Avatar user={currentUser} size="sm" />
                  <input
                    type="text"
                    placeholder="Write a comment or update (e.g. Dataset cleaning finished)..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    className="flex-1 bg-[#121422] border border-[#21263c] focus:border-[#e5c07b] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <Button type="submit" variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                    Post
                  </Button>
                </form>

                <div className="space-y-3 pt-2">
                  {(!task.comments || task.comments.length === 0) && (
                    <p className="text-xs text-slate-500 text-center py-6">
                      No comments yet. Start the conversation above.
                    </p>
                  )}

                  {(task.comments || []).map(comment => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121422] border border-[#1f2336]"
                    >
                      <Avatar name={comment.userName} avatarUrl={comment.userAvatar} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-200">{comment.userName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(comment.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{comment.text}</p>
                      </div>

                      {currentUser && (currentUser.id === comment.userId || currentUser.name === comment.userName) && (
                        <button
                          onClick={() => onDeleteComment(task.id, comment.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity History Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Timeline of Changes
                </h4>

                <div className="relative pl-6 space-y-4 border-l border-[#22273e] ml-2">
                  {(task.activity || []).map(act => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-[#e5c07b] ring-4 ring-[#0c0e18]" />
                      <p className="text-xs text-slate-200 font-medium">{act.text}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isDanger={true}
        loading={isDeleting}
      />
    </>
  );
};
