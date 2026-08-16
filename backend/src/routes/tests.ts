import { Router, Request, Response } from 'express';
import { validateUrl, ssrfProtection, validateTestRunId } from '../middleware/validation';
import { strictRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { startTest, cancelTest } from '../services/testRunner';
import { TestRunModel } from '../models/TestRun';
import { TestResultModel } from '../models/TestResult';
import { TestArtifactModel } from '../models/TestArtifact';
import { jobQueue } from '../services/jobQueue';
import path from 'path';
import fs from 'fs';
import { CONFIG } from '../config/constants';

const router = Router();

// ─── POST /api/tests ───────────────────────────────────────────────────────
// Create a new test run and enqueue it
router.post(
  '/',
  strictRateLimiter,          // max 10 per minute per IP
  validateUrl,                 // URL format validation
  ssrfProtection,              // SSRF / private IP protection
  asyncHandler(async (req: Request, res: Response) => {
    const { url, browser = 'chromium' } = req.body;

    const validBrowsers = ['chromium', 'firefox', 'webkit'];
    if (!validBrowsers.includes(browser)) {
      throw new AppError(`Invalid browser. Must be one of: ${validBrowsers.join(', ')}`, 400);
    }

    const testRun = await startTest({ url, browser });

    return res.status(201).json({
      status: 'success',
      data: testRun,
      queueStats: jobQueue.stats(),
    });
  })
);

// ─── GET /api/tests ────────────────────────────────────────────────────────
// List recent test runs
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(parseInt(String(req.query.limit || '50')), 100);
    const runs = TestRunModel.findAll(limit);

    return res.json({
      status: 'success',
      data: runs,
      count: runs.length,
    });
  })
);

// ─── GET /api/tests/:id ────────────────────────────────────────────────────
// Get a single test run by ID
router.get(
  '/:id',
  validateTestRunId,
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const run = TestRunModel.findById(id);

    if (!run) {
      throw new AppError('Test run not found', 404);
    }

    return res.json({
      status: 'success',
      data: run,
    });
  })
);

// ─── GET /api/tests/:id/results ───────────────────────────────────────────
// Get all test results for a run
router.get(
  '/:id/results',
  validateTestRunId,
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const run = TestRunModel.findById(id);
    if (!run) {
      throw new AppError('Test run not found', 404);
    }

    const results = TestResultModel.findByRunId(id);

    // Parse JSON details for convenience
    const parsed = results.map((r) => ({
      ...r,
      details: (() => {
        try {
          return r.details ? JSON.parse(r.details as string) : null;
        } catch {
          return r.details;
        }
      })(),
    }));

    return res.json({
      status: 'success',
      data: {
        run,
        results: parsed,
        count: parsed.length,
      },
    });
  })
);

// ─── GET /api/tests/:id/artifacts ─────────────────────────────────────────
// List all artifacts (screenshots, traces) for a run
router.get(
  '/:id/artifacts',
  validateTestRunId,
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const run = TestRunModel.findById(id);
    if (!run) {
      throw new AppError('Test run not found', 404);
    }

    const artifacts = TestArtifactModel.findByRunId(id);

    // Build public URLs for each artifact
    const withUrls = artifacts.map((a) => {
      const relative = path.relative(CONFIG.ARTIFACTS_PATH, a.file_path);
      return {
        ...a,
        url: `/api/artifacts/${relative}`,
      };
    });

    return res.json({
      status: 'success',
      data: withUrls,
      count: withUrls.length,
    });
  })
);

// ─── POST /api/tests/:id/cancel ───────────────────────────────────────────
// Cancel a queued test run (cannot cancel running ones)
router.post(
  '/:id/cancel',
  validateTestRunId,
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const run = TestRunModel.findById(id);
    if (!run) {
      throw new AppError('Test run not found', 404);
    }

    if (run.status === 'RUNNING') {
      throw new AppError('Cannot cancel a running test. Wait for it to complete.', 409);
    }

    if (run.status !== 'QUEUED') {
      throw new AppError(`Test run is already ${run.status.toLowerCase()}`, 409);
    }

    const cancelled = cancelTest(id);

    return res.json({
      status: 'success',
      cancelled,
      message: cancelled
        ? 'Test run cancelled'
        : 'Test run could not be cancelled (may have already started)',
    });
  })
);

// ─── DELETE /api/tests/:id ────────────────────────────────────────────────
// Delete a test run and all its results/artifacts
router.delete(
  '/:id',
  validateTestRunId,
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const run = TestRunModel.findById(id);
    if (!run) {
      throw new AppError('Test run not found', 404);
    }

    if (run.status === 'RUNNING') {
      throw new AppError('Cannot delete a running test run', 409);
    }

    // Clean up artifact files from disk
    const artifactDir = path.join(CONFIG.ARTIFACTS_PATH, `run-${id}`);
    if (fs.existsSync(artifactDir)) {
      fs.rmSync(artifactDir, { recursive: true, force: true });
    }

    TestRunModel.delete(id);

    return res.json({
      status: 'success',
      message: 'Test run deleted',
    });
  })
);

export default router;
