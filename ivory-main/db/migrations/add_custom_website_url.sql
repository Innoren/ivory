-- Add custom website URL field to tech_profiles
ALTER TABLE tech_profiles ADD COLUMN custom_website_url VARCHAR(500);

-- Set custom website URL for tysnailboutique@outlook.com
UPDATE tech_profiles 
SET custom_website_url = 'https://tnb.ivoryschoice.com'
WHERE user_id = (
  SELECT id FROM users WHERE email = 'tysnailboutique@outlook.com'
);
