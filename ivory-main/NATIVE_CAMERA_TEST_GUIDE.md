# Native iOS Camera Testing Guide

## Quick Test Checklist

### 1. Native Camera with ref2 Overlay

**On iOS Device/Simulator:**

```bash
# Build and run the iOS app
cd ios/App
open App.xcworkspace
# Build and run in Xcode (Cmd+R)
```

**Test Steps:**
- [ ] Open the app
- [ ] Navigate to capture page
- [ ] **Native camera opens automatically** with ref2 overlay visible
- [ ] ref2 image is semi-transparent (50% opacity by default)
- [ ] Adjust opacity slider - overlay becomes more/less visible
- [ ] Flip camera button works (front/back camera)
- [ ] Capture button takes photo
- [ ] Photo is saved and camera closes
- [ ] Photo appears in the design view

**Expected Behavior:**
- ✅ Native iOS camera UI (not web camera)
- ✅ ref2 hand outline overlay visible
- ✅ Smooth camera controls
- ✅ Professional capture experience

### 2. Onboarding Tutorial (Native iOS)

**Test Steps:**
- [ ] Clear app data (delete and reinstall)
- [ ] Open app for first time
- [ ] **Onboarding starts at "Open Upload Drawer"** (NOT "Take a Photo")
- [ ] Step 0: Open Upload Drawer
- [ ] Step 1: Upload Design Images
- [ ] Step 2: Close Upload Drawer
- [ ] Step 3: Choose Nail Shape (drawing canvas steps skipped)
- [ ] Step 4: Select a Shape
- [ ] Step 5: Close Design Parameters
- [ ] Step 6: Replace Hand Photo
- [ ] Step 7: Exit Camera
- [ ] Step 8: Generate Your Design
- [ ] Step 9: Confirm Generation (final step)

**Expected Behavior:**
- ✅ 10 total steps (not 13)
- ✅ "Take a Photo" step is skipped
- ✅ "Drawing Canvas" steps are skipped
- ✅ Tutorial flows smoothly without web-only features

### 3. Web Camera (Comparison)

**On Web Browser:**

```bash
# Run the web app
npm run dev
# Open http://localhost:3000
```

**Test Steps:**
- [ ] Open app in browser
- [ ] Navigate to capture page
- [ ] **Web camera opens** (not native)
- [ ] Onboarding starts at "Take a Photo" (step 0)
- [ ] All 13 steps are shown
- [ ] Drawing canvas steps are included

**Expected Behavior:**
- ✅ Web camera UI with browser controls
- ✅ 13 total steps
- ✅ All features available including drawing canvas

## Verification Commands

### Check ref2 Asset Exists
```bash
ls -la ios/App/App/Assets.xcassets/ref2.imageset/
# Should show: ref2.png and Contents.json
```

### Re-add ref2 Asset (if needed)
```bash
./add-ref2-to-xcode.sh
```

### Check Native Bridge
```bash
# In browser console (when running native iOS app):
console.log(window.NativeBridge)
# Should show object with takePicture method
```

### Check Platform Detection
```bash
# In browser console:
console.log(isNativeIOS())  # true on iOS, false on web
console.log(isNative())     # true on iOS, false on web
```

## Common Issues

### Issue: Camera not opening on iOS
**Solution:**
1. Check camera permissions: Settings > Privacy > Camera > [App Name]
2. Verify ref2 asset exists in Xcode
3. Check Xcode console for errors

### Issue: ref2 overlay not showing
**Solution:**
1. Run `./add-ref2-to-xcode.sh`
2. Clean build folder in Xcode (Cmd+Shift+K)
3. Rebuild and run

### Issue: Onboarding showing wrong steps
**Solution:**
1. Clear app data (delete and reinstall)
2. Check `isNative()` returns true on iOS
3. Verify step indices in console logs

### Issue: Web camera showing on iOS
**Solution:**
1. Verify `isNativeIOS()` returns true
2. Check native bridge is available
3. Look for errors in Xcode console

## Debug Logging

Enable debug logging in the app:

```typescript
// In app/capture/page.tsx
console.log('Platform:', isNativeIOS() ? 'Native iOS' : 'Web')
console.log('Onboarding step:', onboardingStep)
console.log('Total steps:', ONBOARDING_STEPS.length)
```

## Performance Checks

- [ ] Camera opens quickly (< 1 second)
- [ ] Overlay renders smoothly
- [ ] Photo capture is instant
- [ ] No lag when adjusting opacity
- [ ] Flip camera is smooth
- [ ] Onboarding animations are fluid

## Accessibility

- [ ] VoiceOver announces camera controls
- [ ] Opacity slider is accessible
- [ ] Capture button has proper label
- [ ] Onboarding steps are announced

## Edge Cases

- [ ] Test with camera permission denied
- [ ] Test with no camera available
- [ ] Test with front camera only
- [ ] Test with back camera only
- [ ] Test in low light conditions
- [ ] Test with different hand positions

## Success Criteria

✅ **Native iOS:**
- Native camera opens with ref2 overlay
- 10 onboarding steps (capture and drawing skipped)
- Smooth camera experience
- Professional UI

✅ **Web:**
- Web camera opens normally
- 13 onboarding steps (all included)
- All features work
- Consistent experience

## Next Steps After Testing

If all tests pass:
1. ✅ Mark as ready for production
2. ✅ Update App Store screenshots
3. ✅ Update user documentation
4. ✅ Submit for App Store review

If issues found:
1. ❌ Document the issue
2. ❌ Check error logs
3. ❌ Fix and retest
4. ❌ Verify fix doesn't break web version
