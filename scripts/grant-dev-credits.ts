// Script to grant credits to developer accounts
// Usage: npx tsx scripts/grant-dev-credits.ts <username> <credits>

import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

async function grantCredits(username: string, creditsToAdd: number) {
  try {
    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (!user) {
      console.error(`❌ User '${username}' not found`)
      process.exit(1)
    }

    // Update credits
    const newBalance = (user.credits || 0) + creditsToAdd
    await db
      .update(users)
      .set({ credits: newBalance })
      .where(eq(users.id, user.id))

    console.log(`✅ Granted ${creditsToAdd} credits to ${username}`)
    console.log(`💰 New balance: ${newBalance} credits`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const username = process.argv[2]
const credits = parseInt(process.argv[3])

if (!username || !credits || isNaN(credits)) {
  console.error('Usage: npx tsx scripts/grant-dev-credits.ts <username> <credits>')
  console.error('Example: npx tsx scripts/grant-dev-credits.ts JustinDev 10000')
  process.exit(1)
}

grantCredits(username, credits)
