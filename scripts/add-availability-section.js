const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addAvailabilitySection() {
  console.log('🚀 Adding availability section to existing websites...\n');
  
  try {
    // Get all websites
    const websites = await sql`SELECT id FROM tech_websites`;
    console.log(`Found ${websites.length} websites`);

    for (const website of websites) {
      // Check if availability section exists
      const existing = await sql`
        SELECT id FROM website_sections 
        WHERE website_id = ${website.id} AND section_type = 'availability'
      `;

      if (existing.length === 0) {
        // Get max display order
        const maxOrder = await sql`
          SELECT COALESCE(MAX(display_order), 0) as max_order 
          FROM website_sections 
          WHERE website_id = ${website.id}
        `;
        
        const newOrder = maxOrder[0].max_order + 1;

        // Insert availability section before booking
        await sql`
          INSERT INTO website_sections (website_id, section_type, display_order, is_visible, settings, created_at, updated_at)
          VALUES (${website.id}, 'availability', 5, true, '{}', NOW(), NOW())
        `;
        
        // Update display orders for sections after availability
        await sql`
          UPDATE website_sections 
          SET display_order = display_order + 1 
          WHERE website_id = ${website.id} 
          AND section_type IN ('booking', 'contact', 'social')
          AND display_order >= 5
        `;

        console.log(`✓ Added availability section to website ${website.id}`);
      } else {
        console.log(`- Website ${website.id} already has availability section`);
      }
    }

    // Also add social section if missing
    for (const website of websites) {
      const existing = await sql`
        SELECT id FROM website_sections 
        WHERE website_id = ${website.id} AND section_type = 'social'
      `;

      if (existing.length === 0) {
        await sql`
          INSERT INTO website_sections (website_id, section_type, display_order, is_visible, settings, created_at, updated_at)
          VALUES (${website.id}, 'social', 8, true, '{}', NOW(), NOW())
        `;
        console.log(`✓ Added social section to website ${website.id}`);
      }
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

addAvailabilitySection();
