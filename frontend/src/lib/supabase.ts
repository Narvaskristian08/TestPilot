import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.generated';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = () => Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient<Database> | null = hasSupabase()
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export default supabase;

function getSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error('Authentication is not configured. Add the Supabase environment variables to enable it.');
  }

  return supabase;
}

// Auth helper functions
export const auth = {
  async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await getSupabase().auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await getSupabase().auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return getSupabase().auth.onAuthStateChange(callback);
  },
};

// Database helper functions
export const db = {
  // Test Runs
  async createTestRun(data: Database['public']['Tables']['test_runs']['Insert']) {
    const { data: run, error } = await getSupabase()
      .from('test_runs')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return run;
  },

  async getTestRun(id: number) {
    const { data: run, error } = await getSupabase()
      .from('test_runs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return run;
  },

  async getTestRuns(limit = 50) {
    const { data: runs, error } = await getSupabase()
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return runs;
  },

  async getTestResults(runId: number) {
    const { data: results, error } = await getSupabase()
      .from('test_results')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return results;
  },

  async getTestArtifacts(runId: number) {
    const { data: artifacts, error } = await getSupabase()
      .from('test_artifacts')
      .select('*')
      .eq('run_id', runId);
    if (error) throw error;
    return artifacts;
  },

  // Test Suites
  async createTestSuite(data: Database['public']['Tables']['test_suites']['Insert']) {
    const { data: suite, error } = await getSupabase()
      .from('test_suites')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return suite;
  },

  async getTestSuites() {
    const { data: suites, error } = await getSupabase()
      .from('test_suites')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return suites;
  },

  async getTestSuite(id: number) {
    const { data: suite, error } = await getSupabase()
      .from('test_suites')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return suite;
  },

  async updateTestSuite(id: number, data: Partial<Database['public']['Tables']['test_suites']['Update']>) {
    const { data: suite, error } = await getSupabase()
      .from('test_suites')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return suite;
  },

  async deleteTestSuite(id: number) {
    const { error } = await getSupabase()
      .from('test_suites')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Test Cases
  async createTestCase(data: Database['public']['Tables']['test_cases']['Insert']) {
    const { data: testCase, error } = await getSupabase()
      .from('test_cases')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return testCase;
  },

  async getTestCases(suiteId: number) {
    const { data: cases, error } = await getSupabase()
      .from('test_cases')
      .select('*')
      .eq('suite_id', suiteId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return cases;
  },

  // Schedules
  async createSchedule(data: Database['public']['Tables']['schedules']['Insert']) {
    const { data: schedule, error } = await getSupabase()
      .from('schedules')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return schedule;
  },

  async getSchedules() {
    const { data: schedules, error } = await getSupabase()
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return schedules;
  },

  async updateSchedule(id: number, data: Partial<Database['public']['Tables']['schedules']['Update']>) {
    const { data: schedule, error } = await getSupabase()
      .from('schedules')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return schedule;
  },

  async deleteSchedule(id: number) {
    const { error } = await getSupabase()
      .from('schedules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // User Profile
  async getUserProfile(userId: string) {
    const { data: profile, error } = await getSupabase()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return profile;
  },

  async updateUserProfile(userId: string, data: Partial<Database['public']['Tables']['users']['Update']>) {
    const { data: profile, error } = await getSupabase()
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return profile;
  },
};
