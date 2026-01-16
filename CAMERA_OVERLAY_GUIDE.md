# Camera Overlay Feature - ref2.png

## Overview
The iOS native camera now displays the `ref2.png` image as an overlay when taking photos. This helps users align their nails with a reference image for better nail design capture.

## Features

### 1. **Overlay Display**
- The ref2.png image is displayed semi-transparently over the camera preview
- Default opacity: 50% (adjustable)
- Centered on screen with 80% width/height

### 2. **Opacity Control**
- Slider at the bottom of the screen (above capture button)
- Adjust from 0% (invisible) to 100% (fully opaque)
- Real-time adjustment while viewing camera

### 3. **Camera Controls**
- **Capture Button**: Large white button at bottom center
- **Close Button**: X button at top left (cancels and returns)
- **Flip Camera**: Rotate icon at top right (switches front/back camera)
- **Opacity Slider**: Horizontal slider above capture button

### 4. **Camera Switching**
- Tap the flip button to switch between front and back cameras
- Overlay remains visible during camera switch
- Smooth transition between cameras

## How It Works

### iOS Implementation

The feature uses a custom `CameraOverlayViewController` that:
1. Creates an AVCaptureSession for camera preview
2. Loads ref2.png from Assets.xcassets
3. Displays it as a UIImageView overlay
4. Captures photos with AVCapturePhotoOutput
5. Returns the captured image (without overlay) as base64

### Integration with CameraManager

When `takePicture()` is called with `source: "camera"`:
- Automatically uses the overlay camera
- Shows ref2.png overlay by default
- Returns captured photo without the overlay burned in

## Usage from Web/React

```typescript
// Take photo with overlay (default behavior)
await nativeBridge.takePicture({ source: 'camera' });

// Take photo from library (no overlay)
await nativeBridge.takePicture({ source: 'photos' });

// Show action sheet (includes overlay option)
await nativeBridge.takePicture({ source: 'prompt' });
```

## Customization Options

### Change Overlay Image
To use a different reference image:
1. Add your image to `ios/App/App/Assets.xcassets/`
2. Update `overlayImageName` in CameraManager:
```swift
cameraVC.overlayImageName = "your-image-name"
```

### Change Default Opacity
In `CameraOverlayViewController.swift`:
```swift
var overlayOpacity: CGFloat = 0.5 // Change to 0.0-1.0
```

### Disable Overlay
To temporarily disable the overlay feature, modify CameraManager to use the standard UIImagePickerController instead of CameraOverlayViewController.

## File Structure

```
ios/App/App/
├── CameraManager.swift              # Main camera interface
├── CameraOverlayViewController.swift # Custom camera with overlay
└── Assets.xcassets/
    └── ref2.imageset/
        ├── Contents.json
        └── ref2.png                 # The overlay image
```

## Testing

1. Open the app on a physical iOS device (camera doesn't work in simulator)
2. Navigate to the capture page
3. Tap "Take Photo" or trigger camera
4. Verify ref2.png appears as overlay
5. Adjust opacity slider
6. Test camera flip
7. Capture photo
8. Verify captured image doesn't include overlay

## Notes

- The overlay is only visible in the camera preview
- Captured photos do NOT include the overlay
- Works on both front and back cameras
- Requires camera permissions
- Only available on iOS (native implementation)

## Troubleshooting

### Overlay not showing
- Check that ref2.png exists in Assets.xcassets
- Verify image name matches in code: `overlayImageName = "ref2"`
- Check console logs for image loading errors

### Camera not opening
- Verify camera permissions are granted
- Check Info.plist has camera usage description
- Test on physical device (not simulator)

### Opacity slider not working
- Ensure overlayImageView is properly initialized
- Check slider value range (0.0 to 1.0)
- Verify slider target action is connected
