// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { User, UserSettings, AccentColor, LayoutDensity, Priority } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  User as UserIcon,
  Palette,
  Bell,
  Sliders,
  Shield,
  RotateCcw,
  Check,
  Sparkles,
  Lock,
  Smartphone
} from 'lucide-react';

interface SettingsPageProps {
  currentUser: User | null;
  onUpdateUser: (updates: Partial<User>) => Promise<void>;
  onResetDemoData: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onUpdateUser,
  onResetDemoData
}) => {
  const { accentColor, setAccentColor, density, setDensity, settings, updateSettings } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'notifications' | 'preferences' | 'security'>('account');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [role, setRole] = useState(currentUser?.role || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateUser({ name, email, role, avatar });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await onResetDemoData();
    setIsResetting(false);
    setShowResetConfirm(false);
  };

  const accentOptions: { id: AccentColor; label: string; color: string }[] = [
    { id: 'gold', label: 'Royal Champagne Gold', color: '#e5c07b' },
    { id: 'purple', label: 'Electric Royal Purple', color: '#9d7cd8' },
    { id: 'emerald', label: 'Emerald Glow', color: '#34d399' },
    { id: 'cyan', label: 'Cyber Cyan', color: '#38bdf8' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Workspace Settings</h2>
        <p className="text-xs text-slate-400">
          Manage your account credentials, dark royal theme aesthetics, and system preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Settings Navigation Tabs */}
        <div className="space-y-1 bg-[#0b0c15] p-2 rounded-2xl border border-[#1b1f32]">
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'account'
                ? 'bg-[#181d2f] text-white border-l-2 border-[#e5c07b]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Account Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'appearance'
                ? 'bg-[#181d2f] text-white border-l-2 border-[#e5c07b]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Appearance & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-[#181d2f] text-white border-l-2 border-[#e5c07b]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notification Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'preferences'
                ? 'bg-[#181d2f] text-white border-l-2 border-[#e5c07b]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Task Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-[#181d2f] text-white border-l-2 border-[#e5c07b]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Data</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3 bg-[#0c0d16] border border-[#1b1f32] p-6 rounded-2xl shadow-2xl">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <h3 className="text-base font-bold text-white border-b border-[#1b2034] pb-3">
                Profile Information
              </h3>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Profile updated successfully</span>
                </div>
              )}

              <div className="flex items-center gap-4 py-2">
                <img
                  src={avatar}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#e5c07b]/40 shadow-xl"
                />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Job Role / Title
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-[#131624] border border-[#23283e] focus:border-[#e5c07b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-3">
                <Button type="submit" variant="primary" loading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-white border-b border-[#1b2034] pb-3">
                Visual Aesthetic & Palette
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Accent Color Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {accentOptions.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAccentColor(opt.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                        accentColor === opt.id
                          ? 'bg-[#151928] border-white/40 ring-2 ring-white/10'
                          : 'bg-[#10121d] border-[#1f2336] hover:border-[#313852]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span className="text-xs font-semibold text-slate-200">{opt.label}</span>
                      </div>
                      {accentColor === opt.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Layout Density
                </label>
                <div className="flex gap-3">
                  {(['comfortable', 'compact'] as LayoutDensity[]).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDensity(d)}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-semibold capitalize transition-all ${
                        density === d
                          ? 'bg-[#181d2f] border-[#e5c07b] text-white shadow-md'
                          : 'bg-[#10121d] border-[#1f2336] text-slate-400 hover:text-white'
                      }`}
                    >
                      {d} Layout
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white border-b border-[#1b2034] pb-3">
                Notification Delivery Rules
              </h3>

              <div className="space-y-3">
                {[
                  { key: 'deadlineReminders', title: 'Deadline Reminders', desc: 'Receive alert 2 hours prior to task due dates' },
                  { key: 'taskAssignments', title: 'Task Assignments', desc: 'Get notified when a team member delegates a task' },
                  { key: 'comments', title: 'Comment Notifications', desc: 'Notify on new comments and replies' },
                  { key: 'projectUpdates', title: 'Project Updates', desc: 'Summary of milestones and project completions' }
                ].map(item => {
                  const isChecked = (settings?.notifications as any)?.[item.key] ?? true;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#111322] border border-[#1e2338]"
                    >
                      <div>
                        <h5 className="text-xs font-semibold text-white">{item.title}</h5>
                        <p className="text-[11px] text-slate-400">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          updateSettings({
                            notifications: {
                              ...settings?.notifications,
                              [item.key]: e.target.checked
                            } as any
                          });
                        }}
                        className="w-4 h-4 accent-[#e5c07b] rounded cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white border-b border-[#1b2034] pb-3">
                Default Workspace Preferences
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Default Task Priority
                  </label>
                  <select
                    value={settings?.preferences?.defaultPriority || 'Medium'}
                    onChange={e =>
                      updateSettings({
                        preferences: {
                          ...settings?.preferences,
                          defaultPriority: e.target.value as Priority
                        } as any
                      })
                    }
                    className="w-full bg-[#131624] border border-[#23283e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Default Task View
                  </label>
                  <select
                    value={settings?.preferences?.defaultView || 'kanban'}
                    onChange={e =>
                      updateSettings({
                        preferences: {
                          ...settings?.preferences,
                          defaultView: e.target.value as any
                        } as any
                      })
                    }
                    className="w-full bg-[#131624] border border-[#23283e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="kanban">Kanban Board</option>
                    <option value="list">List Table</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security & Data Reset Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-white border-b border-[#1b2034] pb-3">
                Security & Data Lifecycle
              </h3>

              <div className="p-4 rounded-xl bg-[#111320] border border-[#1e2338] space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Password & Authentication</span>
                </div>
                <p className="text-xs text-slate-400">
                  Your session is authenticated via cryptographic token. Password was last verified today.
                </p>
              </div>

              {/* Reset Demo Data Button */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Demo Workspace Dataset</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Refill the workspace with realistic sample projects, tasks, comments, and metrics (AI/ML, Web Platform, Security, etc.) for testing flows.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Restore Sample Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleConfirmReset}
        title="Restore Demo Data"
        description="This will restore all default tasks, projects, subtasks, and comments back to initial state. Are you sure?"
        confirmText="Yes, Restore Data"
        isDanger={true}
        loading={isResetting}
      />
    </div>
  );
};
