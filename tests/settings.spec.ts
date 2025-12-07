import { test, expect } from '@playwright/test';

test('settings page should show options', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Setting/i }).click();

  await expect(page).toHaveURL(/setting/);

  await expect(page.getByText(/Sound/i)).toBeVisible();
  await expect(page.getByText(/Theme/i)).toBeVisible();
  await expect(page.getByText(/Language/i)).toBeVisible();
  await page.waitForTimeout(2000);
});
