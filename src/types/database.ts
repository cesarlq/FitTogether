// Database row types — match Supabase table schemas

export interface DbProfile {
  id: string;
  name: string;
  avatar: string | null;
  current_weight: number;
  goal_weight: number;
  couple_id: string | null;
  created_at: string;
}

export interface DbCouple {
  id: string;
  code: string;
  created_at: string;
}

export interface DbDailyLog {
  id: string;
  user_id: string;
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  notes: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbWeightEntry {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  created_at: string;
}
