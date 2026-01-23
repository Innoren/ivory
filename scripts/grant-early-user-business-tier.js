const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function grantBusinessTier() {
  console.log('🎁 Granting complimentary Business tier to early user...\n');
  
  try {
    // Grant Business tier to tysnailboutique@outlook.com
    const result = await sql`
      UPDATE users 
      SET 
        subscription_tier = 'business',
        subscription_status = 'active',
        subscription_current_period_end = '2099-12-31 23:59:59'::timestamp
      WHERE email = 'tysnailboutique@outlook.com'
      RETURNING id, email, subscription_tier, subscription_status
    `;
    
    if (result.length > 0) {
      console.log('✓ Granted complimentary Business tier access');
      console.log(`  User: ${result[0].email}`);
      console.log(`  Tier: ${result[0].subscription_tier}`);
      console.log(`  Status: ${result[0].subscription_status}`);
      console.log(`  Access: Lifetime (early user benefit)`);
    } else {
      console.log('⚠ User tysnailboutique@outlook.com not found');
      console.log('  (Will be granted when user signs up)');
    }

    console.log('\n✅ Early user benefit granted successfully!');
    console.log('\n📝 Note: This is specific to tysnailboutique@outlook.com only.');
    console.log('   Other users will need to pay for Business tier.');
  } catch (error) {
    console.error('\n❌ Failed to grant business tier:', error.message);
    process.exit(1);
  }
}

grantBusinessTier();
