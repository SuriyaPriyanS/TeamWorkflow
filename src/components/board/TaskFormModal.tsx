import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { Modal } from '../ui/Modal';
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  task?: Task | null; // If editing
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tagsString: string;
}

const DEFAULT_FORM_STATE: FormState = {
  title: '',
  description: '',
  status: 'Backlog',
  priority: 'Medium',
  assignee: '',
  tagsString: '',
};

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
}) => {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  
  // Track reference for dirty state check
  const [initialFormState, setInitialFormState] = useState<FormState>(DEFAULT_FORM_STATE);

  // Sync form with task when editing
  useEffect(() => {
    if (isOpen) {
      if (task) {
        const state = {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee: task.assignee,
          tagsString: task.tags.join(', '),
        };
        setForm(state);
        setInitialFormState(state);
      } else {
        setForm(DEFAULT_FORM_STATE);
        setInitialFormState(DEFAULT_FORM_STATE);
      }
      setErrors({});
    }
  }, [isOpen, task]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const isFormDirty = () => {
    return JSON.stringify(form) !== JSON.stringify(initialFormState);
  };

  const handleCloseAttempt = () => {
    if (isFormDirty()) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (confirmDiscard) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.length > 80) {
      newErrors.title = 'Title must be under 80 characters';
    }

    if (!form.assignee.trim()) {
      newErrors.assignee = 'Assignee name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse comma-separated tags
    const tags = form.tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    onSave({
      id: task?.id,
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      assignee: form.assignee.trim(),
      tags,
    });
  };

  const statusOptions = [
    { value: 'Backlog', label: 'Backlog' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      title={task ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <TextInput
          label="Title *"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Enter a short title"
          maxLength={85}
          required
        />

        {/* Description */}
        <TextArea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Detailed task description (multi-line supported)"
          maxLength={500}
        />

        <div className="form-grid-two-col">
          {/* Status */}
          <Select
            label="Status *"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={statusOptions}
            required
          />

          {/* Priority */}
          <Select
            label="Priority *"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            options={priorityOptions}
            required
          />
        </div>

        {/* Assignee */}
        <TextInput
          label="Assignee *"
          name="assignee"
          value={form.assignee}
          onChange={handleChange}
          error={errors.assignee}
          placeholder="Full name or username"
          required
        />

        {/* Tags */}
        <TextInput
          label="Tags"
          name="tagsString"
          value={form.tagsString}
          onChange={handleChange}
          placeholder="e.g. frontend, bug, styling (separated by commas)"
        />

        {/* Footer Actions */}
        <div className="form-buttons-row">
          <Button type="button" variant="secondary" onClick={handleCloseAttempt}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
