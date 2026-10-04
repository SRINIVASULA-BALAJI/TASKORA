// src/services/api.ts
import { Task, Project, User, NotificationItem, UserSettings, AnalyticsData, SearchResults } from '../types';
import { localStore } from './localStore';

/**
 * Taskora Resilient API Client
 * 
 * Works 100% standalone out-of-the-box in the browser via `localStore` (localStorage).
 * Requires ZERO backend hosting, ZERO database servers, and produces ZERO server errors.
 * 
 * If a custom remote API is optionally configured via `VITE_API_URL`, it will attempt
 * remote synchronization and seamlessly fall back to `localStore` on any network failure.
 */

const REMOTE_API_URL = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL 
  ? (import.meta as any).env.VITE_API_URL 
  : '';

const HAS_REMOTE_BACKEND = Boolean(REMOTE_API_URL && REMOTE_API_URL.trim() !== '');

async function safeRemoteRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  if (!HAS_REMOTE_BACKEND) return null;
  try {
    const url = `${REMOTE_API_URL}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<User> {
    const remote = await safeRemoteRequest<{ success: boolean; user: User }>('/auth/me');
    if (remote?.user) return remote.user;
    return localStore.getCurrentUser();
  },

  async login(email = 'alex@taskora.io', password = ''): Promise<{ user: User; token: string }> {
    const remote = await safeRemoteRequest<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (remote?.user && remote?.token) {
      return { user: remote.user, token: remote.token };
    }
    return localStore.login(email, password);
  },

  async register(name: string, email: string): Promise<{ user: User; token: string }> {
    const remote = await safeRemoteRequest<{ success: boolean; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email })
    });
    if (remote?.user && remote?.token) {
      return { user: remote.user, token: remote.token };
    }
    return localStore.register(name, email);
  },

  async logout(): Promise<boolean> {
    await safeRemoteRequest('/auth/logout', { method: 'POST' });
    return localStore.logout();
  },

  // Tasks
  async getTasks(params: Record<string, string> = {}): Promise<Task[]> {
    const query = new URLSearchParams(params).toString();
    const remote = await safeRemoteRequest<{ success: boolean; tasks: Task[] }>(`/tasks${query ? `?${query}` : ''}`);
    if (remote?.tasks) return remote.tasks;
    return localStore.getTasks(params);
  },

  async getTask(id: string): Promise<Task> {
    const remote = await safeRemoteRequest<{ success: boolean; task: Task }>(`/tasks/${id}`);
    if (remote?.task) return remote.task;
    const t = localStore.getTask(id);
    if (!t) throw new Error('Task not found');
    return t;
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const remote = await safeRemoteRequest<{ success: boolean; task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
    if (remote?.task) return remote.task;
    return localStore.createTask(taskData);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const remote = await safeRemoteRequest<{ success: boolean; task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (remote?.task) return remote.task;
    return localStore.updateTask(id, updates);
  },

  async deleteTask(id: string): Promise<boolean> {
    const remote = await safeRemoteRequest<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE'
    });
    if (remote && typeof remote.success === 'boolean') return remote.success;
    return localStore.deleteTask(id);
  },

  // Subtasks
  async addSubtask(taskId: string, title: string): Promise<{ task: Task }> {
    const remote = await safeRemoteRequest<{ success: boolean; task: Task }>(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title })
    });
    if (remote?.task) return { task: remote.task };
    const task = localStore.addSubtask(taskId, title);
    return { task };
  },

  async updateSubtask(taskId: string, subtaskId: string, updates: { completed?: boolean; title?: string }): Promise<{ task: Task }> {
    const remote = await safeRemoteRequest<{ success: boolean; task: Task }>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (remote?.task) return { task: remote.task };
    const task = localStore.updateSubtask(taskId, subtaskId, updates);
    return { task };
  },

  async deleteSubtask(taskId: string, subtaskId: string): Promise<{ task: Task }> {
    const remote = await safeRemoteRequest<{ success: boolean; task: Task }>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE'
    });
    if (remote?.task) return { task: remote.task };
    const task = localStore.deleteSubtask(taskId, subtaskId);
    return { task };
  },

  // Comments
  async addComment(taskId: string, text: string): Promise<{ task: Task }> {
    const remote = await safeRemoteRequest<{ success: boolean; task: Task }>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
    if (remote?.task) return { task: remote.task };
    const res = localStore.addComment(taskId, text);
    return { task: res.task };
  },

  async deleteComment(taskId: string, commentId: string): Promise<{ task: Task }> {
    const remote = await safeRemoteRequest<{ success: boolean; task: Task }>(`/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE'
    });
    if (remote?.task) return { task: remote.task };
    const task = localStore.deleteComment(taskId, commentId);
    return { task };
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const remote = await safeRemoteRequest<{ success: boolean; projects: Project[] }>('/projects');
    if (remote?.projects) return remote.projects;
    return localStore.getProjects();
  },

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const remote = await safeRemoteRequest<{ success: boolean; project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
    if (remote?.project) return remote.project;
    return localStore.createProject(projectData);
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const remote = await safeRemoteRequest<{ success: boolean; project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (remote?.project) return remote.project;
    return localStore.updateProject(id, updates);
  },

  async deleteProject(id: string): Promise<boolean> {
    const remote = await safeRemoteRequest<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE'
    });
    if (remote && typeof remote.success === 'boolean') return remote.success;
    return localStore.deleteProject(id);
  },

  // Team
  async getTeam(): Promise<User[]> {
    const remote = await safeRemoteRequest<{ success: boolean; team: User[] }>('/team');
    if (remote?.team) return remote.team;
    return localStore.getTeam();
  },

  async addTeamMember(data: { name: string; email: string; role: string; department?: string }): Promise<User> {
    const remote = await safeRemoteRequest<{ success: boolean; user: User }>('/team', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (remote?.user) return remote.user;
    return localStore.addTeamMember(data);
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const remote = await safeRemoteRequest<{ success: boolean; notifications: NotificationItem[] }>('/notifications');
    if (remote?.notifications) return remote.notifications;
    return localStore.getNotifications();
  },

  async markNotificationRead(id: string): Promise<NotificationItem> {
    const remote = await safeRemoteRequest<{ success: boolean; notification: NotificationItem }>(`/notifications/${id}/read`, {
      method: 'PUT'
    });
    if (remote?.notification) return remote.notification;
    return localStore.markNotificationRead(id);
  },

  async markAllNotificationsRead(): Promise<boolean> {
    const remote = await safeRemoteRequest<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT'
    });
    if (remote && typeof remote.success === 'boolean') return remote.success;
    return localStore.markAllNotificationsRead();
  },

  async deleteNotification(id: string): Promise<boolean> {
    const remote = await safeRemoteRequest<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE'
    });
    if (remote && typeof remote.success === 'boolean') return remote.success;
    return localStore.deleteNotification(id);
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const remote = await safeRemoteRequest<{ success: boolean } & AnalyticsData>('/analytics');
    if (remote?.stats) {
      return {
        stats: remote.stats,
        weeklyTrends: remote.weeklyTrends,
        statusDistribution: remote.statusDistribution,
        priorityDistribution: remote.priorityDistribution,
        projectProgress: remote.projectProgress
      };
    }
    return localStore.getAnalytics();
  },

  // Search
  async search(query: string): Promise<SearchResults> {
    const remote = await safeRemoteRequest<{ success: boolean; results: SearchResults }>(`/search?q=${encodeURIComponent(query)}`);
    if (remote?.results) return remote.results;
    return localStore.search(query);
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    const remote = await safeRemoteRequest<{ success: boolean; settings: UserSettings }>('/settings');
    if (remote?.settings) return remote.settings;
    return localStore.getSettings();
  },

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const remote = await safeRemoteRequest<{ success: boolean; settings: UserSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (remote?.settings) return remote.settings;
    return localStore.updateSettings(updates);
  },

  // Reset Demo Data
  async resetDemoData(): Promise<boolean> {
    await safeRemoteRequest('/reset-demo-data', { method: 'POST' });
    return localStore.resetDemoData();
  }
};
