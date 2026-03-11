import { supabase } from '../supabase';
import { DbDailyLog } from '../../types/database';

export async function getDailyLog(
  userId: string,
  date: string
): Promise<DbDailyLog | null> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getDailyLogsByUser(
  userId: string
): Promise<DbDailyLog[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDailyLogsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DbDailyLog[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertDailyLog(
  userId: string,
  log: {
    date: string;
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
    notes?: string;
    completed?: boolean;
    photos?: string;
  }
): Promise<DbDailyLog> {
  const payload: Record<string, any> = {
    user_id: userId,
    date: log.date,
    breakfast: log.breakfast ?? '',
    lunch: log.lunch ?? '',
    dinner: log.dinner ?? '',
    snacks: log.snacks ?? '',
    notes: log.notes ?? '',
    completed: log.completed ?? false,
    updated_at: new Date().toISOString(),
  };
  if (log.photos !== undefined) payload.photos = log.photos;

  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(payload, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePhotos(
  userId: string,
  date: string,
  photosJson: string
): Promise<DbDailyLog> {
  const existing = await getDailyLog(userId, date);

  if (existing) {
    const { data, error } = await supabase
      .from('daily_logs')
      .update({
        photos: photosJson,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('date', date)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  return upsertDailyLog(userId, { date, photos: photosJson });
}

export async function updateMeal(
  userId: string,
  date: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks',
  value: string
): Promise<DbDailyLog> {
  // First try to update existing
  const existing = await getDailyLog(userId, date);

  if (existing) {
    const { data, error } = await supabase
      .from('daily_logs')
      .update({
        [mealType]: value,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('date', date)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Create new log with this meal
  return upsertDailyLog(userId, { date, [mealType]: value });
}

export async function updateNotes(
  userId: string,
  date: string,
  notes: string
): Promise<DbDailyLog> {
  return upsertDailyLog(userId, { date, notes });
}

export async function markDayCompleted(
  userId: string,
  date: string,
  completed: boolean
): Promise<DbDailyLog> {
  const existing = await getDailyLog(userId, date);

  if (existing) {
    const { data, error } = await supabase
      .from('daily_logs')
      .update({
        completed,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('date', date)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  return upsertDailyLog(userId, { date, completed });
}

export async function deleteDailyLog(
  userId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('user_id', userId)
    .eq('date', date);

  if (error) throw error;
}

export async function deleteAllLogs(userId: string): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}
