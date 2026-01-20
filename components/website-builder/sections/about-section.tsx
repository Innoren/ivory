"use client"

import { Users, Sparkles } from "lucide-react"

interface AboutSectionProps {
  section: any
  techProfile: any
  user: any
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }
  subdomain: string
  services: any[]
  portfolioImages: any[]
}

export function AboutSection({
  section,
  techProfile,
  user,
  theme,
  services,
  portfolioImages,
}: AboutSectionProps) {
  const totalReviews = techProfile.totalReviews || 0
  const serviceCount = services.length

  return (
    <section 
      className="py-16 sm:py-24 lg:py-32"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1">
            {(user?.avatar || portfolioImages[0]?.imageUrl) && (
              <div className="relative">
                <img
                  src={user?.avatar || portfolioImages[0]?.imageUrl}
                  alt={techProfile.businessName}
                  className="w-full aspect-[4/5] object-cover"
                  style={{ borderRadius: '8px' }}
                />
                {/* Decorative element */}
                <div 
                  className="absolute -bottom-4 -right-4 w-32 h-32 -z-10"
                  style={{ backgroundColor: theme.accentColor, borderRadius: '8px' }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <p 
              className="text-xs tracking-[0.3em] uppercase mb-4 font-light"
              style={{ color: theme.secondaryColor }}
            >
              About
            </p>
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-6"
              style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
            >
              {techProfile.businessName || 'Our Story'}
            </h2>

            {/* Bio */}
            {techProfile.bio && (
              <div 
                className="text-base sm:text-lg font-light leading-relaxed mb-8 space-y-4"
                style={{ color: theme.primaryColor, opacity: 0.8 }}
              >
                {techProfile.bio.split('\n').map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div 
                className="p-6 text-center"
                style={{ backgroundColor: theme.accentColor, borderRadius: '8px' }}
              >
                <Users 
                  className="w-6 h-6 mx-auto mb-2" 
                  strokeWidth={1.5}
                  style={{ color: theme.secondaryColor }}
                />
                <p 
                  className="text-2xl sm:text-3xl font-light mb-1"
                  style={{ color: theme.primaryColor }}
                >
                  {totalReviews}+
                </p>
                <p 
                  className="text-xs tracking-[0.2em] uppercase font-light"
                  style={{ color: theme.primaryColor, opacity: 0.6 }}
                >
                  Happy Clients
                </p>
              </div>

              <div 
                className="p-6 text-center"
                style={{ backgroundColor: theme.accentColor, borderRadius: '8px' }}
              >
                <Sparkles 
                  className="w-6 h-6 mx-auto mb-2" 
                  strokeWidth={1.5}
                  style={{ color: theme.secondaryColor }}
                />
                <p 
                  className="text-2xl sm:text-3xl font-light mb-1"
                  style={{ color: theme.primaryColor }}
                >
                  {serviceCount}
                </p>
                <p 
                  className="text-xs tracking-[0.2em] uppercase font-light"
                  style={{ color: theme.primaryColor, opacity: 0.6 }}
                >
                  Services
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
