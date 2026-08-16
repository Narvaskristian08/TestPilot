import { Page, Locator } from 'playwright';

/**
 * Discover all links on a page
 */
export async function discoverLinks(page: Page): Promise<Array<{ href: string; text: string }>> {
  try {
    const links = await page.$$eval('a[href]', (anchors) =>
      anchors.map((a) => ({
        href: (a as HTMLAnchorElement).href,
        text: (a as HTMLAnchorElement).textContent?.trim() || '',
      }))
    );
    
    return links.filter(link => link.href && link.href.startsWith('http'));
  } catch (error) {
    console.error('Error discovering links:', error);
    return [];
  }
}

/**
 * Discover all buttons on a page
 */
export async function discoverButtons(page: Page): Promise<Array<{ text: string; type: string; role: string }>> {
  try {
    const buttons = await page.$$eval('button, input[type="button"], input[type="submit"], [role="button"]', (elements) =>
      elements
        .filter((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        })
        .map((el) => ({
          text: el.textContent?.trim() || (el as HTMLInputElement).value || '',
          type: (el as HTMLInputElement).type || 'button',
          role: el.getAttribute('role') || 'button',
        }))
    );
    
    return buttons;
  } catch (error) {
    console.error('Error discovering buttons:', error);
    return [];
  }
}

/**
 * Discover all forms on a page
 */
export async function discoverForms(page: Page): Promise<Array<{
  action: string;
  method: string;
  fields: Array<{ name: string; type: string; required: boolean; label: string }>;
}>> {
  try {
    const forms = await page.$$eval('form', (forms) =>
      forms.map((form) => {
        const inputs = Array.from(form.querySelectorAll('input, textarea, select'));
        
        return {
          action: form.action,
          method: form.method || 'get',
          fields: inputs
            .filter((input) => {
              const style = window.getComputedStyle(input);
              return style.display !== 'none' && style.visibility !== 'hidden';
            })
            .map((input) => {
              const el = input as HTMLInputElement;
              const label = form.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() ||
                           input.getAttribute('placeholder') ||
                           input.getAttribute('name') || '';
              
              return {
                name: el.name || el.id || '',
                type: el.type || 'text',
                required: el.required,
                label,
              };
            }),
        };
      })
    );
    
    return forms;
  } catch (error) {
    console.error('Error discovering forms:', error);
    return [];
  }
}

/**
 * Check if URL belongs to the same domain
 */
export function isSameDomain(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    
    return urlObj.hostname === baseUrlObj.hostname;
  } catch {
    return false;
  }
}

/**
 * Get visible text content from page
 */
export async function getVisibleText(page: Page): Promise<string> {
  try {
    return await page.evaluate(() => {
      return document.body.innerText || '';
    });
  } catch (error) {
    return '';
  }
}

/**
 * Check if page has horizontal scroll (overflow)
 */
export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  try {
    return await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
  } catch {
    return false;
  }
}
