import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles, users, services, portfolioImages } from '@/db/schema';
import { ilike, or, and, eq } from 'drizzle-orm';

// GET - Search nail techs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';

    console.log('Search params:', { query, location }); // Debug log

    // Use a join query to search across both techProfiles and users tables
    const techs = await db
      .select({
        id: techProfiles.id,
        userId: techProfiles.userId,
        businessName: techProfiles.businessName,
        location: techProfiles.location,
        bio: techProfiles.bio,
        rating: techProfiles.rating,
        totalReviews: techProfiles.totalReviews,
        phoneNumber: techProfiles.phoneNumber,
        website: techProfiles.website,
        instagramHandle: techProfiles.instagramHandle,
        tiktokHandle: techProfiles.tiktokHandle,
        facebookHandle: techProfiles.facebookHandle,
        otherSocialLinks: techProfiles.otherSocialLinks,
        isVerified: techProfiles.isVerified,
        stripeConnectAccountId: techProfiles.stripeConnectAccountId,
        stripeAccountStatus: techProfiles.stripeAccountStatus,
        payoutsEnabled: techProfiles.payoutsEnabled,
        chargesEnabled: techProfiles.chargesEnabled,
        createdAt: techProfiles.createdAt,
        updatedAt: techProfiles.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          avatar: users.avatar,
        },
      })
      .from(techProfiles)
      .innerJoin(users, eq(techProfiles.userId, users.id))
      .where(
        and(
          // Search conditions
          query ? or(
            ilike(techProfiles.businessName, `%${query}%`),
            ilike(techProfiles.bio, `%${query}%`),
            ilike(users.username, `%${query}%`)
          ) : undefined,
          // Location condition
          location ? ilike(techProfiles.location, `%${location}%`) : undefined
        )
      )
      .orderBy(techProfiles.rating)
      .limit(50);

    // Now get the related data for each tech
    const techsWithRelations = await Promise.all(
      techs.map(async (tech) => {
        // Get services
        const techServices = await db.query.services.findMany({
          where: and(
            eq(services.techProfileId, tech.id),
            eq(services.isActive, true)
          ),
        });

        // Get portfolio images
        const techPortfolioImages = await db.query.portfolioImages.findMany({
          where: eq(portfolioImages.techProfileId, tech.id),
          orderBy: (portfolioImages, { desc }) => [desc(portfolioImages.orderIndex)],
          limit: 6,
        });

        return {
          ...tech,
          services: techServices,
          portfolioImages: techPortfolioImages,
        };
      })
    );

    console.log(`Found ${techsWithRelations.length} techs`); // Debug log

    return NextResponse.json({ techs: techsWithRelations });
  } catch (error) {
    console.error('Error searching techs:', error);
    return NextResponse.json({ error: 'Failed to search techs' }, { status: 500 });
  }
}
