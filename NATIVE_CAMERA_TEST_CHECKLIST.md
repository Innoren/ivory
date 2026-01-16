# Native iOS Camera Test Checklist

## Pre-Testing Setup

- [ ] Code changes committed
- [ ] iOS app built successfully
- [ ] Web app running
- [ ] Test devices ready (iOS device + browser)

## Native iOS Camera Tests

### Basic Camera Functionality
- [ ] Camera button opens native camera
- [ ] ref2 overlay is visible
- [ ] Overlay is centered and properly sized
- [ ] Camera preview is clear and responsive
- [ ] Close button (X) works
- [ ] Flip camera button works (front/back)

### Overlay Controls
- [ ] Opacity slider is visible
- [ ] Slider adjusts overlay opacity (0-100%)
- [ ] Overlay fades smoothly with slider
- [ ] Slider position reflects current opacity
- [ ] Default opacity is 50%

### Photo Capture
- [ ] Capture button is visible and accessible
- [ ] Tapping capture button takes photo
- [ ] Visual feedback on capture (button animation)
- [ ] Photo is captured successfully
- [ ] Photo quality is good
- [ ] Photo is uploaded to server
- [ ] Photo appears in app after capture
- [ ] Camera closes after capture

### Error Handling
- [ ] Camera permission denied shows alert
- [ ] No camera available shows error
- [ ] Upload failure handled gracefully
- [ ] Cancel button works correctly

## Onboarding Tests (Native iOS)

### Initial State
- [ ] Onboarding starts automatically (first time)
- [ ] Onboarding does NOT show "Take a Photo" step
- [ ] First step is "Open Upload Drawer"
- [ ] Step counter shows correct total (10 steps)

### Step Progression
- [ ] Step 1: "Open Upload Drawer" highlights correct button
- [ ] Step 2: "Upload Design" appears when drawer opens
- [ ] Step 3: "Close Drawer" appears after upload
- [ ] Step 4: "Choose Nail Shape" appears (skips drawing canvas)
- [ ] Step 5: "Select Shape" appears when shape section opens
- [ ] Step 6: "Close Design Drawer" appears after selection
- [ ] Step 7: "Replace Photo" highlights replace button
- [ ] Step 8: "Close Camera" appears when camera opens
- [ ] Step 9: "Visualize" highlights visualize button
- [ ] Step 10: "Confirm Generation" appears in dialog

### Auto-Advance
- [ ] Steps advance automatically at correct times
- [ ] No manual "Next" button needed (except final step)
- [ ] Tooltips position correctly
- [ ] Spotlight highlights correct elements
- [ ] Progress bar updates correctly

### Completion
- [ ] Final step completes onboarding
- [ ] Onboarding doesn't show again
- [ ] User can skip tutorial anytime
- [ ] Skip button works on all steps

## Web Camera Tests

### Basic Functionality
- [ ] Camera button starts web camera
- [ ] Video stream appears
- [ ] Camera preview is clear
- [ ] Flip camera button works
- [ ] Capture button works
- [ ] Photo is captured via canvas
- [ ] Photo appears in app

### Onboarding (Web)
- [ ] Onboarding starts at "Take a Photo" (step 0)
- [ ] Step 1: "Open Upload Drawer" appears after capture
- [ ] Drawing canvas steps appear (steps 4-5)
- [ ] Total 13 steps shown
- [ ] All steps work correctly

## Cross-Platform Tests

### Platform Detection
- [ ] `isNativeIOS()` returns true on iOS app
- [ ] `isNativeIOS()` returns false in browser
- [ ] `isNative()` returns true on iOS app
- [ ] `isNative()` returns false in browser
- [ ] Correct camera opens on each platform
- [ ] Correct onboarding steps on each platform

### State Management
- [ ] Photo state syncs correctly
- [ ] Onboarding state persists
- [ ] Tab switching works
- [ ] Session restoration works
- [ ] No state conflicts between platforms

## Edge Cases

### Camera Issues
- [ ] No camera permission handled
- [ ] Camera in use by another app handled
- [ ] Camera hardware failure handled
- [ ] Low light conditions work
- [ ] Different camera orientations work

### Onboarding Edge Cases
- [ ] Skipping tutorial works
- [ ] Restarting tutorial works
- [ ] Completing tutorial twice doesn't break
- [ ] Tutorial works with existing photos
- [ ] Tutorial works with uploaded photos

### Upload Issues
- [ ] Network failure handled
- [ ] Large photo upload works
- [ ] Multiple photos work
- [ ] Upload retry works
- [ ] Timeout handled

## Performance Tests

### Native iOS
- [ ] Camera opens quickly (< 1 second)
- [ ] Overlay renders smoothly
- [ ] Opacity slider is responsive
- [ ] Photo capture is fast
- [ ] Upload completes in reasonable time
- [ ] No memory leaks
- [ ] No crashes

### Web
- [ ] Camera starts quickly
- [ ] Video stream is smooth
- [ ] Canvas capture is fast
- [ ] No browser warnings
- [ ] Works on mobile browsers
- [ ] Works on desktop browsers

## Regression Tests

### Existing Features
- [ ] Design parameters still work
- [ ] AI generation still works
- [ ] Saved designs still work
- [ ] Collections still work
- [ ] Profile still works
- [ ] Settings still work
- [ ] Navigation still works

### Backward Compatibility
- [ ] Old sessions load correctly
- [ ] Existing photos work
- [ ] Saved designs load
- [ ] User preferences preserved

## Device-Specific Tests

### iOS Devices
- [ ] iPhone (various models)
- [ ] iPad
- [ ] Different iOS versions
- [ ] Portrait orientation
- [ ] Landscape orientation

### Browsers
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Firefox (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (mobile)

## Documentation Tests

### Code Documentation
- [ ] Comments are clear
- [ ] Function names are descriptive
- [ ] Type definitions are correct
- [ ] No TypeScript errors
- [ ] No linting warnings

### User Documentation
- [ ] README updated
- [ ] Implementation guide complete
- [ ] Quick start guide clear
- [ ] Visual comparison accurate
- [ ] Flow diagrams correct

## Final Verification

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] No TypeScript errors
- [ ] No linting issues
- [ ] Code formatted correctly

### User Experience
- [ ] Camera is intuitive
- [ ] Overlay is helpful
- [ ] Onboarding is clear
- [ ] No confusing steps
- [ ] Error messages are helpful

### Production Readiness
- [ ] All tests pass
- [ ] No known bugs
- [ ] Performance is good
- [ ] Documentation complete
- [ ] Ready to deploy

## Test Results

### Native iOS Camera
- **Date Tested**: _______________
- **Tester**: _______________
- **Device**: _______________
- **iOS Version**: _______________
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### Web Camera
- **Date Tested**: _______________
- **Tester**: _______________
- **Browser**: _______________
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### Onboarding (iOS)
- **Date Tested**: _______________
- **Tester**: _______________
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

### Onboarding (Web)
- **Date Tested**: _______________
- **Tester**: _______________
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _______________

## Sign-Off

- [ ] All critical tests pass
- [ ] All documentation complete
- [ ] Ready for production

**Approved By**: _______________
**Date**: _______________
**Signature**: _______________

---

## Quick Test Commands

```bash
# Build iOS app
cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App

# Check code changes
git diff app/capture/page.tsx components/capture-onboarding.tsx

# Verify assets
ls -la ios/App/App/Assets.xcassets/ref2.imageset/

# Run diagnostics
# (Already verified - no errors ✅)
```

## Test Priority

### P0 (Critical - Must Pass)
- Native camera opens with overlay
- Photo capture works
- Onboarding starts at correct step
- No crashes or errors

### P1 (High - Should Pass)
- Opacity slider works
- Flip camera works
- All onboarding steps work
- Web camera still works

### P2 (Medium - Nice to Have)
- Performance is optimal
- Error messages are clear
- Documentation is complete

### P3 (Low - Future Enhancement)
- Additional overlay options
- Custom overlays
- Advanced camera features

---

**Use this checklist to ensure complete testing coverage before production deployment.**
