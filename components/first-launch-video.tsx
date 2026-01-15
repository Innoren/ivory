"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isNativeIOS } from "@/lib/native-bridge"
import { Capacitor } from "@capacitor/core"
import { useRouter } from "next/navigation"

export function FirstLaunchVideo() {
  const [showVideo, setShowVideo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true) // Start muted for autoplay
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const isNative = isNativeIOS() || Capacitor.isNativePlatform()

  useEffect(() => {
    // Check if user has already seen the intro video
    const hasSeenVideo = localStorage.getItem("hasSeenIntroVideo")
    
    // Only show video on native iOS and only if they haven't seen it
    if (isNative && !hasSeenVideo) {
      setShowVideo(true)
      setIsLoading(false)
    } else {
      // Web users or users who've already seen video don't see it
      setIsLoading(false)
    }
  }, [isNative])

  // Handle app state changes (pause/resume video)
  useEffect(() => {
    if (!isNative || !showVideo) return

    // Listen for app state changes via native bridge
    const handleVisibilityChange = () => {
      if (videoRef.current) {
        if (document.hidden) {
          videoRef.current.pause()
        } else {
          videoRef.current.play()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isNative, showVideo])

  const requestAppRating = async () => {
    if (!isNative) return

    try {
      // Use native bridge to request rating
      const bridge = window.NativeBridge
      if (bridge && bridge.requestReview) {
        await bridge.requestReview()
      }
    } catch (error) {
      console.log('Rating request not available:', error)
    }
  }

  const handleSkip = () => {
    // Mark video as seen
    localStorage.setItem("hasSeenIntroVideo", "true")
    setShowVideo(false)
    setIsLoading(false)
    
    // Navigate to auth on iOS
    if (isNative) {
      router.push('/auth')
    }
  }

  const handleVideoEnd = async () => {
    // Mark video as seen
    localStorage.setItem("hasSeenIntroVideo", "true")
    setShowVideo(false)
    setIsLoading(false)
    
    // Request app rating after video ends
    await requestAppRating()
    
    // Navigate to auth on iOS
    if (isNative) {
      router.push('/auth')
    }
  }

  const handleVideoLoad = () => {
    setIsLoading(false)
    // Ensure video plays (in case autoplay didn't work)
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        // If autoplay with sound fails, try muted
        if (videoRef.current) {
          videoRef.current.muted = true
          videoRef.current.play()
        }
      })
    }
  }

  // Try to unmute after video starts playing
  const handlePlay = () => {
    if (isMuted && videoRef.current) {
      // Try to unmute after a short delay
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.muted = false
          setIsMuted(false)
        }
      }, 100)
    }
  }

  if (!showVideo) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted={isMuted}
        onEnded={handleVideoEnd}
        onLoadedData={handleVideoLoad}
        onPlay={handlePlay}
        onError={() => {
          // Video failed to load, skip it silently
          handleSkip()
        }}
      >
        <source src="/ivory2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
