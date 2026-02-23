# Native iOS Camera Flow Diagram

## Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER OPENS APP                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Platform      │
                    │  Detection     │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐     ┌──────────────────┐
    │   Native iOS      │     │   Web Browser    │
    │   isNative()=true │     │   isNative()=false│
    └─────────┬─────────┘     └────────┬─────────┘
              │                        │
              ▼                        ▼
    ┌───────────────────┐     ┌──────────────────┐
    │ User taps camera  │     │ User taps camera │
    │     button        │     │     button       │
    └─────────┬─────────┘     └────────┬─────────┘
              │                        │
              ▼                        ▼
    ┌───────────────────┐     ┌──────────────────┐
    │ Native Camera     │     │  Web Camera      │
    │ with ref2 overlay │     │  (no overlay)    │
    │                   │     │                  │
    │ ┌───────────────┐ │     │ ┌──────────────┐ │
    │ │   Camera      │ │     │ │   Video      │ │
    │ │   Preview     │ │     │ │   Stream     │ │
    │ │               │ │     │ │              │ │
    │ │  [ref2 img]   │ │     │ │              │ │
    │ │   opacity:50% │ │     │ │              │ │
    │ └───────────────┘ │     │ └──────────────┘ │
    │                   │     │                  │
    │ Opacity: ━━━━━━━  │     │                  │
    │                   │     │                  │
    │      ⚪ Capture   │     │   ⚪ Capture     │
    └─────────┬─────────┘     └────────┬─────────┘
              │                        │
              ▼                        ▼
    ┌───────────────────┐     ┌──────────────────┐
    │ Photo captured    │     │ Canvas capture   │
    │ (native quality)  │     │ (web quality)    │
    └─────────┬─────────┘     └────────┬─────────┘
              │                        │
              └────────────┬───────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  Upload Photo  │
                  │   to Server    │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Photo Displayed│
                  │    in App      │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │   Onboarding   │
                  │     Starts     │
                  └────────┬───────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
    ┌───────────────────┐   ┌──────────────────┐
    │  iOS Onboarding   │   │  Web Onboarding  │
    │                   │   │                  │
    │  Step 1: Upload   │   │  Step 0: Capture │
    │  Step 2: Design   │   │  Step 1: Upload  │
    │  Step 3: Close    │   │  Step 2: Design  │
    │  Step 4: Shape    │   │  Step 3: Close   │
    │  Step 5: Select   │   │  Step 4: Drawing │
    │  Step 6: Close    │   │  Step 5: Close   │
    │  Step 7: Replace  │   │  Step 6: Shape   │
    │  Step 8: Close    │   │  Step 7: Select  │
    │  Step 9: Visualize│   │  Step 8: Close   │
    │  Step 10: Confirm │   │  Step 9: Replace │
    │                   │   │  Step 10: Close  │
    │  Total: 10 steps  │   │  Step 11: Visual │
    │                   │   │  Step 12: Confirm│
    │                   │   │                  │
    │                   │   │  Total: 13 steps │
    └───────────────────┘   └──────────────────┘
```

## Code Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    app/capture/page.tsx                         │
│                                                                 │
│  const capturePhoto = async () => {                            │
│    if (isNativeIOS()) {                                        │
│      ┌─────────────────────────────────────────────┐          │
│      │  Native iOS Path                            │          │
│      │                                             │          │
│      │  1. takePicture({ source: 'camera' })      │          │
│      │     ↓                                       │          │
│      │  2. lib/native-bridge.ts                   │          │
│      │     ↓                                       │          │
│      │  3. ios/App/App/CameraManager.swift        │          │
│      │     ↓                                       │          │
│      │  4. CameraOverlayViewController.swift      │          │
│      │     - Load ref2 image                      │          │
│      │     - Show opacity slider                  │          │
│      │     - Capture photo                        │          │
│      │     ↓                                       │          │
│      │  5. Return photo data                      │          │
│      │     ↓                                       │          │
│      │  6. Upload to server                       │          │
│      │     ↓                                       │          │
│      │  7. setCapturedImage(url)                  │          │
│      └─────────────────────────────────────────────┘          │
│    } else {                                                    │
│      ┌─────────────────────────────────────────────┐          │
│      │  Web Path                                   │          │
│      │                                             │          │
│      │  1. Get video stream                       │          │
│      │     ↓                                       │          │
│      │  2. Create canvas                          │          │
│      │     ↓                                       │          │
│      │  3. Draw video frame                       │          │
│      │     ↓                                       │          │
│      │  4. Apply filters                          │          │
│      │     ↓                                       │          │
│      │  5. Convert to blob                        │          │
│      │     ↓                                       │          │
│      │  6. Upload to server                       │          │
│      │     ↓                                       │          │
│      │  7. setCapturedImage(url)                  │          │
│      └─────────────────────────────────────────────┘          │
│    }                                                           │
│  }                                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Onboarding Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              components/capture-onboarding.tsx                  │
│                                                                 │
│  const ONBOARDING_STEPS = [                                    │
│    ...(!isNative() ? [                                         │
│      ┌─────────────────────────────────────────┐              │
│      │  Step 0: Capture Photo (WEB ONLY)      │              │
│      │  - Only shown on web                    │              │
│      │  - Skipped on native iOS                │              │
│      └─────────────────────────────────────────┘              │
│    ] : []),                                                    │
│    ┌─────────────────────────────────────────┐                │
│    │  Step 1 (iOS) / Step 1 (Web)           │                │
│    │  Open Upload Drawer                     │                │
│    │  - First step on iOS                    │                │
│    │  - Second step on web                   │                │
│    └─────────────────────────────────────────┘                │
│    ┌─────────────────────────────────────────┐                │
│    │  Step 2 (iOS) / Step 2 (Web)           │                │
│    │  Upload Design                          │                │
│    └─────────────────────────────────────────┘                │
│    ┌─────────────────────────────────────────┐                │
│    │  Step 3 (iOS) / Step 3 (Web)           │                │
│    │  Close Drawer                           │                │
│    └─────────────────────────────────────────┘                │
│    ...(!isNative() ? [                                         │
│      ┌─────────────────────────────────────────┐              │
│      │  Step 4-5: Drawing Canvas (WEB ONLY)   │              │
│      │  - Only shown on web                    │              │
│      │  - Skipped on native iOS                │              │
│      └─────────────────────────────────────────┘              │
│    ] : []),                                                    │
│    ┌─────────────────────────────────────────┐                │
│    │  Remaining steps...                     │                │
│    │  - Adjusted numbering for platform      │                │
│    └─────────────────────────────────────────┘                │
│  ]                                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Platform Detection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    lib/native-bridge.ts                         │
│                                                                 │
│  export function isNativeIOS(): boolean {                      │
│    return typeof window !== 'undefined' &&                     │
│           !!window.NativeBridge                                │
│  }                                                             │
│                                                                 │
│  export function isNative(): boolean {                         │
│    return isNativeIOS()                                        │
│  }                                                             │
│                                                                 │
│  ┌─────────────────────────────────────────────┐              │
│  │  iOS Native App                             │              │
│  │  window.NativeBridge exists                 │              │
│  │  → isNativeIOS() = true                     │              │
│  │  → isNative() = true                        │              │
│  └─────────────────────────────────────────────┘              │
│                                                                 │
│  ┌─────────────────────────────────────────────┐              │
│  │  Web Browser                                │              │
│  │  window.NativeBridge undefined              │              │
│  │  → isNativeIOS() = false                    │              │
│  │  → isNative() = false                       │              │
│  └─────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Camera Overlay Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│         ios/App/App/CameraOverlayViewController.swift           │
│                                                                 │
│  class CameraOverlayViewController: UIViewController {          │
│                                                                 │
│    ┌─────────────────────────────────────────────┐            │
│    │  Properties                                 │            │
│    │  - overlayImageName: "ref2"                 │            │
│    │  - overlayOpacity: 0.5                      │            │
│    │  - captureSession: AVCaptureSession         │            │
│    │  - photoOutput: AVCapturePhotoOutput        │            │
│    └─────────────────────────────────────────────┘            │
│                                                                 │
│    ┌─────────────────────────────────────────────┐            │
│    │  UI Elements                                │            │
│    │  - previewLayer (camera feed)               │            │
│    │  - overlayImageView (ref2 image)            │            │
│    │  - opacitySlider (0-100%)                   │            │
│    │  - captureButton                            │            │
│    │  - closeButton                              │            │
│    │  - flipButton                               │            │
│    └─────────────────────────────────────────────┘            │
│                                                                 │
│    ┌─────────────────────────────────────────────┐            │
│    │  Methods                                    │            │
│    │  - setupCamera()                            │            │
│    │  - setupOverlay()                           │            │
│    │  - capturePhoto()                           │            │
│    │  - flipCamera()                             │            │
│    │  - opacityChanged()                         │            │
│    └─────────────────────────────────────────────┘            │
│                                                                 │
│    ┌─────────────────────────────────────────────┐            │
│    │  Callbacks                                  │            │
│    │  - onImageCaptured: (UIImage) -> Void       │            │
│    │  - onCancel: () -> Void                     │            │
│    └─────────────────────────────────────────────┘            │
│  }                                                             │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    State Updates                                │
│                                                                 │
│  User Action                                                    │
│      ↓                                                          │
│  Platform Detection                                             │
│      ↓                                                          │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  Native iOS      │         │  Web Browser     │            │
│  └────────┬─────────┘         └────────┬─────────┘            │
│           │                            │                        │
│           ▼                            ▼                        │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ Native Camera    │         │ Web Camera       │            │
│  │ Opens            │         │ Starts           │            │
│  └────────┬─────────┘         └────────┬─────────┘            │
│           │                            │                        │
│           ▼                            ▼                        │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ Photo Captured   │         │ Canvas Capture   │            │
│  └────────┬─────────┘         └────────┬─────────┘            │
│           │                            │                        │
│           └────────────┬───────────────┘                        │
│                        │                                        │
│                        ▼                                        │
│               ┌────────────────┐                               │
│               │ setCapturedImage│                               │
│               │    (url)        │                               │
│               └────────┬───────┘                               │
│                        │                                        │
│                        ▼                                        │
│               ┌────────────────┐                               │
│               │ Onboarding     │                               │
│               │ Auto-Advance   │                               │
│               └────────┬───────┘                               │
│                        │                                        │
│           ┌────────────┴────────────┐                          │
│           │                         │                          │
│           ▼                         ▼                          │
│  ┌──────────────────┐     ┌──────────────────┐               │
│  │ iOS: Step 1      │     │ Web: Step 1      │               │
│  │ (Upload Drawer)  │     │ (Upload Drawer)  │               │
│  └──────────────────┘     └──────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## Summary

This diagram shows the complete flow from user action to final state, including:

1. **Platform Detection** - Automatic detection of iOS vs Web
2. **Camera Selection** - Native camera with overlay on iOS, web camera on web
3. **Photo Capture** - Different capture methods for each platform
4. **State Management** - Unified state updates regardless of platform
5. **Onboarding Flow** - Platform-specific step sequences

All flows are automatic and require no user configuration!
