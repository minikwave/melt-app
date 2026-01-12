-- Migration: Add user_follows and message_reads tables
-- Date: 2024-01-01

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
