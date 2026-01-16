# Native iOS Camera with ref2 Overlay Implementation

## Overview

The native iOS app now uses the native camera with ref2 image overlay instead of the web camera. The onboarding tutorial has been updated to skip step 1 (capture photo) on native iOS since the native camera handles this automatically.

## Changes Made

### 1. Camera Implementation (`app/capture/page.tsx`)

The `capturePhoto` function now detects native iOS and uses the native camera:

```typescript
const capturePhoto = async () => {
  // Use native iOS camera with ref2 overlay on iOS
  if (isNativeIOS()) {
    try {
      console.log('📸 Using native iOS camera with ref2 overlay')
      const result = await takePicture({ source: 'camera' })
      
      if (result.dataUrl) {
        // Upload and save the captured image
        // ... upload logic
      }
    } catch (error) {
      console.error('Native camera error:', error)
      toast.error('Camera error', {
        description: 'Failed to capture photo. Please try again.',
      })
    }
    return
  }
  
  // Use web camera implementation for non-native platforms
  // ... web camera logic
}
```

### 2. Onboarding Tutorial Updates

#### Skip Step 1 on Native iOS (`components/capture-onboarding.tsx`)

The onboarding steps array now conditionally includes the capture step:

```typescript
const ONBOARDING_STEPS: OnboardingStep[] = [
  // Skip capture step on native iOS (native camera handles it)
  ...(!isNative() ? [{
    id: 'capture',
    title: 'Take a Photo',
    description: 'Capture or upload a photo of your hand in good lighting for best results',
    targetElement: 'capture-button',
    position: 'top' as const,
    action: 'Tap the camera button'
  }] as OnboardingStep[] : []),
  {
    id: 'open-upload-drawer',
    title: 'Open Upload Drawer',
    // ... rest of steps
  },
  // ... other steps
]
```

#### Adjusted Step Indices (`app/capture/page.tsx`)

All onboarding auto-advance logic has been updated to account for the skipped step on native iOS:

```typescript
// Example: Upload drawer opens
useEffect(() => {
  const expectedStep = isNative() ? 0 : 1  // Step 0 on native, step 1 on web
  
  if (shouldShowOnboarding && onboardingStep === expectedStep && isUploadDrawerOpen) {
    console.log(`✅ Advancing from step ${expectedStep} to step ${expectedStep + 1}`)
    setTimeout(() => {
      setOnboardingStep(expectedStep + 1)
    }, 1200)
  }
}, [isUploadDrawerOpen, shouldShowOnboarding, onboardingStep])
```

### 3. Native Camera Overlay (`ios/App/App/CameraOverlayViewController.swift`)

The camera overlay controller is already configured to use ref2:

```swift
var overlayImageName: String = "ref2" // Default overlay image
var overlayOpacity: CGFloat = 0.5 // Default opacity
```

Features:
- ✅ ref2 image overlay with adjustable opacity
- ✅ Flip camera (front/back)
- ✅ Opacity slider to adjust overlay transparency
- ✅ Full-screen native camera experience
- ✅ Professional capture button
- ✅ Close button to cancel

### 4. Native Bridge Integration (`lib/native-bridge.ts`)

The native bridge already supports camera operations:

```typescript
export async function takePicture(options?: CameraOptions): Promise<PhotoResponse> {
  const bridge = getNativeBridge();
  if (!bridge) {
    throw new Error('Native bridge not available');
  }
  return bridge.takePicture(options);
}
```

## Assets Setup

The ref2 image is already added to the Xcode project:

```
ios/App/App/Assets.xcassets/ref2.imageset/
├── ref2.png
└── Contents.json
```

If you need to re-add it, run:

```bash
./add-ref2-to-xcode.sh
```

## Testing

### On Native iOS:

1. **Open the app** on a physical iOS device or simulator
2. **Navigate to capture page** - native camera opens automatically with ref2 overlay
3. **Adjust overlay opacity** using the slider at the bottom
4. **Flip camera** using the button in top-right
5. **Capture photo** by tapping the large white button
6. **Onboarding starts at step 2** (Open Upload Drawer) - step 1 is skipped

### On Web:

1. **Open the app** in a web browser
2. **Navigate to capture page** - web camera opens
3. **Onboarding starts at step 1** (Take a Photo)
4. **All steps are shown** including the capture step

## Onboarding Flow Comparison

### Web (13 steps total):
0. Take a Photo ← **Step 0 (index 0)**
1. Open Upload Drawer
2. Upload Design Images
3. Close Upload Drawer
4. Drawing Canvas
5. Close Drawing Canvas
6. Choose Nail Shape
7. Select a Shape
8. Close Design Parameters
9. Replace Hand Photo
10. Exit Camera
11. Generate Your Design
12. Confirm Generation ← **Final step (index 12)**

### Native iOS (10 steps total):
0. ~~Take a Photo~~ ← **Skipped** (native camera handles this)
1. Open Upload Drawer ← **Step 0 (index 0)** on native
2. Upload Design Images
3. Close Upload Drawer
4. ~~Drawing Canvas~~ ← **Skipped** (not available on native)
5. ~~Close Drawing Canvas~~ ← **Skipped**
6. Choose Nail Shape ← **Step 3 (index 3)** on native
7. Select a Shape
8. Close Design Parameters
9. Replace Hand Photo
10. Exit Camera
11. Generate Your Design
12. Confirm Generation ← **Final step (index 9)** on native

## Benefits

### Native iOS Camera:
- ✅ **Better UX**: Native camera feels more integrated
- ✅ **ref2 Overlay**: Helps users align their hand correctly
- ✅ **Adjustable Opacity**: Users can customize overlay visibility
- ✅ **Professional Controls**: Flip camera, close button, capture button
- ✅ **Proper Permissions**: Uses iOS native permission dialogs with app name

### Simplified Onboarding:
- ✅ **Faster**: One less step on native iOS
- ✅ **Clearer**: No need to explain web camera controls
- ✅ **Consistent**: Native camera is familiar to iOS users
- ✅ **Automatic**: Camera opens immediately with overlay

## Code Locations

- **Capture Page**: `app/capture/page.tsx`
- **Onboarding Component**: `components/capture-onboarding.tsx`
- **Native Bridge**: `lib/native-bridge.ts`
- **Camera Manager**: `ios/App/App/CameraManager.swift`
- **Camera Overlay**: `ios/App/App/CameraOverlayViewController.swift`
- **ref2 Asset**: `ios/App/App/Assets.xcassets/ref2.imageset/`

## Future Enhancements

Potential improvements:
- [ ] Add multiple overlay options (ref1, ref2, ref3)
- [ ] Save user's preferred opacity setting
- [ ] Add grid overlay for better alignment
- [ ] Add zoom controls
- [ ] Add flash toggle
- [ ] Add timer for hands-free capture

## Troubleshooting

### Camera not opening on iOS:
1. Check camera permissions in Settings > Privacy > Camera
2. Verify ref2 image exists in Assets.xcassets
3. Check Xcode console for error messages

### Overlay not showing:
1. Verify ref2.png exists in `ios/App/App/Assets.xcassets/ref2.imageset/`
2. Run `./add-ref2-to-xcode.sh` to re-add the asset
3. Clean build folder in Xcode (Cmd+Shift+K)
4. Rebuild the app

### Onboarding showing wrong step:
1. Clear app data and restart
2. Check `isNative()` function is working correctly
3. Verify step indices in auto-advance logic

## Summary

The native iOS app now provides a superior camera experience with the ref2 overlay, helping users capture better photos for nail design generation. The onboarding has been streamlined to skip the capture step on iOS, making the tutorial faster and more intuitive.
