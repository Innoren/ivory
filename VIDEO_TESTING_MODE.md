# Video Testing Mode - ACTIVE ⚠️

## Current Configuration

The first launch video is now in **TESTING MODE** and will play **EVERY TIME** you open the native iOS app.

## What Changed

### 1. `components/first-launch-video.tsx`
- Video now shows on **every** native iOS app launch (not just first time)
- Does NOT save `hasSeenIntroVideo` to localStorage
- Video will play every single time until you disable testing mode

### 2. `app/page.tsx`
- Always waits for video on native iOS (doesn't check localStorage)
- Video component handles navigation to `/auth` when done

## Testing Flow

1. Open native iOS app
2. Video plays immediately (full screen)
3. You can:
   - Watch the full video → navigates to `/auth`
   - Tap X to skip → navigates to `/auth`
4. Close and reopen app → video plays again

## Console Logs

You should see:
```
🎬 HomePage: TESTING MODE - Waiting for intro video
🎬 FirstLaunchVideo - COMPONENT MOUNTED
🎬 FirstLaunchVideo - isNative: true
🎬 TESTING MODE: Forcing video to show on native iOS
🎬 Video loaded successfully
🎬 Attempting to play video
🎬 Video started playing
🎬 Unmuting video
```

## To Disable Testing Mode

When you're done testing and want to restore normal behavior (video only on first launch):

### In `components/first-launch-video.tsx`:

**Replace this:**
```typescript
useEffect(() => {
  console.log('🎬 FirstLaunchVideo - COMPONENT MOUNTED')
  console.log('🎬 FirstLaunchVideo - isNative:', isNative)
  
  // TESTING MODE: Always show video on native iOS
  if (isNative) {
    console.log('🎬 TESTING MODE: Forcing video to show on native iOS')
    setShowVideo(true)
    setIsLoading(false)
    return
  }
  
  // Web users don't see video
  console.log('🎬 Not native platform, skipping video')
  setIsLoading(false)
}, [isNative])
```

**With this:**
```typescript
useEffect(() => {
  console.log('🎬 FirstLaunchVideo - COMPONENT MOUNTED')
  console.log('🎬 FirstLaunchVideo - isNative:', isNative)
  
  // Only show video on iOS native app, not web
  if (!isNative) {
    console.log('🎬 Not native platform, skipping video')
    setIsLoading(false)
    return
  }

  // Check if user has seen the intro video
  const hasSeenIntro = localStorage.getItem("hasSeenIntroVideo")
  console.log('🎬 hasSeenIntroVideo:', hasSeenIntro)
  
  if (!hasSeenIntro) {
    console.log('🎬 First launch detected - showing video!')
    setShowVideo(true)
    setIsLoading(false)
  } else {
    console.log('🎬 Video already seen, skipping')
    setIsLoading(false)
  }
}, [isNative])
```

**And uncomment localStorage saves in handleSkip and handleVideoEnd:**
```typescript
localStorage.setItem("hasSeenIntroVideo", "true")
```

### In `app/page.tsx`:

**Replace this:**
```typescript
// TESTING MODE: Always wait for video on native iOS
if (isNativeApp) {
  console.log('🎬 HomePage: TESTING MODE - Waiting for intro video')
  setIsChecking(false)
  return
}
```

**With this:**
```typescript
// Check if intro video should be shown (only on first launch)
const hasSeenIntro = localStorage.getItem("hasSeenIntroVideo")

// If native app and hasn't seen intro, wait for video to complete
if (isNativeApp && !hasSeenIntro) {
  console.log('🎬 HomePage: Waiting for intro video to complete')
  setIsChecking(false)
  return
}
```

## Video File

Make sure `/public/ivory2.mp4` exists and is a valid MP4 file with H.264 codec for iOS compatibility.

## Troubleshooting

### Video doesn't show
1. Check console for `window.NativeBridge` - should exist on native iOS
2. Verify video file exists at `/public/ivory2.mp4`
3. Check console logs for errors

### Video shows but doesn't play
1. Check video format (must be MP4 with H.264)
2. Check file size (keep under 10MB)
3. Check iOS Safari Web Inspector for errors

### Video plays but no sound
- iOS requires user interaction for sound
- Component tries to unmute after playback starts
- This is normal iOS behavior for autoplay

## Files Modified

- `components/first-launch-video.tsx` - Testing mode enabled
- `app/page.tsx` - Always waits for video on native
- `VIDEO_TESTING_MODE.md` - This guide
