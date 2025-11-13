# ReturnSight AI - Demo Setup Guide

This guide will help you set up demo accounts and start the local development server for the ReturnSight AI tax return analysis application.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)

## Quick Setup

### 1. Environment Configuration

**IMPORTANT**: Create a `.env.local` file in the project root with your Supabase credentials.

**Step-by-step:**
1. In your project root directory, create a new file called `.env.local`
2. Add the following content (replace with your actual Supabase credentials):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

**⚠️ Without this file, the server will show 500 errors!**

**How to get your Supabase credentials:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 2. Database Setup

Run the database schema in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/001_create_schema.sql`
4. Execute the script to create all necessary tables and policies

### 3. Create Demo Accounts

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to Authentication → Users in your Supabase dashboard
2. Click "Add user" and create these demo accounts:

**Admin Account:**
- Email: `admin@demo.com`
- Password: `demo123456`
- Confirm email: Yes

**User Account:**
- Email: `user@demo.com`
- Password: `demo123456`
- Confirm email: Yes

#### Option B: Using SQL (Advanced)

If you prefer to use SQL, you can run the `scripts/create_demo_accounts.sql` script in your Supabase SQL Editor.

### 4. Start Development Server

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Or use the setup script:

```bash
node scripts/setup_demo.js
```

## Demo Account Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123456 |
| User | user@demo.com | demo123456 |

## Features Available

### For Demo Users:
- **Dashboard**: View tax returns and metrics
- **Upload**: Upload PDF or XML tax returns
- **Chat**: AI-powered chat interface for tax return analysis
- **Metrics**: View calculated KPIs and trends
- **Opportunities**: See identified tax optimization opportunities

### Sample Data:
The demo accounts come with sample tax returns and data:
- Corporate return (1120) for admin account
- Individual return (1040) for user account
- Sample metrics and opportunities

## Troubleshooting

### Common Issues:

1. **"Invalid login credentials"**
   - Make sure demo accounts are created in Supabase
   - Verify email confirmation in Supabase dashboard

2. **"Failed to fetch" errors**
   - Check your Supabase URL and API key in `.env.local`
   - Ensure your Supabase project is active

3. **Database errors**
   - Verify the schema script was executed successfully
   - Check Row Level Security policies are in place

### Getting Help:

1. Check the browser console for detailed error messages
2. Verify Supabase project settings and API keys
3. Ensure all environment variables are correctly set

## Next Steps

1. **Upload Test Returns**: Try uploading sample tax documents
2. **Explore Chat**: Ask questions about the uploaded returns
3. **View Metrics**: Check out the calculated KPIs and trends
4. **Review Opportunities**: See identified tax optimization suggestions

## Security Note

⚠️ **Important**: These demo accounts are for development and testing only. Do not use these credentials in production environments.
