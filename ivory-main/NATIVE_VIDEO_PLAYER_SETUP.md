# Native iOS Video Player Setup

## What Changed

Instead of relying on the WebView to play the video (which wasn't working), we've created a **native iOS video player** using AVKit that plays directly from the app bundle.

## Files Created/Modified

1. **`ios/App/App/IntroVideoViewController.swift`** - New native video player
2. **`ios/App/App/ContentView.swift`** - Updated to show video on first launch
3. **`ios/App/App/ivory2.mp4`** - Video file copied to app bundle

## Setup Steps

### 1. Add Video to Xcode Project

The video file has been copied to `ios/App/App/ivory2.mp4`, but you need to add it to the Xcode project:

1. Open Xcode
2. In Project Navigator, right-click on the **"App"** folder
3. Select **"Add Files to 'App'..."**
4. Navigate to `ios/App/App/` and select `ivory2.mp4`
5. **UNCHECK** "Copy items if needed" (file is already there)
6. **CHECK** "Add to targets: App"
7. Click **"Add"**

### 2. Add New Swift File to Xcode

1. In Xcode Project Navigator, right-click on the **"App"** folder
2. Select **"Add Files to 'App'..."**
3. Navigate to `ios/App/App/` and select `IntroVideoViewController.swift`
4. **UNCHECK** "Copy items if needed"
5. **CHECK** "Add to targets: App"
6. Click **"Add"**

### 3. Clean Build Folder

In Xcode:
- **Product** → **Clean Build Folder** (or Shift+Cmd+K)

### 4. Rebuild and Run

- **Product** → **Run** (or Cmd+R)

## How It Works

1. App launches
2. `ContentView` checks `UserDefaults` for `hasSeenIntroVideo`
3. If not seen, shows native `IntroVideoViewController` as full-screen overlay
4. Video plays automatically with a skip button (✕) in top-right
5. When video ends or user skips:
   - Sets `hasSeenIntroVideo = true` in UserDefaults
   - Hides video player
   - Shows WebView underneath

## Testing

### To Test Again (Reset First Launch)
Run this in Xcode console or add a button:
```swift
UserDefaults.standard.removeObject(forKey: "hasSeenIntroVideo")
```

Or delete and reinstall the app.

## Features

- ✅ Native AVPlayer (no WebView dependency)
- ✅ Full-screen video with aspect fill
- ✅ Skip button in top-right corner
- ✅ Auto-plays on first launch only
- ✅ Saves state in UserDefaults
- ✅ Smooth transition to WebView after video

## Troubleshooting

### Video doesn't play
1. Check Xcode console for: `🎬 Native video player started`
2. Verify video file is in Xcode project (should appear in Project Navigator)
3. Check video file is added to "App" target (select file → File Inspector → Target Membership)

### Video file not found error
```
❌ Video file not found in bundle
```
This means the video wasn't added to Xcode properly. Follow setup steps again.

### Video shows every time
The UserDefaults key might not be saving. Check:
```swift
print(UserDefaults.standard.bool(forKey: "hasSeenIntroVideo"))
```

## Reverting to WebView Video

If you want to go back to the WebView approach, just remove the video player code from `ContentView.swift`:

```swift
// Remove these lines:
@State private var showIntroVideo = !UserDefaults.standard.bool(forKey: "hasSeenIntroVideo")
@State private var showVideoPlayer = false

// Remove the video player overlay from ZStack
// Remove the onAppear video logic
```

## Production Notes

- Video file size: 55MB - consider compressing for App Store
- First launch only - won't show again unless app is deleted
- No network required - plays from local bundle
- Works offline
