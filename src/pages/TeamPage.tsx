// src/pages/TeamPage.tsx
import React, { useState } from 'react';
import { User, Task } from '../types';
import { Avatar } from '../components/common/Avatar';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Users, Plus, Mail, CheckCircle2, Clock, AlertTriangle, Briefcase } from 'lucide-react';

interface TeamPageProps {
  team: User[];
  tasks: Task[];
  onAddMember: (data: { name: string; email: string; role: string; department?: string }) => Promise<void>;
  onFilterTasksByMember: (memberId: string) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  team,
  tasks,
  onAddMember,
  onFilterTasksByMember
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Product Engineer');
  const [department, setDepartment] = useState('Engineering');
  const [loading, setLoading] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      await onAddMember({ name, email, role, department });
      setName('');
      setEmail('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Team Workspace</h2>
          <p className="text-xs text-slate-400">
            Collaborators, roles, and real-time workload distribution
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          Add Member
        </Button>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {team.map(member => {
          const memberTasks = tasks.filter(t => t.assigneeId === member.id);
          const total = memberTasks.length;
          const completed = memberTasks.filter(t => t.status === 'Completed').length;
          const inProgress = memberTasks.filter(t => t.status === 'In Progress').length;
          const overdue = memberTasks.filter(t => t.isOverdue && t.status !== 'Completed').length;
          const rate = member.workload?.rate ?? (total > 0 ? Math.round((inProgress / total) * 100) : 10);

          return (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-[#0e101a] border border-[#1e2338] shadow-xl flex flex-col justify-between space-y-4 hover:border-[#333b58] transition-all"
            >
              <div>
                {/* Member Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar user={member} size="lg" showStatus={true} />
                    <div>
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      <p className="text-xs text-slate-400">{member.role}</p>
                      {member.department && (
                        <span className="text-[10px] font-mono text-[#e5c07b] bg-[#e5c07b]/10 px-1.5 py-0.2 rounded border border-[#e5c07b]/20 mt-1 inline-block">
                          {member.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold border ${
                      member.status === 'online'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        : member.status === 'away'
                        ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-700/40'
                    }`}
                  >
                    {member.status || 'offline'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 my-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>

              {/* Workload Stats */}
              <div className="p-3.5 rounded-xl bg-[#131625] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Workload</span>
                  <span className="font-bold text-[#e5c07b] font-mono">{rate}%</span>
                </div>
                <ProgressBar progress={rate} height="sm" />

                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
                  <div className="bg-[#0b0c15] p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px] uppercase">Assigned</span>
                    <span className="font-bold text-white font-mono">{total}</span>
                  </div>
                  <div className="bg-[#0b0c15] p-1.5 rounded-lg">
                    <span className="text-emerald-400 block text-[9px] uppercase">Done</span>
                    <span className="font-bold text-emerald-300 font-mono">{completed}</span>
                  </div>
                  <div className="bg-[#0b0c15] p-1.5 rounded-lg">
                    <span className="text-rose-400 block text-[9px] uppercase">Overdue</span>
                    <span className="font-bold text-rose-300 font-mono">{overdue}</span>
                  </div>
                </div>
              </div>

              {/* Bottom action */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFilterTasksByMember(member.id)}
                className="w-full"
              >
                View Assigned Tasks
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Team Member"
        subtitle="Invite a new collaborator to the Taskora workspace"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-[#e5c07b]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Liam Sterling"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-[#e5c07b]">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. liam@taskora.io"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Role Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Backend Dev"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering, Design"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1c2033]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} icon={<Plus className="w-4 h-4" />}>
              Add Collaborator
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
