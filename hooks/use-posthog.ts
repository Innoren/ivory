'use client'

import { useEffect } from 'react'
import { posthog } from '@/lib/posthog'

export function usePostHog() {
  return posthog
}

/**
 * Hook to identify a user in PostHog
 * Call this after user logs in or signs up
 */
export function useIdentifyUser(userId?: string | null, userProperties?: Record<string, any>) {
  useEffect(() => {
    if (userId && posthog) {
      posthog.identify(userId, userProperties)
    }
  }, [userId, userProperties])
}

/**
 * Hook to track user signup
 * This is crucial for retention tracking - marks the user's cohort start date
 */
export function useTrackSignup(userId?: string | null, signupProperties?: Record<string, any>) {
  useEffect(() => {
    if (userId && posthog) {
      posthog.capture('user_signed_up', {
        distinct_id: userId,
        ...signupProperties,
      })
    }
  }, [userId, signupProperties])
}

/**
 * Track custom events
 */
export function useTrackEvent(eventName: string, properties?: Record<string, any>) {
  const ph = usePostHog()
  
  return (additionalProperties?: Record<string, any>) => {
    if (ph) {
      ph.capture(eventName, {
        ...properties,
        ...additionalProperties,
      })
    }
  }
}
