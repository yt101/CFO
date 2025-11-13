# Create .env.local file for ReturnSight AI

Write-Host "Creating .env.local file..." -ForegroundColor Green

$envContent = @"
# Supabase Configuration
# Replace these with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Demo Account Credentials (for reference)
# admin@demo.com / demo123456
# user@demo.com / demo123456
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ .env.local file created!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local with your Supabase credentials" -ForegroundColor White
Write-Host "2. Get credentials from: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "3. Run: node scripts/verify_setup.js" -ForegroundColor White