-- ============================================
-- Melt 전체 마이그레이션 (Supabase SQL Editor에서 실행)
-- ============================================
-- 이미 존재하는 컬럼/인덱스는 IF NOT EXISTS로 안전하게 처리됩니다.
-- 순서대로 실행해주세요.

-- ============================================
-- Migration 001: Add channel URLs
-- ============================================
ALTER TABLE channels ADD COLUMN IF NOT EXISTS channel_url TEXT;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS donate_url TEXT;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS charge_url TEXT;

COMMENT ON COLUMN channels.channel_url IS '치지직 채널 페이지 URL';
COMMENT ON COLUMN channels.donate_url IS '후원 딥링크 (스트리머가 등록)';
COMMENT ON COLUMN channels.charge_url IS '치즈 충전 딥링크';

-- ============================================
-- Migration 002: Add follows and reads
-- ============================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_user ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_channel ON user_follows(channel_id);

CREATE TABLE IF NOT EXISTS message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reads_user ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_reads_message ON message_reads(message_id);

-- ============================================
-- Migration 003: Add user profile fields
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

COMMENT ON COLUMN users.bio IS 'User bio/introduction text';
COMMENT ON COLUMN users.profile_image IS 'URL to user profile image';

-- ============================================
-- Migration 004: Add intended amount
-- ============================================
ALTER TABLE donation_intents ADD COLUMN IF NOT EXISTS intended_amount INTEGER;

CREATE INDEX IF NOT EXISTS idx_donation_intents_intended_amount 
ON donation_intents(intended_amount) WHERE intended_amount IS NOT NULL;

COMMENT ON COLUMN donation_intents.intended_amount IS '사용자가 Melt에서 선택한 후원 예정 금액 (원)';

-- ============================================
-- Migration 005: Add Chzzk API credentials
-- ============================================
ALTER TABLE channels
ADD COLUMN IF NOT EXISTS chzzk_client_id TEXT,
ADD COLUMN IF NOT EXISTS chzzk_client_secret TEXT,
ADD COLUMN IF NOT EXISTS chzzk_session_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chzzk_session_connected_at TIMESTAMPTZ;

ALTER TABLE donation_events
ADD COLUMN IF NOT EXISTS chzzk_donation_id TEXT,
ADD COLUMN IF NOT EXISTS chzzk_donator_channel_id TEXT,
ADD COLUMN IF NOT EXISTS chzzk_donator_nickname TEXT,
ADD COLUMN IF NOT EXISTS chzzk_donation_text TEXT,
ADD COLUMN IF NOT EXISTS chzzk_raw_data JSONB;

-- 중복 방지를 위한 UNIQUE 제약 (이미 존재하면 무시)
DO $$ 
BEGIN
  ALTER TABLE donation_events ADD CONSTRAINT donation_events_chzzk_donation_id_key UNIQUE (chzzk_donation_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_donations_chzzk_donation_id 
ON donation_events(chzzk_donation_id) WHERE chzzk_donation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donations_chzzk_donator 
ON donation_events(chzzk_donator_channel_id) WHERE chzzk_donator_channel_id IS NOT NULL;

COMMENT ON COLUMN channels.chzzk_client_id IS '치지직 Open API Client ID (NID_AUT cookie)';
COMMENT ON COLUMN channels.chzzk_client_secret IS '치지직 Open API Client Secret (NID_SES cookie)';
COMMENT ON COLUMN channels.chzzk_session_active IS '치지직 WebSocket 세션 활성 상태';
COMMENT ON COLUMN channels.chzzk_session_connected_at IS '치지직 WebSocket 세션 연결 시각';

-- ============================================
-- Migration 006: Add onboarding_complete (중요!)
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN users.onboarding_complete IS 'Whether the user has completed onboarding (role selection)';

-- 기존 크리에이터/어드민은 온보딩 완료로 설정
UPDATE users SET onboarding_complete = TRUE WHERE role IN ('creator', 'admin');

-- ============================================
-- 확인 쿼리
-- ============================================
-- 아래 쿼리로 마이그레이션이 잘 적용되었는지 확인할 수 있습니다:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'channels';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'donation_events';
