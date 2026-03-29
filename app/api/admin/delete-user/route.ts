import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import {
  users, techProfiles, services, techAvailability, techTimeOff,
  portfolioImages, reviews, bookings, bookingMessages, designRequests,
  designRequestMessages, looks, likes, dislikes, favorites, aiGenerations,
  sessions, notifications, referrals, creditTransactions, contentFlags,
  blockedUsers, generationJobs, collections, savedDesigns, techReferralEarnings,
  techWebsites, websiteSections, websiteChatHistory
} from '@/db/schema'
import { eq, or } from 'drizzle-orm'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'ivories-admin-secret'

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username, userId } = await request.json()

    if (!username && !userId) {
      return NextResponse.json({ error: 'username or userId required' }, { status: 400 })
    }

    // Find the user
    const user = await db.query.users.findFirst({
      where: username
        ? eq(users.username, username)
        : eq(users.id, parseInt(userId)),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const uid = user.id

    // Get tech profile if exists
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, uid),
    })

    if (techProfile) {
      const tpId = techProfile.id

      // Delete tech website data
      const website = await db.query.techWebsites.findFirst({
        where: eq(techWebsites.techProfileId, tpId),
      })
      if (website) {
        await db.delete(websiteChatHistory).where(eq(websiteChatHistory.websiteId, website.id))
        await db.delete(websiteSections).where(eq(websiteSections.websiteId, website.id))
        await db.delete(techWebsites).where(eq(techWebsites.techProfileId, tpId))
      }

      // Delete tech referral earnings
      await db.delete(techReferralEarnings).where(eq(techReferralEarnings.referrerTechId, tpId))
      await db.delete(techReferralEarnings).where(eq(techReferralEarnings.referredTechId, tpId))

      // Delete booking messages for tech's bookings
      const techBookings = await db.query.bookings.findMany({
        where: eq(bookings.techProfileId, tpId),
      })
      for (const booking of techBookings) {
        await db.delete(bookingMessages).where(eq(bookingMessages.bookingId, booking.id))
      }

      // Delete bookings
      await db.delete(bookings).where(eq(bookings.techProfileId, tpId))

      // Delete design requests to this tech
      const techDesignRequests = await db.query.designRequests.findMany({
        where: eq(designRequests.techProfileId, tpId),
      })
      for (const dr of techDesignRequests) {
        await db.delete(designRequestMessages).where(eq(designRequestMessages.designRequestId, dr.id))
      }
      await db.delete(designRequests).where(eq(designRequests.techProfileId, tpId))

      // Delete reviews
      await db.delete(reviews).where(eq(reviews.techProfileId, tpId))

      // Delete portfolio images
      await db.delete(portfolioImages).where(eq(portfolioImages.techProfileId, tpId))

      // Delete availability & time off
      await db.delete(techAvailability).where(eq(techAvailability.techProfileId, tpId))
      await db.delete(techTimeOff).where(eq(techTimeOff.techProfileId, tpId))

      // Delete services
      await db.delete(services).where(eq(services.techProfileId, tpId))

      // Delete tech profile
      await db.delete(techProfiles).where(eq(techProfiles.id, tpId))
    }

    // Delete client bookings
    const clientBookings = await db.query.bookings.findMany({
      where: eq(bookings.clientId, uid),
    })
    for (const booking of clientBookings) {
      await db.delete(bookingMessages).where(eq(bookingMessages.bookingId, booking.id))
    }
    await db.delete(bookings).where(eq(bookings.clientId, uid))

    // Delete design request messages for user's requests
    const userDesignRequests = await db.query.designRequests.findMany({
      where: eq(designRequests.clientId, uid),
    })
    for (const dr of userDesignRequests) {
      await db.delete(designRequestMessages).where(eq(designRequestMessages.designRequestId, dr.id))
    }
    await db.delete(designRequests).where(eq(designRequests.clientId, uid))

    // Delete looks and related
    const userLooks = await db.query.looks.findMany({ where: eq(looks.userId, uid) })
    for (const look of userLooks) {
      await db.delete(likes).where(eq(likes.lookId, look.id))
      await db.delete(dislikes).where(eq(dislikes.lookId, look.id))
    }
    await db.delete(looks).where(eq(looks.userId, uid))

    // Delete collections and saved designs
    await db.delete(savedDesigns).where(eq(savedDesigns.userId, uid))
    await db.delete(collections).where(eq(collections.userId, uid))

    // Delete other user data
    await db.delete(likes).where(eq(likes.userId, uid))
    await db.delete(dislikes).where(eq(dislikes.userId, uid))
    await db.delete(favorites).where(eq(favorites.userId, uid))
    await db.delete(aiGenerations).where(eq(aiGenerations.userId, uid))
    await db.delete(sessions).where(eq(sessions.userId, uid))
    await db.delete(notifications).where(eq(notifications.userId, uid))
    await db.delete(referrals).where(or(eq(referrals.referrerId, uid), eq(referrals.referredId, uid)))
    await db.delete(creditTransactions).where(eq(creditTransactions.userId, uid))
    await db.delete(contentFlags).where(eq(contentFlags.reporterId, uid))
    await db.delete(blockedUsers).where(or(eq(blockedUsers.blockerId, uid), eq(blockedUsers.blockedId, uid)))
    await db.delete(generationJobs).where(eq(generationJobs.userId, uid))
    await db.delete(reviews).where(eq(reviews.clientId, uid))

    // Finally delete the user
    await db.delete(users).where(eq(users.id, uid))

    return NextResponse.json({
      success: true,
      message: `User "${user.username}" (ID: ${uid}) has been deleted.`,
    })
  } catch (error: any) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 })
  }
}

// GET - Look up a user by username
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET || 'ivories-admin-secret'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  const userId = searchParams.get('userId')

  if (!username && !userId) {
    return NextResponse.json({ error: 'username or userId required' }, { status: 400 })
  }

  const user = await db.query.users.findFirst({
    where: username ? eq(users.username, username) : eq(users.id, parseInt(userId!)),
    with: { techProfile: true } as any,
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ user })
}
