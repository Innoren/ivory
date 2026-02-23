-- Tech Referral Program Migration
-- Allows nail techs to refer other techs and earn 5% of their bookings

-- Add referral fields to tech_profiles
ALTER TABLE tech_profiles 
ADD COLUMN IF NOT EXISTS tech_referral_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_tech_id INTEGER REFERENCES tech_profiles(id),
ADD COLUMN IF NOT EXISTS total_referral_earnings DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_referral_earnings DECIMAL(10, 2) DEFAULT 0;

-- Create tech referral earnings tracking table
CREATE TABLE IF NOT EXISTS tech_referral_earnings (
  id SERIAL PRIMARY KEY,
  referrer_tech_id INTEGER NOT NULL REFERENCES tech_profiles(id),
  referred_tech_id INTEGER NOT NULL REFERENCES tech_profiles(id),
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  booking_total DECIMAL(10, 2) NOT NULL,
  referral_amount DECIMAL(10, 2) NOT NULL, -- 5% of service price
  status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- pending, paid, cancelled
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add referrer tracking to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS referrer_tech_id INTEGER REFERENCES tech_profiles(id),
ADD COLUMN IF NOT EXISTS referral_fee DECIMAL(10, 2) DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tech_referral_earnings_referrer ON tech_referral_earnings(referrer_tech_id);
CREATE INDEX IF NOT EXISTS idx_tech_referral_earnings_referred ON tech_referral_earnings(referred_tech_id);
CREATE INDEX IF NOT EXISTS idx_tech_profiles_referral_code ON tech_profiles(tech_referral_code);
