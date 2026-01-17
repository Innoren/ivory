import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, techProfiles, services, users, notifications, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

// GET - Get invite details (public, no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.inviteToken, token),
      with: {
        techProfile: {
          with: { 
            user: true,
            portfolioImages: true,
          },
        },
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if invite has expired
    if (booking.inviteExpiresAt && new Date(booking.inviteExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });
    }

    // Check if already accepted/paid
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'This appointment has already been booked' }, { status: 400 });
    }

    // Return booking details (sanitized for public view)
    return NextResponse.json({
      booking: {
        id: booking.id,
        appointmentDate: booking.appointmentDate,
        duration: booking.duration,
        servicePrice: booking.servicePrice,
        serviceFee: booking.serviceFee,
        totalPrice: booking.totalPrice,
        clientNotes: booking.clientNotes,
        techNotes: booking.techNotes,
        invitedClientName: booking.invitedClientName,
        invitedClientEmail: booking.invitedClientEmail,
        inviteExpiresAt: booking.inviteExpiresAt,
        service: {
          id: booking.service.id,
          name: booking.service.name,
          description: booking.service.description,
          duration: booking.service.duration,
        },
        tech: {
          id: booking.techProfile.id,
          businessName: booking.techProfile.businessName,
          location: booking.techProfile.location,
          rating: booking.techProfile.rating,
          totalReviews: booking.techProfile.totalReviews,
          portfolioImage: booking.techProfile.portfolioImages?.[0]?.imageUrl,
          username: booking.techProfile.user?.username,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json({ error: 'Failed to fetch invite' }, { status: 500 });
  }
}

// POST - Accept invite and link to user account
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Get token from Authorization header or cookie
    let authToken = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!authToken) {
      authToken = request.cookies.get('session')?.value;
    }
    
    if (!authToken) {
      return NextResponse.json({ error: 'Please log in to accept this invite' }, { status: 401 });
    }

    // Verify token
    let userId: number | null = null;
    const jwtPayload = await verifyToken(authToken);
    if (jwtPayload) {
      userId = jwtPayload.userId;
    } else {
      const session = await db.query.sessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.token, authToken),
      });
      if (!session || new Date(session.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }
      userId = session.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get booking by invite token
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.inviteToken, token),
      with: {
        techProfile: true,
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if invite has expired
    if (booking.inviteExpiresAt && new Date(booking.inviteExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });
    }

    // Check if already accepted
    if (booking.clientId) {
      return NextResponse.json({ error: 'This invite has already been accepted' }, { status: 400 });
    }

    // Link booking to user
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        clientId: userId,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id))
      .returning();

    // Create notification for tech
    await db.insert(notifications).values({
      userId: booking.techProfile.userId,
      type: 'invite_accepted',
      title: 'Invite Accepted',
      message: `${booking.invitedClientName} has accepted your appointment invite for ${booking.service.name}. Waiting for payment.`,
      relatedId: booking.id,
    });

    return NextResponse.json({ 
      booking: updatedBooking,
      message: 'Invite accepted! Please proceed to payment.',
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 });
  }
}
