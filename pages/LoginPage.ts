import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object Model for login functionality
 * Handles all login-related interactions
 */
export class LoginPage extends BasePage {
  // Locators - using Playwright's recommended locator strategies
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators using semantic selectors
    // NOTE: These selectors are placeholders - update based on your actual application
    this.emailInput = page.getByLabel(/email|username/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.getByRole('button', { name: /log ?in|sign ?in/i });
    this.errorMessage = page.getByRole('alert').or(page.locator('[role="alert"]')).or(page.locator('.error, .error-message'));
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.signUpLink = page.getByRole('link', { name: /sign ?up|register/i });
    this.rememberMeCheckbox = page.getByLabel(/remember me/i);
  }

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Perform login with remember me option
   */
  async loginWithRememberMe(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.rememberMeCheckbox.check();
    await this.loginButton.click();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Check if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Check if login page is loaded
   */
  async isLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.loginButton);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  /**
   * Click sign up link
   */
  async clickSignUp(): Promise<void> {
    await this.signUpLink.click();
  }

  /**
   * Check if email input has error state
   */
  async hasEmailError(): Promise<boolean> {
    const ariaInvalid = await this.emailInput.getAttribute('aria-invalid');
    return ariaInvalid === 'true';
  }

  /**
   * Check if password input has error state
   */
  async hasPasswordError(): Promise<boolean> {
    const ariaInvalid = await this.passwordInput.getAttribute('aria-invalid');
    return ariaInvalid === 'true';
  }

  /**
   * Get validation message for email field
   */
  async getEmailValidationMessage(): Promise<string> {
    const validationMessage = await this.page.evaluate((selector) => {
      const element = document.querySelector(selector) as HTMLInputElement;
      return element?.validationMessage || '';
    }, await this.emailInput.getAttribute('id') || 'email');
    return validationMessage;
  }

  /**
   * Clear login form
   */
  async clearForm(): Promise<void> {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isElementEnabled(this.loginButton);
  }

  /**
   * Check if login button is disabled
   */
  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.isElementDisabled(this.loginButton);
  }
}
