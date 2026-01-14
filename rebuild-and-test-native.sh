#!/bin/bash

echo "🧹 Cleaning Xcode cache..."
./clear-xcode-cache.sh

echo ""
echo "🔨 Building Next.js app..."
npm run build

echo ""
echo "📱 Opening Xcode project..."
cd ios/App
open App.xcodeproj

echo ""
echo "✅ Ready to test!"
echo ""
echo "Next steps:"
echo "1. In Xcode, select your iPad Air 13 as the target device"
echo "2. Delete the existing app from your iPad"
echo "3. Click Run (⌘R) to build and install"
echo "4. App should open directly to login/signup (NOT landing page)"
echo ""
echo "To debug:"
echo "- Open Safari > Develop > [Your iPad] > localhost"
echo "- Check console for: 'Native iOS detected - bypassing landing page'"
