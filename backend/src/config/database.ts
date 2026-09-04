import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from './constants';

// Check if Supabase is configured
const isConfigured = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

if (!isConfigured) {
  console.warn('');
  console.warn('╔════════════════════════════════════════════════════════════╗');
  console.warn('║  ⚠️  SUPABASE NOT CONFIGURED                               ║');
  console.warn('╚════════════════════════════════════════════════════════════╝');
  console.warn('');
  console.warn('Database features are DISABLED.');
  console.warn('');
  console.warn('To enable database:');
  console.warn('1. Create a Supabase project at https://supabase.com');
  console.warn('2. Copy your credentials from Settings → API');
  console.warn('3. Add to backend/.env:');
  console.warn('   SUPABASE_URL=https://xxxxx.supabase.co');
  console.warn('   SUPABASE_ANON_KEY=eyJhbGc...');
  console.warn('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...');
  console.warn('');
}

// Create a dummy client that provides helpful error messages
const createDummyClient = (): SupabaseClient => {
  const handler = {
    get: (target: any, prop: string) => {
      throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
    }
  };
  return new Proxy({} as SupabaseClient, handler);
};

// Admin client for database operations (uses service role key)
export const supabaseDb = isConfigured && CONFIG.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createDummyClient();

export default supabaseDb;

// Export helper to check if Supabase is available
export const isSupabaseConfigured = () => isConfigured;

// Database helper functions
export const db = {
  // Expose the configured client to the model layer.
  supabaseDb,

  // Users
  async createUser(data: { supabase_user_id: string; email: string; display_name?: string }) {
    const { data: user, error } = await supabaseDb
      .from('users')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return user;
  },

  async getUserBySupabaseId(supabase_user_id: string) {
    const { data: user, error } = await supabaseDb
      .from('users')
      .select('*')
      .eq('supabase_user_id', supabase_user_id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return user;
  },

  async getUserByEmail(email: string) {
    const { data: user, error } = await supabaseDb
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return user;
  },

  // Test Runs
  async createTestRun(data: any) {
    const { data: run, error } = await supabaseDb
      .from('test_runs')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return run;
  },

  async getTestRun(id: number) {
    const { data: run, error } = await supabaseDb
      .from('test_runs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return run;
  },

  async updateTestRun(id: number, data: any) {
    const { data: run, error } = await supabaseDb
      .from('test_runs')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return run;
  },

  async getTestRuns(filters?: { user_id?: string; guest_id?: string; limit?: number; offset?: number }) {
    let query = supabaseDb
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters?.guest_id) {
      query = query.eq('guest_id', filters.guest_id);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      const limit = filters.limit || 50;
      query = query.range(filters.offset, filters.offset + limit - 1);
    }

    const { data: runs, error } = await query;
    if (error) throw error;
    return runs;
  },

  // Test Results
  async createTestResult(data: any) {
    const { data: result, error } = await supabaseDb
      .from('test_results')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async getTestResults(runId: number) {
    const { data: results, error } = await supabaseDb
      .from('test_results')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return results;
  },

  // Test Artifacts
  async createTestArtifact(data: any) {
    const { data: artifact, error } = await supabaseDb
      .from('test_artifacts')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return artifact;
  },

  async getTestArtifacts(runId: number) {
    const { data: artifacts, error } = await supabaseDb
      .from('test_artifacts')
      .select('*')
      .eq('run_id', runId);
    if (error) throw error;
    return artifacts;
  },

  // Daily Usage
  async getDailyUsage(userId: string, date: string) {
    const { data: usage, error } = await supabaseDb
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('usage_date', date)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return usage;
  },

  async incrementDailyUsage(userId: string, date: string) {
    const existing = await this.getDailyUsage(userId, date);

    if (existing) {
      const { data: usage, error } = await supabaseDb
        .from('daily_usage')
        .update({ test_count: existing.test_count + 1 })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return usage;
    } else {
      const { data: usage, error } = await supabaseDb
        .from('daily_usage')
        .insert({ user_id: userId, usage_date: date, test_count: 1 })
        .select()
        .single();
      if (error) throw error;
      return usage;
    }
  },

  // Guest Usage
  async getGuestUsage(guestIdentifier: string) {
    const { data: usage, error } = await supabaseDb
      .from('guest_usage')
      .select('*')
      .eq('guest_identifier', guestIdentifier)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return usage;
  },

  async incrementGuestUsage(guestIdentifier: string, ipAddress: string, userAgent?: string) {
    const existing = await this.getGuestUsage(guestIdentifier);

    if (existing) {
      const { data: usage, error } = await supabaseDb
        .from('guest_usage')
        .update({
          test_count: existing.test_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return usage;
    } else {
      const { data: usage, error } = await supabaseDb
        .from('guest_usage')
        .insert({
          guest_identifier: guestIdentifier,
          ip_address: ipAddress,
          user_agent: userAgent,
          test_count: 1
        })
        .select()
        .single();
      if (error) throw error;
      return usage;
    }
  },

  // Test Suites
  async createTestSuite(data: any) {
    const { data: suite, error } = await supabaseDb
      .from('test_suites')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return suite;
  },

  async getTestSuites(userId: string) {
    const { data: suites, error } = await supabaseDb
      .from('test_suites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return suites;
  },

  async getTestSuite(id: number) {
    const { data: suite, error } = await supabaseDb
      .from('test_suites')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return suite;
  },

  async updateTestSuite(id: number, data: any) {
    const { data: suite, error } = await supabaseDb
      .from('test_suites')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return suite;
  },

  async deleteTestSuite(id: number) {
    const { error } = await supabaseDb
      .from('test_suites')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Test Cases
  async createTestCase(data: any) {
    const { data: testCase, error } = await supabaseDb
      .from('test_cases')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return testCase;
  },

  async getTestCases(suiteId: number) {
    const { data: cases, error } = await supabaseDb
      .from('test_cases')
      .select('*')
      .eq('suite_id', suiteId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return cases;
  },

  async updateTestCase(id: number, data: any) {
    const { data: testCase, error } = await supabaseDb
      .from('test_cases')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return testCase;
  },

  async deleteTestCase(id: number) {
    const { error } = await supabaseDb
      .from('test_cases')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Schedules
  async createSchedule(data: any) {
    const { data: schedule, error } = await supabaseDb
      .from('schedules')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return schedule;
  },

  async getSchedules(userId: string) {
    const { data: schedules, error } = await supabaseDb
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return schedules;
  },

  async updateSchedule(id: number, data: any) {
    const { data: schedule, error } = await supabaseDb
      .from('schedules')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return schedule;
  },

  async deleteSchedule(id: number) {
    const { error } = await supabaseDb
      .from('schedules')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};
