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
- Select: `Weekly`

**Return Period:**
- Select: `Weekly`

### 5. Click "Calculate"

### 6. View Your Results

You'll see a table like this:

```
Week 0: 100% (all users who signed up)
Week 1: 42%  (users who returned in week 1)
Week 2: 35%  (users who returned in week 2)
Week 3: 30%  (users who returned in week 3)
```

### 7. Save Your Insight (Optional)
- Click "Save" button
- Name it: "Weekly New User Retention"
- Add to a dashboard if desired

## Done!

You now have weekly retention tracking set up. Check back each week to see how your retention improves!
