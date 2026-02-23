import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techWebsites, websiteSections, techProfiles, services, portfolioImages, reviews, techAvailability, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

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

// GET - Fetch complete website data for public viewing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid subdomain' }, { status: 400 });
    }

    // Fetch website configuration
    const website = await db.query.techWebsites.findFirst({
      where: eq(techWebsites.subdomain, subdomain.toLowerCase()),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.displayOrder)],
        },
      },
    });

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    if (!website.isPublished) {
      return NextResponse.json({ error: 'Website is not published' }, { status: 404 });
    }

    // Fetch tech profile with user data
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.id, website.techProfileId),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // Fetch services
    const techServices = await db.query.services.findMany({
      where: and(
        eq(services.techProfileId, techProfile.id),
        eq(services.isActive, true)
      ),
    });

    // Fetch portfolio images
    const portfolio = await db.query.portfolioImages.findMany({
      where: eq(portfolioImages.techProfileId, techProfile.id),
      orderBy: (images, { asc }) => [asc(images.orderIndex)],
    });

    // Fetch reviews with client info
    const techReviews = await db.query.reviews.findMany({
      where: eq(reviews.techProfileId, techProfile.id),
      with: {
        client: {
          columns: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      limit: 6,
    });

    // Fetch availability
    const availability = await db.query.techAvailability.findMany({
      where: eq(techAvailability.techProfileId, techProfile.id),
    });

    return NextResponse.json({
      website: {
        id: website.id,
        subdomain: website.subdomain,
        isPublished: website.isPublished,
        primaryColor: website.primaryColor,
        secondaryColor: website.secondaryColor,
        accentColor: website.accentColor,
        fontFamily: website.fontFamily,
        seoTitle: website.seoTitle,
        seoDescription: website.seoDescription,
      },
      sections: website.sections,
      techProfile: {
        id: techProfile.id,
        userId: techProfile.userId,
        businessName: techProfile.businessName,
        location: techProfile.location,
        bio: techProfile.bio,
        rating: techProfile.rating,
        totalReviews: techProfile.totalReviews,
        phoneNumber: techProfile.phoneNumber,
        website: techProfile.website,
        instagramHandle: techProfile.instagramHandle,
        tiktokHandle: techProfile.tiktokHandle,
        facebookHandle: techProfile.facebookHandle,
        otherSocialLinks: techProfile.otherSocialLinks,
        noShowFeeEnabled: techProfile.noShowFeeEnabled,
        noShowFeePercent: techProfile.noShowFeePercent,
        cancellationWindowHours: techProfile.cancellationWindowHours,
      },
      user: techProfile.user,
      services: techServices,
      portfolioImages: portfolio,
      reviews: techReviews,
      availability,
    });
  } catch (error) {
    console.error('Error fetching website:', error);
    return NextResponse.json({ error: 'Failed to fetch website' }, { status: 500 });
  }
}
