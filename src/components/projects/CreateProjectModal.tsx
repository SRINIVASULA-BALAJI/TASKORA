// src/components/projects/CreateProjectModal.tsx
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Priority, User } from '../../types';
import { Folder, Plus, Calendar, Palette, Users } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => Promise<void>;
  team: User[];
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  team
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('High');
  const [color, setColor] = useState('#e5c07b');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(team.slice(0, 3).map(u => u.id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = ['#e5c07b', '#9d7cd8', '#38bdf8', '#34d399', '#f43f5e', '#fb923c'];

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        deadline: deadline ? `${deadline}T18:00:00.000Z` : null,
        priority,
        color,
        members: selectedMembers
      });
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      subtitle="Define a workspace initiative with milestones and members"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Project Name <span className="text-[#e5c07b]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Distributed Vector Retrieval System"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
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
            placeholder="What is the objective of this initiative?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
          />
        </div>

        {/* Category & Deadline */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <input
              type="text"
              placeholder="e.g. AI / ML, Web, Product"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Priority & Color Picker */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="w-full bg-[#131624] border border-[#23283e] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Color Theme
            </label>
            <div className="flex items-center gap-2 pt-1">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-110 border-white ring-2 ring-white/20' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Members Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Team Members
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-[#121422] rounded-xl border border-[#21263c]">
            {team.map(u => {
              const selected = selectedMembers.includes(u.id);
              return (
                <div
                  key={u.id}
                  onClick={() => toggleMember(u.id)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selected
                      ? 'bg-[#1c2136] border-[#e5c07b]/40 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="truncate">{u.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1c2033]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={<Plus className="w-4 h-4" />}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
