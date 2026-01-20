"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Check, Loader2, AlertCircle, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface SubdomainBookingPageProps {
  website: any
  techProfile: any
  user: any
  services: any[]
  availability: any[]
  subdomain: string
  preselectedServiceId?: number
}

type BookingStep = 'service' | 'datetime' | 'details' | 'confirmation'

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function SubdomainBookingPage({
  website,
  techProfile,
  user,
  services,
  availability,
  subdomain,
  preselectedServiceId,
}: SubdomainBookingPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [step, setStep] = useState<BookingStep>('service')
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  
  // Guest details
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [clientNotes, setClientNotes] = useState('')

  const theme = {
    primaryColor: website.primaryColor || '#1A1A1A',
    secondaryColor: website.secondaryColor || '#8B7355',
    accentColor: website.accentColor || '#F5F5F5',
    fontFamily: website.fontFamily || 'Inter',
  }

  // Pre-select service if provided
  useEffect(() => {
    if (preselectedServiceId) {
      const service = services.find(s => s.id === preselectedServiceId)
      if (service) {
        setSelectedService(service)
        setStep('datetime')
      }
    }
  }, [preselectedServiceId, services])

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots()
    }
  }, [selectedDate, selectedService])

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedService) return

    setLoadingSlots(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(
        `/api/tech/availability?techProfileId=${techProfile.id}&date=${dateStr}&duration=${selectedService.duration}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.availableSlots || [])
      } else {
        setAvailableSlots([])
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
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

  const isDateAvailable = (date: Date) => {
    const dayName = DAY_NAMES[date.getDay()]
    const dayAvailability = availability.find(a => a.dayOfWeek === dayName)
    return dayAvailability?.isActive && date >= new Date(new Date().setHours(0, 0, 0, 0))
  }

  const generateCalendarDays = () => {
    const today = new Date()
    const days = []
    for (let i = 0; i < 28; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    return days
  }

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !guestName || !guestEmail) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':')
      const appointmentDate = new Date(selectedDate)
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const servicePrice = parseFloat(selectedService.price)
      const serviceFee = servicePrice * 0.15
      const totalPrice = servicePrice + serviceFee

      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techProfileId: techProfile.id,
          serviceId: selectedService.id,
          appointmentDate: appointmentDate.toISOString(),
          guestName,
          guestEmail,
          guestPhone: guestPhone || null,
          clientNotes: clientNotes || null,
          servicePrice,
          serviceFee,
          totalPrice,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create booking')
      }

      const booking = await response.json()
      setBookingDetails(booking)
      setBookingComplete(true)
      setStep('confirmation')
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Render service selection step
  const renderServiceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 
          className="text-2xl sm:text-3xl font-light tracking-tight mb-2"
          style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
        >
          Select a Service
        </h2>
        <p className="text-sm font-light" style={{ color: theme.primaryColor, opacity: 0.6 }}>
          Choose the service you'd like to book
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => {
              setSelectedService(service)
              setStep('datetime')
            }}
            className="p-6 text-left transition-all duration-300 hover:shadow-md border-2"
            style={{ 
              borderRadius: '8px',
              borderColor: selectedService?.id === service.id ? theme.secondaryColor : 'transparent',
              backgroundColor: theme.accentColor,
            }}
          >
            <h3 
              className="text-lg font-light mb-2"
              style={{ color: theme.primaryColor }}
            >
              {service.name}
            </h3>
            {service.description && (
              <p 
                className="text-sm font-light mb-3 line-clamp-2"
                style={{ color: theme.primaryColor, opacity: 0.7 }}
              >
                {service.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span 
                className="text-xl font-light"
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
          </button>
        ))}
      </div>
    </div>
  )

  // Render date/time selection step
  const renderDateTimeStep = () => {
    const calendarDays = generateCalendarDays()

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 
            className="text-2xl sm:text-3xl font-light tracking-tight mb-2"
            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
          >
            Select Date & Time
          </h2>
          <p className="text-sm font-light" style={{ color: theme.primaryColor, opacity: 0.6 }}>
            {selectedService?.name} - {formatPrice(selectedService?.price)}
          </p>
        </div>

        {/* Date Selection */}
        <div>
          <p 
            className="text-xs tracking-[0.2em] uppercase mb-4 font-light"
            style={{ color: theme.primaryColor, opacity: 0.6 }}
          >
            Select Date
          </p>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const isAvailable = isDateAvailable(date)
              const isSelected = selectedDate?.toDateString() === date.toDateString()
              
              return (
                <button
                  key={index}
                  onClick={() => isAvailable && setSelectedDate(date)}
                  disabled={!isAvailable}
                  className="p-3 text-center transition-all duration-200"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: isSelected ? theme.secondaryColor : isAvailable ? theme.accentColor : '#F0F0F0',
                    color: isSelected ? '#FFFFFF' : isAvailable ? theme.primaryColor : '#CCCCCC',
                    opacity: isAvailable ? 1 : 0.5,
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                  }}
                >
                  <p className="text-xs font-light">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-lg font-light">
                    {date.getDate()}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div>
            <p 
              className="text-xs tracking-[0.2em] uppercase mb-4 font-light"
              style={{ color: theme.primaryColor, opacity: 0.6 }}
            >
              Select Time
            </p>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.secondaryColor }} />
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className="p-3 text-center transition-all duration-200"
                      style={{
                        borderRadius: '8px',
                        backgroundColor: isSelected ? theme.secondaryColor : theme.accentColor,
                        color: isSelected ? '#FFFFFF' : theme.primaryColor,
                      }}
                    >
                      <p className="text-sm font-light">{slot}</p>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p 
                className="text-center py-8 text-sm font-light"
                style={{ color: theme.primaryColor, opacity: 0.6 }}
              >
                No available times for this date
              </p>
            )}
          </div>
        )}

        {/* Continue Button */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => setStep('service')}
            className="flex-1 h-12 rounded-none"
            style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
          >
            Back
          </Button>
          <Button
            onClick={() => setStep('details')}
            disabled={!selectedDate || !selectedTime}
            className="flex-1 h-12 rounded-none"
            style={{ backgroundColor: theme.secondaryColor, color: '#FFFFFF' }}
          >
            Continue
          </Button>
        </div>
      </div>
    )
  }

  // Render details step
  const renderDetailsStep = () => {
    const servicePrice = parseFloat(selectedService?.price || 0)
    const serviceFee = servicePrice * 0.15
    const totalPrice = servicePrice + serviceFee

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 
            className="text-2xl sm:text-3xl font-light tracking-tight mb-2"
            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
          >
            Your Details
          </h2>
          <p className="text-sm font-light" style={{ color: theme.primaryColor, opacity: 0.6 }}>
            Enter your contact information
          </p>
        </div>

        {/* Booking Summary */}
        <div 
          className="p-6"
          style={{ backgroundColor: theme.accentColor, borderRadius: '8px' }}
        >
          <h3 
            className="text-sm tracking-[0.2em] uppercase mb-4 font-light"
            style={{ color: theme.primaryColor, opacity: 0.6 }}
          >
            Booking Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: theme.primaryColor }}>{selectedService?.name}</span>
              <span style={{ color: theme.primaryColor }}>{formatPrice(servicePrice)}</span>
            </div>
            <div className="flex justify-between text-sm" style={{ color: theme.primaryColor, opacity: 0.6 }}>
              <span>Service fee (15%)</span>
              <span>{formatPrice(serviceFee)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t" style={{ borderColor: `${theme.primaryColor}20` }}>
              <span className="font-medium" style={{ color: theme.primaryColor }}>Total</span>
              <span className="font-medium" style={{ color: theme.secondaryColor }}>{formatPrice(totalPrice)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: `${theme.primaryColor}20` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: theme.primaryColor, opacity: 0.7 }}>
              <CalendarIcon className="w-4 h-4" />
              <span>
                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
              </span>
            </div>
          </div>
        </div>

        {/* Guest Form */}
        <div className="space-y-4">
          <div>
            <label 
              className="block text-xs tracking-[0.2em] uppercase mb-2 font-light"
              style={{ color: theme.primaryColor, opacity: 0.6 }}
            >
              Name *
            </label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your full name"
              className="h-12 rounded-none text-base"
              style={{ borderColor: `${theme.primaryColor}30` }}
            />
          </div>
          <div>
            <label 
              className="block text-xs tracking-[0.2em] uppercase mb-2 font-light"
              style={{ color: theme.primaryColor, opacity: 0.6 }}
            >
              Email *
            </label>
            <Input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-12 rounded-none text-base"
              style={{ borderColor: `${theme.primaryColor}30` }}
            />
          </div>
          <div>
            <label 
              className="block text-xs tracking-[0.2em] uppercase mb-2 font-light"
              style={{ color: theme.primaryColor, opacity: 0.6 }}
            >
              Phone (optional)
            </label>
            <Input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="h-12 rounded-none text-base"
              style={{ borderColor: `${theme.primaryColor}30` }}
            />
          </div>
          <div>
            <label 
              className="block text-xs tracking-[0.2em] uppercase mb-2 font-light"
              style={{ color: theme.primaryColor, opacity: 0.6 }}
            >
              Notes (optional)
            </label>
            <Textarea
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Any special requests or notes..."
              className="rounded-none text-base"
              style={{ borderColor: `${theme.primaryColor}30` }}
              rows={3}
            />
          </div>
        </div>

        {/* Cancellation Policy */}
        {techProfile.noShowFeeEnabled && (
          <div 
            className="p-4 flex items-start gap-3"
            style={{ backgroundColor: `${theme.secondaryColor}10`, borderRadius: '8px' }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.secondaryColor }} />
            <p className="text-sm font-light" style={{ color: theme.primaryColor, opacity: 0.8 }}>
              Free cancellation up to {techProfile.cancellationWindowHours || 24} hours before your appointment.
              A {techProfile.noShowFeePercent || 50}% fee applies for no-shows or late cancellations.
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => setStep('datetime')}
            className="flex-1 h-12 rounded-none"
            style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmitBooking}
            disabled={submitting || !guestName || !guestEmail}
            className="flex-1 h-12 rounded-none"
            style={{ backgroundColor: theme.secondaryColor, color: '#FFFFFF' }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Render confirmation step
  const renderConfirmationStep = () => (
    <div className="text-center py-12">
      <div 
        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ backgroundColor: `${theme.secondaryColor}20` }}
      >
        <Check className="w-10 h-10" style={{ color: theme.secondaryColor }} />
      </div>
      <h2 
        className="text-2xl sm:text-3xl font-light tracking-tight mb-4"
        style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
      >
        Booking Confirmed!
      </h2>
      <p 
        className="text-sm font-light mb-8 max-w-md mx-auto"
        style={{ color: theme.primaryColor, opacity: 0.7 }}
      >
        Your appointment has been booked. A confirmation email has been sent to {guestEmail}.
      </p>

      {/* Booking Details */}
      <div 
        className="p-6 text-left max-w-md mx-auto mb-8"
        style={{ backgroundColor: theme.accentColor, borderRadius: '8px' }}
      >
        <h3 
          className="text-sm tracking-[0.2em] uppercase mb-4 font-light"
          style={{ color: theme.primaryColor, opacity: 0.6 }}
        >
          Appointment Details
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-light" style={{ color: theme.primaryColor, opacity: 0.5 }}>Service</p>
            <p style={{ color: theme.primaryColor }}>{selectedService?.name}</p>
          </div>
          <div>
            <p className="text-xs font-light" style={{ color: theme.primaryColor, opacity: 0.5 }}>Date & Time</p>
            <p style={{ color: theme.primaryColor }}>
              {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
            </p>
          </div>
          <div>
            <p className="text-xs font-light" style={{ color: theme.primaryColor, opacity: 0.5 }}>Location</p>
            <p style={{ color: theme.primaryColor }}>{techProfile.location || 'Contact for location'}</p>
          </div>
        </div>
      </div>

      <Link href={`/subdomain/${subdomain}`}>
        <Button
          className="h-12 px-8 rounded-none"
          style={{ backgroundColor: theme.secondaryColor, color: '#FFFFFF' }}
        >
          Back to Website
        </Button>
      </Link>
    </div>
  )

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: '#FFFFFF',
        fontFamily: `${theme.fontFamily}, system-ui, sans-serif`,
      }}
    >
      {/* Header */}
      <header 
        className="border-b sticky top-0 bg-white z-10"
        style={{ borderColor: `${theme.primaryColor}10` }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/subdomain/${subdomain}`}>
            <Button variant="ghost" size="icon" className="rounded-none">
              <ArrowLeft className="w-5 h-5" style={{ color: theme.primaryColor }} />
            </Button>
          </Link>
          <div>
            <h1 
              className="text-lg font-light"
              style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
            >
              {techProfile.businessName || 'Book Appointment'}
            </h1>
            <p className="text-xs font-light" style={{ color: theme.primaryColor, opacity: 0.6 }}>
              {step === 'service' && 'Step 1 of 3'}
              {step === 'datetime' && 'Step 2 of 3'}
              {step === 'details' && 'Step 3 of 3'}
              {step === 'confirmation' && 'Complete'}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {step === 'service' && renderServiceStep()}
        {step === 'datetime' && renderDateTimeStep()}
        {step === 'details' && renderDetailsStep()}
        {step === 'confirmation' && renderConfirmationStep()}
      </main>
    </div>
  )
}
