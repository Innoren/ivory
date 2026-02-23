"use client"

import { Phone, MapPin, Mail, Clock, ExternalLink } from "lucide-react"

interface ContactSectionProps {
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
  availability: any[]
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export function ContactSection({
  section,
  techProfile,
  user,
  theme,
  availability,
}: ContactSectionProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Sort availability by day order
  const sortedAvailability = [...availability].sort((a, b) => {
    return DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  })

  const getGoogleMapsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
  }

  return (
    <section 
      className="py-16 sm:py-24 lg:py-32"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p 
            className="text-xs tracking-[0.3em] uppercase mb-4 font-light"
            style={{ color: theme.secondaryColor }}
          >
            Contact
          </p>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight"
            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
          >
            Get in Touch
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Phone */}
            {techProfile.phoneNumber && (
              <a 
                href={`tel:${techProfile.phoneNumber}`}
                className="flex items-start gap-4 p-6 transition-all duration-300 hover:shadow-md group"
                style={{ backgroundColor: theme.accentColor, borderRadius: '8px' }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <Phone className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p 
                    className="text-xs tracking-[0.2em] uppercase mb-1 font-light"
                    style={{ color: theme.primaryColor, opacity: 0.6 }}
                  >
                    Phone
                  </p>
                  <p 
                    className="text-lg font-light group-hover:underline"
                    style={{ color: theme.primaryColor }}
                  >
                    {techProfile.phoneNumber}
                  </p>
                </div>
              </a>
            )}

            {/* Location */}
            {techProfile.location && (
              <a 
                href={getGoogleMapsUrl(techProfile.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-6 transition-all duration-300 hover:shadow-md group"
                style={{ backgroundColor: theme.accentColor, borderRadius: '8px' }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <MapPin className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p 
                    className="text-xs tracking-[0.2em] uppercase mb-1 font-light"
                    style={{ color: theme.primaryColor, opacity: 0.6 }}
                  >
                    Location
                  </p>
                  <p 
                    className="text-lg font-light"
                    style={{ color: theme.primaryColor }}
                  >
                    {techProfile.location}
                  </p>
                  <p 
                    className="text-sm font-light mt-1 flex items-center gap-1 group-hover:underline"
                    style={{ color: theme.secondaryColor }}
                  >
                    Get Directions <ExternalLink className="w-3 h-3" />
                  </p>
                </div>
              </a>
            )}

            {/* Email */}
            {user?.email && (
              <a 
                href={`mailto:${user.email}`}
                className="flex items-start gap-4 p-6 transition-all duration-300 hover:shadow-md group"
                style={{ backgroundColor: theme.accentColor, borderRadius: '8px' }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <Mail className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p 
                    className="text-xs tracking-[0.2em] uppercase mb-1 font-light"
                    style={{ color: theme.primaryColor, opacity: 0.6 }}
                  >
                    Email
                  </p>
                  <p 
                    className="text-lg font-light group-hover:underline"
                    style={{ color: theme.primaryColor }}
                  >
                    {user.email}
                  </p>
                </div>
              </a>
            )}
          </div>

          {/* Business Hours */}
          <div 
            className="p-6 sm:p-8"
            style={{ backgroundColor: theme.accentColor, borderRadius: '8px' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5" style={{ color: theme.secondaryColor }} strokeWidth={1.5} />
              <h3 
                className="text-lg font-light"
                style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
              >
                Business Hours
              </h3>
            </div>

            <div className="space-y-3">
              {DAY_ORDER.map((day) => {
                const dayAvailability = sortedAvailability.find(a => a.dayOfWeek === day)
                const isActive = dayAvailability?.isActive

                return (
                  <div 
                    key={day}
                    className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: `${theme.primaryColor}10` }}
                  >
                    <span 
                      className="text-sm font-light"
                      style={{ color: theme.primaryColor }}
                    >
                      {DAY_LABELS[day]}
                    </span>
                    <span 
                      className="text-sm font-light"
                      style={{ 
                        color: isActive ? theme.primaryColor : theme.primaryColor,
                        opacity: isActive ? 1 : 0.5,
                      }}
                    >
                      {isActive && dayAvailability
                        ? `${formatTime(dayAvailability.startTime)} - ${formatTime(dayAvailability.endTime)}`
                        : 'Closed'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
