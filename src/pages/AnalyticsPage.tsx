// src/pages/AnalyticsPage.tsx
import React from 'react';
import { AnalyticsData } from '../types';
import { CircularScore } from '../components/common/CircularScore';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Sparkles,
  Award,
  Zap
} from 'lucide-react';

interface AnalyticsPageProps {
  analytics: AnalyticsData | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="py-20 text-center text-slate-500 animate-pulse">
        Loading analytics engine metrics...
      </div>
    );
  }

  const { stats, weeklyTrends, statusDistribution, priorityDistribution, projectProgress } = analytics;

  // Max value for scaling weekly trend bars
  const maxWeekly = Math.max(...weeklyTrends.map(w => Math.max(w.completed, w.created, 1)));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner / Summary */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0d0f19] via-[#141726] to-[#0c0d16] border border-[#21263d] shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1b1f32] text-xs font-semibold text-[#e5c07b] border border-[#e5c07b]/20 mb-3">
            <Zap className="w-3.5 h-3.5" />
            Performance Telemetry
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Productivity Intelligence</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-lg leading-relaxed">
            Real-time analytics computed directly from your tasks, deadlines, and milestone completion velocity.
          </p>
        </div>

        {/* Big Productivity Score Highlight */}
        <div className="shrink-0 flex items-center gap-6 bg-[#0f121e] p-5 rounded-2xl border border-[#232940] shadow-xl">
          <CircularScore
            score={stats.productivityScore}
            size={120}
            strokeWidth={9}
            title=""
            subtitle=""
          />
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e5c07b] uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              Efficiency Rating
            </div>
            <h4 className="text-xl font-extrabold text-white font-mono">
              {stats.productivityScore >= 80 ? 'Grade A+' : stats.productivityScore >= 65 ? 'Grade A' : 'Grade B'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{stats.scoreFeedback}</p>
          </div>
        </div>
      </div>

      {/* 4 Overview Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f111a] border border-[#1e2338] shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Completion Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {stats.completionRate}%
            </span>
            <span className="text-xs text-slate-500">of total workload</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f111a] border border-[#1e2338] shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Completed Tasks
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.completed}</span>
            <span className="text-xs text-slate-500">/ {stats.total} tasks</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f111a] border border-[#1e2338] shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            In Progress Velocity
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-400 font-mono">{stats.inProgress}</span>
            <span className="text-xs text-slate-500">active tasks</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f111a] border border-[#1e2338] shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Overdue Bottlenecks
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold font-mono ${
                stats.overdue > 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {stats.overdue}
            </span>
            <span className="text-xs text-slate-500">items delayed</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Productivity Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#0f111a] border border-[#1f243a] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white tracking-tight">Weekly Productivity</h4>
              <p className="text-xs text-slate-400">Tasks completed vs tasks created</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-[#e5c07b]" /> Completed
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-[#252b42]" /> Created
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-[#1f243a]">
              {weeklyTrends.map((trend, i) => {
                const compHeight = Math.max(12, Math.round((trend.completed / maxWeekly) * 160));
                const creatHeight = Math.max(12, Math.round((trend.created / maxWeekly) * 160));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full flex items-end justify-center gap-1 h-40">
                      {/* Created bar */}
                      <div
                        className="w-1/2 bg-[#232840] hover:bg-[#2e3554] rounded-t-md transition-all relative"
                        style={{ height: `${creatHeight}px` }}
                        title={`Created: ${trend.created}`}
                      />
                      {/* Completed bar */}
                      <div
                        className="w-1/2 bg-gradient-to-t from-[#d4af37] to-[#e5c07b] rounded-t-md transition-all shadow-[0_0_12px_rgba(229,192,123,0.2)] relative"
                        style={{ height: `${compHeight}px` }}
                        title={`Completed: ${trend.completed}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                      {trend.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="p-6 rounded-2xl bg-[#0f111a] border border-[#1f243a] shadow-xl space-y-4">
          <h4 className="text-base font-bold text-white tracking-tight">Task Status Distribution</h4>
          <p className="text-xs text-slate-400">Live operational status distribution across tasks</p>

          <div className="space-y-3.5 pt-2">
            {statusDistribution.map(item => {
              const pct = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.name}</span>
                    <span className="font-mono text-slate-400">
                      {item.count} tasks ({pct}%)
                    </span>
                  </div>
                  <ProgressBar progress={pct} color={item.color} height="sm" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-6 rounded-2xl bg-[#0f111a] border border-[#1f243a] shadow-xl space-y-4">
          <h4 className="text-base font-bold text-white tracking-tight">Priority Breakdown</h4>
          <p className="text-xs text-slate-400">Workload divided by urgency levels</p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {priorityDistribution.map(p => (
              <div key={p.name} className="p-3.5 rounded-xl bg-[#131625] border border-white/5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {p.name}
                </span>
                <span className="text-2xl font-bold font-mono text-white" style={{ color: p.color }}>
                  {p.count}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {stats.total > 0 ? Math.round((p.count / stats.total) * 100) : 0}% of all tasks
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Progress Overview */}
        <div className="p-6 rounded-2xl bg-[#0f111a] border border-[#1f243a] shadow-xl space-y-4">
          <h4 className="text-base font-bold text-white tracking-tight">Project Milestones</h4>
          <p className="text-xs text-slate-400">Completion trajectory per initiative</p>

          <div className="space-y-3.5 pt-2">
            {projectProgress.map(proj => (
              <div key={proj.id} className="p-3 rounded-xl bg-[#131625] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{proj.name}</span>
                  <span className="font-mono text-slate-300 font-bold">{proj.progress}%</span>
                </div>
                <ProgressBar progress={proj.progress} color={proj.color} height="sm" />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{proj.completed} completed</span>
                  <span>{proj.total} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
