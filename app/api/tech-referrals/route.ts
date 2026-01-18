import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles, users, techReferralEarnings, bookings } from '@/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { nanoid } from 'nanoid';

// Generate unique tech referral code
function generateTechReferralCode(): string {
  return `TECH-${nanoid(8).toUpperCase()}`;
}

// GET - Get tech referral stats and link
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('session')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, payload.userId),
      with: {
        user: true,
      },
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // Check if Stripe Connect is set up (required for referral program)
    const stripeSetupComplete = techProfile.payoutsEnabled && techProfile.stripeAccountStatus === 'active';

    // Generate referral code if not exists
    let referralCode = techProfile.techReferralCode;
    if (!referralCode && stripeSetupComplete) {
      referralCode = generateTechReferralCode();
      await db.update(techProfiles)
        .set({ techReferralCode: referralCode })
        .where(eq(techProfiles.id, techProfile.id));
    }

    // Get referral stats
    const referredTechs = await db.query.techProfiles.findMany({
      where: eq(techProfiles.referredByTechId, techProfile.id),
      with: {
        user: {
          columns: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Get earnings breakdown
    const earnings = await db.query.techReferralEarnings.findMany({
      where: eq(techReferralEarnings.referrerTechId, techProfile.id),
      orderBy: desc(techReferralEarnings.createdAt),
      limit: 20,
    });

    const totalEarnings = parseFloat(techProfile.totalReferralEarnings?.toString() || '0');
    const pendingEarnings = parseFloat(techProfile.pendingReferralEarnings?.toString() || '0');

    return NextResponse.json({
      referralCode,
      stripeSetupComplete,
      stats: {
        totalReferrals: referredTechs.length,
        totalEarnings,
        pendingEarnings,
        referredTechs: referredTechs.map(t => ({
          id: t.id,
          businessName: t.businessName,
          username: (t.user as any)?.username,
          avatar: (t.user as any)?.avatar,
          joinedAt: t.createdAt,
        })),
      },
      recentEarnings: earnings.map(e => ({
        id: e.id,
        amount: parseFloat(e.referralAmount?.toString() || '0'),
        bookingTotal: parseFloat(e.bookingTotal?.toString() || '0'),
        status: e.status,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching tech referral stats:', error);
    return NextResponse.json({ error: 'Failed to fetch referral stats' }, { status: 500 });
  }
}
