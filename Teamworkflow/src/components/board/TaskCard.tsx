import React from 'react';
import { Edit2, Trash2, User } from 'lucide-react';
import { Task } from '../../types';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { getRelativeTime } from '../../utils/time';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class to element
    const element = e.currentTarget as HTMLElement;
    element.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('dragging');
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit(task);
    }
  };

  return (
    <Card
      interactive
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="task-card focus-ring"
      tabIndex={0}
      aria-label={`Task: ${task.title}, priority ${task.priority}, assignee ${task.assignee}. Press Enter or Space to edit.`}
      onKeyDown={handleKeyDown}
    >
      <Card.Body>
        <div className="task-card-header">
          <Tag variant={task.priority.toLowerCase() as any}>
            {task.priority} Priority
          </Tag>
          <div className="task-card-actions">
            <button
              className="task-card-action-btn focus-ring"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              title="Edit Task"
              aria-label={`Edit task: ${task.title}`}
            >
              <Edit2 size={14} />
            </button>
            <button
              className="task-card-action-btn focus-ring"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                  onDelete(task.id);
                }
              }}
              title="Delete Task"
              aria-label={`Delete task: ${task.title}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <h4 className="task-card-title">{task.title}</h4>
        
        {task.description && (
          <p className="task-card-description">{task.description}</p>
        )}

        {task.tags.length > 0 && (
          <div className="task-card-tags">
            {task.tags.map((tag) => (
              <span key={tag} className="task-card-custom-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="task-card-meta">
          <span className="task-card-assignee" title={`Assignee: ${task.assignee}`}>
            <span className="task-card-avatar" aria-hidden="true">
              {getInitials(task.assignee)}
            </span>
            {task.assignee}
          </span>
          <span className="task-card-time" title={`Created: ${new Date(task.createdAt).toLocaleString()}`}>
            updated {getRelativeTime(task.updatedAt)}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};
