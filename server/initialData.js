// server/initialData.js
export function generateInitialData() {
  const now = new Date();
  
  const formatDate = (date, hours = 18, minutes = 0) => {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  const todayStr = (hours = 18, minutes = 0) => formatDate(now, hours, minutes);
  const addDaysStr = (days, hours = 18, minutes = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return formatDate(d, hours, minutes);
  };

  const users = [
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

  const projects = [
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

  const tasks = [
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
      dueDate: addDaysStr(-2, 18, 0), // Overdue!
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

  const notifications = [
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

  const settings = {
    theme: "royal-black",
    accentColor: "gold", // 'gold' | 'purple' | 'emerald' | 'cyan'
    layoutDensity: "comfortable",
    notifications: {
      deadlineReminders: true,
      taskAssignments: true,
      comments: true,
      projectUpdates: true
    },
    preferences: {
      defaultPriority: "Medium",
      defaultView: "list", // 'list' | 'kanban'
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
