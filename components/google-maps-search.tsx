"use client"

import { useEffect, useRef, useState } from "react"
import { useLoadScript } from "@react-google-maps/api"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

const libraries: ("places")[] = ["places"]

interface GoogleMapsSearchProps {
  onLocationSelect: (location: string, lat?: number, lng?: number) => void
  placeholder?: string
  className?: string
  value?: string // Add value prop to sync with parent state
}

export function GoogleMapsSearch({ 
  onLocationSelect, 
  placeholder = "Search location...",
  className = "",
  value = ""
}: GoogleMapsSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [inputValue, setInputValue] = useState(value)

  // Sync with parent value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["(cities)"],
      fields: ["formatted_address", "geometry", "name"],
    })

    // Listen for place selection
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      
      if (place?.formatted_address) {
        const location = place.formatted_address
        const lat = place.geometry?.location?.lat()
        const lng = place.geometry?.location?.lng()
        
        setInputValue(location)
        onLocationSelect(location, lat, lng)
      }
    })

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onLocationSelect])

  if (loadError) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
        <Input
          type="text"
          placeholder={placeholder}
          className={className}
          disabled
        />
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
        <Input
          type="text"
          placeholder="Loading..."
          className={className}
          disabled
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          // Call onLocationSelect for manual typing (without coordinates)
          onLocationSelect(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onLocationSelect(inputValue)
          }
        }}
        className={className}
      />
    </div>
  )
}
