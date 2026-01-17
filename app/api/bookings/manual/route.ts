import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, techProfiles, services, users, notifications, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import crypto from 'crypto';

// POST - Create manual appointment (tech creates and sends invite to client)
export async function POST(request: NextRequest) {
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

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, userId),
      with: { user: true },
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found. Only nail techs can create manual appointments.' }, { status: 403 });
    }

    const body = await request.json();
    const { serviceId, appointmentDate, clientEmail, clientName, clientNotes, techNotes } = body;

    // Validate required fields
    if (!serviceId || !appointmentDate || !clientEmail || !clientName) {
      return NextResponse.json({ 
        error: 'Missing required fields: serviceId, appointmentDate, clientEmail, clientName' 
      }, { status: 400 });
    }

    // Get service details
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Verify service belongs to this tech
    if (service.techProfileId !== techProfile.id) {
      return NextResponse.json({ error: 'Service does not belong to your profile' }, { status: 403 });
    }

    // Calculate prices
    const servicePrice = parseFloat(service.price || '0');
    const serviceFee = servicePrice * 0.15; // 15% convenience fee
    const totalPrice = servicePrice + serviceFee;

    // Generate unique invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    // Set invite expiration (7 days from now)
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

    // Create booking with invite
    const [newBooking] = await db.insert(bookings).values({
      clientId: null, // Will be set when client accepts
      techProfileId: techProfile.id,
      serviceId,
      appointmentDate: new Date(appointmentDate),
      duration: service.duration || 60,
      servicePrice: servicePrice.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      paymentStatus: 'pending',
      clientNotes: clientNotes || null,
      techNotes: techNotes || null,
      status: 'pending',
      inviteToken,
      inviteExpiresAt,
      invitedClientEmail: clientEmail,
      invitedClientName: clientName,
      isManualBooking: true,
    }).returning();

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ivory.app';
    const inviteLink = `${baseUrl}/booking/invite/${inviteToken}`;

    return NextResponse.json({ 
      booking: newBooking,
      inviteLink,
      inviteExpiresAt,
      message: `Invite created! Share this link with ${clientName}: ${inviteLink}`
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating manual appointment:', error);
    return NextResponse.json({ error: 'Failed to create manual appointment' }, { status: 500 });
  }
}
