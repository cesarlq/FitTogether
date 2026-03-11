import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FitTogetherState, DailyLog, UserProfile, PartnerData } from '../types';
import { format, subDays } from 'date-fns';
import { supabase } from '../services/supabase';
import * as api from '../services/api';
import { RealtimeChannel } from '@supabase/supabase-js';

// ── Helpers ──

const calculateStreak = (logs: Record<string, DailyLog>) => {
  let streak = 0;
  let checkDate = new Date();
  const todayStr = format(checkDate, 'yyyy-MM-dd');

  if (!logs[todayStr] || !logs[todayStr].completed) {
    checkDate = subDays(checkDate, 1);
  }

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (logs[dateStr] && logs[dateStr].completed) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  return streak;
};

// ── Store Interface ──

interface StoreActions {
  // Auth
  userId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  partnerChannel: RealtimeChannel | null;

  // Actions
  initialize: () => Promise<void>;
  logMeal: (date: string, type: 'breakfast' | 'lunch' | 'dinner' | 'snacks', value: string) => void;
  toggleComplete: (date: string) => void;
  updateNotes: (date: string, notes: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logWeight: (weight: number) => void;
  resetChallenge: () => void;
  setInitialData: () => void;
  refreshPartner: () => Promise<void>;
  cleanup: () => void;
}

// ── Default State ──

const defaultPartner: PartnerData = {
  name: 'Pareja',
  avatar: 'https://i.pravatar.cc/150?u=partner',
  currentStreak: 0,
  todayCompleted: false,
  weeklyProgress: 0,
};

const defaultProfile: UserProfile = {
  name: 'Usuario',
  avatar: 'https://i.pravatar.cc/150?u=user',
  currentWeight: 0,
  weightHistory: [],
  goalWeight: 0,
};

// ── Store ──

export const useStore = create<FitTogetherState & StoreActions>()(
  persist(
    (set, get) => ({
      // State
      dailyLogs: {},
      currentStreak: 0,
      longestStreak: 0,
      partnerData: defaultPartner,
      userProfile: defaultProfile,
      userId: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      partnerChannel: null,

      // ── Initialize: Load all data (session already exists from App.tsx) ──
      initialize: async () => {
        if (get().isInitialized && get().userId) return;

        set({ isLoading: true, error: null });

        try {
          // 1. Get current session (already authenticated via LoginScreen)
          const session = await api.getCurrentSession();

          if (!session?.user) throw new Error('No se pudo autenticar');

          const uid = session.user.id;

          // 2. Get or create profile
          let profile = await api.getProfile(uid);
          if (!profile) {
            profile = await api.createProfile({
              id: uid,
              name: 'Usuario',
              current_weight: 78.5,
              goal_weight: 75.0,
            });
          }

          // 3. Load daily logs
          const dbLogs = await api.getDailyLogsByUser(uid);
          const logsMap: Record<string, DailyLog> = {};
          for (const log of dbLogs) {
            logsMap[log.date] = {
              date: log.date,
              breakfast: log.breakfast,
              lunch: log.lunch,
              dinner: log.dinner,
              snacks: log.snacks,
              notes: log.notes || undefined,
              completed: log.completed,
            };
          }

          // 4. Load weight history
          const weightEntries = await api.getWeightEntries(uid);
          const weightHistory = weightEntries.map(e => ({
            date: e.date,
            weight: e.weight,
          }));

          // 5. Calculate streaks
          const currentStreak = calculateStreak(logsMap);
          const longestStreak = Math.max(currentStreak, get().longestStreak);

          // 6. Load partner data
          let partnerData = defaultPartner;
          try {
            const partner = await api.getPartnerProgress(uid);
            if (partner) partnerData = partner;
          } catch {
            // No partner linked yet, use defaults
          }

          // 7. Set up realtime subscription for partner
          const partnerProfile = await api.getPartnerProfile(uid).catch(() => null);
          let channel = get().partnerChannel;

          if (partnerProfile && !channel) {
            channel = api.subscribeToPartnerLogs(partnerProfile.id, () => {
              get().refreshPartner();
            });
          }

          set({
            userId: uid,
            userProfile: {
              name: profile.name,
              avatar: profile.avatar || defaultProfile.avatar,
              currentWeight: profile.current_weight,
              goalWeight: profile.goal_weight,
              weightHistory,
            },
            dailyLogs: logsMap,
            currentStreak,
            longestStreak,
            partnerData,
            partnerChannel: channel,
            isLoading: false,
            isInitialized: true,
          });
        } catch (err: any) {
          console.error('Initialize error:', err);
          set({
            isLoading: false,
            isInitialized: true,
            error: err.message || 'Error al inicializar',
          });
        }
      },

      // ── Refresh partner data (called by realtime) ──
      refreshPartner: async () => {
        const uid = get().userId;
        if (!uid) return;

        try {
          const partner = await api.getPartnerProgress(uid);
          if (partner) {
            set({ partnerData: partner });
          }
        } catch {
          // Silently fail
        }
      },

      // ── Log Meal (optimistic + sync) ──
      logMeal: (date, type, value) => {
        // Optimistic local update
        set((state) => {
          const logs = { ...state.dailyLogs };
          if (!logs[date]) {
            logs[date] = { date, breakfast: '', lunch: '', dinner: '', snacks: '', completed: false };
          }
          logs[date] = { ...logs[date], [type]: value };
          return { dailyLogs: logs };
        });

        // Sync to Supabase
        const uid = get().userId;
        if (uid) {
          api.updateMeal(uid, date, type, value).catch((err) => {
            console.error('Sync logMeal error:', err);
          });
        }
      },

      // ── Toggle Complete (optimistic + sync) ──
      toggleComplete: (date) => {
        let newCompleted = false;

        set((state) => {
          const logs = { ...state.dailyLogs };
          if (!logs[date]) {
            logs[date] = { date, breakfast: '', lunch: '', dinner: '', snacks: '', completed: false };
          }
          logs[date] = { ...logs[date], completed: !logs[date].completed };
          newCompleted = logs[date].completed;

          const newStreak = calculateStreak(logs);
          const newLongest = Math.max(state.longestStreak, newStreak);

          return {
            dailyLogs: logs,
            currentStreak: newStreak,
            longestStreak: newLongest,
          };
        });

        // Sync to Supabase
        const uid = get().userId;
        if (uid) {
          api.markDayCompleted(uid, date, newCompleted).catch((err) => {
            console.error('Sync toggleComplete error:', err);
          });
        }
      },

      // ── Update Notes (optimistic + sync) ──
      updateNotes: (date, notes) => {
        set((state) => {
          const logs = { ...state.dailyLogs };
          if (!logs[date]) {
            logs[date] = { date, breakfast: '', lunch: '', dinner: '', snacks: '', completed: false };
          }
          logs[date] = { ...logs[date], notes };
          return { dailyLogs: logs };
        });

        const uid = get().userId;
        if (uid) {
          api.updateNotes(uid, date, notes).catch((err) => {
            console.error('Sync updateNotes error:', err);
          });
        }
      },

      // ── Update Profile (optimistic + sync) ──
      updateProfile: (profile) => {
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        }));

        const uid = get().userId;
        if (uid) {
          const dbUpdates: Record<string, any> = {};
          if (profile.name !== undefined) dbUpdates.name = profile.name;
          if (profile.currentWeight !== undefined) dbUpdates.current_weight = profile.currentWeight;
          if (profile.goalWeight !== undefined) dbUpdates.goal_weight = profile.goalWeight;
          if (profile.avatar !== undefined) dbUpdates.avatar = profile.avatar;

          if (Object.keys(dbUpdates).length > 0) {
            api.updateProfile(uid, dbUpdates).catch((err) => {
              console.error('Sync updateProfile error:', err);
            });
          }
        }
      },

      // ── Log Weight (optimistic + sync) ──
      logWeight: (weight) => {
        const today = format(new Date(), 'yyyy-MM-dd');

        set((state) => {
          const history = [...state.userProfile.weightHistory];
          const todayIndex = history.findIndex(h => h.date === today);
          if (todayIndex >= 0) {
            history[todayIndex] = { date: today, weight };
          } else {
            history.push({ date: today, weight });
          }
          return {
            userProfile: {
              ...state.userProfile,
              currentWeight: weight,
              weightHistory: history,
            },
          };
        });

        const uid = get().userId;
        if (uid) {
          Promise.all([
            api.upsertWeightEntry(uid, today, weight),
            api.updateProfile(uid, { current_weight: weight }),
          ]).catch((err) => {
            console.error('Sync logWeight error:', err);
          });
        }
      },

      // ── Reset Challenge (clear all + sync) ──
      resetChallenge: () => {
        set({
          dailyLogs: {},
          currentStreak: 0,
          longestStreak: 0,
        });

        const uid = get().userId;
        if (uid) {
          Promise.all([
            api.deleteAllLogs(uid),
            api.deleteAllWeightEntries(uid),
          ]).catch((err) => {
            console.error('Sync resetChallenge error:', err);
          });
        }
      },

      // ── Set Initial Data (seed mock data for demo) ──
      setInitialData: () => {
        const state = get();
        if (Object.keys(state.dailyLogs).length > 0) return;
        if (!state.isInitialized) return; // Wait for Supabase init

        const mockLogs: Record<string, DailyLog> = {};
        const today = new Date();
        for (let i = 1; i <= 15; i++) {
          const d = subDays(today, i);
          const ds = format(d, 'yyyy-MM-dd');
          mockLogs[ds] = {
            date: ds,
            breakfast: 'Avena',
            lunch: 'Ensalada',
            dinner: 'Pollo',
            snacks: 'Manzana',
            completed: i !== 4 && i !== 11,
          };
        }

        const streak = calculateStreak(mockLogs);

        set({
          dailyLogs: mockLogs,
          currentStreak: streak,
          longestStreak: 15,
        });

        // Sync seed data to Supabase
        const uid = state.userId;
        if (uid) {
          Object.values(mockLogs).forEach((log) => {
            api.upsertDailyLog(uid, log).catch(() => {});
          });
        }
      },

      // ── Cleanup realtime subscriptions ──
      cleanup: () => {
        const channel = get().partnerChannel;
        if (channel) {
          api.unsubscribeFromPartner(channel);
          set({ partnerChannel: null });
        }
      },
    }),
    {
      name: 'fittogether-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields locally (cache)
        dailyLogs: state.dailyLogs,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        userProfile: state.userProfile,
        partnerData: state.partnerData,
        userId: state.userId,
      }),
    }
  )
);
