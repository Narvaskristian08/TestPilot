import { test, expect } from '../../fixtures/testFixtures';

/**
 * Authentication Test Suite - Logout Functionality
 * Tests logout behavior and session management
 */

test.describe('Logout Functionality', () => {
  test('TC-012: Successful logout', async ({ authenticatedPage, dashboardPage }) => {
    // Arrange - user is already authenticated via fixture
    await dashboardPage.goto();
    const isLoggedIn = await dashboardPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();

    // Act
    await dashboardPage.logout();

    // Assert
    await expect(authenticatedPage).toHaveURL(/login|home|^\/$/, { timeout: 10000 });
    await expect(authenticatedPage).not.toHaveURL(/dashboard/);
  });

  test('TC-013: Cannot access dashboard after logout', async ({ authenticatedPage, dashboardPage }) => {
    // Arrange - logout first
    await dashboardPage.goto();
    await dashboardPage.logout();

    // Act - try to access dashboard
    await dashboardPage.goto();

    // Assert - should be redirected to login or home
    await expect(authenticatedPage).toHaveURL(/login|home|^\/$/, { timeout: 10000 });
  });

  test('TC-014: Logout clears authentication state', async ({ authenticatedPage, dashboardPage, loginPage }) => {
    // Arrange
    await dashboardPage.goto();

    // Act
    await dashboardPage.logout();
    
    // Try to access protected page
    await dashboardPage.goto();

    // Assert - should be on login page
    await expect(authenticatedPage).toHaveURL(/login/, { timeout: 10000 });
    
    const isLoginPageLoaded = await loginPage.isLoaded();
    expect(isLoginPageLoaded).toBeTruthy();
  });

  test('TC-015: User menu is accessible before logout', async ({ authenticatedPage, dashboardPage }) => {
    // Arrange
    await dashboardPage.goto();

    // Act
    await dashboardPage.openUserMenu();

    // Assert
    await expect(dashboardPage.logoutButton).toBeVisible({ timeout: 5000 });
  });
});
