import { BrowserContext } from 'playwright';
import { TEST_RESULT_STATUS } from '../../config/constants';
import { TestResultData } from './availabilityTest';

const VIEWPORTS = [
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 },
];

/**
 * Responsive Design Test
 * Opens the target URL in 3 different viewport sizes and checks for obvious layout problems.
 */
export async function runResponsiveTest(
  context: BrowserContext,
  url: string
): Promise<TestResultData> {
  const startTime = Date.now();
  const results: Array<{
    viewport: string;
    width: number;
    height: number;
    hasHorizontalScroll: boolean;
    pageTitle: string;
    passed: boolean;
    error?: string;
  }> = [];

  for (const viewport of VIEWPORTS) {
    const page = await context.newPage();

    try {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      const pageTitle = await page.title().catch(() => '');

      results.push({
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        hasHorizontalScroll,
        pageTitle,
        passed: !hasHorizontalScroll,
      });
    } catch (error: any) {
      results.push({
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        hasHorizontalScroll: false,
        pageTitle: '',
        passed: false,
        error: error.message || 'Failed to load at this viewport',
      });
    } finally {
      await page.close().catch(() => {});
    }
  }

  const failedViewports = results.filter((r) => !r.passed);
  const allPassed = failedViewports.length === 0;

  return {
    status: allPassed
      ? TEST_RESULT_STATUS.PASSED
      : failedViewports.length < VIEWPORTS.length
      ? TEST_RESULT_STATUS.WARNING
      : TEST_RESULT_STATUS.FAILED,
    error_message: !allPassed
      ? `Layout issues detected at: ${failedViewports.map((r) => r.viewport).join(', ')}`
      : undefined,
    details: {
      viewportsTested: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: failedViewports.length,
      viewports: results,
    },
    duration_ms: Date.now() - startTime,
  };
}
