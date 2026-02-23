-- SQL Script to replace custom website builder with external website URL
-- for user: tysnailboutique (tysnailboutique@outlook.com)
-- External website: https://tnb.ivoryschoice.com

-- Step 1: Update the website field in tech_profiles
UPDATE tech_profiles
SET 
  website = 'https://tnb.ivoryschoice.com',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM users 
  WHERE username = 'tysnailboutique' 
  AND email = 'tysnailboutique@outlook.com'
);

-- Step 2: Unpublish the custom website builder (if exists)
-- This preserves the data but makes it inactive
UPDATE tech_websites
SET 
  is_published = false,
  updated_at = NOW()
WHERE tech_profile_id = (
  SELECT id FROM tech_profiles 
  WHERE user_id = (
    SELECT id FROM users 
    WHERE username = 'tysnailboutique' 
    AND email = 'tysnailboutique@outlook.com'
  )
);

-- Verification queries (run these to confirm changes)
-- SELECT 
--   u.username,
--   u.email,
--   tp.website,
--   tw.subdomain,
--   tw.is_published
-- FROM users u
-- LEFT JOIN tech_profiles tp ON tp.user_id = u.id
-- LEFT JOIN tech_websites tw ON tw.tech_profile_id = tp.id
-- WHERE u.username = 'tysnailboutique';
