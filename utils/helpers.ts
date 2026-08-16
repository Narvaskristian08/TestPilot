import { Page, Locator, expect } from '@playwright/test';

/**
 * Helper utility functions for test automation
 */

export class Helpers {
  /**
   * Wait for element to appear and be visible
   */
  static async waitForElement(
    locator: Locator, 
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to disappear
   */
  static async waitForElementToDisappear(
    locator: Locator, 
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for page to fully load
   */
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
  }

  /**
   * Scroll element into view
   */
  static async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Take screenshot with custom name
   */
  static async takeScreenshot(
    page: Page, 
    name: string, 
    fullPage: boolean = true
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `screenshots/${name}_${timestamp}.png`, 
      fullPage 
    });
  }

  /**
   * Get element count
   */
  static async getElementCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  /**
   * Check if element exists (without throwing error)
   */
  static async elementExists(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'attached', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is visible
   */
  static async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get text from element with fallback
   */
  static async getText(locator: Locator, fallback: string = ''): Promise<string> {
    try {
      const text = await locator.textContent();
      return text || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Get all text contents from multiple elements
   */
  static async getAllTexts(locator: Locator): Promise<string[]> {
    return await locator.allTextContents();
  }

  /**
   * Click element with retry
   */
  static async clickWithRetry(
    locator: Locator, 
    maxRetries: number = 3
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Fill input with clearing first
   */
  static async fillInput(locator: Locator, text: string): Promise<void> {
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Select dropdown option by text
   */
  static async selectOption(locator: Locator, text: string): Promise<void> {
    await locator.selectOption({ label: text });
  }

  /**
   * Wait for URL to contain specific text
   */
  static async waitForUrlToContain(
    page: Page, 
    urlPart: string, 
    timeout: number = 10000
  ): Promise<void> {
    await page.waitForURL(new RegExp(urlPart), { timeout });
  }

  /**
   * Verify URL contains text
   */
  static verifyUrlContains(page: Page, urlPart: string): void {
    expect(page.url()).toContain(urlPart);
  }

  /**
   * Verify page title
   */
  static async verifyPageTitle(page: Page, expectedTitle: string): Promise<void> {
    await expect(page).toHaveTitle(expectedTitle);
  }

  /**
   * Wait for response from API endpoint
   */
  static async waitForResponse(
    page: Page, 
    urlPattern: string | RegExp
  ): Promise<void> {
    await page.waitForResponse(urlPattern);
  }

  /**
   * Get all values from input fields
   */
  static async getInputValue(locator: Locator): Promise<string> {
    return await locator.inputValue();
  }

  /**
   * Check if checkbox/radio is checked
   */
  static async isChecked(locator: Locator): Promise<boolean> {
    return await locator.isChecked();
  }

  /**
   * Check if element is enabled
   */
  static async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  /**
   * Check if element is disabled
   */
  static async isDisabled(locator: Locator): Promise<boolean> {
    return await locator.isDisabled();
  }

  /**
   * Get attribute value from element
   */
  static async getAttribute(
    locator: Locator, 
    attributeName: string
  ): Promise<string | null> {
    return await locator.getAttribute(attributeName);
  }

  /**
   * Press keyboard key
   */
  static async pressKey(page: Page, key: string): Promise<void> {
    await page.keyboard.press(key);
  }

  /**
   * Type text with delay (simulates human typing)
   */
  static async typeSlowly(
    locator: Locator, 
    text: string, 
    delay: number = 100
  ): Promise<void> {
    await locator.pressSequentially(text, { delay });
  }

  /**
   * Hover over element
   */
  static async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }

  /**
   * Double click element
   */
  static async doubleClick(locator: Locator): Promise<void> {
    await locator.dblclick();
  }

  /**
   * Right click element
   */
  static async rightClick(locator: Locator): Promise<void> {
    await locator.click({ button: 'right' });
  }

  /**
   * Drag and drop element
   */
  static async dragAndDrop(
    source: Locator, 
    target: Locator
  ): Promise<void> {
    await source.dragTo(target);
  }

  /**
   * Set viewport size
   */
  static async setViewport(
    page: Page, 
    width: number, 
    height: number
  ): Promise<void> {
    await page.setViewportSize({ width, height });
  }

  /**
   * Reload page
   */
  static async reload(page: Page): Promise<void> {
    await page.reload();
  }

  /**
   * Go back in browser history
   */
  static async goBack(page: Page): Promise<void> {
    await page.goBack();
  }

  /**
   * Go forward in browser history
   */
  static async goForward(page: Page): Promise<void> {
    await page.goForward();
  }

  /**
   * Execute JavaScript in browser context
   */
  static async executeScript(page: Page, script: string): Promise<any> {
    return await page.evaluate(script);
  }

  /**
   * Wait for specific amount of time (use sparingly)
   */
  static async wait(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Generate timestamp
   */
  static getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Generate random number between min and max
   */
  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random string
   */
  static randomString(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Clear browser cookies
   */
  static async clearCookies(page: Page): Promise<void> {
    await page.context().clearCookies();
  }

  /**
   * Clear browser local storage
   */
  static async clearLocalStorage(page: Page): Promise<void> {
    await page.evaluate(() => localStorage.clear());
  }

  /**
   * Clear browser session storage
   */
  static async clearSessionStorage(page: Page): Promise<void> {
    await page.evaluate(() => sessionStorage.clear());
  }

  /**
   * Get local storage item
   */
  static async getLocalStorageItem(page: Page, key: string): Promise<string | null> {
    return await page.evaluate((key) => localStorage.getItem(key), key);
  }

  /**
   * Set local storage item
   */
  static async setLocalStorageItem(
    page: Page, 
    key: string, 
    value: string
  ): Promise<void> {
    await page.evaluate(
      ({ key, value }) => localStorage.setItem(key, value),
      { key, value }
    );
  }

  /**
   * Check if page contains text
   */
  static async pageContainsText(page: Page, text: string): Promise<boolean> {
    const bodyText = await page.textContent('body');
    return bodyText?.includes(text) || false;
  }

  /**
   * Get all links on page
   */
  static async getAllLinks(page: Page): Promise<string[]> {
    return await page.$$eval('a', links => links.map(link => link.href));
  }

  /**
   * Check for broken images
   */
  static async checkBrokenImages(page: Page): Promise<string[]> {
    return await page.$$eval('img', images => 
      images
        .filter(img => !img.complete || img.naturalHeight === 0)
        .map(img => img.src)
    );
  }

  /**
   * Check for console errors
   */
  static setupConsoleErrorListener(page: Page): string[] {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }
}
