"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GallerySectionProps {
  section: any
  techProfile: any
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }
  subdomain: string
  portfolioImages: any[]
}

export function GallerySection({
  section,
  techProfile,
  theme,
  portfolioImages,
}: GallerySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (portfolioImages.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? portfolioImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === portfolioImages.length - 1 ? 0 : prev + 1))
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
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
            Portfolio
          </p>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight"
            style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}
          >
            Our Work
          </h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {portfolioImages.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden cursor-pointer group"
              style={{ borderRadius: '8px' }}
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.imageUrl}
                alt={image.caption || `Portfolio image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ backgroundColor: `${theme.primaryColor}80` }}
              >
                <span className="text-white text-sm font-light tracking-wider">View</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: `${theme.primaryColor}F0` }}
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/10 z-10"
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/10 z-10"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Image */}
          <div 
            className="max-w-4xl max-h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={portfolioImages[currentIndex].imageUrl}
              alt={portfolioImages[currentIndex].caption || `Portfolio image ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
              style={{ borderRadius: '8px' }}
            />
            {portfolioImages[currentIndex].caption && (
              <p className="text-white text-center mt-4 font-light">
                {portfolioImages[currentIndex].caption}
              </p>
            )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-light">
            {currentIndex + 1} of {portfolioImages.length}
          </div>
        </div>
      )}
    </section>
  )
}
