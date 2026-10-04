// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { Task, Project, User, NotificationItem, AnalyticsData, TaskStatus } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Sidebar, NavSection } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TeamPage } from './pages/TeamPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

// Overlays & Modals
import { CreateTaskModal } from './components/tasks/CreateTaskModal';
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { TaskDetailsPanel } from './components/tasks/TaskDetailsPanel';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

const AppContent: React.FC = () => {
  const { currentUser, setCurrentUser } = useTheme();
  const { showToast } = useToast();

  const getInitialSection = (): NavSection => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as NavSection;
      const valid: NavSection[] = ['dashboard', 'tasks', 'projects', 'calendar', 'analytics', 'team', 'notifications', 'settings', 'profile'];
      if (valid.includes(hash)) return hash;
    }
    return 'dashboard';
  };

  const [currentSection, setCurrentSection] = useState<NavSection>(getInitialSection);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Sync hash with currentSection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = currentSection;
      const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '') as NavSection;
        const valid: NavSection[] = ['dashboard', 'tasks', 'projects', 'calendar', 'analytics', 'team', 'notifications', 'settings', 'profile'];
        if (valid.includes(hash)) {
          setCurrentSection(hash);
        }
      };
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [currentSection]);

  // Modals state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskDefaultDate, setCreateTaskDefaultDate] = useState<string | null>(null);
  const [createTaskDefaultProj, setCreateTaskDefaultProj] = useState<string | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedProjects, fetchedTeam, fetchedNotifs, fetchedAnalytics] =
        await Promise.all([
          api.getTasks(),
          api.getProjects(),
          api.getTeam(),
          api.getNotifications(),
          api.getAnalytics()
        ]);

      setTasks(fetchedTasks);
      setProjects(fetchedProjects);
      setTeam(fetchedTeam);
      setNotifications(fetchedNotifs);
      setAnalytics(fetchedAnalytics);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    } else {
      setLoadingInitial(false);
    }
  }, [currentUser, loadData]);

  // Keep selectedTask in sync when tasks list updates
  useEffect(() => {
    if (selectedTask) {
      const fresh = tasks.find(t => t.id === selectedTask.id);
      if (fresh) setSelectedTask(fresh);
    }
  }, [tasks]);

  // ================= TASK ACTIONS =================
  const handleOpenCreateTask = (defaultDueDate?: string, defaultProjectId?: string) => {
    setCreateTaskDefaultDate(defaultDueDate || null);
    setCreateTaskDefaultProj(defaultProjectId || null);
    setIsCreateTaskOpen(true);
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const created = await api.createTask(taskData);
      setTasks(prev => [created, ...prev]);
      showToast(`Task "${created.title}" created successfully!`, 'success');
      // Refresh analytics & projects silently
      api.getAnalytics().then(setAnalytics).catch(() => {});
      api.getProjects().then(setProjects).catch(() => {});
      api.getNotifications().then(setNotifications).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', 'error');
      throw err;
    }
  };

  const handleToggleCompleteTask = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      const updated = await api.updateTask(task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
      showToast(
        nextStatus === 'Completed' ? 'Task marked as completed! 🎯' : 'Task reopened.',
        'success'
      );
      api.getAnalytics().then(setAnalytics).catch(() => {});
      api.getProjects().then(setProjects).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = await api.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      showToast(`Moved to ${newStatus}`, 'info');
      api.getAnalytics().then(setAnalytics).catch(() => {});
      api.getProjects().then(setProjects).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to move task', 'error');
    }
  };

  const handleUpdateTaskDueDate = async (taskId: string, newDueDate: string) => {
    try {
      const updated = await api.updateTask(taskId, { dueDate: newDueDate });
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      showToast('Task deadline rescheduled.', 'info');
      api.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to reschedule deadline', 'error');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updated = await api.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      showToast('Task updated successfully.', 'success');
      api.getAnalytics().then(setAnalytics).catch(() => {});
      api.getProjects().then(setProjects).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      if (selectedTask?.id === taskId) setSelectedTask(null);
      showToast('Task deleted.', 'info');
      api.getAnalytics().then(setAnalytics).catch(() => {});
      api.getProjects().then(setProjects).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  // Subtask handlers
  const handleAddSubtask = async (taskId: string, title: string) => {
    try {
      const { task } = await api.addSubtask(taskId, title);
      setTasks(prev => prev.map(t => (t.id === taskId ? task : t)));
      api.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    try {
      const { task } = await api.updateSubtask(taskId, subtaskId, { completed });
      setTasks(prev => prev.map(t => (t.id === taskId ? task : t)));
      api.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const { task } = await api.deleteSubtask(taskId, subtaskId);
      setTasks(prev => prev.map(t => (t.id === taskId ? task : t)));
      api.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Comment handlers
  const handleAddComment = async (taskId: string, text: string) => {
    try {
      const { task } = await api.addComment(taskId, text);
      setTasks(prev => prev.map(t => (t.id === taskId ? task : t)));
      showToast('Comment added.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteComment = async (taskId: string, commentId: string) => {
    try {
      const { task } = await api.deleteComment(taskId, commentId);
      setTasks(prev => prev.map(t => (t.id === taskId ? task : t)));
      showToast('Comment removed.', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // ================= PROJECT ACTIONS =================
  const handleCreateProject = async (projectData: any) => {
    try {
      const created = await api.createProject(projectData);
      setProjects(prev => [created, ...prev]);
      showToast(`Project "${created.name}" created!`, 'success');
      api.getProjects().then(setProjects).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to create project', 'error');
      throw err;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.projectId !== projectId));
      showToast('Project deleted.', 'info');
      api.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  // ================= TEAM ACTIONS =================
  const handleAddTeamMember = async (data: any) => {
    try {
      const created = await api.addTeamMember(data);
      setTeam(prev => [...prev, created]);
      showToast(`Added ${created.name} to the team!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add collaborator', 'error');
      throw err;
    }
  };

  // ================= NOTIFICATION ACTIONS =================
  const handleMarkNotifRead = async (id: string) => {
    try {
      const updated = await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? updated : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotif = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SETTINGS & RESET =================
  const handleUpdateUser = async (updates: Partial<User>) => {
    try {
      if (currentUser) {
        const updated = { ...currentUser, ...updates };
        setCurrentUser(updated);
        showToast('Profile settings updated.', 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleResetDemoData = async () => {
    try {
      await api.resetDemoData();
      await loadData();
      showToast('Workspace sample dataset restored successfully! ⚡', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset demo data', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await api.login('', ''); // clean logout
    } catch {}
    setCurrentUser(null);
    showToast('Logged out of Taskora.', 'info');
  };

  // If user is not authenticated, show Auth Page
  if (!currentUser) {
    return (
      <AuthPage
        onSuccess={user => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`, 'success');
        }}
      />
    );
  }

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-[#07080b] text-slate-100 overflow-hidden font-sans">
      {/* Persistent Left Sidebar (Desktop) + Mobile Drawer */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        onOpenCreateTask={() => handleOpenCreateTask()}
        taskCount={tasks.length}
        projectCount={projects.length}
        unreadNotifsCount={unreadNotifsCount}
        onLogout={handleLogout}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Body Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Sticky Header */}
        <Header
          currentSection={currentSection}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCreateTask={() => handleOpenCreateTask()}
          onToggleMobileMenu={() => setIsMobileDrawerOpen(prev => !prev)}
          notifications={notifications}
          onNotificationClick={notif => {
            if (notif.taskId) {
              const t = tasks.find(item => item.id === notif.taskId);
              if (t) setSelectedTask(t);
            }
          }}
          onMarkAllNotificationsRead={handleMarkAllNotifsRead}
          onNavigate={setCurrentSection}
        />

        {/* Scrollable Main Workspace View */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-20 md:pb-8">
          {currentSection === 'dashboard' && (
            <DashboardPage
              tasks={tasks}
              projects={projects}
              team={team}
              currentUser={currentUser}
              analyticsStats={analytics?.stats ?? null}
              onOpenCreateTask={handleOpenCreateTask}
              onToggleCompleteTask={handleToggleCompleteTask}
              onSelectTask={setSelectedTask}
              onNavigateProjects={() => setCurrentSection('projects')}
              onNavigateTasks={() => setCurrentSection('tasks')}
            />
          )}

          {currentSection === 'tasks' && (
            <TasksPage
              tasks={tasks}
              projects={projects}
              team={team}
              onToggleCompleteTask={handleToggleCompleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onSelectTask={setSelectedTask}
              onOpenCreateTask={() => handleOpenCreateTask()}
            />
          )}

          {currentSection === 'projects' && (
            <ProjectsPage
              projects={projects}
              tasks={tasks}
              team={team}
              onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              onDeleteProject={handleDeleteProject}
              onToggleCompleteTask={handleToggleCompleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onSelectTask={setSelectedTask}
              onOpenCreateTask={handleOpenCreateTask}
            />
          )}

          {currentSection === 'calendar' && (
            <CalendarPage
              tasks={tasks}
              projects={projects}
              team={team}
              onSelectTask={setSelectedTask}
              onOpenCreateTask={handleOpenCreateTask}
              onUpdateTaskDueDate={handleUpdateTaskDueDate}
              onToggleCompleteTask={handleToggleCompleteTask}
              onCreateTask={handleCreateTask}
            />
          )}

          {currentSection === 'analytics' && <AnalyticsPage analytics={analytics} />}

          {currentSection === 'team' && (
            <TeamPage
              team={team}
              tasks={tasks}
              onAddMember={handleAddTeamMember}
              onFilterTasksByMember={memberId => {
                setCurrentSection('tasks');
              }}
            />
          )}

          {currentSection === 'notifications' && (
            <NotificationsPage
              notifications={notifications}
              onMarkRead={handleMarkNotifRead}
              onMarkAllRead={handleMarkAllNotifsRead}
              onDeleteNotification={handleDeleteNotif}
              onSelectTaskById={taskId => {
                const t = tasks.find(item => item.id === taskId);
                if (t) setSelectedTask(t);
              }}
            />
          )}

          {currentSection === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Dock Bar */}
      <MobileNav currentSection={currentSection} onNavigate={setCurrentSection} />

      {/* Modals & Slide-outs */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        team={team}
        defaultProjectId={createTaskDefaultProj}
        defaultDueDate={createTaskDefaultDate}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSubmit={handleCreateProject}
        team={team}
      />

      <TaskDetailsPanel
        task={selectedTask}
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onAddSubtask={handleAddSubtask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        projects={projects}
        team={team}
        currentUser={currentUser}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTask={task => {
          setSelectedTask(task);
        }}
        onSelectProject={projectId => {
          setCurrentSection('projects');
        }}
        onSelectTeam={userId => {
          setCurrentSection('team');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
