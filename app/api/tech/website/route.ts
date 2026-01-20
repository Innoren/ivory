import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techWebsites, websiteSections, techProfiles, services, portfolioImages, reviews, techAvailability, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

// Default sections for a new website
const DEFAULT_SECTIONS = [
  { sectionType: 'hero', displayOrder: 0, isVisible: true },
  { sectionType: 'about', displayOrder: 1, isVisible: true },
  { sectionType: 'services', displayOrder: 2, isVisible: true },
  { sectionType: 'gallery', displayOrder: 3, isVisible: true },
  { sectionType: 'reviews', displayOrder: 4, isVisible: true },
  { sectionType: 'availability', displayOrder: 5, isVisible: true },
  { sectionType: 'booking', displayOrder: 6, isVisible: true },
  { sectionType: 'contact', displayOrder: 7, isVisible: true },
  { sectionType: 'social', displayOrder: 8, isVisible: true },
];

// GET - Fetch current tech's website configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, parseInt(userId)),
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

    // Get website
    const websitePromise = db.query.techWebsites.findFirst({
      where: eq(techWebsites.techProfileId, techProfile.id),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.displayOrder)],
        },
      },
    }).catch(err => {
      console.error('Error fetching website:', err);
      return null;
    });

    // Fetch services
    const techServicesPromise = db.query.services.findMany({
      where: and(
        eq(services.techProfileId, techProfile.id),
        eq(services.isActive, true)
      ),
    }).catch(err => {
      console.error('Error fetching services:', err);
      return [];
    });

    // Fetch portfolio images
    const portfolioPromise = db.query.portfolioImages.findMany({
      where: eq(portfolioImages.techProfileId, techProfile.id),
      orderBy: (images, { asc }) => [asc(images.orderIndex)],
    }).catch(err => {
      console.error('Error fetching portfolio:', err);
      return [];
    });

    // Fetch reviews
    const techReviewsPromise = db.query.reviews.findMany({
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
    }).catch(err => {
      console.error('Error fetching reviews:', err);
      return [];
    });

    // Fetch availability
    const availabilityPromise = db.query.techAvailability.findMany({
      where: eq(techAvailability.techProfileId, techProfile.id),
    }).catch(err => {
      console.error('Error fetching availability:', err);
      return [];
    });

    const [website, techServices, portfolio, techReviews, availability] = await Promise.all([
      websitePromise,
      techServicesPromise,
      portfolioPromise,
      techReviewsPromise,
      availabilityPromise
    ]);

    return NextResponse.json({
      website,
      techProfile: {
        ...techProfile,
        user: techProfile.user,
      },
      services: techServices,
      portfolioImages: portfolio,
      reviews: techReviews,
      availability,
    });
  } catch (error) {
    console.error('Error fetching tech website:', error);
    return NextResponse.json({ error: 'Failed to fetch website' }, { status: 500 });
  }
}

// POST - Create or update website
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      subdomain,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      isPublished,
      seoTitle,
      seoDescription,
      sections,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, parseInt(userId)),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // Check if website exists
    const existingWebsite = await db.query.techWebsites.findFirst({
      where: eq(techWebsites.techProfileId, techProfile.id),
    });

    // Validate subdomain if provided
    if (subdomain) {
      const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
      
      if (RESERVED_SUBDOMAINS.includes(cleanSubdomain)) {
        return NextResponse.json({ error: 'This subdomain is reserved' }, { status: 400 });
      }

      if (cleanSubdomain.length < 3) {
        return NextResponse.json({ error: 'Subdomain must be at least 3 characters' }, { status: 400 });
      }

      // Check if subdomain is taken by another website
      const subdomainTaken = await db.query.techWebsites.findFirst({
        where: eq(techWebsites.subdomain, cleanSubdomain),
      });

      if (subdomainTaken && (!existingWebsite || subdomainTaken.id !== existingWebsite.id)) {
        return NextResponse.json({ error: 'This subdomain is already taken' }, { status: 400 });
      }
    }

    let website;
    if (existingWebsite) {
      // Update existing website
      const updateData: any = { updatedAt: new Date() };
      if (subdomain) updateData.subdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (primaryColor) updateData.primaryColor = primaryColor;
      if (secondaryColor) updateData.secondaryColor = secondaryColor;
      if (accentColor) updateData.accentColor = accentColor;
      if (fontFamily) updateData.fontFamily = fontFamily;
      if (typeof isPublished === 'boolean') updateData.isPublished = isPublished;
      if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
      if (seoDescription !== undefined) updateData.seoDescription = seoDescription;

      [website] = await db
        .update(techWebsites)
        .set(updateData)
        .where(eq(techWebsites.id, existingWebsite.id))
        .returning();

      // Update sections if provided
      if (sections && Array.isArray(sections)) {
        for (const section of sections) {
          if (section.id) {
            await db
              .update(websiteSections)
              .set({
                isVisible: section.isVisible,
                displayOrder: section.displayOrder,
                settings: section.settings,
                title: section.title,
                subtitle: section.subtitle,
                content: section.content,
                backgroundImage: section.backgroundImage,
                backgroundColor: section.backgroundColor,
                updatedAt: new Date(),
              })
              .where(eq(websiteSections.id, section.id));
          }
        }
      }
    } else {
      // Create new website
      if (!subdomain) {
        return NextResponse.json({ error: 'Subdomain is required for new website' }, { status: 400 });
      }

      const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

      [website] = await db
        .insert(techWebsites)
        .values({
          techProfileId: techProfile.id,
          subdomain: cleanSubdomain,
          primaryColor: primaryColor || '#1A1A1A',
          secondaryColor: secondaryColor || '#8B7355',
          accentColor: accentColor || '#F5F5F5',
          fontFamily: fontFamily || 'Inter',
          isPublished: isPublished ?? true,
          seoTitle,
          seoDescription,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create default sections
      for (const section of DEFAULT_SECTIONS) {
        await db.insert(websiteSections).values({
          websiteId: website.id,
          ...section,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Fetch updated website with sections
    const updatedWebsite = await db.query.techWebsites.findFirst({
      where: eq(techWebsites.id, website.id),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.displayOrder)],
        },
      },
    });

    return NextResponse.json({ website: updatedWebsite });
  } catch (error) {
    console.error('Error saving website:', error);
    return NextResponse.json({ error: 'Failed to save website' }, { status: 500 });
  }
}

// DELETE - Delete website
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, parseInt(userId)),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // Delete website (sections will cascade delete)
    await db
      .delete(techWebsites)
      .where(eq(techWebsites.techProfileId, techProfile.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting website:', error);
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
  }
}
