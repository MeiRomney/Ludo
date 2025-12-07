import { test, expect } from '@playwright/test';

test('Ludo board shows Start Game button', async ({ page }) => {
  await page.goto('https://ludo-ray.vercel.app');
  await expect(page.getByText('Start Game')).toBeVisible();
  await page.waitForTimeout(5000); // Waiting for 5 secs

});
