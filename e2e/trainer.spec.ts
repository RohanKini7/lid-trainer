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

test('state banks with text image placeholders can start a mock exam', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('he');
  const startMock = page.getByRole('button', { name: /start mock test/i });
  await expect(startMock).toBeEnabled();
  await startMock.click();
  await expect(page.getByRole('heading', { name: new RegExp('mock exam · 1/33', 'i') })).toBeVisible();
});

test('mock exam supports navigation, changing answers and submission', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('by');
  await page.getByRole('button', { name: /start mock test/i }).click();
  await expect(page.getByRole('heading', { name: /mock exam · 1\/33/i })).toBeVisible();

  await page.getByRole('button', { name: 'Go to question 2', exact: true }).click();
  await expect(page.getByRole('heading', { name: /mock exam · 2\/33/i })).toBeVisible();
  const firstAnswer = page.locator('.answer-options .answer-option').first();
  await firstAnswer.click();
  await expect(firstAnswer).toHaveClass(/chosen/);

  await page.getByRole('button', { name: 'Go to question 1', exact: true }).click();
  await expect(page.getByRole('heading', { name: /mock exam · 1\/33/i })).toBeVisible();
  await page.getByRole('button', { name: 'Go to question 33', exact: true }).click();
  await page.getByRole('button', { name: 'Hand in' }).click();
  await expect(page.getByText(/session complete/i)).toBeVisible();
  await expect(page.getByText(/\/33/).first()).toBeVisible();
});

test('progress transfer code is shown and invalid imports are rejected', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('by');
  const transfer = page.getByRole('heading', { name: /move progress to another device/i });
  await expect(transfer).toBeVisible();
  const code = page.locator('textarea[readonly]');
  await expect(code).toHaveValue(/^LID2-/);
  await page.getByPlaceholder('Paste LID1- code').fill('not-a-valid-code');
  await page.getByRole('button', { name: 'Import' }).click();
  await expect(page.getByRole('status')).toContainText(/invalid/i);
});


test('Berlin selection uses Berlin state questions, not Bayern labels or questions', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('be');
  await expect(page.getByText('LEBEN IN DEUTSCHLAND · BERLIN')).toBeVisible();
  const jump = page.getByLabel('Jump to question');
  await expect(jump.locator('option').last()).toHaveText('Berlin 10');
  await jump.selectOption({ label: 'Berlin 1' });
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page.getByText('Welches Wappen gehört zum Bundesland Berlin?')).toBeVisible();
  await expect(page.getByText(/Bayern B[1-9]|Bayern 10/)).toHaveCount(0);
});
