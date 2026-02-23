const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Adding custom_css column to tech_websites...\n');
  
  try {
    await sql`
      ALTER TABLE tech_websites 
      ADD COLUMN IF NOT EXISTS custom_css TEXT
    `;
    console.log('✓ Added custom_css column to tech_websites');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
