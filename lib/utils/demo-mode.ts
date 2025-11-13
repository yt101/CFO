/**
 * Check if the application is in demo mode
 * This should be used consistently across all pages
 * 
 * Demo mode is enabled when:
 * 1. NEXT_PUBLIC_FORCE_DEMO_MODE is explicitly set to 'true', OR
 * 2. Supabase is not properly configured (missing or placeholder values)
 * 
 * If Supabase is properly configured and FORCE_DEMO_MODE is not 'true', 
 * the application will use Supabase (production mode).
 */
export function isDemoMode(): boolean {
  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const supabaseConfigured = !!supabaseUrl && !!supabaseAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here' &&
    supabaseAnonKey !== 'placeholder_key'
  
  // Force demo mode takes precedence
  if (process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true') {
    return true
  }
  
  // If Supabase is configured, use production mode (not demo)
  if (supabaseConfigured) {
    return false
  }
  
  // If Supabase is not configured, use demo mode
  return true
}

