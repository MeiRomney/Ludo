import { test, expect } from '@playwright/test';

test.describe('Ludo-Ray Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage and show title and buttons', async ({ page }) => {
    // Check the page title
    await expect(page).toHaveTitle(/Ludo Ray/i);

    // Check that the logo is visible
    const logo = page.getByAltText('ludo');
    await expect(logo).toBeVisible();

    // Buttons: Start Game, How to play, Setting
    const startButton = page.getByRole('button', { name: /Start Game/i });
    const howToPlayButton = page.getByRole('button', { name: /How to play/i });
    const settingButton = page.getByRole('button', { name: /Setting/i });

    await expect(startButton).toBeVisible();
    await expect(howToPlayButton).toBeVisible();
    await expect(settingButton).toBeVisible();
  });

  test('should navigate to Setting page', async ({ page }) => {
    await page.getByRole('button', { name: /Setting/i }).click();
    await expect(page).toHaveURL(/setting/);
    // Optionally check that some setting UI is present:
    // await expect(page.getByText(/Settings/i)).toBeVisible();
  });

  test('should open start game modal when clicking Start Game', async ({ page }) => {
    await page.getByRole('button', { name: /Start Game/i }).click();
    // Since in your component, clicking "Start Game" opens a gameplay-modal route:
    await expect(page).toHaveURL(/gameplay-modal/);
    // Check that the modal title “Choose Game Mode” is visible:
    await expect(page.getByRole('heading', { name: /Choose Game Mode/i })).toBeVisible();
    // Buttons inside modal:
    await expect(page.getByRole('button', { name: /Online/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /VS Computer/i })).toBeVisible();
  });
});
