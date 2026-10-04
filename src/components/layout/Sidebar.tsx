// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  BarChart3,
  Users,
  Bell,
  Settings,
  Plus,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { User, NotificationItem } from '../../types';
import { Avatar } from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';

export type NavSection =
  | 'dashboard'
  | 'tasks'
  | 'projects'
  | 'calendar'
  | 'analytics'
  | 'team'
  | 'notifications'
  | 'settings'
  | 'profile';

interface SidebarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onOpenCreateTask: () => void;
  taskCount: number;
  projectCount: number;
  unreadNotifsCount: number;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  onOpenCreateTask,
  taskCount,
  projectCount,
  unreadNotifsCount,
  onLogout,
  isMobileOpen,
  onCloseMobile
}) => {
  const { currentUser, getAccentClasses } = useTheme();
  const accent = getAccentClasses();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: taskCount },
    { id: 'projects', label: 'Projects', icon: FolderKanban, badge: projectCount },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount, isAlert: unreadNotifsCount > 0 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (id: NavSection) => {
    onNavigate(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#08090e] border-r border-[#191d2c] w-64 select-none relative">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#141724]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            {/* Elegant Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1a1d2e] via-[#242942] to-[#121420] border border-[#e5c07b]/40 flex items-center justify-center shadow-lg shadow-black/50">
              <Sparkles className="w-5 h-5 text-[#e5c07b]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white font-sans">Taskora</span>
                <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.2 rounded bg-[#e5c07b]/10 text-[#e5c07b] border border-[#e5c07b]/20 font-semibold uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">OBSIDIAN WORKSPACE</p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Quick Action Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={onOpenCreateTask}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#e5c07b] to-[#d4af37] hover:from-[#d4af37] hover:to-[#c69f2e] text-black shadow-md shadow-amber-950/20 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="px-3 py-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as NavSection)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? `${accent.activeNav} font-semibold`
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#121420]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#e5c07b]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      item.isAlert
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                        : 'bg-[#181c2d] text-slate-400 border border-white/5'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Bar at Bottom */}
      <div className="p-3 border-t border-[#141724] bg-[#07080d]/60 relative">
        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#121420] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar user={currentUser} size="md" showStatus={true} status="online" />
            <div className="min-w-0">
              <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                {currentUser?.name || 'Alex Vance'}
              </h5>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                <span className="truncate">Online</span>
              </div>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
        </div>

        {/* User Popover Menu */}
        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#0e111c] border border-[#23283e] rounded-xl shadow-2xl p-1.5 z-30 animate-scale-up">
            <button
              onClick={() => {
                handleNavClick('settings');
                setShowUserMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#181c2d] rounded-lg transition-colors text-left"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              Settings & Account
            </button>
            <div className="my-1 border-t border-white/5" />
            <button
              onClick={() => {
                setShowUserMenu(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block shrink-0 h-screen sticky top-0 z-30">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-fade-in">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
