#!/bin/bash

# Test Camera Overlay Setup
# Verifies that all files are in place for the camera overlay feature

echo "🔍 Testing Camera Overlay Setup..."
echo ""

# Check if CameraOverlayViewController exists
if [ -f "ios/App/App/CameraOverlayViewController.swift" ]; then
    echo "✅ CameraOverlayViewController.swift exists"
else
    echo "❌ CameraOverlayViewController.swift NOT FOUND"
    exit 1
fi

# Check if CameraManager exists
if [ -f "ios/App/App/CameraManager.swift" ]; then
    echo "✅ CameraManager.swift exists"
else
    echo "❌ CameraManager.swift NOT FOUND"
    exit 1
fi

# Check if ref2.png exists in public
if [ -f "public/ref2.png" ]; then
    echo "✅ public/ref2.png exists"
else
    echo "❌ public/ref2.png NOT FOUND"
    exit 1
fi

# Check if ref2 imageset exists
if [ -d "ios/App/App/Assets.xcassets/ref2.imageset" ]; then
    echo "✅ ref2.imageset directory exists"
else
    echo "❌ ref2.imageset directory NOT FOUND"
    exit 1
fi

# Check if ref2.png exists in Assets
if [ -f "ios/App/App/Assets.xcassets/ref2.imageset/ref2.png" ]; then
    echo "✅ ref2.png copied to Assets.xcassets"
    
    # Get file size
    SIZE=$(ls -lh "ios/App/App/Assets.xcassets/ref2.imageset/ref2.png" | awk '{print $5}')
    echo "   File size: $SIZE"
else
    echo "❌ ref2.png NOT FOUND in Assets.xcassets"
    exit 1
fi

# Check if Contents.json exists
if [ -f "ios/App/App/Assets.xcassets/ref2.imageset/Contents.json" ]; then
    echo "✅ Contents.json exists"
else
    echo "❌ Contents.json NOT FOUND"
    exit 1
fi

# Check if CameraManager references the overlay camera
if grep -q "presentCustomCamera" "ios/App/App/CameraManager.swift"; then
    echo "✅ CameraManager uses custom camera"
else
    echo "❌ CameraManager doesn't reference custom camera"
    exit 1
fi

# Check if CameraOverlayViewController has the right properties
if grep -q "overlayImageName" "ios/App/App/CameraOverlayViewController.swift"; then
    echo "✅ CameraOverlayViewController has overlay properties"
else
    echo "❌ CameraOverlayViewController missing overlay properties"
    exit 1
fi

echo ""
echo "🎉 All checks passed! Camera overlay is ready to use."
echo ""
echo "Next steps:"
echo "1. Open Xcode: open ios/App/App.xcworkspace"
echo "2. Build and run on a physical device"
echo "3. Navigate to camera/capture page"
echo "4. Verify ref2.png appears as overlay"
echo ""
