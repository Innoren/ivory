import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techWebsites } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Reserved subdomains that cannot be used
const RESERVED_SUBDOMAINS = [
  'www', 'app', 'api', 'admin', 'dashboard', 'panel',
  'mail', 'email', 'support', 'help', 'contact',
  'shop', 'store', 'booking', 'book', 'pay', 'payment',
  'auth', 'login', 'signup', 'register', 'account',
  'blog', 'news', 'about', 'careers', 'jobs',
  'dev', 'staging', 'test', 'demo', 'cdn', 'static',
  'legal', 'terms', 'privacy', 'policy'
];

// GET - Check if subdomain is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');
    const currentWebsiteId = searchParams.get('websiteId');

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 });
    }

    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Check if reserved
    if (RESERVED_SUBDOMAINS.includes(cleanSubdomain)) {
      return NextResponse.json({ 
        available: false, 
        reason: 'This subdomain is reserved' 
      });
    }

    // Check minimum length
    if (cleanSubdomain.length < 3) {
      return NextResponse.json({ 
        available: false, 
        reason: 'Subdomain must be at least 3 characters' 
      });
    }

    // Check if taken
    const existingWebsite = await db.query.techWebsites.findFirst({
      where: eq(techWebsites.subdomain, cleanSubdomain),
    });

    if (existingWebsite) {
      // If it's the current user's website, it's available
      if (currentWebsiteId && existingWebsite.id === parseInt(currentWebsiteId)) {
        return NextResponse.json({ available: true });
      }
      return NextResponse.json({ 
        available: false, 
        reason: 'This subdomain is already taken' 
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json({ error: 'Failed to check subdomain' }, { status: 500 });
  }
}
