# Native Camera After First Photo - Implementation

## Overview
Updated the capture page to use the native iOS camera for all photo captures after the initial hand reference photo is taken with the web camera.

## Changes Made

### 1. Hand Reference Images Cleanup
- **Removed**: `public/ref1.png` and `public/ref3.png`
- **Kept**: `public/ref2.png` (single hand reference overlay)
- **Removed**: Hand reference toggle button from camera UI
- **Simplified**: Fixed scale to 4.35 for the single reference image

### 2. Native Camera Integration for Replace Photo

#### Updated `replaceHandPhoto()` Function
The function now uses native iOS camera directly instead of the web camera:

```typescript
const replaceHandPhoto = async () => {
  // Save current image before replacing
  if (capturedImage) {
    setSavedImageBeforeReplace(capturedImage)
  }
  
  // On native iOS, use native camera directly
  if (isNativeIOS()) {
    try {
      // Use native camera to take photo
      const photo = await takePicture({ 
        source: 'camera',
        allowEditing: false 
      })
      
      // Update all tabs with the new photo
      setDesignTabs(tabs => tabs.map(tab => ({
        ...tab,
        originalImage: photo.dataUrl
      })))
      
      // Update current state
      setCapturedImage(photo.dataUrl)
      setSavedImageBeforeReplace(null)
      
      toast.success('Hand photo updated!')
      return
    } catch (error) {
      // Restore saved image on error
      if (savedImageBeforeReplace) {
        setCapturedImage(savedImageBeforeReplace)
        setSavedImageBeforeReplace(null)
      }
      
      toast.error('Failed to take photo')
      return
    }
  }
  
  // Web fallback: use web camera
  startCamera()
}
```

## User Flow

### Initial Photo (First Time)
1. User opens capture page
2. **Web camera** starts with hand reference overlay (ref2.png)
3. User positions hand and takes photo
4. Photo is captured and stored

### Replace Photo (Subsequent Times)
1. User clicks "Replace Hand Photo" button
2. On **native iOS**: Native camera opens directly
3. User takes photo with native camera
4. Photo is immediately captured and replaces the original
5. No web camera UI is shown

### Benefits
- **Better UX**: Native camera feels more natural on iOS
- **Faster**: No need to initialize web camera stream
- **Consistent**: Uses iOS native camera interface users are familiar with
- **Cleaner**: Single hand reference overlay, no toggle button

## Technical Details

### Native Camera Function
Uses the `takePicture()` function from `lib/native-bridge.ts`:

```typescript
export async function takePicture(options?: CameraOptions): Promise<PhotoResponse> {
  const bridge = getNativeBridge();
  if (!bridge) {
    throw new Error('Native bridge not available');
  }
  return bridge.takePicture(options);
}
```

### Camera Options
- `source: 'camera'` - Opens camera directly (not photo library)
- `allowEditing: false` - No editing UI, just capture

### Error Handling
- Catches native camera errors
- Restores previous photo if capture fails
- Shows user-friendly error toast messages
- Falls back to web camera on non-native platforms

## Testing Checklist

### Native iOS
- [ ] First photo uses web camera with hand overlay
- [ ] Replace photo button opens native camera
- [ ] Native camera captures photo successfully
- [ ] Photo replaces original in all design tabs
- [ ] Error handling works if camera fails
- [ ] Cancel button restores previous photo

### Web Browser
- [ ] First photo uses web camera with hand overlay
- [ ] Replace photo button uses web camera
- [ ] Web camera works as before
- [ ] All existing functionality preserved

## Files Modified
1. `app/capture/page.tsx` - Updated replaceHandPhoto function
2. `public/ref1.png` - Deleted
3. `public/ref3.png` - Deleted

## Files Unchanged
- `lib/native-bridge.ts` - Already has takePicture function
- `ios/App/App/CameraManager.swift` - Native camera implementation exists
- Web camera functionality - Still works for initial photo

## Notes
- Web camera is still used for the initial hand reference photo to show the overlay guide
- Native camera is used for all subsequent photo replacements on iOS
- Web platform continues to use web camera for all photos
- This provides the best of both worlds: guided first photo + native camera experience
