# Fix Vercel Database Connection Error

## Problem
Your Vercel build is failing because the `DATABASE_URL` environment variable has an invalid format:
```
psql 'postgresql://neondb_owner:npg_C3najdxe9Bhs@ep-curly-art-ahhq0u1x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

The `psql '` prefix should not be there.

## Solution

### Step 1: Update Vercel Environment Variable

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (ivory)
3. Go to **Settings** → **Environment Variables**
4. Find the `DATABASE_URL` variable
5. Update it to the correct value (without the `psql '` prefix):

```
postgresql://neondb_owner:npg_C3najdxe9Bhs@ep-curly-art-ahhq0u1x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

6. Make sure it's set for all environments (Production, Preview, Development)
7. Click **Save**

### Step 2: Redeploy

After updating the environment variable:
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Select **Redeploy**

Or simply push a new commit to trigger a deployment.

## How This Happened

This error typically occurs when copying the connection string from Neon's dashboard. Neon shows the connection string in two formats:
- **Connection string** (what you need): `postgresql://...`
- **psql command** (for terminal use): `psql 'postgresql://...'`

Someone accidentally copied the psql command format instead of just the connection string.

## Verification

After fixing, your build should succeed. You'll see:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
```

Instead of the database connection errors.
