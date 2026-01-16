# Notification Permission Timing Update

## Overview
Updated the notification permission request to appear **after user login** instead of immediately on app launch. This follows Apple's best practices and provides a better user experience.

## Changes Made

### 1. iOS Native (AppDelegate.swift)
**Before:**
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions...) {
    // Request notification permissions immediately on launch
    NotificationManager.shared.requestAuthorization { granted in
        os_log("📱 Notification permission: %@", granted ? "granted" : "denied")
    }
}
```

**After:**
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions...) {
    // Don't request notification permissions on launch - wait until after login
    // This provides a better user experience and follows Apple's best practices
}
```

### 2. Web Auth Flow (app/auth/page.tsx)
Added notification permission request after successful authentication in three places:

#### A. Email/Password Login
```typescript
// After successful login
if (isNativeIOS()) {
    try {
        const { requestNotificationPermission } = await import('@/lib/native-bridge')
        await requestNotificationPermission()
    } catch (error) {
        console.log('Notification permission request skipped:', error)
    }
}
```

#### B. Email/Password Signup
```typescript
// After successful signup
if (isNativeIOS()) {
    try {
        const { requestNotificationPermission } = await import('@/lib/native-bridge')
        await requestNotificationPermission()
    } catch (error) {
        console.log('Notification permission request skipped:', error)
    }
}
```

#### C. OAuth Flow (Google/Apple Sign In)
```typescript
// After OAuth session is detected
if (isNativeIOS()) {
    try {
        const { requestNotificationPermission } = await import('@/lib/native-bridge')
        await requestNotificationPermission()
    } catch (error) {
        console.log('Notification permission request skipped:', error)
    }
}
```

## User Experience Flow

### Before
1. User downloads app
2. **Notification permission prompt appears immediately** ❌
3. User hasn't seen value yet, likely denies
4. User logs in/signs up
5. App can't send notifications

### After
1. User downloads app
2. User logs in or signs up
3. User sees the app's value
4. **Notification permission prompt appears** ✅
5. User is more likely to grant permission
6. App can send helpful notifications

## Benefits

1. **Better Conversion Rate**: Users are more likely to grant permission after seeing the app's value
2. **Apple Guidelines**: Follows Apple's recommendation to request permissions in context
3. **User Trust**: Doesn't feel intrusive or pushy on first launch
4. **Timing**: Permission request happens when user is engaged (just logged in)

## Testing

### Test on iOS Device
1. Delete the app completely
2. Reinstall from Xcode or TestFlight
3. Launch the app
4. **Verify**: No notification permission prompt appears
5. Complete login or signup
6. **Verify**: Notification permission prompt appears after successful auth
7. Grant or deny permission
8. Check Settings > Notifications > Ivory's Choice to verify status

### Test OAuth Flow
1. Delete the app
2. Reinstall
3. Launch and tap "Sign in with Google" or "Sign in with Apple"
4. Complete OAuth flow
5. **Verify**: Notification permission prompt appears after OAuth completes

## Notes

- Permission is only requested on iOS native app (not web)
- Uses dynamic import to avoid loading native bridge on web
- Gracefully handles errors if native bridge is unavailable
- Session restoration (already logged in users) does NOT re-prompt
- Users can always change permission in iOS Settings later

## Related Files
- `ios/App/App/AppDelegate.swift` - Removed auto-request on launch
- `app/auth/page.tsx` - Added post-login request
- `lib/native-bridge.ts` - Notification permission functions
- `ios/App/App/NotificationManager.swift` - Permission handling
