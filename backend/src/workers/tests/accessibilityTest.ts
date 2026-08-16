import { Page } from 'playwright';
import { TEST_RESULT_STATUS } from '../../config/constants';
import { TestResultData } from './availabilityTest';
import fs from 'fs';
import path from 'path';

/**
 * Accessibility Test using axe-core
 * Injects axe-core into the page and runs an audit.
 * axe-core is already a dependency in backend/package.json.
 */
export async function runAccessibilityTest(page: Page): Promise<TestResultData> {
  const startTime = Date.now();

  try {
    // Resolve axe-core path from node_modules
    const axePath = require.resolve('axe-core');
    const axeSource = fs.readFileSync(axePath, 'utf8');

    // Inject axe-core into the page
    await page.evaluate(axeSource);

    // Run axe audit
    const axeResults = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        // @ts-ignore - axe is injected into the page context
        window.axe.run(
          document,
          {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'best-practice'],
            },
          },
          (_err: any, results: any) => {
            resolve(results);
          }
        );
      });
    });

    const violations: Array<{
      id: string;
      impact: string;
      description: string;
      help: string;
      helpUrl: string;
      nodes: number;
    }> = (axeResults.violations || []).slice(0, 20).map((v: any) => ({
      id: v.id,
      impact: v.impact || 'unknown',
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: (v.nodes || []).length,
    }));

    const critical = violations.filter((v) => v.impact === 'critical');
    const serious = violations.filter((v) => v.impact === 'serious');
    const moderate = violations.filter((v) => v.impact === 'moderate' || v.impact === 'minor');

    let status: keyof typeof TEST_RESULT_STATUS;
    if (violations.length === 0) {
      status = TEST_RESULT_STATUS.PASSED;
    } else if (critical.length > 0 || serious.length > 2) {
      status = TEST_RESULT_STATUS.FAILED;
    } else {
      status = TEST_RESULT_STATUS.WARNING;
    }

    return {
      status,
      error_message:
        violations.length > 0
          ? `Found ${violations.length} accessibility violation(s) (${critical.length} critical, ${serious.length} serious)`
          : undefined,
      details: {
        totalViolations: violations.length,
        critical: critical.length,
        serious: serious.length,
        moderate: moderate.length,
        passes: (axeResults.passes || []).length,
        incomplete: (axeResults.incomplete || []).length,
        violations,
      },
      duration_ms: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      status: TEST_RESULT_STATUS.WARNING,
      error_message: 'Accessibility test could not complete: ' + (error.message || 'Unknown error'),
      details: { error: error.message },
      duration_ms: Date.now() - startTime,
    };
  }
}
