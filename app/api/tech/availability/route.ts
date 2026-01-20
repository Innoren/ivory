import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techAvailability, techTimeOff, techProfiles, bookings } from '@/db/schema';
import { eq, and, gte, lte, or } from 'drizzle-orm';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Generate time slots between start and end time
function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number = 30): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`);
    currentMin += intervalMinutes;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
}

// Check if a time slot conflicts with existing bookings
function isSlotAvailable(
  slotTime: string, 
  date: Date, 
  duration: number, 
  existingBookings: any[]
): boolean {
  const [slotHour, slotMin] = slotTime.split(':').map(Number);
  const slotStart = new Date(date);
  slotStart.setHours(slotHour, slotMin, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + duration * 60000);
  
  for (const booking of existingBookings) {
    const bookingStart = new Date(booking.appointmentDate);
    const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
    
    // Check for overlap
    if (slotStart < bookingEnd && slotEnd > bookingStart) {
      return false;
    }
  }
  
  return true;
}

// GET - Fetch tech availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const techProfileId = searchParams.get('techProfileId');
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const duration = parseInt(searchParams.get('duration') || '60'); // Service duration in minutes

    if (!techProfileId) {
      return NextResponse.json({ error: 'Tech profile ID required' }, { status: 400 });
    }

    const availability = await db.query.techAvailability.findMany({
      where: and(
        eq(techAvailability.techProfileId, parseInt(techProfileId)),
        eq(techAvailability.isActive, true)
      ),
      orderBy: (techAvailability, { asc }) => [asc(techAvailability.dayOfWeek)],
    });

    // Get time off periods
    const now = new Date();
    const timeOff = await db.query.techTimeOff.findMany({
      where: and(
        eq(techTimeOff.techProfileId, parseInt(techProfileId)),
        gte(techTimeOff.endDate, now)
      ),
      orderBy: (techTimeOff, { asc }) => [asc(techTimeOff.startDate)],
    });

    // If a specific date is requested, calculate available time slots
    if (date) {
      const requestedDate = new Date(date + 'T00:00:00');
      const dayOfWeek = DAY_NAMES[requestedDate.getDay()];
      
      // Find availability for this day
      const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
      
      if (!dayAvailability) {
        return NextResponse.json({ 
          availability, 
          timeOff, 
          availableSlots: [],
          message: 'Not available on this day'
        });
      }
      
      // Check if date falls within time off
      const isTimeOff = timeOff.some(to => {
        const toStart = new Date(to.startDate);
        const toEnd = new Date(to.endDate);
        return requestedDate >= toStart && requestedDate <= toEnd;
      });
      
      if (isTimeOff) {
        return NextResponse.json({ 
          availability, 
          timeOff, 
          availableSlots: [],
          message: 'Time off on this day'
        });
      }
      
      // Get existing bookings for this date
      const dayStart = new Date(requestedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(requestedDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const existingBookings = await db.query.bookings.findMany({
        where: and(
          eq(bookings.techProfileId, parseInt(techProfileId)),
          gte(bookings.appointmentDate, dayStart),
          lte(bookings.appointmentDate, dayEnd),
          or(
            eq(bookings.status, 'pending'),
            eq(bookings.status, 'confirmed')
          )
        ),
      });
      
      // Generate all possible time slots
      const allSlots = generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime, 30);
      
      // Filter out slots that conflict with existing bookings or are in the past
      const nowTime = new Date();
      const availableSlots = allSlots.filter(slot => {
        // Check if slot is in the past (for today)
        if (requestedDate.toDateString() === nowTime.toDateString()) {
          const [slotHour, slotMin] = slot.split(':').map(Number);
          const slotTime = new Date(requestedDate);
          slotTime.setHours(slotHour, slotMin, 0, 0);
          if (slotTime <= nowTime) {
            return false;
          }
        }
        
        // Check if slot conflicts with existing bookings
        return isSlotAvailable(slot, requestedDate, duration, existingBookings);
      });
      
      return NextResponse.json({ 
        availability, 
        timeOff, 
        availableSlots,
        existingBookingsCount: existingBookings.length
      });
    }

    return NextResponse.json({ availability, timeOff });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// POST - Set tech availability (tech only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
      with: { user: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if ((session.user as any).userType !== 'tech') {
      return NextResponse.json({ error: 'Only nail techs can set availability' }, { status: 403 });
    }

    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, session.userId),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { schedule } = body; // Array of { dayOfWeek, startTime, endTime }

    // Delete existing availability
    await db.delete(techAvailability).where(eq(techAvailability.techProfileId, techProfile.id));

    // Insert new availability
    if (schedule && schedule.length > 0) {
      await db.insert(techAvailability).values(
        schedule.map((slot: any) => ({
          techProfileId: techProfile.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: true,
        }))
      );
    }

    const newAvailability = await db.query.techAvailability.findMany({
      where: eq(techAvailability.techProfileId, techProfile.id),
    });

    return NextResponse.json({ availability: newAvailability });
  } catch (error) {
    console.error('Error setting availability:', error);
    return NextResponse.json({ error: 'Failed to set availability' }, { status: 500 });
  }
}
