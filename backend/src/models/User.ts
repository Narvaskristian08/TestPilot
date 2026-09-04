import { db } from '../config/database';

export interface User {
  id: string;
  supabase_user_id?: string;
  email: string;
  display_name: string | null;
  avatar_url?: string | null;
  plan?: string;
  created_at?: string;
  updated_at?: string;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    return await db.createUser({
      supabase_user_id: user.supabase_user_id!,
      email: user.email,
      display_name: user.display_name || undefined,
    });
  }

  /**
   * Find user by internal ID
   */
  static async findById(id: string): Promise<User | null> {
    const { data, error } = await db.supabaseDb
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as User;
  }

  /**
   * Find user by Supabase user ID
   */
  static async findBySupabaseId(supabaseUserId: string): Promise<User | null> {
    return await db.getUserBySupabaseId(supabaseUserId);
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    return await db.getUserByEmail(email);
  }

  /**
   * Update user profile
   */
  static async update(id: string, updates: Partial<Pick<User, 'display_name' | 'email' | 'avatar_url'>>): Promise<User | null> {
    const { data, error } = await db.supabaseDb
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return data as User;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const { error } = await db.supabaseDb
      .from('users')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * Get all users (admin function)
   */
  static async findAll(limit: number = 100, offset: number = 0): Promise<User[]> {
    const { data, error } = await db.supabaseDb
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return [];
    return data as User[];
  }

  /**
   * Count total users
   */
  static async count(): Promise<number> {
    const { count, error } = await db.supabaseDb
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) return 0;
    return count || 0;
  }
}
