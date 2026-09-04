import { db } from '../config/database';
import { TEST_STATUS } from '../config/constants';

export interface TestRun {
  id: number;
  url: string;
  browser: string;
  status: keyof typeof TEST_STATUS;
  user_id?: string | null;
  guest_id?: string | null;
  test_mode?: string;
  test_config?: any;
  overall_status?: string | null;
  total_tests?: number;
  passed_tests?: number;
  failed_tests?: number;
  warning_tests?: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  created_at?: string;
}

export class TestRunModel {
  static async create(testRun: Omit<TestRun, 'id' | 'created_at'>): Promise<TestRun> {
    return await db.createTestRun({
      url: testRun.url,
      browser: testRun.browser || 'chromium',
      status: testRun.status || TEST_STATUS.QUEUED,
      user_id: testRun.user_id || null,
      guest_id: testRun.guest_id || null,
      test_mode: testRun.test_mode || 'quick',
      test_config: testRun.test_config || null,
      started_at: testRun.started_at || null,
      completed_at: testRun.completed_at || null,
      error_message: testRun.error_message || null,
    });
  }

  static async findById(id: number): Promise<TestRun | null> {
    return await db.getTestRun(id);
  }

  static async findAll(limit: number = 50, offset: number = 0): Promise<TestRun[]> {
    const { data, error } = await db.supabaseDb
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return [];
    return data as TestRun[];
  }

  static async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<TestRun[]> {
    return await db.getTestRuns({ user_id: userId, limit, offset });
  }

  static async findByGuestId(guestId: string, limit: number = 50, offset: number = 0): Promise<TestRun[]> {
    return await db.getTestRuns({ guest_id: guestId, limit, offset });
  }

  static async count(filters?: { userId?: string; guestId?: string }): Promise<number> {
    let query = db.supabaseDb
      .from('test_runs')
      .select('*', { count: 'exact', head: true });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.guestId) {
      query = query.eq('guest_id', filters.guestId);
    }

    const { count, error } = await query;

    if (error) return 0;
    return count || 0;
  }

  static async update(id: number, updates: Partial<TestRun>): Promise<TestRun | null> {
    return await db.updateTestRun(id, updates);
  }

  static async updateStatus(id: number, status: keyof typeof TEST_STATUS, errorMessage?: string): Promise<boolean> {
    const updates: Partial<TestRun> = { status };

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    if (status === TEST_STATUS.RUNNING) {
      updates.started_at = new Date().toISOString();
    } else if (status === TEST_STATUS.COMPLETED || status === TEST_STATUS.FAILED) {
      updates.completed_at = new Date().toISOString();
    }

    const result = await this.update(id, updates);
    return result !== null;
  }

  static async delete(id: number): Promise<boolean> {
    const { error } = await db.supabaseDb
      .from('test_runs')
      .delete()
      .eq('id', id);

    return !error;
  }
}
