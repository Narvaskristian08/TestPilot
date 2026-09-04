import { db } from '../config/database';

export interface TestSuite {
  id: number;
  name: string;
  description?: string | null;
  user_id?: string | null;
  test_count?: number;
  created_at?: string;
  updated_at?: string;
}

export class TestSuiteModel {
  static async create(suite: Omit<TestSuite, 'id' | 'created_at' | 'updated_at' | 'test_count'>): Promise<TestSuite> {
    return await db.createTestSuite({
      name: suite.name,
      description: suite.description || null,
      user_id: suite.user_id || null,
    });
  }

  static async findById(id: number): Promise<TestSuite | null> {
    return await db.getTestSuite(id);
  }

  static async findAll(userId?: string): Promise<TestSuite[]> {
    if (userId) {
      const { data, error } = await db.supabaseDb
        .from('test_suites')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data as TestSuite[];
    }

    return await db.getTestSuites(userId!);
  }

  static async update(id: number, suite: Partial<TestSuite>): Promise<TestSuite | null> {
    return await db.updateTestSuite(id, {
      ...suite,
      updated_at: new Date().toISOString(),
    });
  }

  static async updateTestCount(id: number): Promise<void> {
    const { count, error } = await db.supabaseDb
      .from('test_cases')
      .select('*', { count: 'exact', head: true })
      .eq('suite_id', id);

    if (!error) {
      await db.updateTestSuite(id, { test_count: count || 0 });
    }
  }

  static async delete(id: number): Promise<boolean> {
    return await db.deleteTestSuite(id);
  }
}
