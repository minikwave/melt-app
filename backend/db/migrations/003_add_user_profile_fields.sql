-- Add bio and profile_image fields to users table

-- Add bio column
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add profile_image column
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add comment
COMMENT ON COLUMN users.bio IS 'User bio/introduction text';
COMMENT ON COLUMN users.profile_image IS 'URL to user profile image';
