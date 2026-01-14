# Quick Fix: Native iOS Landing Page Bypass

## What Was Fixed
iPad Air 13 was showing the landing page instead of going directly to login/signup.

## Solution
Added early native detection that runs BEFORE the page loads, ensuring the app immediately redirects to `/auth` without showing the landing page.

## Quick Test
```bash
./rebuild-and-test-native.sh
```

Then in Xcode:
1. Delete app from iPad
2. Run fresh build (⌘R)
3. App should open directly to login/signup

## What to Look For
✅ Black screen briefly → Login/signup screen
❌ Landing page should NEVER appear

## Debug
Safari > Develop > [iPad] > localhost
Console should show: "Native iOS detected - bypassing landing page"

## Files Changed
- `ios/App/App/WebView.swift` - Early injection
- `lib/native-bridge.ts` - Better detection  
- `app/page.tsx` - Bypass logic
- `app/auth/page.tsx` - Debug logs

## Full Details
See `NATIVE_LANDING_PAGE_FIX.md` for complete documentation.
