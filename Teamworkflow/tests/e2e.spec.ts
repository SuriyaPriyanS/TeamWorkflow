import { test, expect } from '@playwright/test';

const newTask = {
  title: 'Automated E2E Task',
  description: 'Created by Playwright automation.',
  assignee: 'Test User',
  tags: 'playwright, automation',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#board-search')).toBeVisible();
});

test('should open the task modal and create a new task', async ({ page }) => {
  await page.getByRole('button', { name: /new task/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByLabel('Title *').fill(newTask.title);
  await page.getByLabel('Description', { exact: true }).fill(newTask.description);
  await page.getByLabel('Assignee *').fill(newTask.assignee);
  await page.getByLabel('Status *').selectOption('Backlog');
  await page.getByLabel('Priority *').selectOption('High');
  await page.getByLabel('Tags').fill(newTask.tags);

  await page.getByRole('button', { name: /create task/i }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  await expect(page.getByText(newTask.title)).toBeVisible();
  await expect(page.getByText(newTask.description)).toBeVisible();
  await expect(page.locator('.tag-high', { hasText: /High Priority/i })).toBeVisible();
});

test('should filter tasks using search and priority', async ({ page }) => {
  await page.getByRole('button', { name: /new task/i }).click();
  await page.getByLabel('Title *').fill('Filter test task');
  await page.getByLabel('Assignee *').fill('QA User');
  await page.getByLabel('Priority *').selectOption('High');
  await page.getByRole('button', { name: /create task/i }).click();

  await page.locator('#board-search').fill('Filter test');
  await expect(page.getByText('Filter test task')).toBeVisible();

  await page.locator('#board-priority-filter').selectOption('High');
  await expect(page.getByText('Filter test task')).toBeVisible();
});

test('should toggle board columns displayed', async ({ page }) => {
  await page.getByRole('button', { name: /new task/i }).click();
  await page.getByLabel('Title *').fill('Column toggle task');
  await page.getByLabel('Assignee *').fill('Toggle User');
  await page.getByRole('button', { name: /create task/i }).click();

  await expect(page.getByText('Column toggle task')).toBeVisible();

  const backlogToggle = page.getByRole('button', { name: /Backlog/i });
  await backlogToggle.click();
  await expect(page.getByText('Column toggle task')).toBeHidden();

  await backlogToggle.click();
  await expect(page.getByText('Column toggle task')).toBeVisible();
});
