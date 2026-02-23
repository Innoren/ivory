'use client'

import { useEffect } from 'react'
import { posthog } from '@/lib/posthog'

interface User {
  id: string
  email?: string | null
  username?: string | null
  userType?: string | null
  createdAt?: string | null
}

/**
 * Add this component to your layout or auth provider to automatically
 * identify users when they're logged in
 * 
 * Usage:
 * <PostHogUserTracker user={currentUser} />
 */
export function PostHogUserTracker({ user }: { user: User | null }) {
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined') {
      // Detect platform
      const isNativeApp = !!(window as any).Capacitor || !!(window as any).NativeBridge
      const platform = isNativeApp ? 'ios' : 'web'
      
      // Identify the user in PostHog
      posthog.identify(user.id, {
        email: user.email,
        username: user.username,
        userType: user.userType,
        createdAt: user.createdAt,
        platform,
      })
    } else if (!user && typeof window !== 'undefined') {
      // Reset PostHog when user logs out
      posthog.reset()
    }
  }, [user])

  return null
}

/**
 * Call this function when a user signs up (not on login!)
 * This is CRITICAL for retention tracking
 * 
 * Usage in your signup success handler:
 * trackUserSignup(newUser, 'email')
 */
export function trackUserSignup(
  user: User,
  signupMethod: 'email' | 'google' | 'apple' = 'email'
) {
  if (typeof window !== 'undefined') {
    // Detect platform
    const isNativeApp = !!(window as any).Capacitor || !!(window as any).NativeBridge
    const platform = isNativeApp ? 'ios' : 'web'
    
    // First identify the user
    posthog.identify(user.id, {
      email: user.email,
      username: user.username,
      userType: user.userType,
      createdAt: user.createdAt,
      platform,
    })

    // Then track the signup event (CRITICAL for retention)
    posthog.capture('user_signed_up', {
      signupMethod,
      userType: user.userType,
      platform,
      $set: {
        email: user.email,
        username: user.username,
        userType: user.userType,
        platform,
      },
    })
  }
}

/**
 * Track key events throughout your app
 * 
 * Usage:
 * trackEvent('design_generated', { style: 'modern', creditsUsed: 1 })
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties)
  }
}
