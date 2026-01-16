-- Add savedDesignId and imageUrl columns to design_requests table
-- Also make lookId nullable to support saved designs

-- Make lookId nullable
ALTER TABLE design_requests ALTER COLUMN look_id DROP NOT NULL;

-- Add savedDesignId column
ALTER TABLE design_requests ADD COLUMN IF NOT EXISTS saved_design_id INTEGER;

-- Add imageUrl column for direct image sharing
ALTER TABLE design_requests ADD COLUMN IF NOT EXISTS image_url TEXT;
