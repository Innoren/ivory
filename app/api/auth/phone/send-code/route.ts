import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { formatPhoneNumber, isValidPhoneNumber, generateOTP, sendSMS } from '@/lib/twilio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, userId } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!isValidPhoneNumber(formattedPhone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Check if phone number is already verified by another user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, formattedPhone));

    if (existingUser.length > 0 && existingUser[0].phoneVerified) {
      // If it's a different user, don't allow
      if (userId && existingUser[0].id !== userId) {
        return NextResponse.json({ 
          error: 'This phone number is already registered to another account' 
        }, { status: 400 });
      }
    }

    // Generate OTP and expiration (10 minutes)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // If userId provided, update the user's verification code in database
    if (userId) {
      await db
        .update(users)
        .set({
          phoneNumber: formattedPhone,
          phoneVerificationCode: otp,
          phoneVerificationExpires: expiresAt,
          phoneVerified: false,
        })
        .where(eq(users.id, userId));
    }

    // Send verification code via Twilio SMS
    const result = await sendSMS(
      formattedPhone, 
      `Your Ivories Choice verification code is: ${otp}. This code expires in 10 minutes.`
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent',
      // Return OTP and expiration for storing during signup flow (before user exists)
      ...(userId ? {} : { otp, expiresAt: expiresAt.toISOString() })
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
