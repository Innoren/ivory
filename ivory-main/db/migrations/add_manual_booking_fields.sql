-- Add manual booking/invite fields to bookings table
-- Run this migration to enable manual appointment creation by nail techs

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS invite_token VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS invited_client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS invited_client_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_manual_booking BOOLEAN DEFAULT FALSE;

-- Create index for faster invite token lookups
CREATE INDEX IF NOT EXISTS idx_bookings_invite_token ON bookings(invite_token);

-- Create index for finding pending invites
CREATE INDEX IF NOT EXISTS idx_bookings_manual_pending ON bookings(is_manual_booking, payment_status) 
WHERE is_manual_booking = TRUE AND payment_status = 'pending';
