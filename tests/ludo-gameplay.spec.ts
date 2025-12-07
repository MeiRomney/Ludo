import { test, expect } from '@playwright/test';

test('gameplay page should load from Start Game', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Start Game/i }).click();

  // Only assert that we navigated to the gameplay route
  await expect(page).toHaveURL(/gameplay/);

  await page.waitForTimeout(2000);
});
