# PostHog Integration Examples

Your PostHog is now configured! Here's how to integrate it into your existing code.

## ✅ Configuration Complete

```bash
NEXT_PUBLIC_POSTHOG_KEY=phx_jIK9njnNpORb7yBVhymJhXFDGqYbHg3z5rWJYQvB0paADL8
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## 🔧 Integration Points

### 1. Track User Signup (CRITICAL for retention)

Add to your signup API route or success handler:

```typescript
// In app/api/auth/signup/route.ts or your signup component
import { posthog } from '@/lib/posthog'

// After successful user creation
posthog.identify(newUser.id, {
  email: newUser.email,
  username: newUser.username,
  userType: newUser.userType,
  createdAt: newUser.createdAt,
})

// Track the signup event (THIS IS CRUCIAL FOR RETENTION)
posthog.capture('user_signed_up', {
  signupMethod: 'email', // or 'google', 'apple'
  userType: newUser.userType,
})
```

### 2. Track User Login

Update `app/api/auth/login/route.ts`:

```typescript
import { posthog } from '@/lib/posthog'

// After successful login, in your response
// Add this to the client-side after receiving the response:
posthog.identify(user.id, {
  email: user.email,
  username: user.username,
  userType: user.userType,
})
```

Or create a client component wrapper:

```typescript
// components/auth-tracker.tsx
'use client'

import { useEffect } from 'react'
import { posthog } from '@/lib/posthog'

export function AuthTracker({ user }: { user: any }) {
  useEffect(() => {
    if (user?.id) {
      posthog.identify(user.id, {
        email: user.email,
        username: user.username,
        userType: user.userType,
      })
    }
  }, [user])

  return null
}
```

### 3. Track Key Events

#### Design Generation
```typescript
// In app/capture/page.tsx or wherever designs are generated
import { posthog } from '@/lib/posthog'

const handleGenerate = async () => {
  // ... your generation logic
  
  posthog.capture('design_generated', {
    style: selectedStyle,
    hasReferenceImage: !!referenceImage,
    creditsUsed: 1,
  })
}
```

#### Booking Created
```typescript
// In booking creation flow
posthog.capture('booking_created', {
  techId: techId,
  amount: bookingAmount,
  serviceType: serviceType,
})
```

#### Credits Purchased
```typescript
// In IAP or Stripe purchase success
posthog.capture('credits_purchased', {
  amount: purchaseAmount,
  credits: creditsAdded,
  method: 'iap', // or 'stripe'
})
```

#### Design Saved
```typescript
// When user saves a design
posthog.capture('design_saved', {
  designId: design.id,
  hasCollection: !!collectionId,
})
```

#### Collection Created
```typescript
// When user creates a collection
posthog.capture('collection_created', {
  name: collectionName,
  isPublic: isPublic,
})
```

## 📊 Testing Your Setup

### 1. Start your dev server
```bash
yarn dev
```

### 2. Open your app and perform actions
- Navigate to a few pages
- Login/signup if possible
- Generate a design
- Any other key actions

### 3. Check PostHog Dashboard
1. Go to https://us.posthog.com
2. Click "Activity" in the left sidebar
3. You should see live events coming in!

Look for:
- `$pageview` events (automatic)
- Any custom events you tracked

## 🎯 Create Your First Retention Insight

### Step 1: Go to Insights
1. Open PostHog dashboard
2. Click "Insights" → "New Insight"

### Step 2: Configure Retention
1. Select "Retention" as insight type
2. Set:
   - **Cohort defining event**: `user_signed_up`
   - **Return event**: `$pageview` (or `design_generated`)
   - **Cohort period**: Weekly
   - **Return period**: Weekly

### Step 3: View Results
- Week 0: 100% (all users who signed up)
- Week 1: X% (users who returned in week 1)
- Week 2: X% (users who returned in week 2)

## 🚨 Important Notes

1. **You need real signups** - Retention tracking requires the `user_signed_up` event
2. **Wait 1 week** - You need at least 1 week of data to see Week 1 retention
3. **Identify users** - Always call `posthog.identify()` on login/signup

## 🔍 Debugging

### Check if PostHog is loaded
Open browser console and type:
```javascript
window.posthog
```
Should return the PostHog object.

### Check if events are being sent
Open browser console → Network tab → Filter by "posthog"
You should see POST requests to `https://us.i.posthog.com/e/`

### View live events
Go to PostHog → Activity → Live Events
You should see events appearing in real-time.

## 📈 Recommended Events to Track

Based on your app, track these key events:

```typescript
// User lifecycle
posthog.capture('user_signed_up')
posthog.capture('onboarding_completed')
posthog.capture('profile_completed')

// Core features
posthog.capture('design_generated')
posthog.capture('design_saved')
posthog.capture('design_shared')
posthog.capture('collection_created')

// Monetization
posthog.capture('credits_purchased')
posthog.capture('subscription_started')
posthog.capture('booking_created')
posthog.capture('booking_completed')

// Engagement
posthog.capture('tech_profile_viewed')
posthog.capture('design_liked')
posthog.capture('tech_followed')
posthog.capture('chat_message_sent')
```

## 🎉 Next Steps

1. ✅ PostHog is configured
2. ⏳ Add tracking to signup flow
3. ⏳ Add tracking to login flow
4. ⏳ Add tracking to key features
5. ⏳ Create retention insight in dashboard
6. ⏳ Wait 1 week for meaningful data

See `POSTHOG_QUICK_START.md` for more details!
