// Add default availability for tech_profile_id 30
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function addDefaultAvailability() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Adding default availability for tech_profile_id 30...\n');
  
  // Default schedule: Mon-Fri 9am-5pm
  const defaultSchedule = [
    { day: 'monday', start: '09:00', end: '17:00' },
    { day: 'tuesday', start: '09:00', end: '17:00' },
    { day: 'wednesday', start: '09:00', end: '17:00' },
    { day: 'thursday', start: '09:00', end: '17:00' },
    { day: 'friday', start: '09:00', end: '17:00' },
  ];
  
  for (const slot of defaultSchedule) {
    await sql`
      INSERT INTO tech_availability (tech_profile_id, day_of_week, start_time, end_time, is_active, created_at, updated_at)
      VALUES (30, ${slot.day}, ${slot.start}, ${slot.end}, true, NOW(), NOW())
    `;
    console.log(`Added: ${slot.day} ${slot.start} - ${slot.end}`);
  }
  
  console.log('\nDone! Verifying...');
  
  const result = await sql`SELECT * FROM tech_availability WHERE tech_profile_id = 30`;
  console.log('Availability records:', result);
}

addDefaultAvailability().catch(console.error);
