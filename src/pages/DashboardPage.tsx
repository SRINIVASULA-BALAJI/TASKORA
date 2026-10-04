// src/pages/DashboardPage.tsx
import React, { useMemo } from 'react';
import { Task, Project, User, AnalyticsStats } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { CircularScore } from '../components/common/CircularScore';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  AlertTriangle,
  Layers,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';

interface DashboardPageProps {
  tasks: Task[];
  projects: Project[];
  team: User[];
  currentUser: User | null;
  analyticsStats: AnalyticsStats | null;
  onOpenCreateTask: (defaultDueDate?: string) => void;
  onToggleCompleteTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onNavigateProjects: () => void;
  onNavigateTasks: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  tasks,
  projects,
  team,
  currentUser,
  analyticsStats,
  onOpenCreateTask,
  onToggleCompleteTask,
  onSelectTask,
  onNavigateProjects,
  onNavigateTasks
}) => {
  // Determine dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Compute live task counts
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const pendingCount = tasks.filter(t => t.status === 'To Do' || t.status === 'Review').length;
  const overdueCount = tasks.filter(t => t.isOverdue && t.status !== 'Completed').length;

  // Filter Today's Tasks
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.isDueToday || (t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()));
  }, [tasks]);

  // Today active vs today completed
  const todayActive = todayTasks.filter(t => t.status !== 'Completed');
  const todayCompleted = todayTasks.filter(t => t.status === 'Completed');

  // Next upcoming tasks (excluding today/overdue)
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => !t.isOverdue && !t.isDueToday && t.status !== 'Completed')
      .slice(0, 4);
  }, [tasks]);

  // Stat Cards data
  const statCards = [
    {
      label: 'Total Tasks',
      value: totalCount,
      change: '+12% this week',
      icon: Layers,
      color: 'text-slate-200',
      bgColor: 'bg-slate-800/30',
      borderColor: 'border-[#1f2438]'
    },
    {
      label: 'Completed',
      value: completedCount,
      change: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}% completion`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/20',
      borderColor: 'border-emerald-500/20'
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      change: 'Active velocity',
      icon: CircleDashed,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/20',
      borderColor: 'border-sky-500/20'
    },
    {
      label: 'Pending',
      value: pendingCount,
      change: 'To Do & Review',
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/20',
      borderColor: 'border-purple-500/20'
    },
    {
      label: 'Overdue',
      value: overdueCount,
      change: overdueCount > 0 ? 'Requires attention' : 'All on track',
      icon: AlertTriangle,
      color: overdueCount > 0 ? 'text-rose-400' : 'text-slate-400',
      bgColor: overdueCount > 0 ? 'bg-rose-950/30' : 'bg-slate-900/20',
      borderColor: overdueCount > 0 ? 'border-rose-500/40' : 'border-[#1f2438]'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f111c] via-[#151928] to-[#0c0d16] border border-[#23283f] p-6 sm:p-8 shadow-2xl">
        {/* Subtle ambient gold/purple glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e5c07b]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#9d7cd8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1c2136] border border-[#2c3452] text-xs text-[#e5c07b] font-medium mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Workspace Productivity Live</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Leader'}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg leading-relaxed">
              Let's get things done today. You have{' '}
              <span className="text-[#e5c07b] font-semibold">{todayActive.length} tasks scheduled for today</span> and{' '}
              <span className="text-rose-400 font-semibold">{overdueCount} overdue items</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onOpenCreateTask()}
              icon={<Plus className="w-5 h-5 stroke-[2.5]" />}
            >
              + Create Task
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics 5-Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl bg-[#0f111a] border ${card.borderColor} shadow-lg shadow-black/40 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${card.color}`}>
                  {card.value}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{card.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Today's Tasks & Productivity Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-white tracking-tight">Today's Tasks</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#1b1f32] text-slate-300 border border-white/5">
                {todayTasks.length}
              </span>
            </div>
            <button
              onClick={onNavigateTasks}
              className="text-xs font-medium text-[#e5c07b] hover:underline flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Today Tasks Content */}
          {todayTasks.length === 0 ? (
            <EmptyState
              title="No tasks scheduled for today"
              description="You're clear for today! Create a new task or plan ahead for upcoming milestones."
              actionText="+ Create Task for Today"
              onAction={() => onOpenCreateTask(new Date().toISOString().split('T')[0])}
            />
          ) : (
            <div className="space-y-3">
              {/* Active items for today */}
              {todayActive.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={projects.find(p => p.id === task.projectId)}
                  assignee={team.find(u => u.id === task.assigneeId)}
                  onToggleComplete={onToggleCompleteTask}
                  onClick={onSelectTask}
                />
              ))}

              {/* Completed today section */}
              {todayCompleted.length > 0 && (
                <div className="pt-4 border-t border-[#1c2033] mt-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                    Completed Today ({todayCompleted.length})
                  </span>
                  <div className="space-y-3">
                    {todayCompleted.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        project={projects.find(p => p.id === task.projectId)}
                        assignee={team.find(u => u.id === task.assigneeId)}
                        onToggleComplete={onToggleCompleteTask}
                        onClick={onSelectTask}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Productivity Score & Projects Progress */}
        <div className="space-y-6">
          {/* Productivity Score Card */}
          <div className="p-6 rounded-2xl bg-[#0f111a] border border-[#21263d] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e5c07b]" />
                Productivity Score
              </h4>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#e5c07b]/10 text-[#e5c07b] border border-[#e5c07b]/20">
                DYNAMIC
              </span>
            </div>

            <CircularScore
              score={analyticsStats?.productivityScore ?? 78}
              title=""
              subtitle={
                analyticsStats?.scoreFeedback ||
                "Great work! You're completing tasks consistently."
              }
            />

            <div className="mt-5 pt-4 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#131624]">
                <span className="text-slate-400 block text-[10px] uppercase">Completion Rate</span>
                <span className="text-sm font-bold text-white font-mono">
                  {analyticsStats?.completionRate ?? 0}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#131624]">
                <span className="text-slate-400 block text-[10px] uppercase">Subtasks Done</span>
                <span className="text-sm font-bold text-[#e5c07b] font-mono">
                  {analyticsStats?.subtaskStats?.completed ?? 0}/{analyticsStats?.subtaskStats?.total ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Active Projects Mini-List */}
          <div className="p-6 rounded-2xl bg-[#0f111a] border border-[#21263d] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white tracking-tight">Active Projects</h4>
              <button
                onClick={onNavigateProjects}
                className="text-xs text-[#e5c07b] hover:underline"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3.5">
              {projects.slice(0, 4).map(proj => (
                <div key={proj.id} className="p-3 rounded-xl bg-[#131625] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 truncate pr-2">
                      {proj.name}
                    </span>
                    <span className="text-xs font-mono text-[#e5c07b] font-semibold">
                      {proj.stats?.progress ?? 0}%
                    </span>
                  </div>
                  <ProgressBar progress={proj.stats?.progress ?? 0} color={proj.color} height="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
