'use client'

import { useEffect } from 'react'
import { useIdentifyUser } from '@/hooks/use-posthog'

interface User {
  id: string
  email?: string | null
  username?: string | null
  userType?: string | null
  createdAt?: string | null
}

/**
 * Component to track authenticated users in PostHog
 * Add this to your layout or auth provider
 */
export function PostHogAuthTracker({ user }: { user: User | null }) {
  useIdentifyUser(
    user?.id,
    user ? {
      email: user.email,
      username: user.username,
      userType: user.userType,
      createdAt: user.createdAt,
    } : undefined
  )

  return null
}

/**
 * Hook to track user signup event
 * Call this in your signup success handler
 */
export function useTrackUserSignup() {
  return (user: User, signupMethod: 'email' | 'google' | 'apple' = 'email') => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('user_signed_up', {
        distinct_id: user.id,
        email: user.email,
        username: user.username,
        userType: user.userType,
        signupMethod,
        $set: {
          email: user.email,
          username: user.username,
          userType: user.userType,
        },
      })
    }
  }
}

// Add to window type
declare global {
  interface Window {
    posthog?: any
  }
}
