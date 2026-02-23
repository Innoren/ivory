# Quick Start: Native iOS Camera with ref2 Overlay

## What Changed?

✅ **Native iOS app now uses native camera with ref2 overlay**
✅ **Onboarding tutorial skips step 1 (capture photo) on iOS**
✅ **Web app continues to use web camera (unchanged)**

## Test It Now

### iOS (Native Camera)

```bash
# 1. Open Xcode
cd ios/App
open App.xcworkspace

# 2. Build and run (Cmd+R)
# 3. Navigate to capture page
# 4. Native camera opens with ref2 overlay
# 5. Onboarding starts at "Open Upload Drawer" (step 1 skipped)
```

### Web (Web Camera)

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
open http://localhost:3000

# 3. Navigate to capture page
# 4. Web camera opens (no overlay)
# 5. Onboarding starts at "Take a Photo" (all steps shown)
```

## Key Features

### Native iOS Camera
- ✅ ref2 hand outline overlay
- ✅ Adjustable opacity slider
- ✅ Flip camera (front/back)
- ✅ Professional capture button
- ✅ Native iOS permissions

### Onboarding
- ✅ **iOS: 10 steps** (capture + drawing skipped)
- ✅ **Web: 13 steps** (all included)
- ✅ Platform-specific flow

## Verify It Works

### Check 1: Native Camera Opens
```
iOS App → Capture Page → Native camera with ref2 overlay ✅
```

### Check 2: Onboarding Skips Step 1
```
iOS App → First time → Onboarding starts at "Open Upload Drawer" ✅
```

### Check 3: Web Camera Still Works
```
Web Browser → Capture Page → Web camera (no overlay) ✅
```

### Check 4: ref2 Overlay Visible
```
iOS Camera → See semi-transparent hand outline ✅
```

### Check 5: Opacity Slider Works
```
iOS Camera → Move slider → Overlay transparency changes ✅
```

## Files Changed

1. `app/capture/page.tsx` - Native camera integration + onboarding step indices
2. `components/capture-onboarding.tsx` - Skip step 1 on native iOS
3. `ios/App/App/CameraOverlayViewController.swift` - Already configured for ref2
4. `ios/App/App/CameraManager.swift` - Already handles native camera
5. `lib/native-bridge.ts` - Already has takePicture() function

## Documentation

- **NATIVE_IOS_CAMERA_WITH_OVERLAY.md** - Full implementation details
- **NATIVE_CAMERA_TEST_GUIDE.md** - Complete testing checklist
- **NATIVE_CAMERA_IMPLEMENTATION_SUMMARY.md** - Technical summary
- **QUICK_START_NATIVE_CAMERA.md** - This file

## Troubleshooting

### Camera not opening?
```bash
# Check permissions
Settings > Privacy > Camera > [App Name] > Enable

# Re-add ref2 asset
./add-ref2-to-xcode.sh

# Clean build
Xcode > Product > Clean Build Folder (Cmd+Shift+K)
```

### Onboarding showing wrong steps?
```bash
# Delete app and reinstall
# Check console logs for step indices
# Verify isNative() returns true on iOS
```

### Web camera showing on iOS?
```bash
# Check native bridge is available
console.log(window.NativeBridge)

# Verify platform detection
console.log(isNativeIOS()) // should be true
```

## Success Criteria

✅ Native camera opens on iOS with ref2 overlay
✅ Onboarding has 10 steps on iOS (not 13)
✅ Web camera still works on web
✅ Onboarding has 13 steps on web
✅ No errors in console
✅ Smooth user experience

## Next Steps

1. Test on physical iOS device
2. Test on iOS simulator  
3. Test on web browser
4. Verify all onboarding steps
5. Check camera permissions
6. Submit for App Store review

---

**Status**: ✅ Ready to Test
**Platform**: iOS Native + Web
**Date**: January 16, 2026
