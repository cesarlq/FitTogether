import { supabase } from '../supabase';
import { DbCouple } from '../../types/database';
import { updateProfile } from './profiles';

export async function createCouple(): Promise<DbCouple> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from('couples')
    .insert({ code })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinCouple(userId: string, code: string): Promise<DbCouple> {
  const { data, error } = await supabase
    .from('couples')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error) throw error;

  // Link user to this couple
  await updateProfile(userId, { couple_id: data.id });

  return data;
}

export async function createAndJoinCouple(userId: string): Promise<DbCouple> {
  const couple = await createCouple();
  await updateProfile(userId, { couple_id: couple.id });
  return couple;
}
