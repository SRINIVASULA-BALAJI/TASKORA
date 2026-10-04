// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Search, Bell, Plus, Menu, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { NotificationItem, Task } from '../../types';
import { NavSection } from './Sidebar';

interface HeaderProps {
  currentSection: NavSection;
  onOpenSearch: () => void;
  onOpenCreateTask: () => void;
  onToggleMobileMenu: () => void;
  notifications: NotificationItem[];
  onNotificationClick: (notif: NotificationItem) => void;
  onMarkAllNotificationsRead: () => void;
  onNavigate: (section: NavSection) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onOpenSearch,
  onOpenCreateTask,
  onToggleMobileMenu,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onNavigate
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const sectionTitles: Record<NavSection, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Productivity overview & today\'s tasks' },
    tasks: { title: 'My Tasks', subtitle: 'Manage, organize, and drag tasks across workflow' },
    projects: { title: 'Projects', subtitle: 'Active initiatives and team milestones' },
    calendar: { title: 'Calendar', subtitle: 'Schedule, deadlines, and time planning' },
    analytics: { title: 'Analytics', subtitle: 'Productivity trends, score, and completion stats' },
    team: { title: 'Team & Collaboration', subtitle: 'Colleagues, roles, and assigned workload' },
    notifications: { title: 'Notifications', subtitle: 'Activity, assignments, and due date alerts' },
    settings: { title: 'Settings', subtitle: 'Customize workspace appearance and preferences' },
    profile: { title: 'User Profile', subtitle: 'Account details and configuration' }
  };

  const currentInfo = sectionTitles[currentSection] || { title: 'Taskora', subtitle: 'Workspace' };

  return (
    <header className="sticky top-0 z-20 bg-[#08090e]/85 backdrop-blur-md border-b border-[#181c2c] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile menu button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-400">{currentInfo.subtitle}</p>
        </div>
      </div>

      {/* Right: Search, Notifications, + Create Task */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Search Bar trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#121422] hover:bg-[#181c2d] border border-[#21263c] hover:border-[#313854] text-slate-400 hover:text-slate-200 transition-all text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search anything...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#191d2d] text-slate-400 border border-white/5">
            Ctrl K
          </kbd>
        </button>

        {/* Notifications Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 sm:p-2.5 rounded-xl bg-[#121422] hover:bg-[#181c2d] border border-[#21263c] text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-[#08090e] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Quick Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f121d] border border-[#23283e] rounded-2xl shadow-2xl p-3 z-30 animate-scale-up">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#1b2034] px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-[11px] text-[#e5c07b] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifDropdown(false);
                        onNotificationClick(n);
                      }}
                      className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                        n.read
                          ? 'bg-[#121422]/60 border-transparent text-slate-400'
                          : 'bg-[#161a2b] border-[#29314e] text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-white">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#e5c07b] mt-1 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 mt-2 border-t border-[#1b2034] text-center">
                <button
                  onClick={() => {
                    setShowNotifDropdown(false);
                    onNavigate('notifications');
                  }}
                  className="text-xs text-[#e5c07b] hover:underline font-medium"
                >
                  View all notifications &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Task Quick Button (Desktop & Tablet) */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreateTask}
          icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
        >
          <span className="hidden sm:inline">New Task</span>
        </Button>
      </div>
    </header>
  );
};
