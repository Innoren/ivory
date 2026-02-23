"use client"

import { useMemo } from "react"
import { HeroSection } from "./sections/hero-section"
import { AboutSection } from "./sections/about-section"
import { ServicesSection } from "./sections/services-section"
import { GallerySection } from "./sections/gallery-section"
import { ReviewsSection } from "./sections/reviews-section"
import { BookingSection } from "./sections/booking-section"
import { ContactSection } from "./sections/contact-section"
import { SocialSection } from "./sections/social-section"
import { AvailabilitySection } from "./sections/availability-section"
import { WebsiteFooter } from "./sections/website-footer"

interface WebsiteRendererProps {
  website: any
  sections: any[]
  techProfile: any
  user: any
  services: any[]
  portfolioImages: any[]
  reviews: any[]
  availability: any[]
  subdomain: string
  isPreview?: boolean
}

export function WebsiteRenderer({
  website,
  sections,
  techProfile,
  user,
  services,
  portfolioImages,
  reviews,
  availability,
  subdomain,
  isPreview = false,
}: WebsiteRendererProps) {
  // Apply theme CSS variables
  const themeStyles = useMemo(() => ({
    '--primary-color': website.primaryColor || '#1A1A1A',
    '--secondary-color': website.secondaryColor || '#8B7355',
    '--accent-color': website.accentColor || '#F5F5F5',
    '--font-family': website.fontFamily || 'Inter',
  } as React.CSSProperties), [website])

  // Sort and filter visible sections
  const visibleSections = useMemo(() => {
    return sections
      .filter(s => s.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }, [sections])

  const renderSection = (section: any) => {
    const props = {
      section,
      techProfile,
      user,
      theme: {
        primaryColor: website.primaryColor,
        secondaryColor: website.secondaryColor,
        accentColor: website.accentColor,
        fontFamily: website.fontFamily,
      },
      subdomain,
    }

    switch (section.sectionType) {
      case 'hero':
        return <HeroSection key={section.id} {...props} portfolioImages={portfolioImages} />
      case 'about':
        return <AboutSection key={section.id} {...props} services={services} portfolioImages={portfolioImages} />
      case 'services':
        return <ServicesSection key={section.id} {...props} services={services} />
      case 'gallery':
        return <GallerySection key={section.id} {...props} portfolioImages={portfolioImages} />
      case 'reviews':
        return <ReviewsSection key={section.id} {...props} reviews={reviews} />
      case 'availability':
        return <AvailabilitySection key={section.id} {...props} availability={availability} />
      case 'booking':
        return <BookingSection key={section.id} {...props} services={services} />
      case 'contact':
        return <ContactSection key={section.id} {...props} availability={availability} />
      case 'social':
        return <SocialSection key={section.id} {...props} />
      default:
        return null
    }
  }

  return (
    <div 
      className="min-h-screen bg-white"
      style={{
        ...themeStyles,
        fontFamily: `var(--font-family), system-ui, sans-serif`,
      }}
    >
      {/* SEO Meta */}
      {!isPreview && (
        <head>
          <title>{website.seoTitle || `${techProfile.businessName} | Book Now`}</title>
          <meta name="description" content={website.seoDescription || techProfile.bio} />
        </head>
      )}

      {/* Render sections */}
      {visibleSections.map(renderSection)}

      {/* Footer */}
      <WebsiteFooter
        techProfile={techProfile}
        theme={{
          primaryColor: website.primaryColor,
          secondaryColor: website.secondaryColor,
          accentColor: website.accentColor,
          fontFamily: website.fontFamily,
        }}
      />
    </div>
  )
}
