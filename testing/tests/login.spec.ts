
import { expect, test } from '@playwright/test';

test.describe('User Login', () => {
  test('should allow a user to log in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/login/);

    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'BadPassword');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/super-user/);
  });

  test('should show error for missing email or password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', '');
    await page.fill('input[type="password"]', '');
    await page.click('button[type="submit"]');
    // Only match the toast message, not all .text-white elements
    const toastMsg = page.locator('.toast .text-white p');
    await expect(toastMsg).toHaveCount(1);
    await expect(toastMsg).toContainText(/please enter both email and password/i);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    const toastMsg = page.locator('.toast .text-white p');
    await expect(toastMsg).toHaveCount(1);
    await expect(toastMsg).toContainText(/invalid email or password/i);
  });

  test('should allow user to use "Remember me"', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'BadPassword');
    await page.check('input#rememberMe');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/super-user/);

    // Check that token is stored in localStorage (persistent storage)
    const localStorageToken = await page.evaluate(() => localStorage.getItem('token'));
    const sessionStorageToken = await page.evaluate(() => sessionStorage.getItem('token'));
    expect(localStorageToken).toBeTruthy();
    expect(sessionStorageToken).toBeNull();

    // Simulate browser restart by creating a new page in the same context
    const newPage = await context.newPage();
    await newPage.goto('/super-user');
    await expect(newPage).toHaveURL(/super-user/);

    // Verify token is still available after "restart"
    const persistentToken = await newPage.evaluate(() => localStorage.getItem('token'));
    expect(persistentToken).toBeTruthy();
  });

  test('should not persist login when "Remember me" is unchecked', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'BadPassword');
    // Ensure remember me is NOT checked
    await page.uncheck('input#rememberMe');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/super-user/);

    // Check that token is stored in sessionStorage (session-only storage)
    const localStorageToken = await page.evaluate(() => localStorage.getItem('token'));
    const sessionStorageToken = await page.evaluate(() => sessionStorage.getItem('token'));
    expect(localStorageToken).toBeNull();
    expect(sessionStorageToken).toBeTruthy();

    // Simulate browser restart - create new context to simulate session end
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();

    // Should redirect to login since session storage is cleared in new context
    await newPage.goto('/super-user');
    await expect(newPage).toHaveURL(/login/);

    await newContext.close();
  });

  test('should allow user to initiate password reset', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Forgot password?")');
    await page.fill('input#resetEmail', 'testuser@example.com');
    await page.click('button:has-text("Send Reset Link")');
    // You may want to check for a success toast or modal close
    // await expect(page.locator('.toast, .text-success')).toContainText(/reset link/i);
  });

  test('should be accessible on mobile', async ({ browser }) => {
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X)...'
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('/login');
    await expect(mobilePage.locator('form')).toBeVisible();
    await mobileContext.close();
  });
});
