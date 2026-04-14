import { test, expect } from '@playwright/test';

test('admin login and dashboard', async ({ page }) => {
  // Navigate to admin login page
  await page.goto('/admin/login');

  // Fill in login form
  await page.getByLabel('メールアドレス').fill('admin@example.com');
  await page.getByLabel('パスワード').fill('password123');

  // Click login button
  await page.getByRole('button', { name: 'ログイン' }).click();

  // Wait for navigation to admin dashboard
  await page.waitForURL('/admin');

  // Check that the dashboard title is displayed
  await expect(page.getByRole('heading', { name: '管理ダッシュボード' })).toBeVisible();
});