# 🎬 Onboarding Video - Visual Guide

## User Experience Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    USER OPENS APP                           │
│                    (First Time)                             │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                  BLACK SCREEN                               │
│                                                             │
│                     ⏳ Loading...                           │
│                                                             │
│              (Brief - 0.5 seconds)                          │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │                                                         │ │
│ │                                                         │ │
│ │                                                         │ │
│ │              ONBOARDING VIDEO                           │ │
│ │           (Full Screen Playback)                        │ │
│ │                                                         │ │
│ │         "ivory - Made with Clipchamp.mov"               │ │
│ │                                                         │ │
│ │                  🔊 Audio ON                            │ │
│ │                  ⏯️  Auto-play                          │ │
│ │                  🚫 No Skip Button                      │ │
│ │                                                         │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  [DEBUG: "ONBOARDING" indicator in top-right corner]       │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              VIDEO COMPLETES                                │
│                                                             │
│         ✅ Mark onboarding as complete                      │
│         💾 Clear video progress                             │
│         🎯 Transition to login                              │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              LOGIN / SIGNUP PAGE                            │
│                                                             │
│         [User can now sign in or create account]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Background Behavior

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              VIDEO PLAYING                                  │
│              (at 15.3 seconds)                              │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ User presses Home button
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         📱 App Goes to Background                           │
│                                                             │
│         ⏸️  Video pauses automatically                      │
│         💾 Progress saved: 15.3 seconds                     │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ User returns to app
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         📱 App Becomes Active                               │
│                                                             │
│         ▶️  Video resumes from 15.3 seconds                 │
│         🎬 Continues playing                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Subsequent Launches

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              USER OPENS APP                                 │
│              (Second+ Time)                                 │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         ✅ Check: hasSeenOnboardingVideo = true             │
│                                                             │
│         🚫 Skip video                                       │
│         ⚡ Go directly to web view                          │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              WEB VIEW                                       │
│         (Normal app experience)                             │
│                                                             │
│  [DEBUG: "WEBVIEW" indicator in top-right corner]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Video Specifications

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  📹 VIDEO FILE DETAILS                                      │
│                                                             │
│  Name:     ivory - Made with Clipchamp.mov                 │
│  Size:     9.2 MB                                           │
│  Format:   Apple QuickTime (.MOV)                           │
│  Codec:    H.264                                            │
│  Location: ios/App/App/                                     │
│                                                             │
│  ▶️  PLAYBACK                                               │
│  - Full screen                                              │
│  - System volume                                            │
│  - Auto-play                                                │
│  - No controls                                              │
│  - No skip button                                           │
│                                                             │
│  💾 STATE MANAGEMENT                                        │
│  - Progress saved every second                              │
│  - Resumes from exact position                              │
│  - Marked complete when finished                            │
│  - Never shows again after completion                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Debug Console Flow

```
┌─────────────────────────────────────────────────────────────┐
│  XCODE CONSOLE OUTPUT (First Launch)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎬 ContentView init called                                 │
│  🎬 ContentView onAppear called                             │
│  🎬 OnboardingManager initialized                           │
│  🎬 Getting hasSeenOnboardingVideo: false                   │
│  🎬 First launch detected, showing onboarding video         │
│  ✅ Found video file: ivory - Made with Clipchamp.mov       │
│  🎬 Loading video from: ivory - Made with Clipchamp.mov     │
│  🎬 Starting video playback                                 │
│                                                             │
│  ... (video plays) ...                                      │
│                                                             │
│  🎬 Video finished playing, completing onboarding           │
│  ✅ Completing onboarding video                             │
│  💾 Saved video progress: 0.0 seconds                       │
│  🎬 Completing onboarding and clearing video progress       │
│  🎬 Setting hasSeenOnboardingVideo: true                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  XCODE CONSOLE OUTPUT (Subsequent Launches)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎬 ContentView init called                                 │
│  🎬 ContentView onAppear called                             │
│  🎬 OnboardingManager initialized                           │
│  🎬 Getting hasSeenOnboardingVideo: true                    │
│  🎬 User has seen onboarding, skipping video                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Testing Checklist

```
┌─────────────────────────────────────────────────────────────┐
│  TESTING CHECKLIST                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SETUP                                                      │
│  ☐ Video file exists in ios/App/App/                       │
│  ☐ Video file in Xcode project                             │
│  ☐ Target Membership → App is checked                      │
│  ☐ Swift files compile without errors                      │
│                                                             │
│  FIRST LAUNCH TEST                                          │
│  ☐ Reset simulator (xcrun simctl erase all)                │
│  ☐ Build and run (⌘R)                                      │
│  ☐ Video plays automatically                               │
│  ☐ Full screen playback                                    │
│  ☐ Audio plays correctly                                   │
│  ☐ No skip button visible                                  │
│  ☐ Debug indicator shows "ONBOARDING"                      │
│  ☐ Console shows 🎬 logs                                    │
│  ☐ Video completes and transitions to login                │
│                                                             │
│  SUBSEQUENT LAUNCH TEST                                     │
│  ☐ Close and reopen app                                    │
│  ☐ Video does NOT play                                     │
│  ☐ Goes directly to web view                               │
│  ☐ Debug indicator shows "WEBVIEW"                         │
│                                                             │
│  BACKGROUND TEST                                            │
│  ☐ Reset simulator                                         │
│  ☐ Start video playback                                    │
│  ☐ Press Home button (⌘⇧H)                                 │
│  ☐ Video pauses                                            │
│  ☐ Progress saved (check console)                          │
│  ☐ Return to app                                           │
│  ☐ Video resumes from saved position                       │
│                                                             │
│  REAL DEVICE TEST                                           │
│  ☐ Connect iPad/iPhone                                     │
│  ☐ Delete existing app                                     │
│  ☐ Build and run on device                                 │
│  ☐ Video plays on first launch                             │
│  ☐ Test background behavior                                │
│  ☐ Verify audio quality                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Commands

```bash
# Test everything
./test-onboarding-video.sh

# Quick interactive test
./quick-test-onboarding.sh

# Reset simulator
xcrun simctl erase all

# Open Xcode
open ios/App/App.xcodeproj

# Clean build
# In Xcode: Product → Clean Build Folder (⌘⇧K)
```

## Success Criteria

✅ **Video plays automatically on first launch**  
✅ **Full screen, no controls, no skip**  
✅ **Audio plays at system volume**  
✅ **Smooth transition to login after completion**  
✅ **Never shows again on subsequent launches**  
✅ **Handles background/foreground correctly**  
✅ **Saves and resumes progress**  
✅ **Console shows proper debug logs**  

---

**Your onboarding video is ready to welcome new users! 🎬✨**
