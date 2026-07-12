import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { ToastProvider } from '../src/hooks/useToast';
import { getSeedDataV1 } from '../src/utils/migration';

const renderApp = () => {
  return render(
    <ToastProvider>
      <App />
    </ToastProvider>
  );
};

describe('Team Workflow Board App Tests', () => {
  it('should successfully create a new task and show it on the board', async () => {
    renderApp();

    // Click on New Task Button
    const newBtn = screen.getByRole('button', { name: /new task/i });
    fireEvent.click(newBtn);

    // Verify Modal Header is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create New Task')).toBeInTheDocument();

    // Fill form fields
    const titleInput = screen.getByLabelText(/title \*/i);
    const descInput = screen.getByLabelText(/description/i);
    const assigneeInput = screen.getByLabelText(/assignee \*/i);
    const statusSelect = screen.getByLabelText(/status \*/i);
    const prioritySelect = screen.getByLabelText(/priority \*/i);
    const tagsInput = screen.getByLabelText(/tags/i);

    fireEvent.change(titleInput, { target: { value: 'Write Unit Tests' } });
    fireEvent.change(descInput, { target: { value: 'Create Vitest test cases for board.' } });
    fireEvent.change(assigneeInput, { target: { value: 'John Doe' } });
    fireEvent.change(statusSelect, { target: { value: 'Backlog' } });
    fireEvent.change(prioritySelect, { target: { value: 'High' } });
    fireEvent.change(tagsInput, { target: { value: 'testing, qa' } });

    // Submit form
    const createBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(createBtn);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Check task appears on board in Backlog column
    expect(screen.getByText('Write Unit Tests')).toBeInTheDocument();
    expect(screen.getByText('Create Vitest test cases for board.')).toBeInTheDocument();
    expect(screen.getByText('HIGH Priority')).toBeInTheDocument();
    
    // Avatar initials "JD" for John Doe should exist
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should filter tasks correctly based on text search and priority', async () => {
    // Pre-seed some tasks in v2 schema
    const seedData = {
      version: 2,
      tasks: [
        {
          id: 'task-a',
          title: 'Implement UI Button Component',
          description: 'Build reusable design system buttons.',
          status: 'In Progress',
          priority: 'High',
          assignee: 'Alice Smith',
          tags: ['ui', 'design-system'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-b',
          title: 'Refactor state hooks',
          description: 'Clean up useLocalStorage hook logic.',
          status: 'Backlog',
          priority: 'Low',
          assignee: 'Bob Jones',
          tags: ['refactor'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    window.localStorage.setItem('workflow_board_data', JSON.stringify(seedData));

    renderApp();

    // Verify both are originally on screen
    expect(screen.getByText('Implement UI Button Component')).toBeInTheDocument();
    expect(screen.getByText('Refactor state hooks')).toBeInTheDocument();

    // Apply text search "state"
    const searchInput = screen.getByLabelText(/search tasks/i);
    fireEvent.change(searchInput, { target: { value: 'state' } });

    // "Refactor state hooks" should be visible, "Implement UI Button Component" should be filtered out
    expect(screen.getByText('Refactor state hooks')).toBeInTheDocument();
    expect(screen.queryByText('Implement UI Button Component')).not.toBeInTheDocument();

    // Clear search and apply priority filter "High"
    fireEvent.change(searchInput, { target: { value: '' } });
    const priorityFilter = screen.getByLabelText(/filter priority/i);
    fireEvent.change(priorityFilter, { target: { value: 'High' } });

    // Alice's task (High priority) should be visible, Bob's task (Low priority) should be hidden
    expect(screen.getByText('Implement UI Button Component')).toBeInTheDocument();
    expect(screen.queryByText('Refactor state hooks')).not.toBeInTheDocument();
  });

  it('should simulate schema migration when Version 1 database structure is loaded', async () => {
    // Seed localStorage with legacy V1 shape data
    const v1Data = getSeedDataV1();
    window.localStorage.setItem('workflow_board_data', JSON.stringify(v1Data));

    renderApp();

    // Verify that legacy tasks are converted and present
    // V1 seed tasks titles: "Legacy Task: Setup ESLint" and "Legacy Task: Fix responsive columns"
    expect(screen.getByText('Legacy Task: Setup ESLint')).toBeInTheDocument();
    expect(screen.getByText('Legacy Task: Fix responsive columns')).toBeInTheDocument();

    // Verify V1 numeric priorities are converted to string priorities on screen
    // "Legacy Task: Setup ESLint" has V1 priority: 1 -> Low. Assert tag Low Priority is shown.
    expect(screen.getByText('LOW Priority')).toBeInTheDocument();
    
    // "Legacy Task: Fix responsive columns" has V1 priority: 3 -> High. Assert tag High Priority is shown.
    expect(screen.getByText('HIGH Priority')).toBeInTheDocument();

    // Verify V1 comma tags are split into separate tags
    expect(screen.getByText('#setup')).toBeInTheDocument();
    expect(screen.getByText('#tooling')).toBeInTheDocument();

    // Verify the migration toast alert triggered
    await waitFor(() => {
      expect(
        screen.getByText(/Legacy database migrated successfully to Version 2 schema!/i)
      ).toBeInTheDocument();
    });

    // Check localStorage is upgraded to Version 2
    const upgradedRaw = window.localStorage.getItem('workflow_board_data');
    expect(upgradedRaw).not.toBeNull();
    const upgradedParsed = JSON.parse(upgradedRaw!);
    expect(upgradedParsed.version).toBe(2);
    expect(upgradedParsed.tasks[0].updatedAt).toBeDefined();
    expect(upgradedParsed.tasks[0].priority).toBe('Low');
    expect(Array.isArray(upgradedParsed.tasks[0].tags)).toBe(true);
  });
});
