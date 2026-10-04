// server/store.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateInitialData } from './initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

let inMemoryData = null;

function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryData = JSON.parse(raw);
      return inMemoryData;
    }
  } catch (err) {
    console.error('Error reading db.json, generating fresh data:', err);
  }

  inMemoryData = generateInitialData();
  saveData();
  return inMemoryData;
}

function saveData() {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(inMemoryData, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

export const store = {
  get() {
    if (!inMemoryData) {
      loadData();
    }
    return inMemoryData;
  },

  reset() {
    inMemoryData = generateInitialData();
    saveData();
    return inMemoryData;
  },

  // Auth & User
  getCurrentUser() {
    return this.get().currentUser;
  },

  updateCurrentUser(updates) {
    const data = this.get();
    data.currentUser = { ...data.currentUser, ...updates };
    const userIdx = data.users.findIndex(u => u.id === data.currentUser.id);
    if (userIdx !== -1) {
      data.users[userIdx] = { ...data.users[userIdx], ...updates };
    }
    saveData();
    return data.currentUser;
  },

  // Users / Team
  getUsers() {
    return this.get().users;
  },

  addUser(user) {
    const data = this.get();
    const newUser = {
      id: `user_${Date.now()}`,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (data.users.length * 1000)}?w=150&auto=format&fit=crop&q=80`,
      status: "online",
      ...user
    };
    data.users.push(newUser);
    saveData();
    return newUser;
  },

  // Projects
  getProjects() {
    return this.get().projects;
  },

  getProject(id) {
    return this.get().projects.find(p => p.id === id);
  },

  addProject(project) {
    const data = this.get();
    const newProj = {
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString(),
      members: project.members || [data.currentUser.id],
      color: project.color || '#e5c07b',
      ...project
    };
    data.projects.unshift(newProj);
    saveData();
    return newProj;
  },

  updateProject(id, updates) {
    const data = this.get();
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    data.projects[idx] = { ...data.projects[idx], ...updates };
    saveData();
    return data.projects[idx];
  },

  deleteProject(id) {
    const data = this.get();
    data.projects = data.projects.filter(p => p.id !== id);
    // Also remove tasks associated with the project or unassign project
    data.tasks = data.tasks.filter(t => t.projectId !== id);
    saveData();
    return true;
  },

  // Tasks
  getTasks(filter = {}) {
    let tasks = [...this.get().tasks];
    if (filter.projectId) {
      tasks = tasks.filter(t => t.projectId === filter.projectId);
    }
    if (filter.status) {
      tasks = tasks.filter(t => t.status === filter.status);
    }
    if (filter.priority) {
      tasks = tasks.filter(t => t.priority === filter.priority);
    }
    if (filter.assigneeId) {
      tasks = tasks.filter(t => t.assigneeId === filter.assigneeId);
    }
    if (filter.tag) {
      tasks = tasks.filter(t => t.tags && t.tags.includes(filter.tag));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return tasks;
  },

  getTask(id) {
    return this.get().tasks.find(t => t.id === id);
  },

  addTask(task) {
    const data = this.get();
    const newTask = {
      id: `task_${Date.now()}`,
      subtasks: task.subtasks || [],
      comments: [],
      activity: [
        {
          id: `act_${Date.now()}`,
          text: `${data.currentUser.name} created this task`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      priority: task.priority || "Medium",
      status: task.status || "To Do",
      tags: task.tags || [],
      ...task
    };

    data.tasks.unshift(newTask);

    // Auto add notification if assigned to another user
    if (newTask.assigneeId && newTask.assigneeId !== data.currentUser.id) {
      const assignee = data.users.find(u => u.id === newTask.assigneeId);
      if (assignee) {
        data.notifications.unshift({
          id: `notif_${Date.now()}`,
          title: "New Task Assigned",
          message: `${data.currentUser.name} assigned you: "${newTask.title}"`,
          type: "assignment",
          read: false,
          createdAt: new Date().toISOString(),
          taskId: newTask.id
        });
      }
    }

    saveData();
    return newTask;
  },

  updateTask(id, updates) {
    const data = this.get();
    const idx = data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const oldTask = data.tasks[idx];
    const updated = { ...oldTask, ...updates };

    // Record activity logs if meaningful changes occurred
    if (updates.status && updates.status !== oldTask.status) {
      updated.activity.unshift({
        id: `act_${Date.now()}`,
        text: `Status changed from ${oldTask.status} to ${updates.status}`,
        timestamp: new Date().toISOString()
      });

      if (updates.status === "Completed") {
        data.notifications.unshift({
          id: `notif_${Date.now()}`,
          title: "Task Completed",
          message: `Task "${updated.title}" marked as Completed`,
          type: "completion",
          read: false,
          createdAt: new Date().toISOString(),
          taskId: updated.id
        });
      }
    }

    if (updates.priority && updates.priority !== oldTask.priority) {
      updated.activity.unshift({
        id: `act_${Date.now()}`,
        text: `Priority updated to ${updates.priority}`,
        timestamp: new Date().toISOString()
      });
    }

    if (updates.assigneeId && updates.assigneeId !== oldTask.assigneeId) {
      const newAssignee = data.users.find(u => u.id === updates.assigneeId);
      updated.activity.unshift({
        id: `act_${Date.now()}`,
        text: `Assigned to ${newAssignee ? newAssignee.name : 'unassigned'}`,
        timestamp: new Date().toISOString()
      });
    }

    if (updates.dueDate && updates.dueDate !== oldTask.dueDate) {
      updated.activity.unshift({
        id: `act_${Date.now()}`,
        text: `Deadline rescheduled to ${new Date(updates.dueDate).toLocaleDateString()}`,
        timestamp: new Date().toISOString()
      });
    }

    data.tasks[idx] = updated;
    saveData();
    return updated;
  },

  deleteTask(id) {
    const data = this.get();
    data.tasks = data.tasks.filter(t => t.id !== id);
    data.notifications = data.notifications.filter(n => n.taskId !== id);
    saveData();
    return true;
  },

  // Subtasks
  addSubtask(taskId, subtask) {
    const data = this.get();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return null;
    const newSubtask = {
      id: `sub_${Date.now()}`,
      title: subtask.title,
      completed: false
    };
    if (!task.subtasks) task.subtasks = [];
    task.subtasks.push(newSubtask);
    task.activity.unshift({
      id: `act_${Date.now()}`,
      text: `Added subtask "${subtask.title}"`,
      timestamp: new Date().toISOString()
    });
    saveData();
    return newSubtask;
  },

  updateSubtask(taskId, subtaskId, updates) {
    const data = this.get();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return null;
    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (!sub) return null;
    Object.assign(sub, updates);

    if (updates.completed !== undefined) {
      task.activity.unshift({
        id: `act_${Date.now()}`,
        text: `Subtask "${sub.title}" marked ${updates.completed ? 'completed' : 'incomplete'}`,
        timestamp: new Date().toISOString()
      });
    }

    saveData();
    return sub;
  },

  deleteSubtask(taskId, subtaskId) {
    const data = this.get();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return false;
    task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
    saveData();
    return true;
  },

  // Comments
  addComment(taskId, commentText) {
    const data = this.get();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return null;
    const user = data.currentUser;
    const newComment = {
      id: `comm_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: commentText,
      createdAt: new Date().toISOString()
    };
    if (!task.comments) task.comments = [];
    task.comments.push(newComment);
    task.activity.unshift({
      id: `act_${Date.now()}`,
      text: `${user.name} added a comment`,
      timestamp: new Date().toISOString()
    });
    saveData();
    return newComment;
  },

  deleteComment(taskId, commentId) {
    const data = this.get();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task || !task.comments) return false;
    task.comments = task.comments.filter(c => c.id !== commentId);
    saveData();
    return true;
  },

  // Notifications
  getNotifications() {
    return this.get().notifications;
  },

  markNotificationRead(id) {
    const data = this.get();
    const notif = data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveData();
      return notif;
    }
    return null;
  },

  markAllNotificationsRead() {
    const data = this.get();
    data.notifications.forEach(n => { n.read = true; });
    saveData();
    return true;
  },

  deleteNotification(id) {
    const data = this.get();
    data.notifications = data.notifications.filter(n => n.id !== id);
    saveData();
    return true;
  },

  // Settings
  getSettings() {
    return this.get().settings;
  },

  updateSettings(updates) {
    const data = this.get();
    data.settings = { ...data.settings, ...updates };
    saveData();
    return data.settings;
  }
};
