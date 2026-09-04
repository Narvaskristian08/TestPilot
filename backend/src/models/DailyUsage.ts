import { db } from '../config/database';
import { CONFIG } from '../config/constants';

export interface DailyUsage {
  id: number;
  user_id: string;
  usage_date: string; // YYYY-MM-DD format
  test_count: number;
  created_at?: string;
}

export class DailyUsageModel {
  /**
   * Get today's date in YYYY-MM-DD format
   */
  static getTodayDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Get or create today's usage record for user
   */
  static async getOrCreateToday(userId: string): Promise<DailyUsage> {
    const today = this.getTodayDate();

    let usage = await this.findByUserAndDate(userId, today);

    if (!usage) {
      usage = await this.create({
        user_id: userId,
        usage_date: today,
        test_count: 0,
      });
    }

    return usage;
  }

  /**
   * Create a new daily usage record
   */
  static async create(usage: Omit<DailyUsage, 'id' | 'created_at'>): Promise<DailyUsage> {
    const { data, error } = await db.supabaseDb
      .from('daily_usage')
      .insert({
        user_id: usage.user_id,
        usage_date: usage.usage_date,
        test_count: usage.test_count || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as DailyUsage;
  }

  /**
   * Find daily usage by ID
   */
  static async findById(id: number): Promise<DailyUsage | null> {
    const { data, error } = await db.supabaseDb
      .from('daily_usage')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as DailyUsage;
  }

  /**
   * Find daily usage by user and date
   */
  static async findByUserAndDate(userId: string, date: string): Promise<DailyUsage | null> {
    return await db.getDailyUsage(userId, date);
  }

  /**
   * Get tests used today for a user
   */
  static async getTestsUsedToday(userId: string): Promise<number> {
    const today = this.getTodayDate();
    const usage = await this.findByUserAndDate(userId, today);
    return usage?.test_count || 0;
  }

  /**
   * Atomically increment today's usage and check limit
   * Returns true if successful, false if limit exceeded
   */
  static async incrementUsage(userId: string): Promise<boolean> {
    const today = this.getTodayDate();
    const currentUsage = await this.getTestsUsedToday(userId);

    // Check if limit already exceeded
    if (currentUsage >= CONFIG.DAILY_QA_LIMIT) {
      return false;
    }

    await db.incrementDailyUsage(userId, today);
    return true;
  }

  /**
   * Check if user has exceeded daily limit
   */
  static async hasExceededLimit(userId: string): Promise<boolean> {
    const used = await this.getTestsUsedToday(userId);
    return used >= CONFIG.DAILY_QA_LIMIT;
  }

  /**
   * Get remaining tests for today
   */
  static async getRemainingTests(userId: string): Promise<number> {
    const used = await this.getTestsUsedToday(userId);
    const remaining = CONFIG.DAILY_QA_LIMIT - used;
    return Math.max(0, remaining);
  }

  /**
   * Get usage stats for today
   */
  static async getUsageStats(userId: string): Promise<{
    used: number;
    limit: number;
    remaining: number;
    hasExceeded: boolean;
    resetsAt: string;
  }> {
    const used = await this.getTestsUsedToday(userId);
    const limit = CONFIG.DAILY_QA_LIMIT;
    const remaining = Math.max(0, limit - used);
    const hasExceeded = used >= limit;

    // Calculate when it resets (midnight tonight/tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const resetsAt = tomorrow.toISOString();

    return { used, limit, remaining, hasExceeded, resetsAt };
  }

  /**
   * Get all usage records for a user
   */
  static async findByUserId(userId: string, limit: number = 30): Promise<DailyUsage[]> {
    const { data, error } = await db.supabaseDb
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .order('usage_date', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data as DailyUsage[];
  }

  /**
   * Get usage history with stats
   */
  static async getUsageHistory(userId: string, days: number = 7): Promise<{
    date: string;
    tests_used: number;
  }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await db.supabaseDb
      .from('daily_usage')
      .select('usage_date, test_count')
      .eq('user_id', userId)
      .gte('usage_date', startDateStr)
      .order('usage_date', { ascending: false });

    if (error) return [];
    return (data || []).map((item: { usage_date: string; test_count: number }) => ({
      date: item.usage_date,
      tests_used: item.test_count,
    }));
  }

  /**
   * Clean up old usage records (older than 90 days)
   */
  static async cleanup(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const { data, error } = await db.supabaseDb
      .from('daily_usage')
      .delete()
      .lt('usage_date', cutoffDateStr)
      .select('id');

    if (error) return 0;
    return data?.length || 0;
  }
}
