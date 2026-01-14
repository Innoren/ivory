# PostHog iOS App Tracking

## ✅ Yes, PostHog Works on iOS!

Your PostHog implementation **automatically works on your native iOS app** because:

1. **Your iOS app uses Capacitor** - Loads your Next.js app in WKWebView
2. **PostHog is JavaScript-based** - Runs in the WebView environment
3. **Same codebase** - iOS and web use the same React components
4. **Unified tracking** - All events go to the same PostHog project

## 🎯 What Gets Tracked on iOS

Everything that works on web also works on iOS:

- ✅ User signups (`user_signed_up` event)
- ✅ User logins (automatic identification)
- ✅ Pageviews (automatic tracking)
- ✅ Custom events (design generation, bookings, etc.)
- ✅ User properties (email, username, userType)
- ✅ Platform detection (now includes 'ios' or 'web')

## 📊 Viewing iOS vs Web Users

With the platform tracking added, you can now:

### In PostHog Dashboard

**Filter by platform:**
1. Go to any insight
2. Add filter: `platform = ios` or `platform = web`
3. See iOS-only or web-only data

**Compare platforms:**
1. Create retention insight
2. Add breakdown by `platform`
3. See retention for iOS vs web side-by-side

**Example queries:**
- "Show me iOS user retention"
- "How many signups came from iOS vs web?"
- "Do iOS users have better retention than web users?"

## 🔍 How to Verify iOS Tracking

### Test on iOS Simulator/Device

1. **Build and run iOS app:**
   ```bash
   yarn export
   npx cap sync ios
   npx cap open ios
   ```

2. **Sign up or log in** on the iOS app

3. **Check PostHog dashboard:**
   - Go to https://us.posthog.com
   - Click "Activity" → "Live Events"
   - You should see events with `platform: "ios"`

### Check Event Properties

In PostHog, click on any event to see:
```json
{
  "event": "user_signed_up",
  "properties": {
    "platform": "ios",
    "signupMethod": "email",
    "userType": "client",
    "$os": "iOS",
    "$browser": "Mobile Safari"
  }
}
```

## 🎨 Platform-Specific Retention

Create separate retention insights for each platform:

### iOS User Retention
- Cohort event: `user_signed_up` where `platform = ios`
- Return event: `$pageview`
- Period: Weekly

### Web User Retention
- Cohort event: `user_signed_up` where `platform = web`
- Return event: `$pageview`
- Period: Weekly

### Compare Both
- Cohort event: `user_signed_up`
- Return event: `$pageview`
- Period: Weekly
- Breakdown by: `platform`

## 🚀 Advanced: Track iOS-Specific Events

You can track iOS-specific features:

```typescript
import { trackEvent } from '@/components/posthog-user-tracker'

// Track iOS-specific features
trackEvent('ios_haptic_feedback_used')
trackEvent('ios_camera_permission_granted')
trackEvent('ios_push_notification_enabled')
```

## 📱 Platform Detection

The platform is automatically detected using:

```typescript
const isNativeApp = !!(window as any).Capacitor || !!(window as any).NativeBridge
const platform = isNativeApp ? 'ios' : 'web'
```

This checks for:
- Capacitor API (your iOS app framework)
- NativeBridge (your custom bridge)

## 🎯 Key Benefits

1. **Unified Analytics** - One dashboard for web + iOS
2. **Cross-Platform Retention** - Track users across platforms
3. **Platform Comparison** - See which platform has better retention
4. **Same Implementation** - No separate iOS SDK needed

## ✅ Summary

- PostHog works on iOS automatically ✅
- Platform tracking added (ios/web) ✅
- Can filter and compare platforms ✅
- Same retention tracking for both ✅

Your iOS app is now fully tracked in PostHog!
