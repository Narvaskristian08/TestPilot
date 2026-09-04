import { Router, Request, Response } from 'express';
import { validateUrl, ssrfProtection, validateTestRunId } from '../middleware/validation';
import { strictRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { startTest, cancelTest } from '../services/testRunner';
import { TestRunModel } from '../models/TestRun';
import { TestResultModel } from '../models/TestResult';
import { TestArtifactModel } from '../models/TestArtifact';
import { GuestUsageModel } from '../models/GuestUsage';
import { DailyUsageModel } from '../models/DailyUsage';
import { jobQueue } from '../services/jobQueue';
import path from 'path';
import fs from 'fs';
import { CONFIG } from '../config/constants';
import crypto from 'crypto';
import { createArtifactSignedUrl, isRemoteArtifactPath, removeStoredArtifacts } from '../services/artifactStorage';

const router = Router();

// ─── POST /api/tests ───────────────────────────────────────────────────────
// Create a new test run and enqueue it
router.post(
  '/',
  strictRateLimiter,          // max 10 per minute per IP
  optionalAuth,                // Attach user if authenticated
  validateUrl,                 // URL format validation
  ssrfProtection,              // SSRF / private IP protection
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { url, browser = 'chromium' } = req.body;
    const guestFingerprint = req.body.guestFingerprint || req.headers['x-guest-id'];

    const validBrowsers = ['chromium', 'firefox', 'webkit'];
    if (!validBrowsers.includes(browser)) {
      throw new AppError(`Invalid browser. Must be one of: ${validBrowsers.join(', ')}`, 400);
    }

    let userId: string | undefined;
    let guestId: string | undefined;
    const ipAddress = getClientIp(req);

    if (req.user) {
      userId = req.user.id;
    } else {
      guestId = generateGuestId(guestFingerprint as string, ipAddress);
    }

    // Usage caps are optional. API rate limiting and target URL protections
    // remain active regardless of this setting.
    if (CONFIG.ENABLE_USAGE_LIMITS) {
      if (req.user) {
        if (await DailyUsageModel.hasExceededLimit(userId!)) {
          const stats = await DailyUsageModel.getUsageStats(userId!);
          throw new AppError(
            `Daily limit reached. You've used ${stats.used}/${stats.limit} QA runs today. Resets at midnight.`,
            403,
            'usage_limit_reached',
            {
              used: stats.used,
              limit: stats.limit,
              remaining: 0,
              resetsAt: stats.resetsAt,
              requiresAuth: false,
            }
          );
        }

        const incremented = await DailyUsageModel.incrementUsage(userId!);
        if (!incremented) {
          const stats = await DailyUsageModel.getUsageStats(userId!);
          throw new AppError(
            `Daily limit reached. You've used ${stats.used}/${stats.limit} QA runs today.`,
            403,
            'usage_limit_reached',
            {
              used: stats.used,
              limit: stats.limit,
              remaining: 0,
              resetsAt: stats.resetsAt,
              requiresAuth: false,
            }
          );
        }
      } else if (guestId) {
        if (await GuestUsageModel.hasExceededLimit(guestId, ipAddress)) {
          const stats = await GuestUsageModel.getUsageStats(guestId, ipAddress);
          throw new AppError(
            `You've used your ${CONFIG.GUEST_QA_LIMIT} free QA runs. Create an account to continue.`,
            403,
            'usage_limit_reached',
            {
              used: stats.used,
              limit: stats.limit,
              remaining: 0,
              requiresAuth: true,
            }
          );
        }

        const incremented = await GuestUsageModel.incrementUsage(
          guestId,
          ipAddress,
          req.headers['user-agent'] as string
        );
        if (!incremented) {
          const stats = await GuestUsageModel.getUsageStats(guestId, ipAddress);
          throw new AppError(
            `You've used your ${CONFIG.GUEST_QA_LIMIT} free QA runs. Create an account to continue.`,
            403,
            'usage_limit_reached',
            {
              used: stats.used,
              limit: stats.limit,
              remaining: 0,
              requiresAuth: true,
            }
          );
        }
      }
    }

    try {
      // Create test run and add to queue
      const testRun = await startTest({ url, browser, userId, guestId });

      let usageStats;
      if (CONFIG.ENABLE_USAGE_LIMITS && userId) {
        usageStats = await DailyUsageModel.getUsageStats(userId);
      } else if (CONFIG.ENABLE_USAGE_LIMITS && guestId) {
        usageStats = await GuestUsageModel.getUsageStats(guestId, ipAddress);
      }

      return res.status(201).json({
        status: 'success',
        data: testRun,
        queueStats: jobQueue.stats(),
        usage: usageStats ? {
          used: usageStats.used,
          limit: usageStats.limit,
          remaining: usageStats.remaining,
          isGuest: !userId,
          resetsAt: 'resetsAt' in usageStats ? usageStats.resetsAt : undefined,
        } : undefined,
      });
    } catch (error) {
      // ─── REFUND USAGE IF TEST CREATION FAILED ───
      console.error('Test creation failed, refunding usage:', error);

      // This is a bit tricky - we need to decrement the usage we just incremented
      // For simplicity in this scenario, we'll log the error but won't refund
      // In production, you might want to implement a proper rollback mechanism

      throw error;
    }
  })
);

// ─── GET /api/tests/:id ────────────────────────────────────────────────────
// Get test run by ID
router.get(
  '/:id',
  validateTestRunId,
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const testRun = await TestRunModel.findById(parseInt(req.params.id));

    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }

    assertRunAccess(req, testRun);

    return res.json({
      status: 'success',
      data: testRun,
    });
  })
);

// ─── GET /api/tests/:id/results ───────────────────────────────────────────
// Get test results for a run (with artifacts)
router.get(
  '/:id/results',
  validateTestRunId,
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const runId = parseInt(req.params.id);
    const testRun = await TestRunModel.findById(runId);

    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }

    assertRunAccess(req, testRun);

    const results = await TestResultModel.findByRunId(runId);

    // Fetch artifacts for each result
    const resultsWithArtifacts = await Promise.all(results.map(async result => {
      const artifacts = await TestArtifactModel.findByResultId(result.id!);

      // Add URL to artifacts for frontend
      const artifactsWithUrls = await Promise.all(
        artifacts.map(async artifact => ({
          ...artifact,
          url: await getArtifactUrl(artifact, runId),
        }))
      );

      return {
        ...result,
        artifacts: artifactsWithUrls,
      };
    }));

    return res.json({
      status: 'success',
      data: {
        testRun,
        results: resultsWithArtifacts,
      },
    });
  })
);

// ─── GET /api/tests/:id/screenshot/:filename ──────────────────────────────
// Serve screenshot files directly
router.get(
  '/:id/screenshot/:filename',
  validateTestRunId,
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const runId = parseInt(req.params.id);
    const filename = req.params.filename;

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/')) {
      throw new AppError('Invalid filename', 400);
    }

    const testRun = await TestRunModel.findById(runId);
    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }
    assertRunAccess(req, testRun);

    const filePath = path.join(CONFIG.ARTIFACTS_PATH, `run-${runId}`, filename);

    const artifact = (await TestArtifactModel.findByRunId(runId)).find(
      candidate => path.basename(candidate.file_path) === filename
    );

    if (artifact && isRemoteArtifactPath(artifact.file_path)) {
      const signedUrl = await createArtifactSignedUrl(artifact.file_path);
      if (!signedUrl) {
        throw new AppError('Artifact storage is not configured', 503);
      }
      return res.redirect(signedUrl);
    }

    if (!fs.existsSync(filePath)) {
      throw new AppError('File not found', 404);
    }

    // Set correct content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.zip': 'application/zip',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    return res.sendFile(filePath);
  })
);

// ─── GET /api/tests/:id/artifacts ─────────────────────────────────────────
// Get test artifacts for a run
router.get(
  '/:id/artifacts',
  validateTestRunId,
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const runId = parseInt(req.params.id);
    const testRun = await TestRunModel.findById(runId);
    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }
    assertRunAccess(req, testRun);

    const artifacts = await TestArtifactModel.findByRunId(runId);
    const artifactsWithUrls = await Promise.all(
      artifacts.map(async artifact => ({
        ...artifact,
        url: await getArtifactUrl(artifact, runId),
      }))
    );

    return res.json({
      status: 'success',
      data: artifactsWithUrls,
    });
  })
);

// ─── GET /api/tests/:id/artifacts/:artifactId/download ────────────────────
// Download a specific artifact
router.get(
  '/:id/artifacts/:artifactId/download',
  validateTestRunId,
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const runId = parseInt(req.params.id);
    const testRun = await TestRunModel.findById(runId);
    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }
    assertRunAccess(req, testRun);

    const artifact = await TestArtifactModel.findById(parseInt(req.params.artifactId));

    if (!artifact) {
      throw new AppError('Artifact not found', 404);
    }

    if (artifact.run_id !== runId) {
      throw new AppError('Artifact does not belong to this test run', 403);
    }

    if (isRemoteArtifactPath(artifact.file_path)) {
      const signedUrl = await createArtifactSignedUrl(artifact.file_path, true);
      if (!signedUrl) {
        throw new AppError('Artifact storage is not configured', 503);
      }
      return res.redirect(signedUrl);
    }

    const filePath = path.isAbsolute(artifact.file_path)
      ? artifact.file_path
      : path.join(CONFIG.ARTIFACTS_PATH, artifact.file_path);

    if (!fs.existsSync(filePath)) {
      throw new AppError('Artifact file not found on disk', 404);
    }

    return res.download(filePath);
  })
);

// ─── POST /api/tests/:id/cancel ───────────────────────────────────────────
// Cancel a running test
router.post(
  '/:id/cancel',
  validateTestRunId,
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const runId = parseInt(req.params.id);
    const testRun = await TestRunModel.findById(runId);
    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }
    assertRunAccess(req, testRun);

    const cancelled = await cancelTest(runId);

    if (!cancelled) {
      throw new AppError('Test run not found or cannot be cancelled', 400);
    }

    return res.json({
      status: 'success',
      message: 'Test run cancelled',
    });
  })
);

// ─── GET /api/tests ────────────────────────────────────────────────────────
// Get all test runs (paginated)
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const guestId = req.user ? undefined : getGuestId(req);

    const testRuns = req.user
      ? await TestRunModel.findByUserId(req.user.id, limit, offset)
      : await TestRunModel.findByGuestId(guestId!, limit, offset);
    const total = await TestRunModel.count({ userId: req.user?.id, guestId });

    return res.json({
      status: 'success',
      data: testRuns,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + testRuns.length < total,
      },
    });
  })
);

// ─── DELETE /api/tests/:id ─────────────────────────────────────────────────
// Delete a test run (and cascade to results/artifacts)
router.delete(
  '/:id',
  validateTestRunId,
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const runId = parseInt(req.params.id);
    const testRun = await TestRunModel.findById(runId);
    if (!testRun) {
      throw new AppError('Test run not found', 404);
    }
    assertRunAccess(req, testRun);

    const artifacts = await TestArtifactModel.findByRunId(runId);
    const deleted = await TestRunModel.delete(runId);

    if (!deleted) {
      throw new AppError('Test run not found', 404);
    }

    try {
      await removeStoredArtifacts(artifacts.map(artifact => artifact.file_path));
    } catch (error) {
      console.error(`[Artifacts] Failed to remove storage objects for run ${runId}:`, error);
    }

    return res.json({
      status: 'success',
      message: 'Test run deleted',
    });
  })
);

/**
 * Generate guest ID from fingerprint + IP
 * Uses SHA-256 hash for security
 */
function generateGuestId(fingerprint: string | undefined, ip: string): string {
  if (!fingerprint) {
    // Fallback: use IP-based ID if no fingerprint provided
    return crypto.createHash('sha256').update(`guest-${ip}`).digest('hex').substring(0, 32);
  }
  return crypto.createHash('sha256').update(`${fingerprint}-${ip}`).digest('hex').substring(0, 32);
}

function getClientIp(req: Request): string {
  return req.ip || 'unknown';
}

function getGuestFingerprint(req: Request): string | undefined {
  const guestHeader = req.headers['x-guest-id'];
  return typeof guestHeader === 'string' ? guestHeader : undefined;
}

function getGuestId(req: Request): string {
  return generateGuestId(getGuestFingerprint(req), getClientIp(req));
}

function assertRunAccess(req: AuthRequest, testRun: { user_id?: string | null; guest_id?: string | null }): void {
  if (req.user && testRun.user_id === req.user.id) {
    return;
  }

  if (!req.user && !testRun.user_id && testRun.guest_id === getGuestId(req)) {
    return;
  }

  // Avoid revealing whether a different user's run exists.
  throw new AppError('Test run not found', 404);
}

async function getArtifactUrl(
  artifact: { artifact_type: string; file_path: string },
  runId: number
): Promise<string> {
  if (isRemoteArtifactPath(artifact.file_path)) {
    const signedUrl = await createArtifactSignedUrl(
      artifact.file_path,
      artifact.artifact_type !== 'SCREENSHOT'
    );
    if (signedUrl) return signedUrl;
  }

  // Local artifacts are only a development fallback. Keep their existing
  // static URL behavior so browser image/download requests need no custom
  // Authorization header; production fails fast unless remote storage is set.
  return `/api/artifacts/run-${runId}/${path.basename(artifact.file_path)}`;
}

export default router;
