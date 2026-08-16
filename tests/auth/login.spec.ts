import { test, expect } from '../../fixtures/testFixtures';
import { testData } from '../../utils/testData';

/**
 * Authentication Test Suite - Login Functionality
 * Tests various login scenarios including valid/invalid credentials
 */

test.describe('Login Functionality', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('TC-001: Successful login with valid credentials', async ({ loginPage, page }) => {
    // Arrange
    const { email, password } = testData.validUser;

    // Act
    await loginPage.login(email, password);

    // Assert
    await expect(page).toHaveURL(/dashboard|home/i, { timeout: 10000 });
    await expect(page).not.toHaveURL(/login/);
  });

  test('TC-002: Login fails with invalid email', async ({ loginPage, page }) => {
    // Arrange
    const { email, password } = testData.invalidUser;

    // Act
    await loginPage.login(email, password);

    // Assert
    await expect(page).toHaveURL(/login/);
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBeTruthy();
  });

  test('TC-003: Login fails with invalid password', async ({ loginPage, page }) => {
    // Arrange
    const validEmail = testData.validUser.email;
    const invalidPassword = testData.invalidUser.password;

    // Act
    await loginPage.login(validEmail, invalidPassword);

    // Assert
    await expect(page).toHaveURL(/login/);
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBeTruthy();
  });

  test('TC-004: Login fails with empty credentials', async ({ loginPage, page }) => {
    // Act
    await loginPage.loginButton.click();

    // Assert
    await expect(page).toHaveURL(/login/);
    
    // Check for HTML5 validation or error messages
    const emailHasError = await loginPage.hasEmailError();
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    
    expect(emailHasError || isErrorVisible).toBeTruthy();
  });

  test('TC-005: Login fails with empty email', async ({ loginPage, page }) => {
    // Arrange
    const password = testData.validUser.password;

    // Act
    await loginPage.passwordInput.fill(password);
    await loginPage.loginButton.click();

    // Assert
    await expect(page).toHaveURL(/login/);
  });

  test('TC-006: Login fails with empty password', async ({ loginPage, page }) => {
    // Arrange
    const email = testData.validUser.email;

    // Act
    await loginPage.emailInput.fill(email);
    await loginPage.loginButton.click();

    // Assert
    await expect(page).toHaveURL(/login/);
  });

  test('TC-007: Login page is loaded correctly', async ({ loginPage }) => {
    // Assert
    const isLoaded = await loginPage.isLoaded();
    expect(isLoaded).toBeTruthy();
    
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('TC-008: Login with remember me option', async ({ loginPage, page }) => {
    // Arrange
    const { email, password } = testData.validUser;

    // Act
    await loginPage.loginWithRememberMe(email, password);

    // Assert
    await expect(page).toHaveURL(/dashboard|home/i, { timeout: 10000 });
  });

  test('TC-009: Error message contains expected text', async ({ loginPage }) => {
    // Arrange
    const { email, password } = testData.invalidUser;

    // Act
    await loginPage.login(email, password);

    // Assert
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toMatch(testData.errorMessages.invalidCredentials);
  });

  test('TC-010: Password input type is password', async ({ loginPage }) => {
    // Assert
    const type = await loginPage.passwordInput.getAttribute('type');
    expect(type).toBe('password');
  });

  test('TC-011: Login button is enabled when form is filled', async ({ loginPage }) => {
    // Arrange
    const { email, password } = testData.validUser;

    // Act
    await loginPage.emailInput.fill(email);
    await loginPage.passwordInput.fill(password);

    // Assert - button should be enabled or not explicitly disabled
    const isDisabled = await loginPage.isLoginButtonDisabled();
    expect(isDisabled).toBeFalsy();
  });
});
