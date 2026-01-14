// Test script to verify native iOS detection
// Run this in Safari Web Inspector console when connected to iPad

console.log('🔍 Native iOS Detection Test');
console.log('================================');
console.log('');

// Check all detection methods
const checks = {
  '__isNativeIOS flag': typeof window.__isNativeIOS !== 'undefined' ? window.__isNativeIOS : 'NOT SET',
  'NativeBridge object': typeof window.NativeBridge !== 'undefined' ? 'EXISTS' : 'NOT FOUND',
  'NativeBridge._pending': window.NativeBridge?._pending || 'N/A',
  'Capacitor.isNativePlatform()': typeof Capacitor !== 'undefined' ? Capacitor.isNativePlatform() : 'Capacitor not loaded',
  'webkit.messageHandlers': typeof window.webkit?.messageHandlers?.nativeHandler !== 'undefined' ? 'EXISTS' : 'NOT FOUND'
};

console.table(checks);

console.log('');
console.log('Expected for Native iOS:');
console.log('  __isNativeIOS flag: true');
console.log('  NativeBridge object: EXISTS');
console.log('  webkit.messageHandlers: EXISTS');
console.log('');

// Test the isNativeIOS function if available
if (typeof window.isNativeIOS === 'function') {
  console.log('isNativeIOS() result:', window.isNativeIOS());
} else {
  console.log('⚠️  isNativeIOS function not available (check lib/native-bridge.ts)');
}

console.log('');
console.log('Current page:', window.location.pathname);
console.log('Should redirect to /auth if native iOS detected');
