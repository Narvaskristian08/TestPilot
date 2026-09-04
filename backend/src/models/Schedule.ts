import { db } from '../config/database';

export interface Schedule {
  id: number;
  name: string;
  suite_id?: number | null;
  cron_expression: string;
  timezone?: string;
  enabled?: boolean;
  next_run?: string | null;
  last_run?: string | null;
  last_status?: 'success' | 'failed' | 'running' | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class ScheduleModel {
  static async create(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at' | 'enabled' | 'next_run' | 'last_run' | 'last_status'>): Promise<Schedule> {
    return await db.createSchedule({
      name: schedule.name,
      suite_id: schedule.suite_id || null,
      cron_expression: schedule.cron_expression,
      timezone: schedule.timezone || 'UTC',
      user_id: schedule.user_id || null,
      enabled: true,
    });
  }

  static async findById(id: number): Promise<Schedule | null> {
    const { data, error } = await db.supabaseDb
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Schedule;
  }

  static async findAll(userId?: string): Promise<Schedule[]> {
    return await db.getSchedules(userId!);
  }

  static async update(id: number, schedule: Partial<Schedule>): Promise<Schedule | null> {
    return await db.updateSchedule(id, {
      ...schedule,
      updated_at: new Date().toISOString(),
    });
  }

  static async toggle(id: number): Promise<Schedule | null> {
    const schedule = await this.findById(id);
    if (!schedule) return null;

    return await this.update(id, { enabled: !schedule.enabled });
  }

  static async delete(id: number): Promise<boolean> {
    return await db.deleteSchedule(id);
  }
}
