import { EventEmitter } from 'events';
import { CONFIG, TEST_STATUS } from '../config/constants';

export interface TestJob {
  id: string;
  runId: number;
  url: string;
  browser: 'chromium' | 'firefox' | 'webkit';
  createdAt: Date;
}

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

interface QueuedJob {
  job: TestJob;
  status: JobStatus;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * In-process Job Queue
 *
 * Maintains a FIFO queue of test jobs and enforces concurrency limits.
 * Designed to be replaced by BullMQ/Redis later without changing the API.
 *
 * Events emitted:
 *   'job:queued'    (job: TestJob)
 *   'job:started'   (job: TestJob)
 *   'job:completed' (job: TestJob)
 *   'job:failed'    (job: TestJob, error: string)
 */
export class JobQueue extends EventEmitter {
  private queue: QueuedJob[] = [];
  private runningCount = 0;
  private readonly maxConcurrent: number;
  private processFn: ((job: TestJob) => Promise<void>) | null = null;

  constructor(maxConcurrent: number = CONFIG.MAX_CONCURRENT_TESTS) {
    super();
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Register the function that will process each job.
   * Must be set before calling enqueue().
   */
  setProcessor(fn: (job: TestJob) => Promise<void>): void {
    this.processFn = fn;
  }

  /**
   * Add a new job to the queue.
   */
  enqueue(job: TestJob): void {
    this.queue.push({ job, status: 'queued' });
    this.emit('job:queued', job);
    console.log(`[JobQueue] Enqueued job ${job.id} for run ${job.runId} (queue size: ${this.queue.length})`);
    this.drain();
  }

  /**
   * Cancel a queued (not yet running) job.
   * Returns true if the job was found and removed.
   */
  cancel(runId: number): boolean {
    const index = this.queue.findIndex(
      (q) => q.job.runId === runId && q.status === 'queued'
    );
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get current queue statistics.
   */
  stats(): { queued: number; running: number; maxConcurrent: number } {
    const queued = this.queue.filter((q) => q.status === 'queued').length;
    return { queued, running: this.runningCount, maxConcurrent: this.maxConcurrent };
  }

  /**
   * Try to process pending jobs up to the concurrency limit.
   */
  private drain(): void {
    if (!this.processFn) {
      console.warn('[JobQueue] No processor registered. Call setProcessor() first.');
      return;
    }

    while (this.runningCount < this.maxConcurrent) {
      const next = this.queue.find((q) => q.status === 'queued');
      if (!next) break;

      // Mark as running immediately to prevent double-processing
      next.status = 'running';
      next.startedAt = new Date();
      this.runningCount++;

      this.emit('job:started', next.job);
      console.log(`[JobQueue] Starting job ${next.job.id} for run ${next.job.runId} (running: ${this.runningCount})`);

      this.processFn(next.job)
        .then(() => {
          next.status = 'completed';
          next.completedAt = new Date();
          this.emit('job:completed', next.job);
          console.log(`[JobQueue] Completed job ${next.job.id}`);
        })
        .catch((err: Error) => {
          next.status = 'failed';
          next.completedAt = new Date();
          next.error = err.message;
          this.emit('job:failed', next.job, err.message);
          console.error(`[JobQueue] Failed job ${next.job.id}:`, err.message);
        })
        .finally(() => {
          this.runningCount--;
          // Attempt to process next queued job
          this.drain();
        });
    }
  }
}

// Singleton instance shared across the app
export const jobQueue = new JobQueue();
