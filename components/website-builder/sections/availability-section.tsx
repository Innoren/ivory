"use client"

import { Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AvailabilitySectionProps {
  section: any
  techProfile: any
  user: any
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }
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

export function AvailabilitySection({
  section,
  techProfile,
  user,
  theme,
  availability,
}: AvailabilitySectionProps) {
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

  // Check if there is any active availability
  const hasAvailability = sortedAvailability.some(a => a.isActive)

  return (
    <section 
      className="py-16 sm:py-24 lg:py-32"
      style={{ backgroundColor: theme.accentColor }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p 
            className="text-xs tracking-[0.3em] uppercase mb-4 font-light"
            style={{ color: theme.secondaryColor }}
          >
            Schedule
          </p>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight"
            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
          >
            Availability
          </h2>
          {section.subtitle && (
            <p 
              className="mt-4 text-lg font-light max-w-2xl mx-auto"
              style={{ color: theme.primaryColor, opacity: 0.7 }}
            >
              {section.subtitle}
            </p>
          )}
        </div>

        <div 
          className="bg-white p-8 sm:p-12 shadow-sm"
          style={{ borderRadius: '4px' }}
        >
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Clock className="w-5 h-5" style={{ color: theme.secondaryColor }} strokeWidth={1.5} />
            <h3 
              className="text-lg font-light"
              style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
            >
              Weekly Hours
            </h3>
          </div>

          <div className="space-y-4 max-w-lg mx-auto">
            {DAY_ORDER.map((day) => {
              const dayAvailability = sortedAvailability.find(a => a.dayOfWeek === day)
              const isActive = dayAvailability?.isActive

              return (
                <div 
                  key={day}
                  className="flex items-center justify-between py-3 border-b border-dashed"
                  style={{ borderColor: `${theme.primaryColor}20` }}
                >
                  <span 
                    className="text-base font-light"
                    style={{ color: theme.primaryColor }}
                  >
                    {DAY_LABELS[day]}
                  </span>
                  <span 
                    className="text-base font-light"
                    style={{ 
                      color: isActive ? theme.primaryColor : theme.primaryColor,
                      opacity: isActive ? 1 : 0.5,
                      fontWeight: isActive ? 400 : 300
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

          {!hasAvailability && (
            <div className="text-center mt-8 p-4 bg-gray-50 rounded">
              <p className="text-gray-500 font-light">
                No availability hours set. Please contact for appointment.
              </p>
            </div>
          )}

          {/* Optional Call to Action */}
          <div className="mt-12 text-center">
            <Button
              className="h-12 px-8 text-xs tracking-[0.2em] uppercase font-light rounded-none transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: theme.primaryColor, 
                color: '#FFFFFF' 
              }}
              onClick={() => {
                const bookingSection = document.querySelector('[data-section-type="booking"]')
                if (bookingSection) {
                  bookingSection.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              Book an Appointment
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
