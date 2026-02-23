# Native iOS Camera Fix - No More Web Camera Flash

## Problem
When opening the native iOS app for the first time, users would see the web camera UI briefly before the native iOS camera opened. This created a confusing experience.

## Root Cause
The capture page was:
1. Rendering the web camera `<video>` element on all platforms including iOS
2. Calling `startCamera()` which would then detect iOS and open the native camera
3. This caused a brief flash of the web UI before the native camera appeared

## Solution

### 1. Updated `startCamera()` Function
**File:** `app/capture/page.tsx`

Changed the function to NOT open the native camera automatically on iOS. Instead, it just returns early:

```typescript
const startCamera = async () => {
  // On native iOS, don't start web camera at all - user will tap capture button to open native camera
  if (isNativeIOS()) {
    console.log('📸 Native iOS detected - waiting for user to tap capture button')
    return // Don't start web camera on iOS
  }
  
  // ... rest of web camera logic
}
```

### 2. Conditional Video Element Rendering
**File:** `app/capture/page.tsx`

The video element now only renders on web, not on native iOS:

```tsx
{/* Video element - only show on web, not on native iOS */}
{!isNativeIOS() && (
  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    className="w-full h-full object-cover transition-all duration-500"
    // ... styles
  />
)}
```

### 3. Native iOS Capture Button
**File:** `app/capture/page.tsx`

Added a clean capture button for iOS users instead of showing the video:

```tsx
{/* Native iOS: Show capture button instead of video */}
{isNativeIOS() && (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1A1A1A] via-black to-[#1A1A1A]">
    <button
      onClick={capturePhoto}
      className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 active:scale-95"
    >
      <Camera className="w-16 h-16 text-white" strokeWidth={1.5} />
      <span className="text-white text-lg font-light tracking-wider uppercase">Tap to Capture</span>
    </button>
  </div>
)}
```

### 4. Hide Web-Only Controls on iOS
**File:** `app/capture/page.tsx`

- Hand reference overlay: Only shown on web
- Flip camera button: Only shown on web (native camera has its own flip control)

```tsx
{/* Hand Reference Overlay - only show on web */}
{!isNativeIOS() && (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[5] overflow-visible">
    {/* ... hand overlay */}
  </div>
)}

{/* Elegant Right Side Controls - only show on web */}
{!isNativeIOS() && (
  <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-4 animate-fade-in-delayed">
    {/* Flip Camera Button */}
  </div>
)}
```

## User Experience Now

### On Native iOS:
1. User opens the app → sees a clean "Tap to Capture" button
2. User taps the button → native iOS camera opens immediately with ref2 overlay
3. User takes photo → returns to design view
4. No web camera flash or confusion!

### On Web:
1. User opens the app → web camera starts automatically
2. Hand reference overlay shows to guide positioning
3. Flip camera button available
4. Everything works as before

## Testing
1. Open the native iOS app
2. Navigate to capture page
3. You should see ONLY the "Tap to Capture" button, not the web camera
4. Tap the button → native camera opens with overlay
5. Take a photo → should work perfectly

## Files Changed
- `app/capture/page.tsx` - Main capture page logic and UI
