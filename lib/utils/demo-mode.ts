/**
 * Check if the application is in demo mode
 * This should be used consistently across all pages
 */
export function isDemoMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true' ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here' ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_key' ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

