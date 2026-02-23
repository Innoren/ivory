#!/bin/bash

echo "📹 Adding ivory2.mp4 to Xcode project..."

# Copy video to iOS app bundle
cp public/ivory2.mp4 ios/App/App/

echo "✅ Video copied to ios/App/App/"
echo ""
echo "⚠️  IMPORTANT: You must manually add the video to Xcode:"
echo "1. Open Xcode"
echo "2. Right-click on 'App' folder in Project Navigator"
echo "3. Select 'Add Files to \"App\"...'"
echo "4. Navigate to ios/App/App/ and select ivory2.mp4"
echo "5. Make sure 'Copy items if needed' is UNCHECKED (it's already there)"
echo "6. Make sure 'Add to targets: App' is CHECKED"
echo "7. Click 'Add'"
echo ""
echo "Then rebuild and run!"
