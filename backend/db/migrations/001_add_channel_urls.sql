-- Migration: Add channel URLs (channel_url, donate_url, charge_url)
-- Date: 2024-01-01

-- Add new columns to channels table
ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS channel_url TEXT,
ADD COLUMN IF NOT EXISTS donate_url TEXT,
ADD COLUMN IF NOT EXISTS charge_url TEXT DEFAULT 'https://game.naver.com/profile#cash';

-- Update existing channels with default channel_url
UPDATE channels 
SET channel_url = 'https://chzzk.naver.com/live/' || chzzk_channel_id
WHERE channel_url IS NULL;

-- Update existing channels with default charge_url if null
UPDATE channels 
SET charge_url = 'https://game.naver.com/profile#cash'
WHERE charge_url IS NULL;
