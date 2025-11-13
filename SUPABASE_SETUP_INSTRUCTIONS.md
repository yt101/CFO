# 🚀 Supabase Setup Instructions - Enable Real Uploads

Follow these steps to enable real tax return uploads and processing:

## Step 1: Create Supabase Account (FREE)

1. Go to **https://supabase.com**
2. Click "Start your project"
3. Sign up with GitHub/Google or email
4. Create a new project:
   - Project name: `returnsight-ai` (or any name)
   - Database password: (choose a strong password)
   - Region: Choose closest to you
   - Pricing: **FREE tier** (no credit card required)
5. Wait 2-3 minutes for project to provision

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** (gear icon)
2. Click **API** in the left sidebar
3. You'll see two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
4. **Keep this page open** - you'll need these values

## Step 3: Create .env.local File

**IMPORTANT**: You need to create this file manually in the project root.

### Windows Instructions:

1. Open **Notepad** (or VS Code)
2. Copy and paste this content:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

3. **Replace** `your_supabase_url_here` with your Project URL
4. **Replace** `your_supabase_anon_key_here` with your anon key
5. Save the file as `.env.local` (include the dot!)
6. **Important**: Save in the project root folder:
   `C:\Users\8J6462897\Desktop\v0-return-sight-ai-solution-main\.env.local`

### Example .env.local file:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file: `scripts/001_create_schema.sql` from this project
4. Copy ALL the SQL content
5. Paste it into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

This creates all the tables:
- `returns` - Tax return metadata
- `line_items` - Extracted tax line data
- `metrics` - Calculated KPIs
- `opportunities` - Optimization recommendations

## Step 5: Create Demo Accounts (Optional)

### Option A: Via Supabase Dashboard (Easiest)

1. Go to **Authentication** → **Users** in Supabase
2. Click **Add user** → **Create new user**
3. Create account:
   - **Email**: `demo@example.com`
   - **Password**: `Demo123456!`
   - **Auto Confirm**: ✅ ON
4. Click **Create user**

### Option B: Sign up through the app (Alternative)

After restarting the server, go to:
`http://localhost:3000/auth/sign-up`

## Step 6: Restart Development Server

**IMPORTANT**: You must restart for changes to take effect.

1. In the terminal where `pnpm dev` is running
2. Press **Ctrl+C** to stop the server
3. Run: `pnpm dev` again
4. Wait for "Ready in Xs"

## Step 7: Test Real Uploads! 🎉

1. Navigate to **http://localhost:3000**
2. Log in with your Supabase account
3. Go to **Dashboard** → Click **Upload Return**
4. Upload a tax return (PDF or XML)
5. Your return will now:
   - ✅ Be stored in the database
   - ✅ Appear in your returns list
   - ✅ Be processed and analyzed
   - ✅ Generate KPIs and opportunities

---

## 🔍 Verification Checklist

After setup, verify everything works:

- [ ] `.env.local` file exists in project root
- [ ] File contains your actual Supabase URL and key (not placeholder text)
- [ ] Database schema is created (check Supabase Table Editor)
- [ ] Development server restarted
- [ ] Can access http://localhost:3000
- [ ] Login/signup works
- [ ] Upload button visible on dashboard
- [ ] Uploaded return appears in returns list

---

## 💡 Quick Tips

### To check if .env.local is loaded:
Open browser console on http://localhost:3000 and type:
```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```
Should show your URL (not "your_supabase_url_here")

### Common Issues:

**Problem**: "Still seeing demo mode banner"
- **Solution**: Make sure `.env.local` has actual values (not placeholders)
- **Solution**: Restart the dev server completely

**Problem**: "Unauthorized" errors
- **Solution**: Create a user account in Supabase or sign up through the app

**Problem**: "Database error" when uploading
- **Solution**: Make sure you ran the schema SQL script in Supabase

**Problem**: Changes not taking effect
- **Solution**: Hard restart - Ctrl+C the server, then `pnpm dev` again

---

## 📊 What You'll Get After Setup

Once configured, every uploaded tax return will:

1. **Extract Data**:
   - Parse PDF (via OCR) or XML (direct parsing)
   - Extract 20+ tax line items
   - Confidence scoring (94-99%)

2. **Calculate 7 KPIs**:
   - Days Sales Outstanding (DSO)
   - Days Payable Outstanding (DPO)  
   - Days Inventory Outstanding (DIO)
   - Cash Conversion Cycle (CCC)
   - Current Ratio
   - Quick Ratio
   - Net Working Capital

3. **Identify Opportunities**:
   - Tax optimization recommendations
   - Cash flow improvements
   - Working capital efficiency
   - Deduction opportunities

4. **Generate Reports**:
   - 13-week cash flow forecasts
   - Benchmark comparisons
   - Trend analysis
   - Detailed metrics views

---

## 🆓 Cost Information

**Supabase FREE Tier includes**:
- 500MB database storage
- 1GB file storage
- 2GB data transfer
- 50,000 monthly active users
- Unlimited API requests

**This is MORE than enough for testing and demo purposes!**

---

## 🆘 Need Help?

If you get stuck:

1. Check the Supabase dashboard for any error messages
2. Look at browser console (F12) for detailed errors
3. Verify your `.env.local` file has no typos
4. Make sure the database schema was created successfully
5. Try creating a fresh Supabase project if issues persist

---

**Created**: October 2024
**Platform**: ReturnSight AI - Tax Return Analysis Platform
**Version**: 1.0































