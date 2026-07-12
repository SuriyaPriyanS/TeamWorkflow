export type TaskStatus = 'Backlog' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tags: string[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface BoardDataV2 {
  version: 2;
  tasks: Task[];
}

export interface Filters {
  status: TaskStatus[];
  priority: TaskPriority | '';
  search: string;
}

export type SortField = 'createdAt' | 'updatedAt' | 'priority';
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  order: SortOrder;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
}
