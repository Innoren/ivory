"use client"

import { Calendar, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface BookingSectionProps {
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

export function BookingSection({
  section,
  techProfile,
  theme,
  subdomain,
  services,
}: BookingSectionProps) {
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice)
  }

  return (
    <section 
      className="py-16 sm:py-24 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: theme.primaryColor }}
    >
      {/* Decorative elements */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ backgroundColor: theme.secondaryColor, transform: 'translate(50%, -50%)' }}
      />
      <div 
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
        style={{ backgroundColor: theme.secondaryColor, transform: 'translate(-50%, 50%)' }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p 
            className="text-xs tracking-[0.3em] uppercase mb-4 font-light"
            style={{ color: theme.secondaryColor }}
          >
            Book Now
          </p>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-4 text-white"
            style={{ fontFamily: theme.fontFamily }}
          >
            Ready for Beautiful Nails?
          </h2>
          <p className="text-white/70 font-light max-w-xl mx-auto">
            Book your appointment today and let us create something beautiful for you.
          </p>
        </div>

        {/* Quick Service Select */}
        {services.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {services.slice(0, 6).map((service) => (
              <Link 
                key={service.id}
                href={`/subdomain/${subdomain}/book?service=${service.id}`}
              >
                <div 
                  className="p-4 text-center transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                >
                  <p className="text-white text-sm font-light mb-1 truncate">
                    {service.name}
                  </p>
                  <p style={{ color: theme.secondaryColor }} className="text-lg font-light">
                    {formatPrice(service.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Main CTA */}
        <div className="text-center mb-12">
          <Link href={`/subdomain/${subdomain}/book`}>
            <Button
              className="h-16 px-12 text-sm tracking-[0.2em] uppercase font-light rounded-none transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: theme.secondaryColor,
                color: '#FFFFFF',
              }}
            >
              <Calendar className="w-5 h-5 mr-3" strokeWidth={1.5} />
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* Cancellation Policy */}
        {techProfile.noShowFeeEnabled && (
          <div 
            className="p-6 text-center"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-white/60" strokeWidth={1.5} />
              <span className="text-white/60 text-xs tracking-[0.2em] uppercase font-light">
                Cancellation Policy
              </span>
            </div>
            <p className="text-white/80 text-sm font-light">
              Free cancellation up to {techProfile.cancellationWindowHours || 24} hours before your appointment.
              {techProfile.noShowFeePercent && (
                <span> A {techProfile.noShowFeePercent}% fee applies for no-shows or late cancellations.</span>
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
