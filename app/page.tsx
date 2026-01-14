"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Capacitor } from "@capacitor/core"
import { isNativeIOS } from "@/lib/native-bridge"
import LandingPage from "@/components/landing-page"

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isNativeApp, setIsNativeApp] = useState(false)

  useEffect(() => {
    // Check if native platform - do this in useEffect to ensure window is available
    const checkNative = () => {
      const isNative = Capacitor.isNativePlatform() || isNativeIOS()
      setIsNativeApp(isNative)
      
      // If native, immediately redirect to auth without checking session
      if (isNative) {
        console.log('Native iOS detected - bypassing landing page')
        router.push('/auth')
        return true
      }
      return false
    }
    
    // Check native first
    if (checkNative()) {
      return
    }
    
    // Only check session if not native
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (data.user) {
          // User is already logged in, redirect them
          localStorage.setItem("ivoryUser", JSON.stringify(data.user))
          if (data.user.userType === 'tech') {
            router.push('/tech/dashboard')
          } else if (data.user.userType === 'client') {
            router.push('/home')
          } else {
            router.push('/user-type')
          }
        } else {
          // Web user without session - show landing page
          setIsChecking(false)
        }
      } catch (error) {
        console.error('Session check error:', error)
        setIsChecking(false)
      }
    }
    
    checkSession()
  }, [router])

  // For native app, never show landing page - keep blank screen during redirect
  // For web, show loading until session check completes
  if (isChecking || isNativeApp) {
    return (
      <div className="min-h-screen bg-[#000000]" />
    )
  }

  // Show landing page for web users only
  return <LandingPage />
}
