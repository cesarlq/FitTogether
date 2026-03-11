import { supabase } from '../supabase';

export async function uploadMealPhoto(
  userId: string,
  date: string,
  uri: string,
  mealType: string
): Promise<string> {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}_${mealType}.${fileExt}`;
  const filePath = `${userId}/${date}/${fileName}`;
  const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

  const { error } = await supabase.storage
    .from('meal-photos')
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('meal-photos')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function deleteMealPhoto(filePath: string): Promise<void> {
  // Extract path from full URL
  const match = filePath.match(/meal-photos\/(.+)$/);
  if (!match) return;

  const { error } = await supabase.storage
    .from('meal-photos')
    .remove([match[1]]);

  if (error) console.error('Delete photo error:', error);
}
