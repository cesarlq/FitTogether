import { supabase } from '../supabase';
import { DbProfile } from '../../types/database';

export async function getProfile(userId: string): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function createProfile(profile: {
  id: string;
  name: string;
  avatar?: string;
  current_weight?: number;
  goal_weight?: number;
}): Promise<DbProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar || null,
      current_weight: profile.current_weight || 0,
      goal_weight: profile.goal_weight || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<DbProfile, 'name' | 'avatar' | 'current_weight' | 'goal_weight' | 'couple_id'>>
): Promise<DbProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPartnerProfile(userId: string): Promise<DbProfile | null> {
  // First get the user's couple_id
  const profile = await getProfile(userId);
  if (!profile?.couple_id) return null;

  // Then get the partner in the same couple
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('couple_id', profile.couple_id)
    .neq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
