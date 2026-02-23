# Universal Links & Deep Linking Setup

## Overview
Universal Links allow your iOS app to open automatically when users click on booking invite links, instead of opening in the browser. This provides a seamless experience for clients joining appointments.

## What's Been Configured

### 1. iOS Entitlements (`ios/App/App/App.entitlements`)
Added Associated Domains capability:
```xml
<key>com.apple.developer.associated-domains</key>
<array>
    <string>applinks:ivory-blond.vercel.app</string>
    <string>applinks:www.ivory-blond.vercel.app</string>
</array>
```

### 2. Apple App Site Association File
Created `public/.well-known/apple-app-site-association` with paths:
- `/booking/invite/*` - Client booking invites
- `/book/*` - Direct booking pages
- `/shared/*` - Shared designs
- `/share/*` - Share pages
- `/share-with-tech/*` - Tech sharing
- `/tech/*` - Tech profiles

### 3. AppDelegate Universal Link Handling
Updated `ios/App/App/AppDelegate.swift` to:
- Receive Universal Link events
- Post notifications to WebViewModel
- Log deep link activity

### 4. WebViewModel Navigation
Updated `ios/App/App/WebViewModel.swift` to:
- Listen for Universal Link notifications
- Navigate WebView to the correct path
- Handle both localhost (dev) and production URLs

### 5. Next.js Configuration
Already configured in `next.config.mjs` to serve the association file with correct headers.

## Setup Steps

### Step 1: Update Team ID in Association File
1. Open `public/.well-known/apple-app-site-association`
2. Replace `TEAM_ID` with your actual Apple Team ID (found in Apple Developer Portal)
3. Should look like: `"appID": "ABC123XYZ.com.ivory.app"`

### Step 2: Deploy Association File
The file needs to be accessible at:
```
https://ivory-blond.vercel.app/.well-known/apple-app-site-association
https://www.ivory-blond.vercel.app/.well-known/apple-app-site-association
```

Deploy your Next.js app to make it available.

### Step 3: Verify Association File
Test the file is accessible:
```bash
curl https://ivory-blond.vercel.app/.well-known/apple-app-site-association
```

Should return JSON with your app configuration.

### Step 4: Enable Associated Domains in Xcode
1. Open `ios/App/App.xcodeproj` in Xcode
2. Select the App target
3. Go to "Signing & Capabilities"
4. Verify "Associated Domains" capability is present
5. Verify domains are listed:
   - `applinks:ivory-blond.vercel.app`
   - `applinks:www.ivory-blond.vercel.app`

### Step 5: Rebuild and Test
```bash
# Rebuild the iOS app
cd ios/App
xcodebuild clean
cd ../..
npm run build
npx cap sync ios
npx cap open ios
```

## Testing Universal Links

### Test on Device (Required)
Universal Links only work on physical devices, not simulators.

1. **Install the app** on your iPhone/iPad
2. **Send yourself a booking invite link** via Messages, Email, or Notes
3. **Tap the link** - should open in the app, not Safari
4. **Check Xcode logs** for:
   ```
   🔵 Universal Link received: https://ivory-blond.vercel.app/booking/invite/abc123
   🔵 Handling Universal Link in WebViewModel: ...
   🔵 Navigating to: http://localhost:3000/booking/invite/abc123
   ```

### Test Link Types
- Booking invite: `https://ivory-blond.vercel.app/booking/invite/[token]`
- Direct booking: `https://ivory-blond.vercel.app/book/[techId]`
- Tech profile: `https://ivory-blond.vercel.app/tech/[id]`
- Shared design: `https://ivory-blond.vercel.app/shared/[id]`

### Troubleshooting

#### Link Opens in Safari Instead of App
1. **Long press the link** in Safari
2. Select "Open in [App Name]"
3. This tells iOS to prefer the app for future links

#### Association File Not Loading
1. Verify file is at `/.well-known/apple-app-site-association` (no .json extension)
2. Check it returns `Content-Type: application/json`
3. Ensure HTTPS is working (no certificate errors)
4. Wait 24 hours for Apple's CDN to cache it

#### App Not Receiving Links
1. Check Associated Domains in Xcode capabilities
2. Verify Team ID in association file matches your Apple Developer account
3. Ensure app is signed with correct provisioning profile
4. Reinstall the app (iOS caches association files)

## How It Works

### Flow Diagram
```
1. Tech creates booking → Generates invite link
   https://ivory-blond.vercel.app/booking/invite/abc123

2. Tech sends link to client via SMS/Email

3. Client taps link on iPhone
   ↓
4. iOS checks: Is app installed?
   ↓
5. YES → iOS fetches association file from domain
   ↓
6. iOS verifies: Does app claim this domain?
   ↓
7. YES → iOS opens app with URL
   ↓
8. AppDelegate receives URL
   ↓
9. Posts notification to WebViewModel
   ↓
10. WebViewModel navigates to /booking/invite/abc123
    ↓
11. Client sees booking details in app
```

### Fallback Behavior
- **App not installed**: Opens in Safari (web app)
- **Association file fails**: Opens in Safari
- **Domain not verified**: Opens in Safari

## Production Checklist

- [ ] Replace `TEAM_ID` in association file with actual Team ID
- [ ] Deploy association file to production domain
- [ ] Verify file is accessible via HTTPS
- [ ] Update domains in entitlements if using custom domain
- [ ] Test on physical device with production build
- [ ] Verify all link types work (booking, tech profile, shared designs)
- [ ] Test fallback behavior (app not installed)

## Custom Domain Setup

If you move to a custom domain (e.g., `www.ivoryschoice.com`):

1. Update `ios/App/App/App.entitlements`:
   ```xml
   <string>applinks:www.ivoryschoice.com</string>
   <string>applinks:ivoryschoice.com</string>
   ```

2. Deploy association file to new domain

3. Update `WebViewModel.swift` production URL:
   ```swift
   let baseURL = "https://www.ivoryschoice.com"
   ```

4. Rebuild and resubmit to App Store

## Additional Resources

- [Apple Universal Links Documentation](https://developer.apple.com/ios/universal-links/)
- [Branch.io Universal Links Validator](https://branch.io/resources/aasa-validator/)
- [Apple App Site Association Validator](https://search.developer.apple.com/appsearch-validation-tool/)
