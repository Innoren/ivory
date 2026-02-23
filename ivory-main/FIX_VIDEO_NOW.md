# Fix Video Not Showing - CRITICAL STEPS

## Problem
ContentView.swift changes are not being compiled. No test logs appear in console.

## Solution - Follow These Steps EXACTLY

### Step 1: Verify Files Are in Xcode Project

1. **Open Xcode**
2. **Look at Project Navigator** (left sidebar)
3. **Find the "App" folder**
4. **Check if these files are listed:**
   - ✅ `ContentView.swift` (should already be there)
   - ❓ `IntroVideoViewController.swift` (might be missing)
   - ❓ `ivory2.mp4` (might be missing)

### Step 2: Add Missing Files

#### Add IntroVideoViewController.swift:
1. In Xcode, right-click on "App" folder
2. Select "Add Files to 'App'..."
3. Navigate to `ios/App/App/`
4. Select `IntroVideoViewController.swift`
5. **UNCHECK** "Copy items if needed"
6. **CHECK** "Add to targets: App"
7. Click "Add"

#### Add ivory2.mp4:
1. In Xcode, right-click on "App" folder
2. Select "Add Files to 'App'..."
3. Navigate to `ios/App/App/`
4. Select `ivory2.mp4`
5. **CHECK** "Copy items if needed" (for video file)
6. **CHECK** "Add to targets: App"
7. Click "Add"

### Step 3: Verify Target Membership

1. Click on `ContentView.swift` in Xcode
2. Look at **File Inspector** (right sidebar, first tab)
3. Under "Target Membership", make sure **"App" is CHECKED**
4. Do the same for `IntroVideoViewController.swift`
5. Do the same for `ivory2.mp4`

### Step 4: Clean and Rebuild

1. **Product** → **Clean Build Folder** (Shift+Cmd+K)
2. Wait for it to finish
3. **Product** → **Build** (Cmd+B)
4. Wait for build to complete
5. **Product** → **Run** (Cmd+R)

### Step 5: Check Console Logs

You should now see:
```
🔴 ========================================
🔴 ContentView.onAppear() CALLED
🔴 ========================================
🧪 TEST 1: Checking if video file exists in bundle...
✅ SUCCESS: Video file EXISTS in bundle
📍 Path: /path/to/ivory2.mp4
📦 File size: 55.00 MB
🧪 TEST 2: Checking UserDefaults...
📝 hasSeenIntroVideo = false
🧪 TEST 3: Checking if IntroVideoViewController exists...
✅ SUCCESS: IntroVideoViewController class found
🎬 ========================================
🎬 DECISION: Will show intro video
```

## If Still Not Working

### Check Build Settings:
1. Select project in Project Navigator (top item)
2. Select "App" target
3. Go to "Build Phases" tab
4. Expand "Compile Sources"
5. Make sure `ContentView.swift` and `IntroVideoViewController.swift` are listed

### If files are missing from Compile Sources:
1. Click the "+" button
2. Find the missing file
3. Click "Add"

### Nuclear Option - Delete Derived Data:
1. Close Xcode
2. Open Terminal
3. Run: `rm -rf ~/Library/Developer/Xcode/DerivedData`
4. Reopen Xcode
5. Clean and rebuild

## Expected Result

When working correctly:
1. App launches
2. Black screen with video appears
3. Skip button (✕) in top-right
4. Video plays automatically
5. After video or skip → goes to login/signup

## To Test Again

Delete app from simulator/device and reinstall, OR run in console:
```swift
UserDefaults.standard.removeObject(forKey: "hasSeenIntroVideo")
```

## Files Involved

- `ios/App/App/ContentView.swift` - Main view with video logic
- `ios/App/App/IntroVideoViewController.swift` - Video player
- `ios/App/App/ivory2.mp4` - Video file (55MB)

All three MUST be in Xcode project with "App" target checked!
