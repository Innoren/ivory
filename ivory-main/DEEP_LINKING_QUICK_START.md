# Deep Linking Quick Start

## What This Does
When a nail tech sends a booking invite link to a client, and the client has your app installed, tapping the link will open the app directly instead of the web browser.

## Setup Complete ✅

All code changes are done! Here's what was configured:

1. **iOS Entitlements** - Added Associated Domains capability
2. **Apple App Site Association** - Created with your Team ID (B46X894ZHC)
3. **AppDelegate** - Handles incoming Universal Links
4. **WebViewModel** - Navigates to the correct page in the app
5. **Next.js Config** - Serves the association file correctly

## Deploy & Test

### Step 1: Deploy to Vercel
```bash
npm run build
vercel deploy --prod
```

### Step 2: Verify Association File
After deployment, check it's accessible:
```bash
curl https://ivory-blond.vercel.app/.well-known/apple-app-site-association
```

Should return JSON with your app configuration.

### Step 3: Rebuild iOS App
```bash
npx cap sync ios
npx cap open ios
```

In Xcode:
1. Clean build folder (Cmd+Shift+K)
2. Build and run on a physical device (Universal Links don't work in simulator)

### Step 4: Test It!

**Create a test booking invite:**
1. Open the app as a nail tech
2. Go to Bookings
3. Create a manual booking
4. Copy the invite link

**Test the link:**
1. Send the link to yourself via Messages or Notes
2. Tap the link on your iPhone
3. Should open in the app, not Safari!

**Example link format:**
```
https://ivory-blond.vercel.app/booking/invite/abc123xyz
```

## Troubleshooting

### Link Opens in Safari
- Long press the link in Safari
- Select "Open in Ivory's Choice"
- iOS will remember this preference

### App Doesn't Open
1. Verify association file is accessible (Step 2 above)
2. Reinstall the app (iOS caches association files)
3. Wait a few minutes for Apple's CDN to cache the file
4. Check Xcode logs for errors

### Check Xcode Logs
Look for these messages:
```
🔵 Universal Link received: https://...
🔵 Handling Universal Link in WebViewModel: ...
🔵 Navigating to: http://localhost:3000/booking/invite/...
```

## Supported Link Types

All these will open in the app:
- `/booking/invite/[token]` - Booking invites
- `/book/[techId]` - Direct booking pages
- `/tech/[id]` - Tech profiles
- `/shared/[id]` - Shared designs
- `/share/[id]` - Share pages
- `/share-with-tech/[id]` - Tech sharing

## How It Works

```
Tech creates booking
    ↓
Generates link: https://ivory-blond.vercel.app/booking/invite/abc123
    ↓
Sends to client via SMS/Email
    ↓
Client taps link on iPhone
    ↓
iOS checks: Is app installed? ✅
    ↓
iOS verifies: Does app claim this domain? ✅
    ↓
Opens app with URL
    ↓
App navigates to booking invite page
    ↓
Client sees booking details in app! 🎉
```

## Production Checklist

- [x] Team ID configured (B46X894ZHC)
- [x] Association file created
- [x] iOS code updated
- [ ] Deploy to Vercel
- [ ] Verify association file is accessible
- [ ] Rebuild iOS app
- [ ] Test on physical device
- [ ] Test all link types

## Need Help?

See `UNIVERSAL_LINKS_DEEP_LINKING_SETUP.md` for detailed documentation.

Run `./test-universal-links.sh` to verify your setup.
