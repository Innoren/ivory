import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, code, userId, storedOtp, storedExpires } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json({ error: 'Phone number and code are required' }, { status: 400 });
    }

    // If userId is provided, verify against stored code in database
    if (userId) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (user.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const userData = user[0];

      // Check if code matches and hasn't expired
      if (userData.phoneVerificationCode !== code) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }

      if (userData.phoneVerificationExpires && new Date(userData.phoneVerificationExpires) < new Date()) {
        return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
      }

      // Mark phone as verified
      await db
        .update(users)
        .set({
          phoneVerified: true,
          phoneVerificationCode: null,
          phoneVerificationExpires: null,
        })
        .where(eq(users.id, userId));

      return NextResponse.json({ 
        success: true, 
        message: 'Phone number verified successfully' 
      });
    }

    // For signup flow (before user exists), verify against provided stored values
    if (storedOtp && storedExpires) {
      if (storedOtp !== code) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }

      if (new Date(storedExpires) < new Date()) {
        return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Phone number verified',
        verified: true 
      });
    }

    return NextResponse.json({ error: 'Missing verification data' }, { status: 400 });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
