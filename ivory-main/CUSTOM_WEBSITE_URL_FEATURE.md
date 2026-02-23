# Custom Website URL Feature

## Overview
This feature allows specific nail techs to have a custom external website URL instead of using the built-in website builder. When a tech has a custom website URL set, they will be redirected to that URL when accessing the website builder, and their settings page will show a "Visit Your Website" link instead of "Website Builder".

## Implementation

### Database Changes
Added `customWebsiteUrl` field to the `tech_profiles` table:
- Field: `custom_website_url` (VARCHAR 500)
- Nullable: Yes
- Purpose: Store external website URL for techs who have their own custom website

### Migration
Run the migration to add the field and set it for tysnailboutique@outlook.com:
```bash
# The migration file is at: db/migrations/add_custom_website_url.sql
# It will:
# 1. Add the custom_website_url column
# 2. Set https://tnb.ivoryschoice.com for tysnailboutique@outlook.com
```

### User Experience

#### For tysnailboutique@outlook.com:
1. **Settings Page**: Shows "Visit Your Website" with the URL tnb.ivoryschoice.com
   - Clicking opens the custom website in a new tab
   
2. **Website Builder Page**: Automatically redirects to https://tnb.ivoryschoice.com
   - No access to the website builder interface

#### For Other Techs:
1. **Settings Page**: Shows "Website Builder" option
   - Clicking navigates to the website builder
   
2. **Website Builder Page**: Full access to create/edit their subdomain website

## How to Set Custom Website URL for Other Users

### Option 1: Direct Database Update
```sql
UPDATE tech_profiles 
SET custom_website_url = 'https://your-custom-url.com'
WHERE user_id = (
  SELECT id FROM users WHERE email = 'tech@example.com'
);
```

### Option 2: Via API (Future Enhancement)
Could add an admin endpoint to set custom website URLs:
```typescript
// POST /api/admin/tech-profiles/custom-website
{
  "userId": 123,
  "customWebsiteUrl": "https://custom-site.com"
}
```

## Files Modified

1. **db/schema.ts**
   - Added `customWebsiteUrl` field to `techProfiles` table

2. **db/migrations/add_custom_website_url.sql**
   - Migration to add the field and set it for tysnailboutique@outlook.com

3. **app/tech/settings/page.tsx**
   - Added logic to fetch and display custom website URL
   - Shows "Visit Your Website" button if custom URL exists
   - Shows "Website Builder" button otherwise

4. **app/tech/website/page.tsx**
   - Added redirect logic when custom website URL is detected
   - Redirects to custom URL before loading website builder

5. **app/api/tech-profiles/route.ts**
   - Already returns all fields including `customWebsiteUrl` (no changes needed)

## Testing

### Test for tysnailboutique@outlook.com:
1. Log in as tysnailboutique@outlook.com
2. Go to Settings
3. Verify "Visit Your Website" shows with tnb.ivoryschoice.com
4. Click it and verify it opens https://tnb.ivoryschoice.com in new tab
5. Try to navigate to /tech/website
6. Verify it redirects to https://tnb.ivoryschoice.com

### Test for Other Techs:
1. Log in as any other tech
2. Go to Settings
3. Verify "Website Builder" option shows
4. Click it and verify website builder loads normally
5. Verify no redirects occur

## Notes

- This is a per-user feature, not a global setting
- Only affects techs with `customWebsiteUrl` set in their profile
- Does not affect the subdomain website system for other techs
- The custom URL should be a full URL including protocol (https://)
- The feature is transparent to users without custom URLs
