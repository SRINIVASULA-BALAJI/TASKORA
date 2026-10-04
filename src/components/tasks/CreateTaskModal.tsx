// src/components/tasks/CreateTaskModal.tsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Priority, TaskStatus, Project, User } from '../../types';
import { Calendar, Clock, Tag as TagIcon, Plus, X, User as UserIcon, Folder } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void>;
  projects: Project[];
  team: User[];
  defaultProjectId?: string | null;
  defaultDueDate?: string | null;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  team,
  defaultProjectId,
  defaultDueDate
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id ?? ''));
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [assigneeId, setAssigneeId] = useState(team[0]?.id ?? '');
  const [dueDate, setDueDate] = useState(defaultDueDate || new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('18:00');
  const [estimatedTime, setEstimatedTime] = useState('2 hrs');
  const [reminder, setReminder] = useState(true);
  const [tags, setTags] = useState<string[]>(['#task']);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(`#${clean}`)) {
        setTags([...tags, `#${clean}`]);
        setTagInput('');
      }
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const handleAddSubtask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && subtaskInput.trim()) {
      e.preventDefault();
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput('');
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let combinedDueDate = null;
      if (dueDate) {
        combinedDueDate = `${dueDate}T${dueTime || '18:00'}:00.000Z`;
      }

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        projectId: projectId || null,
        priority,
        status,
        assigneeId,
        dueDate: combinedDueDate,
        estimatedTime,
        reminder,
        tags,
        subtasks: subtasks.map(s => ({ title: s, completed: false }))
      });

      // Reset form
      setTitle('');
      setDescription('');
      setSubtasks([]);
      setTags(['#task']);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      subtitle="Organize actions, deadlines, and project deliverables"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Task Title <span className="text-[#e5c07b]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Train ResNet backbone on curated dataset"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#e5c07b] transition-all"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Add relevant notes, acceptance criteria, or context..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#e5c07b] transition-all resize-none"
          />
        </div>

        {/* Project & Assignee Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project
            </label>
            <div className="relative">
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">No Project (General)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Folder className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Assignee
            </label>
            <div className="relative">
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none appearance-none cursor-pointer"
              >
                {team.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.split(' ')[0]})
                  </option>
                ))}
              </select>
              <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Priority & Status Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#121422] rounded-xl border border-[#21263b]">
              {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                    priority === p
                      ? p === 'Urgent'
                        ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                        : p === 'High'
                        ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                        : p === 'Medium'
                        ? 'bg-sky-950 text-sky-300 border border-sky-600/40'
                        : 'bg-slate-800 text-slate-200 border border-slate-600/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#121422] rounded-xl border border-[#21263b]">
              {(['To Do', 'In Progress', 'Review', 'Completed'] as TaskStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                    status === s
                      ? s === 'Completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                        : s === 'Review'
                        ? 'bg-purple-950 text-purple-300 border border-purple-600/40'
                        : s === 'In Progress'
                        ? 'bg-sky-950 text-sky-300 border border-sky-600/40'
                        : 'bg-slate-800 text-slate-200 border border-slate-600/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Due Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Due Time
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Est. Time
            </label>
            <input
              type="text"
              placeholder="e.g. 4 hrs"
              value={estimatedTime}
              onChange={e => setEstimatedTime(e.target.value)}
              className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Subtasks (Optional Quick Add) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Initial Subtasks
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Type subtask and press Enter..."
              value={subtaskInput}
              onChange={e => setSubtaskInput(e.target.value)}
              onKeyDown={handleAddSubtask}
              className="flex-1 bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (subtaskInput.trim()) {
                  setSubtasks([...subtasks, subtaskInput.trim()]);
                  setSubtaskInput('');
                }
              }}
            >
              Add
            </Button>
          </div>

          {subtasks.length > 0 && (
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {subtasks.map((st, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#111320] border border-white/5 text-xs text-slate-300"
                >
                  <span>{st}</span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(i)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Tags
          </label>
          <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-[#131624] border border-[#23283e]">
            {tags.map(t => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#1f2438] text-slate-300 border border-white/5"
              >
                {t}
                <button type="button" onClick={() => removeTag(t)} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add tag (press Enter)..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none px-1 flex-1 min-w-[120px]"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1c2033]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={<Plus className="w-4 h-4" />}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
