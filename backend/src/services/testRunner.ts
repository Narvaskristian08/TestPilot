import { v4 as uuidv4 } from 'uuid';
import { jobQueue, TestJob } from './jobQueue';
import { PlaywrightWorker, BrowserType } from '../workers/playwrightWorker';
import { TestRunModel } from '../models/TestRun';
import { TEST_STATUS } from '../config/constants';
import { io } from '../server';

/**
 * Test Runner Service
 *
 * Orchestrates the full lifecycle of a test run:
 *   1. Creates a DB record (QUEUED)
 *   2. Enqueues a job
 *   3. When dequeued: marks RUNNING → launches PlaywrightWorker → marks COMPLETED/FAILED
 *   4. Emits Socket.IO events for real-time frontend updates
 */

export interface StartTestOptions {
  url: string;
  browser?: BrowserType;
  userId?: string;
  guestId?: string;
}

/**
 * Kick off a new test run.
 * Returns the newly created TestRun record.
 */
export async function startTest(options: StartTestOptions) {
  const { url, browser = 'chromium', userId, guestId } = options;

  // 1. Create a DB record in QUEUED state
  const testRun = await TestRunModel.create({
    url,
    browser,
    status: TEST_STATUS.QUEUED,
    user_id: userId,
    guest_id: guestId,
  });

  const runId = testRun.id!;

  // 2. Emit socket event: queued
  emitRunUpdate(runId, TEST_STATUS.QUEUED, testRun);

  // 3. Build the job
  const job: TestJob = {
    id: uuidv4(),
    runId,
    url,
    browser,
    createdAt: new Date(),
  };

  // 4. Enqueue (returns immediately; job is processed asynchronously)
  jobQueue.enqueue(job);

  return testRun;
}

/**
 * Cancel a queued test run (cannot cancel a running one).
 */
export async function cancelTest(runId: number): Promise<boolean> {
  const cancelled = jobQueue.cancel(runId);
  if (cancelled) {
    await TestRunModel.updateStatus(runId, TEST_STATUS.CANCELLED);
    emitRunUpdate(runId, TEST_STATUS.CANCELLED);
  }
  return cancelled;
}

/**
 * Boot the test runner — registers the job processor with the queue.
 * Must be called once at server startup.
 */
export function initTestRunner(): void {
  jobQueue.setProcessor(async (job: TestJob) => {
    const { runId, url, browser } = job;

    // Mark as RUNNING
    await TestRunModel.updateStatus(runId, TEST_STATUS.RUNNING);
    emitRunUpdate(runId, TEST_STATUS.RUNNING);

    const worker = new PlaywrightWorker(browser, (event) => {
      // Forward per-test progress to the frontend via Socket.IO
      try {
        io.to(`test-${runId}`).emit('test:progress', event);
      } catch {
        // Socket.IO may not be ready; ignore
      }
    });

    try {
      await worker.executeTests(runId, url);

      // Mark as COMPLETED
      await TestRunModel.updateStatus(runId, TEST_STATUS.COMPLETED);

      const updated = await TestRunModel.findById(runId);
      emitRunUpdate(runId, TEST_STATUS.COMPLETED, updated);
    } catch (error: any) {
      console.error('[TestRunner] Worker threw an unhandled error:', error);
      await TestRunModel.updateStatus(runId, TEST_STATUS.FAILED);
      emitRunUpdate(runId, TEST_STATUS.FAILED);
      throw error; // Let the queue mark the job as failed
    }
  });

  console.log('[TestRunner] Initialised and ready to process jobs.');
}

/**
 * Emit a run-level status update to all subscribed Socket.IO clients.
 */
function emitRunUpdate(runId: number, status: string, data?: any): void {
  try {
    io.to(`test-${runId}`).emit('test:update', {
      runId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Safe to ignore if socket isn't initialised yet
  }
}
