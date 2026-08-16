import { Page } from 'playwright';
import { TEST_RESULT_STATUS, ERROR_CATEGORY } from '../../config/constants';

export interface TestResultData {
  status: keyof typeof TEST_RESULT_STATUS;
  error_message?: string;
  error_category?: keyof typeof ERROR_CATEGORY;
  expected_behavior?: string;
  actual_behavior?: string;
  url?: string;
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
        error_category: ERROR_CATEGORY.PAGE_LOAD,
        expected_behavior: 'The URL should return a valid HTTP response',
        actual_behavior: 'No response received from server',
        url,
        details: { url },
        duration_ms,
      };
    }

    const status = response.status();

    if (status >= 200 && status < 300) {
      return {
        status: TEST_RESULT_STATUS.PASSED,
        url,
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
        error_category: ERROR_CATEGORY.NAVIGATION,
        expected_behavior: 'Direct access to the URL without redirects',
        actual_behavior: `HTTP ${status} redirect to ${response.url()}`,
        url,
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
        error_category: status === 404 ? ERROR_CATEGORY.BROKEN_LINK : ERROR_CATEGORY.PAGE_LOAD,
        expected_behavior: 'The URL should return HTTP 200-299 (successful response)',
        actual_behavior: `HTTP ${status} ${response.statusText()}`,
        url,
        details: {
          url,
          statusCode: status,
          statusText: response.statusText(),
        },
        duration_ms,
      };
    }
  } catch (error: any) {
    const isTimeout = error.message?.includes('Timeout') || error.message?.includes('timeout');
    return {
      status: TEST_RESULT_STATUS.FAILED,
      error_message: error.message || 'Failed to load website',
      error_category: isTimeout ? ERROR_CATEGORY.TIMEOUT : ERROR_CATEGORY.PAGE_LOAD,
      expected_behavior: 'The website should load within 30 seconds',
      actual_behavior: error.message || 'Failed to load website',
      url,
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
        error_category: ERROR_CATEGORY.PAGE_LOAD,
        expected_behavior: 'Page should have a descriptive <title> tag',
        actual_behavior: 'Page has an empty or missing <title> tag',
        url,
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
        error_category: ERROR_CATEGORY.PAGE_LOAD,
        expected_behavior: 'Page should have visible text content in the body',
        actual_behavior: 'Page body is empty or contains no text',
        url,
        details: { url, title },
        duration_ms: Date.now() - startTime,
      };
    }

    return {
      status: TEST_RESULT_STATUS.PASSED,
      url,
      details: {
        url,
        title,
        loadTime: Date.now() - startTime,
      },
      duration_ms: Date.now() - startTime,
    };
  } catch (error: any) {
    const url = page.url();
    return {
      status: TEST_RESULT_STATUS.FAILED,
      error_message: error.message || 'Page load failed',
      error_category: ERROR_CATEGORY.PAGE_LOAD,
      expected_behavior: 'Page DOM should load completely',
      actual_behavior: error.message || 'Page load failed',
      url,
      details: {
        url,
        error: error.message,
      },
      duration_ms: Date.now() - startTime,
    };
  }
}
