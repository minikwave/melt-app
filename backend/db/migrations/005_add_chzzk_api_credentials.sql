-- 치지직 Open API 연동을 위한 크리에이터 자격 증명 저장
-- 크리에이터가 자신의 채널에서 도네이션 이벤트를 수신하기 위해 필요

-- channels 테이블에 API 자격 증명 컬럼 추가
ALTER TABLE channels
ADD COLUMN IF NOT EXISTS chzzk_client_id TEXT,
ADD COLUMN IF NOT EXISTS chzzk_client_secret TEXT,
ADD COLUMN IF NOT EXISTS chzzk_session_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chzzk_session_connected_at TIMESTAMPTZ;

-- donation_events에 치지직 원본 데이터 저장 컬럼 추가
ALTER TABLE donation_events
ADD COLUMN IF NOT EXISTS chzzk_donation_id TEXT UNIQUE,  -- 치지직에서 받은 고유 ID (중복 방지)
ADD COLUMN IF NOT EXISTS chzzk_donator_channel_id TEXT,  -- 후원자의 치지직 채널 ID
ADD COLUMN IF NOT EXISTS chzzk_donator_nickname TEXT,    -- 후원자 닉네임 (치지직 기준)
ADD COLUMN IF NOT EXISTS chzzk_donation_text TEXT,       -- 후원 메시지 (치지직 기준)
ADD COLUMN IF NOT EXISTS chzzk_raw_data JSONB;           -- 치지직에서 받은 원본 JSON

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_donations_chzzk_donation_id 
ON donation_events(chzzk_donation_id) WHERE chzzk_donation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_donations_chzzk_donator 
ON donation_events(chzzk_donator_channel_id) WHERE chzzk_donator_channel_id IS NOT NULL;

-- 코멘트
COMMENT ON COLUMN channels.chzzk_client_id IS '치지직 Open API Client ID';
COMMENT ON COLUMN channels.chzzk_client_secret IS '치지직 Open API Client Secret (암호화 저장 권장)';
COMMENT ON COLUMN channels.chzzk_session_active IS '치지직 WebSocket 세션 활성 상태';
COMMENT ON COLUMN channels.chzzk_session_connected_at IS '치지직 WebSocket 세션 연결 시각';

COMMENT ON COLUMN donation_events.chzzk_donation_id IS '치지직에서 받은 도네이션 고유 ID';
COMMENT ON COLUMN donation_events.chzzk_donator_channel_id IS '후원자의 치지직 채널 ID';
COMMENT ON COLUMN donation_events.chzzk_donator_nickname IS '후원자 닉네임 (치지직 기준)';
COMMENT ON COLUMN donation_events.chzzk_donation_text IS '후원 메시지 (치지직 기준)';
COMMENT ON COLUMN donation_events.chzzk_raw_data IS '치지직에서 받은 원본 JSON 데이터';
