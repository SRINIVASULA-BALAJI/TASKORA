// src/types/index.ts

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';
export type AccentColor = 'gold' | 'purple' | 'emerald' | 'cyan';
export type LayoutDensity = 'comfortable' | 'compact';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  department?: string;
  accent?: AccentColor;
  density?: LayoutDensity;
  workload?: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    rate: number;
  };
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  assigneeId: string;
  tags: string[];
  estimatedTime?: string;
  reminder?: boolean;
  subtasks: Subtask[];
  comments: Comment[];
  activity: ActivityItem[];
  createdAt: string;
  // Computed helpers
  isOverdue?: boolean;
  overdueDays?: number;
  isDueToday?: boolean;
  isDueSoon?: boolean;
  deadlineStatus?: string;
  subtaskStats?: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  progress: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  deadline: string | null;
  priority: Priority;
  color: string;
  members: string[];
  createdAt: string;
  stats?: ProjectStats;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'assignment' | 'completion' | 'review' | 'comment' | 'overdue';
  read: boolean;
  createdAt: string;
  taskId?: string;
}

export interface UserSettings {
  theme: string;
  accentColor: AccentColor;
  layoutDensity: LayoutDensity;
  notifications: {
    deadlineReminders: boolean;
    taskAssignments: boolean;
    comments: boolean;
    projectUpdates: boolean;
  };
  preferences: {
    defaultPriority: Priority;
    defaultView: 'list' | 'kanban';
    startDayOfWeek: 'monday' | 'sunday';
  };
}

export interface AnalyticsStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
  productivityScore: number;
  scoreFeedback: string;
  subtaskStats: {
    total: number;
    completed: number;
    rate: number;
  };
}

export interface WeeklyTrend {
  day: string;
  completed: number;
  created: number;
}

export interface DistributionItem {
  name: string;
  count: number;
  color: string;
}

export interface ProjectProgressItem {
  id: string;
  name: string;
  color: string;
  progress: number;
  total: number;
  completed: number;
}

export interface AnalyticsData {
  stats: AnalyticsStats;
  weeklyTrends: WeeklyTrend[];
  statusDistribution: DistributionItem[];
  priorityDistribution: DistributionItem[];
  projectProgress: ProjectProgressItem[];
}

export interface SearchResults {
  tasks: Task[];
  projects: Project[];
  team: User[];
  comments: (Comment & { taskId: string; taskTitle: string })[];
}
