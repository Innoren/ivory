#!/bin/bash

echo "🎬 Quick Onboarding Video Test"
echo "=============================="
echo ""

# Check if video exists
if [ ! -f "ios/App/App/ivory - Made with Clipchamp.mov" ]; then
    echo "❌ Video file not found!"
    exit 1
fi

echo "✅ Video file found (9.2MB)"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo ""
echo "1) Test in Simulator (recommended)"
echo "2) Test on Real Device"
echo "3) Just open Xcode"
echo "4) Reset onboarding state only"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🧹 Resetting simulator..."
        xcrun simctl shutdown all
        xcrun simctl erase all
        
        echo ""
        echo "🔨 Opening Xcode..."
        open ios/App/App.xcodeproj
        
        echo ""
        echo "✅ Ready to test!"
        echo ""
        echo "In Xcode:"
        echo "  1. Select iPhone 15 Pro simulator"
        echo "  2. Click Run (⌘R)"
        echo "  3. Open Console (⌘⇧Y)"
        echo "  4. Watch for 🎬 emoji logs"
        echo ""
        echo "Expected: Video plays automatically on first launch"
        ;;
        
    2)
        echo ""
        echo "📱 Testing on real device..."
        echo ""
        echo "Steps:"
        echo "  1. Connect your iPad/iPhone"
        echo "  2. Delete the app from device"
        echo "  3. In Xcode, select your device"
        echo "  4. Click Run (⌘R)"
        echo "  5. Check Xcode console for logs"
        echo ""
        
        open ios/App/App.xcodeproj
        ;;
        
    3)
        echo ""
        echo "🔨 Opening Xcode..."
        open ios/App/App.xcodeproj
        echo ""
        echo "✅ Xcode opened!"
        echo ""
        echo "To test onboarding:"
        echo "  1. Reset simulator: Device → Erase All Content"
        echo "  2. Or delete app from device"
        echo "  3. Build and run (⌘R)"
        ;;
        
    4)
        echo ""
        echo "🔄 Resetting onboarding state..."
        xcrun simctl shutdown all
        xcrun simctl erase all
        echo ""
        echo "✅ Simulator reset! Onboarding will show on next launch."
        ;;
        
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📖 For detailed instructions, see: ONBOARDING_VIDEO_READY.md"
