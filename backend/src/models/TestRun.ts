import db from '../config/database';
import { TEST_STATUS } from '../config/constants';

export interface TestRun {
  id?: number;
  project_id?: number | null;
  url: string;
  status: keyof typeof TEST_STATUS;
  started_at?: string | null;
  completed_at?: string | null;
  duration_ms?: number | null;
  total_tests?: number;
  passed_tests?: number;
  failed_tests?: number;
  warning_tests?: number;
  created_at?: string;
}

export class TestRunModel {
  static create(testRun: Omit<TestRun, 'id' | 'created_at'>): TestRun {
    const stmt = db.prepare(`
      INSERT INTO test_runs (project_id, url, status, started_at, completed_at, duration_ms, total_tests, passed_tests, failed_tests, warning_tests)
      VALUES (@project_id, @url, @status, @started_at, @completed_at, @duration_ms, @total_tests, @passed_tests, @failed_tests, @warning_tests)
    `);

    const info = stmt.run({
      project_id: testRun.project_id || null,
      url: testRun.url,
      status: testRun.status || TEST_STATUS.QUEUED,
      started_at: testRun.started_at || null,
      completed_at: testRun.completed_at || null,
      duration_ms: testRun.duration_ms || null,
      total_tests: testRun.total_tests || 0,
      passed_tests: testRun.passed_tests || 0,
      failed_tests: testRun.failed_tests || 0,
      warning_tests: testRun.warning_tests || 0,
    });

    return this.findById(info.lastInsertRowid as number)!;
  }

  static findById(id: number): TestRun | undefined {
    const stmt = db.prepare('SELECT * FROM test_runs WHERE id = ?');
    return stmt.get(id) as TestRun | undefined;
  }

  static findAll(limit: number = 50): TestRun[] {
    const stmt = db.prepare('SELECT * FROM test_runs ORDER BY created_at DESC LIMIT ?');
    return stmt.all(limit) as TestRun[];
  }

  static update(id: number, updates: Partial<TestRun>): boolean {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = @${key}`)
      .join(', ');

    if (!fields) return false;

    const stmt = db.prepare(`UPDATE test_runs SET ${fields} WHERE id = @id`);
    const result = stmt.run({ ...updates, id });

    return result.changes > 0;
  }

  static updateStatus(id: number, status: keyof typeof TEST_STATUS): boolean {
    const updates: Partial<TestRun> = { status };

    if (status === TEST_STATUS.RUNNING) {
      updates.started_at = new Date().toISOString();
    } else if (status === TEST_STATUS.COMPLETED || status === TEST_STATUS.FAILED) {
      updates.completed_at = new Date().toISOString();
    }

    return this.update(id, updates);
  }

  static updateStats(id: number, stats: {
    total_tests: number;
    passed_tests: number;
    failed_tests: number;
    warning_tests: number;
    duration_ms?: number;
  }): boolean {
    return this.update(id, stats);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM test_runs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
