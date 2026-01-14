'use client'

import { useEffect, useState } from 'react'
import { PostHogUserTracker } from './posthog-user-tracker'

/**
 * Client component that reads user from localStorage and tracks them in PostHog
 * This must be a separate client component since we need to access localStorage
 */
export function PostHogUserProvider() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Read user from localStorage
    const userStr = localStorage.getItem('ivoryUser')
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ivoryUser') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue))
          } catch (error) {
            console.error('Error parsing user data:', error)
          }
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return <PostHogUserTracker user={user} />
}
