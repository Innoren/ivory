# Update tysnailboutique Website

This script replaces the custom website builder with an external website URL for the user `tysnailboutique`.

## User Details
- **Username**: tysnailboutique
- **Email**: tysnailboutique@outlook.com
- **External Website**: https://tnb.ivoryschoice.com

## What This Script Does

1. Finds the user by username and email
2. Updates the `website` field in their `tech_profiles` table to point to the external URL
3. Unpublishes their custom website builder (if it exists) while preserving the data

## Option 1: Run TypeScript Script

### Prerequisites
- Node.js and yarn installed
- Access to the production DATABASE_URL

### Usage

```bash
# Set DATABASE_URL and run
DATABASE_URL="your-actual-database-url" yarn update:tysnailboutique
```

Or update your `.env.local` file with the actual `DATABASE_URL` and run:

```bash
yarn update:tysnailboutique
```

## Option 2: Run SQL Script Directly

If you prefer to run SQL directly against your database:

```bash
# Using psql
psql "your-database-url" -f scripts/update-tysnailboutique-website-sql.sql

# Or copy the SQL and run it in your database admin tool
```

The SQL script is located at: `scripts/update-tysnailboutique-website-sql.sql`

## Verification

After running the script, you can verify the changes with this SQL query:

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

Expected results:
- `tp.website` should be: `https://tnb.ivoryschoice.com`
- `tw.is_published` should be: `false` (if custom website existed)

## What Happens to the Custom Website Builder?

The custom website builder data is **preserved** but **unpublished**. This means:
- All sections, settings, and customizations are kept in the database
- The website will not be accessible via the subdomain
- The tech profile will show the external website URL instead
- Data can be restored later if needed

## Rollback

If you need to rollback these changes:

```sql
-- Restore custom website builder
UPDATE tech_websites
SET is_published = true, updated_at = NOW()
WHERE tech_profile_id = (
  SELECT id FROM tech_profiles 
  WHERE user_id = (
    SELECT id FROM users WHERE username = 'tysnailboutique'
  )
);

-- Remove external website URL (optional)
UPDATE tech_profiles
SET website = NULL, updated_at = NOW()
WHERE user_id = (
  SELECT id FROM users WHERE username = 'tysnailboutique'
);
```

## Support

If you encounter any issues:
1. Check that the DATABASE_URL is correct
2. Verify the user exists in the database
3. Check the script output for specific error messages
4. Review the SQL script for manual execution
