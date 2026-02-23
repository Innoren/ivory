import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

// GET - Get current user's tech profile
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      token = request.cookies.get('session')?.value;
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let userId: number | null = null;
    const jwtPayload = await verifyToken(token);
    if (jwtPayload) {
      userId = jwtPayload.userId;
    } else {
      const session = await db.query.sessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.token, token),
      });
      if (!session || new Date(session.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }
      userId = session.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get tech profile for this user
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, userId),
      with: {
        services: true,
        portfolioImages: true,
      },
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    return NextResponse.json({ techProfile });
  } catch (error) {
    console.error('Error fetching tech profile:', error);
    return NextResponse.json({ error: 'Failed to fetch tech profile' }, { status: 500 });
  }
}
