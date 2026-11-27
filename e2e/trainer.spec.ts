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

test('Bavaria mock exams are available with a provisional answer-key notice', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('by');
  await expect(page.getByRole('button', { name: /start mock test/i })).toBeEnabled();
  await expect(page.getByText(/answer keys are provisional and may be corrected after official BAMF checks/i)).toBeVisible();
  await expect(page.getByText(/Treat mock scores as provisional/i)).toBeVisible();
  await page.getByRole('button', { name: /start mock test/i }).click();
  await expect(page.getByRole('heading', { name: /mock exam · 1\/33/i })).toBeVisible();
});

test('all complete Bundesland banks can start provisional mock exams', async ({ page }) => {
  for (const code of ['bw', 'by', 'be', 'bb', 'hb', 'hh', 'he', 'mv', 'ni', 'nw', 'rp', 'sl', 'sn', 'st', 'sh', 'th']) {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByLabel('Federal state (Bundesland)').selectOption(code);
    await expect(page.getByRole('button', { name: /start mock test/i }), code).toBeEnabled();
  }
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
  await expect(page.locator('.question-meta span').nth(1)).toHaveText('Berlin 1');
  await expect(page.getByText(/Bayern B[1-9]|Bayern 10/)).toHaveCount(0);
});

test('Hamburg question labels follow the selected Bundesland', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('hh');
  const jump = page.getByLabel('Jump to question');
  await expect(jump.locator('option').last()).toHaveText('Hamburg 10');
  await jump.selectOption({ label: 'Hamburg 1' });
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page.getByText('Welches Wappen gehört zur Freien und Hansestadt Hamburg?')).toBeVisible();
  await expect(page.locator('.question-meta span').nth(1)).toHaveText('Hamburg 1');
});

test('state topic section follows the selected Bundesland and shows its ten questions', async ({ page }) => {
  for (const state of [{ code: 'be', name: 'Berlin', fact: 'Pankow' }, { code: 'hh', name: 'Hamburg', fact: 'Altona' }]) {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByLabel('Federal state (Bundesland)').selectOption(state.code);
    const row = page.locator('.topic-row').filter({ has: page.locator('strong', { hasText: state.name }) });
    await expect(row).toContainText(state.name);
    await expect(row).toContainText('3 of these 10 come up');
    await expect(row).toContainText('10 questions');
    await row.click();
    await expect(page.getByRole('heading', { name: state.name, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Key facts' })).toBeVisible();
    await expect(page.locator('.facts-list')).toContainText(state.fact);
    await expect(page.locator('.facts-list')).not.toContainText('Welches ist ein Bezirk');
    await expect(page.locator('.facts-list')).not.toContainText('Für wie viele Jahre');
    await expect(page.getByRole('button', { name: 'All in order' })).toBeVisible();
    await page.getByRole('button', { name: 'All in order' }).click();
    await expect(page.getByText(state.name + ' 1')).toBeVisible();
  }
});

test('all-question jump position survives a page reload', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('by');
  const jump = page.getByLabel('Jump to question');
  await jump.selectOption({ label: 'Nr. 5' });
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Continue at 5' })).toBeVisible();
});

test('active mock session and selected answers survive a page reload', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('by');
  await page.getByRole('button', { name: /start mock test/i }).click();
  await expect(page.getByRole('heading', { name: /mock exam · 1\/33/i })).toBeVisible();

  await page.locator('.answer-options .answer-option').first().click();
  await expect(page.locator('.answer-options .answer-option.chosen')).toHaveCount(1);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: /mock exam · 2\/33/i })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: /mock exam · 2\/33/i })).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.answer-options .answer-option.chosen')).toHaveCount(1);
});

test('all-question position tracks navigation and survives returning home and reload', async ({ page }) => {
  await page.getByLabel('Federal state (Bundesland)').selectOption('by');
  await page.getByRole('button', { name: /continue at 1/i }).click();
  await page.locator('.answer-options .answer-option').first().click();
  await page.getByRole('button', { name: /next question/i }).click();
  await expect(page.getByText('2 / 310')).toBeVisible();
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.getByRole('button', { name: /continue at 2/i })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /continue at 2/i })).toBeVisible();
});
