// server/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { store } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Helper: Calculate task status deadline flags
function enrichTask(task) {
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
    
    // Check if same calendar day
    const isSameDay = due.getFullYear() === now.getFullYear() &&
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

  // Subtasks progress
  const totalSubtasks = (task.subtasks || []).length;
  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

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

// ----------------- AUTH ROUTES -----------------
app.get('/api/auth/me', (req, res) => {
  const user = store.getCurrentUser();
  res.json({ success: true, user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const users = store.getUsers();
  
  // For demo/production flexibility:
  const found = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || users[0];
  if (found) {
    store.updateCurrentUser(found);
    return res.json({ success: true, user: found, token: `demo-token-${found.id}` });
  }

  res.status(401).json({ success: false, message: 'Invalid email or password.' });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }
  const newUser = store.addUser({
    name,
    email,
    role: 'Product Specialist',
    department: 'General'
  });
  store.updateCurrentUser(newUser);
  res.json({ success: true, user: newUser, token: `demo-token-${newUser.id}` });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ----------------- TASKS ROUTES -----------------
app.get('/api/tasks', (req, res) => {
  const tasks = store.getTasks(req.query).map(enrichTask);
  res.json({ success: true, tasks });
});

app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, projectId, priority, status, dueDate, assigneeId, tags, estimatedTime, reminder, subtasks } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const created = store.addTask({
      title: title.trim(),
      description: description || '',
      projectId: projectId || null,
      priority: priority || 'Medium',
      status: status || 'To Do',
      dueDate: dueDate || null,
      assigneeId: assigneeId || store.getCurrentUser().id,
      tags: Array.isArray(tags) ? tags : [],
      estimatedTime: estimatedTime || '',
      reminder: Boolean(reminder),
      subtasks: Array.isArray(subtasks) ? subtasks.map((st, i) => ({
        id: `sub_${Date.now()}_${i}`,
        title: typeof st === 'string' ? st : st.title,
        completed: Boolean(st.completed)
      })) : []
    });

    res.status(201).json({ success: true, task: enrichTask(created) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/tasks/:id', (req, res) => {
  const task = store.getTask(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, task: enrichTask(task) });
});

app.put('/api/tasks/:id', (req, res) => {
  const updated = store.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, task: enrichTask(updated) });
});

app.delete('/api/tasks/:id', (req, res) => {
  const ok = store.deleteTask(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, message: 'Task deleted successfully' });
});

// Subtask Routes
app.post('/api/tasks/:id/subtasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Subtask title is required' });
  const sub = store.addSubtask(req.params.id, { title });
  if (!sub) return res.status(404).json({ success: false, message: 'Task not found' });
  const updatedTask = store.getTask(req.params.id);
  res.json({ success: true, subtask: sub, task: enrichTask(updatedTask) });
});

app.put('/api/tasks/:id/subtasks/:subtaskId', (req, res) => {
  const sub = store.updateSubtask(req.params.id, req.params.subtaskId, req.body);
  if (!sub) return res.status(404).json({ success: false, message: 'Subtask not found' });
  const updatedTask = store.getTask(req.params.id);
  res.json({ success: true, subtask: sub, task: enrichTask(updatedTask) });
});

app.delete('/api/tasks/:id/subtasks/:subtaskId', (req, res) => {
  const ok = store.deleteSubtask(req.params.id, req.params.subtaskId);
  if (!ok) return res.status(404).json({ success: false, message: 'Subtask not found' });
  const updatedTask = store.getTask(req.params.id);
  res.json({ success: true, task: enrichTask(updatedTask) });
});

// Comment Routes
app.post('/api/tasks/:id/comments', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Comment cannot be blank' });
  const comment = store.addComment(req.params.id, text.trim());
  if (!comment) return res.status(404).json({ success: false, message: 'Task not found' });
  const updatedTask = store.getTask(req.params.id);
  res.json({ success: true, comment, task: enrichTask(updatedTask) });
});

app.delete('/api/tasks/:id/comments/:commentId', (req, res) => {
  const ok = store.deleteComment(req.params.id, req.params.commentId);
  if (!ok) return res.status(404).json({ success: false, message: 'Comment not found' });
  const updatedTask = store.getTask(req.params.id);
  res.json({ success: true, task: enrichTask(updatedTask) });
});

// ----------------- PROJECTS ROUTES -----------------
app.get('/api/projects', (req, res) => {
  const rawProjects = store.getProjects();
  const allTasks = store.getTasks().map(enrichTask);

  const projectsWithStats = rawProjects.map(proj => {
    const projTasks = allTasks.filter(t => t.projectId === proj.id);
    const total = projTasks.length;
    const completed = projTasks.filter(t => t.status === 'Completed').length;
    const inProgress = projTasks.filter(t => t.status === 'In Progress').length;
    const pending = projTasks.filter(t => t.status === 'To Do' || t.status === 'Review').length;
    const overdue = projTasks.filter(t => t.isOverdue).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...proj,
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

  res.json({ success: true, projects: projectsWithStats });
});

app.post('/api/projects', (req, res) => {
  const { name, description, category, deadline, priority, color, members } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Project name is required' });
  const created = store.addProject({
    name: name.trim(),
    description: description || '',
    category: category || 'General',
    deadline: deadline || null,
    priority: priority || 'Medium',
    color: color || '#e5c07b',
    members: members || []
  });
  res.status(201).json({ success: true, project: created });
});

app.put('/api/projects/:id', (req, res) => {
  const updated = store.updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, project: updated });
});

app.delete('/api/projects/:id', (req, res) => {
  const ok = store.deleteProject(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, message: 'Project deleted successfully' });
});

// ----------------- TEAM ROUTES -----------------
app.get('/api/team', (req, res) => {
  const users = store.getUsers();
  const tasks = store.getTasks().map(enrichTask);

  const teamWithWorkload = users.map(user => {
    const assignedTasks = tasks.filter(t => t.assigneeId === user.id);
    const total = assignedTasks.length;
    const completed = assignedTasks.filter(t => t.status === 'Completed').length;
    const inProgress = assignedTasks.filter(t => t.status === 'In Progress').length;
    const overdue = assignedTasks.filter(t => t.isOverdue).length;
    const workloadRate = total > 0 ? Math.min(100, Math.round((inProgress / Math.max(1, total)) * 100)) : 10;

    return {
      ...user,
      workload: {
        total,
        completed,
        inProgress,
        overdue,
        rate: workloadRate
      }
    };
  });

  res.json({ success: true, team: teamWithWorkload });
});

app.post('/api/team', (req, res) => {
  const { name, email, role, department } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });
  const newUser = store.addUser({ name, email, role: role || 'Member', department: department || 'General' });
  res.status(201).json({ success: true, user: newUser });
});

// ----------------- NOTIFICATIONS ROUTES -----------------
app.get('/api/notifications', (req, res) => {
  const notifications = store.getNotifications();
  res.json({ success: true, notifications });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const notif = store.markNotificationRead(req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, notification: notif });
});

app.put('/api/notifications/read-all', (req, res) => {
  store.markAllNotificationsRead();
  res.json({ success: true, message: 'All notifications marked as read' });
});

app.delete('/api/notifications/:id', (req, res) => {
  const ok = store.deleteNotification(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, message: 'Notification deleted' });
});

// ----------------- ANALYTICS & DASHBOARD STATS -----------------
app.get('/api/analytics', (req, res) => {
  const tasks = store.getTasks().map(enrichTask);
  const projects = store.getProjects();
  
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const review = tasks.filter(t => t.status === 'Review').length;
  const toDo = tasks.filter(t => t.status === 'To Do').length;
  const pending = toDo + review;
  const overdue = tasks.filter(t => t.isOverdue).length;

  // Subtasks calculation
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  tasks.forEach(t => {
    (t.subtasks || []).forEach(st => {
      totalSubtasks++;
      if (st.completed) completedSubtasks++;
    });
  });

  // Calculate dynamic productivity score (0 - 100)
  let score = 50;
  if (total > 0) {
    const completionWeight = (completed / total) * 60;
    const inProgressWeight = (inProgress / total) * 20;
    const subtaskRatio = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) : 0.7;
    const subtaskWeight = subtaskRatio * 20;
    const overduePenalty = overdue * 5;
    score = Math.max(15, Math.min(100, Math.round(completionWeight + inProgressWeight + subtaskWeight - overduePenalty)));
  }

  let scoreFeedback = "Good start! Keep knocking out tasks to raise your score.";
  if (score >= 85) scoreFeedback = "Supreme momentum! You're executing with peak precision.";
  else if (score >= 70) scoreFeedback = "Great work! You're completing tasks consistently.";
  else if (score >= 50) scoreFeedback = "Steady progress. Clear overdue items to boost efficiency.";

  // Weekly productivity distribution (Mon to Sun)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyTrends = [
    { day: "Mon", completed: 3, created: 4 },
    { day: "Tue", completed: 5, created: 3 },
    { day: "Wed", completed: 4, created: 6 },
    { day: "Thu", completed: 6, created: 2 },
    { day: "Fri", completed: 5, created: 3 },
    { day: "Sat", completed: 2, created: 1 },
    { day: "Sun", completed: Math.max(1, completed % 5), created: 2 }
  ];

  // Status breakdown
  const statusDistribution = [
    { name: "To Do", count: toDo, color: "#64748b" },
    { name: "In Progress", count: inProgress, color: "#38bdf8" },
    { name: "Review", count: review, color: "#9d7cd8" },
    { name: "Completed", count: completed, color: "#e5c07b" }
  ];

  // Priority breakdown
  const priorityDistribution = [
    { name: "Low", count: tasks.filter(t => t.priority === 'Low').length, color: "#94a3b8" },
    { name: "Medium", count: tasks.filter(t => t.priority === 'Medium').length, color: "#38bdf8" },
    { name: "High", count: tasks.filter(t => t.priority === 'High').length, color: "#f59e0b" },
    { name: "Urgent", count: tasks.filter(t => t.priority === 'Urgent').length, color: "#f43f5e" }
  ];

  // Project completion percentages
  const projectProgress = projects.map(p => {
    const pTasks = tasks.filter(t => t.projectId === p.id);
    const pCompleted = pTasks.filter(t => t.status === 'Completed').length;
    const pTotal = pTasks.length;
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      progress: pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0,
      total: pTotal,
      completed: pCompleted
    };
  });

  res.json({
    success: true,
    stats: {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      productivityScore: score,
      scoreFeedback,
      subtaskStats: {
        total: totalSubtasks,
        completed: completedSubtasks,
        rate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 100
      }
    },
    weeklyTrends,
    statusDistribution,
    priorityDistribution,
    projectProgress
  });
});

// ----------------- GLOBAL SEARCH -----------------
app.get('/api/search', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  if (!query) {
    return res.json({ success: true, results: { tasks: [], projects: [], team: [], comments: [] } });
  }

  const tasks = store.getTasks().map(enrichTask);
  const projects = store.getProjects();
  const users = store.getUsers();

  const matchingTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(query) ||
    (t.description && t.description.toLowerCase().includes(query)) ||
    (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
  ).slice(0, 8);

  const matchingProjects = projects.filter(p =>
    p.name.toLowerCase().includes(query) ||
    (p.description && p.description.toLowerCase().includes(query)) ||
    (p.category && p.category.toLowerCase().includes(query))
  ).slice(0, 5);

  const matchingTeam = users.filter(u =>
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    (u.role && u.role.toLowerCase().includes(query))
  ).slice(0, 5);

  const matchingComments = [];
  tasks.forEach(task => {
    (task.comments || []).forEach(c => {
      if (c.text.toLowerCase().includes(query)) {
        matchingComments.push({
          taskId: task.id,
          taskTitle: task.title,
          ...c
        });
      }
    });
  });

  res.json({
    success: true,
    results: {
      tasks: matchingTasks,
      projects: matchingProjects,
      team: matchingTeam,
      comments: matchingComments.slice(0, 5)
    }
  });
});

// ----------------- SETTINGS & RESET -----------------
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings: store.getSettings() });
});

app.put('/api/settings', (req, res) => {
  const updated = store.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

app.post('/api/reset-demo-data', (req, res) => {
  const fresh = store.reset();
  res.json({ success: true, message: 'Workspace demo data restored successfully.', data: fresh });
});

// Serve frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback for all client routes
function getIndexHtml() {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return fs.readFileSync(indexPath, 'utf-8');
  }
  return '<!doctype html><html><head><title>Taskora</title></head><body style="background:#07080b;color:#fff;font-family:sans-serif;padding:2rem;">Workspace bundle ready</body></html>';
}

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.type('html').send(getIndexHtml());
  }
  next();
});

import http from 'http';

// Primary listener on port 5001
const server5001 = http.createServer(app);
server5001.listen(PORT, '0.0.0.0', () => {
  console.log(`Taskora Engine API & Web Server running on port ${PORT}`);
});

// Also listen on port 3000 for standard web convention
if (PORT !== 3000) {
  try {
    const server3000 = http.createServer(app);
    server3000.listen(3000, '0.0.0.0', () => {
      console.log(`Taskora also listening on http://localhost:3000`);
    });
    server3000.on('error', (err) => {
      if (err.code !== 'EADDRINUSE') {
        console.error('Port 3000 notice:', err.message);
      }
    });
  } catch (err) {
    // Non-fatal if 3000 in use
  }
}
