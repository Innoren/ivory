# Native iOS UI Element Hiding

## Overview
On native iOS, certain UI elements are now hidden to provide a cleaner, more native experience. This is because native iOS apps typically have different navigation patterns and design conventions.

## Hidden Elements

### 1. Plus Button in Bottom Navigation
**Location:** `components/bottom-nav.tsx`

The center action button (Plus button) in both the desktop sidebar and mobile bottom navigation is now hidden when running on native iOS.

**Changes:**
- Added `isNativeIOS()` import from `@/lib/native-bridge`
- Added state to track if running on native iOS
- Wrapped both Plus buttons with conditional rendering: `{!isNative && (...)}`

### 2. Create Design Button on Home Page
**Location:** `app/home/page.tsx`

The "Create Design" button and "Upload Design" dialog on the home page are now hidden when running on native iOS.

**Changes:**
- Added `isNativeIOS()` import from `@/lib/native-bridge`
- Added state to track if running on native iOS
- Wrapped the action buttons section with conditional rendering: `{!isNative && (...)}`

## Detection Method

The app uses the `isNativeIOS()` function from `lib/native-bridge.ts` to detect if it's running in the native iOS app:

```typescript
export function isNativeIOS(): boolean {
  return typeof window !== 'undefined' && !!window.NativeBridge;
}
```

This checks for the presence of the `NativeBridge` object which is only available in the native iOS WKWebView environment.

## User Experience

### Web/PWA Users
- See all UI elements including Plus button and Create Design button
- Can create designs directly from the home page

### Native iOS Users
- Plus button and Create Design button are hidden
- Cleaner, more native-feeling interface
- Users can still access design creation through other native iOS navigation patterns

## Testing

To test this functionality:

1. **Web/PWA:** Open the app in a browser - buttons should be visible
2. **Native iOS:** Open the app in the iOS app - buttons should be hidden

## Technical Notes

- The detection happens on component mount using `useEffect`
- State is used to prevent hydration mismatches between server and client
- The `isNativeIOS()` check is safe for SSR as it checks for `window` existence first
