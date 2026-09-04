import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';
import { TEST_TYPES, TEST_RESULT_STATUS, CONFIG, ERROR_CATEGORY } from '../config/constants';
import { TestResultModel } from '../models/TestResult';
import { TestRunModel } from '../models/TestRun';
import { TestArtifactModel } from '../models/TestArtifact';
import { runAvailabilityTest, runPageLoadTest } from './tests/availabilityTest';
import { runLinkTest } from './tests/linkTest';
import { runButtonTest } from './tests/buttonTest';
import { runFormTest } from './tests/formTest';
import { runResponsiveTest } from './tests/responsiveTest';
import { createConsoleCollector, buildConsoleTestResult } from './tests/consoleTest';
import { runAccessibilityTest } from './tests/accessibilityTest';
import { runSecurityTest } from './tests/securityTest';
import path from 'path';
import fs from 'fs';
import { cleanupLocalArtifact, persistArtifact } from '../services/artifactStorage';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export interface TestExecutionResult {
  testName: string;
  testType: keyof typeof TEST_TYPES;
  status: keyof typeof TEST_RESULT_STATUS;
  error_message?: string;
  error_category?: keyof typeof ERROR_CATEGORY;
  expected_behavior?: string;
  actual_behavior?: string;
  url?: string;
  details: any;
  duration_ms: number;
  screenshot?: string;
  trace?: string;
  console_errors?: string[];
  network_errors?: string[];
}

export type ProgressCallback = (event: {
  runId: number;
  testName: string;
  testType: string;
  status: string;
  progress: number; // 0–100
}) => void;

/**
 * Main Playwright Worker
 * Executes automated tests against a target website.
 */
export class PlaywrightWorker {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private browserType: BrowserType;
  private onProgress: ProgressCallback | null;

  constructor(
    browserType: BrowserType = 'chromium',
    onProgress: ProgressCallback | null = null
  ) {
    this.browserType = browserType;
    this.onProgress = onProgress;
  }

  async initialize(): Promise<void> {
    const launchOptions = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };

    if (this.browserType === 'firefox') {
      this.browser = await firefox.launch(launchOptions);
    } else if (this.browserType === 'webkit') {
      this.browser = await webkit.launch(launchOptions);
    } else {
      this.browser = await chromium.launch(launchOptions);
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) await this.page.close().catch(() => {});
      if (this.context) await this.context.close().catch(() => {});
      if (this.browser) await this.browser.close().catch(() => {});
    } catch {
      // Ignore cleanup errors
    }
  }

  private emitProgress(
    runId: number,
    testName: string,
    testType: string,
    status: string,
    progress: number
  ): void {
    if (this.onProgress) {
      this.onProgress({ runId, testName, testType, status, progress });
    }
  }

  /**
   * Execute all tests for a given URL
   */
  async executeTests(runId: number, url: string): Promise<void> {
    const results: TestExecutionResult[] = [];
    const startTime = Date.now();

    // Total test steps for progress calculation
    const totalSteps = 10;
    let step = 0;

    try {
      await this.initialize();

      // Create browser context with trace recording enabled
      this.context = await this.browser!.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'TestPilot/1.0 (Automated QA Testing; +https://testpilot.io)',
        ignoreHTTPSErrors: true,
      });

      // Start tracing for failure evidence
      const traceDir = path.join(CONFIG.ARTIFACTS_PATH, `run-${runId}`);
      if (!fs.existsSync(traceDir)) {
        fs.mkdirSync(traceDir, { recursive: true });
      }

      await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: false, // Don't include source code to keep trace size reasonable
      });

      this.page = await this.context.newPage();

      // Set up console + network error collectors BEFORE navigation
      const consoleCollector = createConsoleCollector(this.page);
      const networkErrors: string[] = [];

      this.page.on('response', (response) => {
        if (response.status() >= 400) {
          networkErrors.push(`${response.status()} ${response.url()}`);
        }
      });

      // ── Test 1: Website Availability ─────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Website Availability', TEST_TYPES.AVAILABILITY, 'running', Math.round((step / totalSteps) * 100));

      const availabilityResult = await runAvailabilityTest(this.page, url);
      results.push({
        testName: 'Website Availability',
        testType: TEST_TYPES.AVAILABILITY,
        ...availabilityResult,
      });

      this.emitProgress(runId, 'Website Availability', TEST_TYPES.AVAILABILITY, availabilityResult.status, Math.round((step / totalSteps) * 100));

      // If unavailable, stop early — no point running further tests
      if (availabilityResult.status === TEST_RESULT_STATUS.FAILED) {
        await this.saveResults(runId, results, Date.now() - startTime);
        return;
      }

      // ── Test 2: Page Load ────────────────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Page Load', TEST_TYPES.PAGE_LOAD, 'running', Math.round((step / totalSteps) * 100));

      const pageLoadResult = await runPageLoadTest(this.page);
      results.push({
        testName: 'Page Load',
        testType: TEST_TYPES.PAGE_LOAD,
        ...pageLoadResult,
      });

      this.emitProgress(runId, 'Page Load', TEST_TYPES.PAGE_LOAD, pageLoadResult.status, Math.round((step / totalSteps) * 100));

      // ── Test 3: Link Testing ─────────────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Link Testing', TEST_TYPES.LINK_TEST, 'running', Math.round((step / totalSteps) * 100));

      const linkResult = await runLinkTest(this.page, url, 15);
      results.push({
        testName: 'Link Testing',
        testType: TEST_TYPES.LINK_TEST,
        ...linkResult,
      });

      this.emitProgress(runId, 'Link Testing', TEST_TYPES.LINK_TEST, linkResult.status, Math.round((step / totalSteps) * 100));

      // ── Test 4: Button Discovery ─────────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Button Discovery', TEST_TYPES.BUTTON_TEST, 'running', Math.round((step / totalSteps) * 100));

      const buttonResult = await runButtonTest(this.page);
      results.push({
        testName: 'Button Discovery',
        testType: TEST_TYPES.BUTTON_TEST,
        ...buttonResult,
      });

      this.emitProgress(runId, 'Button Discovery', TEST_TYPES.BUTTON_TEST, buttonResult.status, Math.round((step / totalSteps) * 100));

      // ── Test 5: Form Validation ──────────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Form Validation', TEST_TYPES.FORM_TEST, 'running', Math.round((step / totalSteps) * 100));

      const formResult = await runFormTest(this.page);
      results.push({
        testName: 'Form Validation',
        testType: TEST_TYPES.FORM_TEST,
        ...formResult,
      });

      this.emitProgress(runId, 'Form Validation', TEST_TYPES.FORM_TEST, formResult.status, Math.round((step / totalSteps) * 100));

      // ── Test 6: Responsive Design ────────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Responsive Design', TEST_TYPES.RESPONSIVE, 'running', Math.round((step / totalSteps) * 100));

      const responsiveResult = await runResponsiveTest(this.context, url);
      results.push({
        testName: 'Responsive Design',
        testType: TEST_TYPES.RESPONSIVE,
        ...responsiveResult,
      });

      this.emitProgress(runId, 'Responsive Design', TEST_TYPES.RESPONSIVE, responsiveResult.status, Math.round((step / totalSteps) * 100));

      // ── Test 7: Console Errors ───────────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Console Errors', TEST_TYPES.CONSOLE_ERRORS, 'running', Math.round((step / totalSteps) * 100));

      const consoleResult = buildConsoleTestResult(consoleCollector, 0, this.page.url());
      results.push({
        testName: 'Console Errors',
        testType: TEST_TYPES.CONSOLE_ERRORS,
        ...consoleResult,
      });

      this.emitProgress(runId, 'Console Errors', TEST_TYPES.CONSOLE_ERRORS, consoleResult.status, Math.round((step / totalSteps) * 100));

      // ── Test 8: Network Errors ───────────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Network Errors', TEST_TYPES.NETWORK_ERRORS, 'running', Math.round((step / totalSteps) * 100));

      const networkStatus =
        networkErrors.length === 0
          ? TEST_RESULT_STATUS.PASSED
          : networkErrors.length <= 3
          ? TEST_RESULT_STATUS.WARNING
          : TEST_RESULT_STATUS.FAILED;

      const firstNetworkError = networkErrors[0];

      results.push({
        testName: 'Network Errors',
        testType: TEST_TYPES.NETWORK_ERRORS,
        status: networkStatus,
        error_message:
          networkErrors.length > 0
            ? `Found ${networkErrors.length} failed HTTP request(s)`
            : undefined,
        error_category: networkErrors.length > 0 ? ERROR_CATEGORY.NETWORK_ERROR : undefined,
        expected_behavior: networkErrors.length > 0 ? 'All HTTP requests should return 2xx or 3xx status codes' : undefined,
        actual_behavior: networkErrors.length > 0 ? `${networkErrors.length} requests failed: ${firstNetworkError}` : undefined,
        url: this.page.url(),
        details: {
          errorCount: networkErrors.length,
          errors: networkErrors.slice(0, 20),
        },
        duration_ms: 0,
      });

      this.emitProgress(runId, 'Network Errors', TEST_TYPES.NETWORK_ERRORS, networkStatus, Math.round((step / totalSteps) * 100));

      // ── Test 9: Accessibility ────────────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Accessibility', TEST_TYPES.ACCESSIBILITY, 'running', Math.round((step / totalSteps) * 100));

      const a11yResult = await runAccessibilityTest(this.page);
      results.push({
        testName: 'Accessibility',
        testType: TEST_TYPES.ACCESSIBILITY,
        ...a11yResult,
      });

      this.emitProgress(runId, 'Accessibility', TEST_TYPES.ACCESSIBILITY, a11yResult.status, Math.round((step / totalSteps) * 100));

      // ── Test 10: Security Check ──────────────────────────────────────────
      step++;
      this.emitProgress(runId, 'Security Check', TEST_TYPES.SECURITY, 'running', Math.round((step / totalSteps) * 100));

      const securityResult = await runSecurityTest(this.page, url);
      results.push({
        ...securityResult,
        testName: 'Security Check',
        testType: TEST_TYPES.SECURITY,
      });

      this.emitProgress(runId, 'Security Check', TEST_TYPES.SECURITY, securityResult.status, 100);

      // ── Save Trace (if any failures/warnings) ────────────────────────────
      const hasFailuresOrWarnings = results.some(
        r => r.status === TEST_RESULT_STATUS.FAILED || r.status === TEST_RESULT_STATUS.WARNING
      );

      let tracePath: string | undefined;
      if (hasFailuresOrWarnings && this.context) {
        try {
          const traceFile = path.join(CONFIG.ARTIFACTS_PATH, `run-${runId}`, `trace-${Date.now()}.zip`);
          await this.context.tracing.stop({ path: traceFile });
          tracePath = traceFile;
          console.log(`[PlaywrightWorker] Trace saved: ${traceFile}`);
        } catch (error) {
          console.error('[PlaywrightWorker] Failed to save trace:', error);
        }
      } else if (this.context) {
        // Stop tracing without saving
        await this.context.tracing.stop().catch(() => {});
      }

      // Save everything to DB
      await this.saveResults(runId, results, Date.now() - startTime, tracePath);
    } catch (error: any) {
      console.error('[PlaywrightWorker] Test execution error:', error);

      results.push({
        testName: 'Test Execution',
        testType: TEST_TYPES.AVAILABILITY,
        status: TEST_RESULT_STATUS.FAILED,
        error_message: error.message || 'Unknown error during test execution',
        details: { error: error.message },
        duration_ms: Date.now() - startTime,
      });

      await this.saveResults(runId, results, Date.now() - startTime);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Capture a screenshot for a specific test
   */
  private async captureTestScreenshot(runId: number, testName: string): Promise<string | undefined> {
    if (!this.page) return undefined;

    try {
      const screenshotDir = path.join(CONFIG.ARTIFACTS_PATH, `run-${runId}`);

      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const sanitizedTestName = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const filename = `screenshot-${sanitizedTestName}-${Date.now()}.png`;
      const filepath = path.join(screenshotDir, filename);

      await this.page.screenshot({ path: filepath, fullPage: true });

      return filepath;
    } catch (error) {
      console.error(`[PlaywrightWorker] Screenshot capture failed for ${testName}:`, error);
      return undefined;
    }
  }

  /**
   * Persist all test results to the database and update run stats
   */
  private async saveResults(
    runId: number,
    results: TestExecutionResult[],
    totalDuration: number,
    tracePath?: string
  ): Promise<void> {
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    for (const result of results) {
      if (result.status === TEST_RESULT_STATUS.PASSED) passed++;
      else if (result.status === TEST_RESULT_STATUS.FAILED) failed++;
      else if (result.status === TEST_RESULT_STATUS.WARNING) warnings++;

      // Capture screenshot for failed and warning tests
      let screenshotPath: string | undefined;
      if (result.status === TEST_RESULT_STATUS.FAILED || result.status === TEST_RESULT_STATUS.WARNING) {
        screenshotPath = await this.captureTestScreenshot(runId, result.testName);
      }

      const savedResult = await TestResultModel.create({
        run_id: runId,
        test_name: result.testName,
        test_type: result.testType,
        status: result.status,
        error_message: result.error_message,
        error_category: result.error_category,
        expected_behavior: result.expected_behavior,
        actual_behavior: result.actual_behavior,
        url: result.url,
        details: JSON.stringify(result.details),
        duration_ms: result.duration_ms,
      });

      // Attach screenshot artifact if available
      if (screenshotPath && savedResult.id) {
        try {
          const stats = fs.statSync(screenshotPath);
          const storedPath = await persistArtifact(screenshotPath, runId, 'image/png');
          await TestArtifactModel.create({
            result_id: savedResult.id,
            run_id: runId,
            artifact_type: 'SCREENSHOT',
            file_path: storedPath,
            file_size: stats.size,
            mime_type: 'image/png',
          });
        } catch (error) {
          console.error(`[PlaywrightWorker] Failed to persist screenshot for ${result.testName}:`, error);
        } finally {
          await cleanupLocalArtifact(screenshotPath);
        }
      }

      // Attach trace artifact to first failed test (trace covers all tests)
      if (tracePath && savedResult.id && result.status === TEST_RESULT_STATUS.FAILED && failed === 1) {
        try {
          const stats = fs.statSync(tracePath);
          const storedPath = await persistArtifact(tracePath, runId, 'application/zip');
          await TestArtifactModel.create({
            result_id: savedResult.id,
            run_id: runId,
            artifact_type: 'TRACE',
            file_path: storedPath,
            file_size: stats.size,
            mime_type: 'application/zip',
          });
        } catch (error) {
          console.error(`[PlaywrightWorker] Failed to persist trace for run ${runId}:`, error);
        }
      }
    }

    if (tracePath) {
      await cleanupLocalArtifact(tracePath);
    }

    // updateStats method was removed, status is updated by the testRunner
  }
}
