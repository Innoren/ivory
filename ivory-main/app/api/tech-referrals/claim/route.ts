import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

// POST - Claim a tech referral (called when a new tech signs up with referral code)
export async function POST(request: NextRequest) {
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

    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }

    // Find the referrer tech by code
    const referrerTech = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.techReferralCode, referralCode.toUpperCase()),
      with: {
        user: true,
      },
    });

    if (!referrerTech) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Get the new tech's profile
    const newTechProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, payload.userId),
    });

    if (!newTechProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // Check if already referred
    if (newTechProfile.referredByTechId) {
      return NextResponse.json({ error: 'Already referred by another tech' }, { status: 400 });
    }

    // Can't refer yourself
    if (referrerTech.userId === payload.userId) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
    }

    // Update the new tech's profile with referrer
    await db.update(techProfiles)
      .set({ referredByTechId: referrerTech.id })
      .where(eq(techProfiles.id, newTechProfile.id));

    return NextResponse.json({
      success: true,
      referrerName: referrerTech.businessName || (referrerTech.user as any)?.username,
      message: `You were referred by ${referrerTech.businessName || (referrerTech.user as any)?.username}! They'll earn 5% of your booking fees.`,
    });
  } catch (error) {
    console.error('Error claiming tech referral:', error);
    return NextResponse.json({ error: 'Failed to claim referral' }, { status: 500 });
  }
}
