import { test, expect } from '@playwright/test';

test('settings page should show options', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Setting/i }).click();

  await expect(page).toHaveURL(/setting/);

  await expect(page.getByText(/Settings/i)).toBeVisible();
  await expect(page.getByText(/Enter Your Name/i)).toBeVisible();
  await expect(page.getByText(/Select Game Type/i)).toBeVisible();
  await expect(page.getByText(/4 Players/i)).toBeVisible();
  await expect(page.getByText(/2 Players/i)).toBeVisible();
  await expect(page.getByText(/Select Color/i)).toBeVisible();
  await expect(page.getByText(/Apply/i)).toBeVisible();

  await page.waitForTimeout(2000);
});
