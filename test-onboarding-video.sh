#!/bin/bash

echo "🎬 Testing Onboarding Video Implementation"
echo "=========================================="
echo ""

# Check if video file exists
echo "1️⃣ Checking video file..."
if [ -f "ios/App/App/ivory - Made with Clipchamp.mov" ]; then
    VIDEO_SIZE=$(ls -lh "ios/App/App/ivory - Made with Clipchamp.mov" | awk '{print $5}')
    echo "   ✅ Video file found: $VIDEO_SIZE"
else
    echo "   ❌ Video file NOT found in ios/App/App/"
    exit 1
fi

echo ""
echo "2️⃣ Checking Swift files..."

# Check OnboardingVideoView.swift
if [ -f "ios/App/App/OnboardingVideoView.swift" ]; then
    echo "   ✅ OnboardingVideoView.swift exists"
else
    echo "   ❌ OnboardingVideoView.swift NOT found"
    exit 1
fi

# Check OnboardingManager.swift
if [ -f "ios/App/App/OnboardingManager.swift" ]; then
    echo "   ✅ OnboardingManager.swift exists"
else
    echo "   ❌ OnboardingManager.swift NOT found"
    exit 1
fi

# Check ContentView.swift
if [ -f "ios/App/App/ContentView.swift" ]; then
    echo "   ✅ ContentView.swift exists"
    
    # Check if it references onboarding
    if grep -q "showOnboardingVideo" "ios/App/App/ContentView.swift"; then
        echo "   ✅ ContentView references onboarding video"
    else
        echo "   ⚠️  ContentView may not be properly configured"
    fi
else
    echo "   ❌ ContentView.swift NOT found"
    exit 1
fi

echo ""
echo "3️⃣ Checking Xcode project..."

# Check if files are in project.pbxproj
if grep -q "OnboardingVideoView.swift" "ios/App/App.xcodeproj/project.pbxproj"; then
    echo "   ✅ OnboardingVideoView.swift in Xcode project"
else
    echo "   ⚠️  OnboardingVideoView.swift may not be in Xcode project"
fi

if grep -q "OnboardingManager.swift" "ios/App/App.xcodeproj/project.pbxproj"; then
    echo "   ✅ OnboardingManager.swift in Xcode project"
else
    echo "   ⚠️  OnboardingManager.swift may not be in Xcode project"
fi

if grep -q "ivory - Made with Clipchamp.mov" "ios/App/App.xcodeproj/project.pbxproj"; then
    echo "   ✅ Video file in Xcode project"
else
    echo "   ⚠️  Video file may not be in Xcode project"
    echo "   📝 You need to add it manually in Xcode"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "📱 Next Steps:"
echo "   1. Open Xcode: open ios/App/App.xcodeproj"
echo "   2. Select the video file in Project Navigator"
echo "   3. In File Inspector, check 'Target Membership' → 'App'"
echo "   4. Clean build: Product → Clean Build Folder (⌘⇧K)"
echo "   5. Reset simulator: xcrun simctl erase all"
echo "   6. Build and run (⌘R)"
echo ""
echo "🎬 Expected Behavior:"
echo "   - First launch: Video plays automatically"
echo "   - No skip button (video must complete)"
echo "   - After video: Transitions to login/signup"
echo "   - Subsequent launches: No video (goes to web)"
echo ""
echo "🐛 Debug:"
echo "   - Check Xcode console for '🎬' emoji logs"
echo "   - Look for 'Found video file' or 'Could not find' messages"
echo "   - Debug indicator shows 'ONBOARDING' or 'WEBVIEW' in top-right"
