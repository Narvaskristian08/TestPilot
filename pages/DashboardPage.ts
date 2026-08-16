import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DashboardPage - Page Object Model for dashboard functionality
 * Handles post-login dashboard interactions
 */
export class DashboardPage extends BasePage {
  // Locators
  readonly pageHeading: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly profileLink: Locator;
  readonly settingsLink: Locator;
  readonly notificationBell: Locator;
  readonly searchInput: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators using semantic selectors
    // NOTE: These selectors are placeholders - update based on your actual application
    this.pageHeading = page.getByRole('heading', { name: /dashboard/i, level: 1 });
    this.userMenu = page.getByRole('button', { name: /user menu|account|profile/i });
    this.logoutButton = page.getByRole('button', { name: /log ?out|sign ?out/i });
    this.profileLink = page.getByRole('link', { name: /profile|my account/i });
    this.settingsLink = page.getByRole('link', { name: /settings|preferences/i });
    this.notificationBell = page.getByRole('button', { name: /notifications/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.welcomeMessage = page.getByText(/welcome/i);
  }

  /**
   * Navigate to the dashboard page
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  /**
   * Check if dashboard page is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.pageHeading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    // Check if user menu needs to be opened first
    const isLogoutVisible = await this.isElementVisible(this.logoutButton);
    
    if (!isLogoutVisible) {
      await this.userMenu.click();
      await this.logoutButton.waitFor({ state: 'visible' });
    }
    
    await this.logoutButton.click();
  }

  /**
   * Open user menu
   */
  async openUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  /**
   * Navigate to profile page
   */
  async goToProfile(): Promise<void> {
    const isProfileVisible = await this.isElementVisible(this.profileLink);
    
    if (!isProfileVisible) {
      await this.openUserMenu();
    }
    
    await this.profileLink.click();
  }

  /**
   * Navigate to settings page
   */
  async goToSettings(): Promise<void> {
    const isSettingsVisible = await this.isElementVisible(this.settingsLink);
    
    if (!isSettingsVisible) {
      await this.openUserMenu();
    }
    
    await this.settingsLink.click();
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.welcomeMessage.textContent() || '';
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.isLoaded();
  }

  /**
   * Search for content
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Check if notifications bell is visible
   */
  async hasNotifications(): Promise<boolean> {
    return await this.isElementVisible(this.notificationBell);
  }

  /**
   * Open notifications
   */
  async openNotifications(): Promise<void> {
    await this.notificationBell.click();
  }

  /**
   * Get page heading text
   */
  async getPageHeading(): Promise<string> {
    return await this.pageHeading.textContent() || '';
  }

  /**
   * Navigate using main navigation
   */
  async navigateToSection(sectionName: string): Promise<void> {
    const navLink = this.page.getByRole('link', { name: new RegExp(sectionName, 'i') });
    await navLink.click();
  }

  /**
   * Check if specific section link is visible in navigation
   */
  async isSectionVisible(sectionName: string): Promise<boolean> {
    const navLink = this.page.getByRole('link', { name: new RegExp(sectionName, 'i') });
    return await this.isElementVisible(navLink);
  }
}
