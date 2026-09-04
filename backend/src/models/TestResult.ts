import { db } from '../config/database';
import { TEST_RESULT_STATUS, TEST_TYPES } from '../config/constants';

export interface TestResult {
  id: number;
  run_id: number;
  test_name: string;
  test_type: keyof typeof TEST_TYPES;
  status: keyof typeof TEST_RESULT_STATUS;
  error_message?: string | null;
  error_category?: string | null;
  expected_behavior?: string | null;
  actual_behavior?: string | null;
  url?: string | null;
  details?: any | null;
  duration_ms?: number | null;
  created_at?: string;
}

export class TestResultModel {
  static async create(result: Omit<TestResult, 'id' | 'created_at'>): Promise<TestResult> {
    return await db.createTestResult({
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

  static async findById(id: number): Promise<TestResult | null> {
    const { data, error } = await db.supabaseDb
      .from('test_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as TestResult;
  }

  static async findByRunId(runId: number): Promise<TestResult[]> {
    return await db.getTestResults(runId);
  }

  static async createMany(results: Omit<TestResult, 'id' | 'created_at'>[]): Promise<void> {
    const { error } = await db.supabaseDb
      .from('test_results')
      .insert(results);

    if (error) {
      console.error('Error creating test results:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    const { error } = await db.supabaseDb
      .from('test_results')
      .delete()
      .eq('id', id);

    return !error;
  }

  static async deleteByRunId(runId: number): Promise<boolean> {
    const { error } = await db.supabaseDb
      .from('test_results')
      .delete()
      .eq('run_id', runId);

    return !error;
  }
}
