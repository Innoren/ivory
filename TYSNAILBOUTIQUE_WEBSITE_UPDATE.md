# Website Update for tysnailboutique

## Summary

I've created scripts to replace the custom website builder with the external website URL for user **tysnailboutique**.

## User Information
- **Username**: tysnailboutique
- **Email**: tysnailboutique@outlook.com
- **New Website URL**: https://tnb.ivoryschoice.com

## Changes Made

### 1. Created TypeScript Script
**File**: `scripts/update-tysnailboutique-website.ts`

This script:
- Connects to your database
- Finds the user by username and email
- Updates the `website` field in `tech_profiles` to the external URL
- Unpublishes the custom website builder (preserves data)

### 2. Created SQL Script
**File**: `scripts/update-tysnailboutique-website-sql.sql`

Direct SQL queries that can be run against your database without Node.js.

### 3. Added Package.json Script
Added command: `yarn update:tysnailboutique`

### 4. Created Documentation
**File**: `scripts/UPDATE_TYSNAILBOUTIQUE_README.md`

Complete instructions for running the scripts and verifying changes.

## How to Run

### Option A: TypeScript Script (Recommended)

```bash
# With DATABASE_URL in environment
DATABASE_URL="your-actual-database-url" yarn update:tysnailboutique
```

### Option B: SQL Script (Direct)

```bash
# Using psql
psql "your-database-url" -f scripts/update-tysnailboutique-website-sql.sql
```

Or copy the SQL from `scripts/update-tysnailboutique-website-sql.sql` and run it in your database admin tool (Neon console, pgAdmin, etc.).

## What Happens

1. **Tech Profile Updated**: The `website` field will be set to `https://tnb.ivoryschoice.com`
2. **Custom Builder Unpublished**: If a custom website exists, it will be unpublished (data preserved)
3. **User Experience**: When viewing the tech profile, users will see the external website link instead of the custom builder

## Database Changes

### Before
```
tech_profiles.website = NULL or old_value
tech_websites.is_published = true (if exists)
```

### After
```
tech_profiles.website = 'https://tnb.ivoryschoice.com'
tech_websites.is_published = false (if exists)
```

## Verification Query

After running, verify with:

```sql
SELECT 
  u.username,
  u.email,
  tp.website,
  tw.subdomain,
  tw.is_published
FROM users u
LEFT JOIN tech_profiles tp ON tp.user_id = u.id
LEFT JOIN tech_websites tw ON tw.tech_profile_id = tp.id
WHERE u.username = 'tysnailboutique';
```

## Important Notes

- ✅ Custom website builder data is **preserved** (not deleted)
- ✅ Can be rolled back if needed
- ✅ No data loss
- ✅ Safe to run multiple times (idempotent)

## Next Steps

1. Get your production DATABASE_URL from Neon.tech
2. Run the script using one of the methods above
3. Verify the changes using the verification query
4. Test the tech profile page to ensure the external website link appears

## Files Created

1. `scripts/update-tysnailboutique-website.ts` - TypeScript script
2. `scripts/update-tysnailboutique-website-sql.sql` - SQL script
3. `scripts/UPDATE_TYSNAILBOUTIQUE_README.md` - Detailed documentation
4. `TYSNAILBOUTIQUE_WEBSITE_UPDATE.md` - This summary

## Rollback Instructions

If you need to undo these changes, see the rollback section in `scripts/UPDATE_TYSNAILBOUTIQUE_README.md`.
