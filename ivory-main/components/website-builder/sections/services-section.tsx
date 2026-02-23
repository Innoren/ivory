"use client"

import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ServicesSectionProps {
  section: any
  techProfile: any
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }
  subdomain: string
  services: any[]
}

export function ServicesSection({
  section,
  techProfile,
  theme,
  subdomain,
  services,
}: ServicesSectionProps) {
  if (services.length === 0) {
    return null
  }

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <section 
      className="py-16 sm:py-24 lg:py-32"
      style={{ backgroundColor: theme.accentColor }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p 
            className="text-xs tracking-[0.3em] uppercase mb-4 font-light"
            style={{ color: theme.secondaryColor }}
          >
            Services
          </p>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight"
            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
          >
            What We Offer
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white p-6 sm:p-8 transition-all duration-300 hover:shadow-lg group"
              style={{ borderRadius: '8px' }}
            >
              {/* Service Name */}
              <h3 
                className="text-xl font-light mb-2"
                style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
              >
                {service.name}
              </h3>

              {/* Description */}
              {service.description && (
                <p 
                  className="text-sm font-light mb-4 line-clamp-2"
                  style={{ color: theme.primaryColor, opacity: 0.7 }}
                >
                  {service.description}
                </p>
              )}

              {/* Price & Duration */}
              <div className="flex items-center justify-between mb-6">
                <span 
                  className="text-2xl font-light"
                  style={{ color: theme.secondaryColor }}
                >
                  {formatPrice(service.price)}
                </span>
                {service.duration && (
                  <div 
                    className="flex items-center gap-1 text-sm"
                    style={{ color: theme.primaryColor, opacity: 0.6 }}
                  >
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                )}
              </div>

              {/* Book Button */}
              <Link href={`/subdomain/${subdomain}/book?service=${service.id}`}>
                <Button
                  className="w-full h-12 text-xs tracking-[0.2em] uppercase font-light rounded-none transition-all duration-300"
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.primaryColor,
                    border: `1px solid ${theme.primaryColor}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.secondaryColor
                    e.currentTarget.style.borderColor = theme.secondaryColor
                    e.currentTarget.style.color = '#FFFFFF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = theme.primaryColor
                    e.currentTarget.style.color = theme.primaryColor
                  }}
                >
                  Book Now
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
