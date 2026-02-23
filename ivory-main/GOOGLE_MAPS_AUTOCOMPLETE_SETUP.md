# Google Maps Autocomplete Setup Guide

## Overview
The Find Tech page now includes Google Maps autocomplete for the location search field. This provides users with location suggestions as they type, making it easier to find nail techs in specific areas.

## Setup Required

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - **Places API** (required for autocomplete)
   - **Maps JavaScript API** (required for the component)
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### 2. Configure Environment Variable
Add your Google Maps API key to your environment files:

```bash
# In .env.local, .env.development, and .env (for production)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC-your-actual-api-key-here
```

### 3. API Key Restrictions (Security)
For production, restrict your API key:
- **Application restrictions**: HTTP referrers
- **Website restrictions**: Add your domains:
  - `https://www.ivoryschoice.com/*`
  - `https://ivoryschoice.com/*`
  - `http://localhost:3000/*` (for development)

## Features Added

### Location Autocomplete
- **Component**: `GoogleMapsSearch` in `components/google-maps-search.tsx`
- **Integration**: Added to Find Tech page in `app/home/page.tsx`
- **Functionality**: 
  - Shows location suggestions as user types
  - Filters to cities/places only
  - Updates search when location is selected

### Fallback Behavior
- If API key is missing/invalid: Shows regular input field
- If API fails to load: Shows "Loading..." then falls back to regular input
- User can still type locations manually even without API

## Testing

### With API Key
1. Set valid Google Maps API key in environment
2. Go to Find Tech page
3. Click in location field
4. Start typing a city name (e.g., "New York")
5. Should see dropdown with location suggestions
6. Click a suggestion to select it

### Without API Key
1. Leave API key as placeholder or remove it
2. Location field works as regular text input
3. No autocomplete suggestions shown

## Cost Considerations

Google Maps API pricing (as of 2024):
- **Places Autocomplete**: $2.83 per 1,000 requests
- **Free tier**: $200 credit per month (covers ~70,000 requests)
- **Optimization**: Component is configured to minimize API calls

## Troubleshooting

### Common Issues
1. **No suggestions appearing**:
   - Check API key is valid
   - Verify Places API is enabled
   - Check browser console for errors

2. **"Loading..." stuck**:
   - API key might be invalid
   - Check network connectivity
   - Verify domain restrictions

3. **Console errors**:
   - Check API key restrictions
   - Ensure Places API is enabled
   - Verify billing is set up in Google Cloud

### Debug Steps
1. Open browser developer tools
2. Check Console tab for errors
3. Check Network tab for failed API requests
4. Verify environment variable is loaded: `console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)`

## Files Modified
- `app/home/page.tsx` - Added GoogleMapsSearch component
- `components/google-maps-search.tsx` - Existing component (already configured)
- Environment files - Need to add real API key

## Next Steps
1. Get Google Maps API key from Google Cloud Console
2. Add it to your environment variables
3. Test the autocomplete functionality
4. Monitor API usage in Google Cloud Console