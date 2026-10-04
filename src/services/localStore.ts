// src/services/localStore.ts
import { Task, Project, User, NotificationItem, UserSettings, AnalyticsData, SearchResults, Priority, TaskStatus } from '../types';

// Helper to generate initial dataset
function createInitialDataset() {
  const now = new Date();

  const formatDate = (date: Date, hours = 18, minutes = 0) => {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  const todayStr = (hours = 18, minutes = 0) => formatDate(now, hours, minutes);
  const addDaysStr = (days: number, hours = 18, minutes = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return formatDate(d, hours, minutes);
  };

  const users: User[] = [
    {
      id: "user_1",
      name: "Alex Vance",
      email: "alex@taskora.io",
      role: "Lead Architect & Product Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "online",
      department: "Engineering"
    },
    {
      id: "user_2",
      name: "Rahul Sharma",
      email: "rahul@taskora.io",
      role: "Senior ML Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "online",
      department: "AI Research"
    },
    {
      id: "user_3",
      name: "Elena Rostova",
      email: "elena@taskora.io",
      role: "Principal Product Designer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      status: "away",
      department: "Product Design"
    },
    {
      id: "user_4",
      name: "Marcus Chen",
      email: "marcus@taskora.io",
      role: "Senior Full-Stack Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      status: "online",
      department: "Frontend"
    },
    {
      id: "user_5",
      name: "Sophia Lin",
      email: "sophia@taskora.io",
      role: "Cloud & Security Specialist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      status: "offline",
      department: "Infrastructure"
    },
    {
      id: "user_6",
      name: "David Kim",
      email: "david@taskora.io",
      role: "Product Strategist",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      status: "online",
      department: "Product"
    }
  ];

  const projects: Project[] = [
    {
      id: "proj_1",
      name: "AI / ML Deep Inference Pipeline",
      description: "Building production PyTorch transformer inference, vector indexing, and automated evaluation metrics.",
      category: "AI & Data Science",
      deadline: addDaysStr(12, 17, 0),
      priority: "Urgent",
      color: "#9d7cd8",
      members: ["user_1", "user_2", "user_5"],
      createdAt: addDaysStr(-14)
    },
    {
      id: "proj_2",
      name: "Next-Gen Taskora Web Platform",
      description: "Developing modern obsidian-royal design system, drag-and-drop workspace, and high-frequency real-time sync.",
      category: "Web Application",
      deadline: addDaysStr(18, 18, 0),
      priority: "High",
      color: "#e5c07b",
      members: ["user_1", "user_3", "user_4"],
      createdAt: addDaysStr(-20)
    },
    {
      id: "proj_3",
      name: "Enterprise Zero-Trust Security",
      description: "Securing microservices, automated SOC2 compliance auditing, and hardware token authentication.",
      category: "Cloud Security",
      deadline: addDaysStr(28, 12, 0),
      priority: "Medium",
      color: "#38bdf8",
      members: ["user_4", "user_5"],
      createdAt: addDaysStr(-30)
    },
    {
      id: "proj_4",
      name: "Product Growth & User Journey",
      description: "Analyzing customer drop-off bottlenecks, in-app onboarding telemetry, and conversion milestones.",
      category: "Growth & Product",
      deadline: addDaysStr(7, 15, 0),
      priority: "Medium",
      color: "#34d399",
      members: ["user_1", "user_6"],
      createdAt: addDaysStr(-10)
    }
  ];

  const tasks: Task[] = [
    {
      id: "task_1",
      title: "Complete Machine Learning Pipeline Assignment",
      description: "Implement dataset loaders, clean raw telemetry features, tune hyperparameters on ResNet backbone, and calculate F1 score.",
      projectId: "proj_1",
      priority: "Urgent",
      status: "In Progress",
      dueDate: todayStr(18, 0),
      assigneeId: "user_2",
      tags: ["#ai", "#ml", "#urgent", "#college"],
      estimatedTime: "4 hrs",
      reminder: true,
      subtasks: [
        { id: "sub_1", title: "Collect and augment dataset", completed: true },
        { id: "sub_2", title: "Clean dataset & remove outlier samples", completed: true },
        { id: "sub_3", title: "Train model with AdamW optimizer", completed: false },
        { id: "sub_4", title: "Test model validation loss on unseen test set", completed: false },
        { id: "sub_5", title: "Prepare final presentation & metrics report", completed: false }
      ],
      comments: [
        {
          id: "comm_1",
          userId: "user_2",
          userName: "Rahul Sharma",
          userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          text: "Dataset cleaning is completed. Starting training loop with mixed precision.",
          createdAt: addDaysStr(0, 11, 20)
        },
        {
          id: "comm_2",
          userId: "user_1",
          userName: "Alex Vance",
          userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          text: "Make sure to log learning curves and evaluation metrics to TensorBoard.",
          createdAt: addDaysStr(0, 12, 10)
        }
      ],
      activity: [
        { id: "act_1", text: "Alex Vance created this task", timestamp: addDaysStr(-2, 10, 0) },
        { id: "act_2", text: "Task assigned to Rahul Sharma", timestamp: addDaysStr(-2, 10, 5) },
        { id: "act_3", text: "Priority changed to Urgent", timestamp: addDaysStr(-1, 9, 30) },
        { id: "act_4", text: "Status changed to In Progress", timestamp: addDaysStr(0, 9, 0) },
        { id: "act_5", text: "Subtask 'Clean dataset' marked completed", timestamp: addDaysStr(0, 11, 25) }
      ],
      createdAt: addDaysStr(-2, 10, 0)
    },
    {
      id: "task_2",
      title: "Design Royal Obsidian Glassmorphic UI System",
      description: "Establish dark royal-black tokens, subtle glass surfaces, champagne gold highlights, and typography scales.",
      projectId: "proj_2",
      priority: "High",
      status: "Review",
      dueDate: addDaysStr(1, 14, 0),
      assigneeId: "user_3",
      tags: ["#design", "#ui", "#system"],
      estimatedTime: "6 hrs",
      reminder: true,
      subtasks: [
        { id: "sub_21", title: "Define royal obsidian color tokens (#07080B, #131622)", completed: true },
        { id: "sub_22", title: "Verify WCAG 2.1 AA text contrast compliance", completed: true },
        { id: "sub_23", title: "Create Figma reusable card and button component library", completed: true },
        { id: "sub_24", title: "Export SVG icons and pass design tokens to frontend engineers", completed: false }
      ],
      comments: [
        {
          id: "comm_21",
          userId: "user_3",
          userName: "Elena Rostova",
          userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
          text: "Design tokens are ready for review. The gold and electric purple accents feel very refined.",
          createdAt: addDaysStr(-1, 16, 40)
        }
      ],
      activity: [
        { id: "act_21", text: "Elena Rostova created task", timestamp: addDaysStr(-3, 14, 0) },
        { id: "act_22", text: "Status changed to In Progress", timestamp: addDaysStr(-2, 10, 0) },
        { id: "act_23", text: "Status moved to Review", timestamp: addDaysStr(-1, 17, 0) }
      ],
      createdAt: addDaysStr(-3, 14, 0)
    },
    {
      id: "task_3",
      title: "Implement Real-time Drag-and-Drop Scheduling",
      description: "Build seamless drag interactions for Kanban columns and Calendar date-cells with instant persistence.",
      projectId: "proj_2",
      priority: "High",
      status: "In Progress",
      dueDate: todayStr(17, 30),
      assigneeId: "user_4",
      tags: ["#coding", "#kanban", "#features"],
      estimatedTime: "5 hrs",
      reminder: true,
      subtasks: [
        { id: "sub_31", title: "Wire dragstart, dragover, and drop event handlers", completed: true },
        { id: "sub_32", title: "Implement smooth dropzone highlight and ghost styling", completed: true },
        { id: "sub_33", title: "Sync updated status/deadline via REST endpoint with optimistic UI", completed: true },
        { id: "sub_34", title: "Add mobile touch fallback and keyboard reorder support", completed: false }
      ],
      comments: [
        {
          id: "comm_31",
          userId: "user_4",
          userName: "Marcus Chen",
          userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          text: "HTML5 drag and drop is integrated and feels buttery smooth.",
          createdAt: addDaysStr(0, 10, 15)
        }
      ],
      activity: [
        { id: "act_31", text: "Alex Vance created task", timestamp: addDaysStr(-2, 11, 0) },
        { id: "act_32", text: "Assigned to Marcus Chen", timestamp: addDaysStr(-2, 11, 2) },
        { id: "act_33", text: "Moved to In Progress", timestamp: addDaysStr(0, 9, 30) }
      ],
      createdAt: addDaysStr(-2, 11, 0)
    },
    {
      id: "task_4",
      title: "Audit Multi-region Cloud Secrets & IAM Roles",
      description: "Scan active cloud role privileges, implement least-privilege policies, and automate credential rotation.",
      projectId: "proj_3",
      priority: "Medium",
      status: "To Do",
      dueDate: addDaysStr(4, 16, 0),
      assigneeId: "user_5",
      tags: ["#security", "#devops", "#compliance"],
      estimatedTime: "3.5 hrs",
      reminder: false,
      subtasks: [
        { id: "sub_41", title: "Scan AWS IAM policies for wildcard permissions", completed: false },
        { id: "sub_42", title: "Implement automated HashiCorp Vault secrets rotation", completed: false },
        { id: "sub_43", title: "Audit Kubernetes service account RBAC bindings", completed: false }
      ],
      comments: [],
      activity: [
        { id: "act_41", text: "Sophia Lin created task", timestamp: addDaysStr(-1, 14, 0) }
      ],
      createdAt: addDaysStr(-1, 14, 0)
    },
    {
      id: "task_5",
      title: "Customer Discovery Interviews & Metric Synthesis",
      description: "Conduct 10 in-depth executive customer interviews to validate Q4 enterprise feature prioritization.",
      projectId: "proj_4",
      priority: "Medium",
      status: "Completed",
      dueDate: addDaysStr(-2, 18, 0),
      assigneeId: "user_6",
      tags: ["#research", "#product", "#meeting"],
      estimatedTime: "8 hrs",
      reminder: false,
      subtasks: [
        { id: "sub_51", title: "Recruit 10 prospective enterprise leads", completed: true },
        { id: "sub_52", title: "Conduct user feedback video sessions", completed: true },
        { id: "sub_53", title: "Synthesize insights into actionable feature matrix", completed: true }
      ],
      comments: [
        {
          id: "comm_51",
          userId: "user_6",
          userName: "David Kim",
          userAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
          text: "Executive interviews completed! Results documented in roadmap deck.",
          createdAt: addDaysStr(-2, 17, 0)
        }
      ],
      activity: [
        { id: "act_51", text: "David Kim created task", timestamp: addDaysStr(-5, 9, 0) },
        { id: "act_52", text: "Task marked Completed", timestamp: addDaysStr(-2, 17, 30) }
      ],
      createdAt: addDaysStr(-5, 9, 0)
    },
    {
      id: "task_6",
      title: "Submit Semester Benchmark & Algorithm Report",
      description: "Compile algorithmic benchmark comparisons, memory footprint profiles, and export formal PDF documentation.",
      projectId: "proj_1",
      priority: "Urgent",
      status: "To Do",
      dueDate: addDaysStr(-2, 18, 0), // Overdue
      assigneeId: "user_1",
      tags: ["#college", "#report", "#urgent"],
      estimatedTime: "2.5 hrs",
      reminder: true,
      subtasks: [
        { id: "sub_61", title: "Benchmark latency under batch size 64", completed: true },
        { id: "sub_62", title: "Write executive conclusion section", completed: false },
        { id: "sub_63", title: "Compile final PDF and submit to portal", completed: false }
      ],
      comments: [
        {
          id: "comm_61",
          userId: "user_2",
          userName: "Rahul Sharma",
          userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          text: "Benchmark charts are compiled. Ready for your conclusion write-up.",
          createdAt: addDaysStr(-2, 12, 0)
        }
      ],
      activity: [
        { id: "act_61", text: "Alex Vance created task", timestamp: addDaysStr(-4, 10, 0) },
        { id: "act_62", text: "System marked task as Overdue", timestamp: addDaysStr(-1, 0, 0) }
      ],
      createdAt: addDaysStr(-4, 10, 0)
    },
    {
      id: "task_7",
      title: "Optimize Vector DB Latency Under High Concurrency",
      description: "Benchmark Qdrant and Milvus index queries under 5,000 requests/sec with p99 latency target < 20ms.",
      projectId: "proj_1",
      priority: "High",
      status: "To Do",
      dueDate: addDaysStr(6, 17, 0),
      assigneeId: "user_2",
      tags: ["#ai", "#performance", "#backend"],
      estimatedTime: "4 hrs",
      reminder: false,
      subtasks: [
        { id: "sub_71", title: "Run baseline k6 stress tests", completed: false },
        { id: "sub_72", title: "Optimize HNSW index parameters (M and efConstruction)", completed: false }
      ],
      comments: [],
      activity: [
        { id: "act_71", text: "Alex Vance created task", timestamp: addDaysStr(0, 10, 0) }
      ],
      createdAt: addDaysStr(0, 10, 0)
    },
    {
      id: "task_8",
      title: "Setup Automated Integration Test Pipeline",
      description: "Configure GitHub Actions matrix for Node.js, end-to-end Playwright tests, and automated coverage reports.",
      projectId: "proj_3",
      priority: "Low",
      status: "Completed",
      dueDate: addDaysStr(-1, 15, 0),
      assigneeId: "user_5",
      tags: ["#ci", "#testing"],
      estimatedTime: "3 hrs",
      reminder: false,
      subtasks: [
        { id: "sub_81", title: "Write workflow yaml configurations", completed: true },
        { id: "sub_82", title: "Set up test container caching", completed: true }
      ],
      comments: [],
      activity: [
        { id: "act_81", text: "Sophia Lin created task", timestamp: addDaysStr(-4, 9, 0) },
        { id: "act_82", text: "Task marked Completed", timestamp: addDaysStr(-1, 14, 30) }
      ],
      createdAt: addDaysStr(-4, 9, 0)
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: "notif_1",
      title: "Deadline Approaching",
      message: "Machine Learning Pipeline Assignment is due today at 6:00 PM.",
      type: "deadline",
      read: false,
      createdAt: addDaysStr(0, 8, 30),
      taskId: "task_1"
    },
    {
      id: "notif_2",
      title: "Task Assigned",
      message: "Rahul Sharma assigned you a new task: Submit Semester Benchmark & Algorithm Report.",
      type: "assignment",
      read: false,
      createdAt: addDaysStr(-1, 14, 15),
      taskId: "task_6"
    },
    {
      id: "notif_3",
      title: "Task in Review",
      message: "Elena marked 'Design Royal Obsidian Glassmorphic UI System' as ready for Review.",
      type: "review",
      read: false,
      createdAt: addDaysStr(-1, 17, 5),
      taskId: "task_2"
    },
    {
      id: "notif_4",
      title: "Overdue Alert",
      message: "Submit Semester Benchmark & Algorithm Report is 2 days overdue.",
      type: "overdue",
      read: false,
      createdAt: addDaysStr(0, 6, 0),
      taskId: "task_6"
    },
    {
      id: "notif_5",
      title: "New Comment",
      message: "Marcus Chen commented on 'Implement Real-time Drag-and-Drop Scheduling'.",
      type: "comment",
      read: true,
      createdAt: addDaysStr(0, 10, 16),
      taskId: "task_3"
    }
  ];

  const settings: UserSettings = {
    theme: "royal-black",
    accentColor: "gold",
    layoutDensity: "comfortable",
    notifications: {
      deadlineReminders: true,
      taskAssignments: true,
      comments: true,
      projectUpdates: true
    },
    preferences: {
      defaultPriority: "Medium",
      defaultView: "list",
      startDayOfWeek: "monday"
    }
  };

  return {
    currentUser: users[0],
    users,
    projects,
    tasks,
    notifications,
    settings
  };
}

// Deadline calculation and enrichment helper
export function enrichTask(task: Task): Task {
  const now = new Date();
  const due = task.dueDate ? new Date(task.dueDate) : null;

  let deadlineStatus = "Upcoming";
  let isOverdue = false;
  let overdueDays = 0;
  let isDueToday = false;
  let isDueSoon = false;

  if (task.status === "Completed") {
    deadlineStatus = "Completed";
  } else if (due) {
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const isSameDay =
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate();

    if (diffMs < 0 && !isSameDay) {
      isOverdue = true;
      overdueDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      deadlineStatus = `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`;
    } else if (isSameDay) {
      isDueToday = true;
      deadlineStatus = "Due Today";
    } else if (diffDays <= 3 && diffDays > 0) {
      isDueSoon = true;
      deadlineStatus = `Due in ${diffDays}d`;
    } else {
      deadlineStatus = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  const totalSubtasks = (task.subtasks || []).length;
  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;
  const subtaskProgress =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return {
    ...task,
    isOverdue,
    overdueDays,
    isDueToday,
    isDueSoon,
    deadlineStatus,
    subtaskStats: {
      total: totalSubtasks,
      completed: completedSubtasks,
      percentage: subtaskProgress
    }
  };
}

// In-Browser Resilient Storage Class
class LocalStorageStore {
  private STORAGE_KEY = 'taskora_state_v1';
  private USER_KEY = 'taskora_current_user_v1';

  private state: {
    users: User[];
    projects: Project[];
    tasks: Task[];
    notifications: NotificationItem[];
    settings: UserSettings;
    currentUser: User;
  };

  constructor() {
    this.state = this.loadState();
  }

  private loadState() {
    if (typeof window === 'undefined') {
      return createInitialDataset();
    }

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.tasks && parsed.projects && parsed.users) {
          // Check saved current user
          const savedUserRaw = localStorage.getItem(this.USER_KEY);
          const currentUser = savedUserRaw ? JSON.parse(savedUserRaw) : parsed.currentUser || parsed.users[0];
          return {
            ...parsed,
            currentUser
          };
        }
      }
    } catch (e) {
      console.warn('Could not read localStorage state, initializing seed dataset', e);
    }

    const initial = createInitialDataset();
    this.saveState(initial);
    return initial;
  }

  private saveState(customState?: typeof this.state) {
    if (typeof window === 'undefined') return;
    try {
      const target = customState || this.state;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(target));
      if (target.currentUser) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(target.currentUser));
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // Auth
  getCurrentUser(): User {
    return this.state.currentUser;
  }

  login(email = 'alex@taskora.io', _password = ''): { user: User; token: string } {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.state.currentUser = user;
      this.saveState();
      return { user, token: `local-token-${user.id}` };
    }

    // Auto-create user if registering via login form
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0].replace(/[\._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role: 'Product Specialist',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: 'online',
      department: 'General'
    };

    this.state.users.push(newUser);
    this.state.currentUser = newUser;
    this.saveState();
    return { user: newUser, token: `local-token-${newUser.id}` };
  }

  register(name: string, email: string): { user: User; token: string } {
    const existing = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.state.currentUser = existing;
      this.saveState();
      return { user: existing, token: `local-token-${existing.id}` };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: 'Product Specialist',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: 'online',
      department: 'General'
    };

    this.state.users.push(newUser);
    this.state.currentUser = newUser;
    this.saveState();
    return { user: newUser, token: `local-token-${newUser.id}` };
  }

  logout(): boolean {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_KEY);
    }
    return true;
  }

  // Tasks
  getTasks(params: Record<string, string> = {}): Task[] {
    let list = this.state.tasks.map(enrichTask);

    if (params.projectId) {
      list = list.filter(t => t.projectId === params.projectId);
    }
    if (params.priority) {
      list = list.filter(t => t.priority === params.priority);
    }
    if (params.status) {
      list = list.filter(t => t.status === params.status);
    }
    if (params.assigneeId) {
      list = list.filter(t => t.assigneeId === params.assigneeId);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
    }

    return list;
  }

  getTask(id: string): Task | null {
    const t = this.state.tasks.find(x => x.id === id);
    return t ? enrichTask(t) : null;
  }

  createTask(taskData: Partial<Task>): Task {
    const user = this.getCurrentUser();
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: taskData.title || 'Untitled Deliverable',
      description: taskData.description || '',
      projectId: taskData.projectId || null,
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'To Do',
      dueDate: taskData.dueDate || null,
      assigneeId: taskData.assigneeId || user.id,
      tags: Array.isArray(taskData.tags) ? taskData.tags : [],
      estimatedTime: taskData.estimatedTime || '',
      reminder: Boolean(taskData.reminder),
      subtasks: Array.isArray(taskData.subtasks)
        ? taskData.subtasks.map((st: any, i) => ({
            id: `sub_${Date.now()}_${i}`,
            title: typeof st === 'string' ? st : st.title,
            completed: Boolean(st.completed)
          }))
        : [],
      comments: [],
      activity: [
        {
          id: `act_${Date.now()}`,
          text: `${user.name} created this deliverable`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    this.state.tasks.unshift(newTask);
    this.saveState();
    return enrichTask(newTask);
  }

  updateTask(id: string, updates: Partial<Task>): Task {
    const idx = this.state.tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found');

    const prev = this.state.tasks[idx];
    const user = this.getCurrentUser();
    const activity = [...(prev.activity || [])];

    if (updates.status && updates.status !== prev.status) {
      activity.unshift({
        id: `act_${Date.now()}`,
        text: `Status changed to ${updates.status} by ${user.name}`,
        timestamp: new Date().toISOString()
      });
    }

    if (updates.priority && updates.priority !== prev.priority) {
      activity.unshift({
        id: `act_${Date.now()}`,
        text: `Priority changed to ${updates.priority} by ${user.name}`,
        timestamp: new Date().toISOString()
      });
    }

    if (updates.dueDate && updates.dueDate !== prev.dueDate) {
      activity.unshift({
        id: `act_${Date.now()}`,
        text: `Deadline rescheduled to ${new Date(updates.dueDate).toLocaleDateString()} by ${user.name}`,
        timestamp: new Date().toISOString()
      });
    }

    const updated: Task = {
      ...prev,
      ...updates,
      activity
    };

    this.state.tasks[idx] = updated;
    this.saveState();
    return enrichTask(updated);
  }

  deleteTask(id: string): boolean {
    const len = this.state.tasks.length;
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.saveState();
    return this.state.tasks.length < len;
  }

  // Subtasks
  addSubtask(taskId: string, title: string): Task {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const newSub = {
      id: `sub_${Date.now()}`,
      title: title.trim(),
      completed: false
    };

    task.subtasks = task.subtasks || [];
    task.subtasks.push(newSub);
    this.saveState();
    return enrichTask(task);
  }

  updateSubtask(taskId: string, subtaskId: string, updates: { completed?: boolean; title?: string }): Task {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const sub = (task.subtasks || []).find(s => s.id === subtaskId);
    if (!sub) throw new Error('Subtask not found');

    if (updates.completed !== undefined) sub.completed = updates.completed;
    if (updates.title !== undefined) sub.title = updates.title.trim();

    this.saveState();
    return enrichTask(task);
  }

  deleteSubtask(taskId: string, subtaskId: string): Task {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.subtasks = (task.subtasks || []).filter(s => s.id !== subtaskId);
    this.saveState();
    return enrichTask(task);
  }

  // Comments
  addComment(taskId: string, text: string): { comment: any; task: Task } {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const user = this.getCurrentUser();
    const comment = {
      id: `comm_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    task.comments = task.comments || [];
    task.comments.unshift(comment);

    task.activity = task.activity || [];
    task.activity.unshift({
      id: `act_${Date.now()}`,
      text: `${user.name} added a comment`,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return { comment, task: enrichTask(task) };
  }

  deleteComment(taskId: string, commentId: string): Task {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.comments = (task.comments || []).filter(c => c.id !== commentId);
    this.saveState();
    return enrichTask(task);
  }

  // Projects
  getProjects(): Project[] {
    return this.state.projects.map(p => {
      const projTasks = this.state.tasks.filter(t => t.projectId === p.id);
      const total = projTasks.length;
      const completed = projTasks.filter(t => t.status === 'Completed').length;
      const inProgress = projTasks.filter(t => t.status === 'In Progress').length;
      const pending = projTasks.filter(t => t.status === 'To Do' || t.status === 'Review').length;
      const overdue = projTasks.filter(t => enrichTask(t).isOverdue && t.status !== 'Completed').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...p,
        stats: {
          total,
          completed,
          inProgress,
          pending,
          overdue,
          progress
        }
      };
    });
  }

  getProject(id: string): Project | null {
    const p = this.state.projects.find(x => x.id === id);
    if (!p) return null;
    return this.getProjects().find(x => x.id === id) || null;
  }

  createProject(data: Partial<Project>): Project {
    const user = this.getCurrentUser();
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: data.name || 'Untitled Workspace Project',
      description: data.description || '',
      category: data.category || 'General',
      deadline: data.deadline || null,
      priority: data.priority || 'Medium',
      color: data.color || '#e5c07b',
      members: Array.isArray(data.members) ? data.members : [user.id],
      createdAt: new Date().toISOString()
    };

    this.state.projects.unshift(newProj);
    this.saveState();
    return this.getProject(newProj.id)!;
  }

  updateProject(id: string, updates: Partial<Project>): Project {
    const idx = this.state.projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');

    this.state.projects[idx] = {
      ...this.state.projects[idx],
      ...updates
    };

    this.saveState();
    return this.getProject(id)!;
  }

  deleteProject(id: string): boolean {
    const len = this.state.projects.length;
    this.state.projects = this.state.projects.filter(p => p.id !== id);
    this.state.tasks = this.state.tasks.map(t => (t.projectId === id ? { ...t, projectId: null } : t));
    this.saveState();
    return this.state.projects.length < len;
  }

  // Team
  getTeam(): User[] {
    return this.state.users.map(u => {
      const assigned = this.state.tasks.filter(t => t.assigneeId === u.id);
      const total = assigned.length;
      const completed = assigned.filter(t => t.status === 'Completed').length;
      const inProgress = assigned.filter(t => t.status === 'In Progress').length;
      const overdue = assigned.filter(t => enrichTask(t).isOverdue && t.status !== 'Completed').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...u,
        workload: {
          total,
          completed,
          inProgress,
          overdue,
          rate
        }
      };
    });
  }

  addTeamMember(data: Partial<User>): User {
    const newMember: User = {
      id: `user_${Date.now()}`,
      name: data.name || 'New Member',
      email: data.email || 'member@taskora.io',
      role: data.role || 'Contributor',
      avatar: data.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: 'online',
      department: data.department || 'Product'
    };

    this.state.users.push(newMember);
    this.saveState();
    return newMember;
  }

  // Notifications
  getNotifications(): NotificationItem[] {
    return this.state.notifications;
  }

  markNotificationRead(id: string): NotificationItem {
    const n = this.state.notifications.find(x => x.id === id);
    if (n) {
      n.read = true;
      this.saveState();
    }
    return n!;
  }

  markAllNotificationsRead(): boolean {
    this.state.notifications.forEach(n => {
      n.read = true;
    });
    this.saveState();
    return true;
  }

  deleteNotification(id: string): boolean {
    const len = this.state.notifications.length;
    this.state.notifications = this.state.notifications.filter(n => n.id !== id);
    this.saveState();
    return this.state.notifications.length < len;
  }

  // Analytics
  getAnalytics(): AnalyticsData {
    const tasks = this.state.tasks.map(enrichTask);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'To Do' || t.status === 'Review').length;
    const overdue = tasks.filter(t => t.isOverdue && t.status !== 'Completed').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Productivity Score (0 - 100)
    let score = 50;
    score += completionRate * 0.4;
    score -= overdue * 8;
    score += inProgress * 2;
    const productivityScore = Math.min(100, Math.max(10, Math.round(score)));

    let scoreFeedback = "Great momentum! Keep clearing pending deliverables.";
    if (productivityScore >= 85) scoreFeedback = "Elite focus! Exceptional completion velocity.";
    else if (productivityScore < 50) scoreFeedback = "Attention required: Address overdue deliverables to regain momentum.";

    // Subtasks Stats
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    tasks.forEach(t => {
      (t.subtasks || []).forEach(s => {
        totalSubtasks++;
        if (s.completed) completedSubtasks++;
      });
    });
    const subtaskRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    const weeklyTrends = [
      { day: "Mon", completed: 3, created: 4 },
      { day: "Tue", completed: 5, created: 3 },
      { day: "Wed", completed: 4, created: 6 },
      { day: "Thu", completed: 7, created: 4 },
      { day: "Fri", completed: 6, created: 2 },
      { day: "Sat", completed: 2, created: 1 },
      { day: "Sun", completed: 4, created: 2 }
    ];

    const statusDistribution = [
      { name: "Completed", count: completed, color: "#10b981" },
      { name: "In Progress", count: inProgress, color: "#38bdf8" },
      { name: "Review", count: tasks.filter(t => t.status === 'Review').length, color: "#9d7cd8" },
      { name: "To Do", count: tasks.filter(t => t.status === 'To Do').length, color: "#64748b" }
    ];

    const priorityDistribution = [
      { name: "Urgent", count: tasks.filter(t => t.priority === 'Urgent').length, color: "#ef4444" },
      { name: "High", count: tasks.filter(t => t.priority === 'High').length, color: "#e5c07b" },
      { name: "Medium", count: tasks.filter(t => t.priority === 'Medium').length, color: "#38bdf8" },
      { name: "Low", count: tasks.filter(t => t.priority === 'Low').length, color: "#64748b" }
    ];

    const projectProgress = this.getProjects().map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      progress: p.stats?.progress || 0,
      total: p.stats?.total || 0,
      completed: p.stats?.completed || 0
    }));

    return {
      stats: {
        total,
        completed,
        inProgress,
        pending,
        overdue,
        completionRate,
        productivityScore,
        scoreFeedback,
        subtaskStats: {
          total: totalSubtasks,
          completed: completedSubtasks,
          rate: subtaskRate
        }
      },
      weeklyTrends,
      statusDistribution,
      priorityDistribution,
      projectProgress
    };
  }

  // Search
  search(query: string): SearchResults {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      return { tasks: [], projects: [], team: [], comments: [] };
    }

    const tasks = this.state.tasks
      .filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
      .map(enrichTask);

    const projects = this.getProjects().filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));

    const team = this.getTeam().filter(u => u.name.toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q));

    const comments: any[] = [];
    this.state.tasks.forEach(t => {
      (t.comments || []).forEach(c => {
        if (c.text.toLowerCase().includes(q)) {
          comments.push({
            ...c,
            taskId: t.id,
            taskTitle: t.title
          });
        }
      });
    });

    return { tasks, projects, team, comments };
  }

  // Settings
  getSettings(): UserSettings {
    return this.state.settings;
  }

  updateSettings(updates: Partial<UserSettings>): UserSettings {
    this.state.settings = {
      ...this.state.settings,
      ...updates
    };
    this.saveState();
    return this.state.settings;
  }

  // Reset Demo Data
  resetDemoData(): boolean {
    const initial = createInitialDataset();
    this.state = initial;
    this.saveState(initial);
    return true;
  }
}

// Singleton local store instance
export const localStore = new LocalStorageStore();
