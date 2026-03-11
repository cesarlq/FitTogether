-- ============================================
-- FitTogether — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Couples table
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Usuario',
  avatar TEXT,
  current_weight NUMERIC DEFAULT 0,
  goal_weight NUMERIC DEFAULT 0,
  couple_id UUID REFERENCES couples(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Daily logs table
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  breakfast TEXT DEFAULT '',
  lunch TEXT DEFAULT '',
  dinner TEXT DEFAULT '',
  snacks TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- 4. Weight entries table
CREATE TABLE IF NOT EXISTS weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/write their own profile + read partner's
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  USING (
    couple_id IS NOT NULL
    AND couple_id IN (
      SELECT couple_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Daily logs: users can CRUD their own + read partner's
CREATE POLICY "Users can manage own logs"
  ON daily_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view partner logs"
  ON daily_logs FOR SELECT
  USING (
    user_id IN (
      SELECT p2.id FROM profiles p1
      JOIN profiles p2 ON p1.couple_id = p2.couple_id
      WHERE p1.id = auth.uid() AND p2.id != auth.uid()
    )
  );

-- Weight entries: users can CRUD their own
CREATE POLICY "Users can manage own weight entries"
  ON weight_entries FOR ALL
  USING (auth.uid() = user_id);

-- Couples: users can read their own couple
CREATE POLICY "Users can view own couple"
  ON couples FOR SELECT
  USING (
    id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create couples"
  ON couples FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Realtime: Enable for partner updates
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE daily_logs;

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_profiles_couple ON profiles(couple_id);
