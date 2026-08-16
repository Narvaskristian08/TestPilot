import db from '../config/database';
import { TEST_RESULT_STATUS, TEST_TYPES } from '../config/constants';

export interface TestResult {
  id?: number;
  run_id: number;
  test_name: string;
  test_type: keyof typeof TEST_TYPES;
  status: keyof typeof TEST_RESULT_STATUS;
  error_message?: string | null;
  error_category?: string | null;
  expected_behavior?: string | null;
  actual_behavior?: string | null;
  url?: string | null;
  details?: string | null; // JSON string
  duration_ms?: number | null;
  created_at?: string;
}

export class TestResultModel {
  static create(result: Omit<TestResult, 'id' | 'created_at'>): TestResult {
    const stmt = db.prepare(`
      INSERT INTO test_results (
        run_id, test_name, test_type, status, error_message, error_category,
        expected_behavior, actual_behavior, url, details, duration_ms
      )
      VALUES (
        @run_id, @test_name, @test_type, @status, @error_message, @error_category,
        @expected_behavior, @actual_behavior, @url, @details, @duration_ms
      )
    `);

    const info = stmt.run({
      run_id: result.run_id,
      test_name: result.test_name,
      test_type: result.test_type,
      status: result.status,
      error_message: result.error_message || null,
      error_category: result.error_category || null,
      expected_behavior: result.expected_behavior || null,
      actual_behavior: result.actual_behavior || null,
      url: result.url || null,
      details: result.details || null,
      duration_ms: result.duration_ms || null,
    });

    return this.findById(info.lastInsertRowid as number)!;
  }

  static findById(id: number): TestResult | undefined {
    const stmt = db.prepare('SELECT * FROM test_results WHERE id = ?');
    return stmt.get(id) as TestResult | undefined;
  }

  static findByRunId(runId: number): TestResult[] {
    const stmt = db.prepare('SELECT * FROM test_results WHERE run_id = ? ORDER BY created_at ASC');
    return stmt.all(runId) as TestResult[];
  }

  static createMany(results: Omit<TestResult, 'id' | 'created_at'>[]): void {
    const stmt = db.prepare(`
      INSERT INTO test_results (
        run_id, test_name, test_type, status, error_message, error_category,
        expected_behavior, actual_behavior, url, details, duration_ms
      )
      VALUES (
        @run_id, @test_name, @test_type, @status, @error_message, @error_category,
        @expected_behavior, @actual_behavior, @url, @details, @duration_ms
      )
    `);

    const insertMany = db.transaction((results: Omit<TestResult, 'id' | 'created_at'>[]) => {
      for (const result of results) {
        stmt.run({
          run_id: result.run_id,
          test_name: result.test_name,
          test_type: result.test_type,
          status: result.status,
          error_message: result.error_message || null,
          error_category: result.error_category || null,
          expected_behavior: result.expected_behavior || null,
          actual_behavior: result.actual_behavior || null,
          url: result.url || null,
          details: result.details || null,
          duration_ms: result.duration_ms || null,
        });
      }
    });

    insertMany(results);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM test_results WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static deleteByRunId(runId: number): boolean {
    const stmt = db.prepare('DELETE FROM test_results WHERE run_id = ?');
    const result = stmt.run(runId);
    return result.changes > 0;
  }
}
