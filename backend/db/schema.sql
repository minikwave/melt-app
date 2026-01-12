-- Melt Database Schema
-- PostgreSQL

-- 1) ENUMs
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('viewer', 'creator', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE message_type AS ENUM ('donation', 'dm', 'creator_post', 'creator_reply');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE visibility AS ENUM ('public', 'private');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE donation_status AS ENUM ('PENDING', 'OCCURRED', 'CONFIRMED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE donation_source AS ENUM ('user_flow', 'manual', 'session');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) users
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chzzk_user_id   TEXT UNIQUE NOT NULL,
  display_name    TEXT,
  role            user_role NOT NULL DEFAULT 'viewer',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_chzzk_user_id ON users(chzzk_user_id);

-- 3) channels
CREATE TABLE IF NOT EXISTS channels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chzzk_channel_id TEXT UNIQUE NOT NULL,
  name            TEXT,
  owner_user_id   UUID REFERENCES users(id),
  channel_url     TEXT,  -- 치지직 채널 페이지 URL
  donate_url      TEXT,  -- 후원 딥링크 (스트리머가 등록)
  charge_url      TEXT,  -- 치즈 충전 딥링크 (기본값: https://game.naver.com/profile#cash)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_channels_owner ON channels(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_channels_chzzk_id ON channels(chzzk_channel_id);

-- 4) oauth_tokens
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token  TEXT NOT NULL,
  refresh_token TEXT,
  expires_at    TIMESTAMPTZ,
  scope         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_oauth_tokens_user ON oauth_tokens(user_id);

-- 5) donation_intents
CREATE TABLE IF NOT EXISTS donation_intents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_user_id  UUID NOT NULL REFERENCES users(id),
  channel_id      UUID NOT NULL REFERENCES channels(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intents_viewer ON donation_intents(viewer_user_id);
CREATE INDEX IF NOT EXISTS idx_intents_channel ON donation_intents(channel_id);

-- 6) donation_events
CREATE TABLE IF NOT EXISTS donation_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id       UUID REFERENCES donation_intents(id),
  channel_id      UUID NOT NULL REFERENCES channels(id),
  viewer_user_id  UUID REFERENCES users(id),
  amount          BIGINT,
  status          donation_status NOT NULL DEFAULT 'OCCURRED',
  source          donation_source NOT NULL DEFAULT 'user_flow',
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at    TIMESTAMPTZ,
  confirmed_by   UUID REFERENCES users(id),
  note            TEXT
);

CREATE INDEX IF NOT EXISTS idx_donations_channel_time ON donation_events(channel_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_viewer ON donation_events(viewer_user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donation_events(status);

-- 7) messages
CREATE TABLE IF NOT EXISTS messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id          UUID NOT NULL REFERENCES channels(id),
  author_user_id      UUID NOT NULL REFERENCES users(id),
  type                message_type NOT NULL,
  visibility          visibility NOT NULL,
  content             TEXT NOT NULL,
  related_donation_id UUID REFERENCES donation_events(id),
  reply_to_message_id UUID REFERENCES messages(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_channel_time ON messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_author ON messages(author_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_visibility ON messages(visibility);

-- 8) retweets
CREATE TABLE IF NOT EXISTS retweets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id      UUID NOT NULL REFERENCES channels(id),
  message_id       UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_retweet_message ON retweets(message_id);
CREATE INDEX IF NOT EXISTS idx_retweets_channel ON retweets(channel_id);

-- 9) badges (Phase 2)
CREATE TABLE IF NOT EXISTS badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id      UUID NOT NULL REFERENCES channels(id),
  tier            TEXT NOT NULL,
  threshold_amount BIGINT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel_id, tier)
);

-- 10) user_badges (Phase 2)
CREATE TABLE IF NOT EXISTS user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  channel_id  UUID NOT NULL REFERENCES channels(id),
  badge_id    UUID NOT NULL REFERENCES badges(id),
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_channel ON user_badges(user_id, channel_id);

-- 11) user_follows (시청자가 팔로우하는 채널)
CREATE TABLE IF NOT EXISTS user_follows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id      UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_user ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_channel ON user_follows(channel_id);

-- 12) message_reads (메시지 읽음 상태)
CREATE TABLE IF NOT EXISTS message_reads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reads_user ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_reads_message ON message_reads(message_id);
