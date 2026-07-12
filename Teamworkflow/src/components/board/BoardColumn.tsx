import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, newStatus: TaskStatus) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  status,
  tasks,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, status);
    }
  };

  const getStatusVariant = (s: TaskStatus) => {
    switch (s) {
      case 'Backlog':
        return 'backlog';
      case 'In Progress':
        return 'in-progress';
      case 'Done':
        return 'done';
      default:
        return 'default';
    }
  };

  return (
    <div
      className={`board-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`Column: ${status}`}
    >
      <div className="column-header">
        <div className="column-title-box">
          <span className={`tag tag-${getStatusVariant(status)}`}>
            {status}
          </span>
          <span className="column-count" aria-label={`${tasks.length} tasks`}>
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="column-cards-container" role="list">
        {tasks.map((task) => (
          <div key={task.id} role="listitem">
            <TaskCard
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          </div>
        ))}
        {tasks.length === 0 && (
          <div
            className="empty-column-placeholder"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100px',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No tasks here
          </div>
        )}
      </div>
    </div>
  );
};
