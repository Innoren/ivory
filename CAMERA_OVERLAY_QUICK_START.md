# Camera Overlay Quick Start

## What Was Done

✅ Created `CameraOverlayViewController.swift` - Custom camera with ref2.png overlay
✅ Updated `CameraManager.swift` - Integrated overlay camera
✅ Added ref2.png to iOS Assets.xcassets
✅ Configured opacity slider and camera controls

## How to Use

### On iOS Device:
1. Open the app
2. Navigate to capture/camera page
3. Tap "Take Photo"
4. **You'll see ref2.png overlaid on the camera preview**
5. Adjust opacity with the slider
6. Flip camera with the rotate button
7. Capture photo

### Features:
- **Overlay**: ref2.png displayed at 50% opacity (adjustable)
- **Opacity Slider**: Bottom of screen, adjust 0-100%
- **Flip Camera**: Top right button
- **Close**: Top left X button
- **Capture**: Large white button at bottom

## The Overlay

The ref2.png image is:
- Centered on screen
- 80% of screen width/height
- Semi-transparent (adjustable)
- **NOT included in captured photo** (only visible in preview)

## Testing

Run the test script:
```bash
./test-camera-overlay.sh
```

## Build & Run

```bash
# Open in Xcode
open ios/App/App.xcworkspace

# Or rebuild
./rebuild-ios-iap.sh
```

## Files Modified/Created

```
ios/App/App/
├── CameraOverlayViewController.swift  [NEW]
├── CameraManager.swift                [MODIFIED]
└── Assets.xcassets/
    └── ref2.imageset/                 [NEW]
        ├── Contents.json
        └── ref2.png
```

## Customization

### Change overlay image:
Edit `CameraOverlayViewController.swift`:
```swift
var overlayImageName: String = "your-image-name"
```

### Change default opacity:
```swift
var overlayOpacity: CGFloat = 0.7 // 0.0 to 1.0
```

### Disable overlay:
In `CameraManager.swift`, change `presentCustomCamera` to `presentPicker` for standard camera.

## Notes

- Only works on physical iOS devices (not simulator)
- Requires camera permissions
- Overlay is preview-only (not in captured photo)
- Works with both front and back cameras
