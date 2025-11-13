@echo off
echo Creating .env.local file...

(
echo # Supabase Configuration
echo # Replace these with your actual Supabase project credentials
echo NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
echo NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
echo.
echo # Demo Account Credentials ^(for reference^)
echo # admin@demo.com / demo123456
echo # user@demo.com / demo123456
) > .env.local

echo ✅ .env.local file created!
echo.
echo 🔧 Next steps:
echo 1. Edit .env.local with your Supabase credentials
echo 2. Get credentials from: https://supabase.com/dashboard
echo 3. Run: node scripts/verify_setup.js
echo.
pause

