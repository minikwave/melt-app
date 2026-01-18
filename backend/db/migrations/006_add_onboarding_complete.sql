-- Add onboarding_complete column to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Comment
COMMENT ON COLUMN users.onboarding_complete IS 'Whether the user has completed onboarding (role selection)';

-- Update existing users to have onboarding complete if they have a role set
UPDATE users SET onboarding_complete = TRUE WHERE role IS NOT NULL AND role != 'viewer';
