"use client"

import { MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroSectionProps {
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
  portfolioImages: any[]
}

export function HeroSection({
  section,
  techProfile,
  user,
  theme,
  subdomain,
  portfolioImages,
}: HeroSectionProps) {
  const backgroundImage = portfolioImages[0]?.imageUrl || null
  const rating = parseFloat(techProfile.rating) || 0
  const totalReviews = techProfile.totalReviews || 0

  return (
    <section 
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: theme.accentColor,
      }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${theme.primaryColor}CC, ${theme.primaryColor}99)`,
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Avatar */}
        {user?.avatar && (
          <div className="mb-6">
            <img
              src={user.avatar}
              alt={techProfile.businessName}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto object-cover border-4"
              style={{ borderColor: theme.secondaryColor }}
            />
          </div>
        )}

        {/* Business Name */}
        <h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4"
          style={{ 
            color: backgroundImage ? '#FFFFFF' : theme.primaryColor,
            fontFamily: theme.fontFamily,
          }}
        >
          {techProfile.businessName || 'Nail Studio'}
        </h1>

        {/* Bio/Tagline */}
        {techProfile.bio && (
          <p 
            className="text-lg sm:text-xl font-light mb-6 max-w-2xl mx-auto opacity-90"
            style={{ color: backgroundImage ? '#FFFFFF' : theme.primaryColor }}
          >
            {techProfile.bio.length > 150 
              ? techProfile.bio.substring(0, 150) + '...' 
              : techProfile.bio}
          </p>
        )}

        {/* Location */}
        {techProfile.location && (
          <div 
            className="flex items-center justify-center gap-2 mb-4"
            style={{ color: backgroundImage ? '#FFFFFF' : theme.primaryColor }}
          >
            <MapPin className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-light">{techProfile.location}</span>
          </div>
        )}

        {/* Rating */}
        {totalReviews > 0 && (
          <div 
            className="flex items-center justify-center gap-2 mb-8"
            style={{ color: backgroundImage ? '#FFFFFF' : theme.primaryColor }}
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4"
                  fill={i < Math.round(rating) ? theme.secondaryColor : 'transparent'}
                  stroke={theme.secondaryColor}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-sm font-light">
              {rating.toFixed(1)} ({totalReviews} reviews)
            </span>
          </div>
        )}

        {/* CTA Button */}
        <Link href={`/subdomain/${subdomain}/book`}>
          <Button
            className="h-14 px-10 text-sm tracking-[0.2em] uppercase font-light rounded-none transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: theme.secondaryColor,
              color: '#FFFFFF',
            }}
          >
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div 
          className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-2"
          style={{ borderColor: backgroundImage ? '#FFFFFF' : theme.primaryColor }}
        >
          <div 
            className="w-1 h-2 rounded-full"
            style={{ backgroundColor: backgroundImage ? '#FFFFFF' : theme.primaryColor }}
          />
        </div>
      </div>
    </section>
  )
}
