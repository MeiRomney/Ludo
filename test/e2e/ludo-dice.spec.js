// test/e2e/ludo-dice.spec.js
import { test, expect } from '@playwright/test';

test('dice can be clicked', async ({ page }) => {
  await page.goto('https://ludo-ray.vercel.app');
  await page.getByText('Start Game').click();

  // try to target the first dice-like element (adjust selector if needed)
  const dice = page.locator('div[role="button"], button').first();
  await expect(dice).toBeVisible();

  await dice.click();
  await page.waitForTimeout(2000);
});
