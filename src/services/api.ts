// src/services/api.ts
import { Task, Project, User, NotificationItem, UserSettings, AnalyticsData, SearchResults } from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Server error' }));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<User> {
    const res = await request<{ success: boolean; user: User }>('/auth/me');
    return res.user;
  },

  async login(email?: string, password?: string): Promise<{ user: User; token: string }> {
    const res = await request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return { user: res.user, token: res.token };
  },

  async register(name: string, email: string): Promise<{ user: User; token: string }> {
    const res = await request<{ success: boolean; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email })
    });
    return { user: res.user, token: res.token };
  },

  // Tasks
  async getTasks(params: Record<string, string> = {}): Promise<Task[]> {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/tasks${query ? `?${query}` : ''}`;
    const res = await request<{ success: boolean; tasks: Task[] }>(endpoint);
    return res.tasks;
  },

  async getTask(id: string): Promise<Task> {
    const res = await request<{ success: boolean; task: Task }>(`/tasks/${id}`);
    return res.task;
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const res = await request<{ success: boolean; task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
    return res.task;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await request<{ success: boolean; task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return res.task;
  },

  async deleteTask(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE'
    });
    return res.success;
  },

  // Subtasks
  async addSubtask(taskId: string, title: string): Promise<{ task: Task }> {
    const res = await request<{ success: boolean; task: Task }>(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title })
    });
    return { task: res.task };
  },

  async updateSubtask(taskId: string, subtaskId: string, updates: { completed?: boolean; title?: string }): Promise<{ task: Task }> {
    const res = await request<{ success: boolean; task: Task }>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return { task: res.task };
  },

  async deleteSubtask(taskId: string, subtaskId: string): Promise<{ task: Task }> {
    const res = await request<{ success: boolean; task: Task }>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE'
    });
    return { task: res.task };
  },

  // Comments
  async addComment(taskId: string, text: string): Promise<{ task: Task }> {
    const res = await request<{ success: boolean; task: Task }>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
    return { task: res.task };
  },

  async deleteComment(taskId: string, commentId: string): Promise<{ task: Task }> {
    const res = await request<{ success: boolean; task: Task }>(`/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE'
    });
    return { task: res.task };
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await request<{ success: boolean; projects: Project[] }>('/projects');
    return res.projects;
  },

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const res = await request<{ success: boolean; project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
    return res.project;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const res = await request<{ success: boolean; project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return res.project;
  },

  async deleteProject(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE'
    });
    return res.success;
  },

  // Team
  async getTeam(): Promise<User[]> {
    const res = await request<{ success: boolean; team: User[] }>('/team');
    return res.team;
  },

  async addTeamMember(data: { name: string; email: string; role: string; department?: string }): Promise<User> {
    const res = await request<{ success: boolean; user: User }>('/team', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.user;
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await request<{ success: boolean; notifications: NotificationItem[] }>('/notifications');
    return res.notifications;
  },

  async markNotificationRead(id: string): Promise<NotificationItem> {
    const res = await request<{ success: boolean; notification: NotificationItem }>(`/notifications/${id}/read`, {
      method: 'PUT'
    });
    return res.notification;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    const res = await request<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT'
    });
    return res.success;
  },

  async deleteNotification(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE'
    });
    return res.success;
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await request<{ success: boolean } & AnalyticsData>('/analytics');
    return {
      stats: res.stats,
      weeklyTrends: res.weeklyTrends,
      statusDistribution: res.statusDistribution,
      priorityDistribution: res.priorityDistribution,
      projectProgress: res.projectProgress
    };
  },

  // Search
  async search(query: string): Promise<SearchResults> {
    const res = await request<{ success: boolean; results: SearchResults }>(`/search?q=${encodeURIComponent(query)}`);
    return res.results;
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    const res = await request<{ success: boolean; settings: UserSettings }>('/settings');
    return res.settings;
  },

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const res = await request<{ success: boolean; settings: UserSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return res.settings;
  },

  async resetDemoData(): Promise<boolean> {
    const res = await request<{ success: boolean }>('/reset-demo-data', {
      method: 'POST'
    });
    return res.success;
  }
};
