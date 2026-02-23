# First Launch Video Setup

## Current Status: 🟡 TESTING MODE

**The video is currently set to show for ALL platforms (web + iOS) for debugging.**

**📖 See `INTRO_VIDEO_DEBUG_GUIDE.md` for detailed debugging instructions!**

## Overview
Your app now has a first-launch intro video that plays only once when users open the iOS native app for the first time, with App Store rating prompt after completion.

## Features
- ✅ Plays automatically on first app launch (iOS native only in production)
- ✅ Full-screen video experience
- ✅ Skip button (X) in top-right corner
- ✅ Never shows again after first view
- ✅ Loading spinner while video loads
- ✅ Pauses/resumes when app backgrounds/foregrounds
- ✅ Navigates to `/auth` (login/signup) after video ends
- ✅ Shows App Store rating prompt after video completes
- ✅ Uses native Swift bridge (NOT Capacitor)
- ✅ Smart autoplay: starts muted, then unmutes after playback begins
- 🟡 Currently in testing mode (shows on web + iOS)

## Video File
**Current:** `public/ivory2.mp4`

### Important: iOS Loads from Localhost
The iOS app loads the web app from `http://localhost:3000` in DEBUG mode, which means:
- ✅ Video is served by Next.js dev server
- ⚠️ **You MUST have `yarn dev` running** for the video to load in iOS simulator
- ✅ Video file is in `public/ivory2.mp4` (Next.js public folder)
- ❌ Video is NOT bundled in iOS app (it's served from localhost)

### Video Format Notes
The component uses MP4 format for maximum compatibility:
- **Format:** MP4 (H.264 codec recommended)
- **Audio:** Enabled with smart autoplay (starts muted, unmutes after playback)
- **Autoplay:** Enabled with `playsInline` for iOS
- **Browser Compatibility:** Starts muted to bypass autoplay restrictions, then unmutes

### Why Start Muted?
Modern browsers (including Safari) block autoplay with sound. The video:
1. Starts muted (allowed by all browsers)
2. Begins playing automatically
3. Unmutes after 100ms once playback starts
4. User hears audio without needing to click anything

### To Replace the Video
1. Export your video as MP4 (H.264 codec)
2. Name it `ivory2.mp4` (or update the component)
3. Place in the `public/` folder
4. Restart Next.js dev server: `yarn dev`

## Debugging

### Video Not Showing in iOS Simulator?
**📖 Read `INTRO_VIDEO_DEBUG_GUIDE.md` for complete debugging steps!**

Quick checklist:
1. ✅ Is `yarn dev` running? (Check http://localhost:3000)
2. ✅ Does video exist? (`ls -lh public/ivory2.mp4`)
3. ✅ Open Safari Web Inspector (Safari → Develop → Simulator)
4. ✅ Check Console tab for "FirstLaunchVideo - COMPONENT MOUNTED"
5. ✅ Check Network tab for `/ivory2.mp4` request

**Remember:** Xcode console does NOT show JavaScript console.log() messages!

## How It Works
1. Component checks if running on iOS native app (`window.NativeBridge`)
2. Checks `localStorage` for `hasSeenIntroVideo` flag
3. If not found AND on iOS native, displays full-screen video
4. Video plays with pause/resume on app background/foreground
5. User can skip by clicking X button
6. When video ends or is skipped:
   - Sets `hasSeenIntroVideo` flag in localStorage
   - Requests App Store rating (native `SKStoreReviewController`)
   - Navigates to `/auth` page
7. Never shows again

## Testing Mode (Current)
The component has these temporary lines for testing:
```typescript
// TEMPORARY: Show video for EVERYONE (web and native) for testing
console.log('FORCING VIDEO TO SHOW FOR ALL PLATFORMS (TESTING)')
setShowVideo(true)
setIsLoading(false)
return
```

This means the video currently:
- ✅ Shows on web AND iOS (ignores native detection)
- ✅ Shows every time (ignores localStorage)
- ✅ Useful for debugging

**Remove these lines after debugging to restore iOS-only behavior!**

## Testing
To test the video again after seeing it:
1. Open Safari Web Inspector (Safari → Develop → Simulator)
2. Go to Console tab
3. Run: `localStorage.removeItem('hasSeenIntroVideo')`
4. Reload the app

Or in browser DevTools:
```javascript
localStorage.removeItem('hasSeenIntroVideo')
location.reload()
```

## iOS Setup Required

### Add RatingManager.swift to Xcode
The rating prompt requires adding a new file to Xcode:

1. Open Xcode
2. Right-click on the `App` folder in Project Navigator
3. Select "Add Files to 'App'..."
4. Navigate to `ios/App/App/RatingManager.swift`
5. ✅ Check "Copy items if needed"
6. ✅ Check your app target
7. Click "Add"

### Rebuild iOS App
After adding the file:
```bash
# Clean and rebuild
cd ios/App
xcodebuild clean
```

Then build and run in Xcode.

## Customization Options

### Remove Testing Mode (Restore iOS-Only Behavior)
Edit `components/first-launch-video.tsx` and remove these lines:
```typescript
// REMOVE THESE LINES:
console.log('FORCING VIDEO TO SHOW FOR ALL PLATFORMS (TESTING)')
setShowVideo(true)
setIsLoading(false)
return
```

After removal, video will only show on iOS native app on first launch.

### Change Navigation Destination
```tsx
// Change where user goes after video
if (isNative) {
  router.push('/home')  // Instead of '/auth'
}
```

### Disable Rating Prompt
```tsx
// Comment out the rating request
// await requestAppRating()
```

### Disable Audio
```tsx
<video
  muted={true}  // Change to true for silent video
  ...
>
```

### Change Skip Button Style
```tsx
<Button
  className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm"
  ...
>
```

## File Structure
```
components/
  └── first-launch-video.tsx    # Main component
app/
  └── layout.tsx                 # Integrated here
public/
  └── ivory2.mp4                 # Your video
lib/
  └── native-bridge.ts           # iOS detection & rating function
ios/App/App/
  ├── RatingManager.swift        # App Store rating handler
  ├── WebViewModel.swift         # Bridge injection (updated)
  └── RatingPlugin.swift         # Old plugin (not used)
```

## Production Behavior (After Removing Test Code)

Once you remove the testing lines, the video will:
1. ✅ Only show on iOS native app (not web)
2. ✅ Only show on first launch (checks `hasSeenIntroVideo`)
3. ✅ Pause/resume when app backgrounds/foregrounds
4. ✅ Navigate to `/auth` after video ends
5. ✅ Show App Store rating prompt (max 3 times per year per user)
6. ✅ Allow user to skip with X button

## App Store Compliance

The rating prompt uses Apple's native `SKStoreReviewController`:
- ✅ App Store compliant
- ✅ Shows at most 3 times per year per user (Apple's limit)
- ✅ Can be dismissed by user
- ✅ Doesn't interrupt flow if user already rated
- ✅ No custom UI (uses Apple's native prompt)

## Notes
- Video is positioned at z-index 9999 to appear above everything
- Uses `object-cover` to fill screen while maintaining aspect ratio
- Supports both portrait and landscape orientations
- Video plays with sound by default (`muted={false}`)
- Uses `visibilitychange` event for pause/resume
- iOS app loads from localhost:3000 in DEBUG mode
- Production builds will load from https://www.ivoryschoice.com

## Next Steps

1. ✅ Make sure `yarn dev` is running
2. ✅ Add `RatingManager.swift` to Xcode project
3. ✅ Open Safari Web Inspector to see JavaScript logs
4. ✅ Test video playback in iOS simulator
5. ✅ Verify rating prompt appears after video
6. ✅ Test navigation to `/auth` works
7. ⚠️ Remove testing code before production
8. ✅ Test on real iOS device
