import { supabase } from '../supabase';
import { DbWeightEntry } from '../../types/database';

export async function getWeightEntries(
  userId: string
): Promise<DbWeightEntry[]> {
  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertWeightEntry(
  userId: string,
  date: string,
  weight: number
): Promise<DbWeightEntry> {
  const { data, error } = await supabase
    .from('weight_entries')
    .upsert(
      {
        user_id: userId,
        date,
        weight,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAllWeightEntries(userId: string): Promise<void> {
  const { error } = await supabase
    .from('weight_entries')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}
