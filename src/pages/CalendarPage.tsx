// src/pages/CalendarPage.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Task, Project, User, Priority } from '../types';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { PriorityBadge } from '../components/common/Badge';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Filter,
  Search,
  X,
  GripVertical,
  Layers,
  ListFilter,
  PanelRightClose,
  PanelRightOpen,
  ArrowRight,
  Sparkles,
  Inbox
} from 'lucide-react';

interface CalendarPageProps {
  tasks: Task[];
  projects: Project[];
  team: User[];
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: (defaultDueDate?: string) => void;
  onUpdateTaskDueDate: (taskId: string, newDueDate: string) => Promise<void>;
  onToggleCompleteTask?: (task: Task) => Promise<void> | void;
  onCreateTask?: (taskData: any) => Promise<void> | void;
}

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export const CalendarPage: React.FC<CalendarPageProps> = ({
  tasks,
  projects,
  team,
  onSelectTask,
  onOpenCreateTask,
  onUpdateTaskDueDate,
  onToggleCompleteTask,
  onCreateTask
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('calView') as CalendarView;
      if (p && ['month', 'week', 'day', 'agenda'].includes(p)) return p;
    }
    return 'month';
  });

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('calView', newView);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDateStr, setDragOverDateStr] = useState<string | null>(null);
  const [selectedDayInspector, setSelectedDayInspector] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('inspectDay') || null;
    }
    return null;
  });
  const [showCompanionSidebar, setShowCompanionSidebar] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('companion');
      if (p === 'false') return false;
      if (p === 'true') return true;
    }
    return true;
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [hideCompleted, setHideCompleted] = useState(false);

  // Quick inline task creation state inside day inspector or day view
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState<Priority>('Medium');
  const [isSubmittingQuickTask, setIsSubmittingQuickTask] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  // Project and User lookup maps
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
  const userMap = useMemo(() => new Map(team.map(u => [u.id, u])), [team]);

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else if (view === 'day') d.setDate(d.getDate() - 1);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else if (view === 'day') d.setDate(d.getDate() + 1);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter tasks based on search & filter settings
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        const matchesTags = (task.tags || []).some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      if (filterProject !== 'all' && task.projectId !== filterProject) {
        return false;
      }

      if (filterPriority !== 'all' && task.priority !== filterPriority) {
        return false;
      }

      if (hideCompleted && task.status === 'Completed') {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, filterProject, filterPriority, hideCompleted]);

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    filteredTasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = task.dueDate.split('T')[0];
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)!.push(task);
      }
    });
    return map;
  }, [filteredTasks]);

  // Unscheduled tasks or backlog tasks
  const unscheduledTasks = useMemo(() => {
    return tasks.filter(t => !t.dueDate && t.status !== 'Completed');
  }, [tasks]);

  // Overall schedule stats
  const calendarStats = useMemo(() => {
    let totalScheduled = 0;
    let dueTodayCount = 0;
    let overdueCount = 0;
    let completedCount = 0;

    tasks.forEach(t => {
      if (t.dueDate) {
        totalScheduled++;
        const dateKey = t.dueDate.split('T')[0];
        if (dateKey === todayStr) {
          dueTodayCount++;
        }
        if (t.isOverdue && t.status !== 'Completed') {
          overdueCount++;
        }
        if (t.status === 'Completed') {
          completedCount++;
        }
      }
    });

    return { totalScheduled, dueTodayCount, overdueCount, completedCount };
  }, [tasks, todayStr]);

  // Month days calculation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    // Adjust to Monday start
    const startOffset = (firstDayIndex + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: false,
        dateString
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: true,
        dateString
      });
    }

    // Next month padding to fill complete grid of 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: false,
        dateString
      });
    }

    return days;
  }, [currentDate]);

  // Week days calculation
  const weekData = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = (d.getDay() + 6) % 7; // 0 = Mon
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dateString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      days.push({
        date: day,
        dateString
      });
    }
    return days;
  }, [currentDate]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDateStr !== dateString) {
      setDragOverDateStr(dateString);
    }
  };

  const handleDrop = async (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    setDragOverDateStr(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      const newIso = `${dateString}T18:00:00.000Z`;
      await onUpdateTaskDueDate(taskId, newIso);
    }
    setDraggedTaskId(null);
  };

  // Quick inline task creation submission
  const handleQuickTaskSubmit = async (targetDate: string) => {
    if (!quickTaskTitle.trim()) return;
    setIsSubmittingQuickTask(true);
    try {
      if (onCreateTask) {
        await onCreateTask({
          title: quickTaskTitle.trim(),
          description: '',
          projectId: filterProject !== 'all' ? filterProject : null,
          priority: quickTaskPriority,
          status: 'To Do',
          dueDate: `${targetDate}T18:00:00.000Z`,
          tags: ['calendar']
        });
      } else {
        onOpenCreateTask(targetDate);
      }
      setQuickTaskTitle('');
    } finally {
      setIsSubmittingQuickTask(false);
    }
  };

  // Helper formatting for priority colors
  const getPriorityAccent = (priority: Priority) => {
    switch (priority) {
      case 'Urgent':
        return {
          border: 'border-l-rose-500',
          bg: 'bg-rose-950/30 hover:bg-rose-900/40 border-rose-500/20 text-rose-200',
          dot: 'bg-rose-500'
        };
      case 'High':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/20 text-amber-200',
          dot: 'bg-amber-400'
        };
      case 'Medium':
        return {
          border: 'border-l-sky-500',
          bg: 'bg-sky-950/30 hover:bg-sky-900/40 border-sky-500/20 text-sky-200',
          dot: 'bg-sky-400'
        };
      case 'Low':
      default:
        return {
          border: 'border-l-slate-500',
          bg: 'bg-[#141829] hover:bg-[#1a2035] border-white/5 text-slate-300',
          dot: 'bg-slate-400'
        };
    }
  };

  // Helper formatting for time badge
  const formatTimeStr = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const hours = d.getHours();
      const mins = d.getMinutes();
      if (hours === 0 && mins === 0) return '';
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  // Tasks for day inspector
  const inspectorTasks = useMemo(() => {
    if (!selectedDayInspector) return [];
    return tasksByDate.get(selectedDayInspector) || [];
  }, [selectedDayInspector, tasksByDate]);

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* ================= TOP COMMAND & CONTROL BAR ================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#111422] to-[#0c0d16] border border-[#20253b] shadow-2xl space-y-4">
        {/* Row 1: Month Title, Navigation, Live Stats, View Toggle, Create Button */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Date Display & Nav Controls */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <CalendarRange className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  {currentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </h2>

                {/* Subtitle / Week Range if in Week view */}
                {view === 'week' && weekData.length > 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {weekData[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                    {weekData[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400/80" />
                <span>Interactive drag-and-drop workspace</span>
              </p>
            </div>

            {/* Quick Prev / Today / Next Switcher */}
            <div className="flex items-center gap-1 bg-[#090b12] border border-[#232942] rounded-xl p-1 ml-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: View Switcher, Sidebar Toggle & Create Task */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#090b12] rounded-xl border border-[#232942]">
              {(
                [
                  { id: 'month', label: 'Month', icon: CalendarIcon },
                  { id: 'week', label: 'Week', icon: CalendarDays },
                  { id: 'day', label: 'Day', icon: Clock },
                  { id: 'agenda', label: 'Agenda', icon: ListFilter }
                ] as const
              ).map(item => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      active
                        ? 'bg-gradient-to-r from-[#21273e] to-[#181d30] text-white shadow-sm border border-white/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-400' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Companion Sidebar Toggle (Unscheduled Tray & Mini-Calendar) */}
            <button
              onClick={() => setShowCompanionSidebar(prev => !prev)}
              className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
                showCompanionSidebar
                  ? 'bg-amber-400/10 border-amber-500/30 text-amber-300'
                  : 'bg-[#090b12] border-[#232942] text-slate-400 hover:text-white'
              }`}
              title={showCompanionSidebar ? 'Hide companion panel' : 'Show companion panel'}
            >
              {showCompanionSidebar ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Companion</span>
            </button>

            {/* + Create Task Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenCreateTask(currentDate.toISOString().split('T')[0])}
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              New Task
            </Button>
          </div>
        </div>

        {/* Row 2: Live Quick Metric Pills + Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-[#1a1f33]">
          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#0e101b] border border-[#20263c] text-slate-300 font-medium">
              <strong className="text-white font-mono">{calendarStats.totalScheduled}</strong> Scheduled
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <strong className="font-mono">{calendarStats.dueTodayCount}</strong> Today
            </span>

            {calendarStats.overdueCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <strong className="font-mono">{calendarStats.overdueCount}</strong> Overdue
              </span>
            )}

            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <strong className="font-mono">{calendarStats.completedCount}</strong> Done
            </span>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Keyword Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search calendar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[#090b12] border border-[#232942] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 w-36 sm:w-44 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Project Filter */}
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="px-2.5 py-1 bg-[#090b12] border border-[#232942] rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400/50"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-2.5 py-1 bg-[#090b12] border border-[#232942] rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400/50"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Hide Completed Toggle */}
            <button
              onClick={() => setHideCompleted(prev => !prev)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                hideCompleted
                  ? 'bg-amber-400/10 border-amber-500/30 text-amber-300'
                  : 'bg-[#090b12] border-[#232942] text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Hide Done</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN WORKSPACE AREA (GRID + COMPANION) ================= */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Main Calendar Views */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* ================= MONTH VIEW ================= */}
          {view === 'month' && (
            <div className="rounded-2xl bg-[#090b14] border border-[#1d2238] overflow-hidden shadow-2xl">
              {/* Day Headers (Mon - Sun) */}
              <div className="grid grid-cols-7 border-b border-[#1d2238] bg-[#0c0e18] text-center py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span className="text-amber-400/80">Sat</span>
                <span className="text-amber-400/80">Sun</span>
              </div>

              {/* Date Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#181d30]">
                {monthData.map((cell, idx) => {
                  const dayTasks = tasksByDate.get(cell.dateString) || [];
                  const isToday = cell.dateString === todayStr;
                  const isDropTarget = dragOverDateStr === cell.dateString;
                  const hasOverdue = dayTasks.some(
                    t => t.isOverdue && t.status !== 'Completed'
                  );
                  const isSelectedForInspector = selectedDayInspector === cell.dateString;

                  return (
                    <div
                      key={idx}
                      onDragOver={e => handleDragOver(e, cell.dateString)}
                      onDragLeave={() => setDragOverDateStr(null)}
                      onDrop={e => handleDrop(e, cell.dateString)}
                      onClick={() => setSelectedDayInspector(cell.dateString)}
                      className={`min-h-[125px] sm:min-h-[145px] p-2 flex flex-col justify-between transition-all group cursor-pointer relative ${
                        !cell.isCurrentMonth
                          ? 'bg-[#06070c]/60 opacity-35'
                          : 'bg-[#090b14]'
                      } ${
                        isSelectedForInspector
                          ? 'ring-2 ring-amber-400/50 bg-[#12162a]'
                          : 'hover:bg-[#0f1222]'
                      } ${
                        isDropTarget
                          ? 'ring-2 ring-amber-400 bg-amber-400/10 shadow-[0_0_25px_rgba(245,158,11,0.25)] z-10'
                          : ''
                      }`}
                    >
                      {/* Date Header: Day Number + Quick Add Button + Overdue Dot */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                              isToday
                                ? 'bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md shadow-amber-500/30 ring-2 ring-amber-400/40'
                                : 'text-slate-400 group-hover:text-white'
                            }`}
                          >
                            {cell.date.getDate()}
                          </span>

                          {hasOverdue && (
                            <span
                              className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse"
                              title="Has overdue tasks"
                            />
                          )}
                        </div>

                        {/* Quick hover + button */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onOpenCreateTask(cell.dateString);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-all"
                          title={`Schedule task for ${cell.dateString}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Task Pills on this Date */}
                      <div className="space-y-1.5 overflow-y-auto max-h-[90px] pr-0.5">
                        {dayTasks.slice(0, 3).map(task => {
                          const project = task.projectId ? projectMap.get(task.projectId) : null;
                          const assignee = task.assigneeId ? userMap.get(task.assigneeId) : null;
                          const isCompleted = task.status === 'Completed';
                          const isOverdue = task.isOverdue && !isCompleted;
                          const styling = getPriorityAccent(task.priority);
                          const timeStr = formatTimeStr(task.dueDate);

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={e => handleDragStart(e, task)}
                              onClick={e => {
                                e.stopPropagation();
                                onSelectTask(task);
                              }}
                              className={`px-2 py-1 rounded-md text-[11px] font-medium border border-l-[3px] truncate transition-all hover:scale-[1.02] hover:shadow-md cursor-grab active:cursor-grabbing flex items-center gap-1.5 ${
                                styling.border
                              } ${
                                isCompleted
                                  ? 'bg-emerald-950/20 text-emerald-300/70 border-emerald-500/30 line-through'
                                  : isOverdue
                                  ? 'bg-rose-950/40 text-rose-200 border-rose-500/30'
                                  : styling.bg
                              }`}
                              title={`${task.title} • ${timeStr ? timeStr + ' • ' : ''}Priority: ${task.priority}${
                                project ? ` • Project: ${project.name}` : ''
                              }${assignee ? ` • Assignee: ${assignee.name}` : ''}`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              ) : (
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${styling.dot}`}
                                />
                              )}
                              <span className="truncate flex-1 font-medium">{task.title}</span>
                            </div>
                          );
                        })}

                        {dayTasks.length > 3 && (
                          <div
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedDayInspector(cell.dateString);
                            }}
                            className="text-[10px] font-mono text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-400/10 hover:bg-amber-400/20 transition-colors w-fit cursor-pointer"
                          >
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= WEEK VIEW ================= */}
          {view === 'week' && (
            <div className="rounded-2xl bg-[#090b14] border border-[#1d2238] p-4 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3 overflow-x-auto pb-2">
                {weekData.map((cell, idx) => {
                  const dayTasks = tasksByDate.get(cell.dateString) || [];
                  const isToday = cell.dateString === todayStr;
                  const isDropTarget = dragOverDateStr === cell.dateString;

                  return (
                    <div
                      key={idx}
                      onDragOver={e => handleDragOver(e, cell.dateString)}
                      onDragLeave={() => setDragOverDateStr(null)}
                      onDrop={e => handleDrop(e, cell.dateString)}
                      className={`p-3.5 rounded-xl border min-h-[380px] min-w-[170px] xl:min-w-0 flex flex-col justify-between transition-all ${
                        isToday
                          ? 'border-amber-500/40 bg-gradient-to-b from-[#161a2e] to-[#0d101d] shadow-lg shadow-amber-950/20'
                          : 'border-[#1e2338] bg-[#0c0e18]'
                      } ${
                        isDropTarget
                          ? 'ring-2 ring-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                          : ''
                      }`}
                    >
                      {/* Column Header */}
                      <div className="border-b border-white/5 pb-2.5 mb-3 flex items-center justify-between">
                        <div>
                          <span
                            className={`text-xs uppercase font-extrabold tracking-wider block ${
                              isToday ? 'text-amber-400' : 'text-slate-400'
                            }`}
                          >
                            {cell.date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-xl font-extrabold text-white font-mono">
                            {cell.date.getDate()}
                          </span>
                        </div>

                        {/* Task count badge */}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-400 border border-white/10">
                          {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>

                      {/* Task cards list */}
                      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-0.5">
                        {dayTasks.map(task => {
                          const project = task.projectId ? projectMap.get(task.projectId) : null;
                          const assignee = task.assigneeId ? userMap.get(task.assigneeId) : null;
                          const isCompleted = task.status === 'Completed';
                          const timeStr = formatTimeStr(task.dueDate);

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={e => handleDragStart(e, task)}
                              onClick={() => onSelectTask(task)}
                              className={`p-2.5 rounded-xl bg-[#111424] border border-[#1f2640] text-xs cursor-pointer hover:border-amber-400/60 hover:bg-[#161a30] transition-all group shadow-sm ${
                                isCompleted ? 'opacity-65' : ''
                              }`}
                            >
                              {/* Title & Checkbox */}
                              <div className="flex items-start gap-2 mb-1.5">
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (onToggleCompleteTask) onToggleCompleteTask(task);
                                  }}
                                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 hover:text-amber-400" />
                                  )}
                                </button>
                                <span
                                  className={`font-semibold text-white text-xs line-clamp-2 leading-snug flex-1 ${
                                    isCompleted ? 'line-through text-slate-400' : ''
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>

                              {/* Project & Priority Badges */}
                              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                {project && (
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold inline-flex items-center gap-1 border max-w-[120px] truncate"
                                    style={{
                                      backgroundColor: `${project.color}15`,
                                      borderColor: `${project.color}40`,
                                      color: project.color
                                    }}
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0"
                                      style={{ backgroundColor: project.color }}
                                    />
                                    <span className="truncate">{project.name}</span>
                                  </span>
                                )}
                                <PriorityBadge priority={task.priority} size="sm" />
                              </div>

                              {/* Footer: Time & Assignee */}
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-white/5">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span className="font-mono">{timeStr || 'Anytime'}</span>
                                </div>
                                {assignee && (
                                  <Avatar
                                    user={assignee}
                                    size="xs"
                                    className="w-4 h-4 text-[8px]"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {dayTasks.length === 0 && (
                          <div className="h-28 border border-dashed border-[#1f253d] rounded-xl flex flex-col items-center justify-center text-slate-500 text-[11px] text-center p-2">
                            <span>No tasks</span>
                            <span className="text-[10px] opacity-70">Drop tasks here</span>
                          </div>
                        )}
                      </div>

                      {/* Add task button at bottom */}
                      <button
                        onClick={() => onOpenCreateTask(cell.dateString)}
                        className="w-full py-1.5 text-xs text-slate-400 hover:text-white border border-dashed border-[#232942] hover:border-amber-400/50 hover:bg-amber-400/5 rounded-lg mt-3 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= DAY VIEW ================= */}
          {view === 'day' && (
            <div className="p-6 rounded-2xl bg-[#090b14] border border-[#1d2238] space-y-6 shadow-2xl">
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1d2238]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                      {currentDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h3>
                    {currentDate.toISOString().split('T')[0] === todayStr && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-500/30">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {(tasksByDate.get(currentDate.toISOString().split('T')[0]) || []).length}{' '}
                    tasks scheduled for this day
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenCreateTask(currentDate.toISOString().split('T')[0])}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Task for this Day
                </Button>
              </div>

              {/* Quick Inline Task Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Quick add task for this day... (Press Enter)"
                  value={quickTaskTitle}
                  onChange={e => setQuickTaskTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleQuickTaskSubmit(currentDate.toISOString().split('T')[0]);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-[#0c0e18] border border-[#232942] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!quickTaskTitle.trim() || isSubmittingQuickTask}
                  onClick={() =>
                    handleQuickTaskSubmit(currentDate.toISOString().split('T')[0])
                  }
                >
                  {isSubmittingQuickTask ? 'Adding...' : 'Add'}
                </Button>
              </div>

              {/* Day's Tasks List */}
              <div className="space-y-3">
                {(tasksByDate.get(currentDate.toISOString().split('T')[0]) || []).map(task => {
                  const project = task.projectId ? projectMap.get(task.projectId) : null;
                  const assignee = task.assigneeId ? userMap.get(task.assigneeId) : null;
                  const isCompleted = task.status === 'Completed';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`p-4 rounded-xl bg-[#0e111d] border border-[#1e243c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-amber-400/50 hover:bg-[#131626] transition-all shadow-md ${
                        isCompleted ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (onToggleCompleteTask) onToggleCompleteTask(task);
                          }}
                          className="text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 hover:text-amber-400" />
                          )}
                        </button>

                        <div>
                          <h4
                            className={`text-sm font-bold text-white ${
                              isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 sm:self-center pl-8 sm:pl-0">
                        {project && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                            style={{
                              backgroundColor: `${project.color}15`,
                              borderColor: `${project.color}40`,
                              color: project.color
                            }}
                          >
                            {project.name}
                          </span>
                        )}
                        <PriorityBadge priority={task.priority} size="sm" />
                        {assignee && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Avatar user={assignee} size="xs" />
                            <span>{assignee.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {(tasksByDate.get(currentDate.toISOString().split('T')[0]) || []).length ===
                  0 && (
                  <div className="py-12 text-center border border-dashed border-[#1f253d] rounded-2xl bg-[#0c0e18]/50">
                    <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">
                      No tasks scheduled for this day
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Use the button above to schedule your first task!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= AGENDA VIEW ================= */}
          {view === 'agenda' && (
            <div className="p-6 rounded-2xl bg-[#090b14] border border-[#1d2238] space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#1d2238]">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <ListFilter className="w-5 h-5 text-amber-400" />
                    <span>Upcoming Agenda Timeline</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chronological stream of all upcoming scheduled deliverables
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenCreateTask()}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Task
                </Button>
              </div>

              {/* Sorted Agenda Grouping */}
              <div className="space-y-5">
                {Array.from(tasksByDate.entries())
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([dateKey, dayTasks]) => {
                    const isToday = dateKey === todayStr;
                    const dateObj = new Date(dateKey + 'T00:00:00');

                    return (
                      <div key={dateKey} className="space-y-2">
                        {/* Date header badge */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border ${
                              isToday
                                ? 'bg-amber-400/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400/30'
                                : 'bg-[#0f1220] text-slate-300 border-[#222842]'
                            }`}
                          >
                            {dateObj.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                            {isToday && ' • TODAY'}
                          </span>
                          <div className="h-px bg-[#1a1f33] flex-1" />
                        </div>

                        {/* Task items for that day */}
                        <div className="space-y-2 pl-2">
                          {dayTasks.map(task => {
                            const project = task.projectId ? projectMap.get(task.projectId) : null;
                            const assignee = task.assigneeId ? userMap.get(task.assigneeId) : null;
                            const isCompleted = task.status === 'Completed';

                            return (
                              <div
                                key={task.id}
                                onClick={() => onSelectTask(task)}
                                className={`p-3.5 rounded-xl bg-[#0d0f1b] border border-[#1c2238] flex items-center justify-between gap-4 cursor-pointer hover:border-amber-400/50 hover:bg-[#121526] transition-all ${
                                  isCompleted ? 'opacity-65' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      if (onToggleCompleteTask) onToggleCompleteTask(task);
                                    }}
                                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <Circle className="w-4 h-4 hover:text-amber-400" />
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <h4
                                      className={`text-sm font-semibold text-white truncate ${
                                        isCompleted ? 'line-through text-slate-400' : ''
                                      }`}
                                    >
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-xs text-slate-400 truncate mt-0.5">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  {project && (
                                    <span
                                      className="px-2 py-0.5 rounded text-[10px] font-semibold border hidden sm:inline"
                                      style={{
                                        backgroundColor: `${project.color}15`,
                                        borderColor: `${project.color}40`,
                                        color: project.color
                                      }}
                                    >
                                      {project.name}
                                    </span>
                                  )}
                                  <PriorityBadge priority={task.priority} size="sm" />
                                  {assignee && (
                                    <Avatar user={assignee} size="xs" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                {tasksByDate.size === 0 && (
                  <div className="py-12 text-center border border-dashed border-[#1f253d] rounded-2xl bg-[#0c0e18]/50">
                    <p className="text-sm font-semibold text-slate-300">
                      No scheduled tasks match your filter
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= COMPANION SIDEBAR (MINI-CALENDAR & UNSCHEDULED BACKLOG) ================= */}
        {showCompanionSidebar && (
          <div className="w-full lg:w-72 space-y-4 shrink-0">
            {/* Mini Calendar Card */}
            <div className="p-4 rounded-2xl bg-[#090b14] border border-[#1d2238] shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 7-col Mini Calendar Grid */}
              <div className="grid grid-cols-7 text-center gap-1 text-[10px] text-slate-500 font-bold uppercase mb-1">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {monthData.map((cell, i) => {
                  const isCurrent = cell.dateString === todayStr;
                  const isSelected =
                    currentDate.toISOString().split('T')[0] === cell.dateString;
                  const hasTasks = tasksByDate.has(cell.dateString);

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentDate(cell.date);
                        setSelectedDayInspector(cell.dateString);
                      }}
                      className={`h-7 w-7 mx-auto rounded-lg flex flex-col items-center justify-center relative transition-all ${
                        isCurrent
                          ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                          : isSelected
                          ? 'bg-white/10 text-white font-bold'
                          : cell.isCurrentMonth
                          ? 'text-slate-300 hover:bg-white/5'
                          : 'text-slate-600'
                      }`}
                    >
                      <span>{cell.date.getDate()}</span>
                      {hasTasks && !isCurrent && (
                        <span className="w-1 h-1 rounded-full bg-amber-400 absolute bottom-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unscheduled / Backlog Tasks Tray */}
            <div className="p-4 rounded-2xl bg-[#090b14] border border-[#1d2238] shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    Backlog & Unscheduled
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-400">
                  {unscheduledTasks.length}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5 text-amber-400" />
                <span>Drag task onto any date cell to schedule</span>
              </p>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {unscheduledTasks.map(task => {
                  const project = task.projectId ? projectMap.get(task.projectId) : null;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => handleDragStart(e, task)}
                      onClick={() => onSelectTask(task)}
                      className="p-2.5 rounded-xl bg-[#0e111d] border border-[#1f253d] hover:border-amber-400/50 hover:bg-[#131627] cursor-grab active:cursor-grabbing transition-all group shadow-sm"
                      title="Drag to calendar to schedule deadline"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-white truncate group-hover:text-amber-200">
                          {task.title}
                        </span>
                        <GripVertical className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100" />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {project ? (
                          <span
                            className="text-[9px] font-medium px-1.5 py-0.2 rounded border truncate max-w-[120px]"
                            style={{
                              backgroundColor: `${project.color}15`,
                              borderColor: `${project.color}40`,
                              color: project.color
                            }}
                          >
                            {project.name}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500">No project</span>
                        )}
                        <PriorityBadge priority={task.priority} size="sm" />
                      </div>
                    </div>
                  );
                })}

                {unscheduledTasks.length === 0 && (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    All tasks are scheduled! 🎯
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= INTERACTIVE DAY INSPECTOR DRAWER / MODAL ================= */}
      {selectedDayInspector && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedDayInspector(null)}
        >
          <div
            className="w-full max-w-md h-screen max-h-screen bg-[#0a0c16] border-l border-[#20263f] p-6 shadow-2xl flex flex-col justify-between overflow-hidden animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header & Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#1c2238]">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block font-semibold">
                    Day Schedule Inspector
                  </span>
                  <h3 className="text-lg font-extrabold text-white">
                    {new Date(selectedDayInspector + 'T00:00:00').toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      }
                    )}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedDayInspector(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                  <span>Tasks ({inspectorTasks.length})</span>
                  <span>
                    {inspectorTasks.filter(t => t.status === 'Completed').length} completed
                  </span>
                </div>

                {inspectorTasks.map(task => {
                  const isCompleted = task.status === 'Completed';
                  const assignee = task.assigneeId ? userMap.get(task.assigneeId) : null;
                  const project = task.projectId ? projectMap.get(task.projectId) : null;

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        onSelectTask(task);
                        setSelectedDayInspector(null);
                      }}
                      className={`p-3.5 rounded-xl bg-[#0f1220] border border-[#21273f] hover:border-amber-400/50 hover:bg-[#14182a] transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isCompleted ? 'opacity-65' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (onToggleCompleteTask) onToggleCompleteTask(task);
                          }}
                          className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 hover:text-amber-400" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <h5
                            className={`text-sm font-semibold text-white truncate ${
                              isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </h5>
                          {project && (
                            <span
                              className="text-[10px] font-medium block mt-0.5"
                              style={{ color: project.color }}
                            >
                              {project.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <PriorityBadge priority={task.priority} size="sm" />
                        {assignee && (
                          <Avatar user={assignee} size="xs" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {inspectorTasks.length === 0 && (
                  <div className="py-10 text-center border border-dashed border-[#1f253d] rounded-xl text-slate-500 text-xs">
                    No tasks scheduled for this day yet.
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Bottom: Quick Add & Full Modal Trigger */}
            <div className="pt-4 border-t border-[#1c2238] space-y-2.5 mt-3 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Quick add task... (Enter)"
                  value={quickTaskTitle}
                  onChange={e => setQuickTaskTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleQuickTaskSubmit(selectedDayInspector);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-[#0e101a] border border-[#232942] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                />
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!quickTaskTitle.trim() || isSubmittingQuickTask}
                  onClick={() => handleQuickTaskSubmit(selectedDayInspector)}
                >
                  Add
                </Button>
              </div>

              <button
                onClick={() => {
                  const target = selectedDayInspector;
                  setSelectedDayInspector(null);
                  onOpenCreateTask(target);
                }}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open Full Task Form</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
