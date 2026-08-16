import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Custom fixtures that extend Playwright's base test
 * Provides reusable page objects and authenticated contexts
 */

type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

/**
 * Extended test fixture with custom page objects and authentication
 */
export const test = base.extend<TestFixtures>({
  /**
   * LoginPage fixture - automatically initialized for each test
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * DashboardPage fixture - automatically initialized for each test
   */
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  /**
   * Authenticated page fixture - provides a page with user already logged in
   * This avoids repeating login for every test that requires authentication
   * 
   * Usage: async ({ authenticatedPage }) => { ... }
   */
  authenticatedPage: async ({ page }, use) => {
    // Check if credentials are available
    const email = process.env.TEST_USERNAME || process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;

    if (!email || !password) {
      console.warn('⚠️  Authentication credentials not found in environment variables.');
      console.warn('⚠️  Set TEST_USERNAME/TEST_EMAIL and TEST_PASSWORD in .env file');
      console.warn('⚠️  Proceeding without authentication...');
      await use(page);
      return;
    }

    // Perform login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);

    // Wait for navigation to complete (adjust URL pattern based on your app)
    await page.waitForURL(/dashboard|home/i, { timeout: 10000 }).catch(() => {
      console.warn('⚠️  Dashboard URL not detected after login. Authentication may have failed.');
    });

    // Use the authenticated page
    await use(page);
  },
});

/**
 * Export expect from Playwright for convenience
 */
export { expect } from '@playwright/test';

/**
 * Helper to create authentication state file for reuse across tests
 * This can significantly speed up test execution by avoiding repeated logins
 * 
 * Usage:
 * 1. Run this once to create auth state: await saveAuthState(page, email, password);
 * 2. In playwright.config.ts, configure storageState to load the saved state
 */
export async function saveAuthState(
  page: Page, 
  email: string, 
  password: string, 
  storageStatePath: string = 'playwright/.auth/user.json'
): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  
  // Wait for authentication to complete
  await page.waitForURL(/dashboard|home/i);
  
  // Save storage state
  await page.context().storageState({ path: storageStatePath });
  console.log(`✅ Authentication state saved to ${storageStatePath}`);
}

/**
 * Helper to setup authentication for a browser context
 * Use this in beforeAll hooks for test files that need authentication
 */
export async function setupAuthentication(page: Page): Promise<void> {
  const email = process.env.TEST_USERNAME || process.env.TEST_EMAIL || '';
  const password = process.env.TEST_PASSWORD || '';

  if (!email || !password) {
    throw new Error('Authentication credentials not found. Set TEST_USERNAME and TEST_PASSWORD environment variables.');
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await page.waitForURL(/dashboard|home/i);
}
