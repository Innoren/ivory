# Create Retention Insight in PostHog Dashboard

## Step-by-Step Guide

### 1. Go to PostHog Dashboard
Visit: https://us.posthog.com

### 2. Navigate to Insights
- Click "Insights" in the left sidebar
- Click "New Insight" button

### 3. Select Retention Type
- Click on "Retention" tab at the top

### 4. Configure Your Retention Insight

**Cohort Defining Event:**
- Select: `user_signed_up`
- This marks when users join your app

**Return Event:**
- Select: `$pageview`
- This tracks when users come back

**Cohort Period:**
- Select: `2 weeks` (bi-weekly retention)

**Return Period:**
- Select: `2 weeks` (bi-weekly retention)

### 5. Click "Calculate"

### 6. View Your Results

You'll see a table like this:

```
Period 0: 100% (all users who signed up in that 2-week period)
Period 1: 45%  (users who returned in weeks 2-3)
Period 2: 35%  (users who returned in weeks 4-5)
Period 3: 30%  (users who returned in weeks 6-7)
```

### 7. Save Your Insight (Optional)
- Click "Save" button
- Name it: "Bi-Weekly New User Retention"
- Add to a dashboard if desired

## Alternative Time Periods

PostHog supports multiple retention periods:
- **Hour** - For high-frequency apps
- **Day** - Daily retention
- **Week** - Weekly retention
- **2 Weeks** - Bi-weekly retention (recommended)
- **Month** - Monthly retention

## Done!

You now have bi-weekly retention tracking set up. Check back every 2 weeks to see how your retention improves!
