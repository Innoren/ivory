"use client"

import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"
import Image from "next/image"

export default function IOSAppBubble() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the bubble before
    const dismissed = localStorage.getItem("iosAppBubbleDismissed")
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Check if user is on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    // Show bubble after 2 seconds if on iOS and not dismissed
    if (isIOS) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("iosAppBubbleDismissed", "true")
    setIsDismissed(true)
  }

  const handleDownload = () => {
    window.open("https://apps.apple.com/us/app/ivorys-choice/id6756433237", "_blank")
    handleDismiss()
  }

  if (isDismissed || !isVisible) return null

  return (
    <div 
      className={`fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-md z-50 transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-xl border border-[#E8E8E8] shadow-2xl shadow-[#8B7355]/10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-300 z-10"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-5">
            {/* App Icon */}
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/Web_logo.png"
                alt="Ivory's Choice App"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="mb-4">
                <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
                  Get the iOS App
                </h3>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="group w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 ease-out px-6 h-12 text-[11px] tracking-[0.25em] uppercase font-light flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4 group-hover:animate-bounce" />
                Download Now
              </button>
            </div>
          </div>
        </div>

        {/* Accent Line */}
        <div className="h-1 bg-gradient-to-r from-[#8B7355] via-[#1A1A1A] to-[#8B7355]" />
      </div>
    </div>
  )
}
