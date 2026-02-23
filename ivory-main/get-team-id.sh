#!/bin/bash

# Script to help find your Apple Team ID

echo "🔍 Finding Apple Team ID..."
echo ""
echo "Method 1: From Xcode Project"
echo "----------------------------"

if [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
    TEAM_ID=$(grep -m 1 "DEVELOPMENT_TEAM" ios/App/App.xcodeproj/project.pbxproj | sed 's/.*= \(.*\);/\1/' | tr -d ' ')
    if [ ! -z "$TEAM_ID" ]; then
        echo "✅ Found Team ID in Xcode project: $TEAM_ID"
        echo ""
        echo "📝 Update this in: public/.well-known/apple-app-site-association"
        echo "   Replace: TEAM_ID.com.ivory.app"
        echo "   With: $TEAM_ID.com.ivory.app"
    else
        echo "⚠️  Team ID not found in Xcode project"
    fi
else
    echo "⚠️  Xcode project not found"
fi

echo ""
echo "Method 2: Manual Lookup"
echo "----------------------"
echo "1. Go to: https://developer.apple.com/account"
echo "2. Sign in with your Apple Developer account"
echo "3. Go to 'Membership' section"
echo "4. Your Team ID is listed there (10 characters, like ABC123XYZ)"
echo ""
echo "Method 3: From Keychain"
echo "----------------------"
echo "1. Open Keychain Access app"
echo "2. Search for 'iPhone Developer' or 'iPhone Distribution'"
echo "3. Double-click the certificate"
echo "4. Look for 'Organizational Unit' - that's your Team ID"
echo ""
