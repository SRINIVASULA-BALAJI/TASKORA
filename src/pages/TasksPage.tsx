// src/pages/TasksPage.tsx
import React, { useState, useMemo } from 'react';
import { Task, Project, User, Priority, TaskStatus } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { PriorityBadge, StatusBadge, DeadlineBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import {
  List,
  Kanban,
  Search,
  Filter,
  ArrowUpDown,
  X,
  Plus,
  CheckCircle2,
  Clock,
  MoreVertical,
  Check,
  ChevronDown
} from 'lucide-react';

interface TasksPageProps {
  tasks: Task[];
  projects: Project[];
  team: User[];
  onToggleCompleteTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
}

type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'title' | 'status';

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  projects,
  team,
  onToggleCompleteTask,
  onUpdateTaskStatus,
  onSelectTask,
  onOpenCreateTask
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => (t.tags || []).forEach(tag => set.add(tag)));
    return Array.from(set);
  }, [tasks]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    projectFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    tagFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setAssigneeFilter('all');
    setTagFilter('all');
  };

  // Filtered and Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      result = result.filter(t => t.projectId === projectFilter);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      result = result.filter(t => t.assigneeId === assigneeFilter);
    }

    // Tag filter
    if (tagFilter !== 'all') {
      result = result.filter(t => t.tags && t.tags.includes(tagFilter));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === 'priority') {
        const weights: Record<Priority, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return sortOrder === 'asc'
          ? weights[b.priority] - weights[a.priority]
          : weights[a.priority] - weights[b.priority];
      }
      if (sortBy === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateB - dateA : dateA - dateB;
      }
      if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [
    tasks,
    searchQuery,
    statusFilter,
    priorityFilter,
    projectFilter,
    assigneeFilter,
    tagFilter,
    sortBy,
    sortOrder
  ]);

  // Drag and Drop handlers for Kanban
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  const kanbanColumns: { id: TaskStatus; label: string; accentColor: string; bgBadge: string }[] = [
    { id: 'To Do', label: 'To Do', accentColor: 'border-slate-500/40', bgBadge: 'bg-slate-800 text-slate-300' },
    { id: 'In Progress', label: 'In Progress', accentColor: 'border-sky-500/40', bgBadge: 'bg-sky-950 text-sky-300' },
    { id: 'Review', label: 'Review', accentColor: 'border-purple-500/40', bgBadge: 'bg-purple-950 text-purple-300' },
    { id: 'Completed', label: 'Completed', accentColor: 'border-emerald-500/40', bgBadge: 'bg-emerald-950 text-emerald-300' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Controls: View Switcher & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#10121d] rounded-xl border border-[#21263d] self-start">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-[#1e2338] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#1e2338] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
        </div>

        {/* Right Buttons: Counter & + Create Task */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            Showing <strong className="text-white">{filteredTasks.length}</strong> of {tasks.length} tasks
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateTask}
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0d0f19] border border-[#1e2336] shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks or tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#131625] border border-[#22283e] focus:border-[#e5c07b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#131625] border border-[#22283e] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-[#131625] border border-[#22283e] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Priority: All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="bg-[#131625] border border-[#22283e] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Project: All</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="bg-[#131625] border border-[#22283e] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Assignee: All</option>
            {team.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Secondary Filter row: Tag pills & Clear filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Tags:</span>
            <button
              onClick={() => setTagFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                tagFilter === 'all'
                  ? 'bg-[#e5c07b]/15 text-[#e5c07b] border-[#e5c07b]/30'
                  : 'bg-[#141726] text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                  tagFilter === tag
                    ? 'bg-[#e5c07b]/15 text-[#e5c07b] border-[#e5c07b]/30'
                    : 'bg-[#141726] text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Sorting controls */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="text-[11px] text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-[#141726] border border-[#23283e] rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Created Date</option>
                <option value="title">Alphabetical</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                className="p-1 rounded bg-[#141726] border border-[#23283e] hover:text-white text-slate-400"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/30 transition-all cursor-pointer"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Kanban or List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks match your criteria"
          description={
            hasActiveFilters
              ? 'Try modifying your filters or clearing search criteria to see your tasks.'
              : 'Your task list is empty. Create your first task to get started.'
          }
          actionText={hasActiveFilters ? 'Clear Filters' : '+ Create Task'}
          onAction={hasActiveFilters ? clearFilters : onOpenCreateTask}
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban Board with Real Drag and Drop */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {kanbanColumns.map(col => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            const isDropTarget = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, col.id)}
                className={`flex flex-col rounded-2xl bg-[#0b0c15] border transition-all duration-150 min-h-[540px] p-3.5 shadow-xl ${
                  isDropTarget
                    ? 'border-[#e5c07b] bg-[#121524] ring-2 ring-[#e5c07b]/20 shadow-2xl scale-[1.01]'
                    : 'border-[#1b1f32]'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#181c2e] px-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white tracking-wider uppercase">{col.label}</h4>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold border border-white/5 ${col.bgBadge}`}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={onOpenCreateTask}
                    className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/5"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Drop Zone / Task Cards List */}
                <div className="space-y-3 flex-1">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 border border-dashed border-[#1f243a] rounded-xl flex items-center justify-center text-xs text-slate-500 italic select-none">
                      Drop tasks here
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        project={projects.find(p => p.id === task.projectId)}
                        assignee={team.find(u => u.id === task.assigneeId)}
                        onToggleComplete={onToggleCompleteTask}
                        onClick={onSelectTask}
                        isDraggable={true}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View (Table) */
        <div className="rounded-2xl bg-[#0b0c15] border border-[#1b1f32] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1b1f32] bg-[#0e101a] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Done</th>
                  <th className="py-3.5 px-4">Task</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161928] text-xs">
                {filteredTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  const assignee = team.find(u => u.id === task.assigneeId);
                  const isCompleted = task.status === 'Completed';

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`hover:bg-[#121422] transition-colors cursor-pointer group ${
                        isCompleted ? 'bg-[#090b12]/50 text-slate-500' : ''
                      }`}
                    >
                      {/* Interactive Checkbox */}
                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onToggleCompleteTask(task)}
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            isCompleted
                              ? 'bg-[#e5c07b] border-[#e5c07b] text-black shadow-[0_0_6px_rgba(229,192,123,0.3)]'
                              : 'border-[#313854] bg-[#141726] hover:border-[#e5c07b]'
                          }`}
                        >
                          {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Title & tags */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <span
                          className={`font-semibold block ${
                            isCompleted ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {task.tags.slice(0, 3).map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171a2b] text-slate-400 border border-white/5"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {project ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
                            style={{
                              backgroundColor: `${project.color}15`,
                              color: project.color,
                              borderColor: `${project.color}35`
                            }}
                          >
                            {project.name}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={task.status} size="sm" />
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <DeadlineBadge
                          statusText={task.deadlineStatus}
                          isOverdue={task.isOverdue && !isCompleted}
                          isDueToday={task.isDueToday && !isCompleted}
                          isDueSoon={task.isDueSoon && !isCompleted}
                          dueDate={task.dueDate}
                        />
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Avatar user={assignee} size="xs" showStatus={true} />
                          <span className="text-slate-300 text-xs">{assignee?.name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => onSelectTask(task)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
