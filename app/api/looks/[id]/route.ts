import { NextResponse } from 'next/server';
import { db } from '@/db';
import { looks, users, likes, dislikes, favorites, designRequests, designRequestMessages, designBreakdowns, aiGenerations, bookings, reviews, sessions } from '@/db/schema';
import { eq, inArray, and, or } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get session from cookie to verify ownership
    const cookieHeader = request.headers.get('cookie');
    const sessionCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('session='));
    const sessionToken = sessionCookie?.split('=')[1];

    let currentUserId: number | null = null;
    
    if (sessionToken) {
      const session = await db.query.sessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.token, sessionToken),
      });
      
      if (session && new Date(session.expiresAt) > new Date()) {
        currentUserId = session.userId;
      }
    }
    
    const look = await db
      .select({
        id: looks.id,
        userId: looks.userId,
        title: looks.title,
        imageUrl: looks.imageUrl,
        originalImageUrl: looks.originalImageUrl,
        aiPrompt: looks.aiPrompt,
        nailPositions: looks.nailPositions,
        designMetadata: looks.designMetadata,
        isPublic: looks.isPublic,
        viewCount: looks.viewCount,
        createdAt: looks.createdAt,
        user: {
          username: users.username,
        },
      })
      .from(looks)
      .leftJoin(users, eq(looks.userId, users.id))
      .where(eq(looks.id, parseInt(id)));

    if (look.length === 0) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    const foundLook = look[0];
    
    // Allow access if: look is public OR user owns the look OR no auth required for viewing
    // For "Send to Tech" feature, user must own the look
    const isOwner = currentUserId && foundLook.userId === currentUserId;
    const isPublic = foundLook.isPublic;
    
    // If user is logged in but doesn't own the look and it's not public, deny access
    if (currentUserId && !isOwner && !isPublic) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    return NextResponse.json(foundLook);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch look' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lookId = parseInt(id);
    
    // Get session from cookie to verify ownership
    const cookieHeader = request.headers.get('cookie');
    const sessionCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('session='));
    const sessionToken = sessionCookie?.split('=')[1];

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, sessionToken),
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Verify ownership before deleting
    const [existingLook] = await db
      .select({ userId: looks.userId })
      .from(looks)
      .where(eq(looks.id, lookId));

    if (!existingLook) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    if (existingLook.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete related records first (cascade delete)
    await Promise.all([
      db.delete(likes).where(eq(likes.lookId, lookId)),
      db.delete(dislikes).where(eq(dislikes.lookId, lookId)),
      db.delete(favorites).where(eq(favorites.lookId, lookId)),
      db.delete(designBreakdowns).where(eq(designBreakdowns.lookId, lookId)),
    ]);
    
    // Set lookId to null for records that shouldn't be deleted
    await Promise.all([
      db.update(bookings).set({ lookId: null }).where(eq(bookings.lookId, lookId)),
      db.update(aiGenerations).set({ lookId: null }).where(eq(aiGenerations.lookId, lookId)),
    ]);
    
    // Get design request IDs for this look to delete related messages and reviews
    const relatedRequests = await db
      .select({ id: designRequests.id })
      .from(designRequests)
      .where(eq(designRequests.lookId, lookId));
    
    if (relatedRequests.length > 0) {
      const requestIds = relatedRequests.map(r => r.id);
      
      // Delete messages and reviews that reference these design requests
      await Promise.all([
        db.delete(designRequestMessages).where(inArray(designRequestMessages.designRequestId, requestIds)),
        db.update(reviews).set({ designRequestId: null }).where(inArray(reviews.designRequestId, requestIds)),
      ]);
      
      // Now delete the design requests
      await db.delete(designRequests).where(inArray(designRequests.id, requestIds));
    }
    
    // Now delete the look
    const deleted = await db
      .delete(looks)
      .where(eq(looks.id, lookId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete look:', error);
    return NextResponse.json({ error: 'Failed to delete look' }, { status: 500 });
  }
}
