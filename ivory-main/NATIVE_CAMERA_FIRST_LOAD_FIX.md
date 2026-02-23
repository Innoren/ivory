# Native iOS Camera First Load Fix

## Problem
When opening the native iOS app for the first time, users were seeing the web camera view briefly before the native iOS camera opened. This created a confusing experience where:
1. Web camera view appeared first
2. User tried to take a picture with the web camera
3. Then the native iOS camera opened

## Root Cause
The issue was a **timing problem** with the NativeBridge initialization:

1. When the React component mounted, it checked `isNativeIOS()` which looks for `window.NativeBridge`
2. At that moment, the Swift WebView might not have finished injecting the NativeBridge yet
3. So `isNativeIOS()` returned `false`, causing the web camera to start
4. A moment later, the NativeBridge was ready, but the web camera was already running

## Solution
Applied a multi-layered fix to ensure the native camera is used on iOS:

### 1. Added Delayed Check in `startCamera()`
```typescript
const startCamera = async () => {
  // First check
  if (isNativeIOS()) {
    console.log('📸 Native iOS detected - waiting for user to tap capture button')
    return
  }
  
  // Double-check after a small delay to ensure NativeBridge is initialized
  await new Promise(resolve => setTimeout(resolve, 100))
  if (isNativeIOS()) {
    console.log('📸 Native iOS detected (delayed check) - waiting for user to tap capture button')
    return
  }
  
  // Continue with web camera...
}
```

### 2. Increased Initialization Delay
Changed the delay before calling `startCamera()` from 200ms to 300ms to give the NativeBridge more time to initialize:

```typescript
// Before
setTimeout(() => startCamera(), 200)

// After
setTimeout(() => startCamera(), 300)
```

### 3. Conditional Video Element Rendering
The video element is already conditionally rendered to only show on web platforms:

```tsx
{/* Video element - only shown on web platforms, NOT on native iOS */}
{!isNativeIOS() && (
  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    className="w-full h-full object-cover transition-all duration-500"
    // ...
  />
)}

{/* Native iOS: Show capture button instead of video */}
{isNativeIOS() && (
  <div className="w-full h-full flex items-center justify-center">
    <button onClick={capturePhoto}>
      <Camera />
      <span>Tap to Capture</span>
    </button>
  </div>
)}
```

## Testing
To verify the fix works:

1. **Clean Install Test**
   - Delete the app from your iOS device
   - Rebuild and install: `npm run build:ios`
   - Open Xcode and run on device
   - On first launch, you should see the "Tap to Capture" button, NOT the web camera

2. **Subsequent Launches**
   - Close and reopen the app
   - Navigate to the capture page
   - Should consistently show the native camera button on iOS

3. **Web Browser Test**
   - Open the app in Safari or Chrome on desktop
   - Should show the web camera view (not the native button)
   - This confirms the conditional rendering works correctly

## Files Modified
- `app/capture/page.tsx` - Added delayed NativeBridge check and increased initialization delay

## Related Files
- `lib/native-bridge.ts` - Contains the `isNativeIOS()` function
- `ios/App/App/CameraManager.swift` - Native iOS camera implementation
- `ios/App/App/WebViewModel.swift` - Handles NativeBridge injection

## Notes
- The 300ms delay is a balance between giving enough time for NativeBridge initialization and not making the user wait too long
- The double-check in `startCamera()` provides an extra safety net
- The conditional rendering ensures the web camera UI never appears on iOS, even if the checks fail
