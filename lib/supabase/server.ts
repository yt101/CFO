import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Demo mode - return a mock client
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'your_supabase_url_here' || 
      supabaseUrl === 'https://placeholder.supabase.co' ||
      supabaseAnonKey === 'your_supabase_anon_key_here' ||
      supabaseAnonKey === 'placeholder_key') {
    // Return a mock client that doesn't make real requests
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null }, error: { message: "Demo mode - use local authentication" } }),
        signOut: async () => ({ error: null })
      },
      from: () => ({
        select: () => ({ eq: () => ({ data: [], error: null }) }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) })
      })
    } as any
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
