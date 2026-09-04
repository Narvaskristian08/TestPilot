import { db } from '../config/database';

export interface TestCase {
  id: number;
  suite_id?: number | null;
  name: string;
  type: string;
  description?: string | null;
  config?: any | null;
  status?: 'active' | 'inactive';
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class TestCaseModel {
  static async create(testCase: Omit<TestCase, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<TestCase> {
    const result = await db.createTestCase({
      suite_id: testCase.suite_id || null,
      name: testCase.name,
      type: testCase.type,
      description: testCase.description || null,
      config: testCase.config || null,
      user_id: testCase.user_id || null,
      status: 'active',
    });

    // Update test count in suite
    if (testCase.suite_id) {
      const { TestSuiteModel } = require('./TestSuite');
      await TestSuiteModel.updateTestCount(testCase.suite_id);
    }

    return result;
  }

  static async findById(id: number): Promise<TestCase | null> {
    const { data, error } = await db.supabaseDb
      .from('test_cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as TestCase;
  }

  static async findAll(userId?: string, suiteId?: number): Promise<TestCase[]> {
    let query = db.supabaseDb
      .from('test_cases')
      .select('*');

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    if (suiteId) {
      query = query.eq('suite_id', suiteId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return [];
    return data as TestCase[];
  }

  static async update(id: number, testCase: Partial<TestCase>): Promise<TestCase | null> {
    const result = await db.updateTestCase(id, {
      ...testCase,
      updated_at: new Date().toISOString(),
    });
    return result;
  }

  static async delete(id: number): Promise<boolean> {
    const testCase = await this.findById(id);
    if (!testCase) return false;

    const result = await db.deleteTestCase(id);

    if (result && testCase.suite_id) {
      const { TestSuiteModel } = require('./TestSuite');
      await TestSuiteModel.updateTestCount(testCase.suite_id);
    }

    return result;
  }
}
