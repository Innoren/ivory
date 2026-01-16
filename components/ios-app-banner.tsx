"use client"

import { useState, useEffect } from "react"
import { X, Download, Sparkles } from "lucide-react"
import Image from "next/image"

export default function IOSAppBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the banner before
    const dismissed = localStorage.getItem("ios-banner-dismissed")
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Check if user is on iOS for better targeting
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    // Show banner after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      setIsDismissed(true)
      localStorage.setItem("ios-banner-dismissed", "true")
    }, 300)
  }

  const handleDownload = () => {
    window.open("https://apps.apple.com/us/app/ivorys-choice/id6756433237", "_blank")
    handleDismiss()
  }

  if (isDismissed) return null

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
      }`}
    >
      {/* Bubble Container with Glassmorphism */}
      <div className="relative bg-white/98 backdrop-blur-2xl border border-[#E8E8E8]/50 shadow-2xl shadow-[#8B7355]/20 rounded-3xl overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7F5] via-white to-[#F8F7F5] opacity-60" />
        
        {/* Elegant top accent line with shimmer effect */}
        <div className="relative h-1 bg-gradient-to-r from-[#8B7355] via-[#1A1A1A] to-[#8B7355] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
        
        <div className="relative p-6 sm:p-7">
          <div className="flex items-start gap-5">
            {/* App Icon with floating animation */}
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative rounded-[20px] overflow-hidden border-2 border-white shadow-xl shadow-[#8B7355]/20 animate-float">
              <Image 
                src="/Web_logo.png" 
                alt="Ivory's Choice App" 
                fill
                className="object-cover"
              />
              {/* Sparkle effect */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#8B7355] rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-3 h-3 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight leading-tight mb-1">
                    Get the iOS App
                  </h3>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#8B7355] font-light flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#8B7355] rounded-full animate-pulse" />
                    Native Experience
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F8F7F5] rounded-full transition-all duration-300"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-relaxed mb-5 tracking-wide">
                Experience faster performance, offline access, and exclusive features
              </p>

              {/* Download Button with gradient hover */}
              <button
                onClick={handleDownload}
                className="relative w-full bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-white hover:from-[#8B7355] hover:to-[#9B8365] transition-all duration-500 ease-out px-6 h-12 sm:h-13 text-[11px] tracking-[0.25em] uppercase rounded-xl font-light flex items-center justify-center gap-2.5 group overflow-hidden shadow-lg hover:shadow-xl hover:shadow-[#8B7355]/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Download className="w-4 h-4 group-hover:animate-bounce relative z-10" strokeWidth={1.5} />
                <span className="relative z-10">Download Free</span>
              </button>

              {/* Feature Pills */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6B6B] bg-[#F8F7F5] px-3 py-1.5 rounded-full font-light border border-[#E8E8E8]">
                  ⚡ Fast
                </span>
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6B6B] bg-[#F8F7F5] px-3 py-1.5 rounded-full font-light border border-[#E8E8E8]">
                  🎨 Beautiful
                </span>
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6B6B] bg-[#F8F7F5] px-3 py-1.5 rounded-full font-light border border-[#E8E8E8]">
                  📱 Native
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant bottom accent line */}
        <div className="relative h-1 bg-gradient-to-r from-[#8B7355] via-[#1A1A1A] to-[#8B7355]" />
      </div>
    </div>
  )
}
