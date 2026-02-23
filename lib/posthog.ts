import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
    
    if (apiKey) {
      posthog.init(apiKey, {
        api_host: apiHost,
        person_profiles: 'identified_only', // Only create profiles for logged-in users
        capture_pageview: false, // We'll capture manually in the provider
        capture_pageleave: true,
        autocapture: true,
      })
    }
  }
  
  return posthog
}

export { posthog }
