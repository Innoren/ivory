// Debug script to check availability data for tech_profile_id 30
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function debugAvailability() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('=== Debugging Availability for Tech Profile ID 30 ===\n');
  
  // Check tech_availability table for tech_profile_id 30
  console.log('1. Checking tech_availability table for tech_profile_id = 30:');
  const availability = await sql`
    SELECT * FROM tech_availability WHERE tech_profile_id = 30
  `;
  console.log('Results:', availability);
  console.log('Count:', availability.length);
  
  // Check all records in tech_availability
  console.log('\n2. All records in tech_availability table:');
  const allAvailability = await sql`
    SELECT * FROM tech_availability ORDER BY tech_profile_id, day_of_week
  `;
  console.log('Results:', allAvailability);
  console.log('Total count:', allAvailability.length);
  
  // Check tech_profiles to verify the mapping
  console.log('\n3. Tech profile for user_id = 106:');
  const techProfile = await sql`
    SELECT * FROM tech_profiles WHERE user_id = 106
  `;
  console.log('Results:', techProfile);
  
  // Check if there's availability for any tech_profile_id
  console.log('\n4. Distinct tech_profile_ids with availability:');
  const distinctProfiles = await sql`
    SELECT DISTINCT tech_profile_id FROM tech_availability
  `;
  console.log('Results:', distinctProfiles);
  
  // Check the tech_websites table
  console.log('\n5. Tech website for tech_profile_id = 30:');
  const website = await sql`
    SELECT * FROM tech_websites WHERE tech_profile_id = 30
  `;
  console.log('Results:', website);
}

debugAvailability().catch(console.error);
