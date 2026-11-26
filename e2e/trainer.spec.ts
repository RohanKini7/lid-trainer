import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('first-visit onboarding saves the selected federal state', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /which bundesland are you preparing for/i })).toBeVisible();
  await page.getByLabel('Federal state (Bundesland)').selectOption('by');
  await expect(page.getByRole('heading', { name: /lid test trainer/i })).toBeVisible();
  await expect(page.getByText(/bayern/i).first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('lid-trainer-bundesland'))).toBe('by');
});

test('incomplete state banks cannot start a mock exam', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('he');
  await expect(page.getByRole('button', { name: /start mock test/i })).toBeDisabled();
  await expect(page.getByText(/question bank is not yet verified/i)).toBeVisible();
});

test('mock exam supports navigation, changing answers and submission', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('by');
  await page.getByRole('button', { name: /start mock test/i }).click();
  await expect(page.getByRole('heading', { name: /mock exam · 1\/33/i })).toBeVisible();

  await page.getByRole('button', { name: 'Go to question 2' }).click();
  await expect(page.getByRole('heading', { name: /mock exam · 2\/33/i })).toBeVisible();
  const firstAnswer = page.locator('.answer-options .answer-option').first();
  await firstAnswer.click();
  await expect(firstAnswer).toHaveClass(/chosen/);

  await page.getByRole('button', { name: 'Go to question 1' }).click();
  await expect(page.getByRole('heading', { name: /mock exam · 1\/33/i })).toBeVisible();
  await page.getByRole('button', { name: 'Go to question 33' }).click();
  await page.getByRole('button', { name: 'Hand in' }).click();
  await expect(page.getByText(/session complete/i)).toBeVisible();
  await expect(page.getByText(/\/33/).first()).toBeVisible();
});

test('progress transfer code is shown and invalid imports are rejected', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('by');
  const transfer = page.getByRole('heading', { name: /move progress to another device/i });
  await expect(transfer).toBeVisible();
  const code = page.locator('textarea[readonly]');
  await expect(code).toHaveValue(/^LID1-[01][0-5]{310}$/);
  await page.getByPlaceholder('Paste LID1- code').fill('not-a-valid-code');
  await page.getByRole('button', { name: 'Import' }).click();
  await expect(page.getByRole('status')).toContainText(/invalid/i);
});
