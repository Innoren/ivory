# PostHog Quick Start - Weekly Retention Tracking

## ⚡ 5-Minute Setup

### 1. Get API Key (2 min)
```bash
# 1. Sign up at posthog.com
# 2. Copy your Project API Key
# 3. Add to .env.local:

NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 2. Track User Signup (1 min)
```typescript
// In your signup success handler
import { posthog } from '@/lib/posthog'

// After successful signup
posthog.identify(user.id, {
  email: user.email,
  userType: user.userType,
})

posthog.capture('user_signed_up', {
  signupMethod: 'email', // or 'google', 'apple'
})
```

### 3. Track User Login (1 min)
```typescript
// In your login success handler
import { posthog } from '@/lib/posthog'

// After successful login
posthog.identify(user.id, {
  email: user.email,
  userType: user.userType,
})
```

### 4. View Retention (1 min)
```
1. Go to PostHog Dashboard
2. Click "Insights" → "New Insight"
3. Select "Retention"
4. Set:
   - Cohort event: user_signed_up
   - Return event: $pageview
   - Period: Weekly
5. Click "Calculate"
```

## 📊 Reading Your Retention Data

The table shows:
- **Week 0**: 100% (baseline - all users who signed up)
- **Week 1**: X% of users returned in week 1
- **Week 2**: X% of users returned in week 2
- **Week 3**: X% of users returned in week 3

Example:
```
Week 0: 100% (50 users signed up)
Week 1: 40%  (20 users came back)
Week 2: 30%  (15 users came back)
Week 3: 25%  (12 users came back)
```

## 🎯 Key Events to Track

```typescript
import { posthog } from '@/lib/posthog'

// Design generation
posthog.capture('design_generated')

// Bookings
posthog.capture('booking_created')

// Credits
posthog.capture('credits_purchased', { amount: 10 })

// Engagement
posthog.capture('design_saved')
posthog.capture('collection_created')
```

## 🔍 Common Retention Queries

**Weekly New User Retention**
- Cohort: `user_signed_up`
- Return: `$pageview`
- Period: Weekly

**Feature Engagement**
- Cohort: `user_signed_up`
- Return: `design_generated`
- Period: Weekly

**Paying User Retention**
- Cohort: `credits_purchased`
- Return: `$pageview`
- Period: Weekly

## ✅ Checklist

- [ ] Added PostHog API key to `.env.local`
- [ ] Restart dev server (`yarn dev`)
- [ ] Track `user_signed_up` on registration
- [ ] Track `posthog.identify()` on login
- [ ] Create retention insight in PostHog
- [ ] Wait 1 week for meaningful data

## 🚨 Troubleshooting

**Not seeing events?**
```bash
# Check browser console
# Should see: [PostHog] event captured

# Verify in PostHog dashboard:
# Activity → Live Events
```

**Retention showing 0%?**
- Need at least 2 weeks of data
- Ensure `user_signed_up` is tracked
- Check that users are identified

## 📈 Next Steps

1. Track more engagement events
2. Create user segments (cohorts)
3. Compare retention by user type
4. Set up retention alerts
5. A/B test features to improve retention

## 🔗 Full Documentation

See `POSTHOG_RETENTION_SETUP.md` for complete guide.
