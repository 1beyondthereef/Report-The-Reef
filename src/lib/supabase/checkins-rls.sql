-- ============================================================================
-- RLS Policies for Connect Feature (Checkins & Profiles)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Authenticated users can read active checkins" ON checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can update own checkins" ON checkins;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;

-- ============================================================================
-- CHECKINS TABLE POLICIES
-- ============================================================================

-- Allow all authenticated users to read active checkins
-- (This is needed so boaters can see each other on the map)
CREATE POLICY "Authenticated users can read active checkins"
ON checkins
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND is_active = true
  AND expires_at > now()
);

-- Users can insert their own checkins
CREATE POLICY "Users can insert own checkins"
ON checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own checkins
CREATE POLICY "Users can update own checkins"
ON checkins
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own checkins
CREATE POLICY "Users can delete own checkins"
ON checkins
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Allow authenticated users to read other profiles' basic info
-- (needed for seeing boater names on the map)
CREATE POLICY "Authenticated users can read profiles"
ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- ============================================================================
-- FIX: Default is_visible to true
-- ============================================================================

-- Set is_visible to true for all existing profiles where it's null
UPDATE profiles SET is_visible = true WHERE is_visible IS NULL;

-- Set default for future profiles
ALTER TABLE profiles ALTER COLUMN is_visible SET DEFAULT true;

-- ============================================================================
-- ENABLE RLS (if not already enabled)
-- ============================================================================

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
