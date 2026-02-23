#!/bin/bash

# Script to test Universal Links setup

echo "🧪 Testing Universal Links Setup"
echo "================================"
echo ""

# Check if association file exists
echo "1. Checking association file..."
if [ -f "public/.well-known/apple-app-site-association" ]; then
    echo "   ✅ File exists"
    
    # Check if TEAM_ID is still placeholder
    if grep -q "TEAM_ID" "public/.well-known/apple-app-site-association"; then
        echo "   ⚠️  WARNING: TEAM_ID placeholder still present"
        echo "   📝 Run ./get-team-id.sh to find your Team ID"
    else
        echo "   ✅ Team ID appears to be set"
    fi
else
    echo "   ❌ File not found"
fi

echo ""
echo "2. Checking entitlements..."
if [ -f "ios/App/App/App.entitlements" ]; then
    echo "   ✅ Entitlements file exists"
    
    if grep -q "com.apple.developer.associated-domains" "ios/App/App/App.entitlements"; then
        echo "   ✅ Associated Domains capability present"
        
        # Show configured domains
        echo "   📋 Configured domains:"
        grep -A 3 "com.apple.developer.associated-domains" "ios/App/App/App.entitlements" | grep "string" | sed 's/.*<string>\(.*\)<\/string>/      - \1/'
    else
        echo "   ❌ Associated Domains capability not found"
    fi
else
    echo "   ❌ Entitlements file not found"
fi

echo ""
echo "3. Checking AppDelegate..."
if [ -f "ios/App/App/AppDelegate.swift" ]; then
    echo "   ✅ AppDelegate exists"
    
    if grep -q "HandleUniversalLink" "ios/App/App/AppDelegate.swift"; then
        echo "   ✅ Universal Link handling implemented"
    else
        echo "   ❌ Universal Link handling not found"
    fi
else
    echo "   ❌ AppDelegate not found"
fi

echo ""
echo "4. Checking WebViewModel..."
if [ -f "ios/App/App/WebViewModel.swift" ]; then
    echo "   ✅ WebViewModel exists"
    
    if grep -q "handleUniversalLink" "ios/App/App/WebViewModel.swift"; then
        echo "   ✅ Universal Link navigation implemented"
    else
        echo "   ❌ Universal Link navigation not found"
    fi
else
    echo "   ❌ WebViewModel not found"
fi

echo ""
echo "5. Next steps..."
echo "   1. Run ./get-team-id.sh to find your Team ID"
echo "   2. Update public/.well-known/apple-app-site-association"
echo "   3. Deploy to Vercel: npm run build && vercel deploy"
echo "   4. Verify file is accessible:"
echo "      curl https://ivory-blond.vercel.app/.well-known/apple-app-site-association"
echo "   5. Rebuild iOS app: npx cap sync ios && npx cap open ios"
echo "   6. Test on physical device (Universal Links don't work in simulator)"
echo ""
echo "📖 See UNIVERSAL_LINKS_DEEP_LINKING_SETUP.md for detailed instructions"
echo ""
