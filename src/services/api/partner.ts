import { supabase } from '../supabase';
import { getPartnerProfile } from './profiles';
import { getDailyLogsByUser } from './dailyLogs';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { PartnerData } from '../../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export async function getPartnerProgress(userId: string): Promise<PartnerData | null> {
  const partner = await getPartnerProfile(userId);
  if (!partner) return null;

  const logs = await getDailyLogsByUser(partner.id);
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = logs.find(l => l.date === today);

  // Calculate streak
  let streak = 0;
  let checkDate = new Date();
  const todayStr = format(checkDate, 'yyyy-MM-dd');
  const todayEntry = logs.find(l => l.date === todayStr);

  if (!todayEntry?.completed) {
    checkDate = subDays(checkDate, 1);
  }

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const entry = logs.find(l => l.date === dateStr);
    if (entry?.completed) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Weekly progress
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  let weekCompleted = 0;
  let weekDays = 0;
  for (let i = 0; i < 7; i++) {
    const day = format(addDays(weekStart, i), 'yyyy-MM-dd');
    const dayLog = logs.find(l => l.date === day);
    if (dayLog) {
      weekDays++;
      if (dayLog.completed) weekCompleted++;
    }
  }

  return {
    name: partner.name,
    avatar: partner.avatar || 'https://i.pravatar.cc/150?u=partner',
    currentStreak: streak,
    todayCompleted: todayLog?.completed || false,
    weeklyProgress: weekDays > 0 ? weekCompleted / weekDays : 0,
  };
}

export function subscribeToPartnerLogs(
  partnerUserId: string,
  onUpdate: () => void
): RealtimeChannel {
  const channel = supabase
    .channel(`partner-logs-${partnerUserId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'daily_logs',
        filter: `user_id=eq.${partnerUserId}`,
      },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromPartner(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}
