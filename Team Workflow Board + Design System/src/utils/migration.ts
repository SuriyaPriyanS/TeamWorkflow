import { Task, TaskPriority, TaskStatus } from '../types';

export interface LegacyTaskV1 {
  id: string;
  title: string;
  description: string;
  status: 'Backlog' | 'In Progress' | 'Done';
  priority: 1 | 2 | 3; // 1 = Low, 2 = Medium, 3 = High
  assignee: string;
  tags: string; // e.g. "frontend,bug"
  createdAt: string;
}

export interface LegacyBoardDataV1 {
  version: 1;
  tasks: LegacyTaskV1[];
}

/**
 * Checks if the loaded data matches Version 1 schema.
 */
export const isVersion1 = (data: any): boolean => {
  if (!data) return false;
  
  // If version is explicitly 1, or if it doesn't have a version but has tasks with priority as numbers
  if (data.version === 1) return true;
  
  if (!data.version && Array.isArray(data.tasks)) {
    return data.tasks.some((task: any) => typeof task.priority === 'number' || typeof task.tags === 'string');
  }

  return false;
};

/**
 * Migrates a V1 board shape to V2.
 */
export const migrateV1ToV2 = (data: any): Task[] => {
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];

  return tasks.map((task: any): Task => {
    // 1. Convert numeric priority (1, 2, 3) to string ('Low', 'Medium', 'High')
    let priority: TaskPriority = 'Medium';
    if (task.priority === 1) priority = 'Low';
    if (task.priority === 2) priority = 'Medium';
    if (task.priority === 3) priority = 'High';
    if (typeof task.priority === 'string') {
      if (['Low', 'Medium', 'High'].includes(task.priority)) {
        priority = task.priority as TaskPriority;
      }
    }

    // 2. Convert tags from a comma-separated string to string[]
    let tags: string[] = [];
    if (Array.isArray(task.tags)) {
      tags = task.tags;
    } else if (typeof task.tags === 'string') {
      tags = task.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t !== '');
    }

    // 3. Fallback for updatedAt (use createdAt or current date)
    const createdAt = task.createdAt || new Date().toISOString();
    const updatedAt = task.updatedAt || createdAt;

    // 4. Fallback for status
    let status: TaskStatus = 'Backlog';
    if (['Backlog', 'In Progress', 'Done'].includes(task.status)) {
      status = task.status as TaskStatus;
    }

    return {
      id: task.id || Math.random().toString(36).substring(2, 9),
      title: task.title || 'Untitled Task',
      description: task.description || '',
      status,
      priority,
      assignee: task.assignee || 'Unassigned',
      tags,
      createdAt,
      updatedAt,
    };
  });
};

/**
 * Helper to generate mock V1 seed data for local storage testing.
 */
export const getSeedDataV1 = (): LegacyBoardDataV1 => {
  return {
    version: 1,
    tasks: [
      {
        id: 'task-legacy-1',
        title: 'Legacy Task: Setup ESLint',
        description: 'Need to configure linting guidelines for the codebase.',
        status: 'Backlog',
        priority: 1, // Low
        assignee: 'Suriya',
        tags: 'setup,tooling',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString(), // 2 days ago
      },
      {
        id: 'task-legacy-2',
        title: 'Legacy Task: Fix responsive columns',
        description: 'Workflow board layout overlaps on mobile screen sizes.',
        status: 'In Progress',
        priority: 3, // High
        assignee: 'Ramesh',
        tags: 'bug,ui,responsive',
        createdAt: new Date(Date.now() - 60 * 60 * 1000 * 5).toISOString(), // 5 hours ago
      }
    ],
  };
};
