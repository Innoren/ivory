# First Launch Video - Debug Guide

## Issue Fixed ✅

**Problem**: Video works on web but not on native iOS - it goes straight to login/signup

**Root Cause**: The `app/page.tsx` was detecting native iOS and immediately redirecting to `/auth`, which happened before the video component could display. The video component was mounting and trying to play, but the page navigation was unmounting it instantly.

**Solution**: Updated `app/page.tsx` to check if the intro video has been seen before redirecting. If it's the first launch (no `hasSeenIntroVideo` in localStorage), the page waits and lets the video component handle the navigation to `/auth` when the video completes.

## How It Works Now

### Flow for First Launch (Native iOS)
1. App opens → `page.tsx` loads
2. Checks `localStorage.getItem("hasSeenIntroVideo")` → returns `null` (first launch)
3. Page does NOT redirect, stays on home page
4. `FirstLaunchVideo` component mounts
5. Detects native iOS + no `hasSeenIntroVideo` → shows video
6. Video plays with skip button
7. When video ends OR user skips:
   - Sets `localStorage.setItem("hasSeenIntroVideo", "true")`
   - Navigates to `/auth`

### Flow for Subsequent Launches (Native iOS)
1. App opens → `page.tsx` loads
2. Checks `localStorage.getItem("hasSeenIntroVideo")` → returns `"true"`
3. Page redirects directly to `/auth` (or dashboard if logged in)
4. `FirstLaunchVideo` component mounts but returns `null` (doesn't show)

## Files Changed

### 1. `app/page.tsx`
- Added check for `hasSeenIntroVideo` before redirecting native users
- If first launch, waits for video to complete instead of redirecting immediately

### 2. `components/first-launch-video.tsx`
- Removed debug/testing code that was forcing video to show on all platforms
- Cleaned up console logs
- Removed debug indicator overlay
- Now properly shows only on native iOS first launch

## Testing

### To Test First Launch Experience:
```javascript
// In browser console or iOS Safari Web Inspector:
localStorage.removeItem("hasSeenIntroVideo")
// Then restart the app
```

### To Skip Video Testing:
```javascript
localStorage.setItem("hasSeenIntroVideo", "true")
```

## Video Requirements

- Video file: `/public/ivory2.mp4`
- Format: MP4 (H.264 codec recommended for iOS compatibility)
- Autoplay: Starts muted, attempts to unmute after playback begins
- Controls: Skip button (X) in top-right corner
- Behavior: Full-screen overlay with z-index 9999

## Console Logs to Watch For

When working correctly, you should see:
```
🎬 HomePage: Waiting for intro video to complete
🎬 FirstLaunchVideo - COMPONENT MOUNTED
🎬 FirstLaunchVideo - isNative: true
🎬 hasSeenIntroVideo: null
🎬 First launch detected - showing video!
🎬 Video loaded successfully
🎬 Attempting to play video
🎬 Video started playing
🎬 Unmuting video
🎬 FirstLaunchVideo - RENDERING VIDEO OVERLAY
```

When video ends or is skipped:
```
🎬 Video ended (or User skipped video)
🎬 Navigating to /auth
```

## Troubleshooting

### Video doesn't show on native iOS
1. Check if `window.NativeBridge` exists in console
2. Check `localStorage.getItem("hasSeenIntroVideo")` - should be `null` for first launch
3. Verify video file exists at `/public/ivory2.mp4`

### Video shows but doesn't play
1. Check video format - must be MP4 with H.264 codec
2. Check file size - large files may take time to load
3. Check iOS version - older versions may have autoplay restrictions

### Video plays but immediately redirects
1. This was the original bug - should be fixed now
2. Verify `page.tsx` has the updated code checking `hasSeenIntroVideo`

### Video shows on web (shouldn't)
1. Check `isNativeIOS()` function in `lib/native-bridge.ts`
2. Verify no testing code is forcing video to show

## Related Files

- `components/first-launch-video.tsx` - Video component
- `app/page.tsx` - Home page with navigation logic
- `app/layout.tsx` - Where FirstLaunchVideo is mounted
- `lib/native-bridge.ts` - Native iOS detection
- `public/ivory2.mp4` - Video file

## Future Enhancements

- Add video progress indicator
- Add sound toggle button
- Support for different video formats/quality based on connection
- Analytics tracking for video completion rate
- A/B testing different intro videos
