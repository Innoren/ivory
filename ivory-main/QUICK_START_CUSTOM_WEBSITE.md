# Quick Start: Custom Website URL Feature

## What This Does
Allows specific nail techs to have their own external website instead of using the built-in website builder.

## Current Setup
✅ **tysnailboutique@outlook.com** → https://tnb.ivoryschoice.com

## How It Works

### For tysnailboutique@outlook.com:
1. Settings page shows "Visit Your Website" button
2. Clicking opens https://tnb.ivoryschoice.com in new tab
3. Trying to access website builder auto-redirects to custom URL

### For Other Techs:
- No changes - website builder works normally

## Add Custom URL for Another User

### Quick Method (SQL):
```sql
UPDATE tech_profiles 
SET custom_website_url = 'https://custom-site.com'
WHERE user_id = (SELECT id FROM users WHERE email = 'user@example.com');
```

### Using Script:
1. Edit `scripts/add-custom-website-url.js`
2. Change the email and URL
3. Run: `node scripts/add-custom-website-url.js`

## Remove Custom URL

```sql
UPDATE tech_profiles 
SET custom_website_url = NULL
WHERE user_id = (SELECT id FROM users WHERE email = 'user@example.com');
```

## Files to Know

- **Feature Docs**: `CUSTOM_WEBSITE_URL_FEATURE.md`
- **Implementation**: `TYSNAILBOUTIQUE_CUSTOM_WEBSITE.md`
- **Schema**: `db/schema.ts` (line ~90)
- **Settings Page**: `app/tech/settings/page.tsx`
- **Website Builder**: `app/tech/website/page.tsx`

## Testing

1. Log in as tysnailboutique@outlook.com
2. Go to Settings → Should see "Visit Your Website"
3. Click it → Opens https://tnb.ivoryschoice.com
4. Try /tech/website → Redirects to custom URL

## That's It!
The feature is live and working for tysnailboutique@outlook.com only. Other techs are unaffected.
