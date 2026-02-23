const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Adding custom_website_url field to tech_profiles...\n');
  
  try {
    // Add custom_website_url column
    await sql`
      ALTER TABLE tech_profiles 
      ADD COLUMN IF NOT EXISTS custom_website_url VARCHAR(500)
    `;
    console.log('✓ Added custom_website_url column to tech_profiles');

    // Set custom website URL for tysnailboutique@outlook.com
    const result = await sql`
      UPDATE tech_profiles 
      SET custom_website_url = 'https://tnb.ivoryschoice.com'
      WHERE user_id = (
        SELECT id FROM users WHERE email = 'tysnailboutique@outlook.com'
      )
      RETURNING id
    `;
    
    if (result.length > 0) {
      console.log('✓ Set custom website URL for tysnailboutique@outlook.com');
    } else {
      console.log('⚠ User tysnailboutique@outlook.com not found (will be set when user exists)');
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
