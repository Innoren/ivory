import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/twilio';

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dateOfBirth, phoneNumber, phoneVerified } = body;

    const updateData: Record<string, any> = {};

    // Validate and format phone number if provided
    if (phoneNumber !== undefined) {
      if (phoneNumber) {
        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!isValidPhoneNumber(formattedPhone)) {
          return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }
        
        // Check if phone is already used by another user
        const existingPhone = await db
          .select()
          .from(users)
          .where(eq(users.phoneNumber, formattedPhone));
        
        if (existingPhone.length > 0 && existingPhone[0].id !== session.userId) {
          return NextResponse.json({ 
            error: 'This phone number is already registered to another account' 
          }, { status: 400 });
        }
        
        updateData.phoneNumber = formattedPhone;
        // Reset verification if phone number changed
        if (phoneVerified !== true) {
          updateData.phoneVerified = false;
        }
      } else {
        updateData.phoneNumber = null;
        updateData.phoneVerified = false;
      }
    }

    // Update phone verified status if explicitly provided
    if (phoneVerified !== undefined) {
      updateData.phoneVerified = phoneVerified;
    }

    // Validate date of birth if provided
    if (dateOfBirth !== undefined) {
      if (dateOfBirth) {
        const parsedDOB = new Date(dateOfBirth);
        if (isNaN(parsedDOB.getTime())) {
          return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 });
        }
        
        // Check minimum age (13 years)
        const today = new Date();
        const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
        if (parsedDOB > minAgeDate) {
          return NextResponse.json({ 
            error: 'You must be at least 13 years old' 
          }, { status: 400 });
        }
        
        updateData.dateOfBirth = parsedDOB;
      } else {
        updateData.dateOfBirth = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser[0].id,
        dateOfBirth: updatedUser[0].dateOfBirth,
        phoneNumber: updatedUser[0].phoneNumber,
        phoneVerified: updatedUser[0].phoneVerified,
      }
    });
  } catch (error) {
    console.error('Update personal info error:', error);
    return NextResponse.json({ error: 'Failed to update personal info' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db
      .select({
        id: users.id,
        dateOfBirth: users.dateOfBirth,
        phoneNumber: users.phoneNumber,
        phoneVerified: users.phoneVerified,
      })
      .from(users)
      .where(eq(users.id, session.userId));

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error('Get personal info error:', error);
    return NextResponse.json({ error: 'Failed to get personal info' }, { status: 500 });
  }
}
