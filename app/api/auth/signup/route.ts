import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, referrals, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { nanoid } from 'nanoid';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/twilio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      username, 
      email, 
      password, 
      authProvider = 'email', 
      referralCode,
      dateOfBirth,
      phoneNumber,
      phoneVerified = false
    } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // For email auth, password is required
    if (authProvider === 'email' && !password) {
      return NextResponse.json({ error: 'Password is required for email authentication' }, { status: 400 });
    }

    // Validate phone number if provided
    let formattedPhone: string | null = null;
    if (phoneNumber) {
      formattedPhone = formatPhoneNumber(phoneNumber);
      if (!isValidPhoneNumber(formattedPhone)) {
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
      }
    }

    // Validate date of birth if provided
    let parsedDOB: Date | null = null;
    if (dateOfBirth) {
      parsedDOB = new Date(dateOfBirth);
      if (isNaN(parsedDOB.getTime())) {
        return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 });
      }
      
      // Check minimum age (13 years)
      const today = new Date();
      const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
      if (parsedDOB > minAgeDate) {
        return NextResponse.json({ error: 'You must be at least 13 years old to create an account' }, { status: 400 });
      }
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Check if referral code is valid
    let referrerId: number | null = null;
    if (referralCode) {
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, referralCode));
      
      if (referrer.length > 0) {
        referrerId = referrer[0].id;
      }
    }

    // Generate unique referral code for new user
    const newReferralCode = nanoid(10);

    // Create new user with 5 free credits
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash: password, // In production, hash this with bcrypt
        authProvider,
        userType: 'client', // Default to client, can be changed
        credits: 5, // Initial free credits
        referralCode: newReferralCode,
        referredBy: referrerId,
        dateOfBirth: parsedDOB,
        phoneNumber: formattedPhone,
        phoneVerified: phoneVerified,
      })
      .returning();

    // Log the signup bonus credit transaction
    await db.insert(creditTransactions).values({
      userId: newUser[0].id,
      amount: 5,
      type: 'signup_bonus',
      description: 'Welcome bonus - 5 free credits',
      balanceAfter: 5,
    });

    // If user was referred, create referral record
    if (referrerId) {
      await db.insert(referrals).values({
        referrerId: referrerId,
        referredUserId: newUser[0].id,
        creditAwarded: false, // Will be awarded after 3 referrals
      });

      // Check if referrer now has 3 or more successful referrals
      const referrerReferrals = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, referrerId));

      // Award credit for every 3 referrals
      const unawardedReferrals = referrerReferrals.filter(r => !r.creditAwarded);
      if (unawardedReferrals.length >= 3) {
        // Get referrer's current credits
        const referrerData = await db
          .select()
          .from(users)
          .where(eq(users.id, referrerId));

        const currentCredits = referrerData[0].credits;
        const newCredits = currentCredits + 1;

        // Update referrer's credits
        await db
          .update(users)
          .set({ credits: newCredits })
          .where(eq(users.id, referrerId));

        // Mark the first 3 unawardedReferrals as awarded
        for (let i = 0; i < 3; i++) {
          await db
            .update(referrals)
            .set({ creditAwarded: true })
            .where(eq(referrals.id, unawardedReferrals[i].id));
        }

        // Log the referral reward transaction
        await db.insert(creditTransactions).values({
          userId: referrerId,
          amount: 1,
          type: 'referral_reward',
          description: 'Earned 1 credit for referring 3 new users',
          balanceAfter: newCredits,
        });
      }
    }

    // Create session
    await createSession(newUser[0].id);

    // Send welcome email (don't block on this)
    sendWelcomeEmail({
      email: newUser[0].email,
      username: newUser[0].username,
      userType: newUser[0].userType,
    }).catch((error) => {
      console.error('Failed to send welcome email:', error);
      // Don't fail the signup if email fails
    });

    return NextResponse.json({
      id: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
      userType: newUser[0].userType,
      avatar: newUser[0].avatar,
      credits: newUser[0].credits,
      referralCode: newUser[0].referralCode,
      dateOfBirth: newUser[0].dateOfBirth,
      phoneNumber: newUser[0].phoneNumber,
      phoneVerified: newUser[0].phoneVerified,
      createdAt: newUser[0].createdAt,
      isNewUser: true, // Flag to trigger PostHog signup tracking on client
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
