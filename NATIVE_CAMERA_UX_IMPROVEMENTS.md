# Native Camera UX Improvements

## Changes Made

### 1. Onboarding Tutorial Hidden During Camera View
**Problem:** The onboarding tutorial (step 1) was showing on the native iOS camera view, which was confusing since users need to tap the picture button first.

**Solution:** Modified the onboarding display condition to only show when a captured image exists:
```typescript
{shouldShowOnboarding && capturedImage && (
  <CaptureOnboarding ... />
)}
```

This ensures the onboarding tutorial only appears after the user has taken a photo and is on the design editing screen, not during the camera capture phase.

### 2. Removed Opacity Slider from Native Camera
**Problem:** The opacity slider for adjusting ref2.jpg transparency was unnecessary and cluttered the camera interface.

**Solution:** 
- Removed the `opacitySlider` UI element from `CameraOverlayViewController.swift`
- Set `overlayOpacity` to fixed value of `1.0` (full opacity)
- Removed all slider-related constraints and action handlers

### 3. Made ref2 Reference Image 2x Bigger
**Problem:** The ref2.jpg overlay was too small on the screen, making it difficult to align hands properly.

**Solution:** Updated the overlay image constraints in `setupOverlay()`:
```swift
// Changed from 0.8x to 1.6x (2x bigger)
overlayImageView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 1.6)
overlayImageView.heightAnchor.constraint(equalTo: view.heightAnchor, multiplier: 1.6)
```

The reference image now appears at 1.6x the screen size (double the previous 0.8x), making it much more visible and easier to use for hand positioning.

## Files Modified

1. **app/capture/page.tsx**
   - Updated onboarding display condition to require `capturedImage`

2. **ios/App/App/CameraOverlayViewController.swift**
   - Changed `overlayOpacity` from 0.5 to 1.0
   - Removed opacity slider UI element (already done)
   - Updated overlay size from 0.8x to 1.6x screen dimensions
   - Updated log message to reflect changes

## Testing

To test these changes:

1. **Onboarding Hidden:**
   - Open the app as a new user
   - Navigate to capture page
   - Verify NO onboarding tooltip appears on the camera view
   - Take a photo
   - Verify onboarding starts AFTER photo is captured

2. **No Opacity Slider:**
   - Open native iOS camera
   - Verify there is NO slider at the bottom
   - Verify only capture button, close button, and flip button are visible

3. **Larger ref2 Image:**
   - Open native iOS camera
   - Verify ref2.jpg overlay is significantly larger (2x previous size)
   - Verify it's easier to align your hand with the reference
   - Verify it's at full opacity (not transparent)

## User Experience Impact

✅ **Cleaner camera interface** - No distracting slider
✅ **Better onboarding flow** - Tutorial starts at the right time
✅ **Easier hand alignment** - Larger reference image is more visible
✅ **Consistent opacity** - No confusion about transparency settings
