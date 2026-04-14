-- =====================================================
-- CHECKINS TABLE - Complete Setup
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing table if it exists (CAREFUL: This deletes all data!)
-- Uncomment the line below if you need to recreate the table
-- DROP TABLE IF EXISTS checkins CASCADE;

-- Create the checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Location info
  location_name TEXT NOT NULL,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  anchorage_id TEXT,  -- References the anchorage ID from constants
  is_custom_location BOOLEAN DEFAULT false,

  -- User's actual GPS when they checked in
  actual_gps_lat DOUBLE PRECISION,
  actual_gps_lng DOUBLE PRECISION,

  -- Optional note and visibility
  note TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends')),

  -- Status and timing
  is_active BOOLEAN DEFAULT true,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_verified_at TIMESTAMPTZ DEFAULT now(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Add anchorage_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkins' AND column_name = 'anchorage_id') THEN
    ALTER TABLE checkins ADD COLUMN anchorage_id TEXT;
  END IF;

  -- Add is_custom_location column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkins' AND column_name = 'is_custom_location') THEN
    ALTER TABLE checkins ADD COLUMN is_custom_location BOOLEAN DEFAULT false;
  END IF;

  -- Add actual_gps_lat column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkins' AND column_name = 'actual_gps_lat') THEN
    ALTER TABLE checkins ADD COLUMN actual_gps_lat DOUBLE PRECISION;
  END IF;

  -- Add actual_gps_lng column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkins' AND column_name = 'actual_gps_lng') THEN
    ALTER TABLE checkins ADD COLUMN actual_gps_lng DOUBLE PRECISION;
  END IF;

  -- Add note column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkins' AND column_name = 'note') THEN
    ALTER TABLE checkins ADD COLUMN note TEXT;
  END IF;

  -- Add visibility column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkins' AND column_name = 'visibility') THEN
    ALTER TABLE checkins ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends'));
  END IF;

  -- Add last_verified_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checkins' AND column_name = 'last_verified_at') THEN
    ALTER TABLE checkins ADD COLUMN last_verified_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_active ON checkins(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_checkins_expires ON checkins(expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_checkins_anchorage ON checkins(anchorage_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_checkins_location ON checkins(location_lat, location_lng) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view active public checkins" ON checkins;
DROP POLICY IF EXISTS "Anyone can view active checkins" ON checkins;
DROP POLICY IF EXISTS "Users can create their own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can update their own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can delete their own checkins" ON checkins;

-- Create RLS policies
-- Policy: Anyone can view active public check-ins (or their own)
CREATE POLICY "Anyone can view active public checkins" ON checkins
  FOR SELECT USING (
    is_active = true
    AND expires_at > now()
    AND (visibility = 'public' OR user_id = auth.uid())
  );

-- Policy: Authenticated users can create their own check-ins
CREATE POLICY "Users can create their own checkins" ON checkins
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can update their own check-ins
CREATE POLICY "Users can update their own checkins" ON checkins
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Policy: Users can delete their own check-ins
CREATE POLICY "Users can delete their own checkins" ON checkins
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Function to automatically expire old check-ins
CREATE OR REPLACE FUNCTION expire_old_checkins()
RETURNS void AS $$
BEGIN
  UPDATE checkins
  SET is_active = false, updated_at = now()
  WHERE is_active = true
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get check-in counts by anchorage
CREATE OR REPLACE FUNCTION get_anchorage_checkin_counts()
RETURNS TABLE (
  anchorage_id TEXT,
  location_name TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  checkin_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.anchorage_id,
    c.location_name,
    c.location_lat,
    c.location_lng,
    COUNT(*)::BIGINT as checkin_count
  FROM checkins c
  JOIN profiles p ON c.user_id = p.id
  WHERE c.is_active = true
    AND c.expires_at > now()
    AND c.visibility = 'public'
    AND p.is_visible = true
  GROUP BY c.anchorage_id, c.location_name, c.location_lat, c.location_lng;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON checkins TO authenticated;
GRANT EXECUTE ON FUNCTION expire_old_checkins() TO authenticated;
GRANT EXECUTE ON FUNCTION get_anchorage_checkin_counts() TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Checkins table setup complete!';
END $$;
