-- Add DOB and phone verification fields to users table
-- Run this migration to add personal phone number and date of birth fields

-- Add date of birth field
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP;

-- Add phone number field (E.164 format, e.g., +14155551234)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Add phone verification status
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Add phone verification code (6-digit OTP)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(6);

-- Add phone verification expiration timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_expires TIMESTAMP;

-- Create index on phone number for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
