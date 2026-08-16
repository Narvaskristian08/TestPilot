import { test, expect } from '../../fixtures/testFixtures';

/**
 * Authentication Test Suite - Protected Routes
 * Tests access control and authorization
 */

test.describe('Protected Routes', () => {
  test('TC-016: Unauthenticated user cannot access dashboard', async ({ page }) => {
    // Act - try to access dashboard without authentication
    await page.goto('/dashboard');

    // Assert - should be redirected to login
    await expect(page).toHaveURL(/login|signin|auth/, { timeout: 10000 });
  });

  test('TC-017: Unauthenticated user cannot access profile', async ({ page }) => {
    // Act
    await page.goto('/profile');

    // Assert
    await expect(page).toHaveURL(/login|signin|auth/, { timeout: 10000 });
  });

  test('TC-018: Unauthenticated user cannot access settings', async ({ page }) => {
    // Act
    await page.goto('/settings');

    // Assert
    await expect(page).toHaveURL(/login|signin|auth/, { timeout: 10000 });
  });

  test('TC-019: Authenticated user can access dashboard', async ({ authenticatedPage, dashboardPage }) => {
    // Act
    await dashboardPage.goto();

    // Assert
    await expect(authenticatedPage).toHaveURL(/dashboard/, { timeout: 10000 });
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).toBeTruthy();
  });

  test('TC-020: Authenticated user can access profile', async ({ authenticatedPage }) => {
    // Act
    await authenticatedPage.goto('/profile');

    // Assert - should stay on profile page or similar protected route
    await expect(authenticatedPage).not.toHaveURL(/login/);
  });

  test('TC-021: Login page redirects authenticated users', async ({ authenticatedPage, loginPage }) => {
    // Arrange - user is already authenticated
    
    // Act - try to access login page
    await loginPage.goto();

    // Assert - should be redirected to dashboard or home
    // Note: This behavior depends on application logic
    await expect(authenticatedPage).toHaveURL(/dashboard|home|^\/$/, { timeout: 10000 });
  });

  test('TC-022: Session persists across page reloads', async ({ authenticatedPage, dashboardPage }) => {
    // Arrange
    await dashboardPage.goto();
    expect(await dashboardPage.isLoggedIn()).toBeTruthy();

    // Act - reload page
    await authenticatedPage.reload();

    // Assert - should still be logged in
    await expect(authenticatedPage).toHaveURL(/dashboard/);
    expect(await dashboardPage.isLoggedIn()).toBeTruthy();
  });

  test('TC-023: Direct URL access requires authentication', async ({ page }) => {
    // Test various protected routes
    const protectedRoutes = ['/dashboard', '/profile', '/settings', '/account'];

    for (const route of protectedRoutes) {
      // Act
      await page.goto(route);

      // Assert
      const currentUrl = page.url();
      const isProtected = currentUrl.includes('login') || 
                          currentUrl.includes('signin') || 
                          currentUrl.includes('auth');
      
      expect(isProtected).toBeTruthy();
    }
  });
});
