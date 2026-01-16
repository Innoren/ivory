"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

// Common country codes
const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'United States', maxDigits: 10 },
  { code: '+1', flag: '🇨🇦', name: 'Canada', maxDigits: 10 },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom', maxDigits: 10 },
  { code: '+61', flag: '🇦🇺', name: 'Australia', maxDigits: 9 },
  { code: '+33', flag: '🇫🇷', name: 'France', maxDigits: 9 },
  { code: '+49', flag: '🇩🇪', name: 'Germany', maxDigits: 11 },
  { code: '+39', flag: '🇮🇹', name: 'Italy', maxDigits: 10 },
  { code: '+34', flag: '🇪🇸', name: 'Spain', maxDigits: 9 },
  { code: '+81', flag: '🇯🇵', name: 'Japan', maxDigits: 10 },
  { code: '+86', flag: '🇨🇳', name: 'China', maxDigits: 11 },
  { code: '+91', flag: '🇮🇳', name: 'India', maxDigits: 10 },
  { code: '+52', flag: '🇲🇽', name: 'Mexico', maxDigits: 10 },
  { code: '+55', flag: '🇧🇷', name: 'Brazil', maxDigits: 11 },
  { code: '+82', flag: '🇰🇷', name: 'South Korea', maxDigits: 10 },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands', maxDigits: 9 },
  { code: '+46', flag: '🇸🇪', name: 'Sweden', maxDigits: 9 },
  { code: '+47', flag: '🇳🇴', name: 'Norway', maxDigits: 8 },
  { code: '+45', flag: '🇩🇰', name: 'Denmark', maxDigits: 8 },
  { code: '+358', flag: '🇫🇮', name: 'Finland', maxDigits: 10 },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland', maxDigits: 9 },
  { code: '+43', flag: '🇦🇹', name: 'Austria', maxDigits: 10 },
  { code: '+32', flag: '🇧🇪', name: 'Belgium', maxDigits: 9 },
  { code: '+351', flag: '🇵🇹', name: 'Portugal', maxDigits: 9 },
  { code: '+353', flag: '🇮🇪', name: 'Ireland', maxDigits: 9 },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand', maxDigits: 9 },
  { code: '+65', flag: '🇸🇬', name: 'Singapore', maxDigits: 8 },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong', maxDigits: 8 },
  { code: '+971', flag: '🇦🇪', name: 'UAE', maxDigits: 9 },
  { code: '+972', flag: '🇮🇱', name: 'Israel', maxDigits: 9 },
  { code: '+27', flag: '🇿🇦', name: 'South Africa', maxDigits: 9 },
]

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  countryCode?: string
  onCountryCodeChange?: (code: string) => void
  className?: string
}

// Format phone number as user types: (555) 123-4567 for US/CA
function formatPhoneNumber(value: string, countryCode: string): string {
  const digits = value.replace(/\D/g, '')
  
  // US/Canada format
  if (countryCode === '+1') {
    const limited = digits.slice(0, 10)
    if (limited.length === 0) return ''
    if (limited.length <= 3) return `(${limited}`
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
  }
  
  // UK format: 7911 123456
  if (countryCode === '+44') {
    const limited = digits.slice(0, 10)
    if (limited.length === 0) return ''
    if (limited.length <= 4) return limited
    return `${limited.slice(0, 4)} ${limited.slice(4)}`
  }
  
  // Generic international format: group by 3s
  const country = COUNTRY_CODES.find(c => c.code === countryCode)
  const maxDigits = country?.maxDigits || 10
  const limited = digits.slice(0, maxDigits)
  
  if (limited.length === 0) return ''
  if (limited.length <= 3) return limited
  if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`
  if (limited.length <= 9) return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`
  return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 9)} ${limited.slice(9)}`
}

// Get raw digits from formatted phone
function getRawDigits(value: string, countryCode: string): string {
  const country = COUNTRY_CODES.find(c => c.code === countryCode)
  const maxDigits = country?.maxDigits || 10
  return value.replace(/\D/g, '').slice(0, maxDigits)
}

// Convert to E.164 format for API
export function toE164(value: string, countryCode: string = '+1'): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length > 0) {
    return `${countryCode}${digits}`
  }
  return ''
}

export function PhoneInput({ 
  value, 
  onChange, 
  countryCode = '+1',
  onCountryCodeChange,
  className, 
  disabled, 
  ...props 
}: PhoneInputProps) {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [internalCountryCode, setInternalCountryCode] = React.useState(countryCode)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  
  const activeCountryCode = onCountryCodeChange ? countryCode : internalCountryCode
  const setActiveCountryCode = onCountryCodeChange || setInternalCountryCode
  
  // Find current country
  const currentCountry = COUNTRY_CODES.find(c => c.code === activeCountryCode) || COUNTRY_CODES[0]
  
  // Format the display value
  const displayValue = formatPhoneNumber(value, activeCountryCode)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const digits = getRawDigits(input, activeCountryCode)
    onChange(digits)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const digits = getRawDigits(value, activeCountryCode)
      if (digits.length > 0) {
        e.preventDefault()
        onChange(digits.slice(0, -1))
      }
    }
  }
  
  const handleCountrySelect = (country: typeof COUNTRY_CODES[0]) => {
    setActiveCountryCode(country.code)
    setShowDropdown(false)
    // Clear the phone number when changing country
    onChange('')
  }
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex" ref={dropdownRef}>
      {/* Country Code Selector */}
      <button
        type="button"
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1 px-3 border border-r-0 border-[#E8E8E8] bg-[#FAFAF8] rounded-l-lg hover:bg-[#F0F0F0] transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="text-lg">{currentCountry.flag}</span>
        <span className="text-sm text-[#6B6B6B] font-light">{activeCountryCode}</span>
        <ChevronDown className="w-3 h-3 text-[#6B6B6B]" />
      </button>
      
      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-[#E8E8E8] rounded-lg shadow-lg z-50">
          {COUNTRY_CODES.map((country, index) => (
            <button
              key={`${country.code}-${index}`}
              type="button"
              onClick={() => handleCountrySelect(country)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 hover:bg-[#FAFAF8] transition-colors text-left",
                country.code === activeCountryCode && "bg-[#FAFAF8]"
              )}
            >
              <span className="text-lg">{country.flag}</span>
              <span className="text-sm text-[#1A1A1A] flex-1">{country.name}</span>
              <span className="text-sm text-[#6B6B6B]">{country.code}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Phone Input */}
      <Input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "rounded-l-none flex-1",
          className
        )}
        placeholder={activeCountryCode === '+1' ? "(555) 123-4567" : "Enter phone number"}
        {...props}
      />
    </div>
  )
}
