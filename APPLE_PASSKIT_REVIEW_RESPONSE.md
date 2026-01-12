# Apple Review Response - PassKit Framework

## Review Notes for App Store Connect

**Copy this text into the "Review Notes" section when resubmitting:**

```
PASSKIT FRAMEWORK CLARIFICATION:

The PassKit framework is included in the binary as a transitive dependency from third-party SDKs (Stripe SDK and Capacitor framework). The app does NOT implement Apple Pay or use any PassKit functionality.

APPLE PAY CAPABILITY REMOVED:
- Apple Pay capability has been removed from app entitlements
- No Apple Pay merchant configuration
- No Apple Pay buttons or UI elements

PAYMENT METHODS IMPLEMENTED:
- Web payments: Stripe Checkout (credit cards, Cash App Pay)
- iOS payments: Apple In-App Purchases (StoreKit framework)

NO APPLE PAY INTEGRATION:
- No PKPaymentAuthorizationViewController usage
- No PassKit API calls
- PassKit framework inclusion is unintentional from dependencies

The app does not use Apple Pay and the capability has been removed.
```

## Verification Steps

You can verify PassKit is not used by:

1. **Code Search**: No `import PassKit` statements in Swift files
2. **API Search**: No `PKPayment` or PassKit API usage
3. **Info.plist**: No PassKit entitlements or usage descriptions
4. **Payment Flow**: Only Stripe web checkout and IAP are implemented

## Next Steps

1. **Resubmit with Review Notes**: Add the above text to App Store Connect review notes
2. **Alternative**: Remove PassKit dependency (see Solution 2 below)

---

## Solution 2: Remove PassKit Dependency (Optional)

If you want to completely remove PassKit from the binary, you can:

### Option A: Update Dependencies
```bash
# Clean and reinstall dependencies
yarn install
```

### Option B: Exclude PassKit in Xcode Build Settings
1. Open Xcode project
2. Go to Build Settings
3. Add to "Other Linker Flags": `-Wl,-U,_OBJC_CLASS_$_PKPaymentAuthorizationViewController`

### Option C: Verify Stripe Configuration
Your current Stripe configuration is correct - it doesn't explicitly enable Apple Pay:

```typescript
// Current configuration (correct)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

Note: Apple Pay is controlled by Stripe Checkout's payment method configuration on the server side, not the client-side loadStripe() call.

## Recommended Action

**Use Solution 1** - Add the review notes when resubmitting. This is the fastest and safest approach since:
- No code changes required
- No risk of breaking existing functionality
- Clearly explains the situation to Apple reviewers
- Follows Apple's guidance for transitive dependencies