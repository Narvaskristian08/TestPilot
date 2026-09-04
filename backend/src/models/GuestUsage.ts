import { db } from '../config/database';
import { CONFIG } from '../config/constants';

export interface GuestUsage {
  id: number;
  guest_identifier: string;
  ip_address: string;
  user_agent?: string | null;
  test_count: number;
  last_used_at?: string;
  created_at?: string;
}

export class GuestUsageModel {
  /**
   * Create or update guest usage record
   */
  static async upsert(guestData: Omit<GuestUsage, 'id' | 'created_at'>): Promise<GuestUsage> {
    return await db.incrementGuestUsage(
      guestData.guest_identifier,
      guestData.ip_address,
      guestData.user_agent || undefined
    );
  }

  /**
   * Find guest usage by ID
   */
  static async findById(id: number): Promise<GuestUsage | null> {
    const { data, error } = await db.supabaseDb
      .from('guest_usage')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as GuestUsage;
  }

  /**
   * Find guest usage by identifier and IP
   */
  static async findByIdentifierAndIp(identifier: string, ip: string): Promise<GuestUsage | null> {
    return await db.getGuestUsage(identifier);
  }

  /**
   * Get tests used by guest (identifier + IP combo)
   */
  static async getTestsUsed(identifier: string, ip: string): Promise<number> {
    const record = await this.findByIdentifierAndIp(identifier, ip);
    return record?.test_count || 0;
  }

  /**
   * Atomically increment guest usage and check limit
   * Returns true if successful, false if limit exceeded
   */
  static async incrementUsage(identifier: string, ip: string, userAgent?: string): Promise<boolean> {
    const currentUsage = await this.getTestsUsed(identifier, ip);

    // Check if limit already exceeded
    if (currentUsage >= CONFIG.GUEST_QA_LIMIT) {
      return false;
    }

    await db.incrementGuestUsage(identifier, ip, userAgent);
    return true;
  }

  /**
   * Check if guest has exceeded limit (server-side validation)
   */
  static async hasExceededLimit(identifier: string, ip: string): Promise<boolean> {
    const used = await this.getTestsUsed(identifier, ip);
    return used >= CONFIG.GUEST_QA_LIMIT;
  }

  /**
   * Get remaining tests for guest
   */
  static async getRemainingTests(identifier: string, ip: string): Promise<number> {
    const used = await this.getTestsUsed(identifier, ip);
    const remaining = CONFIG.GUEST_QA_LIMIT - used;
    return Math.max(0, remaining);
  }

  /**
   * Get usage stats for guest
   */
  static async getUsageStats(identifier: string, ip: string): Promise<{
    used: number;
    limit: number;
    remaining: number;
    hasExceeded: boolean;
  }> {
    const used = await this.getTestsUsed(identifier, ip);
    const limit = CONFIG.GUEST_QA_LIMIT;
    const remaining = Math.max(0, limit - used);
    const hasExceeded = used >= limit;

    return { used, limit, remaining, hasExceeded };
  }

  /**
   * Clean up old guest records (older than 30 days)
   */
  static async cleanup(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await db.supabaseDb
      .from('guest_usage')
      .delete()
      .lt('last_used_at', cutoffDate.toISOString())
      .select('id');

    if (error) return 0;
    return data?.length || 0;
  }
}
