export interface DailyLog {
  date: string; // ISO format YYYY-MM-DD
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  notes?: string;
  completed: boolean;
  imageUri?: string;
}

export interface PartnerData {
  name: string;
  avatar: string;
  currentStreak: number;
  todayCompleted: boolean;
  weeklyProgress: number; // 0-1
}

export interface UserProfile {
  name: string;
  avatar: string;
  currentWeight: number;
  weightHistory: { date: string; weight: number }[];
  goalWeight: number;
}

export interface FitTogetherState {
  dailyLogs: Record<string, DailyLog>;
  currentStreak: number;
  longestStreak: number;
  partnerData: PartnerData;
  userProfile: UserProfile;
}
