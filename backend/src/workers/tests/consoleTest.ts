import { TEST_RESULT_STATUS, ERROR_CATEGORY } from '../../config/constants';
import { TestResultData } from './availabilityTest';

export interface ConsoleErrorCollector {
  errors: string[];
  warnings: string[];
  pageErrors: string[];
}

/**
 * Create a console error collector to attach to a Playwright page.
 * Call this BEFORE navigating to the URL so all events are captured.
 */
export function createConsoleCollector(page: import('playwright').Page): ConsoleErrorCollector {
  const collector: ConsoleErrorCollector = {
    errors: [],
    warnings: [],
    pageErrors: [],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      collector.errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      collector.warnings.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    collector.pageErrors.push(error.message);
  });

  return collector;
}

/**
 * Build the final TestResultData from a collected console snapshot.
 */
export function buildConsoleTestResult(
  collector: ConsoleErrorCollector,
  duration_ms: number,
  pageUrl?: string
): TestResultData {
  const totalErrors = collector.errors.length + collector.pageErrors.length;

  let status: keyof typeof TEST_RESULT_STATUS;
  if (totalErrors === 0) {
    status = TEST_RESULT_STATUS.PASSED;
  } else if (totalErrors <= 3) {
    status = TEST_RESULT_STATUS.WARNING;
  } else {
    status = TEST_RESULT_STATUS.FAILED;
  }

  const firstError = collector.errors[0] || collector.pageErrors[0];

  return {
    status,
    error_message:
      totalErrors > 0
        ? `Found ${totalErrors} console error(s) and ${collector.pageErrors.length} uncaught exception(s)`
        : undefined,
    error_category: totalErrors > 0 ? ERROR_CATEGORY.CONSOLE_ERROR : undefined,
    expected_behavior: totalErrors > 0 ? 'Page should load without JavaScript errors in the console' : undefined,
    actual_behavior: totalErrors > 0 ? `${totalErrors} console error(s): ${firstError?.substring(0, 100)}` : undefined,
    url: pageUrl,
    details: {
      consoleErrors: collector.errors.slice(0, 20),
      pageErrors: collector.pageErrors.slice(0, 10),
      consoleWarnings: collector.warnings.slice(0, 10),
      totalErrors,
      totalWarnings: collector.warnings.length,
    },
    duration_ms,
  };
}
