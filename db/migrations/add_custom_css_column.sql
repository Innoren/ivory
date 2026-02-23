-- Add custom_css column to tech_websites table
-- This column was defined in schema but missing from the database

ALTER TABLE tech_websites 
ADD COLUMN IF NOT EXISTS custom_css TEXT;
