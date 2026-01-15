# First Launch Intro Video - Complete Setup

## ✅ What's Implemented

Your app now has a polished first-launch experience with:

1. **Intro Video** (`public/ivory2.mp4`)
   - Only shows on iOS native app (hidden on web)
   - Plays automatically on first launch only
   - Full-screen with sound
   - X button to skip

2. **Smart Pause/Resume**
   - Video pauses when app goes to background
   - Resumes when app returns to foreground

3. **Post-Video Flow**
   - After video ends → App Store rating prompt
   - Then navigates to `/auth` (login/signup)

4. **App Store Rating**
   - Uses Apple's native `SKStoreReviewController`
   - 100% App Store compliant
   - Apple controls when/how often it shows

## 🔧 Final Setup Steps

### 1. Add Rating Plugin to Xcode

Open Xcode and add the `RatingPlugin.swift` file:

```bash
yarn cap:open:ios
```

In Xcode:
1. Right-click on `App` folder
2. Select "Add Files to App"
3. Navigate to `ios/App/App/RatingPlugin.swift`
4. Check "Copy items if needed"
5. Click "Add"

### 2. Register the Plugin

The plugin is already created at `ios/App/App/RatingPlugin.swift`. Capacitor will auto-register it.

### 3. Test the Video

To test again after seeing it once:
```javascript
// In browser console
localStorage.removeItem('hasSeenIntroVideo')
```

Then refresh or restart the app.

## 📱 How It Works

### First Launch Flow
```
App Opens (first time)
  ↓
Video plays (ivory2.mp4)
  ↓
User watches or skips
  ↓
Rating prompt appears (iOS native)
  ↓
Navigate to /auth
```

### Subsequent Launches
```
App Opens
  ↓
Skip video (already seen)
  ↓
Normal app flow
```

## 🎯 Key Features

- **iOS Only**: Web users never see the video
- **One Time**: Shows only on first launch
- **Pause/Resume**: Handles app backgrounding gracefully
- **Rating Prompt**: Apple's official API (App Store compliant)
- **Smooth Navigation**: Auto-redirects to auth after video

## 📝 Notes

### Apple Rating Guidelines
- Apple limits how often the rating prompt can show (max 3 times per year)
- The prompt may not always appear (Apple's decision)
- This is normal and expected behavior
- Never try to force or bypass Apple's limits

### Video File
- Current: `public/ivory2.mp4`
- Format: MP4 (best browser support)
- To replace: Just swap the file and update the path in `components/first-launch-video.tsx`

## 🔍 Troubleshooting

**Video doesn't show:**
- Check localStorage: `localStorage.getItem('hasSeenIntroVideo')`
- Make sure you're on iOS native (not web)
- Clear the flag and try again

**Rating prompt doesn't appear:**
- This is normal! Apple controls when it shows
- It won't show every time
- Apple limits it to prevent spam

**Video doesn't pause on background:**
- Make sure `@capacitor/app` is installed (it is)
- Check that the app state listener is working

## ✨ All Done!

Your first-launch video experience is complete and ready for the App Store!
