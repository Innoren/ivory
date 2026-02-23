# Camera Overlay Visual Summary

## 📸 Camera Interface Layout

```
┌─────────────────────────────────────┐
│  [X]                    [🔄]        │  ← Top Bar
│                                     │
│                                     │
│         ┌─────────────┐             │
│         │             │             │
│         │   ref2.png  │             │  ← Overlay Image
│         │   (50% α)   │             │     (adjustable opacity)
│         │             │             │
│         └─────────────┘             │
│                                     │
│                                     │
│      ━━━━━━━━━━━━━━━━━━━━          │  ← Opacity Slider
│                                     │
│            ⚪                        │  ← Capture Button
└─────────────────────────────────────┘
```

## 🎛️ Controls

| Control | Location | Function |
|---------|----------|----------|
| **[X]** | Top Left | Close camera / Cancel |
| **[🔄]** | Top Right | Flip front/back camera |
| **━━━** | Bottom (above capture) | Adjust overlay opacity |
| **⚪** | Bottom Center | Capture photo |

## 🖼️ Overlay Details

**Image**: ref2.png
- **Resolution**: 1536 x 1024 pixels
- **Display Size**: 80% of screen width/height
- **Position**: Centered
- **Default Opacity**: 50%
- **Adjustable Range**: 0% - 100%

## 📱 User Flow

```
1. User taps "Take Photo"
        ↓
2. Camera opens with ref2.png overlay
        ↓
3. User adjusts opacity slider (optional)
        ↓
4. User positions nails to match overlay
        ↓
5. User taps capture button
        ↓
6. Photo captured WITHOUT overlay
        ↓
7. Photo returned as base64 to web app
```

## 🎨 Visual Features

### Overlay Appearance
- **Semi-transparent** by default (50% opacity)
- **Maintains aspect ratio** (scaleAspectFit)
- **Centered** on screen
- **Responsive** to screen size

### Camera Preview
- **Full screen** background
- **Live preview** from camera
- **Smooth transitions** when flipping camera
- **Professional UI** with iOS-style controls

## 🔧 Technical Implementation

```swift
// Overlay Setup
overlayImageView.contentMode = .scaleAspectFit
overlayImageView.alpha = 0.5  // 50% opacity
overlayImageView.frame = 80% of screen size
overlayImageView.center = screen center

// Camera Setup
AVCaptureSession with .photo preset
AVCaptureVideoPreviewLayer (full screen)
AVCapturePhotoOutput for capture
```

## 📊 Image Specifications

| Property | Value |
|----------|-------|
| Source File | `public/ref2.png` |
| iOS Asset | `Assets.xcassets/ref2.imageset/ref2.png` |
| Dimensions | 1536 x 1024 px |
| File Size | ~2.1 MB |
| Format | PNG with alpha channel |
| Color Space | RGB |

## 🎯 Use Cases

1. **Nail Alignment**: Users can align their nails with reference image
2. **Design Matching**: Match nail shape/position to template
3. **Consistent Framing**: Ensure consistent photo composition
4. **Professional Results**: Guide users to take better photos

## ⚙️ Customization Options

### Change Overlay Image
```swift
cameraVC.overlayImageName = "your-image-name"
```

### Adjust Default Opacity
```swift
cameraVC.overlayOpacity = 0.7  // 70%
```

### Modify Display Size
```swift
// In CameraOverlayViewController.swift
overlayImageView.widthAnchor.constraint(
    equalTo: view.widthAnchor, 
    multiplier: 0.9  // Change from 0.8 to 0.9 (90%)
)
```

## 🧪 Testing Checklist

- [ ] Overlay appears when camera opens
- [ ] Opacity slider adjusts transparency
- [ ] Camera flip button works (front/back)
- [ ] Close button dismisses camera
- [ ] Capture button takes photo
- [ ] Photo does NOT include overlay
- [ ] Works on both front and back cameras
- [ ] UI elements are visible and accessible
- [ ] Smooth animations and transitions

## 📝 Notes

- Overlay is **preview-only** - not burned into captured photo
- Requires **physical iOS device** (camera unavailable in simulator)
- Needs **camera permissions** granted
- Image loaded from **Assets.xcassets** (not web bundle)
- **Real-time opacity adjustment** with slider
