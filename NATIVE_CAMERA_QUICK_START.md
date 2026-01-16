# Native iOS Camera Quick Start Guide

## What Changed?

✅ **Native iOS camera now uses ref2 overlay** - Better user experience with reference image
✅ **Onboarding skips step 1 on iOS** - Streamlined tutorial flow for native app

## How It Works

### On Native iOS:
```
User taps camera → Native camera opens with ref2 overlay → User captures photo → Photo uploaded
```

### On Web:
```
User taps camera → Web camera opens → User captures photo → Photo uploaded
```

## Testing Steps

### 1. Test Native iOS Camera

```bash
# Build and run iOS app
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug
```

**In the app:**
1. Navigate to capture page
2. Tap camera button
3. ✅ Native camera should open with ref2 overlay visible
4. Adjust opacity slider to see overlay better
5. Capture photo
6. ✅ Photo should appear in the app

### 2. Test Onboarding on iOS

**Reset onboarding:**
1. Clear app data or reinstall
2. Open app
3. ✅ Onboarding should start at "Open Upload Drawer" (NOT "Take a Photo")
4. Complete tutorial
5. ✅ All steps should work correctly

### 3. Test Web Fallback

**In browser:**
1. Open app in Chrome/Safari
2. Navigate to capture page
3. ✅ Web camera should be used
4. ✅ Onboarding should include "Take a Photo" step

## Key Code Changes

### Native Camera Detection
```typescript
if (isNativeIOS()) {
  // Use native camera with overlay
  const result = await takePicture({ source: 'camera' })
} else {
  // Use web camera
  // ... web camera code
}
```

### Onboarding Steps
```typescript
const ONBOARDING_STEPS = [
  // Skip on native iOS
  ...(!isNative() ? [captureStep] : []),
  // Rest of steps...
]
```

## Verify Changes

Run these checks:

```bash
# 1. Check native camera integration
grep -n "isNativeIOS()" app/capture/page.tsx

# 2. Check onboarding steps
grep -n "!isNative()" components/capture-onboarding.tsx

# 3. Check overlay image exists
ls -la ios/App/App/Assets.xcassets/ref2.imageset/
```

## Expected Results

✅ Native iOS camera opens with ref2 overlay
✅ Opacity slider adjusts overlay visibility
✅ Photos are captured and uploaded successfully
✅ Onboarding starts at step 1 on iOS (skips step 0)
✅ Web camera still works on non-native platforms
✅ Onboarding includes all steps on web

## Troubleshooting

### Camera doesn't open
- Check camera permissions in Settings
- Verify Info.plist has camera usage description
- Check console for errors

### Overlay not visible
- Verify ref2.png exists in Assets.xcassets
- Check image is included in build target
- Try adjusting opacity slider

### Onboarding wrong steps
- Clear app data and restart
- Check isNative() returns true on iOS
- Verify step numbering in logs

## Next Steps

After testing:
1. ✅ Verify native camera works
2. ✅ Verify onboarding flow is correct
3. ✅ Test on physical iOS device
4. ✅ Test on web browser
5. 🚀 Ready for production!

## Related Files

- `app/capture/page.tsx` - Camera integration
- `components/capture-onboarding.tsx` - Onboarding steps
- `ios/App/App/CameraOverlayViewController.swift` - Native camera
- `lib/native-bridge.ts` - Native bridge functions

## Support

For issues or questions:
- Check console logs for errors
- Review [NATIVE_IOS_CAMERA_WITH_OVERLAY.md](NATIVE_IOS_CAMERA_WITH_OVERLAY.md)
- Test on both iOS and web platforms
