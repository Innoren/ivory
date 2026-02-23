#!/bin/bash

echo "🔧 Removing PassKit references and rebuilding iOS app..."

# Step 1: Clean Xcode build cache
echo "1️⃣ Cleaning Xcode cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ios/App/build/

# Step 2: Clean Capacitor cache
echo "2️⃣ Cleaning Capacitor cache..."
rm -rf node_modules/.capacitor
rm -rf ios/App/App/public/

# Step 3: Reinstall dependencies
echo "3️⃣ Reinstalling dependencies..."
yarn install

# Step 4: Build web app
echo "4️⃣ Building web app..."
yarn build

# Step 5: Sync with iOS
echo "5️⃣ Syncing with iOS..."
npx cap sync ios

# Step 6: Verify no PassKit usage
echo "6️⃣ Verifying no PassKit usage..."
echo "Searching for PassKit imports..."
grep -r "import PassKit" ios/ || echo "✅ No PassKit imports found"

echo "Searching for PKPayment usage..."
grep -r "PKPayment" ios/ || echo "✅ No PKPayment usage found"

echo "Searching for PassKit in project files..."
grep -r "PassKit" ios/App/App.xcodeproj/ || echo "✅ No PassKit in project files"

echo ""
echo "🎉 iOS app rebuilt without PassKit!"
echo ""
echo "📝 Next steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Build and test the app"
echo "3. Submit to App Store with review notes from APPLE_PASSKIT_REVIEW_RESPONSE.md"
echo ""
echo "💡 Review Notes Template:"
echo "The PassKit framework was included as a transitive dependency from third-party SDKs."
echo "The app does NOT implement Apple Pay or use any PassKit functionality."
echo "Payment methods: Stripe Checkout (web) and Apple In-App Purchases (StoreKit)."