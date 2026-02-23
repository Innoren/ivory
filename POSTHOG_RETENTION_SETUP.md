# PostHog User Retention Tracking Setup

This guide shows you how to track weekly user retention using PostHog.

## 📦 Installation Complete

PostHog has been installed and configured in your app:
- ✅ `posthog-js` package installed via yarn
- ✅ PostHog provider added to root layout
- ✅ Automatic pageview tracking enabled
- ✅ Custom hooks created for user identification and event tracking

## 🔑 Setup Steps

### 1. Get Your PostHog API Key

1. Go to [posthog.com](https://posthog.com) and sign up (or use [eu.posthog.com](https://eu.posthog.com) for EU hosting)
2. Create a new project
3. Copy your Project API Key from Settings → Project → Project API Key
4. Copy your API Host (usually `https://us.i.posthog.com` or `https://eu.i.posthog.com`)

### 2. Add Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_actual_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 3. Identify Users on Login/Signup

Update your authentication flow to identify users. Here's an example:

```typescript
// In your login/signup component or API route
import { useIdentifyUser, useTrackSignup } from '@/hooks/use-posthog'

function YourAuthComponent() {
  const [user, setUser] = useState(null)
  
  // Identify user after login
  useIdentifyUser(user?.id, {
    email: user?.email,
    name: user?.name,
    userType: user?.userType, // 'client' or 'tech'
    createdAt: user?.createdAt,
  })
  
  // Track signup event (only on new user registration)
  useTrackSignup(user?.id, {
    signupMethod: 'email', // or 'google', 'apple'
    userType: user?.userType,
  })
}
```

### 4. Track Key Events

Track important user actions to understand engagement:

```typescript
import { usePostHog } from '@/hooks/use-posthog'

function YourComponent() {
  const posthog = usePostHog()
  
  const handleGenerateDesign = () => {
    posthog.capture('design_generated', {
      designType: 'ai',
      creditsUsed: 1,
    })
  }
  
  const handleBooking = () => {
    posthog.capture('booking_created', {
      techId: techId,
      amount: bookingAmount,
    })
  }
}
```

## 📊 Setting Up Retention Analysis in PostHog

### 1. Create a Retention Insight

1. Go to PostHog Dashboard → Insights → New Insight
2. Select "Retention" as the insight type
3. Configure:
   - **Cohort defining event**: `user_signed_up` (this marks when users join)
   - **Return event**: `$pageview` (or any engagement event like `design_generated`)
   - **Cohort period**: Weekly
   - **Return period**: Weekly

### 2. Understanding the Retention Table

The retention table shows:
- **Week 0**: 100% (all users who signed up that week)
- **Week 1**: % of users who returned in week 1
- **Week 2**: % of users who returned in week 2
- And so on...

### 3. Key Metrics to Track

Create separate retention insights for:

**New User Retention (Weekly)**
- Cohort event: `user_signed_up`
- Return event: `$pageview`
- Period: Weekly

**Feature Engagement Retention**
- Cohort event: `user_signed_up`
- Return event: `design_generated`
- Period: Weekly

**Booking Retention (for techs)**
- Cohort event: `user_signed_up` (filtered by userType = 'tech')
- Return event: `booking_created`
- Period: Weekly

## 🎯 Recommended Events to Track

Add these tracking calls throughout your app:

```typescript
// User onboarding
posthog.capture('onboarding_completed')

// Design generation
posthog.capture('design_generated', { 
  style: style,
  hasReferenceImage: !!referenceImage 
})

// Bookings
posthog.capture('booking_created', { techId, amount })
posthog.capture('booking_completed', { bookingId })

// Credits
posthog.capture('credits_purchased', { amount, credits })

// Social features
posthog.capture('design_shared', { platform })
posthog.capture('tech_followed', { techId })

// Engagement
posthog.capture('collection_created', { name })
posthog.capture('design_saved', { designId })
```

## 📈 Advanced Retention Analysis

### Cohort Comparison

Compare retention between different user segments:

1. Create user cohorts:
   - Users who completed onboarding
   - Users who purchased credits
   - Users by signup method (Google, Apple, Email)
   - Users by type (client vs tech)

2. Run retention analysis filtered by each cohort

### Retention Trends

Track how retention improves over time:
1. Create a retention insight
2. Add a date filter to compare different time periods
3. Look for improvements after feature launches

## 🔍 Example: Finding Your Week 1 Retention

1. Go to Insights → New Insight → Retention
2. Set:
   - Cohort event: `user_signed_up`
   - Return event: `$pageview`
   - Period: Weekly
3. Look at the "Week 1" column
4. This shows what % of new users returned in their first week

## 💡 Tips for Better Retention Tracking

1. **Always track signup**: The `user_signed_up` event is crucial - it defines cohorts
2. **Identify users early**: Call `posthog.identify()` as soon as user logs in
3. **Track meaningful actions**: Don't just track pageviews, track actual engagement
4. **Use properties**: Add context to events (e.g., `userType`, `plan`, `source`)
5. **Set up alerts**: Get notified when retention drops below a threshold

## 🚀 Quick Start Checklist

- [ ] Add PostHog API key to `.env.local`
- [ ] Identify users on login/signup
- [ ] Track `user_signed_up` event on registration
- [ ] Track key engagement events (design generation, bookings, etc.)
- [ ] Create retention insight in PostHog dashboard
- [ ] Set up weekly retention report

## 📚 Resources

- [PostHog Retention Documentation](https://posthog.com/docs/user-guides/retention)
- [PostHog React Integration](https://posthog.com/docs/libraries/react)
- [Understanding Retention Metrics](https://posthog.com/blog/retention-rate-vs-churn-rate)

## 🔧 Troubleshooting

**Events not showing up?**
- Check browser console for errors
- Verify API key is correct
- Make sure events are being captured (check Network tab)

**Retention showing 0%?**
- Ensure `user_signed_up` event is being tracked
- Check that users are being identified with `posthog.identify()`
- Wait 24 hours for data to process

**Want to test locally?**
- PostHog works in development mode
- Check PostHog dashboard → Activity to see live events
