-- Tech Websites - Main website configuration
CREATE TABLE IF NOT EXISTS tech_websites (
  id SERIAL PRIMARY KEY,
  tech_profile_id INTEGER NOT NULL REFERENCES tech_profiles(id) ON DELETE CASCADE,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT true,
  primary_color VARCHAR(7) DEFAULT '#1A1A1A',
  secondary_color VARCHAR(7) DEFAULT '#8B7355',
  accent_color VARCHAR(7) DEFAULT '#F5F5F5',
  font_family VARCHAR(100) DEFAULT 'Inter',
  custom_css TEXT,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Website Sections - Modular page sections
DO $$ BEGIN
  CREATE TYPE website_section_type AS ENUM (
    'hero', 'about', 'services', 'gallery', 'reviews', 
    'booking', 'contact', 'social', 'faq', 'custom'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS website_sections (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES tech_websites(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  title VARCHAR(255),
  subtitle TEXT,
  content TEXT,
  background_image TEXT,
  background_color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Website Chat History - AI chat messages for website customization
CREATE TABLE IF NOT EXISTS website_chat_history (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES tech_websites(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  changes_made JSONB, -- What changes the AI made
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tech_websites_subdomain ON tech_websites(subdomain);
CREATE INDEX IF NOT EXISTS idx_tech_websites_tech_profile ON tech_websites(tech_profile_id);
CREATE INDEX IF NOT EXISTS idx_website_sections_website ON website_sections(website_id);
CREATE INDEX IF NOT EXISTS idx_website_sections_order ON website_sections(website_id, display_order);
CREATE INDEX IF NOT EXISTS idx_website_chat_history_website ON website_chat_history(website_id);
