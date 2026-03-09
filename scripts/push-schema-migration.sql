-- Push Subscriptions Schema Migration
-- Run manually in Supabase SQL Editor.
-- Adds multi-channel support (web, apns) so a single user can have
-- one subscription per channel without overwriting the other.

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'web';

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS device_token text;

-- Drop the old unique constraint (user_id, subscription) if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'push_subscriptions_user_id_subscription_key'
      AND contype = 'u'
  ) THEN
    ALTER TABLE push_subscriptions
      DROP CONSTRAINT push_subscriptions_user_id_subscription_key;
  END IF;
END $$;

-- One subscription per user per channel
ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_user_channel_unique
  UNIQUE (user_id, channel);

-- Clear stale device_token values on existing web rows
UPDATE push_subscriptions
  SET device_token = NULL
  WHERE channel = 'web' AND device_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_channel
  ON push_subscriptions(channel);
