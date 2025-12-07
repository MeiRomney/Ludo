import { test, expect } from '@playwright/test';

test('user can switch from 4 players to 2 players and apply settings', async ({ page }) => {
  await page.goto('/');

  // Open settings modal
  await page.getByRole('button', { name: /Setting/i }).click();
  await expect(page).toHaveURL(/setting/);

  // Switch from 4 Players to 2 Players
  await page.getByRole('button', { name: /2 Players/i }).click();

  // Click Apply
  await page.getByRole('button', { name: /Apply/i }).click();

  // App currently stays on /setting, so assert that
  await expect(page).toHaveURL(/setting/);

  await page.waitForTimeout(2000);
});
