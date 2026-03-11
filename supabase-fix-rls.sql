-- ============================================
-- FIX: Remove recursive RLS policies
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view partner profile" ON profiles;

-- 2. Drop all existing policies on daily_logs
DROP POLICY IF EXISTS "Users can manage own logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can view partner logs" ON daily_logs;

-- 3. Drop all existing policies on weight_entries
DROP POLICY IF EXISTS "Users can manage own weight entries" ON weight_entries;

-- 4. Drop all existing policies on couples
DROP POLICY IF EXISTS "Users can view own couple" ON couples;
DROP POLICY IF EXISTS "Users can create couples" ON couples;

-- ============================================
-- Helper function to get partner ID without recursion
-- ============================================

CREATE OR REPLACE FUNCTION get_my_couple_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT couple_id FROM profiles WHERE id = auth.uid();
$$;

-- ============================================
-- NEW POLICIES: profiles
-- ============================================

-- Users can read their own profile AND partner's profile
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR (
      couple_id IS NOT NULL
      AND couple_id = get_my_couple_id()
    )
  );

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles_delete"
  ON profiles FOR DELETE
  USING (id = auth.uid());

-- ============================================
-- NEW POLICIES: daily_logs
-- ============================================

-- Users can do everything with their own logs
CREATE POLICY "daily_logs_own"
  ON daily_logs FOR ALL
  USING (user_id = auth.uid());

-- Users can read partner's logs
CREATE POLICY "daily_logs_partner_select"
  ON daily_logs FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM profiles
      WHERE couple_id = get_my_couple_id()
        AND id != auth.uid()
    )
  );

-- ============================================
-- NEW POLICIES: weight_entries
-- ============================================

CREATE POLICY "weight_entries_own"
  ON weight_entries FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- NEW POLICIES: couples
-- ============================================

CREATE POLICY "couples_select"
  ON couples FOR SELECT
  USING (id = get_my_couple_id());

CREATE POLICY "couples_insert"
  ON couples FOR INSERT
  WITH CHECK (true);
