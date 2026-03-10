import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FitTogetherState, DailyLog, UserProfile, PartnerData } from '../types';
import { format, subDays, isBefore, parseISO, startOfDay } from 'date-fns';

const calculateStreak = (logs: Record<string, DailyLog>) => {
  let streak = 0;
  let today = new Date();

  // Start from today or yesterday
  let checkDate = today;
  const todayStr = format(today, 'yyyy-MM-dd');

  if (!logs[todayStr] || !logs[todayStr].completed) {
    checkDate = subDays(today, 1);
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

interface StoreActions {
  logMeal: (date: string, type: 'breakfast' | 'lunch' | 'dinner' | 'snacks', value: string) => void;
  toggleComplete: (date: string) => void;
  updateNotes: (date: string, notes: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  resetChallenge: () => void;
  setInitialData: () => void;
}

export const useStore = create<FitTogetherState & StoreActions>()(
  persist(
    (set, get) => ({
      dailyLogs: {},
      currentStreak: 0,
      longestStreak: 0,
      partnerData: {
        name: 'Alex',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        currentStreak: 12,
        todayCompleted: true,
        weeklyProgress: 0.85,
      },
      userProfile: {
        name: 'Sam',
        avatar: 'https://i.pravatar.cc/150?u=sam',
        currentWeight: 78.5,
        weightHistory: [
          { date: '2024-03-01', weight: 80.5 },
          { date: '2024-03-08', weight: 79.8 },
          { date: '2024-03-15', weight: 79.2 },
          { date: '2024-03-22', weight: 78.5 },
        ],
        goalWeight: 75.0,
      },

      logMeal: (date, type, value) => set((state) => {
        const logs = { ...state.dailyLogs };
        if (!logs[date]) {
          logs[date] = { date, breakfast: '', lunch: '', dinner: '', snacks: '', completed: false };
        }
        logs[date][type] = value;
        return { dailyLogs: logs };
      }),

      toggleComplete: (date) => set((state) => {
        const logs = { ...state.dailyLogs };
        if (!logs[date]) {
          logs[date] = { date, breakfast: '', lunch: '', dinner: '', snacks: '', completed: false };
        }
        logs[date].completed = !logs[date].completed;

        const newStreak = calculateStreak(logs);
        const newLongest = Math.max(state.longestStreak, newStreak);

        return {
          dailyLogs: logs,
          currentStreak: newStreak,
          longestStreak: newLongest
        };
      }),

      updateNotes: (date, notes) => set((state) => {
        const logs = { ...state.dailyLogs };
        if (!logs[date]) {
          logs[date] = { date, breakfast: '', lunch: '', dinner: '', snacks: '', completed: false };
        }
        logs[date].notes = notes;
        return { dailyLogs: logs };
      }),

      updateProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile }
      })),

      resetChallenge: () => set({
        dailyLogs: {},
        currentStreak: 0,
        longestStreak: 0
      }),

      setInitialData: () => {
        // Only if empty
        if (Object.keys(get().dailyLogs).length === 0) {
          const mockLogs: Record<string, DailyLog> = {};
          const today = new Date();
          for (let i = 1; i <= 15; i++) {
            const d = subDays(today, i);
            const ds = format(d, 'yyyy-MM-dd');
            mockLogs[ds] = {
              date: ds,
              breakfast: 'Oatmeal',
              lunch: 'Salad',
              dinner: 'Chicken',
              snacks: 'Apple',
              completed: i !== 4 && i !== 11, // Some missed days
            };
          }
          set({
            dailyLogs: mockLogs,
            currentStreak: calculateStreak(mockLogs),
            longestStreak: 15
          });
        }
      }
    }),
    {
      name: 'fittogether-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
