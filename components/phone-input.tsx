"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  className?: string
}

// Format phone number as user types: (555) 123-4567
function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Limit to 10 digits (US phone number without country code)
  const limited = digits.slice(0, 10)
  
  // Format based on length
  if (limited.length === 0) return ''
  if (limited.length <= 3) return `(${limited}`
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
}

// Get raw digits from formatted phone
function getRawDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

// Convert to E.164 format for API
export function toE164(value: string): string {
  const digits = getRawDigits(value)
  if (digits.length === 10) {
    return `+1${digits}`
  }
  return digits ? `+1${digits}` : ''
}

export function PhoneInput({ value, onChange, className, disabled, ...props }: PhoneInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Format the display value
  const displayValue = formatPhoneNumber(value)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const digits = getRawDigits(input)
    onChange(digits)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace to work naturally
    if (e.key === 'Backspace') {
      const digits = getRawDigits(value)
      if (digits.length > 0) {
        e.preventDefault()
        onChange(digits.slice(0, -1))
      }
    }
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
        <span className="text-lg">🇺🇸</span>
        <span className="text-sm text-[#6B6B6B] font-light">+1</span>
      </div>
      <Input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "pl-16",
          className
        )}
        placeholder="(555) 123-4567"
        {...props}
      />
    </div>
  )
}
