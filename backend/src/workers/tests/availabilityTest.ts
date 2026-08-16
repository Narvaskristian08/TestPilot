import { Page } from 'playwright';
import { TEST_RESULT_STATUS } from '../../config/constants';

export interface TestResultData {
  status: keyof typeof TEST_RESULT_STATUS;
  error_message?: string;
  details: any;
  duration_ms: number;
}

/**
 * Test 1: Website Availability
 * Check if URL is reachable and responds successfully
 */
export async function runAvailabilityTest(page: Page, url: string): Promise<TestResultData> {
  const startTime = Date.now();
  
  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const duration_ms = Date.now() - startTime;

    if (!response) {
      return {
        status: TEST_RESULT_STATUS.FAILED,
        error_message: 'No response received from server',
        details: { url },
        duration_ms,
      };
    }

    const status = response.status();

    if (status >= 200 && status < 300) {
      return {
        status: TEST_RESULT_STATUS.PASSED,
        details: {
          url,
          statusCode: status,
          statusText: response.statusText(),
          loadTime: duration_ms,
        },
        duration_ms,
      };
    } else if (status >= 300 && status < 400) {
      return {
        status: TEST_RESULT_STATUS.WARNING,
        error_message: `Redirect detected (${status})`,
        details: {
          url,
          statusCode: status,
          redirectUrl: response.url(),
        },
        duration_ms,
      };
    } else {
      return {
        status: TEST_RESULT_STATUS.FAILED,
        error_message: `HTTP ${status}: ${response.statusText()}`,
        details: {
          url,
          statusCode: status,
          statusText: response.statusText(),
        },
        duration_ms,
      };
    }
  } catch (error: any) {
    return {
      status: TEST_RESULT_STATUS.FAILED,
      error_message: error.message || 'Failed to load website',
      details: {
        url,
        error: error.message,
      },
      duration_ms: Date.now() - startTime,
    };
  }
}

/**
 * Test 2: Page Load
 * Verify page loads successfully with title and content
 */
export async function runPageLoadTest(page: Page): Promise<TestResultData> {
  const startTime = Date.now();
  
  try {
    await page.waitForLoadState('domcontentloaded');
    
    const title = await page.title();
    const url = page.url();
    
    if (!title || title.trim() === '') {
      return {
        status: TEST_RESULT_STATUS.WARNING,
        error_message: 'Page loaded but has no title',
        details: { url, title: '' },
        duration_ms: Date.now() - startTime,
      };
    }

    // Check if page has body content
    const hasContent = await page.evaluate(() => {
      return document.body && document.body.textContent && document.body.textContent.trim().length > 0;
    });

    if (!hasContent) {
      return {
        status: TEST_RESULT_STATUS.WARNING,
        error_message: 'Page loaded but appears to have no visible content',
        details: { url, title },
        duration_ms: Date.now() - startTime,
      };
    }

    return {
      status: TEST_RESULT_STATUS.PASSED,
      details: {
        url,
        title,
        loadTime: Date.now() - startTime,
      },
      duration_ms: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      status: TEST_RESULT_STATUS.FAILED,
      error_message: error.message || 'Page load failed',
      details: {
        url: page.url(),
        error: error.message,
      },
      duration_ms: Date.now() - startTime,
    };
  }
}
