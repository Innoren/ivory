# Native iOS Landing Page Bypass - Complete Fix

## Issue
iPad Air 13 (and other iOS devices) were showing the landing page when opening the native app, instead of going directly to the login/signup screen.

## Changes Made

### 1. WebView Early Injection (`ios/App/App/WebView.swift`)
```swift
// Added WKUserScript that runs at document start
let earlyScript = WKUserScript(
    source: """
    window.__isNativeIOS = true;
    window.NativeBridge = window.NativeBridge || { _pending: true };
    """,
    injectionTime: .atDocumentStart,
    forMainFrameOnly: true
)
```

**Why**: This ensures native detection flags are available BEFORE the React app loads, eliminating race conditions.

### 2. Enhanced Native Detection (`lib/native-bridge.ts`)
```typescript
export function isNativeIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for early native flag (injected at document start)
  if ((window as any).__isNativeIOS) return true;
  
  // Check for NativeBridge object
  if (window.NativeBridge) return true;
  
  return false;
}
```

**Why**: Multiple detection methods ensure reliability across different timing scenarios.

### 3. Improved Landing Page Logic (`app/page.tsx`)
```typescript
useEffect(() => {
  // Check native first
  const checkNative = () => {
    const isNative = Capacitor.isNativePlatform() || isNativeIOS()
    setIsNativeApp(isNative)
    
    if (isNative) {
      console.log('Native iOS detected - bypassing landing page')
      router.push('/auth')
      return true
    }
    return false
  }
  
  // If native, skip session check
  if (checkNative()) return
  
  // Otherwise check session for web
  checkSession()
}, [router])
```

**Why**: Native check happens FIRST and immediately redirects, preventing landing page from ever rendering.

## Testing Instructions

### Quick Test
```bash
# Run the rebuild script
./rebuild-and-test-native.sh
```

### Manual Test Steps

1. **Clean Build**:
   ```bash
   # Clean Xcode cache
   ./clear-xcode-cache.sh
   
   # Build Next.js
   npm run build
   
   # Clean Xcode project
   cd ios/App
   xcodebuild clean
   ```

2. **Install on Device**:
   - Open `ios/App/App.xcodeproj` in Xcode
   - Select your iPad Air 13 as target
   - Delete existing app from device
   - Click Run (⌘R)

3. **Verify Behavior**:
   - App should open to a black screen briefly
   - Then immediately show login/signup screen
   - Should NEVER show the landing page

4. **Debug with Safari**:
   ```
   Safari > Develop > [Your iPad Name] > localhost
   ```
   
   Check console for:
   - ✅ "Early native iOS detection injected"
   - ✅ "Native iOS detected - bypassing landing page"
   - ✅ "🔍 Auth page - Native detection: { ... }"

### Expected Console Output

**On Landing Page (app/page.tsx)**:
```
Native iOS detected - bypassing landing page
```

**On Auth Page (app/auth/page.tsx)**:
```
🔍 Auth page - Native detection: {
  capacitor: true,
  nativeBridge: true,
  isNative: true,
  hasNativeBridge: true,
  hasNativeFlag: true
}
```

## Flow Comparison

### ❌ Before (Broken)
1. App opens
2. React loads
3. Landing page renders
4. Native check happens (too late)
5. User sees landing page briefly
6. Redirects to auth

### ✅ After (Fixed)
1. App opens
2. `window.__isNativeIOS = true` set immediately
3. React loads
4. Native check happens (finds flag)
5. Immediately redirects to auth
6. Landing page never renders

## Verification Checklist

- [ ] Clean Xcode cache
- [ ] Delete app from device
- [ ] Fresh install from Xcode
- [ ] App opens directly to login/signup
- [ ] No landing page visible
- [ ] Console shows native detection logs
- [ ] Web version still shows landing page normally

## Troubleshooting

### Still seeing landing page?
1. Make sure you deleted the old app
2. Check Safari console for errors
3. Verify `window.__isNativeIOS` is true in console
4. Try: `console.log(window.__isNativeIOS, window.NativeBridge)`

### Black screen stuck?
1. Check Safari console for errors
2. Verify Next.js dev server is running
3. Check network tab for failed requests

### Web version broken?
1. Test in regular Safari (not iOS app)
2. Should show landing page normally
3. Check that native flags are false

## Files Modified
- ✅ `ios/App/App/WebView.swift` - Early injection
- ✅ `lib/native-bridge.ts` - Enhanced detection
- ✅ `app/page.tsx` - Improved bypass logic
- ✅ `app/auth/page.tsx` - Debug logging

## Related Documentation
- `test-native-detection.md` - Quick reference
- `NATIVE_MIGRATION_README.md` - Full native migration guide
- `NATIVE_QUICK_START.md` - Native features overview
