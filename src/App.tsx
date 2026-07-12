import React, { useState, useEffect } from 'react';
import { Plus, Sun, Moon, Database, Trash2 } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useQueryParams } from './hooks/useQueryParams';
import { useToast } from './hooks/useToast';
import { Button } from './components/ui/Button';
import { FilterBar } from './components/board/FilterBar';
import { BoardColumn } from './components/board/BoardColumn';
import { TaskFormModal } from './components/board/TaskFormModal';
import { ToastContainer } from './components/ui/Toast';
import { getSeedDataV1 } from './utils/migration';

export default function App() {
  const { addToast } = useToast();
  const { tasks, setTasks } = useLocalStorage();
  const { filters, sort, updateParams, defaultFilters, defaultSort } = useQueryParams();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    // Sync with HTML class or preferences
    if (typeof window !== 'undefined') {
      return document.body.classList.contains('dark') || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply theme
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light-theme');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    addToast(`Switched to ${!isDark ? 'Dark' : 'Light'} Mode`, 'info', 1500);
  };

  // CRUD handlers
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const now = new Date().toISOString();

    if (taskData.id) {
      // Edit
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? { ...t, ...taskData, updatedAt: now } as Task
            : t
        )
      );
      addToast('Task updated successfully!', 'success');
    } else {
      // Create
      const newTask: Task = {
        ...taskData,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [...prev, newTask]);
      addToast('Task created successfully!', 'success');
    }

    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addToast('Task deleted successfully.', 'warning');
  };

  const handleMoveTask = (id: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== newStatus) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
            : t
        )
      );
      addToast(`Moved "${task.title}" to ${newStatus}`, 'success', 2000);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Trigger migration simulation by injecting V1 data
  const handleSeedV1Data = () => {
    const confirmSeed = window.confirm(
      'This will clear current tasks and seed version 1 (legacy) tasks into localStorage. A page reload will then be executed to trigger the V1 -> V2 schema migration warning. Proceed?'
    );
    if (confirmSeed) {
      const v1Data = getSeedDataV1();
      localStorage.setItem('workflow_board_data', JSON.stringify(v1Data));
      addToast('Seeded V1 Data. Reloading page...', 'info', 2000);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Clear all board tasks
  const handleClearAllTasks = () => {
    const confirmClear = window.confirm(
      'Are you sure you want to permanently delete all tasks from the board?'
    );
    if (confirmClear) {
      setTasks([]);
      addToast('All tasks cleared.', 'warning');
    }
  };

  // Filtering Logic
  const filteredTasks = tasks.filter((task) => {
    // 1. Text Search (title & description)
    const matchesSearch =
      !filters.search.trim() ||
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filters.search.toLowerCase());

    // 2. Priority Filter
    const matchesPriority = !filters.priority || task.priority === filters.priority;

    // 3. Status Filter (active columns)
    const matchesStatus = filters.status.includes(task.status);

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Sorting Logic
  const priorityOrder = { Low: 1, Medium: 2, High: 3 };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const { field, order } = sort;

    if (field === 'priority') {
      const rankA = priorityOrder[a.priority] || 0;
      const rankB = priorityOrder[b.priority] || 0;
      return order === 'asc' ? rankA - rankB : rankB - rankA;
    }

    const timeA = new Date(a[field]).getTime();
    const timeB = new Date(b[field]).getTime();
    return order === 'asc' ? timeA - timeB : timeB - timeA;
  });

  // Separate tasks into columns (only for status columns currently enabled in filter)
  const columns: TaskStatus[] = ['Backlog', 'In Progress', 'Done'];

  const isFilterActive = 
    filters.search !== defaultFilters.search ||
    filters.priority !== defaultFilters.priority ||
    filters.status.length !== defaultFilters.status.length ||
    !filters.status.every((s) => defaultFilters.status.includes(s));

  return (
    <div className="app-container">
      {/* Toast Overlay */}
      <ToastContainer />

      {/* Header section */}
      <header className="app-header">
        <div className="header-logo-section">
          <div className="header-logo" aria-hidden="true">📋</div>
          <h1 className="header-title">EveryQuint Workflow Board</h1>
        </div>
        <div className="header-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeedV1Data}
            title="Seed Legacy V1 database into storage to test schema migration"
            aria-label="Seed legacy database structure"
          >
            <Database size={16} /> Seed V1
          </Button>
          {tasks.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAllTasks}
              title="Delete all tasks"
              aria-label="Clear all tasks"
            >
              <Trash2 size={16} /> Clear All
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Toggle theme: switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button variant="primary" onClick={handleCreateClick} aria-label="Create new task">
            <Plus size={18} /> New Task
          </Button>
        </div>
      </header>

      {/* Main body content */}
      <main className="app-main">
        {/* Filters Panel */}
        <FilterBar
          filters={filters}
          sort={sort}
          onChange={updateParams}
          defaultFilters={defaultFilters}
          defaultSort={defaultSort}
        />

        {/* Board View Columns */}
        {tasks.length === 0 ? (
          /* Empty state: No Tasks at all */
          <div className="empty-board-container">
            <div className="empty-icon" aria-hidden="true">🗂️</div>
            <h2 className="empty-title">Your workspace is empty</h2>
            <p className="empty-desc">
              Get started by creating a new task, or seed mock legacy data to see schema migrations in action.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <Button variant="primary" onClick={handleCreateClick}>
                Create Your First Task
              </Button>
              <Button variant="secondary" onClick={handleSeedV1Data}>
                Seed Mock V1 Data
              </Button>
            </div>
          </div>
        ) : sortedTasks.length === 0 && isFilterActive ? (
          /* Empty state: Filters hide all tasks */
          <div className="empty-board-container">
            <div className="empty-icon" aria-hidden="true">🔍</div>
            <h2 className="empty-title">No matching tasks</h2>
            <p className="empty-desc">
              Your active filters and text search hid all {tasks.length} tasks on the board.
            </p>
            <Button variant="secondary" onClick={() => updateParams(defaultFilters, defaultSort)}>
              Reset Filters & Sort
            </Button>
          </div>
        ) : (
          /* Main Board Columns Grid */
          <div className="board-columns-grid">
            {columns.map((colStatus) => {
              // Only render the column if it's active in filters
              const isColVisible = filters.status.includes(colStatus);
              if (!isColVisible) return null;

              const colTasks = sortedTasks.filter((t) => t.status === colStatus);
              return (
                <BoardColumn
                  key={colStatus}
                  status={colStatus}
                  tasks={colTasks}
                  onEditTask={handleEditClick}
                  onDeleteTask={handleDeleteTask}
                  onMoveTask={handleMoveTask}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Task Modal for Creation & Editing */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
}
