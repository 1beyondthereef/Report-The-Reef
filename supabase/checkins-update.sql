-- =====================================================
-- CHECKINS TABLE UPDATE - Enhanced Check-in System
-- Run this in Supabase SQL Editor after connect-tables.sql
-- =====================================================

-- Add new columns to checkins table
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'friends'));
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS is_custom_location boolean DEFAULT false;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS anchorage_id text;

-- Create index for anchorage-based queries
CREATE INDEX IF NOT EXISTS idx_checkins_anchorage ON checkins(anchorage_id) WHERE is_active = true;

-- Update RLS policy to handle visibility (public vs friends)
-- For now, we'll keep it simple - public shows to all, friends feature TBD
DROP POLICY IF EXISTS "Anyone can view active checkins" ON checkins;
CREATE POLICY "Anyone can view active public checkins" ON checkins
  FOR SELECT USING (
    is_active = true
    AND expires_at > now()
    AND (visibility = 'public' OR user_id = auth.uid())
  );

-- Function to get checkin counts by anchorage
CREATE OR REPLACE FUNCTION get_anchorage_checkin_counts()
RETURNS TABLE (
  anchorage_id text,
  location_name text,
  location_lat double precision,
  location_lng double precision,
  checkin_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.anchorage_id,
    c.location_name,
    c.location_lat,
    c.location_lng,
    COUNT(*)::bigint as checkin_count
  FROM checkins c
  JOIN profiles p ON c.user_id = p.id
  WHERE c.is_active = true
    AND c.expires_at > now()
    AND c.visibility = 'public'
    AND p.is_visible = true
  GROUP BY c.anchorage_id, c.location_name, c.location_lat, c.location_lng;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
