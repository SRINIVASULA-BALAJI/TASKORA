// src/pages/ProjectsPage.tsx
import React, { useState } from 'react';
import { Project, Task, User, TaskStatus } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { AvatarGroup, Avatar } from '../components/common/Avatar';
import { PriorityBadge, DeadlineBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { TaskCard } from '../components/tasks/TaskCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  FolderKanban,
  Plus,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Kanban,
  List,
  Folder
} from 'lucide-react';

interface ProjectsPageProps {
  projects: Project[];
  tasks: Task[];
  team: User[];
  onOpenCreateProject: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onToggleCompleteTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: (defaultProjectId?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  tasks,
  team,
  onOpenCreateProject,
  onDeleteProject,
  onToggleCompleteTask,
  onUpdateTaskStatus,
  onSelectTask,
  onOpenCreateTask
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectTab, setProjectTab] = useState<'tasks' | 'team'>('tasks');
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban');
  const [deleteConfirmProjId, setDeleteConfirmProjId] = useState<string | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = selectedProject
    ? tasks.filter(t => t.projectId === selectedProject.id)
    : [];

  const projectMembers = selectedProject
    ? team.filter(u => selectedProject.members.includes(u.id))
    : [];

  const handleDeleteProject = async () => {
    if (deleteConfirmProjId) {
      await onDeleteProject(deleteConfirmProjId);
      if (selectedProjectId === deleteConfirmProjId) {
        setSelectedProjectId(null);
      }
      setDeleteConfirmProjId(null);
    }
  };

  // If a project is selected, show Project Details View!
  if (selectedProject) {
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === 'Completed').length;
    const inProgress = projectTasks.filter(t => t.status === 'In Progress').length;
    const pending = projectTasks.filter(t => t.status === 'To Do' || t.status === 'Review').length;
    const overdue = projectTasks.filter(t => t.isOverdue && t.status !== 'Completed').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Back Button & Project Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedProjectId(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenCreateTask(selectedProject.id)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Task to Project
            </Button>
            <button
              onClick={() => setDeleteConfirmProjId(selectedProject.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Card Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0f121e] to-[#0c0d16] border border-[#21263d] shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-semibold border"
                  style={{
                    backgroundColor: `${selectedProject.color}15`,
                    color: selectedProject.color,
                    borderColor: `${selectedProject.color}35`
                  }}
                >
                  {selectedProject.category}
                </span>
                <PriorityBadge priority={selectedProject.priority} size="sm" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {selectedProject.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:items-end">
              <span className="text-xs text-slate-400 mb-1">Overall Progress</span>
              <span className="text-2xl font-extrabold text-white font-mono">{progress}%</span>
              {selectedProject.deadline && (
                <div className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Target: {new Date(selectedProject.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <ProgressBar progress={progress} color={selectedProject.color} height="md" />

          {/* Project Overview 4 Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.04]">
            <div className="p-3 rounded-xl bg-[#131625] border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Tasks</span>
              <span className="text-xl font-bold text-white font-mono">{total}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#131625] border border-white/5">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Completed</span>
              <span className="text-xl font-bold text-emerald-300 font-mono">{completed}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#131625] border border-white/5">
              <span className="text-[10px] text-sky-400 uppercase tracking-wider block">In Progress</span>
              <span className="text-xl font-bold text-sky-300 font-mono">{inProgress}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#131625] border border-white/5">
              <span className="text-[10px] text-rose-400 uppercase tracking-wider block">Overdue</span>
              <span className="text-xl font-bold text-rose-300 font-mono">{overdue}</span>
            </div>
          </div>
        </div>

        {/* Project Tabs (Tasks & Team) */}
        <div className="flex items-center justify-between border-b border-[#1b2034] pb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setProjectTab('tasks')}
              className={`text-xs font-semibold tracking-wider uppercase pb-2 border-b-2 transition-all ${
                projectTab === 'tasks'
                  ? 'border-[#e5c07b] text-[#e5c07b]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Project Tasks ({projectTasks.length})
            </button>
            <button
              onClick={() => setProjectTab('team')}
              className={`text-xs font-semibold tracking-wider uppercase pb-2 border-b-2 transition-all ${
                projectTab === 'team'
                  ? 'border-[#e5c07b] text-[#e5c07b]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Team Members ({projectMembers.length})
            </button>
          </div>

          {projectTab === 'tasks' && (
            <div className="flex items-center gap-1 p-1 bg-[#10121d] rounded-lg border border-[#21263d]">
              <button
                onClick={() => setTaskViewMode('kanban')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  taskViewMode === 'kanban' ? 'bg-[#1e2338] text-white' : 'text-slate-400'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTaskViewMode('list')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  taskViewMode === 'list' ? 'bg-[#1e2338] text-white' : 'text-slate-400'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Project Tab Content */}
        {projectTab === 'tasks' ? (
          projectTasks.length === 0 ? (
            <EmptyState
              title="No tasks in this project yet"
              description="Create your first task for this project and start managing deliverables."
              actionText="+ Create Task"
              onAction={() => onOpenCreateTask(selectedProject.id)}
            />
          ) : taskViewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
              {(['To Do', 'In Progress', 'Review', 'Completed'] as TaskStatus[]).map(statusCol => {
                const colTasks = projectTasks.filter(t => t.status === statusCol);
                return (
                  <div
                    key={statusCol}
                    className="flex flex-col rounded-2xl bg-[#0b0c15] border border-[#1b1f32] p-3.5 min-h-[400px] shadow-lg"
                  >
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#181c2e]">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {statusCol}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#181c2d] text-slate-400">
                        {colTasks.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {colTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          assignee={team.find(u => u.id === task.assigneeId)}
                          onToggleComplete={onToggleCompleteTask}
                          onClick={onSelectTask}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {projectTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignee={team.find(u => u.id === task.assigneeId)}
                  onToggleComplete={onToggleCompleteTask}
                  onClick={onSelectTask}
                />
              ))}
            </div>
          )
        ) : (
          /* Team Members Tab */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectMembers.map(member => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-[#0f111a] border border-[#1e2336] flex items-center gap-3"
              >
                <Avatar user={member} size="md" showStatus={true} />
                <div>
                  <h5 className="text-sm font-semibold text-white">{member.name}</h5>
                  <p className="text-xs text-slate-400">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          isOpen={deleteConfirmProjId !== null}
          onClose={() => setDeleteConfirmProjId(null)}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          description="Are you sure you want to delete this project and its tasks? This action cannot be reversed."
          confirmText="Delete Project"
          isDanger={true}
        />
      </div>
    );
  }

  // All Projects Grid View
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Active Projects</h2>
          <p className="text-xs text-slate-400">Track initiatives, milestones, and progress</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreateProject}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          title="No projects created yet"
          description="Projects help you organize groups of tasks and track larger initiatives."
          actionText="+ Create Project"
          onAction={onOpenCreateProject}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map(proj => {
            const projMembers = team.filter(u => proj.members.includes(u.id));
            const progress = proj.stats?.progress ?? 0;
            const total = proj.stats?.total ?? 0;
            const completed = proj.stats?.completed ?? 0;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className="group p-5 rounded-2xl bg-[#0e101a] hover:bg-[#131625] border border-[#1e2236] hover:border-[#323955] shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Category & Priority */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-semibold border"
                      style={{
                        backgroundColor: `${proj.color}15`,
                        color: proj.color,
                        borderColor: `${proj.color}35`
                      }}
                    >
                      {proj.category}
                    </span>
                    <PriorityBadge priority={proj.priority} size="sm" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white group-hover:text-[#e5c07b] transition-colors leading-snug">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Completion</span>
                    <span className="font-bold text-white font-mono">{progress}%</span>
                  </div>
                  <ProgressBar progress={progress} color={proj.color} height="sm" />
                </div>

                {/* Bottom row: Members, Task count, Deadline */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <AvatarGroup users={projMembers} max={3} size="xs" />
                    <span className="font-mono text-[11px]">
                      {completed}/{total} tasks
                    </span>
                  </div>

                  {proj.deadline && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(proj.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
