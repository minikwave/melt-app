-- 후원 의도 금액 저장을 위한 컬럼 추가
-- 사용자가 Melt에서 선택한 금액을 저장

ALTER TABLE donation_intents
ADD COLUMN IF NOT EXISTS intended_amount INTEGER;

-- 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_donation_intents_intended_amount 
ON donation_intents(intended_amount) WHERE intended_amount IS NOT NULL;

COMMENT ON COLUMN donation_intents.intended_amount IS '사용자가 Melt에서 선택한 후원 예정 금액 (원)';
