import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUserCompanyContext } from "@/lib/auth/company-context"

export async function middleware(request: NextRequest) {
  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabaseConfigured = !!supabaseUrl && !!supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here' &&
    supabaseAnonKey !== 'placeholder_key'

  // Demo mode logic:
  // 1. If FORCE_DEMO_MODE is explicitly set to 'true', use demo mode
  // 2. If Supabase is NOT configured, use demo mode
  // 3. If Supabase IS configured and FORCE_DEMO_MODE is not 'true', use Supabase (production mode)
  // 4. Demo user cookie can still be used for quick testing even with Supabase configured
  const forceDemoMode = process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true'
  const demoUser = request.cookies.get('demo_user')
  const hasDemoUserCookie = !!demoUser
  
  // Use demo mode if:
  // - Force demo mode is explicitly enabled, OR
  // - Supabase is not configured, OR
  // - User has demo cookie (for quick testing)
  const isDemoMode = forceDemoMode || !supabaseConfigured || hasDemoUserCookie

  if (isDemoMode && request.nextUrl.pathname === '/auth/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (isDemoMode) {
    
    console.log('Demo mode active:', { 
      pathname: request.nextUrl.pathname, 
      hasDemoUser: !!demoUser, 
      forceDemoMode,
      supabaseConfigured,
      demoUserValue: demoUser?.value 
    })
    
    // Demo mode - check for demo user in cookies or allow auth pages
    
    if (!demoUser && !request.nextUrl.pathname.startsWith("/auth") && request.nextUrl.pathname !== "/" && request.nextUrl.pathname !== "/features-pricing") {
      console.log('Redirecting to main page - no demo user cookie found')
      const url = request.nextUrl.clone()
      url.pathname = "/" // Redirect to main page for demo login
      return NextResponse.redirect(url)
    }
    
    // If we have a demo user and they're trying to access dashboard, allow it
    if (demoUser && request.nextUrl.pathname.startsWith("/dashboard")) {
      console.log('Demo user accessing dashboard - allowing access')
      // Don't redirect, just continue
    }
    
    // Add company context to demo user cookie for company isolation
    if (demoUser && request.nextUrl.pathname.startsWith("/dashboard")) {
      try {
        const userData = JSON.parse(demoUser.value)
        const companyId = userData.email === 'admin@demo.com' ? '550e8400-e29b-41d4-a716-446655440001' : 
                         userData.email === 'user@demo.com' ? '550e8400-e29b-41d4-a716-446655440001' : null
        
        if (companyId && !userData.company_id) {
          const updatedUserData = { ...userData, company_id: companyId }
          const response = NextResponse.next({ request })
          response.cookies.set('demo_user', JSON.stringify(updatedUserData), {
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            sameSite: 'lax',
            httpOnly: false // Allow client-side access
          })
          return response
        }
      } catch (error) {
        console.error('Error parsing demo user cookie:', error)
      }
    }
    
    // If in demo mode but no demo user cookie, and accessing dashboard, set a default admin cookie
    if (!demoUser && request.nextUrl.pathname.startsWith("/dashboard") && forceDemoMode) {
      const defaultUserData = {
        email: 'admin@demo.com',
        role: 'admin',
        company_id: '550e8400-e29b-41d4-a716-446655440001',
        id: 'demo-admin-id'
      }
      const response = NextResponse.next({ request })
      response.cookies.set('demo_user', JSON.stringify(defaultUserData), {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        sameSite: 'lax',
        httpOnly: false
      })
      return response
    }
    
    // Allow all requests in demo mode
    return NextResponse.next({
      request,
    })
  }

  // Production mode - use Supabase, but allow demo cookie as fallback
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no Supabase user, check for demo cookie as fallback
    if (!user) {
      // Check for demo cookie - allows demo mode even when Supabase is configured
      if (demoUser && request.nextUrl.pathname.startsWith("/dashboard")) {
        console.log('No Supabase user, but demo cookie found - allowing access')
        // Allow access with demo cookie
        return supabaseResponse
      }
      
      // No user and no demo cookie - redirect to login
      if (!request.nextUrl.pathname.startsWith("/auth") && request.nextUrl.pathname !== "/") {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (error) {
    // If there's an error with Supabase, check for demo cookie as fallback
    if (demoUser && request.nextUrl.pathname.startsWith("/dashboard")) {
      console.log('Supabase error, but demo cookie found - allowing access')
      return supabaseResponse
    }
    
    // If there's an error with Supabase, allow access to auth pages
    if (!request.nextUrl.pathname.startsWith("/auth") && request.nextUrl.pathname !== "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
