-- =====================================================
-- PROFILES TABLE UPDATE
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add username column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text;

-- 2. Add unique constraint on username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- 3. Add home_port column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_port text;

-- 4. Ensure all required columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS boat_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_port text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 5. Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate with correct rules)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- SELECT: Anyone can read any profile (for public profiles)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- INSERT: Users can insert their own profile (auth.uid() = id)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update their own profile (auth.uid() = id)
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- STORAGE BUCKET FOR PROFILE PHOTOS
-- =====================================================

-- Note: Run this in the Supabase Dashboard > Storage > Create Bucket
-- Bucket name: profile-photos
-- Public: Yes (or set up policies for authenticated users)

-- If using SQL, you can try (may require admin access):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('profile-photos', 'profile-photos', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies (run in SQL editor):
-- Allow authenticated users to upload to profile-photos bucket
-- INSERT INTO storage.policies (name, bucket_id, mode, definition)
-- VALUES (
--   'Allow authenticated uploads',
--   'profile-photos',
--   'INSERT',
--   '(role() = ''authenticated'')'
-- );

-- =====================================================
-- HELPER FUNCTION: Create profile on user signup
-- =====================================================

-- This function creates a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- Check that the profiles table has the correct structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
