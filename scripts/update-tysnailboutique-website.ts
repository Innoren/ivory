/**
 * Script to replace custom website builder with external website URL
 * for user: tysnailboutique
 * 
 * Usage:
 *   yarn update:tysnailboutique
 *   OR
 *   DATABASE_URL="your-db-url" yarn update:tysnailboutique
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import { users, techProfiles, techWebsites } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const TARGET_USERNAME = 'tysnailboutique';
const TARGET_EMAIL = 'tysnailboutique@outlook.com';
const EXTERNAL_WEBSITE = 'https://tnb.ivoryschoice.com';

async function updateWebsite() {
  try {
    // Get DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl || databaseUrl === 'postgresql://user:password@host/database?sslmode=require') {
      console.error('❌ DATABASE_URL environment variable is not set or is using placeholder value');
      console.error('');
      console.error('Please run with:');
      console.error('  DATABASE_URL="your-actual-database-url" yarn update:tysnailboutique');
      console.error('');
      console.error('Or update your .env.local file with the actual DATABASE_URL');
      console.error('');
      console.error('Alternatively, you can run the SQL script directly:');
      console.error('  scripts/update-tysnailboutique-website-sql.sql');
      process.exit(1);
    }

    // Initialize database connection
    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });

    console.log('🔍 Finding user:', TARGET_USERNAME);
    
    // Find the user
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.username, TARGET_USERNAME),
        eq(users.email, TARGET_EMAIL)
      ),
    });

    if (!user) {
      console.error('❌ User not found with username:', TARGET_USERNAME, 'and email:', TARGET_EMAIL);
      process.exit(1);
    }

    console.log('✅ Found user:', user.username, '(ID:', user.id + ')');

    // Find tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, user.id),
    });

    if (!techProfile) {
      console.error('❌ Tech profile not found for user:', user.username);
      process.exit(1);
    }

    console.log('✅ Found tech profile (ID:', techProfile.id + ')');
    console.log('   Current website:', techProfile.website || '(none)');

    // Update the website field in tech profile
    console.log('📝 Updating website URL to:', EXTERNAL_WEBSITE);
    await db
      .update(techProfiles)
      .set({
        website: EXTERNAL_WEBSITE,
        updatedAt: new Date(),
      })
      .where(eq(techProfiles.id, techProfile.id));

    console.log('✅ Updated tech profile website field');

    // Check if custom website builder exists
    const customWebsite = await db.query.techWebsites.findFirst({
      where: eq(techWebsites.techProfileId, techProfile.id),
    });

    if (customWebsite) {
      console.log('🔍 Found custom website builder');
      console.log('   Subdomain:', customWebsite.subdomain);
      console.log('   Currently published:', customWebsite.isPublished);
      console.log('📝 Unpublishing custom website builder...');
      
      // Unpublish the custom website instead of deleting it (preserves data)
      await db
        .update(techWebsites)
        .set({
          isPublished: false,
          updatedAt: new Date(),
        })
        .where(eq(techWebsites.id, customWebsite.id));

      console.log('✅ Custom website builder unpublished (data preserved)');
    } else {
      console.log('ℹ️  No custom website builder found');
    }

    console.log('\n✨ Success! Website updated for', TARGET_USERNAME);
    console.log('   External website:', EXTERNAL_WEBSITE);
    console.log('   Custom builder:', customWebsite ? 'unpublished' : 'none');
    
  } catch (error) {
    console.error('❌ Error updating website:', error);
    process.exit(1);
  }
}

updateWebsite();
